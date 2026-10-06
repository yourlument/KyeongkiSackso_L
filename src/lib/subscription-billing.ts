import type { SubscriptionCycle } from "@prisma/client";
import { prisma } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto/pii";
import {
  approveNicepayBilling,
  createNicepayBillingTid,
  nicepayBillingMetadata,
  NicepayBillingApiError,
  removeNicepayBillkey,
  type NicepayBillingResponse,
} from "@/lib/nicepay/billing";
import { getNicepayBillingConfig } from "@/lib/nicepay/config";
import {
  isNicepayApprovedPaymentStatus,
  queryNicepayPayment,
} from "@/lib/nicepay/payment";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const LOCK_MS = 10 * 60 * 1000;

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    planName: "프리미엄 (월간)",
    amount: 2_990,
    months: 1,
  },
  ANNUAL: {
    planName: "프리미엄 (연간)",
    amount: 29_900,
    months: 12,
  },
} as const satisfies Record<
  SubscriptionCycle,
  {
    planName: string;
    amount: number;
    months: number;
  }
>;

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function addSubscriptionCycle(
  start: Date,
  cycle: SubscriptionCycle,
  anchorDay?: number,
): Date {
  const kst = new Date(start.getTime() + KST_OFFSET_MS);
  const months = SUBSCRIPTION_PLANS[cycle].months;
  const rawMonth = kst.getUTCMonth() + months;
  const year = kst.getUTCFullYear() + Math.floor(rawMonth / 12);
  const month = ((rawMonth % 12) + 12) % 12;
  const day = Math.min(
    anchorDay ?? kst.getUTCDate(),
    daysInUtcMonth(year, month),
  );
  return new Date(
    Date.UTC(
      year,
      month,
      day,
      kst.getUTCHours(),
      kst.getUTCMinutes(),
      kst.getUTCSeconds(),
      kst.getUTCMilliseconds(),
    ) - KST_OFFSET_MS,
  );
}

export function subscriptionCancellationEffectiveAt(
  input: {
    startedAt: Date;
    cycle: SubscriptionCycle;
    billingAnchorDay: number | null;
    currentPeriodEnd: Date | null;
    nextBillingDate: Date | null;
  },
  now = new Date(),
): Date {
  const anchorDay =
    input.billingAnchorDay ??
    new Date(input.startedAt.getTime() + KST_OFFSET_MS).getUTCDate();
  const minimumCycles = input.cycle === "MONTHLY" ? 3 : 1;
  let minimumEnd = input.startedAt;
  for (let index = 0; index < minimumCycles; index++) {
    minimumEnd = addSubscriptionCycle(minimumEnd, input.cycle, anchorDay);
  }
  const paidPeriodEnd = input.currentPeriodEnd ?? input.nextBillingDate ?? now;
  return minimumEnd > paidPeriodEnd ? minimumEnd : paidPeriodEnd;
}

