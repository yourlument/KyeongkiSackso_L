import type { PrismaClient } from "@prisma/client";

export type SeedCtx = {
  pwHash: string;
};

export type SeedFn = (prisma: PrismaClient, ctx: SeedCtx) => Promise<string>;
