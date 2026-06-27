import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";
import { hashPassword, verifyPassword, isValidPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: "새 비밀번호가 일치하지 않습니다." }, { status: 400 });
  }

  if (!isValidPassword(newPassword)) {
    return NextResponse.json(
      { message: "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json(
      { message: "현재 비밀번호가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: claims.sub },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
