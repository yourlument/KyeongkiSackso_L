import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    take: 12,
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
      supplierCompany: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    unit: p.unit,
    companyName: p.supplierCompany.name,
    imageUrl: p.images[0]?.url ?? null,
  }));

  return NextResponse.json({ products: items });
}
