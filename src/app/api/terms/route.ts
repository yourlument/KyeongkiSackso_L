import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { TermType } from "@prisma/client";

const ORDER: Record<TermType, number> = { SERVICE: 0, CONSENT: 1, PRIVACY: 2, SUPPLIER: 3, MARKETING: 4 };

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const portal = params.get("portal");
  const context = params.get("context");
  const types: TermType[] =
    context === "agreement"
      ? portal === "SUPPLIER"
        ? ["SERVICE", "CONSENT", "SUPPLIER"]
        : ["SERVICE", "CONSENT"]
      : portal === "SUPPLIER"
        ? ["SERVICE", "PRIVACY", "SUPPLIER"]
        : ["SERVICE", "PRIVACY"];

  const terms = await prisma.term.findMany({
    where: { isActive: true, type: { in: types } },
    select: { id: true, type: true, title: true, summary: true, content: true, contentHtml: true, required: true, version: true },
  });
  terms.sort((a, b) => ORDER[a.type] - ORDER[b.type]);
  return NextResponse.json({ terms });
}
