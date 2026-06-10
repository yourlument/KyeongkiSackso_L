import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await ctx.params;
  try {
    await req.json().catch(() => ({}));
  } catch {
  }
  return NextResponse.json({ ok: true });
}
