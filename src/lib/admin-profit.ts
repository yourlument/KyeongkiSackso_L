import { prisma } from "@/lib/db";

function won(v: { toString(): string } | number | null | undefined): string {
  return v == null ? "0" : Number(v).toLocaleString("ko-KR");
}
function eok(n: number): string {
  if (n >= 1e8) {
    const e = n / 1e8;
    return `${Number.isInteger(e) ? e : Number(e.toFixed(1))}억`;
  }
  if (n >= 1e4) return `${Math.round(n / 1e4).toLocaleString("ko-KR")}만`;
  return n.toLocaleString("ko-KR");
}
function monthKey(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 7);
}

export type ProfitKpi = { label: string; value: string };
export type ProfitBar = { month: string; label: string; platform: number; license: number };
export type ProfitPayState = "결제완료" | "미납";
export type ProfitPermState = "정상" | "제한";
export type ProfitCompany = { id: string; name: string; plan: string; fee: string; pay: ProfitPayState; perm: ProfitPermState };
export type AdminProfitData = { kpis: ProfitKpi[]; bars: ProfitBar[]; companies: ProfitCompany[] };

const MAX_PLATFORM_PX = 124;
const MAX_LICENSE_PX = 34;

export async function loadAdminProfit(nowMs: number): Promise<AdminProfitData> {
  const now = new Date(nowMs);

  const [subs, subPays, settlements] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: { supplierCompany: { select: { id: true, name: true, isRestricted: true } } },
    }),
    prisma.subscriptionPayment.findMany({ select: { amount: true, billingMonth: true, paidAt: true } }),
    prisma.settlement.findMany({ select: { fee: true, grossAmount: true, periodStart: true } }),
  ]);

  const seen = new Set<string>();
  const companies: ProfitCompany[] = [];
  for (const s of subs) {
    const cid = s.supplierCompany.id;
    if (seen.has(cid)) continue;
    seen.add(cid);
    companies.push({
      id: cid,
      name: s.supplierCompany.name,
      plan: s.planName.split(" (")[0],
      fee: `${won(s.price)}원`,
      pay: s.status === "ACTIVE" ? "결제완료" : "미납",
      perm: s.supplierCompany.isRestricted ? "제한" : "정상",
    });
  }

  const thisMonth = monthKey(now);
  const months: string[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const licenseByMonth = new Map<string, number>();
  for (const p of subPays) {
    const mk = p.billingMonth ?? (p.paidAt ? monthKey(p.paidAt) : null);
    if (!mk) continue;
    licenseByMonth.set(mk, (licenseByMonth.get(mk) ?? 0) + Number(p.amount));
  }
  const platformByMonth = new Map<string, number>();
  for (const s of settlements) {
    const mk = monthKey(s.periodStart);
    platformByMonth.set(mk, (platformByMonth.get(mk) ?? 0) + Number(s.fee ?? 0));
  }
  const licVals = months.map((m) => licenseByMonth.get(m) ?? 0);
  const platVals = months.map((m) => platformByMonth.get(m) ?? 0);
  const maxLic = Math.max(1, ...licVals);
  const maxPlat = Math.max(1, ...platVals);
  const bars: ProfitBar[] = months.map((m, i) => ({
    month: `${Number(m.slice(5, 7))}월`,
    label: eok(licVals[i] + platVals[i]),
    platform: Math.round((MAX_PLATFORM_PX * platVals[i]) / maxPlat),
    license: Math.round((MAX_LICENSE_PX * licVals[i]) / maxLic),
  }));

  const mrr = subs.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + Number(s.price), 0);
  const platformThisMonth = platformByMonth.get(thisMonth) ?? 0;
  const kpis: ProfitKpi[] = [
    { label: "이번달 총 수익", value: eok(mrr + platformThisMonth) },
    { label: "이용권 수익", value: eok(mrr) },
    { label: "플랫폼 수익", value: eok(platformThisMonth) },
  ];

  return { kpis, bars, companies };
}
