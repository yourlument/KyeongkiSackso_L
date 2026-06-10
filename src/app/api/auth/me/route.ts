import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";

export async function GET() {
  const claims = await getSessionClaims();
  return NextResponse.json({ authenticated: !!claims, role: claims?.role ?? null });
}
