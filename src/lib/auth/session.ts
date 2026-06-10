import { cookies } from "next/headers";
import { verifyAccessToken, REFRESH_TTL_DAYS, type AccessClaims } from "./jwt";

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
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}
