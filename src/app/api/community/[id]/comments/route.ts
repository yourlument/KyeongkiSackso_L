import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id, boardType: "DEMAND", isPublished: true },
    select: { id: true, status: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const content = (body?.content as string | undefined)?.trim();
  const parentId = (body?.parentId as string | undefined) ?? null;

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  if (!parentId) {
    if (claims.role !== "SUPPLIER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (post.status !== "OPEN") return NextResponse.json({ error: "Post closed" }, { status: 400 });
  } else {
    if (claims.role !== "OFFICIAL") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const parent = await prisma.comment.findUnique({
      where: { id: parentId, postId: id },
      select: { id: true },
    });
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId: id, authorId: claims.sub, content, parentId },
    include: {
      author: {
        select: { name: true, departmentName: true, supplierCompany: { select: { name: true } } },
      },
    },
  });

  const displayName = parentId
    ? [comment.author.departmentName, comment.author.name].filter(Boolean).join(" ")
    : (comment.author.supplierCompany?.name ?? comment.author.name);

  return NextResponse.json({
    ok: true,
    id: comment.id,
    name: displayName,
    date: comment.createdAt.toISOString().slice(0, 10),
  });
}