export function subscriptionPeriodKey(start: Date): string {
  return new Date(start.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function retryAt(now: Date, failureCount: number): Date {
  const hours = failureCount <= 1 ? 1 : failureCount === 2 ? 24 : 72;
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

function message(error: unknown): string {
  return error instanceof Error
    ? error.message.slice(0, 500)
    : "NICEPAY 빌링 처리 실패";
}

function resultCode(error: unknown): string {
  return error instanceof NicepayBillingApiError
    ? error.resultCode
    : "BILLING_ERROR";
}

function billingMoid(
  subscriptionId: string,
  periodKey: string,
  attempt: number,
): string {
  return `SUB-${subscriptionId}-${periodKey}-${attempt}`.slice(0, 64);
}

function activeBillingMid(): string {
  const config = getNicepayBillingConfig();
  if (!config.enabled) throw new Error("NICEPAY 빌링이 비활성화되어 있습니다.");
  return config.mid;
}

function billingIdentity(
  users: Array<{ email: string; name: string; phone: string | null }>,
): {
  email: string;
  name: string;
  phone: string;
} {
  const user = users[0];
  return {
    email: user?.email ?? "",
    name: decrypt(user?.name) ?? "",
    phone: decrypt(user?.phone) ?? "",
  };
}

async function markBillingSuccess(input: {
  subscriptionId: string;
  paymentId: string;
  supplierCompanyId: string;
  registrationId?: string;
  periodStart: Date;
  periodEnd: Date;
  result: NicepayBillingResponse;
  now: Date;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPayment.update({
      where: { id: input.paymentId },
      data: {
        status: "PAID",
        paidAt: input.now,
        failureReason: null,
        metadata: nicepayBillingMetadata(input.result),
      },
    });
    await tx.subscription.update({
      where: { id: input.subscriptionId },
      data: {
        status: "ACTIVE",
        currentPeriodStart: input.periodStart,
        currentPeriodEnd: input.periodEnd,
        nextBillingDate: input.periodEnd,
        billingFailureCount: 0,
        nextRetryAt: null,
        lastBillingAttemptAt: input.now,
        lastBillingError: null,
        billingLockUntil: null,
      },
    });
    if (input.registrationId) {
      await tx.subscriptionBillingRegistration.update({
        where: { id: input.registrationId },
        data: {
          status: "COMPLETED",
          completedAt: input.now,
          resultCode: String(input.result.ResultCode ?? "3001"),
          resultMessage: String(input.result.ResultMsg ?? ""),
        },
      });
    }
  });
}

async function markBillingFailure(input: {
  subscriptionId: string;
  paymentId: string;
  supplierCompanyId: string;
  failureCount: number;
  error: unknown;
  now: Date;
}): Promise<void> {
  const failure = message(input.error);
  await prisma.$transaction(async (tx) => {
    await tx.subscriptionPayment.update({
      where: { id: input.paymentId },
      data: {
        status: "FAILED",
        failureReason: failure,
        metadata: {
          ResultCode: resultCode(input.error),
          ResultMsg: failure,
        },
      },
    });
    await tx.subscription.update({
      where: { id: input.subscriptionId },
      data: {
        status: "OVERDUE",
        billingFailureCount: input.failureCount,
        nextRetryAt:
          input.failureCount >= 3
            ? null
            : retryAt(input.now, input.failureCount),
        lastBillingAttemptAt: input.now,
        lastBillingError: failure,
        billingLockUntil: null,
      },
    });
  });
}

async function approvedOrReconciled(input: {
  bid: string;
  transactionId: string;
  merchantOrderId: string;
  amount: number;
  goodsName: string;
  identity: ReturnType<typeof billingIdentity>;
}): Promise<NicepayBillingResponse> {
  try {
    return await approveNicepayBilling({
      bid: input.bid,
      transactionId: input.transactionId,
      merchantOrderId: input.merchantOrderId,
      amount: input.amount,
      goodsName: input.goodsName,
      buyerName: input.identity.name,
      buyerTel: input.identity.phone,
      buyerEmail: input.identity.email,
    });
  } catch (error) {
    if (error instanceof NicepayBillingApiError) throw error;
    const status = await queryNicepayPayment(
      input.transactionId,
      getNicepayBillingConfig(),
    ).catch(() => null);
    if (status && matchesApprovedStatus(status, input)) {
      return status;
    }
    throw error;
  }
}

function matchesApprovedStatus(
  status: NicepayBillingResponse,
  input: {
    transactionId: string;
    merchantOrderId: string;
    amount: number;
  },
): boolean {
  return (
    isNicepayApprovedPaymentStatus(status, input.transactionId) &&
    Number(status.Amt) === input.amount &&
    (!status.Moid || String(status.Moid) === input.merchantOrderId)
  );
}

export async function activateRegisteredBillkey(input: {
  registrationId: string;
  bid: string;
  billkeyTid: string;
  billkeyResult: NicepayBillingResponse;
  now?: Date;
}): Promise<{ subscriptionId: string; charged: boolean }> {
  const now = input.now ?? new Date();
  const registration = await prisma.subscriptionBillingRegistration.findUnique({
    where: { id: input.registrationId },
    include: {
      subscription: true,
      supplierCompany: {
        include: {
          users: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!registration || registration.status !== "PROCESSING") {
    throw new Error("처리 가능한 빌링 등록 요청이 아닙니다.");
  }
  const encryptedBid = encrypt(input.bid);
  const cardNo = String(input.billkeyResult.CardNo ?? "") || null;
  const cardCode = String(input.billkeyResult.CardCode ?? "") || null;
  const cardName = String(input.billkeyResult.CardName ?? "") || null;

  if (registration.mode === "REPLACE") {
    const subscription = registration.subscription;
    if (!subscription || subscription.status === "CANCELLED") {
      throw new Error("결제수단을 변경할 구독이 없습니다.");
    }
    const previousBid = decrypt(subscription.billingKeyEncrypted);
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          billingProvider: "NICEPAY",
          billingKeyEncrypted: encryptedBid,
          billingKeyIssuedTid: input.billkeyTid,
          payMethod: cardName ? `${cardName} 카드` : "카드",
          cardNo,
          cardCode,
          cardName,
          billingFailureCount: 0,
          nextRetryAt: now,
          lastBillingError: null,
        },
      }),
      prisma.subscriptionBillingRegistration.update({
        where: { id: registration.id },
        data: {
          status: "COMPLETED",
          completedAt: now,
          resultCode: "F100",
          resultMessage: String(input.billkeyResult.ResultMsg ?? ""),
        },
      }),
    ]);
    if (previousBid && previousBid !== input.bid) {
      try {
        await removeNicepayBillkey({
          bid: previousBid,
          merchantOrderId: `SUBKEY-OLD-${registration.id}`.slice(0, 64),
          amount: Number(subscription.price),
        });
      } catch (error) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { lastBillingError: `이전 빌키 폐기 실패: ${message(error)}` },
        });
      }
    }
    return { subscriptionId: subscription.id, charged: false };
  }

  const plan = SUBSCRIPTION_PLANS[registration.cycle];
  const periodStart = now;
  const previousBid =
    registration.subscription?.status === "CANCELLED"
      ? decrypt(registration.subscription.billingKeyEncrypted)
      : null;
  const previousPrice = registration.subscription
    ? Number(registration.subscription.price)
    : null;
  const billingAnchorDay =
    registration.subscription?.billingAnchorDay ??
    new Date(now.getTime() + KST_OFFSET_MS).getUTCDate();
  const periodEnd = addSubscriptionCycle(
    periodStart,
    registration.cycle,
    billingAnchorDay,
  );
  let subscription = registration.subscription;
  if (!subscription) {
    subscription = await prisma.subscription.findFirst({
      where: {
        supplierCompanyId: registration.supplierCompanyId,
        status: { not: "CANCELLED" },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        supplierCompanyId: registration.supplierCompanyId,
        planName: plan.planName,
        price: plan.amount,
        cycle: registration.cycle,
        status: "PENDING",
        startedAt: now,
        billingAnchorDay,
      },
    });
  }
  const periodKey = subscriptionPeriodKey(periodStart);
  const transactionId = createNicepayBillingTid(activeBillingMid());
  const merchantOrderId = billingMoid(subscription.id, periodKey, 1);
  const payment = await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        planName: plan.planName,
        price: plan.amount,
        cycle: registration.cycle,
        status: "PENDING",
        startedAt: now,
        billingProvider: "NICEPAY",
        billingKeyEncrypted: encryptedBid,
        billingKeyIssuedTid: input.billkeyTid,
        billingAnchorDay,
        payMethod: cardName ? `${cardName} 카드` : "카드",
        cardNo,
        cardCode,
        cardName,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        nextBillingDate: now,
        cancelAtPeriodEnd: false,
        cancelEffectiveAt: null,
        cancelledAt: null,
        billingFailureCount: 0,
        nextRetryAt: null,
        lastBillingAttemptAt: now,
        lastBillingError: null,
        billingLockUntil: new Date(now.getTime() + LOCK_MS),
      },
    });
    await tx.subscriptionBillingRegistration.update({
      where: { id: registration.id },
      data: { subscriptionId: subscription.id },
    });
    return tx.subscriptionPayment.upsert({
      where: {
        subscriptionId_billingMonth: {
          subscriptionId: subscription.id,
          billingMonth: periodKey,
        },
      },
      update: {
        amount: plan.amount,
        status: "READY",
        provider: "NICEPAY",
        kind: "INITIAL",
        transactionId,
        merchantOrderId,
        periodStart,
        periodEnd,
        attemptedAt: now,
        attemptCount: { increment: 1 },
        failureReason: null,
      },
      create: {
        subscriptionId: subscription.id,
        amount: plan.amount,
        status: "READY",
        billingMonth: periodKey,
        kind: "INITIAL",
        provider: "NICEPAY",
        transactionId,
        merchantOrderId,
        periodStart,
        periodEnd,
        attemptedAt: now,
        attemptCount: 1,
      },
    });
  });

  try {
    const result = await approvedOrReconciled({
      bid: input.bid,
      transactionId,
      merchantOrderId,
      amount: plan.amount,
      goodsName: plan.planName,
      identity: billingIdentity(registration.supplierCompany.users),
    });
    await markBillingSuccess({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      supplierCompanyId: registration.supplierCompanyId,
      registrationId: registration.id,
      periodStart,
      periodEnd,
      result,
      now,
    });
    if (previousBid && previousBid !== input.bid) {
      try {
        await removeNicepayBillkey({
          bid: previousBid,
          merchantOrderId: `SUBKEY-OLD-${registration.id}`.slice(0, 64),
          amount: previousPrice ?? plan.amount,
        });
      } catch (error) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { lastBillingError: `이전 빌키 폐기 실패: ${message(error)}` },
        });
      }
    }
    return { subscriptionId: subscription.id, charged: true };
  } catch (error) {
    await markBillingFailure({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      supplierCompanyId: registration.supplierCompanyId,
      failureCount: 1,
      error,
      now,
    });
    await prisma.subscriptionBillingRegistration.update({
      where: { id: registration.id },
      data: {
        status: "FAILED",
        resultCode: resultCode(error),
        resultMessage: message(error),
      },
    });
    throw error;
  }
}

