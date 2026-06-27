import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotifications } from "@/lib/notifications";

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

  const target = await prisma.quoteResponse.findFirst({
    where: { id: responseId, quoteRequestId: id },
    select: { id: true },
  });
  if (!target) return NextResponse.json({ error: "제안서를 찾을 수 없습니다" }, { status: 404 });

  if (body.status === "AWARDED") {
    await prisma.$transaction([
      prisma.quoteResponse.update({ where: { id: responseId }, data: { status: "AWARDED" } }),
      prisma.quoteResponse.updateMany({
        where: { quoteRequestId: id, id: { not: responseId } },
        data: { status: "REJECTED" },
      }),
      prisma.quoteRequest.update({
        where: { id },
        data: { awardedResponseId: responseId, status: "AWARDED" },
      }),
    ]);
  } else {
    await prisma.quoteResponse.update({
      where: { id: responseId },
      data: { status: body.status as never },
    });
  }

  if (body.status === "AWARDED") {
    try {
      const resp = await prisma.quoteResponse.findUnique({
        where: { id: responseId },
        select: { supplierCompanyId: true, quoteRequest: { select: { title: true } } },
      });
      if (resp) {
        const users = await prisma.user.findMany({
          where: { supplierCompanyId: resp.supplierCompanyId },
          select: { id: true },
        });
        await createNotifications(
          users.map((u) => ({
            userId: u.id,
            type: "QUOTE_AWARDED" as const,
            title: "견적 선정 결과",
            body: `'${resp.quoteRequest.title}' 견적에 귀사가 선정되었습니다.`,
            link: "/partner/quotes",
            category: "quoteNotice" as const,
          })),
        );
      }
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
