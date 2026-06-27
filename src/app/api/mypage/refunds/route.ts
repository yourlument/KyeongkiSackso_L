import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderNo: z.string().min(1),
  reason: z.string().min(1),
});

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role === "SUPPLIER") {
    return NextResponse.json(
      { message: "공급업체 계정은 구매 및 견적 요청 기능을 이용할 수 없습니다" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNo: parsed.data.orderNo },
    select: {
      id: true,
      buyerId: true,
      status: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true } },
    },
  });

  if (!order || order.buyerId !== claims.sub) {
    return NextResponse.json({ message: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  if (order.status !== "PAID" && order.status !== "SHIPPING") {
    return NextResponse.json({ message: "환불 신청이 가능한 상태가 아닙니다" }, { status: 400 });
  }

  const existing = await prisma.refundRequest.findFirst({
    where: { orderId: order.id, status: "PENDING" },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ message: "이미 환불 신청이 접수된 주문입니다" }, { status: 400 });
  }

  await prisma.refundRequest.create({
    data: {
      orderId: order.id,
      paymentId: order.payments[0]?.id ?? null,
      requesterId: claims.sub,
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json({ ok: true });
}