export async function reactivateSubscription(input: {
  subscriptionId: string;
  supplierCompanyId: string;
  now?: Date;
}): Promise<"paid" | "failed"> {
  const now = input.now ?? new Date();
  const billingMid = activeBillingMid();
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: input.subscriptionId,
      supplierCompanyId: input.supplierCompanyId,
      status: "CANCELLED",
      billingKeyEncrypted: { not: null },
    },
    include: {
      supplierCompany: {
        include: {
          users: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!subscription) {
    throw new Error("등록된 카드로 재가입할 수 있는 이용권이 없습니다.");
  }
  const claimed = await prisma.subscription.updateMany({
    where: {
      id: subscription.id,
      status: "CANCELLED",
      billingKeyEncrypted: { not: null },
      OR: [{ billingLockUntil: null }, { billingLockUntil: { lt: now } }],
    },
    data: { billingLockUntil: new Date(now.getTime() + LOCK_MS) },
  });
  if (claimed.count !== 1) throw new Error("이용권 결제가 이미 처리 중입니다.");

  const bid = decrypt(subscription.billingKeyEncrypted);
  if (!bid) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { billingLockUntil: null },
    });
    throw new Error("등록된 카드 정보를 확인할 수 없습니다.");
  }

  const periodStart = now;
  const billingAnchorDay =
    subscription.billingAnchorDay ??
    new Date(now.getTime() + KST_OFFSET_MS).getUTCDate();
  const periodEnd = addSubscriptionCycle(
    periodStart,
    subscription.cycle,
    billingAnchorDay,
  );
  const periodKey = subscriptionPeriodKey(periodStart);
  const transactionId = createNicepayBillingTid(billingMid);
  const merchantOrderId = billingMoid(subscription.id, periodKey, 1);
  const payment = await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "PENDING",
        startedAt: now,
        nextBillingDate: now,
        billingAnchorDay,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        cancelEffectiveAt: null,
        cancelledAt: null,
        billingFailureCount: 0,
        nextRetryAt: null,
        lastBillingAttemptAt: now,
        lastBillingError: null,
        billingLockUntil: new Date(now.getTime() + LOCK_MS),
      },
    });
    return tx.subscriptionPayment.upsert({
      where: {
        subscriptionId_billingMonth: {
          subscriptionId: subscription.id,
          billingMonth: periodKey,
        },
      },
      update: {
        amount: subscription.price,
        status: "READY",
        provider: "NICEPAY",
        kind: "INITIAL",
        transactionId,
        merchantOrderId,
        periodStart,
        periodEnd,
        attemptedAt: now,
        attemptCount: { increment: 1 },
        failureReason: null,
      },
      create: {
        subscriptionId: subscription.id,
        amount: subscription.price,
        status: "READY",
        billingMonth: periodKey,
        kind: "INITIAL",
        provider: "NICEPAY",
        transactionId,
        merchantOrderId,
        periodStart,
        periodEnd,
        attemptedAt: now,
        attemptCount: 1,
      },
    });
  });

  try {
    const result = await approvedOrReconciled({
      bid,
      transactionId,
      merchantOrderId,
      amount: Number(subscription.price),
      goodsName: subscription.planName,
      identity: billingIdentity(subscription.supplierCompany.users),
    });
    await markBillingSuccess({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      supplierCompanyId: subscription.supplierCompanyId,
      periodStart,
      periodEnd,
      result,
      now,
    });
    return "paid";
  } catch (error) {
    await markBillingFailure({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      supplierCompanyId: subscription.supplierCompanyId,
      failureCount: 1,
      error,
      now,
    });
    return "failed";
  }
}

