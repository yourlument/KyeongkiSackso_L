import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

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
  badges: true,
  createdAt: true,
  category: { select: { id: true, name: true } },
  supplierCompany: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" as const }, take: 1, select: { url: true } },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof PRODUCT_SELECT }>;

async function fuzzyMatchIds(q: string, categoryIds: string[] | null): Promise<string[]> {
  const like = `%${q}%`;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM "products"
    WHERE status = 'ACTIVE'
      ${categoryIds ? Prisma.sql`AND category_id IN (${Prisma.join(categoryIds)})` : Prisma.empty}
      AND (
        name ILIKE ${like}
        OR description ILIKE ${like}
        OR nps_code ILIKE ${like}
        OR word_similarity(${q}, name) > ${FUZZY_THRESHOLD}
      )
    ORDER BY
      (CASE WHEN name ILIKE ${like} OR nps_code ILIKE ${like} THEN 1 ELSE 0 END) DESC,
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
  const sort = (searchParams.get("sort") ?? "relevance") as SortKey;

  const categoryIds = category ? await categoryIdsWithDescendants(category) : null;

  let products: ProductRow[];

  if (q) {
    const ids = await fuzzyMatchIds(q, categoryIds);
    if (ids.length === 0) return NextResponse.json({ count: 0, results: [] });
    const relevanceOrder = new Map(ids.map((id, i) => [id, i]));
    const fetched = await prisma.product.findMany({ where: { id: { in: ids } }, select: PRODUCT_SELECT });
    products = applySort(fetched, sort, relevanceOrder);
  } else {
    products = await prisma.product.findMany({
      where: { status: "ACTIVE", ...(categoryIds ? { categoryId: { in: categoryIds } } : {}) },
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
    badges: p.badges,
    categoryId: p.category?.id ?? null,
    categoryName: p.category?.name ?? null,
    supplierName: p.supplierCompany.name,
    imageUrl: p.images[0]?.url ?? null,
  }));

  return NextResponse.json({ count: results.length, results });
}
