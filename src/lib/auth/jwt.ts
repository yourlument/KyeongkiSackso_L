import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const enc = new TextEncoder();
const accessSecret = enc.encode(process.env.JWT_ACCESS_SECRET ?? "dev-access-secret");
const refreshSecret = enc.encode(process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret");

export const ACCESS_TTL = "30m";
export const REFRESH_TTL_DAYS = 14;

export interface AccessClaims {
  sub: string;
  role: UserRole;
}

export async function signAccessToken(claims: AccessClaims): Promise<string> {
  return new SignJWT({ role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(accessSecret);
}

export async function signRefreshToken(userId: string, jti: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_DAYS}d`)
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return { sub: payload.sub as string, role: payload.role as UserRole };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ sub: string; jti: string } | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return { sub: payload.sub as string, jti: payload.jti as string };
  } catch {
    return null;
  }
}
