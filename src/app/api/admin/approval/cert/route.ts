import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const input = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  reason: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "요청을 확인해 주세요" }, { status: 400 });
  const { id, action, reason } = parsed.data;

  const cert = await prisma.supplierCertification.findUnique({ where: { id }, select: { id: true } });
  if (!cert) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });

  if (action === "approve") {
    await prisma.supplierCertification.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date(), rejectReason: null } });
    return NextResponse.json({ status: "승인완료" });
  }
  await prisma.supplierCertification.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date(), rejectReason: reason ?? null } });
  return NextResponse.json({ status: "반려" });
}
