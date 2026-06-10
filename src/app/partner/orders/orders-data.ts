export type OrderStatus = "결제완료" | "배송중" | "납품완료";

export type OrderRow = {
  orderNo: string;
  itemName: string;
  qty: string;
  buyerName: string;
  buyerOrg: string;
  amount: string;
  status: OrderStatus;
  orderDate: string;
};

export const ORDERS: OrderRow[] = [
  { orderNo: "ORD-2026-101", itemName: "반사형 교통콘 750mm", qty: "20개", buyerName: "김주무관", buyerOrg: "화성시청", amount: "900,000원", status: "결제완료", orderDate: "2026-05-15" },
  { orderNo: "ORD-2026-102", itemName: "방호울타리 강관형 W-빔 4m", qty: "10개", buyerName: "이담당", buyerOrg: "화성시청", amount: "1,200,000원", status: "결제완료", orderDate: "2026-05-10" },
  { orderNo: "ORD-2026-103", itemName: "도로표지판 주의 900mm", qty: "5개", buyerName: "박주임", buyerOrg: "화성시청", amount: "400,000원", status: "배송중", orderDate: "2026-05-05" },
  { orderNo: "ORD-2026-104", itemName: "사무용 책상 1400x700", qty: "8개", buyerName: "최담당", buyerOrg: "수원시청", amount: "1,440,000원", status: "납품완료", orderDate: "2026-04-20" },
  { orderNo: "ORD-2026-105", itemName: "학생용 책상 600x400", qty: "30개", buyerName: "정주무관", buyerOrg: "수원시청", amount: "1,950,000원", status: "납품완료", orderDate: "2026-04-15" },
];

export const ORDER_STATS = [
  { key: "total", label: "전체 주문", value: "5", icon: "/icons/ord-stat-total.svg", tint: true },
  { key: "paid", label: "결제완료", value: "2", icon: "/icons/ord-stat-paid.svg", tint: false },
  { key: "shipping", label: "배송중", value: "1", icon: "/icons/ord-stat-shipping.svg", tint: false },
  { key: "delivered", label: "납품완료", value: "2", icon: "/icons/ord-stat-delivered.svg", tint: false },
] as const;

export const ORDER_FILTERS = ["전체", "결제대기", "결제완료", "배송중", "납품완료"] as const;
export type OrderFilter = (typeof ORDER_FILTERS)[number];

export const STATUS_STYLE: Record<OrderStatus, { bg: string; border: string; color: string }> = {
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

export const ORDER_DETAIL: OrderDetail = {
  orderNo: "ORD-2026-101",
  payDate: "2026-05-15",
  payMethod: "카드결제",
  status: "결제완료",
  items: [{ name: "반사형 교통콘 750mm", spec: "20개 · 단가 45,000원", amount: "900,000원" }],
  total: "900,000원",
  tax: {
    badge: "발행 요청",
    orgName: "화성시청",
    bizNo: "134-83-00001",
    ceo: "홍길동",
    email: "tax@hwaseong.go.kr",
    address: "경기도 화성시 중앙로 100 화성시청",
  },
  delivery: {
    deadline: "2026-05-25",
    deliveredDate: "-",
    place: "경기도 화성시 향남로 45 시청본관 도로과",
    contact: "010-1234-5678",
  },
  recipient: {
    name: "김과장",
    phone: "010-1234-5678",
    org: "화성시청",
    dept: "도로관리과",
    address: "경기도 화성시 향남로 45 시청본관",
    memo: "출고 전 연락 부탁드립니다",
  },
};
