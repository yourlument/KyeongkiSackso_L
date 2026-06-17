import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { productInput } from "../route";

export const dynamic = "force-dynamic";

type Spec = { label: string; value: string };

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await ctx.params;

  const p = await prisma.product.findFirst({
    where: { id, supplierCompanyId: companyId },
    include: {
      category: { select: { id: true, itemType: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, type: true } },
    },
  });
  if (!p) return NextResponse.json({ message: "상품을 찾을 수 없습니다" }, { status: 404 });

  return NextResponse.json({
    id: p.id,
    name: p.name,
    npsCode: p.npsCode,
    price: Number(p.price),
    unit: p.unit,
    minOrderQty: p.minOrderQty,
    deliveryDays: p.deliveryDays,
    deliveryCondition: p.deliveryCondition,
    categoryId: p.categoryId,
    itemType: p.category?.itemType ?? null,
    specs: (p.specs as Spec[] | null) ?? [],
    badges: p.badges,
    imageUrl: p.images.find((i) => i.type === "THUMBNAIL")?.url ?? null,
    detailImageUrls: p.images.filter((i) => i.type === "DETAIL").map((i) => i.url),
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await ctx.params;

  const owned = await prisma.product.findFirst({ where: { id, supplierCompanyId: companyId }, select: { id: true } });
  if (!owned) return NextResponse.json({ message: "상품을 찾을 수 없습니다" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = productInput.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "필수 항목을 확인해 주세요" }, { status: 400 });
  const d = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      ...(d.categoryId !== undefined ? { categoryId: d.categoryId } : {}),
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.npsCode !== undefined ? { npsCode: d.npsCode } : {}),
      ...(d.price !== undefined && d.price !== null ? { price: d.price } : {}),
      ...(d.unit !== undefined ? { unit: d.unit } : {}),
      ...(d.minOrderQty !== undefined ? { minOrderQty: d.minOrderQty } : {}),
      ...(d.deliveryDays !== undefined ? { deliveryDays: d.deliveryDays } : {}),
      ...(d.deliveryCondition !== undefined ? { deliveryCondition: d.deliveryCondition } : {}),
      ...(d.specs !== undefined ? { specs: d.specs } : {}),
      ...(d.badges !== undefined ? { badges: d.badges } : {}),
    },
  });

  if (d.imageUrl !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: id, type: "THUMBNAIL" } });
    if (d.imageUrl) {
      await prisma.productImage.create({ data: { productId: id, url: d.imageUrl, type: "THUMBNAIL", sortOrder: 0 } });
    }
  }

  if (d.detailImageUrls !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: id, type: "DETAIL" } });
    for (let i = 0; i < d.detailImageUrls.length; i++) {
      await prisma.productImage.create({ data: { productId: id, url: d.detailImageUrls[i], type: "DETAIL", sortOrder: i + 1 } });
    }
  }

  return NextResponse.json({ ok: true });
}
