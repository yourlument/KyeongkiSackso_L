import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { getNotificationsFor, markNotificationsRead } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ items: [], unreadCount: 0 });
  const data = await getNotificationsFor(claims.sub);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : undefined;
  await markNotificationsRead(claims.sub, id);
  return NextResponse.json({ ok: true });
}
