import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchNaraLive, type NaraResult } from "@/lib/nara";
import { syncCategoryItems } from "@/lib/nara-sync";

export const dynamic = "force-dynamic";

type NaraRow = { npsCode: string; name: string; spec: string | null; category: string | null };
const toResult = (r: NaraRow): NaraResult => ({ code: r.npsCode, name: r.name, spec: r.spec, category: r.category });

async function dbSearch(q: string): Promise<NaraResult[]> {
  if (!q) return [];
  const nameRows = await prisma.naraItem.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 300,
  });
  if (nameRows.length >= 300) return nameRows.map(toResult);
  const rest = await prisma.naraItem.findMany({
    where: {
      NOT: { name: { contains: q, mode: "insensitive" } },
      OR: [
        { spec: { contains: q, mode: "insensitive" } },
        { npsCode: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take: 300 - nameRows.length,
  });
  return [...nameRows, ...rest].map(toResult);
}

async function categoryItems(categoryId: string): Promise<NaraResult[]> {
  const links = await prisma.naraItemCategory.findMany({
    where: { categoryId },
    select: { npsCode: true },
    orderBy: { createdAt: "asc" },
    take: 1000,
  });
  if (!links.length) return [];
  const rows = await prisma.naraItem.findMany({
    where: { npsCode: { in: links.map((l) => l.npsCode) } },
  });
  const byCode = new Map(rows.map((r) => [r.npsCode, r]));
  return links
    .map((l) => byCode.get(l.npsCode))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({ code: r.npsCode, name: r.name, spec: r.spec, category: r.category }));
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const categoryId = (params.get("categoryId") ?? "").trim();
  const q = (params.get("q") ?? "").trim();

  if (categoryId) {
    let items = await categoryItems(categoryId);
    let source = "db-category";
    if (!items.length) {
      const synced = await syncCategoryItems(categoryId).catch(() => 0);
      if (synced) {
        items = await categoryItems(categoryId);
        source = "nara-category";
      }
    }
    return NextResponse.json({ source, count: items.length, results: items });
  }

  if (q) {
    const db = await dbSearch(q);
    if (db.length) {
      return NextResponse.json({ source: "db", count: db.length, results: db });
    }
    const live = await searchNaraLive(q);
    if (live && live.length) {
      await prisma.naraItem
        .createMany({
          data: live.map((r) => ({ npsCode: r.code, name: r.name, spec: r.spec, category: r.category })),
          skipDuplicates: true,
        })
        .catch(() => {});
      return NextResponse.json({ source: "nara", count: live.length, results: live });
    }
  }

  return NextResponse.json({ source: "db", count: 0, results: [] });
}
