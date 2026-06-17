"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardOverview, PartnerStats } from "@/lib/partner-dashboard";
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

export function PartnerDashboardView({ overview, stats }: { overview: DashboardOverview; stats: PartnerStats }) {
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

      {tab === "overview" ? <OverviewTab overview={overview} /> : <StatsTab stats={stats} />}
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

const OVERVIEW_STAT_CONFIG = [
  { icon: <ProductIcon />, iconBg: "rgba(30,58,95,0.12)", label: "등록 상품", key: "products" as const },
  { icon: <ProgressOrderIcon />, iconBg: undefined, label: "진행 주문", key: "inProgress" as const },
  { icon: <RevenueIcon />, iconBg: undefined, label: "이번달 매출", key: "thisMonthRevenue" as const },
  { icon: <CompletedOrderIcon />, iconBg: undefined, label: "완료 주문", key: "completed" as const },
];

type OrderStatus = { label: string; bg: string; border: string; color: string };

const QUICK_ACTIONS = [
  { icon: <PlusIcon />, iconBg: "rgba(30,58,95,0.08)", title: "상품 등록", sub: "새 상품을 등록하세요", href: "/partner/products" },
  { icon: <QuoteSubmitIcon />, iconBg: undefined, title: "견적 제출", sub: "공고에 견적을 제출하세요", href: "/partner/quotes" },
  { icon: <ShippingIcon />, iconBg: undefined, title: "배송 처리", sub: "대기 중인 주문을 처리하세요", href: "/partner/orders" },
];

function OverviewTab({ overview }: { overview: DashboardOverview }) {
  const router = useRouter();
  const statValue: Record<string, string | number> = {
    products: overview.stats.products,
    inProgress: overview.stats.inProgress,
    thisMonthRevenue: overview.stats.thisMonthRevenue,
    completed: overview.stats.completed,
  };

  return (
    <div>
      <div className="flex" style={{ gap: "19.52px", paddingBottom: "29.28px" }}>
        {OVERVIEW_STAT_CONFIG.map((s) => (
          <div key={s.label} style={{ ...CARD, width: "267px", padding: "20.52px" }}>
            <div style={{ paddingBottom: "14.64px" }}>
              <div className="flex items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "14.64px", background: s.iconBg }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: "20px", letterSpacing: "-0.3px", lineHeight: "36px", color: INK }}>{statValue[s.key]}</div>
            <div style={{ marginTop: "4.88px", fontWeight: 400, fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex" style={{ gap: "24.4px" }}>
        <SectionCard title="최근 주문" onAll={() => router.push("/partner/orders")}>
          {overview.recentOrders.map((o, i) => (
            <div
              key={o.id}
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
          {overview.openQuotes.map((q, i) => (
            <div
              key={i}
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

const MONTHLY_TRACK = 291;

function StatsTab({ stats }: { stats: PartnerStats }) {
  return (
    <div>
      <div className="flex" style={{ gap: "19.52px", paddingBottom: "24.4px" }}>
        {stats.kpis.map((k) => (
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
        <BarChartCard title="월별 매출 (만원)" bars={stats.revenueBars} />
        <BarChartCard title="월별 견적 참여 (건)" bars={stats.quoteBars} />
        <CategoryShareCard items={stats.categoryShare} />
        <MonthlyOrdersCard rows={stats.monthlyOrders} />
      </div>
    </div>
  );
}

function BarChartCard({ title, bars }: { title: string; bars: PartnerStats["revenueBars"] }) {
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

function CategoryShareCard({ items }: { items: PartnerStats["categoryShare"] }) {
  return (
    <div style={{ ...CARD, width: "100%", height: "284px", padding: "25.4px" }}>
      <div style={{ paddingBottom: "19.52px", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>카테고리별 매출 비중</div>
      <div className="flex flex-col" style={{ gap: "17.08px" }}>
        {items.map((c) => (
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

function MonthlyOrdersCard({ rows }: { rows: PartnerStats["monthlyOrders"] }) {
  return (
    <div style={{ ...CARD, width: "100%", height: "284px", padding: "25.4px" }}>
      <div style={{ paddingBottom: "19.52px", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>월별 주문 현황</div>
      <div className="flex flex-col" style={{ gap: "14.64px" }}>
        {rows.map((m) => (
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
