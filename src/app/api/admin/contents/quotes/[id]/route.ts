import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

async function handle(id: string) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const q = await prisma.quoteRequest.findUnique({ where: { id }, select: { id: true } });
  if (!q) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });

  await prisma.quoteRequest.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(id);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return handle(id);
}
