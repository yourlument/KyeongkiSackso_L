import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, amount: true, method: true } },
    },
  });
  if (!order) return NextResponse.json({ message: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status === "CANCELLED") {
    return NextResponse.json({ message: "이미 환불된 주문입니다" }, { status: 409 });
  }

  const base = order.payments[0];

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    if (base) {
      await tx.payment.update({ where: { id: base.id }, data: { status: "REFUNDED" } });
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "MOCK",
          status: "REFUNDED",
          amount: base.amount,
          method: base.method,
          paidAt: new Date(),
          metadata: { provisional: true, kind: "refund", refundedBy: claims.sub },
        },
      });
    }
  });

  return NextResponse.json({ ok: true, status: "CANCELLED" });
}
