import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const patchInput = z.object({
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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const { id } = await params;
  const n = await prisma.news.findUnique({
    where: { id },
    include: { attachments: { select: { fileName: true, fileUrl: true, fileSize: true } } },
  });
  if (!n) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });

  return NextResponse.json({
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    status: n.status,
    isPinned: n.isPinned,
    videoUrl: n.videoUrl ?? "",
    attachments: n.attachments.map((a) => ({
      fileName: a.fileName,
      fileUrl: a.fileUrl,
      fileSize: a.fileSize ?? 0,
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "제목을 입력해 주세요" }, { status: 400 });
  const { type, title, content, status, isPinned, videoUrl, attachments } = parsed.data;

  const n = await prisma.news.findUnique({ where: { id }, select: { id: true } });
  if (!n) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.news.update({
      where: { id },
      data: {
        type,
        title,
        content,
        status,
        isPinned,
        videoUrl: videoUrl?.trim() ? videoUrl.trim() : null,
      },
    });
    await tx.newsAttachment.deleteMany({ where: { newsId: id } });
    if (attachments?.length) {
      await tx.newsAttachment.createMany({
        data: attachments.map((a) => ({
          newsId: id,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileSize: a.fileSize ?? null,
        })),
      });
    }
  });

  return NextResponse.json({ id });
}

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
