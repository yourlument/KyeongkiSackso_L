import { Prisma } from "@prisma/client";

export const PG_FEE_RATE_PERCENT = 3;

export type SettlementCancellationAction =
  | "ALREADY_CANCELLED"
  | "BLOCKED_PAID"
  | "CANCEL_PROVIDER"
  | "CANCEL_LOCAL";

export function hasProductionPaymentForPayout(input: {
  mode: "test" | "production";
  mid: string;
  transactionIds: Array<string | null>;
}): boolean {
  if (input.mode !== "production" || !input.mid) return false;
  return input.transactionIds.some((transactionId) =>
    transactionId?.startsWith(input.mid),
  );
}

export function settlementCancellationAction(input: {
  status: "PENDING" | "PAID" | "CANCELLED";
  payoutSeq: string | null;
  payoutStatus: string | null;
}): SettlementCancellationAction {
  if (input.status === "CANCELLED") return "ALREADY_CANCELLED";
  if (input.status === "PAID") return "BLOCKED_PAID";
  if (input.payoutSeq && input.payoutStatus !== "삭제") {
    return "CANCEL_PROVIDER";
  }
  return "CANCEL_LOCAL";
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstMidnight(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - KST_OFFSET_MS);
}

export function calculateSettlementAmounts(
  value: Prisma.Decimal.Value,
): {
  grossAmount: Prisma.Decimal;
  platformFee: Prisma.Decimal;
  pgFee: Prisma.Decimal;
  payoutAmount: Prisma.Decimal;
} {
  const grossAmount = new Prisma.Decimal(value);
  if (!grossAmount.isPositive()) {
    throw new Error("정산 대상 금액이 올바르지 않습니다.");
  }
  const platformFee = new Prisma.Decimal(0);
  const pgFee = grossAmount
    .mul(PG_FEE_RATE_PERCENT)
    .div(100)
    .toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
  const payoutAmount = grossAmount.minus(pgFee);
  if (!payoutAmount.isPositive()) {
    throw new Error("정산 지급 금액이 올바르지 않습니다.");
  }
  return { grossAmount, platformFee, pgFee, payoutAmount };
}

export function monthlySettlementSchedule(completedAt: Date): {
  periodStart: Date;
  periodEnd: Date;
  scheduledPayoutDate: Date;
} {
  const kst = new Date(completedAt.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth();
  const periodStart = kstMidnight(year, month, 1);
  const nextMonthStart = kstMidnight(year, month + 1, 1);
  return {
    periodStart,
    periodEnd: new Date(nextMonthStart.getTime() - 1),
    scheduledPayoutDate: kstMidnight(year, month + 1, 10),
  };
}

export async function createPurchaseConfirmationSettlements(
  tx: Prisma.TransactionClient,
  input: {
    orderId: string;
    completedAt: Date;
    items: Array<{
      supplierCompanyId: string | null;
      amount: Prisma.Decimal;
    }>;
  },
): Promise<string[]> {
  const bySupplier = new Map<string, Prisma.Decimal>();
  for (const item of input.items) {
    if (!item.supplierCompanyId) {
      throw new Error("공급업체가 지정되지 않은 주문 상품이 있습니다.");
    }
    bySupplier.set(
      item.supplierCompanyId,
      (bySupplier.get(item.supplierCompanyId) ?? new Prisma.Decimal(0)).add(
        item.amount,
      ),
    );
  }
  if (bySupplier.size === 0) {
    throw new Error("정산할 주문 상품이 없습니다.");
  }

  const schedule = monthlySettlementSchedule(input.completedAt);
  const settlementIds: string[] = [];
  for (const [supplierCompanyId, gross] of bySupplier) {
    const amounts = calculateSettlementAmounts(gross);
    const settlement = await tx.settlement.upsert({
      where: {
        sourceOrderId_supplierCompanyId: {
          sourceOrderId: input.orderId,
          supplierCompanyId,
        },
      },
      update: {
        periodStart: schedule.periodStart,
        periodEnd: schedule.periodEnd,
        scheduledPayoutDate: schedule.scheduledPayoutDate,
        grossAmount: amounts.grossAmount,
        fee: amounts.platformFee,
        pgFee: amounts.pgFee,
        amount: amounts.payoutAmount,
      },
      create: {
        sourceOrderId: input.orderId,
        supplierCompanyId,
        periodStart: schedule.periodStart,
        periodEnd: schedule.periodEnd,
        scheduledPayoutDate: schedule.scheduledPayoutDate,
        grossAmount: amounts.grossAmount,
        fee: amounts.platformFee,
        pgFee: amounts.pgFee,
        amount: amounts.payoutAmount,
        status: "PENDING",
      },
      select: { id: true },
    });
    settlementIds.push(settlement.id);
  }
  return settlementIds;
}
