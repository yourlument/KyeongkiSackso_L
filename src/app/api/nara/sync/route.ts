import { NextResponse } from "next/server";
import { syncCategoryItems, syncAllGoodsCategories } from "@/lib/nara-sync";

export const dynamic = "force-dynamic";

let running = false;

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const token = params.get("token") ?? "";
  const expected = process.env.NARA_SYNC_TOKEN ?? "";
  if (!expected || token !== expected) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const categoryId = (params.get("categoryId") ?? "").trim();
  if (categoryId) {
    const count = await syncCategoryItems(categoryId);
    return NextResponse.json({ ok: true, categoryId, count });
  }

  if (running) {
    return NextResponse.json({ ok: true, started: false, message: "already running" });
  }
  running = true;
  void syncAllGoodsCategories()
    .catch(() => null)
    .finally(() => {
      running = false;
    });
  return NextResponse.json({ ok: true, started: true });
}
