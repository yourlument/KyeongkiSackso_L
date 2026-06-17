import { prisma } from "@/lib/db";

export type SubscriptionHistoryRow = { date: string; amount: string; method: string; status: string };
export type PartnerSubscriptionData = {
  hasSubscription: boolean;
  planName: string;
  cycleLabel: string;
  statusLabel: string;
  nextBillingDate: string;
  nextAmount: string;
  payMethod: string;
  cardNo: string;
  history: SubscriptionHistoryRow[];
};

const SUB_STATUS: Record<string, string> = { ACTIVE: "정상", OVERDUE: "미납", CANCELLED: "해지" };
const PAY_STATUS: Record<string, string> = { PAID: "완료", READY: "대기", FAILED: "실패", CANCELLED: "취소", REFUNDED: "환불" };

function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}원`;
}
function dot(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10).replace(/-/g, ".");
}

export async function loadPartnerSubscription(companyId: string): Promise<PartnerSubscriptionData> {
  const sub = await prisma.subscription.findFirst({
    where: { supplierCompanyId: companyId },
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: [{ billingMonth: "desc" }] } },
  });

  if (!sub) {
    return {
      hasSubscription: false,
      planName: "", cycleLabel: "", statusLabel: "", nextBillingDate: "-", nextAmount: "-",
      payMethod: "-", cardNo: "-", history: [],
    };
  }

  const m = sub.planName.match(/^(.*?)\s*\((.+)\)\s*$/);
  const planName = (m ? m[1] : sub.planName).trim();
  const cycleLabel = m ? m[2].trim() : "";

  const history: SubscriptionHistoryRow[] = sub.payments.map((p) => ({
    date: p.paidAt ? dot(p.paidAt) : (p.billingMonth ?? "").replace(/-/g, "."),
    amount: won(p.amount),
    method: sub.payMethod ?? "-",
    status: PAY_STATUS[p.status] ?? "완료",
  }));

  return {
    hasSubscription: true,
    planName,
    cycleLabel,
    statusLabel: SUB_STATUS[sub.status] ?? "정상",
    nextBillingDate: dot(sub.nextBillingDate),
    nextAmount: won(sub.price),
    payMethod: sub.payMethod ?? "-",
    cardNo: sub.cardNo ?? "-",
    history,
  };
}
