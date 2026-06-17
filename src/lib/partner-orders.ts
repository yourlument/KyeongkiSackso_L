import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import type { OrderRow, OrderStatus, OrderDetail } from "@/app/partner/orders/orders-data";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}원`;
}

const ST: Record<string, OrderStatus> = {
  PENDING: "결제대기",
  PAID: "결제완료",
  CONTRACTED: "결제완료",
  SHIPPING: "배송중",
  DELIVERED: "납품완료",
  COMPLETED: "납품완료",
};

export type PartnerOrdersData = {
  rows: OrderRow[];
  stats: { total: number; paid: number; shipping: number; delivered: number };
};

export async function loadPartnerOrders(companyId: string): Promise<PartnerOrdersData> {
  const orders = await prisma.order.findMany({
    where: {
      status: { not: "CANCELLED" },
      items: { some: { product: { supplierCompanyId: companyId } } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        where: { product: { supplierCompanyId: companyId } },
        select: { name: true, quantity: true, product: { select: { unit: true } } },
      },
      buyer: { select: { organization: { select: { name: true } } } },
    },
  });

  const rows: OrderRow[] = orders.map((o) => {
    const first = o.items[0];
    return {
      id: o.id,
      orderNo: o.orderNo,
      itemName: first?.name ?? "-",
      qty: first ? `${first.quantity}${first.product?.unit ?? "개"}` : "-",
      buyerName: o.recipientName ?? "-",
      buyerOrg: o.recipientOrgName ?? o.buyer?.organization?.name ?? "-",
      amount: won(o.totalAmount),
      status: ST[o.status] ?? "결제완료",
      orderDate: ymd(o.createdAt),
      courier: o.courier ?? undefined,
      trackingNo: o.trackingNo ?? undefined,
    };
  });

  const stats = {
    total: rows.length,
    paid: rows.filter((r) => r.status === "결제완료").length,
    shipping: rows.filter((r) => r.status === "배송중").length,
    delivered: rows.filter((r) => r.status === "납품완료").length,
  };

  return { rows, stats };
}

const TAX_BADGE: Record<string, string> = { NONE: "미발행", REQUESTED: "발행 요청", ISSUED: "발행완료" };
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

export async function loadPartnerOrderDetail(companyId: string, orderNo: string): Promise<OrderDetail | null> {
  const o = await prisma.order.findFirst({
    where: { orderNo, items: { some: { product: { supplierCompanyId: companyId } } } },
    include: {
      items: { select: { name: true, spec: true, quantity: true, unitPrice: true, amount: true, product: { select: { unit: true } } } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      buyer: { select: { organization: true } },
    },
  });
  if (!o) return null;

  const pay = o.payments[0];
  const org = o.buyer?.organization ?? null;
  const recAddr = [o.deliveryAddress, o.deliveryAddressDetail].filter(Boolean).join(" ");

  return {
    orderNo: o.orderNo,
    payDate: ymd(pay?.paidAt ?? o.createdAt),
    payMethod: dash(pay?.method),
    status: ST[o.status] ?? "결제완료",
    items: o.items.map((it) => ({
      name: it.name,
      spec: `${it.quantity}${it.product?.unit ?? "개"} · 단가 ${won(it.unitPrice)}`,
      amount: won(it.amount),
    })),
    total: won(o.totalAmount),
    tax: {
      badge: TAX_BADGE[o.taxInvoiceStatus] ?? "미발행",
      orgName: dash(o.recipientOrgName ?? org?.name),
      bizNo: dash(decrypt(org?.businessRegistrationNo)),
      ceo: dash(decrypt(org?.representativeName)),
      email: dash(decrypt(org?.taxEmail)),
      address: dash(decrypt(org?.address)),
    },
    delivery: {
      deadline: ymd(o.deliveryDeadline),
      deliveredDate: ymd(o.deliveredAt),
      place: dash(o.deliveryPlace ?? o.deliveryAddress),
      contact: dash(o.siteContactPhone ?? o.recipientPhone),
    },
    recipient: {
      name: dash(o.recipientName),
      phone: dash(o.recipientPhone),
      org: dash(o.recipientOrgName),
      dept: dash(o.recipientDepartment),
      address: dash(recAddr),
      memo: dash(o.deliveryMemo),
    },
  };
}
