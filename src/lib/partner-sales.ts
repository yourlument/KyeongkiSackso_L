import { prisma } from "@/lib/db";

export type SalesMonthlyRow = { month: string; total: string; orders: string; fee: string; payout: string; status: "정산대기" | "정산완료"; payoutDate: string };
export type SalesOrderRow = { id: string; date: string; no: string; org: string; dept: string; product: string; amount: string; status: "결제완료" | "배송/진행중" | "완료" };
export type SalesSubscriptionRow = { paidAt: string; plan: string; amount: string; method: string; period: string };
export type PartnerSalesData = { monthly: SalesMonthlyRow[]; orders: SalesOrderRow[]; subscriptions: SalesSubscriptionRow[] };

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
function dotymd(d: Date): string {
  return ymd(d).replace(/-/g, ".");
}
function won(v: { toString(): string } | number): string {
  return `${Number(v).toLocaleString("ko-KR")}원`;
}
const ORDER_ST: Record<string, SalesOrderRow["status"]> = { PAID: "결제완료", CONTRACTED: "결제완료", SHIPPING: "배송/진행중", DELIVERED: "완료", COMPLETED: "완료" };

export async function loadPartnerSales(companyId: string): Promise<PartnerSalesData> {
  const settlements = await prisma.settlement.findMany({
    where: { supplierCompanyId: companyId },
    orderBy: { periodStart: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  const monthly: SalesMonthlyRow[] = settlements.map((s) => ({
    month: ymd(s.periodStart).slice(0, 7),
    total: won(s.grossAmount ?? s.amount),
    orders: `${s._count.orders}건`,
    fee: s.fee != null && Number(s.fee) > 0 ? won(s.fee) : "-",
    payout: won(s.amount),
    status: s.status === "PAID" ? "정산완료" : "정산대기",
    payoutDate: ymd(s.scheduledPayoutDate ?? s.paidAt),
  }));

  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "CONTRACTED", "SHIPPING", "DELIVERED", "COMPLETED"] }, items: { some: { product: { supplierCompanyId: companyId } } } },
    orderBy: { createdAt: "desc" },
    include: { items: { where: { product: { supplierCompanyId: companyId } }, select: { name: true, quantity: true, amount: true, product: { select: { unit: true } } } } },
  });
  const orderRows: SalesOrderRow[] = orders.map((o) => {
    const it = o.items[0];
    const mySub = o.items.reduce((s, i) => s + Number(i.amount), 0);
    return {
      id: o.orderNo,
      date: ymd(o.createdAt),
      no: o.orderNo,
      org: o.recipientOrgName ?? "-",
      dept: o.recipientDepartment ?? "-",
      product: it ? `${it.name} ${it.quantity}${it.product?.unit ?? "개"}` : "-",
      amount: mySub.toLocaleString("ko-KR"),
      status: ORDER_ST[o.status] ?? "결제완료",
    };
  });

  const sub = await prisma.subscription.findFirst({
    where: { supplierCompanyId: companyId },
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: [{ billingMonth: "desc" }] } },
  });
  const subscriptions: SalesSubscriptionRow[] = (sub?.payments ?? []).map((p) => {
    const start = p.paidAt;
    const end = start ? new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
    return {
      paidAt: ymd(p.paidAt),
      plan: sub?.planName ?? "-",
      amount: Number(p.amount).toLocaleString("ko-KR"),
      method: sub?.payMethod ?? "-",
      period: start && end ? `${dotymd(start)} ~ ${dotymd(end)}` : "-",
    };
  });

  return { monthly, orders: orderRows, subscriptions };
}
