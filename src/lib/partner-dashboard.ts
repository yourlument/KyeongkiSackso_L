import { prisma } from "@/lib/db";

const NAVY = "#1E3A5F";
type StatusStyle = { label: string; bg: string; border: string; color: string };
const ST_PAID: StatusStyle = { label: "결제완료", bg: "rgba(30,58,95,0.1)", border: "1px solid rgba(30,58,95,0.2)", color: NAVY };
const ST_WAIT: StatusStyle = { label: "대기", bg: "rgba(29,29,31,0.05)", border: "1px solid rgba(210,210,215,0.2)", color: "rgba(29,29,31,0.5)" };
const ST_SHIP: StatusStyle = { label: "배송중", bg: "#F0F9FF", border: "1px solid #BAE6FD", color: "#0369A1" };
const ST_DONE: StatusStyle = { label: "납품완료", bg: "#ECFDF5", border: "1px solid #A7F3D0", color: "#047857" };
const ORDER_ST: Record<string, StatusStyle> = { PENDING: ST_WAIT, PAID: ST_PAID, CONTRACTED: ST_PAID, SHIPPING: ST_SHIP, DELIVERED: ST_DONE, COMPLETED: ST_DONE };
const REVENUE_STATUSES = ["PAID", "CONTRACTED", "SHIPPING", "DELIVERED", "COMPLETED"];

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
function eok(n: number): string {
  if (n >= 1e8) { const e = n / 1e8; return `${Number.isInteger(e) ? e : Number(e.toFixed(1))}억`; }
  if (n >= 1e4) return `${Math.round(n / 1e4).toLocaleString("ko-KR")}만`;
  return n.toLocaleString("ko-KR");
}
function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

export type DashboardOverview = {
  stats: { products: number; inProgress: number; thisMonthRevenue: string; completed: number };
  recentOrders: { id: string; title: string; sub: string; status: StatusStyle }[];
  openQuotes: { title: string; sub: string; budget: string }[];
};

export async function loadPartnerDashboardOverview(companyId: string): Promise<DashboardOverview> {
  const products = await prisma.product.count({ where: { supplierCompanyId: companyId } });

  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { supplierCompanyId: companyId } } } },
    orderBy: { createdAt: "desc" },
    include: { items: { where: { product: { supplierCompanyId: companyId } }, select: { name: true, amount: true } } },
  });

  const now = new Date();
  const ym = (d: Date) => `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
  const thisYm = ym(now);
  let inProgress = 0, completed = 0, thisMonthRevenue = 0;
  for (const o of orders) {
    if (["PAID", "SHIPPING"].includes(o.status)) inProgress++;
    if (["DELIVERED", "COMPLETED"].includes(o.status)) completed++;
    const mySub = o.items.reduce((s, it) => s + Number(it.amount), 0);
    if (REVENUE_STATUSES.includes(o.status) && ym(o.createdAt) === thisYm) thisMonthRevenue += mySub;
  }

  const recentOrders = orders.slice(0, 3).map((o) => ({
    id: o.id,
    title: o.items[0]?.name ?? "-",
    sub: `${o.recipientName ?? "-"} · ${o.recipientOrgName ?? "-"} · ${ymd(o.createdAt)}`,
    status: ORDER_ST[o.status] ?? ST_PAID,
  }));

  const quotes = await prisma.quoteRequest.findMany({
    where: { kind: "OPEN_BID", status: { in: ["OPEN", "REVIEWING"] } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { official: { select: { departmentName: true, organization: { select: { name: true } } } } },
  });
  const openQuotes = quotes.map((q) => {
    const orgName = q.contactOrgName ?? q.official?.organization?.name ?? "-";
    const dept = q.contactDepartment ?? q.official?.departmentName ?? "";
    return {
      title: q.title,
      sub: `${dept ? `${orgName} ${dept}` : orgName} · 마감 ${q.deadline ? ymd(q.deadline) : "-"}`,
      budget: q.budgetTbd ? "미정" : q.budget != null ? won(Number(q.budget)) : "-",
    };
  });

  return {
    stats: { products, inProgress, thisMonthRevenue: eok(thisMonthRevenue), completed },
    recentOrders,
    openQuotes,
  };
}

const BAR_PALETTE = [NAVY, "#34D399", "#38BDF8", "#FBBF24", "#2DD4BF"];
const REVENUE_MAX_H = 160;
const QUOTE_MAX_H = 160;
const MONTHLY_TRACK = 291;

function man(n: number): string {
  return `${Math.round(n / 1e4).toLocaleString("ko-KR")}만원`;
}
function monthKeyKST(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${k.getUTCFullYear()}-${k.getUTCMonth()}`;
}

