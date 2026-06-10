"use client";

import { useMemo, useState } from "react";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

type SettleStatus = "정산대기" | "정산완료";
type MonthlyRow = {
  month: string;
  total: string;
  orders: string;
  fee: string;
  payout: string;
  status: SettleStatus;
  payoutDate: string;
};

const MONTHLY: MonthlyRow[] = [
  { month: "2026-05", total: "16,800,000원", orders: "3건", fee: "-", payout: "16,800,000원", status: "정산대기", payoutDate: "2026-05-10" },
  { month: "2026-05", total: "3,490,000원", orders: "3건", fee: "-", payout: "3,490,000원", status: "정산완료", payoutDate: "2026-05-10" },
  { month: "2026-04", total: "3,390,000원", orders: "2건", fee: "-", payout: "3,390,000원", status: "정산완료", payoutDate: "2026-04-10" },
  { month: "2026-04", total: "8,650,000원", orders: "2건", fee: "-", payout: "8,650,000원", status: "정산대기", payoutDate: "2026-04-10" },
  { month: "2026-03", total: "2,400,000원", orders: "1건", fee: "-", payout: "2,400,000원", status: "정산완료", payoutDate: "2026-04-10" },
  { month: "2026-02", total: "9,750,000원", orders: "1건", fee: "-", payout: "9,750,000원", status: "정산완료", payoutDate: "2026-03-10" },
  { month: "2026-01", total: "36,450,000원", orders: "4건", fee: "-", payout: "36,450,000원", status: "정산완료", payoutDate: "2026-02-10" },
  { month: "2026-12", total: "18,500,000원", orders: "3건", fee: "-", payout: "18,500,000원", status: "정산완료", payoutDate: "2026-01-10" },
];

type OrderStatus = "결제완료" | "배송/진행중" | "완료";
type OrderRow = {
  id: string;
  date: string;
  no: string;
  org: string;
  dept: string;
  product: string;
  amount: string;
  status: OrderStatus;
};

const ORDERS: OrderRow[] = [
  { id: "ORD-2026-101", date: "2026-05-15", no: "ORD-2026-101", org: "화성시청", dept: "도로관리과", product: "반사형 교통콘 750mm 20개", amount: "900,000", status: "결제완료" },
  { id: "ORD-2026-102", date: "2026-05-10", no: "ORD-2026-102", org: "화성시청", dept: "정보통신과", product: "방호울타리 강관형 W-빔 4m 10개", amount: "1,200,000", status: "결제완료" },
  { id: "ORD-2026-103", date: "2026-05-05", no: "ORD-2026-103", org: "화성시청", dept: "안전총괄과", product: "도로표지판 주의 900mm 5개", amount: "400,000", status: "배송/진행중" },
  { id: "ORD-2026-104", date: "2026-04-20", no: "ORD-2026-104", org: "수원시청", dept: "총무과", product: "사무용 책상 1400x700 8개", amount: "1,440,000", status: "완료" },
  { id: "ORD-2026-105", date: "2026-04-15", no: "ORD-2026-105", org: "수원시청", dept: "보건소", product: "학생용 책상 600x400 30개", amount: "1,950,000", status: "완료" },
];

type SubscriptionRow = {
  paidAt: string;
  plan: string;
  amount: string;
  method: string;
  period: string;
};

const SUBSCRIPTIONS: SubscriptionRow[] = [
  { paidAt: "2026-05-08", plan: "프리미엄 (월간)", amount: "299,000", method: "법인카드", period: "2026.05.08 ~ 2026.06.07" },
  { paidAt: "2026-04-08", plan: "프리미엄 (월간)", amount: "299,000", method: "법인카드", period: "2026.04.08 ~ 2026.05.07" },
  { paidAt: "2026-03-08", plan: "프리미엄 (월간)", amount: "299,000", method: "법인카드", period: "2026.03.08 ~ 2026.04.07" },
  { paidAt: "2026-02-08", plan: "프리미엄 (월간)", amount: "299,000", method: "법인카드", period: "2026.02.08 ~ 2026.03.07" },
  { paidAt: "2026-01-08", plan: "프리미엄 (월간)", amount: "299,000", method: "법인카드", period: "2026.01.08 ~ 2026.02.07" },
];

const ORDER_FILTERS = ["전체", "완료", "배송중", "결제완료", "대기"] as const;
type OrderFilter = (typeof ORDER_FILTERS)[number];

