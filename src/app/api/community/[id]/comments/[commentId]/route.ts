import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (claims.role !== "SUPPLIER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, commentId } = await params;
  const post = await prisma.post.findUnique({
    where: { id, boardType: "DEMAND", isPublished: true },
    select: { id: true, status: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.status !== "OPEN") return NextResponse.json({ error: "Post closed" }, { status: 400 });

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId: id, parentId: null },
    select: { id: true, authorId: true },
  });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.authorId !== claims.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const content = (body?.content as string | undefined)?.trim();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  await prisma.comment.update({ where: { id: commentId }, data: { content } });

  return NextResponse.json({ ok: true, id: commentId });
}
