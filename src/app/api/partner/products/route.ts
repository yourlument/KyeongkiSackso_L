import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";

export const dynamic = "force-dynamic";

const specSchema = z.object({ label: z.string(), value: z.string() });

export const productInput = z.object({
  categoryId: z.string().min(1, "카테고리는 필수입니다"),
  name: z.string().min(1),
  npsCode: z.string().nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  unit: z.string().nullable().optional(),
  minOrderQty: z.number().int().nonnegative().nullable().optional(),
  deliveryDays: z.number().int().nonnegative().nullable().optional(),
  deliveryCondition: z.string().nullable().optional(),
  specs: z.array(specSchema).optional(),
  badges: z.array(z.string()).optional(),
  imageUrl: z.string().nullable().optional(),
  detailImageUrls: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = productInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "필수 항목을 확인해 주세요" }, { status: 400 });
  }
  const d = parsed.data;

  const imageCreates = [
    ...(d.imageUrl ? [{ url: d.imageUrl, type: "THUMBNAIL" as const, sortOrder: 0 }] : []),
    ...(d.detailImageUrls ?? []).map((url, i) => ({ url, type: "DETAIL" as const, sortOrder: i + 1 })),
  ];

  const product = await prisma.product.create({
    data: {
      supplierCompanyId: companyId,
      categoryId: d.categoryId ?? null,
      name: d.name,
      npsCode: d.npsCode ?? null,
      price: d.price ?? 0,
      unit: d.unit ?? null,
      minOrderQty: d.minOrderQty ?? null,
      deliveryDays: d.deliveryDays ?? null,
      deliveryCondition: d.deliveryCondition ?? null,
      specs: d.specs ?? undefined,
      badges: d.badges ?? [],
      status: "ACTIVE",
      ...(imageCreates.length ? { images: { create: imageCreates } } : {}),
    },
    select: { id: true },
  });

  return NextResponse.json({ id: product.id }, { status: 201 });
}
