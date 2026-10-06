import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  dedupeNaraByClassNo,
  searchNaraLive,
  naraDescription,
  type NaraResult,
  type NaraSearchResult,
} from "@/lib/nara";
import { syncCategoryItems } from "@/lib/nara-sync";

export const dynamic = "force-dynamic";

type NaraRow = { npsCode: string; name: string; spec: string | null; category: string | null; classNo: string | null };
const toResult = (r: NaraRow): NaraResult => ({
  code: r.npsCode,
  name: r.name,
  spec: r.spec,
  category: r.category,
  classNo: r.classNo,
  description: naraDescription(r.spec),
});

const RESULT_LIMIT = 300;
const SCAN_LIMIT = 3000;

async function dbSearch(q: string): Promise<NaraResult[]> {
  if (!q) return [];
  const nameRows = await prisma.naraItem.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: [{ name: "asc" }, { npsCode: "asc" }],
    take: SCAN_LIMIT,
  });
  return dedupeNaraByClassNo(nameRows).slice(0, RESULT_LIMIT).map(toResult);
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
  const ordered = links
    .map((l) => byCode.get(l.npsCode))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  return dedupeNaraByClassNo(ordered).map(toResult);
}

const toPublic = (r: NaraResult): NaraSearchResult => ({
  name: r.name,
  classNo: r.classNo,
  description: r.description,
});

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
    return NextResponse.json({ source, count: items.length, results: items.map(toPublic) });
  }

  if (q) {
    const db = await dbSearch(q);
    if (db.length) {
      return NextResponse.json({ source: "db", count: db.length, results: db.map(toPublic) });
    }
    const live = await searchNaraLive(q);
    if (live && live.length) {
      await prisma.naraItem
        .createMany({
          data: live.map((r) => ({ npsCode: r.code, name: r.name, spec: r.spec, category: r.category, classNo: r.classNo })),
          skipDuplicates: true,
        })
        .catch(() => {});
      const unique = dedupeNaraByClassNo(live);
      return NextResponse.json({ source: "nara", count: unique.length, results: unique.map(toPublic) });
    }
  }

  return NextResponse.json({ source: "db", count: 0, results: [] });
}
