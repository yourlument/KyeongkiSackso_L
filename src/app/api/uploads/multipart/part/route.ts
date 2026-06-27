import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { MAX_PARTS, PART_MAX_BYTES } from "@/lib/storage/upload-config";

const KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/;

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const uploadId = url.searchParams.get("uploadId") ?? "";
  const partNumber = Number(url.searchParams.get("partNumber"));

  if (!KEY_RE.test(key) || !uploadId) {
    return NextResponse.json({ message: "잘못된 요청입니다" }, { status: 400 });
  }
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > MAX_PARTS) {
    return NextResponse.json({ message: "잘못된 파트 번호입니다" }, { status: 400 });
  }

  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.byteLength === 0) {
    return NextResponse.json({ message: "빈 파트입니다" }, { status: 400 });
  }
  if (bytes.byteLength > PART_MAX_BYTES) {
    return NextResponse.json({ message: "파트 크기가 너무 큽니다" }, { status: 400 });
  }

  const result = await storage.uploadPart({ key, uploadId, partNumber, bytes });
  return NextResponse.json(result);
}
