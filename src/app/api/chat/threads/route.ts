import { NextResponse } from "next/server";
import { getViewer, loadSupplierThreads } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (viewer.role !== "SUPPLIER" || !viewer.supplierCompanyId) {
    return NextResponse.json({ threads: [] });
  }
  const threads = await loadSupplierThreads(viewer.supplierCompanyId);
  return NextResponse.json({ threads });
}
