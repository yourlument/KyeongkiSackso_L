import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  certificationMarkOptions,
  certificationMarkSearchNames,
  certificationMarksFromNames,
  normalizeCertificationMark,
} from "@/lib/certification-marks";
import {
  matchesProductSearchRegion,
  parseProductSearchRegion,
  productSearchRegionOptions,
} from "@/lib/product-search-regions";

export const dynamic = "force-dynamic";

type SortKey = "relevance" | "latest" | "priceLow" | "priceHigh";

const FUZZY_THRESHOLD = 0.2;

function orderBy(sort: SortKey): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "latest":
      return { createdAt: "desc" };
    case "priceLow":
      return { price: "asc" };
    case "priceHigh":
      return { price: "desc" };
    default:
      return { createdAt: "asc" };
  }
}

async function categoryIdsWithDescendants(rootId: string): Promise<string[]> {
  const rows = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const byParent = new Map<string, string[]>();
  for (const r of rows) {
    if (!r.parentId) continue;
    const arr = byParent.get(r.parentId);
    if (arr) arr.push(r.id);
    else byParent.set(r.parentId, [r.id]);
  }
  const ids: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    ids.push(id);
    const kids = byParent.get(id);
    if (kids) stack.push(...kids);
  }
  return ids;
}

const PRODUCT_SELECT = {
  id: true,
  name: true,
  price: true,
  unit: true,
  npsCode: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
  supplierCompany: {
    select: {
      name: true,
      certificationRequests: {
        where: { status: "APPROVED" as const },
        orderBy: [{ submittedAt: "asc" as const }, { id: "asc" as const }],
        select: { name: true },
      },
    },
  },
  images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof PRODUCT_SELECT }>;

function bigrams(q: string): string[] {
  const t = q.replace(/\s+/g, "");
  if (t.length < 2) return [];
  const out: string[] = [];
  for (let i = 0; i + 2 <= t.length; i += 1) out.push(`%${t.slice(i, i + 2)}%`);
  return out;
}

