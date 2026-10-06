import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { storage, storageKeyFromUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

const attachmentSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
});

const bodySchema = z.object({
  category: z.string().trim().min(1).nullable().optional(),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  videoUrl: z.string().trim().nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
});

function safeVideoUrl(value?: string | null): string | null {
  const text = value?.trim();
  if (!text) return null;
  return /^https?:\/\//i.test(text) || text.startsWith("/") ? text : null;
}

function htmlHasContent(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length > 0;
}

async function ownedInfoPost(id: string, userId: string) {
  return prisma.post.findFirst({
    where: {
      id,
      boardType: "INFO",
      authorId: userId,
      isPublished: true,
    },
    select: {
      id: true,
      attachments: { select: { fileUrl: true } },
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role === "SUPPLIER") {
    return NextResponse.json(
      { error: "공급업체 계정은 정보공유 기능을 이용할 수 없습니다" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const owned = await ownedInfoPost(id, claims.sub);
  if (!owned) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success || !htmlHasContent(parsed.data?.content ?? "")) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요" }, { status: 400 });
  }

  const { category, title, content, videoUrl, attachments } = parsed.data;
  const files = (attachments ?? []).slice(0, 10);
  const retainedUrls = new Set(files.map((file) => file.url));
  const removedUrls = attachments === undefined
    ? []
    : Array.from(
        new Set(
          owned.attachments
            .map((attachment) => attachment.fileUrl)
            .filter((url) => !retainedUrls.has(url)),
        ),
      );
  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id },
      data: {
        category: category ?? null,
        title,
        content: DOMPurify.sanitize(content),
        videoUrl: safeVideoUrl(videoUrl),
      },
    });
    if (attachments !== undefined) {
      await tx.postAttachment.deleteMany({ where: { postId: id } });
      if (files.length) {
        await tx.postAttachment.createMany({
          data: files.map((file) => ({
            postId: id,
            fileUrl: file.url,
            fileName: file.name,
          })),
        });
      }
    }
  });

  let deletedStoredFiles = 0;
  for (const url of removedUrls) {
    const stillReferenced = await prisma.postAttachment.count({ where: { fileUrl: url } });
    const key = stillReferenced === 0 ? storageKeyFromUrl(url) : null;
    if (!key) continue;
    await storage.remove(key);
    deletedStoredFiles += 1;
  }

  return NextResponse.json({
    ok: true,
    deletedAttachments: removedUrls.length,
    deletedStoredFiles,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role === "SUPPLIER") {
    return NextResponse.json(
      { error: "공급업체 계정은 정보공유 기능을 이용할 수 없습니다" },
      { status: 403 },
    );
  }
  const { id } = await params;
  if (!(await ownedInfoPost(id, claims.sub))) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }
  await prisma.post.update({
    where: { id },
    data: { isPublished: false },
  });
  return NextResponse.json({ ok: true });
}
