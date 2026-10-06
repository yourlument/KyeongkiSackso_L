import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createNotification, createNotifications } from "@/lib/notifications";

function jsonObject(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Prisma.JsonValue>)
    : {};
}

export async function finalizeNicepayPayment(input: {
  paymentId: string;
  transactionId: string;
  metadata: Record<string, string>;
  paidAt?: Date;
}): Promise<{ orderNo: string; alreadyPaid: boolean }> {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: {
      order: {
        include: {
          items: {
            select: { name: true, supplierCompanyId: true },
          },
        },
      },
    },
  });
  if (!payment) throw new Error("결제 정보를 찾을 수 없습니다.");
  if (payment.status === "PAID") {
    return { orderNo: payment.order.orderNo, alreadyPaid: true };
  }
  if (payment.status !== "READY") {
    throw new Error("승인 가능한 결제 상태가 아닙니다.");
  }

  const previousMetadata = jsonObject(payment.metadata);
  const cartItemIds = Array.isArray(previousMetadata.cartItemIds)
    ? previousMetadata.cartItemIds.filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "READY" },
      data: {
        status: "PAID",
        transactionId: input.transactionId,
        paidAt: input.paidAt ?? new Date(),
        metadata: {
          ...previousMetadata,
          ...input.metadata,
        },
      },
    });
    if (updated.count !== 1) {
      throw new Error("결제 상태가 이미 변경되었습니다.");
    }
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });
    if (cartItemIds.length > 0) {
      await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
    }
  });

  const first = payment.order.items[0]?.name ?? payment.order.orderNo;
  const buyerLabel =
    payment.order.items.length > 1
      ? `${first} 외 ${payment.order.items.length - 1}건`
      : first;

  try {
    await createNotification({
      userId: payment.order.buyerId,
      type: "ORDER_STATUS",
      title: "주문 상태 변경",
      body: `'${buyerLabel}' 주문이 결제완료 처리되었습니다.`,
      link: "/mypage?tab=purchase",
      category: "orderPayment",
    });
  } catch {}

  try {
    const byCompany = new Map<string, string[]>();
    for (const item of payment.order.items) {
      if (!item.supplierCompanyId) continue;
      const names = byCompany.get(item.supplierCompanyId) ?? [];
      names.push(item.name);
      byCompany.set(item.supplierCompanyId, names);
    }
    const supplierUsers = await prisma.user.findMany({
      where: { supplierCompanyId: { in: [...byCompany.keys()] } },
      select: { id: true, supplierCompanyId: true },
    });
    await createNotifications(
      supplierUsers.flatMap((user) => {
        const names = user.supplierCompanyId
          ? byCompany.get(user.supplierCompanyId) ?? []
          : [];
        if (names.length === 0) return [];
        const label =
          names.length > 1 ? `${names[0]} 외 ${names.length - 1}건` : names[0];
        return [
          {
            userId: user.id,
            type: "ORDER_STATUS" as const,
            title: "새 주문 접수",
            body: `'${label}' 주문이 접수되었습니다.`,
            link: `/partner/orders/${payment.orderId}`,
            category: "orderPayment" as const,
          },
        ];
      }),
    );
  } catch {}

  return { orderNo: payment.order.orderNo, alreadyPaid: false };
}

export async function finalizePaymentRefund(input: {
  paymentId: string;
  cancelTransactionId?: string | null;
  source: "nicepay-webhook" | "admin-order" | "admin-refund-request";
  processedBy?: string | null;
  metadata?: Record<string, string | boolean>;
}): Promise<{ orderNo: string; alreadyRefunded: boolean }> {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: { order: { select: { orderNo: true } } },
  });
  if (!payment) throw new Error("결제 정보를 찾을 수 없습니다.");
  if (payment.status !== "PAID" && payment.status !== "REFUNDED") {
    throw new Error("환불 가능한 결제 상태가 아닙니다.");
  }

  const now = new Date();
  const cancelTransactionId = input.cancelTransactionId?.trim() || null;
  const requestKey = `refund:${payment.provider}:${payment.id}`;
  const metadata: Prisma.InputJsonObject = {
    kind: "refund",
    source: input.source,
    ...(input.processedBy ? { refundedBy: input.processedBy } : {}),
    ...(input.metadata ?? {}),
  };
  let alreadyRefunded = payment.status === "REFUNDED";

  await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "PAID" },
      data: { status: "REFUNDED" },
    });
    if (updated.count === 0) {
      const current = await tx.payment.findUnique({
        where: { id: payment.id },
        select: { status: true },
      });
      if (current?.status !== "REFUNDED") {
        throw new Error("결제 상태가 이미 변경되었습니다.");
      }
      alreadyRefunded = true;
    }

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "CANCELLED" },
    });
    await tx.refundRequest.updateMany({
      where: { orderId: payment.orderId, status: "PENDING" },
      data: {
        status: "APPROVED",
        processedAt: now,
        ...(input.processedBy ? { processedBy: input.processedBy } : {}),
      },
    });
    await tx.payment.upsert({
      where: { requestKey },
      create: {
        orderId: payment.orderId,
        provider: payment.provider,
        status: "REFUNDED",
        amount: payment.amount,
        method: payment.method,
        transactionId: cancelTransactionId,
        requestKey,
        metadata,
        paidAt: now,
      },
      update: {
        status: "REFUNDED",
        ...(cancelTransactionId ? { transactionId: cancelTransactionId } : {}),
        metadata,
      },
    });
  });

  return { orderNo: payment.order.orderNo, alreadyRefunded };
}
