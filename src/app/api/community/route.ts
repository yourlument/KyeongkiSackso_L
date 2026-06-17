import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

function htmlHasContent(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}

type Attachment = { url: string; name: string };

export async function POST(req: NextRequest) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") {
    return NextResponse.json({ error: "공무원 계정만 등록할 수 있습니다" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string; content?: string; videoUrl?: string; attachments?: Attachment[];
  };
  const title = (body.title ?? "").trim();
  const content = body.content ?? "";
  if (!title) return NextResponse.json({ error: "제목을 입력하세요" }, { status: 400 });
  if (!htmlHasContent(content)) return NextResponse.json({ error: "내용을 입력하세요" }, { status: 400 });

  const attachments = (body.attachments ?? []).filter((a) => a?.url && a?.name).slice(0, 10);

  const post = await prisma.post.create({
    data: {
      boardType: "DEMAND",
      authorId: claims.sub,
      title,
      content,
      videoUrl: body.videoUrl?.trim() || null,
      status: "OPEN",
      isPublished: true,
      attachments: attachments.length
        ? { create: attachments.map((a) => ({ fileUrl: a.url, fileName: a.name })) }
        : undefined,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ id: post.id, status: post.status }, { status: 201 });
}
