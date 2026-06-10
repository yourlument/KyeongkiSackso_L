import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cached } from "@/lib/cache";
import type { CategoryItemType } from "@/lib/categories";

type LeafType = "goods" | "service";

interface LeafNode {
  id: string;
  code: string;
  name: string;
  itemType: CategoryItemType;
}
interface MidNode {
  id: string;
  code: string;
  name: string;
  children: LeafNode[];
}
interface TopNode {
  id: string;
  code: string;
  name: string;
  children: MidNode[];
}

async function buildTree(): Promise<TopNode[]> {
  const rows = await prisma.category.findMany({
    orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    select: { id: true, code: true, name: true, level: true, parentId: true, itemType: true },
  });

  const tops = rows.filter((r) => r.level === 1);
  const mids = rows.filter((r) => r.level === 2);
  const leaves = rows.filter((r) => r.level === 3);

  return tops.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    children: mids
      .filter((m) => m.parentId === t.id)
      .map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        children: leaves
          .filter((l) => l.parentId === m.id && l.itemType != null)
          .map((l) => ({
            id: l.id,
            code: l.code,
            name: l.name,
            itemType: l.itemType as CategoryItemType,
          })),
      })),
  }));
}

function filterByType(tree: TopNode[], type: LeafType): TopNode[] {
  const want: CategoryItemType = type === "goods" ? "GOODS" : "SERVICE";
  return tree
    .map((t) => ({
      ...t,
      children: t.children
        .map((m) => ({ ...m, children: m.children.filter((l) => l.itemType === want) }))
        .filter((m) => m.children.length > 0),
    }))
    .filter((t) => t.children.length > 0);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const typeParam = (searchParams.get("type") ?? "").trim().toLowerCase();
  const type: LeafType | null = typeParam === "goods" || typeParam === "service" ? typeParam : null;

  const tree = await cached("categories:tree", 300, buildTree);
  const categories = type ? filterByType(tree, type) : tree;

  return NextResponse.json({ categories });
}
