import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

function safeVideoUrl(u?: string): string | null {
  const t = u?.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) || t.startsWith("/") ? t : null;
}

export const dynamic = "force-dynamic";

const attachmentSchema = z.object({ url: z.string().min(1), name: z.string().min(1) });

const bodySchema = z.object({
  category: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  videoUrl: z.string().trim().optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export async function POST(req: NextRequest) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role === "SUPPLIER") return NextResponse.json({ error: "공급업체 계정은 정보공유 기능을 이용할 수 없습니다" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요" }, { status: 400 });
  }
  const { category, title, content, videoUrl, attachments } = parsed.data;
  const files = (attachments ?? []).filter((a) => a.url && a.name).slice(0, 10);

  const post = await prisma.post.create({
    data: {
      boardType: "INFO",
      authorId: claims.sub,
      category: category ?? null,
      title,
      content: DOMPurify.sanitize(content),
      videoUrl: safeVideoUrl(videoUrl),
      isPublished: true,
      attachments: files.length
        ? { create: files.map((a) => ({ fileUrl: a.url, fileName: a.name })) }
        : undefined,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}
