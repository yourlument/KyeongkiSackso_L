"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProductIcon,
  ProgressOrderIcon,
  RevenueIcon,
  CompletedOrderIcon,
  ChevronRightIcon,
  PlusIcon,
  QuoteSubmitIcon,
  ShippingIcon,
} from "./dashboard-icons";

const INK = "#1D1D1F";
const NAVY = "#1E3A5F";
const CARD_BORDER = "1px solid rgba(210,210,215,0.2)";
const ROW_BORDER = "1px solid rgba(210,210,215,0.1)";

type Tab = "overview" | "stats";

const CARD: React.CSSProperties = {
  borderRadius: "19.52px",
  background: "#FFFFFF",
  border: CARD_BORDER,
};

export function PartnerDashboardView() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div>

      <div style={{ paddingBottom: "29.28px" }}>
        <h1 style={{ fontWeight: 700, fontSize: "20px", letterSpacing: "-0.56px", lineHeight: "25px", color: INK }}>
          파트너 대시보드
        </h1>
        <p style={{ marginTop: "2.44px", fontWeight: 400, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
          현황을 한눈에 확인하세요
        </p>
      </div>

      <div style={{ paddingBottom: "29.28px" }}>
        <div className="flex" style={{ borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>개요</TabButton>
          <TabButton active={tab === "stats"} onClick={() => setTab("stats")}>판매 통계</TabButton>
        </div>
      </div>

      {tab === "overview" ? <OverviewTab /> : <StatsTab />}
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
        fontWeight: 500,
        fontSize: "13px",
        letterSpacing: "-0.2928px",
        lineHeight: "22.75px",
        textAlign: "center",
        color: active ? NAVY : "rgba(29,29,31,0.4)",
        borderBottom: active ? `1px solid ${NAVY}` : "1px solid transparent",
        marginBottom: "-1px",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const OVERVIEW_STATS = [
  { icon: <ProductIcon />, iconBg: "rgba(30,58,95,0.12)", value: "4", label: "등록 상품" },
  { icon: <ProgressOrderIcon />, iconBg: undefined, value: "6", label: "진행 주문" },
  { icon: <RevenueIcon />, iconBg: undefined, value: "1680만", label: "이번달 매출" },
  { icon: <CompletedOrderIcon />, iconBg: undefined, value: "2", label: "완료 주문" },
];

type OrderStatus = { label: string; bg: string; border: string; color: string };
const ST_PAID: OrderStatus = { label: "결제완료", bg: "rgba(30,58,95,0.1)", border: "1px solid rgba(30,58,95,0.2)", color: NAVY };
const ST_WAIT: OrderStatus = { label: "대기", bg: "rgba(29,29,31,0.05)", border: "1px solid rgba(210,210,215,0.2)", color: "rgba(29,29,31,0.5)" };
const ST_SHIP: OrderStatus = { label: "배송중", bg: "#F0F9FF", border: "1px solid #BAE6FD", color: "#0369A1" };

const RECENT_ORDERS = [
  { title: "태블릿 PC 10인치 업무용", sub: "임현우 · 부천시청 · 2026-05-15", status: ST_PAID },
  { title: "무선 AP 엔터프라이즈", sub: "윤서진 · 안산시청 · 2026-05-10", status: ST_WAIT },
  { title: "서버랙 42U 기업용", sub: "강동현 · 평택시청 · 2026-05-01", status: ST_SHIP },
];

const OPEN_QUOTES = [
  { title: "2026년 2분기 도로보수 공사 자재 구매", sub: "경기도 화성시 도로과 · 마감 2026-06-15", budget: "8,000,000원" },
  { title: "2026년 화성시 도시개발 건자재 대규모 구매 (다수 업체 비교)", sub: "경기도 화성시 도시건설과 · 마감 2026-07-31", budget: "35,000,000원" },
  { title: "화성시청 IT장비 신규 구축 프로젝트", sub: "경기도 화성시 정보통신과 · 마감 2026-05-30", budget: "42,000,000원" },
];

const QUICK_ACTIONS = [
  { icon: <PlusIcon />, iconBg: "rgba(30,58,95,0.08)", title: "상품 등록", sub: "새 상품을 등록하세요", href: "/partner/products" },
  { icon: <QuoteSubmitIcon />, iconBg: undefined, title: "견적 제출", sub: "공고에 견적을 제출하세요", href: "/partner/quotes" },
  { icon: <ShippingIcon />, iconBg: undefined, title: "배송 처리", sub: "대기 중인 주문을 처리하세요", href: "/partner/orders" },
];

function OverviewTab() {
  const router = useRouter();

  return (
    <div>

      <div className="flex" style={{ gap: "19.52px", paddingBottom: "29.28px" }}>
        {OVERVIEW_STATS.map((s) => (
          <div key={s.label} style={{ ...CARD, width: "267px", padding: "20.52px" }}>
            <div style={{ paddingBottom: "14.64px" }}>
              <div className="flex items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "14.64px", background: s.iconBg }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: "20px", letterSpacing: "-0.3px", lineHeight: "36px", color: INK }}>{s.value}</div>
            <div style={{ marginTop: "4.88px", fontWeight: 400, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex" style={{ gap: "24.4px" }}>
        <SectionCard title="최근 주문" onAll={() => router.push("/partner/orders")}>
          {RECENT_ORDERS.map((o, i) => (
            <div
              key={o.title}
              className="flex items-center justify-between"
              style={{
                padding: i === 0 ? "14.64px 24.4px" : "15.64px 24.4px 14.64px",
                borderTop: i === 0 ? "none" : ROW_BORDER,
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: "13px", letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{o.title}</div>
                <div style={{ marginTop: "2.44px", fontWeight: 400, fontSize: "11px", letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{o.sub}</div>
              </div>
              <StatusPill status={o.status} />
            </div>
          ))}
        </SectionCard>

        <SectionCard title="참여 가능한 견적" onAll={() => router.push("/partner/quotes")}>
          {OPEN_QUOTES.map((q, i) => (
            <div
              key={q.title}
              style={{
                padding: i === 0 ? "14.64px 24.4px" : "15.64px 24.4px 14.64px",
                borderTop: i === 0 ? "none" : ROW_BORDER,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: "13px", letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{q.title}</div>
              <div className="flex items-center justify-between" style={{ marginTop: "4.88px" }}>
                <div style={{ fontWeight: 400, fontSize: "11px", letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{q.sub}</div>
                <div style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{q.budget}</div>
              </div>
            </div>
          ))}
        </SectionCard>
      </div>

      <div className="flex" style={{ gap: "19.52px", paddingTop: "24.4px" }}>
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.title}
            type="button"
            onClick={() => router.push(a.href)}
            className="text-left"
            style={{ ...CARD, width: "363px", padding: "25.4px", cursor: "pointer" }}
          >
            <div style={{ paddingBottom: "14.64px" }}>
              <div className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "14.64px", background: a.iconBg }}>
                {a.icon}
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: "13px", letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{a.title}</div>
            <div style={{ marginTop: "4.88px", fontWeight: 400, fontSize: "11px", letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{a.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, onAll, children }: { title: string; onAll: () => void; children: React.ReactNode }) {
  return (
    <div style={{ ...CARD, width: "100%", overflow: "hidden" }}>
      <div className="flex items-center justify-between" style={{ padding: "19.52px 24.4px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
        <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>{title}</span>
        <button type="button" onClick={onAll} className="flex items-center" style={{ gap: "4.88px", background: "transparent", cursor: "pointer" }}>
          <span style={{ fontWeight: 400, fontSize: "12px", letterSpacing: "-0.2928px", lineHeight: "21px", textAlign: "center", color: "rgba(29,29,31,0.5)" }}>전체보기</span>
          <ChevronRightIcon />
        </button>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className="inline-flex items-center"
      style={{ padding: "5.88px 13.2px", borderRadius: "9999px", background: status.bg, border: status.border, fontWeight: 500, fontSize: "11px", letterSpacing: "-0.165px", lineHeight: "19.8px", color: status.color }}
    >
      {status.label}
    </span>
  );
}

const STATS_KPIS = [
  { label: "총 매출", value: "2,280만원", delta: "+23%", deltaColor: "#059669", highlight: false },
  { label: "견적 채택률", value: "42%", delta: "+5%", deltaColor: "#059669", highlight: true },
  { label: "평균 단가", value: "89만원", delta: "-3%", deltaColor: "#EF4444", highlight: false },
  { label: "재구매율", value: "68%", delta: "+8%", deltaColor: "#059669", highlight: false },
];

const REVENUE_BARS = [
  { month: "1월", value: "320만", h: 84, color: NAVY },
  { month: "2월", value: "450만", h: 118, color: "#34D399" },
  { month: "3월", value: "380만", h: 100, color: "#38BDF8" },
  { month: "4월", value: "520만", h: 136, color: "#FBBF24" },
  { month: "5월", value: "610만", h: 160, color: "#2DD4BF" },
];

const QUOTE_BARS = [
  { month: "1월", value: "12건", h: 77, color: "rgba(30,58,95,0.8)" },
  { month: "2월", value: "18건", h: 115, color: "rgba(52,211,153,0.8)" },
  { month: "3월", value: "15건", h: 96, color: "rgba(56,189,248,0.8)" },
  { month: "4월", value: "22건", h: 141, color: "rgba(251,191,36,0.8)" },
  { month: "5월", value: "25건", h: 160, color: "rgba(45,212,191,0.8)" },
];

const CATEGORY_SHARE = [
  { name: "컴퓨터/노트북/태블릿", pct: 45, color: NAVY },
  { name: "프린터/스캐너 및 소모품", pct: 25, color: "#34D399" },
  { name: "네트워크 장비", pct: 20, color: "#38BDF8" },
  { name: "컴퓨터 주변기기", pct: 10, color: "#FBBF24" },
];

const MONTHLY_ORDERS = [
  { month: "5월", w: 291, color: NAVY, won: "610만원", cnt: "25건" },
  { month: "4월", w: 247, color: "#34D399", won: "520만원", cnt: "22건" },
  { month: "3월", w: 180, color: "#38BDF8", won: "380만원", cnt: "15건" },
  { month: "2월", w: 215, color: "#FBBF24", won: "450만원", cnt: "18건" },
  { month: "1월", w: 151, color: "#2DD4BF", won: "320만원", cnt: "12건" },
];

const MONTHLY_TRACK = 291;

function StatsTab() {
  return (
    <div>

      <div className="flex" style={{ gap: "19.52px", paddingBottom: "24.4px" }}>
        {STATS_KPIS.map((k) => (
          <div
            key={k.label}
            style={{
              width: "267px",
              padding: "20.52px",
              borderRadius: "19.52px",
              border: CARD_BORDER,
              background: k.highlight ? "rgba(30,58,95,0.06)" : "transparent",
            }}
          >
            <div style={{ fontWeight: 400, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{k.label}</div>
            <div className="flex items-center" style={{ marginTop: "4.88px", gap: "9.76px" }}>
              <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "-0.255px", lineHeight: "30.6px", color: INK }}>{k.value}</span>
              <span style={{ fontWeight: 500, fontSize: "11px", letterSpacing: "-0.165px", lineHeight: "19.8px", color: k.deltaColor }}>{k.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24.4px", alignItems: "start" }}>
        <BarChartCard title="월별 매출 (만원)" bars={REVENUE_BARS} />
        <BarChartCard title="월별 견적 참여 (건)" bars={QUOTE_BARS} />
        <CategoryShareCard />
        <MonthlyOrdersCard />
      </div>
    </div>
  );
}

function BarChartCard({ title, bars }: { title: string; bars: typeof REVENUE_BARS }) {
  return (
    <div style={{ ...CARD, width: "100%", height: "361px", padding: "25.4px" }}>
      <div style={{ paddingBottom: "19.52px", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>{title}</div>
      <div className="flex" style={{ gap: "19.52px", padding: "0 9.76px", height: "273px", alignItems: "flex-end" }}>
        {bars.map((b) => (
          <div key={b.month} className="flex flex-col items-center" style={{ gap: "7.32px", flex: "1 1 0" }}>
            <span style={{ fontWeight: 400, fontSize: "10px", letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.5)" }}>{b.value}</span>
            <div style={{ width: "100%", height: `${b.h}px`, background: b.color, borderRadius: "9.76px 9.76px 0 0" }} />
            <span style={{ fontWeight: 400, fontSize: "10px", letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.4)" }}>{b.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryShareCard() {
  return (
    <div style={{ ...CARD, width: "100%", height: "284px", padding: "25.4px" }}>
      <div style={{ paddingBottom: "19.52px", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>카테고리별 매출 비중</div>
      <div className="flex flex-col" style={{ gap: "17.08px" }}>
        {CATEGORY_SHARE.map((c) => (
          <div key={c.name}>
            <div className="flex items-center justify-between" style={{ paddingBottom: "7.32px" }}>
              <span style={{ fontWeight: 400, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)" }}>{c.name}</span>
              <span style={{ fontWeight: 600, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: INK }}>{c.pct}%</span>
            </div>
            <div style={{ height: "7px", borderRadius: "9999px", background: "rgba(210,210,215,0.2)", overflow: "hidden" }}>
              <div style={{ width: `${c.pct}%`, height: "100%", borderRadius: "9999px", background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyOrdersCard() {
  return (
    <div style={{ ...CARD, width: "100%", height: "284px", padding: "25.4px" }}>
      <div style={{ paddingBottom: "19.52px", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>월별 주문 현황</div>
      <div className="flex flex-col" style={{ gap: "14.64px" }}>
        {MONTHLY_ORDERS.map((m) => (
          <div key={m.month} className="flex items-center" style={{ gap: "14.64px" }}>
            <span style={{ flexShrink: 0, width: "39px", fontWeight: 400, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>{m.month}</span>
            <div style={{ flexShrink: 0, width: `${MONTHLY_TRACK}px`, height: "7px", borderRadius: "9999px", background: "rgba(210,210,215,0.2)", overflow: "hidden" }}>
              <div style={{ width: `${m.w}px`, height: "100%", borderRadius: "9999px", background: m.color }} />
            </div>
            <span style={{ flexShrink: 0, width: "78px", textAlign: "right", fontWeight: 500, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: INK }}>{m.won}</span>
            <span style={{ flexShrink: 0, width: "49px", textAlign: "right", fontWeight: 400, fontSize: "11px", letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{m.cnt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
