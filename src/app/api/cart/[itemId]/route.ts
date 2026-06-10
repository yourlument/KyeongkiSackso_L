import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

async function ownItem(itemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });
  if (!item || item.cart.userId !== userId) return null;
  return item;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { itemId } = await params;

  const body = (await req.json().catch(() => null)) as { quantity?: number } | null;
  const quantity = Math.max(1, Math.floor(Number(body?.quantity ?? 1)) || 1);

  const item = await ownItem(itemId, claims.sub);
  if (!item) return NextResponse.json({ message: "항목을 찾을 수 없습니다" }, { status: 404 });

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { itemId } = await params;

  const item = await ownItem(itemId, claims.sub);
  if (!item) return NextResponse.json({ message: "항목을 찾을 수 없습니다" }, { status: 404 });

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
