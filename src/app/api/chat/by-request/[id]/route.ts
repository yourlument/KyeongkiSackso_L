import { NextResponse } from "next/server";
import { getViewer, ensureBuyerThreads } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (viewer.role !== "OFFICIAL") return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const threads = await ensureBuyerThreads(id, viewer.userId);
  if (threads === null) return NextResponse.json({ message: "견적 요청을 찾을 수 없습니다" }, { status: 404 });
  return NextResponse.json({ threads });
}
