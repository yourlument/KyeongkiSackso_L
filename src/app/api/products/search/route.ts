import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type SortKey = "relevance" | "latest" | "priceLow" | "priceHigh";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim();
  const sort = (searchParams.get("sort") ?? "relevance") as SortKey;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: orderBy(sort),
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,

      npsCode: true,
      rating: true,
      reviewCount: true,
      badges: true,
      category: { select: { id: true, name: true } },

      supplierCompany: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

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
