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

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNo: true,
      status: true,
      payments: {
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          amount: true,
          method: true,
          provider: true,
          status: true,
          transactionId: true,
        },
      },
    },
  });
  if (!order) return NextResponse.json({ message: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status === "CANCELLED") {
    return NextResponse.json({ message: "이미 환불된 주문입니다" }, { status: 409 });
  }

  const base = order.payments[0];
  let nicepayCancel: Record<string, unknown> | null = null;
  let nicepayTid: string | null = null;
  if (base?.provider === "NICEPAY" && base.status === "PAID") {
    if (!base.transactionId) {
      return NextResponse.json(
        { message: "NICEPAY 거래번호가 없어 자동 환불할 수 없습니다." },
        { status: 409 },
      );
    }
    nicepayTid = base.transactionId;
    if (base.method === "가상계좌") {
      return NextResponse.json(
        { message: "가상계좌 환불은 환불 계좌정보 입력 후 처리해야 합니다." },
        { status: 409 },
      );
    }
  }

  try {
    await cancelOrderSettlementPayouts(order.id);
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

  if (base && nicepayTid) {
    try {
      nicepayCancel = await cancelNicepayPayment({
        tid: nicepayTid,
        orderNo: order.orderNo,
        amount: Number(base.amount),
        reason: "관리자 환불",
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

  if (!base) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
  } else {
    try {
      await finalizePaymentRefund({
        paymentId: base.id,
        cancelTransactionId:
          nicepayCancel?.CancelNum != null
            ? String(nicepayCancel.CancelNum)
            : null,
        source: "admin-order",
        processedBy: claims.sub,
        metadata: {
          provisional: base.provider === "MOCK",
          ...(nicepayCancel?.ResultCode != null
            ? { resultCode: String(nicepayCancel.ResultCode) }
            : {}),
        },
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
  }

  return NextResponse.json({ ok: true, status: "CANCELLED" });
}
