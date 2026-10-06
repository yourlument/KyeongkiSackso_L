import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { reactivateSubscription } from "@/lib/subscription-billing";

export const dynamic = "force-dynamic";

export async function POST() {
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
      status: "CANCELLED",
      billingKeyEncrypted: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!subscription)
    return NextResponse.json(
      { message: "등록된 카드로 재가입할 수 있는 이용권이 없습니다." },
      { status: 409 },
    );

  try {
    const result = await reactivateSubscription({
      subscriptionId: subscription.id,
      supplierCompanyId: user.supplierCompanyId,
    });
    return NextResponse.json({ ok: result === "paid", result });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "등록된 카드로 이용권 결제에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
