import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      supplierCompany: { select: { name: true } },
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      inventory: true,
    },
  });

  if (!product || product.status === "DRAFT" || product.status === "HIDDEN") {
    return NextResponse.json({ message: "상품을 찾을 수 없습니다" }, { status: 404 });
  }

  const breadcrumb: { id: string; name: string }[] = [];
  let cat = product.category;
  while (cat) {
    breadcrumb.unshift({ id: cat.id, name: cat.name });
    if (!cat.parentId) break;
    cat = await prisma.category.findUnique({ where: { id: cat.parentId } });
  }

  return NextResponse.json({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    unit: product.unit,
    status: product.status,
    supplierCompanyName: product.supplierCompany.name,
    images: product.images.map((img) => img.url),
    breadcrumb,
    stock: product.inventory?.quantity ?? 0,

    npsCode: product.npsCode,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badges: product.badges,
    minOrderQty: product.minOrderQty,
    deliveryDays: product.deliveryDays,
    deliveryCondition: product.deliveryCondition,
  });
}
