import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export interface SavedFile {
  key: string;
  url: string;
}

export interface StorageAdapter {
  save(input: { bytes: Buffer; filename: string; contentType: string }): Promise<SavedFile>;
  read(key: string): Promise<{ bytes: Buffer; contentType: string } | null>;
}

const STORAGE_DIR = process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage", "uploads");
const META_SUFFIX = ".meta.json";

function safeKey(key: string): string {

  return key.replace(/[^a-zA-Z0-9._-]/g, "");
}

class LocalStorageAdapter implements StorageAdapter {
  async save({ bytes, filename, contentType }: { bytes: Buffer; filename: string; contentType: string }) {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    const ext = path.extname(filename).slice(0, 10);
    const key = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(STORAGE_DIR, key), bytes);
    await fs.writeFile(
      path.join(STORAGE_DIR, key + META_SUFFIX),
      JSON.stringify({ contentType, filename }),
    );
    return { key, url: `/api/files/${key}` };
  }

  async read(rawKey: string) {
    const key = safeKey(rawKey);
    try {
      const bytes = await fs.readFile(path.join(STORAGE_DIR, key));
      let contentType = "application/octet-stream";
      try {
        const meta = JSON.parse(await fs.readFile(path.join(STORAGE_DIR, key + META_SUFFIX), "utf8"));
        contentType = meta.contentType ?? contentType;
      } catch {
      }
      return { bytes, contentType };
    } catch {
      return null;
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
