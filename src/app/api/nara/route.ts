import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchNaraLive, type NaraResult } from "@/lib/nara";

export const dynamic = "force-dynamic";

async function dbSearch(q: string): Promise<NaraResult[]> {
  const rows = await prisma.naraItem.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { npsCode: { contains: q, mode: "insensitive" } },
            { spec: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { name: "asc" },
    take: 20,
  });
  return rows.map((r) => ({ code: r.npsCode, name: r.name, spec: r.spec, category: r.category }));
}

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();

  const cached = await dbSearch(q);
  if (cached.length > 0) {
    return NextResponse.json({ source: "db", count: cached.length, results: cached });
  }

  if (q) {
    const live = await searchNaraLive(q);
    if (live && live.length) {
      await prisma.naraItem.createMany({
        data: live.map((r) => ({ npsCode: r.code, name: r.name, spec: r.spec, category: r.category })),
        skipDuplicates: true,
      });
      return NextResponse.json({ source: "nara", count: live.length, results: live });
    }
  }

  return NextResponse.json({ source: "db", count: 0, results: [] });
}
