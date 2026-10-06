import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isWithdrawalPurgeDue } from "@/lib/withdrawal-cleanup";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const email = (new URL(req.url).searchParams.get("email") ?? "").trim();
  if (!email) return NextResponse.json({ exists: false });
  const user = await prisma.user.findUnique({
    where: { email },
    select: { status: true, deletedAt: true },
  });
  const availableAfterWithdrawal =
    user?.status === "WITHDRAWN" && isWithdrawalPurgeDue(user.deletedAt);
  return NextResponse.json({ exists: !!user && !availableAfterWithdrawal });
}