export type PartnerStats = {
  kpis: { label: string; value: string; delta: string; deltaColor: string; highlight: boolean }[];
  revenueBars: { month: string; value: string; h: number; color: string }[];
  quoteBars: { month: string; value: string; h: number; color: string }[];
  categoryShare: { name: string; pct: number; color: string }[];
  monthlyOrders: { month: string; w: number; color: string; won: string; cnt: string }[];
};

export async function loadPartnerStats(companyId: string): Promise<PartnerStats> {
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { supplierCompanyId: companyId } } } },
    include: {
      items: {
        where: { product: { supplierCompanyId: companyId } },
        select: { amount: true, product: { select: { category: { select: { name: true } } } } },
      },
    },
  });
  const responses = await prisma.quoteResponse.findMany({
    where: { supplierCompanyId: companyId },
    select: { status: true, createdAt: true },
  });

  const nowK = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const months: { key: string; label: string }[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(Date.UTC(nowK.getUTCFullYear(), nowK.getUTCMonth() - i, 1));
    months.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: `${d.getUTCMonth() + 1}월` });
  }

  const revByMonth = new Map<string, number>();
  const cntByMonth = new Map<string, number>();
  const catRev = new Map<string, number>();
  const buyerOrderCount = new Map<string, number>();
  let totalRev = 0, revOrderCount = 0;
  for (const o of orders) {
    const isRev = REVENUE_STATUSES.includes(o.status);
    const sub = o.items.reduce((s, it) => s + Number(it.amount), 0);
    buyerOrderCount.set(o.buyerId, (buyerOrderCount.get(o.buyerId) ?? 0) + 1);
    if (!isRev) continue;
    const mk = monthKeyKST(o.createdAt);
    revByMonth.set(mk, (revByMonth.get(mk) ?? 0) + sub);
    cntByMonth.set(mk, (cntByMonth.get(mk) ?? 0) + 1);
    totalRev += sub;
    revOrderCount++;
    for (const it of o.items) {
      const cat = it.product?.category?.name ?? "기타";
      catRev.set(cat, (catRev.get(cat) ?? 0) + Number(it.amount));
    }
  }

  const maxRev = Math.max(1, ...months.map((m) => revByMonth.get(m.key) ?? 0));
  const revenueBars = months.map((m, i) => {
    const v = revByMonth.get(m.key) ?? 0;
    return { month: m.label, value: v ? man(v) : "0", h: Math.round((REVENUE_MAX_H * v) / maxRev), color: BAR_PALETTE[i % BAR_PALETTE.length] };
  });

  const qByMonth = new Map<string, number>();
  for (const r of responses) {
    const mk = monthKeyKST(r.createdAt);
    qByMonth.set(mk, (qByMonth.get(mk) ?? 0) + 1);
  }
  const maxQ = Math.max(1, ...months.map((m) => qByMonth.get(m.key) ?? 0));
  const quoteBars = months.map((m, i) => {
    const v = qByMonth.get(m.key) ?? 0;
    return { month: m.label, value: `${v}건`, h: Math.round((QUOTE_MAX_H * v) / maxQ), color: BAR_PALETTE[i % BAR_PALETTE.length] };
  });

  const catEntries = [...catRev.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0) || 1;
  const categoryShare = catEntries.map(([name, v], i) => ({ name, pct: Math.round((v / catTotal) * 100), color: BAR_PALETTE[i % BAR_PALETTE.length] }));

  const monthlyOrders = [...months].reverse().map((m, i) => {
    const v = revByMonth.get(m.key) ?? 0;
    const c = cntByMonth.get(m.key) ?? 0;
    return { month: m.label, w: Math.round((MONTHLY_TRACK * v) / maxRev), color: BAR_PALETTE[i % BAR_PALETTE.length], won: man(v), cnt: `${c}건` };
  });

  const totalResp = responses.length;
  const awarded = responses.filter((r) => r.status === "AWARDED").length;
  const repeatBuyers = [...buyerOrderCount.values()].filter((n) => n > 1).length;
  const totalBuyers = buyerOrderCount.size || 1;
  const kpis = [
    { label: "총 매출", value: man(totalRev), delta: "", deltaColor: "#059669", highlight: false },
    { label: "견적 채택률", value: `${Math.round((awarded / (totalResp || 1)) * 100)}%`, delta: "", deltaColor: "#059669", highlight: true },
    { label: "평균 단가", value: man(revOrderCount ? totalRev / revOrderCount : 0), delta: "", deltaColor: "#EF4444", highlight: false },
    { label: "재구매율", value: `${Math.round((repeatBuyers / totalBuyers) * 100)}%`, delta: "", deltaColor: "#059669", highlight: false },
  ];

  return { kpis, revenueBars, quoteBars, categoryShare, monthlyOrders };
}
