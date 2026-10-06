import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { cancelNicepayPayment } from "@/lib/nicepay/payment";
import { finalizePaymentRefund } from "@/lib/nicepay/payment-service";
import {
  SettlementPayoutStateError,
  cancelOrderSettlementPayouts,
} from "@/lib/nicepay/payout-service";

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
    select: {
      id: true,
      status: true,
      orderId: true,
      reason: true,
      payment: {
        select: {
          id: true,
          amount: true,
          method: true,
          provider: true,
          status: true,
          transactionId: true,
        },
      },
      order: {
        select: {
          orderNo: true,
        },
      },
    },
  });
  if (!refund) return NextResponse.json({ message: "환불 요청을 찾을 수 없습니다" }, { status: 404 });
  if (refund.status !== "PENDING") {
    return NextResponse.json({ message: "이미 처리된 환불 요청입니다" }, { status: 409 });
  }

  const payment = refund.payment;
  let nicepayCancel: Record<string, unknown> | null = null;
  let nicepayTid: string | null = null;
  if (
    decision === "APPROVED" &&
    payment?.provider === "NICEPAY" &&
    payment.status === "PAID"
  ) {
    if (!payment.transactionId) {
      return NextResponse.json(
        { message: "NICEPAY 거래번호가 없어 자동 환불할 수 없습니다." },
        { status: 409 },
      );
    }
    nicepayTid = payment.transactionId;
    if (payment.method === "가상계좌") {
      return NextResponse.json(
        { message: "가상계좌 환불은 환불 계좌정보 입력 후 처리해야 합니다." },
        { status: 409 },
      );
    }
  }

  if (decision === "APPROVED") {
    try {
      await cancelOrderSettlementPayouts(refund.orderId);
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "NICEPAY 지급대행 처리에 실패했습니다.",
        },
        { status: error instanceof SettlementPayoutStateError ? error.status : 502 },
      );
    }
  }

  if (
    decision === "APPROVED" &&
    payment &&
    nicepayTid
  ) {
    try {
      nicepayCancel = await cancelNicepayPayment({
        tid: nicepayTid,
        orderNo: refund.order.orderNo,
        amount: Number(payment.amount),
        reason: refund.reason,
      });
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "NICEPAY 환불 요청에 실패했습니다.",
        },
        { status: 502 },
      );
    }
  }

  if (decision === "REJECTED") {
    await prisma.refundRequest.update({
      where: { id },
      data: { status: decision, processedAt: new Date(), processedBy: claims.sub },
    });
  } else if (payment) {
    try {
      await finalizePaymentRefund({
        paymentId: payment.id,
        cancelTransactionId:
          nicepayCancel?.CancelNum != null
            ? String(nicepayCancel.CancelNum)
            : null,
        source: "admin-refund-request",
        processedBy: claims.sub,
        metadata:
          nicepayCancel?.ResultCode != null
            ? { resultCode: String(nicepayCancel.ResultCode) }
            : {},
      });
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "환불 상태 저장에 실패했습니다.",
        },
        { status: 409 },
      );
    }
  } else {
    await prisma.$transaction([
      prisma.refundRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          processedAt: new Date(),
          processedBy: claims.sub,
        },
      }),
      prisma.order.update({
        where: { id: refund.orderId },
        data: { status: "CANCELLED" },
      }),
    ]);
  }

  return NextResponse.json({ ok: true, status: decision });
}
