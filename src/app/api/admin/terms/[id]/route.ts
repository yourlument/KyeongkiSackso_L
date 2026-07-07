import { NextResponse } from "next/server";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const patchInput = z.object({
  title: z.string().min(1),
  summary: z.string(),
  contentHtml: z.string(),
});

async function guard(): Promise<NextResponse | null> {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  const term = await prisma.term.findUnique({
    where: { id },
    select: { id: true, type: true, title: true, summary: true, content: true, contentHtml: true, required: true, version: true },
  });
  if (!term) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });
  return NextResponse.json(term);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" }, { status: 400 });
  }

  const exists = await prisma.term.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });

  const { title, summary, contentHtml } = parsed.data;
  await prisma.term.update({
    where: { id },
    data: { title, summary, contentHtml: DOMPurify.sanitize(contentHtml) },
  });
  return NextResponse.json({ ok: true });
}
