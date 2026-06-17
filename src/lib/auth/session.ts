import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken, REFRESH_TTL_DAYS, type AccessClaims } from "./jwt";

export const ACCESS_COOKIE = "korink_at";
export const REFRESH_COOKIE = "korink_rt";

const isProd = process.env.NODE_ENV === "production";
const cookieSecure = isProd && process.env.ALLOW_INSECURE_COOKIE !== "1";

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60,
  });
  jar.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getSessionClaims(): Promise<AccessClaims | null> {
  const jar = await cookies();

  const access = jar.get(ACCESS_COOKIE)?.value;
  if (access) {
    const claims = await verifyAccessToken(access);
    if (claims) return claims;
  }

  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;
  const payload = await verifyRefreshToken(refresh);
  if (!payload?.role) return null;
  return { sub: payload.sub, role: payload.role };
}
