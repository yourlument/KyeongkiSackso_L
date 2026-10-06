import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { cancelSubscription } from "@/lib/subscription-billing";

export const dynamic = "force-dynamic";

const schema = z.object({ mode: z.literal("period-end") });

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims)
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  if (claims.role !== "SUPPLIER")
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success)
    return NextResponse.json(
      { message: "입력값을 확인해 주세요." },
      { status: 400 },
    );
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
      status: { not: "CANCELLED" },
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
    await cancelSubscription({
      subscriptionId: subscription.id,
      supplierCompanyId: user.supplierCompanyId,
      mode: body.data.mode,
    });
    return NextResponse.json({ ok: true, mode: body.data.mode });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "구독 해지에 실패했습니다.",
      },
      { status: 502 },
    );
  }
}