export async function chargeSubscription(
  subscriptionId: string,
  now = new Date(),
): Promise<"paid" | "failed" | "cancelled" | "skipped"> {
  const billingMid = activeBillingMid();
  const claimed = await prisma.subscription.updateMany({
    where: {
      id: subscriptionId,
      status: { in: ["PENDING", "ACTIVE", "OVERDUE"] },
      billingKeyEncrypted: { not: null },
      OR: [{ billingLockUntil: null }, { billingLockUntil: { lt: now } }],
    },
    data: { billingLockUntil: new Date(now.getTime() + LOCK_MS) },
  });
  if (claimed.count !== 1) return "skipped";

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      supplierCompany: {
        include: {
          users: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!subscription) return "skipped";
  const bid = decrypt(subscription.billingKeyEncrypted);
  if (!bid) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "OVERDUE",
        billingLockUntil: null,
        lastBillingError: "빌링키 복호화 실패",
      },
    });
    return "failed";
  }

  const cancelEffectiveAt = subscription.cancelAtPeriodEnd
    ? (subscription.cancelEffectiveAt ??
      subscriptionCancellationEffectiveAt(subscription, now))
    : null;
  if (cancelEffectiveAt && cancelEffectiveAt <= now) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        nextBillingDate: null,
        cancelAtPeriodEnd: false,
        cancelEffectiveAt: null,
        cancelledAt: now,
        billingLockUntil: null,
      },
    });
    return "cancelled";
  }

  if (subscription.nextRetryAt && subscription.nextRetryAt > now) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { billingLockUntil: null },
    });
    return "skipped";
  }
  const periodStart = subscription.nextBillingDate ?? now;
  const periodEnd = addSubscriptionCycle(
    periodStart,
    subscription.cycle,
    subscription.billingAnchorDay ?? undefined,
  );
  const periodKey = subscriptionPeriodKey(periodStart);
  const existing = await prisma.subscriptionPayment.findUnique({
    where: {
      subscriptionId_billingMonth: {
        subscriptionId: subscription.id,
        billingMonth: periodKey,
      },
    },
  });
  if (existing?.status === "PAID") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { nextBillingDate: periodEnd, billingLockUntil: null },
    });
    return "skipped";
  }
  if (existing?.transactionId && existing.merchantOrderId) {
    const reconciled = await queryNicepayPayment(
      existing.transactionId,
      getNicepayBillingConfig(),
    ).catch(() => null);
    if (
      reconciled &&
      matchesApprovedStatus(reconciled, {
        transactionId: existing.transactionId,
        merchantOrderId: existing.merchantOrderId,
        amount: Number(existing.amount),
      })
    ) {
      await markBillingSuccess({
        subscriptionId: subscription.id,
        paymentId: existing.id,
        supplierCompanyId: subscription.supplierCompanyId,
        periodStart,
        periodEnd,
        result: reconciled,
        now,
      });
      if (existing.kind === "INITIAL") {
        await prisma.subscriptionBillingRegistration.updateMany({
          where: {
            subscriptionId: subscription.id,
            mode: "ACTIVATE",
            status: { in: ["PROCESSING", "FAILED"] },
          },
          data: {
            status: "COMPLETED",
            completedAt: now,
            resultCode: String(reconciled.ResultCode ?? "0000"),
            resultMessage: "NICEPAY 거래 조회로 최초 결제 승인 확인",
          },
        });
      }
      return "paid";
    }
  }
  const attempt = (existing?.attemptCount ?? 0) + 1;
                                                                        
                                                             
  const transactionId = createNicepayBillingTid(billingMid);
  const merchantOrderId = billingMoid(subscription.id, periodKey, attempt);
  const payment = await prisma.subscriptionPayment.upsert({
    where: {
      subscriptionId_billingMonth: {
        subscriptionId: subscription.id,
        billingMonth: periodKey,
      },
    },
    update: {
      amount: subscription.price,
      status: "READY",
      provider: "NICEPAY",
      kind: "RENEWAL",
      transactionId,
      merchantOrderId,
      periodStart,
      periodEnd,
      attemptedAt: now,
      attemptCount: attempt,
      failureReason: null,
    },
    create: {
      subscriptionId: subscription.id,
      amount: subscription.price,
      status: "READY",
      billingMonth: periodKey,
      kind: "RENEWAL",
      provider: "NICEPAY",
      transactionId,
      merchantOrderId,
      periodStart,
      periodEnd,
      attemptedAt: now,
      attemptCount: 1,
    },
  });
  const failureCount = subscription.billingFailureCount + 1;
  try {
    const result = await approvedOrReconciled({
      bid,
      transactionId,
      merchantOrderId,
      amount: Number(subscription.price),
      goodsName: subscription.planName,
      identity: billingIdentity(subscription.supplierCompany.users),
    });
    await markBillingSuccess({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      supplierCompanyId: subscription.supplierCompanyId,
      periodStart,
      periodEnd,
      result,
      now,
    });
    return "paid";
  } catch (error) {
    await markBillingFailure({
      subscriptionId: subscription.id,
      paymentId: payment.id,
      supplierCompanyId: subscription.supplierCompanyId,
      failureCount,
      error,
      now,
    });
    return "failed";
  }
}

