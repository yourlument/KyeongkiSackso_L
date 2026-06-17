import { prisma } from "@/lib/db";

export type CertStatus = "등록 완료" | "심사 진행중" | "반려";
export type CertRow = {
  id: string;
  name: string;
  status: CertStatus;
  desc: string;
  file: string;
  uploaded: string;
  reviewed?: string;
  reason?: string;
};
export type PartnerCertificationsData = {
  rows: CertRow[];
  stats: { approved: number; reviewing: number; total: number };
};

const ST: Record<string, CertStatus> = { APPROVED: "등록 완료", REVIEWING: "심사 진행중", REJECTED: "반려" };

function ymd(d: Date | null | undefined): string {
  if (!d) return "";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

export async function loadPartnerCertifications(companyId: string): Promise<PartnerCertificationsData> {
  const certs = await prisma.supplierCertification.findMany({
    where: { supplierCompanyId: companyId },
    orderBy: { submittedAt: "desc" },
  });

  const rows: CertRow[] = certs.map((c) => ({
    id: c.id,
    name: c.name,
    status: ST[c.status] ?? "심사 진행중",
    desc: c.description ?? "",
    file: c.fileName ?? "첨부 파일 없음",
    uploaded: `업로드: ${ymd(c.submittedAt)}`,
    ...(c.reviewedAt ? { reviewed: `검토: ${ymd(c.reviewedAt)}` } : {}),
    ...(c.status === "REJECTED" && c.rejectReason ? { reason: `반려 사유: ${c.rejectReason}` } : {}),
  }));

  const stats = {
    approved: rows.filter((r) => r.status === "등록 완료").length,
    reviewing: rows.filter((r) => r.status === "심사 진행중").length,
    total: rows.length,
  };

  return { rows, stats };
}
