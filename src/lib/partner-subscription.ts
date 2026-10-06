import { prisma } from "@/lib/db";

export type SubscriptionHistoryRow = {
  date: string;
  amount: string;
  method: string;
  status: string;
};
export type PartnerSubscriptionData = {
  hasSubscription: boolean;
  hasBillingKey: boolean;
  cycle: "monthly" | "annual";
  planName: string;
  cycleLabel: string;
  statusLabel: string;
  isActive: boolean;
  nextBillingDate: string;
  nextAmount: string;
  payMethod: string;
  cardNo: string;
  cancelAtPeriodEnd: boolean;
  cancelEffectiveDate: string;
  history: SubscriptionHistoryRow[];
};

const SUB_STATUS: Record<string, string> = {
  PENDING: "결제 대기",
  ACTIVE: "정상",
  OVERDUE: "미납",
  CANCELLED: "해지",
};
const PAY_STATUS: Record<string, string> = {
  PAID: "완료",
  READY: "대기",
  FAILED: "실패",
  CANCELLED: "취소",
  REFUNDED: "해지",
};

function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}원`;
}
function dot(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10).replace(/-/g, ".");
}

export async function loadPartnerSubscription(
  companyId: string,
): Promise<PartnerSubscriptionData> {
  const [sub, payments] = await Promise.all([
    prisma.subscription.findFirst({
      where: { supplierCompanyId: companyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscriptionPayment.findMany({
      where: { subscription: { supplierCompanyId: companyId } },
      orderBy: [{ billingMonth: "desc" }, { createdAt: "desc" }],
      include: { subscription: { select: { payMethod: true } } },
    }),
  ]);

  if (!sub) {
    return {
      hasSubscription: false,
      hasBillingKey: false,
      cycle: "monthly",
      planName: "",
      cycleLabel: "",
      statusLabel: "",
      isActive: false,
      nextBillingDate: "-",
      nextAmount: "-",
      payMethod: "-",
      cardNo: "-",
      cancelAtPeriodEnd: false,
      cancelEffectiveDate: "-",
      history: [],
    };
  }

  const m = sub.planName.match(/^(.*?)\s*\((.+)\)\s*$/);
  const planName = (m ? m[1] : sub.planName).trim();
  const cycleLabel = m ? m[2].trim() : "";

  const history: SubscriptionHistoryRow[] = payments.map((p) => ({
    date: p.paidAt ? dot(p.paidAt) : (p.billingMonth ?? "").replace(/-/g, "."),
    amount: won(p.amount),
    method: p.subscription.payMethod ?? "-",
    status: PAY_STATUS[p.status] ?? "완료",
  }));

  return {
    hasSubscription: sub.status === "ACTIVE" || sub.status === "OVERDUE",
    hasBillingKey: Boolean(sub.billingKeyEncrypted),
    cycle: sub.cycle === "ANNUAL" ? "annual" : "monthly",
    planName,
    cycleLabel,
    statusLabel: SUB_STATUS[sub.status] ?? "정상",
    isActive: sub.status === "ACTIVE",
    nextBillingDate: dot(sub.nextBillingDate),
    nextAmount: won(sub.price),
    payMethod: sub.payMethod ?? "-",
    cardNo: sub.cardNo ?? "-",
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    cancelEffectiveDate: dot(sub.cancelEffectiveAt),
    history,
  };
}
