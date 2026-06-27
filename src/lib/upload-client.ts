import { MULTIPART_THRESHOLD, MULTIPART_CHUNK, extOf } from "@/lib/storage/upload-config";

export interface UploadResult {
  url: string;
  name: string;
  key: string;
}

const COMPRESS_MIN_BYTES = 1024 * 1024;
const COMPRESS_MAX_DIM = 2000;
const COMPRESS_QUALITY = 0.82;

const COMPRESSIBLE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

async function maybeCompressImage(file: File): Promise<File> {
  const targetType = COMPRESSIBLE[extOf(file.name)];
  if (!targetType || file.size < COMPRESS_MIN_BYTES) return file;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, COMPRESS_MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const quality = targetType === "image/png" ? undefined : COMPRESS_QUALITY;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, targetType, quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, { type: targetType });
  } catch {
    return file;
  }
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  return data.message ?? fallback;
}

async function singleUpload(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/uploads", { method: "POST", body: fd });
  if (!res.ok) throw new Error(await errorMessage(res, "파일 업로드에 실패했습니다"));
  const saved = (await res.json()) as { url: string; key: string };
  return { url: saved.url, key: saved.key, name: file.name };
}

async function multipartUpload(file: File, onProgress?: (ratio: number) => void): Promise<UploadResult> {
  const createRes = await fetch("/api/uploads/multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", filename: file.name, contentType: file.type, size: file.size }),
  });
  if (!createRes.ok) throw new Error(await errorMessage(createRes, "업로드 준비에 실패했습니다"));
  const { uploadId, key } = (await createRes.json()) as { uploadId: string; key: string };

  try {
    const total = Math.max(1, Math.ceil(file.size / MULTIPART_CHUNK));
    const parts: { partNumber: number; etag: string }[] = [];
    for (let i = 0; i < total; i += 1) {
      const partNumber = i + 1;
      const blob = file.slice(i * MULTIPART_CHUNK, (i + 1) * MULTIPART_CHUNK);
      const partRes = await fetch(
        `/api/uploads/multipart/part?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}`,
        { method: "PUT", body: blob },
      );
      if (!partRes.ok) throw new Error(await errorMessage(partRes, "파일 업로드에 실패했습니다"));
      const part = (await partRes.json()) as { etag: string };
      parts.push({ partNumber, etag: part.etag });
      onProgress?.(partNumber / total);
    }

    const completeRes = await fetch("/api/uploads/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", key, uploadId, parts, filename: file.name, contentType: file.type }),
    });
    if (!completeRes.ok) throw new Error(await errorMessage(completeRes, "업로드 완료에 실패했습니다"));
    const saved = (await completeRes.json()) as { url: string; key: string };
    return { url: saved.url, key: saved.key, name: file.name };
  } catch (err) {
    await fetch("/api/uploads/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "abort", key, uploadId }),
    }).catch(() => {});
    throw err;
  }
}

export async function uploadFile(file: File, onProgress?: (ratio: number) => void): Promise<UploadResult> {
  const prepared = await maybeCompressImage(file);
  if (prepared.size <= MULTIPART_THRESHOLD) return singleUpload(prepared);
  return multipartUpload(prepared, onProgress);
}
