import { NextResponse } from "next/server";
import { z } from "zod";
import { getViewer, loadThreadMessages, sendMessage } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await params;
  const messages = await loadThreadMessages(id, viewer);
  if (messages === null) return NextResponse.json({ message: "대화를 찾을 수 없습니다" }, { status: 404 });
  return NextResponse.json({ messages });
}

const sendSchema = z
  .object({
    body: z.string().trim().default(""),
    fileUrl: z.string().trim().min(1).optional(),
    fileName: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.body.length > 0 || (!!v.fileUrl && !!v.fileName), {
    message: "내용을 입력해 주세요",
  });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = sendSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });

  const file = parsed.data.fileUrl && parsed.data.fileName ? { fileUrl: parsed.data.fileUrl, fileName: parsed.data.fileName } : null;
  const message = await sendMessage(id, viewer, parsed.data.body, file);
  if (message === null) return NextResponse.json({ message: "대화를 찾을 수 없습니다" }, { status: 404 });
  return NextResponse.json({ message }, { status: 201 });
}
