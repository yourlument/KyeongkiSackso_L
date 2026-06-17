import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { findValidRefreshToken, rotateRefreshToken } from "@/lib/auth/token-service";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/session";
import { decrypt } from "@/lib/crypto/pii";

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ message: "세션이 만료되었습니다" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refresh);
  const record = payload ? await findValidRefreshToken(refresh) : null;
  if (!payload || !record) {
    await clearAuthCookies();
    return NextResponse.json({ message: "세션이 만료되었습니다" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") {
    await clearAuthCookies();
    return NextResponse.json({ message: "세션이 만료되었습니다" }, { status: 401 });
  }

  const { accessToken, refreshToken } = await rotateRefreshToken(refresh, user.id, user.role);
  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: decrypt(user.name), role: user.role },
  });
}
