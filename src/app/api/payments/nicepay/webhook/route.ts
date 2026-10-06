import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getNicepayBillingConfig,
  getNicepayPaymentConfig,
} from "@/lib/nicepay/config";
import {
  isNicepayApprovedPaymentStatus,
  isNicepayCancellationNotification,
  isNicepayCancelledPaymentStatus,
  isNicepayImmediateApprovalNotification,
  isNicepayVirtualDepositNotification,
  queryNicepayPayment,
} from "@/lib/nicepay/payment";
import {
  finalizeNicepayPayment,
  finalizePaymentRefund,
} from "@/lib/nicepay/payment-service";
import { cancelOrderSettlementPayouts } from "@/lib/nicepay/payout-service";

export const dynamic = "force-dynamic";

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function ack(ok: boolean): NextResponse {
  return new NextResponse(ok ? "OK" : "FAIL", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return ack(false);
  const mid = text(form.get("MID"));
  const paymentId = text(form.get("MOID"));
  const tid = text(form.get("TID"));
  const amount = text(form.get("Amt"));
  const payMethod = text(form.get("PayMethod"));
  const resultCode = text(form.get("ResultCode"));
  const state = text(form.get("StateCd"));

  const config = getNicepayPaymentConfig();
  const isVirtualDeposit = isNicepayVirtualDepositNotification({
    mid,
    expectedMid: config.mid,
    paymentId,
    tid,
    payMethod,
    resultCode,
    state,
  });
  if (isVirtualDeposit) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.provider !== "NICEPAY") return ack(false);
    if (payment.status === "PAID") return ack(true);
    if (
      payment.status !== "READY" ||
      Number(payment.amount) !== Number(amount) ||
      (payment.transactionId && payment.transactionId !== tid)
    ) {
      return ack(false);
    }

    try {
      const status = await queryNicepayPayment(tid);
      if (!isNicepayApprovedPaymentStatus(status, tid)) {
        return ack(false);
      }
      await finalizeNicepayPayment({
        paymentId,
        transactionId: tid,
        metadata: {
          ResultCode: resultCode,
          ResultMsg: text(form.get("ResultMsg")),
          AuthDate: text(form.get("AuthDate")),
          PayMethod: payMethod,
          VbankBankCode: text(form.get("FnCd")),
          VbankBankName: text(form.get("VbankName")),
          VbankInputName: text(form.get("VbankInputName")),
        },
      });
      return ack(true);
    } catch {
      return ack(false);
    }
  }

  const isImmediateApproval = isNicepayImmediateApprovalNotification({
    mid,
    expectedMid: config.mid,
    paymentId,
    tid,
    payMethod,
    resultCode,
    state,
  });
  if (isImmediateApproval) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.provider !== "NICEPAY") return ack(false);
    const expectedMethod = payMethod === "BANK" ? "계좌이체" : "법인카드";
    if (
      payment.method !== expectedMethod ||
      Number(payment.amount) !== Number(amount) ||
      (payment.transactionId && payment.transactionId !== tid)
    ) {
      return ack(false);
    }
    if (payment.status === "PAID") return ack(true);
    if (payment.status !== "READY") return ack(false);

    try {
      const status = await queryNicepayPayment(tid);
      if (!isNicepayApprovedPaymentStatus(status, tid)) {
        return ack(false);
      }
      await finalizeNicepayPayment({
        paymentId,
        transactionId: tid,
        metadata: {
          ResultCode: resultCode,
          ResultMsg: text(form.get("ResultMsg")),
          AuthDate: text(form.get("AuthDate")),
          PayMethod: payMethod,
          notification: "payment-data",
        },
      });
      return ack(true);
    } catch {
      return ack(false);
    }
  }

  const billing = getNicepayBillingConfig();

                                                
                                                 
  if (
    billing.enabled &&
    mid === billing.mid &&
    isNicepayImmediateApprovalNotification({
      mid,
      expectedMid: billing.mid,
      paymentId,
      tid,
      payMethod,
      resultCode,
      state,
    })
  ) {
    const recorded = await prisma.subscriptionPayment.findUnique({
      where: { transactionId: tid },
    });
    return ack(
      Boolean(recorded) &&
        recorded?.status === "PAID" &&
        Number(recorded?.amount) === Number(amount),
    );
  }

  const cancellation =
    isNicepayCancellationNotification({
      mid,
      expectedMid: config.mid,
      paymentId,
      tid,
      payMethod,
      state,
    }) ||
    (billing.enabled &&
      isNicepayCancellationNotification({
        mid,
        expectedMid: billing.mid,
        paymentId,
        tid,
        payMethod,
        state,
      }));
  if (!cancellation) return ack(false);

                                              
  if (billing.enabled && mid === billing.mid) {
    const subscriptionPayment = await prisma.subscriptionPayment.findUnique({
      where: { transactionId: tid },
    });
    if (subscriptionPayment) {
      if (Number(subscriptionPayment.amount) !== Number(amount)) {
        return ack(false);
      }
      if (subscriptionPayment.status === "REFUNDED") return ack(true);
      if (subscriptionPayment.status !== "PAID") return ack(false);
      try {
        const status = await queryNicepayPayment(tid, billing);
        if (!isNicepayCancelledPaymentStatus(status, tid)) return ack(false);
        await prisma.$transaction([
          prisma.subscriptionPayment.update({
            where: { id: subscriptionPayment.id },
            data: {
              status: "REFUNDED",
              failureReason: "NICEPAY 결제 취소",
              metadata: {
                TID: tid,
                ResultCode: resultCode,
                ResultMsg: text(form.get("ResultMsg")),
                CancelDate: text(form.get("CancelDate")),
                CancelMOID: text(form.get("CancelMOID")),
                StateCd: state,
              },
            },
          }),
          prisma.subscription.update({
            where: { id: subscriptionPayment.subscriptionId },
            data: { status: "OVERDUE", lastBillingError: "NICEPAY 결제 취소" },
          }),
        ]);
        return ack(true);
      } catch {
        return ack(false);
      }
    }
  }

  const payment = await prisma.payment.findFirst({
    where: { provider: "NICEPAY", transactionId: tid },
    include: { order: { select: { orderNo: true, status: true } } },
  });
  if (!payment) return ack(false);
  if (paymentId !== payment.id && paymentId !== payment.order.orderNo) {
    return ack(false);
  }
  const expectedMethod = payMethod === "BANK" ? "계좌이체" : "법인카드";
  if (
    payment.method !== expectedMethod ||
    Number(payment.amount) !== Number(amount)
  ) {
    return ack(false);
  }
  if (payment.status === "REFUNDED" && payment.order.status === "CANCELLED") {
    try {
      await cancelOrderSettlementPayouts(payment.orderId);
      return ack(true);
    } catch {
      return ack(false);
    }
  }
  if (payment.status !== "PAID") return ack(false);

  try {
    const status = await queryNicepayPayment(tid);
    if (!isNicepayCancelledPaymentStatus(status, tid)) {
      return ack(false);
    }
    let payoutCancellationFailed = false;
    try {
      await cancelOrderSettlementPayouts(payment.orderId);
    } catch {
      payoutCancellationFailed = true;
    }
    try {
      await finalizePaymentRefund({
        paymentId: payment.id,
        source: "nicepay-webhook",
        metadata: {
          TID: tid,
          ResultCode: resultCode,
          ResultMsg: text(form.get("ResultMsg")),
          AuthDate: text(form.get("AuthDate")),
          CancelDate: text(form.get("CancelDate")),
          CancelMOID: text(form.get("CancelMOID")),
          PayMethod: payMethod,
          StateCd: state,
        },
      });
    } catch {
      return ack(false);
    }
    return ack(!payoutCancellationFailed);
  } catch {
    return ack(false);
  }
}
