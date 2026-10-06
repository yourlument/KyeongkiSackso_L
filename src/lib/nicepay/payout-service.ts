import { prisma } from "@/lib/db";
import { kstTimestamp } from "@/lib/nicepay/crypto";
import { getNicepayPaymentConfig } from "@/lib/nicepay/config";
import {
  cancelNicepayPayout,
  getNicepayPayoutResult,
  requestNicepayPayout,
} from "@/lib/nicepay/payout";
import {
  hasProductionPaymentForPayout,
  settlementCancellationAction,
} from "@/lib/settlements";

export class SettlementPayoutStateError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SettlementPayoutStateError";
    this.status = status;
  }
}

export function payoutSettlementDate(value: Date | null): string {
  return kstTimestamp(value ?? new Date()).slice(0, 8);
}

export function appendPayoutNote(
  current: string | null,
  status: string,
  seq?: string,
): string {
  const timestamp = kstTimestamp();
  const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
  const note = [date, status, seq].filter(Boolean).join(" ");
  return current ? `${current} / ${note}` : note;
}

async function persistPayoutError(
  settlementId: string,
  currentNote: string | null,
  message: string,
): Promise<void> {
  await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      nicepayPayoutError: message.slice(0, 255),
      settleNote: appendPayoutNote(currentNote, message.slice(0, 180)),
    },
  });
}

export async function submitSettlementPayout(
  settlementId: string,
  options: { dupChkYn?: "Y" | "N" } = {},
): Promise<{ seq: string; status: "요청"; settlementDate: string }> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      supplierCompany: {
        select: {
          nicepaySubId: true,
          nicepaySubmallSyncedAt: true,
        },
      },
      sourceOrder: {
        select: {
          payments: {
            where: { provider: "NICEPAY", status: "PAID" },
            select: { transactionId: true },
          },
        },
      },
    },
  });
  if (!settlement) {
    throw new SettlementPayoutStateError(
      404,
      "정산 내역을 찾을 수 없습니다.",
    );
  }
  if (settlement.status !== "PENDING" || settlement.nicepayPayoutSeq) {
    throw new SettlementPayoutStateError(
      409,
      "이미 지급 요청된 정산 내역입니다.",
    );
  }

  if (settlement.sourceOrder) {
    const paymentConfig = getNicepayPaymentConfig();
    if (
      !hasProductionPaymentForPayout({
        mode: paymentConfig.mode,
        mid: paymentConfig.mid,
        transactionIds: settlement.sourceOrder.payments.map(
          (payment) => payment.transactionId,
        ),
      })
    ) {
      const message = "NICEPAY 지급 요청 실패";
      await persistPayoutError(settlement.id, settlement.settleNote, message);
      throw new SettlementPayoutStateError(409, message);
    }
  }

  const subId = settlement.supplierCompany.nicepaySubId;
  if (!subId || !settlement.supplierCompany.nicepaySubmallSyncedAt) {
    const message = "NICEPAY 서브몰 등록을 먼저 완료해 주세요.";
    await persistPayoutError(settlement.id, settlement.settleNote, message);
    throw new SettlementPayoutStateError(409, message);
  }

  const amount = Number(settlement.amount);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    const message = "지급 금액이 올바르지 않습니다.";
    await persistPayoutError(settlement.id, settlement.settleNote, message);
    throw new SettlementPayoutStateError(409, message);
  }

  try {
    const result = await requestNicepayPayout({
      settlmntDt: payoutSettlementDate(settlement.scheduledPayoutDate),
      subId,
      settlmntAmt: amount,
      dupChkYn: options.dupChkYn ?? "Y",
      accountDesc: process.env.NICEPAY_PAYOUT_ACCOUNT_DESC || "KORLINK",
    });
    await prisma.settlement.update({
      where: { id: settlement.id },
      data: {
        nicepayPayoutSeq: result.seq,
        nicepayPayoutStatus: "요청",
        nicepayPayoutRequestedAt: new Date(),
        nicepayPayoutError: null,
        settleNote: appendPayoutNote(
          settlement.settleNote,
          "요청",
          result.seq,
        ),
      },
    });
    return {
      seq: result.seq,
      status: "요청",
      settlementDate: result.settlmntDt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "NICEPAY 지급 요청 실패";
    await persistPayoutError(settlement.id, settlement.settleNote, message);
    throw error;
  }
}

