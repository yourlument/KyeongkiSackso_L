import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const editSchema = z.object({
  title: z.string().trim().min(1).optional(),
  budget: z.number().int().nonnegative().nullable().optional(),
  dueDate: z.string().optional(),
  deliveryCondition: z.string().optional(),
});

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({ where: { id }, select: { officialId: true, status: true } });
  if (!quote) return NextResponse.json({ error: "존재하지 않는 공고입니다" }, { status: 404 });
  if (quote.officialId !== claims.sub) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  if (!["DRAFT", "OPEN"].includes(quote.status)) {
    return NextResponse.json({ error: "검토 중이거나 마감된 공고는 삭제할 수 없습니다" }, { status: 409 });
  }

  await prisma.quoteRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id } = await params;
  const quote = await prisma.quoteRequest.findUnique({ where: { id }, select: { officialId: true, status: true } });
  if (!quote) return NextResponse.json({ error: "존재하지 않는 공고입니다" }, { status: 404 });
  if (quote.officialId !== claims.sub) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as { status?: string } & Record<string, unknown>;

  if (typeof body.status === "string") {
    const ALLOWED = ["OPEN", "REVIEWING", "CLOSED", "AWARDED"];
    if (!ALLOWED.includes(body.status)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다" }, { status: 400 });
    }
    await prisma.quoteRequest.update({ where: { id }, data: { status: body.status as never } });
    return NextResponse.json({ ok: true });
  }

  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요" }, { status: 400 });
  }
  if (quote.status !== "OPEN") {
    return NextResponse.json({ error: "공고중 상태에서만 수정할 수 있습니다" }, { status: 409 });
  }

  const data: Prisma.QuoteRequestUpdateInput = {};
  const { title, budget, dueDate, deliveryCondition } = parsed.data;
  if (title !== undefined) data.title = title;
  if (budget !== undefined) {
    data.budget = budget === null ? null : new Prisma.Decimal(budget);
    data.budgetTbd = budget === null;
  }
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (deliveryCondition !== undefined) data.deliveryCondition = deliveryCondition || null;

  await prisma.quoteRequest.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
