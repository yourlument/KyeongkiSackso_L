import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  type: z.enum(["LIKE", "DISLIKE"]),
  commentId: z.string().min(1).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  const { type, commentId } = parsed.data;
  const userId = claims.sub;

  if (commentId) {
    const post = await prisma.post.findUnique({
      where: { id, boardType: "INFO", isPublished: true },
      select: { id: true },
    });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const comment = await prisma.comment.findUnique({
      where: { id: commentId, postId: id },
      select: { id: true },
    });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.commentReaction.findUnique({
        where: { commentId_userId: { commentId, userId } },
        select: { type: true },
      });
      let myReaction: "LIKE" | "DISLIKE" | null;
      if (!existing) {
        await tx.commentReaction.create({ data: { commentId, userId, type } });
        myReaction = type;
      } else if (existing.type === type) {
        await tx.commentReaction.delete({ where: { commentId_userId: { commentId, userId } } });
        myReaction = null;
      } else {
        await tx.commentReaction.update({ where: { commentId_userId: { commentId, userId } }, data: { type } });
        myReaction = type;
      }
      const likes = await tx.commentReaction.count({ where: { commentId, type: "LIKE" } });
      await tx.comment.update({ where: { id: commentId }, data: { likes } });
      return { likes, myReaction };
    });

    return NextResponse.json({ ok: true, likes: result.likes, myReaction: result.myReaction });
  }

  const post = await prisma.post.findUnique({
    where: { id, boardType: "INFO", isPublished: true },
    select: { id: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.postReaction.findUnique({
      where: { postId_userId: { postId: id, userId } },
      select: { type: true },
    });
    let myReaction: "LIKE" | "DISLIKE" | null;
    if (!existing) {
      await tx.postReaction.create({ data: { postId: id, userId, type } });
      myReaction = type;
    } else if (existing.type === type) {
      await tx.postReaction.delete({ where: { postId_userId: { postId: id, userId } } });
      myReaction = null;
    } else {
      await tx.postReaction.update({ where: { postId_userId: { postId: id, userId } }, data: { type } });
      myReaction = type;
    }
    const [likes, dislikes] = await Promise.all([
      tx.postReaction.count({ where: { postId: id, type: "LIKE" } }),
      tx.postReaction.count({ where: { postId: id, type: "DISLIKE" } }),
    ]);
    await tx.post.update({ where: { id }, data: { likes, dislikes } });
    return { likes, dislikes, myReaction };
  });

  return NextResponse.json({ ok: true, likes: result.likes, dislikes: result.dislikes, myReaction: result.myReaction });
}
