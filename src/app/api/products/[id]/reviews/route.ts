import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { hasPurchasedProduct } from "@/lib/reviews";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { id: productId } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { rating?: number; comment?: string };
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "별점을 선택하세요" }, { status: 400 });
  }
  const content = (body.comment ?? "").trim().slice(0, 100) || null;

  const purchased = await hasPurchasedProduct(claims.sub, productId);
  if (!purchased) {
    return NextResponse.json({ error: "구매자만 평점을 등록할 수 있습니다" }, { status: 403 });
  }

  const existing = await prisma.review.findFirst({ where: { productId, userId: claims.sub }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "이미 평점을 등록하셨습니다" }, { status: 409 });

  await prisma.$transaction(async (tx) => {
    await tx.review.create({ data: { productId, userId: claims.sub, rating, content } });
    const agg = await tx.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
    await tx.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
        reviewCount: agg._count,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
