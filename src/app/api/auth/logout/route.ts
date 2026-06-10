import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/session";
import { revokeRefreshToken } from "@/lib/auth/token-service";

export async function POST() {
  const jar = await cookies();
  const rt = jar.get(REFRESH_COOKIE)?.value;
  if (rt) await revokeRefreshToken(rt).catch(() => {});
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
