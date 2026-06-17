import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

const CAT_TO_FIELD: Record<string, string> = {
  "cat-1": "도로교통 및 토목 분야",
  "cat-2": "건축시설 및 전기/설비 분야",
  "cat-3": "일반행정 및 교육/지원 분야",
  "cat-4": "재난안전 및 소방/보건 분야",
  "cat-5": "정보통신 및 디지털/4차산업 분야",
  "cat-6": "환경/산림 및 조경/청소 분야",
  "cat-7": "복지/식품 및 문화/관광 분야",
};

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");
function eok(n: number): string {
  if (n >= 1e8) {
    const e = n / 1e8;
    return `${Number.isInteger(e) ? e : Number(e.toFixed(1))}억`;
  }
  if (n >= 1e4) return `${Math.round(n / 1e4).toLocaleString("ko-KR")}만`;
  return n.toLocaleString("ko-KR");
}
const won = (v: { toString(): string } | number) => Number(v).toLocaleString("ko-KR");

export type DashKpi = { label: string; value: string };
export type DashStage = { label: string; count: string; bg: string; color: string };
export type DashRecent = { title: string; meta: string; date: string };
export type DashApplicant = { id: string; name: string; biz: string; category: string };
export type AdminDashboardData = {
  kpis: DashKpi[];
  stages: DashStage[];
  recentRequests: DashRecent[];
  applicants: DashApplicant[];
};

const REVENUE_STATES = ["PAID", "CONTRACTED", "SHIPPING", "DELIVERED", "COMPLETED"] as const;

export async function loadAdminDashboard(nowMs: number): Promise<AdminDashboardData> {
  const now = new Date(nowMs);
  const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [revAgg, approvedCount, dau, mau, statusGroups, recent, pending] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: [...REVENUE_STATES] } }, _sum: { totalAmount: true } }),
    prisma.supplierCompany.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.user.count({
      where: {
        OR: [
          { buyerOrders: { some: { createdAt: { gte: d1 } } } },
          { quoteRequests: { some: { createdAt: { gte: d1 } } } },
          { posts: { some: { createdAt: { gte: d1 } } } },
        ],
      },
    }),
    prisma.user.count({
      where: {
        OR: [
          { buyerOrders: { some: { createdAt: { gte: d30 } } } },
          { quoteRequests: { some: { createdAt: { gte: d30 } } } },
          { posts: { some: { createdAt: { gte: d30 } } } },
        ],
      },
    }),
    prisma.quoteRequest.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { official: { select: { departmentName: true, organization: { select: { name: true } } } } },
    }),
    prisma.supplierCompany.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const cmap = new Map(statusGroups.map((s) => [s.status, s._count.id]));

  const kpis: DashKpi[] = [
    { label: "거래액 총합", value: eok(Number(revAgg._sum.totalAmount ?? 0)) },
    { label: "가입 현황", value: String(approvedCount) },
    { label: "DAU", value: dau.toLocaleString("ko-KR") },
    { label: "MAU", value: mau.toLocaleString("ko-KR") },
  ];

  const stages: DashStage[] = [
    { label: "공고중", count: String(cmap.get("OPEN") ?? 0), bg: "#F0F9FF", color: "#0284C7" },
    { label: "검토중", count: String(cmap.get("REVIEWING") ?? 0), bg: "#FFFBEB", color: "#D97706" },
    { label: "선정", count: String(cmap.get("AWARDED") ?? 0), bg: "#ECFDF5", color: "#059669" },
    { label: "마감", count: String(cmap.get("CLOSED") ?? 0), bg: "rgba(29,29,31,0.05)", color: "rgba(29,29,31,0.4)" },
  ];

  const recentRequests: DashRecent[] = recent.map((q) => {
    const org = q.contactOrgName ?? q.official?.organization?.name ?? "-";
    const dept = q.contactDepartment ?? q.official?.departmentName ?? "";
    const budget = q.budget != null && !q.budgetTbd ? `예산 ${won(q.budget)}원` : "예산 미정";
    return { title: q.title, meta: `${dept ? `${org} ${dept}` : org} · ${budget}`, date: ymd(q.deadline ?? q.createdAt) };
  });

  const applicants: DashApplicant[] = pending.map((s) => ({
    id: s.id,
    name: s.name,
    biz: dash(decrypt(s.businessRegistrationNo)),
    category: s.categoryId ? CAT_TO_FIELD[s.categoryId] ?? "-" : "-",
  }));

  return { kpis, stages, recentRequests, applicants };
}
