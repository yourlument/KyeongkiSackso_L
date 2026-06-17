import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const input = z.object({
  id: z.string().min(1),
  type: z.enum(["신고", "문의"]),
  answer: z.string().min(1),
});

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "답변 내용을 확인해 주세요" }, { status: 400 });
  const { id, type, answer } = parsed.data;
  const now = new Date();

  if (type === "신고") {
    const r = await prisma.report.findUnique({ where: { id }, select: { id: true } });
    if (!r) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });
    await prisma.report.update({ where: { id }, data: { answer, answeredAt: now, answeredBy: "관리자", status: "RESOLVED" } });
  } else {
    const q = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!q) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });
    await prisma.inquiry.update({ where: { id }, data: { answer, answeredAt: now, answeredBy: "관리자", status: "ANSWERED" } });
  }
  return NextResponse.json({ status: "완료" });
}
