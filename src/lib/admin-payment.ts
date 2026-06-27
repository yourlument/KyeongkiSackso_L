import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

function ymdhm(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${k.toISOString().slice(0, 10)} ${k.toISOString().slice(11, 16)}`;
}
function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");
const comma = (v: { toString(): string } | number | null | undefined) =>
  v == null ? "0" : Number(v).toLocaleString("ko-KR");
const won = (v: { toString(): string } | number | null | undefined) => `${comma(v)}원`;

const TAX_BADGE: Record<string, string> = { NONE: "미발행", REQUESTED: "발행 요청", ISSUED: "발행완료" };

export type Settle = "정산완료" | "정산대기";
export type TxnExtra = {
  manager: string;
  buyerPhone: string;
  tax: { bizNo: string; ceo: string; email: string; address: string; status: string };
  supplierCeo: string;
  supplierPhone: string;
  settleNote: string;
};
export type Txn = {
  orderId: string;
  date: string;
  pg: string;
  method: string;
  buyer: string;
  buyerDept: string;
  supplier: string;
  supplierBiz: string;
  amount: string;
  settle: Settle;
  extra: TxnExtra;
};

export type SubStatus = "정상" | "미납";
export type SubRow = { id: string; name: string; plan: string; fee: string; nextPay: string; remain: string; status: SubStatus };

export type RefundReq = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  order: string;
  buyer: string;
  buyerOrg: string;
  supplier: string;
  item: string;
  amount: string;
  date: string;
  reason: string;
};

export type Kpi = { label: string; value: string };
export type AdminPaymentData = {
  kpis: Kpi[];
  txns: Txn[];
  subKpi: Kpi;
  subscriptions: SubRow[];
  refundKpis: Kpi[];
  refunds: RefundReq[];
};

export async function loadAdminPayment(nowMs: number): Promise<AdminPaymentData> {
  const now = new Date(nowMs);
  const todayKey = ymd(now);

  const payments = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    include: {
      order: {
        include: {
          buyer: { select: { organization: true } },
          settlement: { select: { status: true, settleNote: true } },
          items: { take: 1, select: { supplierCompany: true } },
        },
      },
    },
  });

  const txns: Txn[] = payments.map((p) => {
    const o = p.order;
    const org = o.buyer?.organization ?? null;
    const sup = o.items[0]?.supplierCompany ?? null;
    const settle: Settle = o.settlement?.status === "PAID" ? "정산완료" : "정산대기";
    return {
      orderId: o.id,
      date: ymdhm(p.paidAt ?? o.createdAt),
      pg: dash(p.transactionId),
      method: dash(p.method),
      buyer: dash(o.recipientOrgName ?? org?.name),
      buyerDept: dash(o.recipientDepartment ?? null),
      supplier: dash(sup?.name),
      supplierBiz: dash(decrypt(sup?.businessRegistrationNo)),
      amount: comma(p.amount),
      settle,
      extra: {
        manager: dash(o.recipientName),
        buyerPhone: dash(o.recipientPhone ?? org?.phone),
        tax: {
          bizNo: dash(decrypt(org?.businessRegistrationNo)),
          ceo: dash(decrypt(org?.representativeName)),
          email: dash(decrypt(org?.taxEmail)),
          address: dash(decrypt(org?.address)),
          status: TAX_BADGE[o.taxInvoiceStatus] ?? "미발행",
        },
        supplierCeo: dash(decrypt(sup?.representativeName)),
        supplierPhone: dash(decrypt(sup?.phone)),
        settleNote: dash(o.settlement?.settleNote),
      },
    };
  });

  const todayPays = payments.filter((p) => ymd(p.paidAt) === todayKey);
  const todaySum = todayPays.reduce((s, p) => s + Number(p.amount), 0);
  const pendingSettle = txns.filter((t) => t.settle === "정산대기").length;

  const subs = await prisma.subscription.findMany({
    orderBy: { nextBillingDate: "asc" },
    include: { supplierCompany: { select: { name: true } } },
  });
  const dayMs = 24 * 60 * 60 * 1000;
  const subscriptions: SubRow[] = subs.map((s) => {
    let remain = "-";
    if (s.nextBillingDate) {
      const diff = Math.ceil((s.nextBillingDate.getTime() - now.getTime()) / dayMs);
      remain = diff < 0 ? `${-diff}일 초과` : `${diff}일`;
    }
    return {
      id: s.id,
      name: s.supplierCompany.name,
      plan: s.planName.split(" (")[0],
      fee: won(s.price),
      nextPay: ymd(s.nextBillingDate),
      remain,
      status: s.status === "ACTIVE" ? "정상" : "미납",
    };
  });
  const subRevenue = subs.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + Number(s.price), 0);
  const expiringSoon = subs.filter(
    (s) => s.status !== "ACTIVE" || (s.nextBillingDate && (s.nextBillingDate.getTime() - now.getTime()) / dayMs <= 0),
  ).length;

  const refundReqs = await prisma.refundRequest.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      requester: { select: { name: true, organization: { select: { name: true } } } },
      order: {
        include: { items: { select: { name: true, supplierCompany: { select: { name: true } } } } },
      },
      payment: { select: { amount: true } },
    },
  });
  const refunds: RefundReq[] = refundReqs.map((r) => {
    const items = r.order.items;
    const amt = r.payment?.amount ?? r.order.totalAmount;
    return {
      id: r.id,
      status: r.status,
      order: r.order.orderNo,
      buyer: dash(decrypt(r.requester.name)),
      buyerOrg: dash(r.requester.organization?.name),
      supplier: dash(items[0]?.supplierCompany?.name),
      item: items.map((i) => i.name).join(", ") || "-",
      amount: won(amt),
      date: ymd(r.createdAt),
      reason: r.reason,
    };
  });
  const refundPending = refundReqs.filter((r) => r.status === "PENDING").length;

  return {
    kpis: [
      { label: "금일 총 결제 건수", value: `${todayPays.length}건` },
      { label: "금일 총 결제 금액", value: won(todaySum) },
      { label: "정산 대기", value: `${pendingSettle}건` },
      { label: "이용권 만료 예정", value: `${expiringSoon}건` },
    ],
    txns,
    subKpi: { label: "플랫폼 이용료 수익 (월)", value: won(subRevenue) },
    subscriptions,
    refundKpis: [
      { label: "전체 환불 요청", value: `${refundReqs.length}건` },
      { label: "처리 대기", value: `${refundPending}건` },
    ],
    refunds,
  };
}
