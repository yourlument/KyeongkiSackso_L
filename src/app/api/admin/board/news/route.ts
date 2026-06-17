import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const input = z.object({
  type: z.enum(["NOTICE", "EVENT"]),
  title: z.string().min(1),
  content: z.string(),
  status: z.enum(["PUBLISHED", "DRAFT"]),
  isPinned: z.boolean(),
  videoUrl: z.string().optional(),
  attachments: z
    .array(z.object({ fileName: z.string(), fileUrl: z.string(), fileSize: z.number().optional() }))
    .optional(),
});

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "제목을 입력해 주세요" }, { status: 400 });
  const { type, title, content, status, isPinned, videoUrl, attachments } = parsed.data;

  const news = await prisma.news.create({
    data: {
      type,
      title,
      content,
      status,
      isPinned,
      authorName: "KORLINK 관리자",
      videoUrl: videoUrl?.trim() ? videoUrl.trim() : null,
      attachments: attachments?.length
        ? { create: attachments.map((a) => ({ fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize ?? null })) }
        : undefined,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: news.id });
}
