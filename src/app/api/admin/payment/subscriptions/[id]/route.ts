import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTIONS = ["confirm-payment", "suspend", "unsuspend"] as const;
type Action = (typeof ACTIONS)[number];

function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action: Action | undefined = body?.action;
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ message: "유효하지 않은 요청입니다" }, { status: 400 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { id },
    select: { id: true, status: true, price: true },
  });
  if (!sub) return NextResponse.json({ message: "구독을 찾을 수 없습니다" }, { status: 404 });

  if (action === "suspend") {
    await prisma.subscription.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json({ ok: true, status: "CANCELLED" });
  }

  if (action === "unsuspend") {
    await prisma.subscription.update({ where: { id }, data: { status: "ACTIVE" } });
    return NextResponse.json({ ok: true, status: "ACTIVE" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({ where: { id }, data: { status: "ACTIVE" } });
    await tx.subscriptionPayment.create({
      data: {
        subscriptionId: id,
        amount: sub.price,
        status: "PAID",
        billingMonth: ym(new Date()),
        paidAt: new Date(),
      },
    });
  });

  return NextResponse.json({ ok: true, status: "ACTIVE" });
}
