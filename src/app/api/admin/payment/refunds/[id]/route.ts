import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json({ message: "유효하지 않은 요청입니다" }, { status: 400 });
  }

  const refund = await prisma.refundRequest.findUnique({
    where: { id },
    select: { id: true, status: true, orderId: true },
  });
  if (!refund) return NextResponse.json({ message: "환불 요청을 찾을 수 없습니다" }, { status: 404 });
  if (refund.status !== "PENDING") {
    return NextResponse.json({ message: "이미 처리된 환불 요청입니다" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.refundRequest.update({
      where: { id },
      data: { status: decision, processedAt: new Date(), processedBy: claims.sub },
    });
    if (decision === "APPROVED") {
      await tx.order.update({ where: { id: refund.orderId }, data: { status: "CANCELLED" } });
    }
  });

  return NextResponse.json({ ok: true, status: decision });
}
