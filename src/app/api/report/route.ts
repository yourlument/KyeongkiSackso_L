import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as Record<string, string>;
  const { kind, category, title, content, contactName, contactOrg, contactPhone, contactEmail } = body;

  if (!kind || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요" }, { status: 400 });
  }

  if (kind === "문의") {
    await prisma.inquiry.create({
      data: {
        userId: claims.sub,
        title: title.trim(),
        content: content.trim(),
        category: category || null,
        contactName: contactName?.trim() || null,
        contactOrg: contactOrg?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
      },
    });
  } else if (kind === "신고") {
    await prisma.report.create({
      data: {
        reporterId: claims.sub,
        title: title.trim(),
        reason: content.trim(),
        category: category || null,
        targetType: "GENERAL",
        contactName: contactName?.trim() || null,
        contactOrg: contactOrg?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
      },
    });
  } else {
    return NextResponse.json({ error: "잘못된 유형입니다" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
