import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "파일이 없습니다" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ message: "PDF, JPG, PNG 파일만 업로드할 수 있습니다" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "파일 크기는 10MB 이하여야 합니다" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const saved = await storage.save({ bytes, filename: file.name, contentType: file.type });
  return NextResponse.json(saved);
}
