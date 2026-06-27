import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionClaims, clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/session";
import { revokeRefreshToken } from "@/lib/auth/token-service";

export const dynamic = "force-dynamic";

export async function POST() {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: claims.sub },
    data: { status: "WITHDRAWN", deletedAt: new Date() },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: claims.sub, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const jar = await cookies();
  const rt = jar.get(REFRESH_COOKIE)?.value;
  if (rt) await revokeRefreshToken(rt).catch(() => {});
  await clearAuthCookies();

  return NextResponse.json({ ok: true });
}
