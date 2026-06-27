import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { isAllowedName, maxBytesFor, SINGLE_UPLOAD_MAX } from "@/lib/storage/upload-config";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "파일이 없습니다" }, { status: 400 });
  }
  if (!isAllowedName(file.name)) {
    return NextResponse.json({ message: "허용되지 않는 파일 형식입니다" }, { status: 400 });
  }
  const limit = Math.min(maxBytesFor(file.name), SINGLE_UPLOAD_MAX);
  if (file.size > limit) {
    return NextResponse.json({ message: `파일 크기는 ${Math.floor(limit / (1024 * 1024))}MB 이하여야 합니다` }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const saved = await storage.save({
    bytes,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
  });
  return NextResponse.json(saved);
}
