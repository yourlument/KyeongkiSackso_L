export const QUOTE_SEAL_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export type QuoteSealImage = {
  bytes: Buffer;
  contentType: "image/png" | "image/jpeg";
};

function isPng(bytes: Buffer): boolean {
  return bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a;
}

function isJpeg(bytes: Buffer): boolean {
  return bytes.length >= 3
    && bytes[0] === 0xff
    && bytes[1] === 0xd8
    && bytes[2] === 0xff;
}

export function parseQuoteSealImage(bytes: Buffer): QuoteSealImage | null {
  if (bytes.length === 0 || bytes.length > QUOTE_SEAL_IMAGE_MAX_BYTES) return null;
  if (isPng(bytes)) return { bytes, contentType: "image/png" };
  if (isJpeg(bytes)) return { bytes, contentType: "image/jpeg" };
  return null;
}

export function quoteSealImageDataUri(file: { bytes: Buffer; contentType?: string } | null): string | null {
  if (!file) return null;
  const parsed = parseQuoteSealImage(file.bytes);
  if (!parsed) return null;
  return `data:${parsed.contentType};base64,${parsed.bytes.toString("base64")}`;
}
