import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionClaims } from "@/lib/auth/session";
import { decrypt } from "@/lib/crypto/pii";
import { prisma } from "@/lib/db";
import { createNicepayBillkeyCheckout } from "@/lib/nicepay/billing";
import { getPublicAppUrl } from "@/lib/nicepay/config";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-billing";

export const dynamic = "force-dynamic";

const schema = z.object({
  cycle: z.enum(["MONTHLY", "ANNUAL"]),
  requestKey: z.string().uuid(),
});

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims)
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  if (claims.role !== "SUPPLIER")
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { message: "입력값을 확인해 주세요." },
      { status: 400 },
    );

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      supplierCompanyId: true,
    },
  });
  if (!user?.supplierCompanyId) {
    return NextResponse.json(
      { message: "공급업체 정보를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  const now = new Date();
  const existingRequest =
    await prisma.subscriptionBillingRegistration.findUnique({
      where: { requestKey: parsed.data.requestKey },
    });
  let registration = existingRequest;
  if (registration) {
    if (
      registration.supplierCompanyId !== user.supplierCompanyId ||
      registration.status !== "READY" ||
      registration.expiresAt <= now
    ) {
      return NextResponse.json(
        { message: "이미 처리된 카드 등록 요청입니다." },
        { status: 409 },
      );
    }
  } else {
    const subscription = await prisma.subscription.findFirst({
      where: {
        supplierCompanyId: user.supplierCompanyId,
        OR: [
          { status: { not: "CANCELLED" } },
          { status: "CANCELLED", billingKeyEncrypted: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
                                                                           
                                                                           
                                                            
    const mode =
      subscription?.billingKeyEncrypted && subscription.status !== "CANCELLED"
        ? "REPLACE"
        : "ACTIVATE";
    const cycle = subscription?.billingKeyEncrypted
      ? subscription.cycle
      : parsed.data.cycle;
    const amount = subscription?.billingKeyEncrypted
      ? Number(subscription.price)
      : SUBSCRIPTION_PLANS[cycle].amount;
    registration = await prisma.subscriptionBillingRegistration.create({
      data: {
        requestKey: parsed.data.requestKey,
        supplierCompanyId: user.supplierCompanyId,
        subscriptionId: subscription?.id,
        requestedById: user.id,
        cycle,
        amount,
        mode,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      },
    });
  }

  const plan = SUBSCRIPTION_PLANS[registration.cycle];
  const payment = createNicepayBillkeyCheckout({
    registrationId: registration.id,
    amount: Number(registration.amount),
    goodsName: plan.planName,
    buyerName: decrypt(user.name) ?? "",
    buyerTel: decrypt(user.phone) ?? "",
    buyerEmail: user.email,
    returnUrl: `${getPublicAppUrl(req.url)}/api/partner/subscription/billing/register/callback`,
  });
  return NextResponse.json({ payment });
}
