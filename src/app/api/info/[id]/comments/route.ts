import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  content: z.string().trim().min(1),
  parentId: z.string().min(1).optional(),
});

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id, boardType: "INFO", isPublished: true },
    select: { id: true, authorId: true, title: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "내용을 입력하세요" }, { status: 400 });
  const { content, parentId } = parsed.data;

  let parentAuthorId: string | null = null;
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId, postId: id },
      select: { id: true, authorId: true },
    });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    parentAuthorId = parent.authorId;
  }

  const comment = await prisma.comment.create({
    data: { postId: id, authorId: claims.sub, content, parentId: parentId ?? null },
    select: { id: true, createdAt: true, likes: true },
  });

  try {
    const target = parentId ? parentAuthorId : post.authorId;
    if (target && target !== claims.sub) {
      await createNotification({
        userId: target,
        type: "BOARD_REPLY",
        title: "정보 공유 라운지 댓글",
        body: `'${post.title}'에 새 댓글이 달렸습니다.`,
        link: `/info/${id}`,
      });
    }
  } catch {}

  return NextResponse.json({
    ok: true,
    id: comment.id,
    author: "익명",
    date: ymd(comment.createdAt),
    likes: comment.likes,
  });
}
