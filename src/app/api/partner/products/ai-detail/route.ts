import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { storage } from "@/lib/storage";
import { generateDetailImage, type AiSampleImage } from "@/lib/ai-image";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const bodySchema = z.object({
  prompt: z.string().min(1).max(500),
  sampleUrls: z.array(z.string()).max(10).optional(),
});

function keyFromUrl(url: string): string | null {
  const clean = url.split("?")[0];
  const seg = clean.split("/").filter(Boolean).pop();
  return seg || null;
}

export async function POST(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: "AI 이미지 생성이 설정되지 않았어요" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "프롬프트를 입력해 주세요" }, { status: 400 });
  }

  const samples: AiSampleImage[] = [];
  for (const url of parsed.data.sampleUrls ?? []) {
    const key = keyFromUrl(url);
    if (!key) continue;
    const file = await storage.read(key);
    if (file) samples.push({ bytes: file.bytes, contentType: file.contentType, filename: key });
  }

  const result = await generateDetailImage({ prompt: parsed.data.prompt, samples });
  if (!result) {
    return NextResponse.json({ message: "이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요" }, { status: 502 });
  }
  return NextResponse.json(result);
}
