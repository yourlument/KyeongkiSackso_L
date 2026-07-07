import { prisma } from "@/lib/db";
import { searchNaraByDtil, searchNaraByKeyword, type NaraResult } from "@/lib/nara";

export async function fetchCategoryItems(category: {
  name: string;
  naraQuery: string | null;
  naraDtilCode: string | null;
}): Promise<NaraResult[]> {
  if (category.naraDtilCode) {
    const byCode = await searchNaraByDtil(category.naraDtilCode);
    if (byCode && byCode.length) return byCode;
  }
  const byKeyword = await searchNaraByKeyword(category.naraQuery || category.name);
  return byKeyword ?? [];
}

export async function syncCategoryItems(categoryId: string): Promise<number> {
  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true, naraQuery: true, naraDtilCode: true },
  });
  if (!cat) return 0;

  const items = await fetchCategoryItems(cat);

  if (items.length) {
    await prisma.naraItem.createMany({
      data: items.map((r) => ({ npsCode: r.code, name: r.name, spec: r.spec, category: r.category })),
      skipDuplicates: true,
    });
    await prisma.naraItemCategory.createMany({
      data: items.map((r) => ({ categoryId, npsCode: r.code })),
      skipDuplicates: true,
    });
  }

  await prisma.naraCategorySync.upsert({
    where: { categoryId },
    create: { categoryId, itemCount: items.length },
    update: { itemCount: items.length },
  });

  return items.length;
}

export async function syncAllGoodsCategories(): Promise<{ leaves: number; total: number; empty: number }> {
  const leaves = await prisma.category.findMany({
    where: { level: 3, itemType: "GOODS" },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });

  let total = 0;
  let empty = 0;
  for (const leaf of leaves) {
    const n = await syncCategoryItems(leaf.id);
    total += n;
    if (n === 0) empty += 1;
  }

  return { leaves: leaves.length, total, empty };
}
