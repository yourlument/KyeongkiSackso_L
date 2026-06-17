import crypto from "crypto";
import { prisma } from "@/lib/db";
import { signAccessToken, signRefreshToken, REFRESH_TTL_DAYS } from "./jwt";
import type { UserRole } from "@prisma/client";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function issueTokens(userId: string, role: UserRole) {
  const jti = crypto.randomUUID();
  const accessToken = await signAccessToken({ sub: userId, role });
  const refreshToken = await signRefreshToken(userId, jti, role);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash: sha256(refreshToken), expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function findValidRefreshToken(refreshToken: string) {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(refreshToken) },
  });
  if (!record || record.revokedAt || record.expiresAt < new Date()) return null;
  return record;
}

export async function rotateRefreshToken(oldRefreshToken: string, userId: string, role: UserRole) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(oldRefreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return issueTokens(userId, role);
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
