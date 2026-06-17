
export type OrderStatus = "결제대기" | "결제완료" | "배송중" | "납품완료";

export type OrderRow = {
  id: string;
  orderNo: string;
  itemName: string;
  qty: string;
  buyerName: string;
  buyerOrg: string;
  amount: string;
  status: OrderStatus;
  orderDate: string;
  courier?: string;
  trackingNo?: string;
};

export const ORDER_STATS = [
  { key: "total", label: "전체 주문", value: "5", icon: "/icons/ord-stat-total.svg", tint: true },
  { key: "paid", label: "결제완료", value: "2", icon: "/icons/ord-stat-paid.svg", tint: false },
  { key: "shipping", label: "배송중", value: "1", icon: "/icons/ord-stat-shipping.svg", tint: false },
  { key: "delivered", label: "납품완료", value: "2", icon: "/icons/ord-stat-delivered.svg", tint: false },
] as const;

export const ORDER_FILTERS = ["전체", "결제대기", "결제완료", "배송중", "납품완료"] as const;
export type OrderFilter = (typeof ORDER_FILTERS)[number];

export const STATUS_STYLE: Record<OrderStatus, { bg: string; border: string; color: string }> = {
  결제대기: { bg: "rgba(29,29,31,0.05)", border: "rgba(210,210,215,0.2)", color: "rgba(29,29,31,0.5)" },
  결제완료: { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: "#1E3A5F" },
  배송중: { bg: "#F0F9FF", border: "#BAE6FD", color: "#0369A1" },
  납품완료: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
};

export const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  결제완료: { label: "배송/진행중으로 변경", next: "배송중" },
  배송중: { label: "납품완료로 변경", next: "납품완료" },
};

export type OrderDetail = {
  orderNo: string;
  payDate: string;
  payMethod: string;
  status: OrderStatus;
  items: { name: string; spec: string; amount: string }[];
  total: string;
  tax: {
    badge: string;
    orgName: string;
    bizNo: string;
    ceo: string;
    email: string;
    address: string;
  };
  delivery: { deadline: string; deliveredDate: string; place: string; contact: string };
  recipient: { name: string; phone: string; org: string; dept: string; address: string; memo: string };
};

