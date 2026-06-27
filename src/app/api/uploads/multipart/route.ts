import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import type { UploadedPart } from "@/lib/storage";
import { isAllowedName, maxBytesFor, contentTypeFor } from "@/lib/storage/upload-config";

const KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ message: "잘못된 요청입니다" }, { status: 400 });
  }

  if (body.action === "create") {
    const filename = typeof body.filename === "string" ? body.filename : "";
    const size = typeof body.size === "number" ? body.size : 0;
    if (!filename || !isAllowedName(filename)) {
      return NextResponse.json({ message: "허용되지 않는 파일 형식입니다" }, { status: 400 });
    }
    if (size > maxBytesFor(filename)) {
      return NextResponse.json({ message: `파일 크기는 ${Math.floor(maxBytesFor(filename) / (1024 * 1024))}MB 이하여야 합니다` }, { status: 400 });
    }
    const contentType = contentTypeFor(filename, typeof body.contentType === "string" ? body.contentType : undefined);
    const created = await storage.createMultipart({ filename, contentType });
    return NextResponse.json(created);
  }

  if (body.action === "complete") {
    const key = typeof body.key === "string" ? body.key : "";
    const uploadId = typeof body.uploadId === "string" ? body.uploadId : "";
    const filename = typeof body.filename === "string" ? body.filename : "";
    if (!KEY_RE.test(key) || !uploadId || !filename) {
      return NextResponse.json({ message: "잘못된 요청입니다" }, { status: 400 });
    }
    const rawParts = Array.isArray(body.parts) ? body.parts : [];
    const parts: UploadedPart[] = rawParts
      .map((p) => p as { partNumber?: unknown; etag?: unknown })
      .filter((p) => typeof p.partNumber === "number" && typeof p.etag === "string")
      .map((p) => ({ partNumber: p.partNumber as number, etag: p.etag as string }));
    if (!parts.length) {
      return NextResponse.json({ message: "업로드된 파트가 없습니다" }, { status: 400 });
    }
    const contentType = contentTypeFor(filename, typeof body.contentType === "string" ? body.contentType : undefined);
    const saved = await storage.completeMultipart({ key, uploadId, parts, contentType, filename });
    return NextResponse.json(saved);
  }

  if (body.action === "abort") {
    const key = typeof body.key === "string" ? body.key : "";
    const uploadId = typeof body.uploadId === "string" ? body.uploadId : "";
    if (!KEY_RE.test(key) || !uploadId) {
      return NextResponse.json({ message: "잘못된 요청입니다" }, { status: 400 });
    }
    await storage.abortMultipart({ key, uploadId }).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ message: "알 수 없는 작업입니다" }, { status: 400 });
}
