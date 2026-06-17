import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

export type ClaimType = "신고" | "문의";
export type ClaimStatus = "접수" | "처리중" | "완료" | "반려";
export type ClaimPriority = "긴급" | "높음" | "보통" | "낮음";
export type ClaimAnswer = { author: string; date: string; body: string };
export type Claim = {
  id: string;
  type: ClaimType;
  title: string;
  category: string;
  author: string;
  affiliation: string;
  date: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  contact?: string;
  email?: string;
  content?: string;
  answer?: ClaimAnswer;
};
export type AdminClaimKpi = { value: string; label: string };
export type AdminClaimData = { claims: Claim[]; kpis: AdminClaimKpi[] };

const PRI: Record<string, ClaimPriority> = { URGENT: "긴급", HIGH: "높음", NORMAL: "보통", LOW: "낮음" };
const REPORT_ST: Record<string, ClaimStatus> = { OPEN: "접수", REVIEWING: "처리중", RESOLVED: "완료", DISMISSED: "반려" };
const INQUIRY_ST: Record<string, ClaimStatus> = { OPEN: "접수", IN_PROGRESS: "처리중", ANSWERED: "완료", REJECTED: "반려", CLOSED: "완료" };

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const opt = (v: string | null | undefined) => (v && v.trim() ? v : undefined);
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

export async function loadAdminClaim(): Promise<AdminClaimData> {
  const [reports, inquiries] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { name: true, organization: { select: { name: true } } } } },
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, organization: { select: { name: true } } } } },
    }),
  ]);

  const reportClaims: Claim[] = reports.map((r) => ({
    id: r.id,
    type: "신고",
    title: r.title ?? r.reason.slice(0, 40),
    category: r.category ?? "-",
    author: opt(r.contactName) ?? dash(decrypt(r.reporter.name)),
    affiliation: opt(r.contactOrg) ?? r.reporter.organization?.name ?? "-",
    date: ymd(r.createdAt),
    status: REPORT_ST[r.status] ?? "접수",
    priority: PRI[r.priority] ?? "보통",
    contact: opt(r.contactPhone),
    email: opt(r.contactEmail),
    content: r.reason,
    answer: r.answer ? { author: r.answeredBy ?? "관리자", date: ymd(r.answeredAt), body: r.answer } : undefined,
  }));

  const inquiryClaims: Claim[] = inquiries
    .filter((q) => q.status !== "CLOSED")
    .map((q) => ({
      id: q.id,
      type: "문의",
      title: q.title,
      category: q.category ?? "-",
      author: opt(q.contactName) ?? dash(decrypt(q.user.name)),
      affiliation: opt(q.contactOrg) ?? q.user.organization?.name ?? "-",
      date: ymd(q.createdAt),
      status: INQUIRY_ST[q.status] ?? "접수",
      priority: PRI[q.priority] ?? "보통",
      contact: opt(q.contactPhone),
      email: opt(q.contactEmail),
      content: q.content,
      answer: q.answer ? { author: q.answeredBy ?? "관리자", date: ymd(q.answeredAt), body: q.answer } : undefined,
    }));

  const claims = [...reportClaims, ...inquiryClaims].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const pending = claims.filter((c) => c.status === "접수").length;
  const inProgress = claims.filter((c) => c.status === "처리중").length;
  const done = claims.filter((c) => c.status === "완료").length;
  const kpis: AdminClaimKpi[] = [
    { value: String(pending), label: "접수 대기" },
    { value: String(inProgress), label: "처리중" },
    { value: String(done), label: "처리 완료" },
  ];

  return { claims, kpis };
}