async function fuzzyMatchIds(
  q: string,
  categoryIds: string[] | null,
  certifications: string[],
  supplierRegions: string[] | null,
): Promise<string[]> {
  const like = `%${q}%`;
  const grams = bigrams(q);
  const fuzzy = grams.length
    ? Prisma.sql`OR (word_similarity(${q}, name) > ${FUZZY_THRESHOLD} AND name ILIKE ANY(${grams}))`
    : Prisma.sql`OR word_similarity(${q}, name) > ${FUZZY_THRESHOLD}`;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM "products"
    WHERE status = 'ACTIVE'
      ${categoryIds ? Prisma.sql`AND category_id IN (${Prisma.join(categoryIds)})` : Prisma.empty}
      ${
        certifications.length
          ? Prisma.sql`AND EXISTS (
              SELECT 1
              FROM supplier_certifications certification
              WHERE certification.supplier_company_id = products.supplier_company_id
                AND certification.status = 'APPROVED'
                AND certification.name IN (${Prisma.join(certifications)})
            )`
          : Prisma.empty
      }
      ${
        supplierRegions
          ? Prisma.sql`AND EXISTS (
              SELECT 1
              FROM supplier_companies supplier
              WHERE supplier.id = products.supplier_company_id
                AND supplier.region IN (${Prisma.join(supplierRegions)})
            )`
          : Prisma.empty
      }
      AND (
        name ILIKE ${like}
        OR description ILIKE ${like}
        ${fuzzy}
      )
    ORDER BY
      (CASE WHEN name ILIKE ${like} THEN 1 ELSE 0 END) DESC,
      word_similarity(${q}, name) DESC,
      created_at ASC
    LIMIT 100
  `;
  return rows.map((r) => r.id);
}

function applySort(products: ProductRow[], sort: SortKey, relevanceOrder: Map<string, number>): ProductRow[] {
  const arr = [...products];
  switch (sort) {
    case "latest":
      return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "priceLow":
      return arr.sort((a, b) => Number(a.price) - Number(b.price));
    case "priceHigh":
      return arr.sort((a, b) => Number(b.price) - Number(a.price));
    default:
      return arr.sort((a, b) => (relevanceOrder.get(a.id) ?? 0) - (relevanceOrder.get(b.id) ?? 0));
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim();
  const classNo = (searchParams.get("classNo") ?? "").trim();
  const legacyRegion = (searchParams.get("region") ?? "").trim();
  const legacyRegionSelection = parseProductSearchRegion(legacyRegion);
  const regionSido = (searchParams.get("regionSido") ?? legacyRegionSelection.sido).trim();
  const regionSigungu = regionSido
    ? (searchParams.get("regionSigungu") ?? (searchParams.has("regionSido") ? "" : legacyRegionSelection.sigungu)).trim()
    : "";
  const sort = (searchParams.get("sort") ?? "relevance") as SortKey;
  const certifications = Array.from(
    new Set(
      [...searchParams.getAll("cert"), ...searchParams.getAll("certification")]
        .map(normalizeCertificationMark)
        .filter((value) => value.length > 0)
        .slice(0, 20),
    ),
  );
  const certificationSearchNames = certificationMarkSearchNames(certifications);

  const [approvedCertificationNames, searchableSupplierRegions] = await Promise.all([
    prisma.supplierCertification.findMany({
      where: {
        status: "APPROVED",
        supplierCompany: { approvalStatus: "APPROVED" },
      },
      select: { name: true },
    }),
    prisma.supplierCompany.findMany({
      where: {
        region: { not: null },
        products: { some: { status: "ACTIVE" } },
      },
      select: { region: true },
    }),
  ]);
  const certificationOptions = certificationMarkOptions(
    approvedCertificationNames.map((certification) => certification.name),
  ).sort((a, b) => a.localeCompare(b, "ko-KR"));
  const searchableRegions = Array.from(
    new Set(
      searchableSupplierRegions
        .map((supplier) => supplier.region?.trim() ?? "")
        .filter((supplierRegion) => supplierRegion.length > 0),
    ),
  );
  const regions = productSearchRegionOptions();
  const hasRegionFilter = regionSido.length > 0;
  const matchingSupplierRegions = hasRegionFilter
    ? searchableRegions.filter((supplierRegion) => matchesProductSearchRegion(supplierRegion, {
      sido: regionSido,
      sigungu: regionSigungu,
    }))
    : [];

  if (hasRegionFilter && matchingSupplierRegions.length === 0) {
    return NextResponse.json({
      count: 0,
      results: [],
      certifications: certificationOptions,
      regions,
    });
  }

  const categoryIds = category ? await categoryIdsWithDescendants(category) : null;
  const supplierCompanyWhere = {
    ...(hasRegionFilter ? { region: { in: matchingSupplierRegions } } : {}),
    ...(certifications.length
      ? {
          certificationRequests: {
            some: { status: "APPROVED" as const, name: { in: certificationSearchNames } },
          },
        }
      : {}),
  } satisfies Prisma.SupplierCompanyWhereInput;
  const supplierCompanyFilter: Prisma.ProductWhereInput =
    hasRegionFilter || certifications.length ? { supplierCompany: supplierCompanyWhere } : {};

  let products: ProductRow[];

  if (classNo) {
    products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        npsCode: classNo,
        ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
        ...supplierCompanyFilter,
      },
      orderBy: orderBy(sort),
      select: PRODUCT_SELECT,
    });
  } else if (q) {
    const ids = await fuzzyMatchIds(
      q,
      categoryIds,
      certificationSearchNames,
      hasRegionFilter ? matchingSupplierRegions : null,
    );
    if (ids.length === 0) {
      return NextResponse.json({
        count: 0,
        results: [],
        certifications: certificationOptions,
        regions,
      });
    }
    const relevanceOrder = new Map(ids.map((id, i) => [id, i]));
    const fetched = await prisma.product.findMany({
      where: { id: { in: ids }, ...supplierCompanyFilter },
      select: PRODUCT_SELECT,
    });
    products = applySort(fetched, sort, relevanceOrder);
  } else {
    products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
        ...supplierCompanyFilter,
      },
      orderBy: orderBy(sort),
      select: PRODUCT_SELECT,
    });
  }

  const results = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    unit: p.unit,
    npsCode: p.npsCode,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badges: certificationMarksFromNames(
      p.supplierCompany.certificationRequests.map((certification) => certification.name),
    ),
    categoryId: p.category?.id ?? null,
    categoryName: p.category?.name ?? null,
    supplierName: p.supplierCompany.name,
    imageUrl: p.images[0]?.url ?? null,
  }));

  return NextResponse.json({
    count: results.length,
    results,
    certifications: certificationOptions,
    regions,
  });
}
