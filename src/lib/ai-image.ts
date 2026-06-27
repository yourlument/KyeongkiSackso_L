import { storage } from "@/lib/storage";

const OPENAI_BASE = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-image-2";
const DEFAULT_SIZE = "1024x1536";
const REQUEST_TIMEOUT = 180_000;

export type AiSampleImage = { bytes: Buffer; contentType: string; filename: string };

export type AiImageResult = { url: string };

function extractB64(data: unknown): string | null {
  const first = (data as { data?: Array<{ b64_json?: string }> } | null)?.data?.[0];
  return first?.b64_json ?? null;
}

export async function generateDetailImage(input: {
  prompt: string;
  samples?: AiSampleImage[];
  size?: string;
}): Promise<AiImageResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const prompt = input.prompt.trim();
  if (!prompt) return null;

  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
  const size = input.size || process.env.OPENAI_IMAGE_SIZE || DEFAULT_SIZE;
  const samples = input.samples ?? [];

  try {
    let b64: string | null = null;

    if (samples.length > 0) {
      const form = new FormData();
      form.append("model", model);
      form.append("prompt", prompt);
      form.append("size", size);
      for (const s of samples) {
        form.append("image[]", new Blob([new Uint8Array(s.bytes)], { type: s.contentType }), s.filename);
      }
      const res = await fetch(`${OPENAI_BASE}/images/edits`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      if (!res.ok) return null;
      b64 = extractB64(await res.json());
    } else {
      const res = await fetch(`${OPENAI_BASE}/images/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, size, n: 1 }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      if (!res.ok) return null;
      b64 = extractB64(await res.json());
    }

    if (!b64) return null;
    const bytes = Buffer.from(b64, "base64");
    const saved = await storage.save({ bytes, filename: "ai-detail.png", contentType: "image/png" });
    return { url: saved.url };
  } catch {
    return null;
  }
}
