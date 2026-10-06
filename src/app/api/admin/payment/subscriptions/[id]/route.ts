import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  cancelSubscription,
  subscriptionPeriodKey,
} from "@/lib/subscription-billing";

export const dynamic = "force-dynamic";

const ACTIONS = ["confirm-payment", "suspend", "unsuspend"] as const;
type Action = (typeof ACTIONS)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims)
    return NextResponse.json(
      { message: "로그인이 필요합니다" },
      { status: 401 },
    );
  if (claims.role !== "ADMIN")
    return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action: Action | undefined = body?.action;
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json(
      { message: "유효하지 않은 요청입니다" },
      { status: 400 },
    );
  }

  const sub = await prisma.subscription.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      price: true,
      supplierCompanyId: true,
      billingProvider: true,
      billingKeyEncrypted: true,
      currentPeriodStart: true,
      nextBillingDate: true,
    },
  });
  if (!sub)
    return NextResponse.json(
      { message: "구독을 찾을 수 없습니다" },
      { status: 404 },
    );

  if (action === "suspend") {
    if (sub.billingKeyEncrypted) {
      try {
        await cancelSubscription({
          subscriptionId: id,
          supplierCompanyId: sub.supplierCompanyId,
          mode: "immediate",
        });
      } catch (error) {
        return NextResponse.json(
          {
            message:
              error instanceof Error
                ? error.message
                : "NICEPAY 구독 해지에 실패했습니다",
          },
          { status: 502 },
        );
      }
    } else {
      await prisma.subscription.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          nextBillingDate: null,
        },
      });
    }
    return NextResponse.json({ ok: true, status: "CANCELLED" });
  }

  if (action === "unsuspend") {
    const resumable = Boolean(sub.billingKeyEncrypted);
    if (resumable) {
      await prisma.subscription.update({
        where: { id },
        data: { status: "ACTIVE" },
      });
    }
    return NextResponse.json({
      ok: true,
      status: resumable ? "ACTIVE" : sub.status,
      message: resumable
        ? undefined
        : "NICEPAY 구독은 공급업체가 카드를 다시 등록해야 재개할 수 있습니다",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({ where: { id }, data: { status: "ACTIVE" } });
    const billingMonth = subscriptionPeriodKey(
      sub.currentPeriodStart ?? sub.nextBillingDate ?? new Date(),
    );
    await tx.subscriptionPayment.upsert({
      where: {
        subscriptionId_billingMonth: { subscriptionId: id, billingMonth },
      },
      update: { status: "PAID", paidAt: new Date(), failureReason: null },
      create: {
        subscriptionId: id,
        amount: sub.price,
        status: "PAID",
        billingMonth,
        paidAt: new Date(),
      },
    });
  });

  return NextResponse.json({ ok: true, status: "ACTIVE" });
}
