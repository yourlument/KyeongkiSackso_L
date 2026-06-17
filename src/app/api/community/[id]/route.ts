import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

async function getPost(id: string) {
  return prisma.post.findUnique({ where: { id, boardType: "DEMAND" }, select: { id: true, authorId: true, isPublished: true } });
}

function htmlHasContent(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}

type Attachment = { url: string; name: string };

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPost(id);
  if (!post || !post.isPublished) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== claims.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    title?: string; content?: string; videoUrl?: string; attachments?: Attachment[];
  };
  const title = (body.title ?? "").trim();
  const content = body.content ?? "";
  if (!title) return NextResponse.json({ error: "제목을 입력하세요" }, { status: 400 });
  if (!htmlHasContent(content)) return NextResponse.json({ error: "내용을 입력하세요" }, { status: 400 });

  const attachments = (body.attachments ?? []).filter((a) => a?.url && a?.name).slice(0, 10);

  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id },
      data: { title, content, videoUrl: body.videoUrl?.trim() || null },
    });
    await tx.postAttachment.deleteMany({ where: { postId: id } });
    if (attachments.length) {
      await tx.postAttachment.createMany({ data: attachments.map((a) => ({ postId: id, fileUrl: a.url, fileName: a.name })) });
    }
  });

  return NextResponse.json({ id, ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPost(id);
  if (!post || !post.isPublished) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== claims.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  const newStatus = action === "close" ? "CLOSED" : action === "reopen" ? "OPEN" : null;
  if (!newStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  await prisma.post.update({ where: { id }, data: { status: newStatus } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPost(id);
  if (!post || !post.isPublished) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== claims.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.update({ where: { id }, data: { isPublished: false } });
  return NextResponse.json({ ok: true });
}
