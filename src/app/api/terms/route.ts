import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { TermType } from "@prisma/client";

const ORDER: Record<TermType, number> = { SERVICE: 0, PRIVACY: 1, SUPPLIER: 2, MARKETING: 3 };

export async function GET(req: Request) {
  const portal = new URL(req.url).searchParams.get("portal");
  const types: TermType[] =
    portal === "SUPPLIER" ? ["SERVICE", "PRIVACY", "SUPPLIER"] : ["SERVICE", "PRIVACY"];

  const terms = await prisma.term.findMany({
    where: { isActive: true, type: { in: types } },
    select: { id: true, type: true, title: true, summary: true, content: true, required: true, version: true },
  });
  terms.sort((a, b) => ORDER[a.type] - ORDER[b.type]);
  return NextResponse.json({ terms });
}
