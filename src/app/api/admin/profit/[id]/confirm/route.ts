import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const { id } = await params;

  const sub = await prisma.subscription.findFirst({
    where: { supplierCompanyId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, price: true, status: true },
  });
  if (!sub) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });
  if (sub.status === "ACTIVE" || sub.status === "CANCELLED") {
    return NextResponse.json({ message: "결제 확인 대상이 아니에요" }, { status: 409 });
  }

  const month = ym(new Date());
  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({ where: { id: sub.id }, data: { status: "ACTIVE" } });
    const existing = await tx.subscriptionPayment.findFirst({
      where: { subscriptionId: sub.id, billingMonth: month },
    });
    if (!existing) {
      await tx.subscriptionPayment.create({
        data: {
          subscriptionId: sub.id,
          amount: sub.price,
          status: "PAID",
          billingMonth: month,
          paidAt: new Date(),
        },
      });
    }
  });

  return NextResponse.json({ ok: true, pay: "결제완료" });
}
