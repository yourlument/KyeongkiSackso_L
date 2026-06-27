import path from "path";
import crypto from "crypto";
import { promises as fsp } from "fs";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";

export interface SavedFile {
  key: string;
  url: string;
}

export interface UploadedPart {
  partNumber: number;
  etag: string;
}

export interface StorageAdapter {
  save(input: { bytes: Buffer; filename: string; contentType: string }): Promise<SavedFile>;
  read(key: string): Promise<{ bytes: Buffer; contentType: string } | null>;
  createMultipart(input: { filename: string; contentType: string }): Promise<{ uploadId: string; key: string }>;
  uploadPart(input: { key: string; uploadId: string; partNumber: number; bytes: Buffer }): Promise<UploadedPart>;
  completeMultipart(input: {
    key: string;
    uploadId: string;
    parts: UploadedPart[];
    contentType: string;
    filename: string;
  }): Promise<SavedFile>;
  abortMultipart(input: { key: string; uploadId: string }): Promise<void>;
}

function safeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, "");
}

function newKey(filename: string): string {
  const ext = path.extname(filename).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, "");
  return `${crypto.randomUUID()}${ext}`;
}

function isTransient(e: unknown): boolean {
  const err = e as { name?: string; code?: string; message?: string; $metadata?: { httpStatusCode?: number } };
  const status = err?.$metadata?.httpStatusCode;
  if (status && (status === 429 || status >= 500)) return true;
  const blob = `${err?.name ?? ""} ${err?.code ?? ""} ${err?.message ?? ""}`;
  return /ECONNRESET|ETIMEDOUT|EPIPE|ENOTFOUND|EAI_AGAIN|ECONNREFUSED|EHOSTUNREACH|bad record mac|decryption failed|ssl|tls|socket hang up|timeout|aborted|network/i.test(blob);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isTransient(e) || i === attempts - 1) throw e;
      await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
    }
  }
  throw lastErr;
}

class R2StorageAdapter implements StorageAdapter {
  private _client: S3Client | null = null;
  private bucket = "";
  private publicBase = "";

  private get client(): S3Client {
    if (this._client) return this._client;
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucket = process.env.R2_BUCKET;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error("R2 storage is not configured: set R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
    }
    this.bucket = bucket;
    this.publicBase = (process.env.R2_PUBLIC_BASE ?? "").replace(/\/$/, "");
    this._client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      maxAttempts: 5,
    });
    return this._client;
  }

  private urlFor(key: string) {
    return this.publicBase ? `${this.publicBase}/${key}` : `/api/files/${key}`;
  }

  async save({ bytes, filename, contentType }: { bytes: Buffer; filename: string; contentType: string }) {
    const client = this.client;
    const key = newKey(filename);
    await withRetry(() => client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
    })));
    return { key, url: this.urlFor(key) };
  }

  async read(rawKey: string) {
    const client = this.client;
    const key = safeKey(rawKey);
    try {
      const out = await withRetry(() => client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key })));
      if (!out.Body) return null;
      const bytes = Buffer.from(await out.Body.transformToByteArray());
      return { bytes, contentType: out.ContentType ?? "application/octet-stream" };
    } catch {
      return null;
    }
  }

  async createMultipart({ filename, contentType }: { filename: string; contentType: string }) {
    const client = this.client;
    const key = newKey(filename);
    const out = await withRetry(() => client.send(new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    })));
    return { uploadId: out.UploadId!, key };
  }

  async uploadPart({ key, uploadId, partNumber, bytes }: { key: string; uploadId: string; partNumber: number; bytes: Buffer }) {
    const client = this.client;
    const out = await withRetry(() => client.send(new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: bytes,
    })));
    return { partNumber, etag: out.ETag ?? "" };
  }

  async completeMultipart({ key, uploadId, parts }: {
    key: string;
    uploadId: string;
    parts: UploadedPart[];
    contentType: string;
    filename: string;
  }) {
    const client = this.client;
    const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    await withRetry(() => client.send(new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: ordered.map((p) => ({ ETag: p.etag, PartNumber: p.partNumber })) },
    })));
    return { key, url: this.urlFor(key) };
  }

  async abortMultipart({ key, uploadId }: { key: string; uploadId: string }) {
    const client = this.client;
    await withRetry(() => client.send(new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId })));
  }
}

function storageDir(): string {
  return process.env.STORAGE_DIR || path.join(process.cwd(), "storage");
}

class LocalStorageAdapter implements StorageAdapter {
  private get dir() { return storageDir(); }
  private get mpDir() { return path.join(storageDir(), "_mp"); }
  private filePath(key: string) { return path.join(this.dir, safeKey(key)); }
  private ctPath(key: string) { return path.join(this.dir, `${safeKey(key)}.ct`); }
  private partDir(uploadId: string) { return path.join(this.mpDir, safeKey(uploadId)); }

  async save({ bytes, filename, contentType }: { bytes: Buffer; filename: string; contentType: string }) {
    await fsp.mkdir(this.dir, { recursive: true });
    const key = newKey(filename);
    await fsp.writeFile(this.filePath(key), bytes);
    await fsp.writeFile(this.ctPath(key), contentType || "application/octet-stream");
    return { key, url: `/api/files/${key}` };
  }

  async read(rawKey: string) {
    const key = safeKey(rawKey);
    try {
      const bytes = await fsp.readFile(path.join(this.dir, key));
      let contentType = "application/octet-stream";
      try { contentType = (await fsp.readFile(path.join(this.dir, `${key}.ct`), "utf8")).trim() || contentType; } catch { /* no sidecar */ }
      return { bytes, contentType };
    } catch {
      return null;
    }
  }

  async createMultipart({ filename }: { filename: string; contentType: string }) {
    const key = newKey(filename);
    const uploadId = crypto.randomUUID();
    await fsp.mkdir(this.partDir(uploadId), { recursive: true });
    return { uploadId, key };
  }

  async uploadPart({ uploadId, partNumber, bytes }: { key: string; uploadId: string; partNumber: number; bytes: Buffer }) {
    await fsp.mkdir(this.partDir(uploadId), { recursive: true });
    await fsp.writeFile(path.join(this.partDir(uploadId), String(partNumber)), bytes);
    return { partNumber, etag: crypto.createHash("md5").update(bytes).digest("hex") };
  }

  async completeMultipart({ key, uploadId, parts, contentType }: {
    key: string;
    uploadId: string;
    parts: UploadedPart[];
    contentType: string;
    filename: string;
  }) {
    await fsp.mkdir(this.dir, { recursive: true });
    const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
    const chunks: Buffer[] = [];
    for (const p of ordered) {
      chunks.push(await fsp.readFile(path.join(this.partDir(uploadId), String(p.partNumber))));
    }
    await fsp.writeFile(this.filePath(key), Buffer.concat(chunks));
    await fsp.writeFile(this.ctPath(key), contentType || "application/octet-stream");
    await fsp.rm(this.partDir(uploadId), { recursive: true, force: true });
    return { key, url: `/api/files/${key}` };
  }

  async abortMultipart({ uploadId }: { key: string; uploadId: string }) {
    await fsp.rm(this.partDir(uploadId), { recursive: true, force: true }).catch(() => {});
  }
}

const STORAGE_DRIVER = (process.env.STORAGE_DRIVER ?? "local").toLowerCase();
export const storage: StorageAdapter = STORAGE_DRIVER === "r2" ? new R2StorageAdapter() : new LocalStorageAdapter();