export function SalesView() {
  const [tab, setTab] = useState<"sales" | "subscription">("sales");
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("전체");
  const [openOrder, setOpenOrder] = useState<OrderRow | null>(null);

  const filteredOrders = useMemo(() => {
    return ORDERS.filter((o) => {
      const matchQ = query.trim() ? (o.org + o.dept + o.no + o.product).includes(query.trim()) : true;
      const matchF =
        orderFilter === "전체"
          ? true
          : orderFilter === "완료"
            ? o.status === "완료"
            : orderFilter === "배송중"
              ? o.status === "배송/진행중"
              : orderFilter === "결제완료"
                ? o.status === "결제완료"
                : true;
      return matchQ && matchF;
    });
  }, [query, orderFilter]);

  return (
    <div>

      <div style={{ marginBottom: "29.28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", letterSpacing: "-0.56px", color: INK, margin: 0 }}>
          매출 및 이용권 내역
        </h1>
        <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
          판매 수익 관리와 플랫폼 이용료 결제 내역
        </p>
      </div>

      <div className="flex items-end" style={{ gap: "4.88px", marginBottom: "29.28px", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
        <TabButton active={tab === "sales"} onClick={() => setTab("sales")}>매출 내역 관리</TabButton>
        <TabButton active={tab === "subscription"} onClick={() => setTab("subscription")}>이용권 결제 내역</TabButton>
      </div>

      {tab === "sales" ? <SalesTab query={query} setQuery={setQuery} orderFilter={orderFilter} setOrderFilter={setOrderFilter} orders={filteredOrders} onOpenOrder={setOpenOrder} /> : <SubscriptionTab />}

      {openOrder && <OrderDetailModal order={openOrder} onClose={() => setOpenOrder(null)} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12.2px 19.52px 14.2px",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "22.75px",
        letterSpacing: "-0.293px",
        color: active ? NAVY : "rgba(29,29,31,0.4)",
        background: "none",
        border: "none",
        borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent",
        marginBottom: "-1px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SalesTab({
  query,
  setQuery,
  orderFilter,
  setOrderFilter,
  orders,
  onOpenOrder,
}: {
  query: string;
  setQuery: (v: string) => void;
  orderFilter: OrderFilter;
  setOrderFilter: (v: OrderFilter) => void;
  orders: OrderRow[];
  onOpenOrder: (o: OrderRow) => void;
}) {

  const MONTHLY_GRID = "134px 175px 107px 158px 188px 164px 152px";

  const ORDER_GRID = "140px 164px 128px minmax(0,1fr) 159px 168px 132px";

  return (
    <>

      <Card style={{ padding: "25.4px", marginBottom: "24.4px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "19.52px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, lineHeight: "17.5px", letterSpacing: "-0.392px", color: INK, margin: 0 }}>월별 정산 현황</h3>
          <div className="flex items-center" style={{ gap: "9.76px" }}>
            <Pill bg="#F0F9FF" border="#BAE6FD" color="#0369A1" icon="/icons/sales-pill-payout.svg">매월 10일 정산 지급</Pill>
            <Pill bg="#ECFDF5" border="#A7F3D0" color="#047857" icon="/icons/sales-pill-nofee.svg">플랫폼 수수료 없음</Pill>
          </div>
        </div>
        <div style={{ borderRadius: "8px", overflow: "hidden" }}>
          <div className="grid" style={{ gridTemplateColumns: MONTHLY_GRID, background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
            {["정산월", "총 매출", "주문수", "플랫폼 수수료", "정산금액", "상태", "지급 예정일"].map((h) => (
              <div key={h} style={{ padding: "12.2px 19.52px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
              </div>
            ))}
          </div>
          {MONTHLY.map((r, i) => (
            <div key={i} className="grid" style={{ gridTemplateColumns: MONTHLY_GRID, borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)" }}>
              <Cell><span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{r.month}</span></Cell>
              <Cell><span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{r.total}</span></Cell>
              <Cell><span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{r.orders}</span></Cell>
              <Cell><span style={{ fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "#059669" }}>{r.fee}</span></Cell>
              <Cell><span style={{ fontSize: "14px", fontWeight: 700, lineHeight: "25.2px", letterSpacing: "-0.21px", color: INK }}>{r.payout}</span></Cell>
              <Cell>
                {r.status === "정산대기" ? (
                  <StatusBadge bg="#FFFBEB" border="#FDE68A" color="#B45309">정산대기</StatusBadge>
                ) : (
                  <StatusBadge bg="#ECFDF5" border="#A7F3D0" color="#047857">정산완료</StatusBadge>
                )}
              </Cell>
              <Cell><span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>{r.payoutDate}</span></Cell>
            </div>
          ))}
        </div>
      </Card>

      <div
        style={{
          padding: "25.4px",
          marginBottom: "24.4px",
          borderRadius: "19.52px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: "linear-gradient(135deg, rgba(30,58,95,0.03) 0%, rgba(30,58,95,0) 100%)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex" style={{ gap: "14.64px" }}>
          <div className="flex shrink-0 items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "9.76px", background: "rgba(30,58,95,0.1)" }}>

            <img src="/icons/sales-info.svg" alt="" width={20} height={20} aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK, margin: 0 }}>정산 안내</p>
            <ul style={{ listStyle: "none", margin: "9.76px 0 0", padding: 0 }}>
              <InfoLi>
                정산금은&nbsp;<strong style={{ fontWeight: 500, color: INK }}>매월 10일</strong>에 등록하신 계좌로 지급됩니다
              </InfoLi>
              <InfoLi top="7.32px">
                <strong style={{ fontWeight: 500, color: INK }}>플랫폼 수수료는 0%</strong>&nbsp;— 전체 매출액이 그대로 정산됩니다
              </InfoLi>
              <InfoLi top="7.32px">정산 내역은 익월 초에 확정되며, 확정 후 10일 이내 지급 완료됩니다</InfoLi>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex" style={{ gap: "19.52px", marginBottom: "29.28px" }}>
        <SummaryCard label="총 주문 금액" value="5,890,000" iconBg="transparent" icon="/icons/sales-card-total.svg" />
        <SummaryCard label="정산 예정" value="2,500,000" iconBg="#FFFBEB" icon="/icons/sales-card-pending.svg" />
        <SummaryCard label="완료 금액" value="3,390,000" iconBg="#ECFDF5" icon="/icons/sales-card-done.svg" />
      </div>

      <Card style={{ padding: "20.52px", marginBottom: "19.52px" }}>
        <div className="flex items-center" style={{ gap: "14.64px" }}>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ left: "15.64px" }}>

              <img src="/icons/sales-search.svg" alt="" width={14} height={14} aria-hidden="true" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="기관/부서, 주문번호, 상품명 검색"
              className="w-full placeholder:text-[#9CA3AF] placeholder:font-medium"
              style={{ height: "49px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 15.64px 0 44.92px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", color: INK, outline: "none" }}
            />
          </div>
          <div className="flex items-center" style={{ gap: "9.76px" }}>
            <DateInput />
            <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.3)" }}>~</span>
            <DateInput />
          </div>
          <div className="relative">
            <select
              aria-label="정렬"
              className="cursor-pointer appearance-none outline-none"
              style={{ height: "51px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 34px 0 15.64px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", color: INK }}
            >
              <option>최신순</option>
            </select>

            <img src="/icons/sales-select-chevron.svg" alt="" width={8} height={4} aria-hidden="true" className="pointer-events-none absolute right-[15.64px] top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="flex items-center" style={{ gap: "9.76px", marginTop: "14.64px" }}>
          {ORDER_FILTERS.map((f) => {
            const active = orderFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setOrderFilter(f)}
                style={{
                  padding: "8.32px 15.64px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "21px",
                  letterSpacing: "-0.293px",
                  cursor: "pointer",
                  background: active ? NAVY : "#fff",
                  color: active ? "#fff" : "rgba(29,29,31,0.5)",
                  border: active ? `1px solid ${NAVY}` : "1px solid rgba(210,210,215,0.3)",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </Card>

      <div style={{ borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <div className="grid" style={{ gridTemplateColumns: ORDER_GRID, background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          {["주문 일자", "주문번호", "구매자", "상품", "금액", "상태", ""].map((h, i) => (
            <div key={i} style={{ padding: "14.64px 24.4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, lineHeight: "19.8px", letterSpacing: "0.275px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
            </div>
          ))}
        </div>
        {orders.map((o, i) => (
          <div key={o.id} className="grid" style={{ gridTemplateColumns: ORDER_GRID, borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)", minHeight: "86px" }}>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>{o.date}</span></Cell>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)" }}>{o.no}</span></Cell>
            <Cell pad="19.52px 24.4px">
              <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK, margin: 0 }}>{o.org}</p>
              <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>{o.dept}</p>
            </Cell>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.6)" }}>{o.product}</span></Cell>
            <Cell pad="19.52px 24.4px">
              <span style={{ fontSize: "14px", fontWeight: 700, lineHeight: "25.2px", letterSpacing: "-0.21px", color: INK }}>{o.amount}</span>
              <span style={{ fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", marginLeft: "2px" }}>원</span>
            </Cell>
            <Cell pad="19.52px 24.4px"><OrderStatusBadge status={o.status} /></Cell>
            <Cell pad="19.52px 24.4px">
              <button
                type="button"
                onClick={() => onOpenOrder(o)}
                style={{ alignSelf: "flex-start", width: "fit-content", padding: "8.32px 15.64px", borderRadius: "9.76px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.24px", color: "rgba(29,29,31,0.5)", cursor: "pointer" }}
              >
                상세
              </button>
            </Cell>
          </div>
        ))}
      </div>
    </>
  );
}

function SubscriptionTab() {

  const GRID = "165px 201px 171px 143px 274px 172px";

  return (
    <>

      <Card style={{ padding: "25.4px", marginBottom: "29.28px" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: "19.52px" }}>
            <div className="flex shrink-0 items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "14.64px", background: "rgba(30,58,95,0.1)" }}>

              <img src="/icons/sales-plan.svg" alt="" width={20} height={18} aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: 0 }}>현재 이용 중인 플랜</p>
              <p style={{ fontSize: "16px", fontWeight: 700, lineHeight: "28.8px", letterSpacing: "-0.24px", color: INK, margin: 0 }}>프리미엄 (월간)</p>
              <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>잔여 기간: 2026.05.08 ~ 2026.06.07</p>
            </div>
          </div>
          <div className="text-right">
            <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0 }}>월 이용료</p>
            <p style={{ margin: 0 }}>
              <span style={{ fontSize: "22px", fontWeight: 700, lineHeight: "22px", letterSpacing: "-0.33px", color: INK }}>299,000</span>
              <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: "25.2px", letterSpacing: "-0.21px", color: "rgba(29,29,31,0.4)", marginLeft: "5px" }}>원</span>
            </p>
          </div>
        </div>
      </Card>

      <div style={{ borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between" style={{ padding: "17.08px 24.4px 18.08px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, lineHeight: "16.25px", letterSpacing: "-0.364px", color: INK, margin: 0 }}>결제 히스토리</h3>
          <span style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.3)" }}>5건</span>
        </div>
        <div className="grid" style={{ gridTemplateColumns: GRID, background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          {["결제 일시", "이용권 종류", "결제 금액", "결제 수단", "이용 기간", ""].map((h, i) => (
            <div key={i} style={{ padding: "14.64px 24.4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, lineHeight: "19.8px", letterSpacing: "0.275px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
            </div>
          ))}
        </div>
        {SUBSCRIPTIONS.map((s, i) => (
          <div key={i} className="grid" style={{ gridTemplateColumns: GRID, borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)", minHeight: "78px" }}>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>{s.paidAt}</span></Cell>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{s.plan}</span></Cell>
            <Cell pad="19.52px 24.4px">
              <span style={{ fontSize: "14px", fontWeight: 700, lineHeight: "25.2px", letterSpacing: "-0.21px", color: INK }}>{s.amount}</span>
              <span style={{ fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", marginLeft: "2px" }}>원</span>
            </Cell>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>{s.method}</span></Cell>
            <Cell pad="19.52px 24.4px"><span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>{s.period}</span></Cell>
            <Cell pad="19.52px 24.4px">
              <button type="button" style={{ alignSelf: "flex-start", width: "fit-content", padding: "8.32px 15.64px", borderRadius: "9.76px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.24px", color: "rgba(29,29,31,0.4)", cursor: "pointer" }}>
                영수증
              </button>
            </Cell>
          </div>
        ))}
      </div>
    </>
  );
}

function OrderDetailModal({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const unitPrice = order.id === "ORD-2026-101" ? "45,000" : "";
  const qty = order.product.match(/(\d+)개$/)?.[1] ?? "";
  const productName = order.product.replace(/\s\d+개$/, "");
  const amountWon = `${order.amount}원`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: "19.52px" }}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} aria-hidden="true" />
      <div
        className="relative flex max-h-full flex-col"
        style={{ width: "623px", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", boxShadow: "0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.1)", overflow: "hidden" }}
      >

        <div
          className="flex shrink-0 items-center justify-between"
          style={{ padding: "19.52px 24.4px 20.52px", background: "rgba(255,255,255,0.95)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}
        >
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, lineHeight: "18.75px", letterSpacing: "-0.42px", color: INK, margin: 0 }}>주문 상세</h2>
            <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>
              {order.no} · {order.date}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="flex items-center justify-center" style={{ width: "34px", height: "34px", borderRadius: "9999px", border: "none", background: "none", cursor: "pointer" }}>

            <img src="/icons/sales-modal-close.svg" alt="" width={20} height={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "24.4px" }}>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "19.52px" }}>
            <SummaryField label="주문번호" value={order.no} valueSize="12px" valueWeight={400} />
            <SummaryField label="결제 일시" value={order.date} valueSize="13px" valueWeight={400} />
            <SummaryField label="결제 수단" value="카드결제" valueSize="13px" valueWeight={400} />
            <div>
              <p style={{ fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "0.275px", color: "rgba(29,29,31,0.4)", margin: "0 0 4.88px" }}>주문 상태</p>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <Section title="주문 품목">
            <div style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
              <div className="flex items-center justify-between" style={{ padding: "14.64px 19.52px 15.64px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK, margin: 0 }}>{productName}</p>
                  <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0 }}>
                    {qty}개{unitPrice && ` · 단가 ${unitPrice}원`}
                  </p>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{amountWon}</span>
              </div>
              <div className="flex items-center justify-between" style={{ padding: "14.64px 19.52px", background: "rgba(30,58,95,0.03)" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>합계</span>
                <span style={{ fontSize: "15px", fontWeight: 700, lineHeight: "27px", letterSpacing: "-0.225px", color: INK }}>{amountWon}</span>
              </div>
            </div>
          </Section>

          <Section
            title="세금계산서 발행 정보"
            trailing={<StatusBadge bg="#FFFBEB" border="#FDE68A" color="#B45309">발행 요청</StatusBadge>}
          >
            <InfoBox>
              <InfoGridField label="기관명(상호)" value="화성시청" />
              <InfoGridField label="사업자등록번호" value="134-83-00001" />
              <InfoGridField label="대표자(기관장)" value="홍길동" />
              <InfoGridField label="수신 이메일" value="tax@hwaseong.go.kr" />
              <InfoGridField label="사업장 주소" value="경기도 화성시 중앙로 100 화성시청" full />
            </InfoBox>
          </Section>

          <Section title="납품 정보">
            <InfoBox>
              <InfoGridField label="납품기한" value="2026-05-25" />
              <InfoGridField label="납품일" value="-" />
              <InfoGridField label="납품장소" value="경기도 화성시 향남로 45 시청본관 도로과" full />
              <InfoGridField label="담당자 연락처" value="010-1234-5678" />
            </InfoBox>
          </Section>

          <Section title="수령인 / 배송 정보">
            <InfoBox>
              <InfoGridField label="수령인/담당자" value="김과장" />
              <InfoGridField label="연락처" value="010-1234-5678" />
              <InfoGridField label="소속 기관" value="화성시청" />
              <InfoGridField label="소속 부서" value="도로관리과" />
              <InfoGridField label="배송지 주소" value="경기도 화성시 향남로 45 시청본관" full />
              <InfoGridField label="배송 메모" value="출고 전 연락 부탁드립니다" full />
            </InfoBox>
          </Section>

          <div style={{ paddingTop: "20.52px", marginTop: "24.4px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, lineHeight: "19.8px", letterSpacing: "0.275px", color: "rgba(29,29,31,0.4)", margin: "0 0 9.76px" }}>증빙 서류 출력</p>
            <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.3)", margin: "0 0 14.64px" }}>클릭 시 새 창에서 열립니다.</p>
            <div className="flex" style={{ gap: "9.76px" }}>
              <DocButton>구매확인서</DocButton>
              <DocButton>매출 전표</DocButton>
              <DocButton disabled>세금 계산서 🔒</DocButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function Cell({ children, pad = "14.64px 19.52px" }: { children: React.ReactNode; pad?: string }) {
  return <div className="flex flex-col justify-center" style={{ padding: pad }}>{children}</div>;
}

function Pill({ bg, border, color, icon, children }: { bg: string; border: string; color: string; icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center" style={{ gap: "4.88px", padding: "5.88px 13.2px", borderRadius: "9999px", background: bg, border: `1px solid ${border}` }}>

      <img src={icon} alt="" width={10} height={10} aria-hidden="true" />
      <span style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color }}>{children}</span>
    </span>
  );
}

function StatusBadge({ bg, border, color, children }: { bg: string; border: string; color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center self-start" style={{ padding: "5.88px 13.2px", borderRadius: "9999px", background: bg, border: `1px solid ${border}` }}>
      <span style={{ fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "-0.165px", color }}>{children}</span>
    </span>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "결제완료") return <StatusBadge bg="rgba(30,58,95,0.1)" border="rgba(30,58,95,0.2)" color={NAVY}>결제완료</StatusBadge>;
  if (status === "배송/진행중") return <StatusBadge bg="#F0F9FF" border="#BAE6FD" color="#0369A1">배송/진행중</StatusBadge>;
  return <StatusBadge bg="#ECFDF5" border="#A7F3D0" color="#047857">완료</StatusBadge>;
}

function InfoLi({ children, top }: { children: React.ReactNode; top?: string }) {
  return (
    <li className="flex items-center" style={{ gap: "9.76px", marginTop: top ?? 0 }}>

      <img src="/icons/sales-li-check.svg" alt="" width={11} height={8} aria-hidden="true" className="shrink-0" />
      <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.6)" }}>{children}</span>
    </li>
  );
}

function SummaryCard({ label, value, iconBg, icon }: { label: string; value: string; iconBg: string; icon: string }) {
  return (
    <Card style={{ flex: 1, padding: "25.4px" }}>
      <div className="flex items-start justify-between" style={{ marginBottom: "14.64px" }}>
        <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}>{label}</span>
        <span className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: iconBg }}>

          <img src={icon} alt="" width={18} height={18} aria-hidden="true" />
        </span>
      </div>
      <p style={{ margin: 0 }}>
        <span style={{ fontSize: "22px", fontWeight: 700, lineHeight: "22px", letterSpacing: "-0.33px", color: INK }}>{value}</span>
        <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: "25.2px", letterSpacing: "-0.21px", color: "rgba(29,29,31,0.5)", marginLeft: "5px" }}>원</span>
      </p>
    </Card>
  );
}

function DateInput() {
  return (
    <div className="flex items-center justify-between" style={{ width: "143px", height: "51px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 15.64px" }}>
      <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.293px", color: INK }}>-/-/-</span>

      <img src="/icons/sales-date.svg" alt="" width={13} height={14} aria-hidden="true" />
    </div>
  );
}

function SummaryField({ label, value, valueSize, valueWeight }: { label: string; value: string; valueSize: string; valueWeight: number }) {

  const lh = valueSize === "13px" ? "22.75px" : "21.6px";
  const ls = valueSize === "13px" ? "-0.195px" : "-0.18px";
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "0.275px", color: "rgba(29,29,31,0.4)", margin: "0 0 4.88px" }}>{label}</p>
      <p style={{ fontSize: valueSize, fontWeight: valueWeight, lineHeight: lh, letterSpacing: ls, color: INK, margin: 0 }}>{value}</p>
    </div>
  );
}

function Section({ title, trailing, children }: { title: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: "20.52px", marginTop: "24.4px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "14.64px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, lineHeight: "19.8px", letterSpacing: "0.275px", color: "rgba(29,29,31,0.4)" }}>{title}</span>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14.64px", padding: "20.52px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", background: "rgba(29,29,31,0.01)" }}>
      {children}
    </div>
  );
}

function InfoGridField({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: "0 0 2.44px" }}>{label}</p>
      <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: INK, margin: 0 }}>{value}</p>
    </div>
  );
}

function DocButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        flex: 1,
        padding: "13.2px 1px",
        borderRadius: "14.64px",
        border: `1px solid rgba(210,210,215,${disabled ? "0.1" : "0.2"})`,
        background: "#fff",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "21px",
        letterSpacing: "-0.293px",
        color: disabled ? "rgba(29,29,31,0.3)" : "rgba(29,29,31,0.6)",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
