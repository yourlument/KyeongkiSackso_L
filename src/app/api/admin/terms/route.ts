import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = { SERVICE: 0, CONSENT: 1, PRIVACY: 2, SUPPLIER: 3, MARKETING: 4 };

export async function GET() {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const terms = await prisma.term.findMany({
    where: { isActive: true },
    select: { id: true, type: true, title: true, summary: true, required: true, version: true },
  });
  terms.sort((a, b) => (ORDER[a.type] ?? 99) - (ORDER[b.type] ?? 99));
  return NextResponse.json({ terms });
}