export async function runDueSubscriptionRenewals(now = new Date()): Promise<{
  due: number;
  paid: number;
  failed: number;
  cancelled: number;
  skipped: number;
}> {
  const due = await prisma.subscription.findMany({
    where: {
      status: { in: ["PENDING", "ACTIVE", "OVERDUE"] },
      billingKeyEncrypted: { not: null },
      nextBillingDate: { lte: now },
      AND: [
        {
          OR: [
            {
              cancelAtPeriodEnd: true,
              cancelEffectiveAt: { lte: now },
            },
            {
              billingFailureCount: { lt: 3 },
              OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
            },
          ],
        },
      ],
    },
    orderBy: { nextBillingDate: "asc" },
    take: 50,
    select: { id: true },
  });
  const counts = {
    due: due.length,
    paid: 0,
    failed: 0,
    cancelled: 0,
    skipped: 0,
  };
  for (const row of due) {
    const result = await chargeSubscription(row.id, now);
    counts[result]++;
  }
  return counts;
}

export async function cancelSubscription(input: {
  subscriptionId: string;
  supplierCompanyId: string;
  mode: "period-end" | "immediate";
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: input.subscriptionId,
      supplierCompanyId: input.supplierCompanyId,
    },
  });
  if (!subscription || subscription.status === "CANCELLED") return;
  if (input.mode === "period-end" && subscription.currentPeriodStart) {
    const effectiveAt = subscriptionCancellationEffectiveAt(subscription, now);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        cancelEffectiveAt: effectiveAt,
      },
    });
    return;
  }
  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        nextBillingDate: null,
        nextRetryAt: null,
        cancelAtPeriodEnd: false,
        cancelEffectiveAt: null,
        cancelledAt: now,
        billingLockUntil: null,
      },
    }),
  ]);
}

export async function removeSubscriptionBillingKey(input: {
  subscriptionId: string;
  supplierCompanyId: string;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: input.subscriptionId,
      supplierCompanyId: input.supplierCompanyId,
    },
  });
  if (!subscription) throw new Error("구독을 찾을 수 없습니다.");
  const bid = decrypt(subscription.billingKeyEncrypted);
  if (!bid) return;
  await removeNicepayBillkey({
    bid,
    merchantOrderId:
      `SUBKEY-REMOVE-${subscription.id}-${subscriptionPeriodKey(now)}`.slice(
        0,
        64,
      ),
    amount: Number(subscription.price),
  });
  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: subscription.status === "CANCELLED" ? "CANCELLED" : "OVERDUE",
        billingKeyEncrypted: null,
        nextRetryAt: null,
        lastBillingError: "결제수단 삭제",
      },
    }),
  ]);
}
