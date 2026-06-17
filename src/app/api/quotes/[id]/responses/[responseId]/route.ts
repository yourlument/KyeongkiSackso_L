import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id, responseId } = await params;

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    select: { officialId: true },
  });
  if (!quote) return NextResponse.json({ error: "공고를 찾을 수 없습니다" }, { status: 404 });
  if (quote.officialId !== claims.sub) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as { status?: string };
  const ALLOWED = ["SUBMITTED", "UNDER_REVIEW", "AWARDED", "REJECTED"];
  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "유효하지 않은 상태입니다" }, { status: 400 });
  }

  await prisma.quoteResponse.update({
    where: { id: responseId },
    data: { status: body.status as never },
  });

  return NextResponse.json({ ok: true });
}
