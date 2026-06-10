import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { issueTokens } from "@/lib/auth/token-service";
import { setAuthCookies } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { decrypt } from "@/lib/crypto/pii";
import { rlCount, rlIncr, rlReset } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {

    return NextResponse.json(
      { message: "이메일 또는 비밀번호가 올바르지 않습니다.\n다시 확인해주세요." },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "").trim() || "local";
  const rlKey = `login:${ip}:${email}`;
  if ((await rlCount(rlKey)) >= 10) {
    return NextResponse.json(
      { message: "이메일 또는 비밀번호가 올바르지 않습니다.\n다시 확인해주세요." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { supplierCompany: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await rlIncr(rlKey, 600);
    return NextResponse.json(
      { message: "이메일 또는 비밀번호가 올바르지 않습니다.\n다시 확인해주세요." },
      { status: 401 },
    );
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json({ message: "이용이 제한된 계정입니다" }, { status: 403 });
  }

  if (user.role === "SUPPLIER" && user.supplierCompany?.approvalStatus !== "APPROVED") {
    return NextResponse.json(
      { message: "관리자 승인 대기 중인 계정입니다" },
      { status: 403 },
    );
  }

  const { accessToken, refreshToken } = await issueTokens(user.id, user.role);
  await setAuthCookies(accessToken, refreshToken);
  await rlReset(rlKey);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: decrypt(user.name), role: user.role },
  });
}
