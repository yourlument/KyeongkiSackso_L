import crypto from "crypto";

const PREFIX = "enc:v1:";

function key(): Buffer {
  const hex = process.env.DATA_ENC_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("DATA_ENC_KEY (hex 64자) 환경변수가 필요합니다.");
  }
  return Buffer.from(hex, "hex");
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encrypt(plain: string, deterministic = false): string {
  const k = key();
  const iv = deterministic
    ? crypto.createHmac("sha256", k).update(plain, "utf8").digest().subarray(0, 12)
    : crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decrypt(value: string | null | undefined): string | null | undefined {
  if (value == null) return value;
  if (!isEncrypted(value)) return value;
  const raw = Buffer.from(value.slice(PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ct = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export type FieldMode = "det" | "rand";
export const PII_FIELDS = {
  User: { name: "rand", phone: "rand", position: "rand" },
  Organization: {
    businessRegistrationNo: "det",
    representativeName: "rand",
    taxEmail: "rand",
    address: "rand",
  },
  SupplierCompany: {
    businessRegistrationNo: "det",
    representativeName: "det",
    corporateRegistrationNo: "rand",
    address: "rand",
    phone: "rand",
  },
} as const satisfies Record<string, Record<string, FieldMode>>;

type ModelName = keyof typeof PII_FIELDS;

export function encryptModel<T extends Record<string, unknown>>(model: ModelName, data: T): T {
  const spec = PII_FIELDS[model] as Record<string, FieldMode>;
  const out: Record<string, unknown> = { ...data };
  for (const [field, mode] of Object.entries(spec)) {
    const v = out[field];
    if (typeof v === "string" && v.length > 0 && !isEncrypted(v)) {
      out[field] = encrypt(v, mode === "det");
    }
  }
  return out as T;
}

export function encryptLookup(model: ModelName, field: string, plain: string): string {
  const mode = (PII_FIELDS[model] as Record<string, FieldMode>)[field];
  if (!mode) return plain;
  return encrypt(plain, mode === "det");
}

export function encField(model: ModelName, field: string, plain: string | null | undefined): string | undefined {
  if (plain == null || plain === "") return undefined;
  if (isEncrypted(plain)) return plain;
  const mode = (PII_FIELDS[model] as Record<string, FieldMode>)[field];
  return mode ? encrypt(plain, mode === "det") : plain;
}

export function decryptModel<T extends Record<string, unknown> | null>(model: ModelName, record: T): T {
  if (!record) return record;
  const spec = PII_FIELDS[model] as Record<string, FieldMode>;
  const out: Record<string, unknown> = { ...record };
  for (const field of Object.keys(spec)) {
    const v = out[field];
    if (typeof v === "string") out[field] = decrypt(v);
  }
  return out as T;
}
