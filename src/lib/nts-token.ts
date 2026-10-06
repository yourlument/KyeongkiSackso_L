import { SignJWT, jwtVerify } from "jose";

const enc = new TextEncoder();
const secret = enc.encode(process.env.JWT_ACCESS_SECRET ?? "dev-access-secret");

const TTL = "30m";

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

export async function signBizVerification(bizNo: string, status: string): Promise<string> {
  return new SignJWT({ bizNo: digitsOnly(bizNo), status })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(secret);
}

export async function readBizVerification(
  token: string | undefined | null,
  bizNo: string,
): Promise<{ status: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.bizNo !== digitsOnly(bizNo)) return null;
    return { status: String(payload.status ?? "") };
  } catch {
    return null;
  }
}
