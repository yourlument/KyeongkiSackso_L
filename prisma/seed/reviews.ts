import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";

export async function seedReviews(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  void prisma;
  void ctx;
  return "reviews: Review 0건 (UI에 개별 리뷰 목록 없음 — Product.rating/reviewCount 캐시만 존재, 기존 시드 유지)";
}
