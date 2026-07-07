import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const email = (new URL(req.url).searchParams.get("email") ?? "").trim();
  if (!email) return NextResponse.json({ exists: false });
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return NextResponse.json({ exists: !!user });
}
