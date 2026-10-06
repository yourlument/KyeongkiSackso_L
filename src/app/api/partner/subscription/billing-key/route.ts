import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { removeSubscriptionBillingKey } from "@/lib/subscription-billing";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const claims = await getSessionClaims();
  if (!claims)
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  if (claims.role !== "SUPPLIER")
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { supplierCompanyId: true },
  });
  if (!user?.supplierCompanyId)
    return NextResponse.json(
      { message: "공급업체 정보를 찾을 수 없습니다." },
      { status: 404 },
    );
  const subscription = await prisma.subscription.findFirst({
    where: {
      supplierCompanyId: user.supplierCompanyId,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!subscription)
    return NextResponse.json(
      { message: "구독을 찾을 수 없습니다." },
      { status: 404 },
    );
  try {
    await removeSubscriptionBillingKey({
      subscriptionId: subscription.id,
      supplierCompanyId: user.supplierCompanyId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "결제수단 삭제에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
