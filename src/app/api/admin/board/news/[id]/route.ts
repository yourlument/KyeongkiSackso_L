import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const { id } = await params;
  const n = await prisma.news.findUnique({ where: { id }, select: { id: true } });
  if (!n) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });

  await prisma.news.delete({ where: { id } });
  return NextResponse.json({ status: "삭제" });
}
