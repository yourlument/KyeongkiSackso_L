import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyBusinessNo } from "@/lib/nts";

export const dynamic = "force-dynamic";

const schema = z.object({ bizNo: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, status: "형식오류", message: "사업자등록번호를 입력해 주세요" }, { status: 400 });
  }
  const result = await verifyBusinessNo(parsed.data.bizNo);
  return NextResponse.json(result);
}
