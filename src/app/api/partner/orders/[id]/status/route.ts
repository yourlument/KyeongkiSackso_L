import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const input = z.object({
  status: z.enum(["SHIPPING", "DELIVERED"]).optional(),
  taxInvoiceStatus: z.enum(["ISSUED"]).optional(),
  courier: z.string().nullable().optional(),
  trackingNo: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await ctx.params;

  const order = await prisma.order.findFirst({
    where: { id, items: { some: { OR: [{ supplierCompanyId: companyId }, { product: { supplierCompanyId: companyId } }] } } },
    select: { id: true, status: true, buyerId: true, items: { select: { name: true } } },
  });
  if (!order) return NextResponse.json({ message: "주문을 찾을 수 없습니다" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  const d = parsed.data;

  if (d.taxInvoiceStatus === "ISSUED") {
    await prisma.order.update({
      where: { id },
      data: { taxInvoiceStatus: "ISSUED" },
    });
    return NextResponse.json({ ok: true });
  }

  if (d.status === "SHIPPING") {
    if (!["PAID", "CONTRACTED"].includes(order.status)) {
      return NextResponse.json({ message: "결제완료 상태에서만 배송 처리할 수 있습니다" }, { status: 409 });
    }
    if (!d.courier?.trim() || !d.trackingNo?.trim()) {
      return NextResponse.json({ message: "택배사와 송장 번호를 입력해 주세요" }, { status: 400 });
    }
    await prisma.order.update({
      where: { id },
      data: { status: "SHIPPING", courier: d.courier.trim(), trackingNo: d.trackingNo.trim() },
    });
  } else if (d.status === "DELIVERED") {
    if (order.status !== "SHIPPING") {
      return NextResponse.json({ message: "배송중 상태에서만 납품완료할 수 있습니다" }, { status: 409 });
    }
    await prisma.order.update({
      where: { id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
  } else {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }

  try {
    const first = order.items[0]?.name ?? "주문 상품";
    const label = order.items.length > 1 ? `${first} 외 ${order.items.length - 1}건` : first;
    const statusLabel = d.status === "SHIPPING" ? "배송중" : "납품완료";
    await createNotification({
      userId: order.buyerId,
      type: "ORDER_STATUS",
      title: "주문 상태 변경",
      body: `'${label}' 주문이 ${statusLabel} 처리되었습니다.`,
      link: "/mypage",
      category: "delivery",
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
