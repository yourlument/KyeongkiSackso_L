import { NextResponse } from "next/server";
import { z } from "zod";
import { ReportStatus, InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const input = z.object({
  id: z.string().min(1),
  type: z.enum(["신고", "문의"]),
  status: z.enum(["접수", "처리중", "완료", "반려"]),
});

const REPORT_ST: Record<string, ReportStatus> = {
  접수: ReportStatus.OPEN,
  처리중: ReportStatus.REVIEWING,
  완료: ReportStatus.RESOLVED,
  반려: ReportStatus.DISMISSED,
};
const INQUIRY_ST: Record<string, InquiryStatus> = {
  접수: InquiryStatus.OPEN,
  처리중: InquiryStatus.IN_PROGRESS,
  완료: InquiryStatus.ANSWERED,
  반려: InquiryStatus.REJECTED,
};

export async function PATCH(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "상태를 확인해 주세요" }, { status: 400 });
  const { id, type, status } = parsed.data;

  if (type === "신고") {
    const r = await prisma.report.findUnique({ where: { id }, select: { id: true } });
    if (!r) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });
    await prisma.report.update({ where: { id }, data: { status: REPORT_ST[status] } });
  } else {
    const q = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
    if (!q) return NextResponse.json({ message: "대상을 찾을 수 없어요" }, { status: 404 });
    await prisma.inquiry.update({ where: { id }, data: { status: INQUIRY_ST[status] } });
  }
  return NextResponse.json({ status });
}
