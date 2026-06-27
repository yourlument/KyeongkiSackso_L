import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    orderPayment?: boolean; quoteNotice?: boolean; delivery?: boolean; marketing?: boolean;
  };
  const data = {
    orderPayment: Boolean(body.orderPayment),
    quoteNotice: Boolean(body.quoteNotice),
    delivery: Boolean(body.delivery),
    marketing: Boolean(body.marketing),
  };

  await prisma.userNotificationSetting.upsert({
    where: { userId: claims.sub },
    update: data,
    create: { userId: claims.sub, ...data },
  });

  return NextResponse.json({ ok: true });
}
