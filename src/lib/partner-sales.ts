import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

export type SalesMonthlyRow = { month: string; total: string; orders: string; fee: string; payout: string; status: "정산대기" | "정산완료"; payoutDate: string };
export type SalesOrderDetail = {
  payMethod: string;
  items: { name: string; spec: string; amount: string }[];
  taxBadge: string;
  taxOrgName: string;
  taxBizNo: string;
  taxCeo: string;
  taxEmail: string;
  taxAddress: string;
  deliveryDeadline: string;
  deliveredDate: string;
  deliveryPlace: string;
  deliveryContact: string;
  recipientName: string;
  recipientPhone: string;
  recipientOrg: string;
  recipientDept: string;
  recipientAddress: string;
  recipientMemo: string;
};
export type SalesOrderRow = {
  id: string;
  date: string;
  no: string;
  org: string;
  dept: string;
  product: string;
  amount: string;
  status: "결제완료" | "배송/진행중" | "완료";
  detail: SalesOrderDetail;
};
export type SalesSubscriptionRow = { id: string; paidAt: string; plan: string; amount: string; method: string; period: string };
export type PartnerSalesData = {
  monthly: SalesMonthlyRow[];
  orders: SalesOrderRow[];
  subscriptions: SalesSubscriptionRow[];
  totalOrderAmount: string;
  pendingAmount: string;
  completedAmount: string;
  subPlanName: string;
  subPeriod: string;
  subMonthlyPrice: string;
  subCount: string;
};

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
function dotymd(d: Date): string {
  return ymd(d).replace(/-/g, ".");
}
function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}`;
}
const ORDER_ST: Record<string, SalesOrderRow["status"]> = { PAID: "결제완료", CONTRACTED: "결제완료", SHIPPING: "배송/진행중", DELIVERED: "완료", COMPLETED: "완료" };
const TAX_BADGE: Record<string, string> = { NONE: "미발행", REQUESTED: "발행 요청", ISSUED: "발행완료" };
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

export async function loadPartnerSales(companyId: string): Promise<PartnerSalesData> {
  const settlements = await prisma.settlement.findMany({
    where: { supplierCompanyId: companyId },
    orderBy: { periodStart: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  const monthly: SalesMonthlyRow[] = settlements.map((s) => ({
    month: ymd(s.periodStart).slice(0, 7),
    total: `${won(s.grossAmount ?? s.amount)}원`,
    orders: `${s._count.orders}건`,
    fee: s.fee != null && Number(s.fee) > 0 ? `${won(s.fee)}원` : "-",
    payout: `${won(s.amount)}원`,
    status: s.status === "PAID" ? "정산완료" : "정산대기",
    payoutDate: ymd(s.scheduledPayoutDate ?? s.paidAt),
  }));

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "CONTRACTED", "SHIPPING", "DELIVERED", "COMPLETED"] },
      items: { some: { product: { supplierCompanyId: companyId } } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        where: { product: { supplierCompanyId: companyId } },
        select: { name: true, quantity: true, amount: true, unitPrice: true, spec: true, product: { select: { unit: true } } },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      buyer: { select: { organization: true } },
    },
  });

  const orderRows: SalesOrderRow[] = orders.map((o) => {
    const it = o.items[0];
    const mySub = o.items.reduce((s, i) => s + Number(i.amount), 0);
    const pay = o.payments[0];
    const org = o.buyer?.organization ?? null;
    const recAddr = [o.deliveryAddress, o.deliveryAddressDetail].filter(Boolean).join(" ");

    const detail: SalesOrderDetail = {
      payMethod: dash(pay?.method),
      items: o.items.map((i) => ({
        name: i.name,
        spec: `${i.quantity}${i.product?.unit ?? "개"} · 단가 ${won(i.unitPrice)}원`,
        amount: `${won(i.amount)}원`,
      })),
      taxBadge: TAX_BADGE[o.taxInvoiceStatus] ?? "미발행",
      taxOrgName: dash(o.recipientOrgName ?? org?.name),
      taxBizNo: dash(decrypt(org?.businessRegistrationNo)),
      taxCeo: dash(decrypt(org?.representativeName)),
      taxEmail: dash(decrypt(org?.taxEmail)),
      taxAddress: dash(decrypt(org?.address)),
      deliveryDeadline: ymd(o.deliveryDeadline),
      deliveredDate: ymd(o.deliveredAt),
      deliveryPlace: dash(o.deliveryPlace ?? o.deliveryAddress),
      deliveryContact: dash(o.siteContactPhone ?? o.recipientPhone),
      recipientName: dash(o.recipientName),
      recipientPhone: dash(o.recipientPhone),
      recipientOrg: dash(o.recipientOrgName),
      recipientDept: dash(o.recipientDepartment),
      recipientAddress: dash(recAddr),
      recipientMemo: dash(o.deliveryMemo),
    };

    return {
      id: o.orderNo,
      date: ymd(o.createdAt),
      no: o.orderNo,
      org: o.recipientOrgName ?? "-",
      dept: o.recipientDepartment ?? "-",
      product: it ? `${it.name} ${it.quantity}${it.product?.unit ?? "개"}` : "-",
      amount: won(mySub),
      status: ORDER_ST[o.status] ?? "결제완료",
      detail,
    };
  });

  const totalOrderAmount = orderRows.reduce((s, r) => s + Number(r.amount.replace(/,/g, "")), 0);
  const pendingAmount = orderRows.filter((r) => r.status === "결제완료" || r.status === "배송/진행중").reduce((s, r) => s + Number(r.amount.replace(/,/g, "")), 0);
  const completedAmount = orderRows.filter((r) => r.status === "완료").reduce((s, r) => s + Number(r.amount.replace(/,/g, "")), 0);

  const sub = await prisma.subscription.findFirst({
    where: { supplierCompanyId: companyId },
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: [{ billingMonth: "desc" }] } },
  });
  const subscriptions: SalesSubscriptionRow[] = (sub?.payments ?? []).map((p) => {
    const start = p.paidAt;
    const end = start ? new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
    return {
      id: p.id,
      paidAt: ymd(p.paidAt),
      plan: sub?.planName ?? "-",
      amount: won(p.amount),
      method: sub?.payMethod ?? "-",
      period: start && end ? `${dotymd(start)} ~ ${dotymd(end)}` : "-",
    };
  });

  const subPlanName = sub?.planName ?? "-";
  const latestPay = sub?.payments[0];
  const subStart = latestPay?.paidAt;
  const subEnd = subStart ? new Date(subStart.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const subPeriod = subStart && subEnd ? `${dotymd(subStart)} ~ ${dotymd(subEnd)}` : "-";
  const subMonthlyPrice = sub?.price != null ? won(sub.price) : "-";
  const subCount = `${sub?.payments.length ?? 0}건`;

  return {
    monthly,
    orders: orderRows,
    subscriptions,
    totalOrderAmount: won(totalOrderAmount),
    pendingAmount: won(pendingAmount),
    completedAmount: won(completedAmount),
    subPlanName,
    subPeriod,
    subMonthlyPrice,
    subCount,
  };
}