export type SettlementPayoutCancellationResult = {
  settlementId: string;
  seq: string | null;
  providerDeleted: boolean;
  alreadyCancelled: boolean;
};

export async function cancelSettlementPayout(
  settlementId: string,
): Promise<SettlementPayoutCancellationResult> {
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      supplierCompany: {
        select: { nicepaySubId: true },
      },
    },
  });
  if (!settlement) {
    throw new SettlementPayoutStateError(
      404,
      "정산 내역을 찾을 수 없습니다.",
    );
  }

  const action = settlementCancellationAction({
    status: settlement.status,
    payoutSeq: settlement.nicepayPayoutSeq,
    payoutStatus: settlement.nicepayPayoutStatus,
  });
  if (action === "ALREADY_CANCELLED") {
    return {
      settlementId: settlement.id,
      seq: settlement.nicepayPayoutSeq,
      providerDeleted: settlement.nicepayPayoutStatus === "삭제",
      alreadyCancelled: true,
    };
  }
  if (action === "BLOCKED_PAID") {
    const message = "취소할 지급 요청이 없습니다.";
    await persistPayoutError(settlement.id, settlement.settleNote, message);
    throw new SettlementPayoutStateError(
      409,
      message,
    );
  }

  let providerDeleted = settlement.nicepayPayoutStatus === "삭제";
  let deletedSeq = settlement.nicepayPayoutSeq;
  if (action === "CANCEL_PROVIDER") {
    const subId = settlement.supplierCompany.nicepaySubId;
    if (!subId || !settlement.nicepayPayoutSeq) {
      throw new SettlementPayoutStateError(
        409,
        "취소할 지급 요청이 없습니다.",
      );
    }
    try {
      const result = await cancelNicepayPayout({
        settlmntDt: payoutSettlementDate(settlement.scheduledPayoutDate),
        subId,
        seq: settlement.nicepayPayoutSeq,
      });
      deletedSeq = result.seq;
      providerDeleted = true;
    } catch (error) {
      try {
        const result = await getNicepayPayoutResult({
          settlmntDt: payoutSettlementDate(settlement.scheduledPayoutDate),
          subId,
        });
        const detail = result.detail.find(
          (row) => String(row.seq) === settlement.nicepayPayoutSeq,
        );
        providerDeleted = detail?.statusNm === "삭제";
      } catch {}
      if (!providerDeleted) {
        const message =
          error instanceof Error ? error.message : "NICEPAY 지급대행 처리에 실패했습니다.";
        await persistPayoutError(settlement.id, settlement.settleNote, message);
        throw error;
      }
    }
  }

  const updated = await prisma.settlement.updateMany({
    where: { id: settlement.id, status: "PENDING" },
    data: {
      status: "CANCELLED",
      nicepayPayoutStatus: "삭제",
      nicepayPayoutError: null,
      settleNote: appendPayoutNote(
        settlement.settleNote,
        "삭제",
        deletedSeq ?? undefined,
      ),
    },
  });
  if (updated.count !== 1) {
    const current = await prisma.settlement.findUnique({
      where: { id: settlement.id },
      select: { status: true },
    });
    if (current?.status !== "CANCELLED") {
      throw new SettlementPayoutStateError(
        409,
        "취소할 지급 요청이 없습니다.",
      );
    }
  }

  return {
    settlementId: settlement.id,
    seq: deletedSeq,
    providerDeleted,
    alreadyCancelled: false,
  };
}

export async function cancelOrderSettlementPayouts(
  orderId: string,
): Promise<SettlementPayoutCancellationResult[]> {
  const settlements = await prisma.settlement.findMany({
    where: {
      status: { in: ["PENDING", "PAID"] },
      OR: [
        { sourceOrderId: orderId },
        { orders: { some: { id: orderId } } },
      ],
    },
    select: { id: true },
  });
  const results = await Promise.allSettled(
    settlements.map((settlement) => cancelSettlementPayout(settlement.id)),
  );
  const failure = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (failure) throw failure.reason;
  return results.map(
    (result) => (result as PromiseFulfilledResult<SettlementPayoutCancellationResult>).value,
  );
}
