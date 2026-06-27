"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MyInfoIcon,
  PurchaseIcon,
  QuoteMgmtIcon,
  DemandPostIcon,
  InfoSharePostIcon,
  InquiryIcon,
  AlarmIcon,
  WithdrawIcon,
  TermCheckIcon,
  AlarmCheckIcon,
  ConfirmCheckIcon,
  CompanyAvatarIcon,
} from "./mypage-icons";
import {
  OFFICIAL_TABS,
  SUPPLIER_TABS,
  ALARM_LABELS,
  WITHDRAW_NOTES,
  type OfficialTabKey,
  type SupplierTabKey,
  type PurchaseStatus,
  type PurchaseAction,
  type PurchaseRow,
  type QuoteNoticeStatus,
  type ProductQuoteStatus,
  type ProductQuoteRow,
  type InquiryKind,
  type InquiryStatus,
  type OrderDetail,
  TERMS_REQUIRED,
  TERMS_OPTIONAL,
  type Term,
} from "./mypage-data";
import type { MyPageData, MyDemandPost, MyInfoPost, MyInquiryRow, MyBasicInfo, MySupplierField, MyDemandAnswer, MyQuoteNoticeRow, MyQuoteRequestDetailView } from "@/lib/mypage";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

type Role = "official" | "supplier";

export function MyPageView({ role = "official", data }: { role?: Role; data: MyPageData }) {
  return role === "supplier" ? <SupplierView data={data} /> : <OfficialView data={data} />;
}

function PageShell({
  headerSub,
  sidebar,
  children,
}: {
  headerSub: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#FAFAFA" }}>
      <div style={{ background: "#fff", borderBottom: `1px solid rgba(210,210,215,0.2)` }}>
        <div className="mx-auto w-full" style={{ maxWidth: "1440px", padding: "39.04px 48.8px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "1.1px", color: "rgba(30,58,95,0.6)", margin: 0, lineHeight: "19.8px" }}>My Page</p>
          <h1 style={{ fontSize: "26px", fontWeight: 700, lineHeight: "32.5px", letterSpacing: "-0.65px", color: INK, margin: "7.32px 0 0" }}>마이페이지</h1>
          <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>{headerSub}</p>
        </div>
      </div>

      <div className="mx-auto w-full" style={{ maxWidth: "1440px", padding: "39.04px 48.8px 78.08px" }}>
        <div className="flex items-start" style={{ gap: "29.28px" }}>
          <aside style={{ width: "254px", flexShrink: 0, position: "sticky", top: "77px", alignSelf: "flex-start" }}>{sidebar}</aside>
          <section style={{ flex: 1, minWidth: 0 }}>{children}</section>
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_ICON: Record<string, (p: { className?: string }) => React.ReactElement> = {
  info: MyInfoIcon,
  purchase: PurchaseIcon,
  quote: QuoteMgmtIcon,
  demand: DemandPostIcon,
  answer: DemandPostIcon,
  infoshare: InfoSharePostIcon,
  inquiry: InquiryIcon,
  alarm: AlarmIcon,
  withdraw: WithdrawIcon,
};

function Sidebar<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onSelect: (k: T) => void;
}) {
  return (
    <div style={{ borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "1px", overflow: "hidden" }}>
      {items.map((t) => {
        const Icon = SIDEBAR_ICON[t.key];
        const on = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(t.key)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              textAlign: "left",
              gap: "14.64px",
              padding: "14.64px 19.52px 15.64px",
              border: "none",
              background: on ? NAVY : "transparent",
              color: on ? "#fff" : "rgba(29,29,31,0.5)",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "inline-flex", width: "15px", justifyContent: "center" }}>
              <Icon />
            </span>
            <span style={{ fontSize: "12px", fontWeight: on ? 600 : 400, letterSpacing: "-0.18px", lineHeight: "21.6px", whiteSpace: "nowrap" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div style={{ borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, overflow: "hidden" }}>{children}</div>;
}

function PanelHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ padding: "24.4px 29.28px 25.4px", borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
      <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>{sub}</p>}
    </div>
  );
}

type BadgeT = { bg: string; border: string; color: string };
const PURCHASE_BADGE: Record<PurchaseStatus, BadgeT> = {
  납품완료: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  구매확정: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  "세금계산서 발행완료": { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY },
  결제완료: { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY },
  배송중: { bg: "#F0F9FF", border: "#BAE6FD", color: "#0369A1" },
  결제대기: { bg: "rgba(29,29,31,0.05)", border: "rgba(210,210,215,0.2)", color: "rgba(29,29,31,0.5)" },
  "세금계산서 발행요청": { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
};
const QUOTE_BADGE: Record<QuoteNoticeStatus, BadgeT> = {
  공고중: { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY },
  검토중: { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY },
  선정완료: { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY },
  마감: { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY },
};
const PRODUCT_BADGE: Record<ProductQuoteStatus, BadgeT> = {
  대기중: { bg: "rgba(29,29,31,0.05)", border: "rgba(210,210,215,0.2)", color: "rgba(29,29,31,0.5)" },
  "견적 도착": { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
};
const GREEN_BADGE: BadgeT = { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" };
const NAVY_SOFT_BADGE: BadgeT = { bg: "rgba(30,58,95,0.1)", border: "rgba(30,58,95,0.2)", color: NAVY };
const INQUIRY_BADGE: Record<InquiryStatus, BadgeT> = {
  접수: { bg: "#F3F4F6", border: "#D1D5DB", color: "#374151" },
  처리중: { bg: "#E5E7EB", border: "#D1D5DB", color: "#1F2937" },
  완료: { bg: "#111827", border: "#E5E7EB", color: "#fff" },
  반려: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};
const SUPPLIER_INQUIRY_BADGE: Record<InquiryStatus, BadgeT> = {
  접수: { bg: "#F3F4F6", border: "#D1D5DB", color: "#374151" },
  처리중: { bg: "#E5E7EB", border: "#D1D5DB", color: "#1F2937" },
  완료: { bg: "#111827", border: "#E5E7EB", color: "#FFFFFF" },
  반려: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};

function Pill({ t, children }: { t: BadgeT; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        padding: "5.88px 13.2px",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "-0.165px",
        lineHeight: "19.8px",
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function OfficialView({ data }: { data: MyPageData }) {
  const [tab, setTab] = useState<OfficialTabKey>("purchase");
  return (
    <PageShell headerSub={data.headerSub} sidebar={<Sidebar items={OFFICIAL_TABS} active={tab} onSelect={setTab} />}>
      {tab === "info" && <InfoTab basicInfo={data.basicInfo} />}
      {tab === "purchase" && <PurchaseTab purchases={data.purchases} orderDetails={data.orderDetails} />}
      {tab === "quote" && <QuoteTab notices={data.quoteNotices} products={data.productQuotes} details={data.quoteDetails} />}
      {tab === "demand" && <DemandTab posts={data.demandPosts} />}
      {tab === "infoshare" && <InfoShareTab posts={data.infoPosts} />}
      {tab === "inquiry" && <InquiryTab items={data.inquiries} />}
      {tab === "alarm" && <AlarmTab values={data.alarmSettings} />}
      {tab === "withdraw" && <WithdrawTab />}
    </PageShell>
  );
}

const P_GRID = "93px 84px 157px 102px 108px 158px 166px";

function PurchaseTab({ purchases, orderDetails }: { purchases: PurchaseRow[]; orderDetails: Record<string, OrderDetail> }) {
  const router = useRouter();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [confirmNo, setConfirmNo] = useState<string | null>(null);
  const [refundNo, setRefundNo] = useState<string | null>(null);
  const [taxBusy, setTaxBusy] = useState<string | null>(null);

  function openDetail(orderNo: string) {
    setDetail(orderDetails[orderNo] ?? null);
  }

  async function requestTax(orderNo: string) {
    if (taxBusy) return;
    setTaxBusy(orderNo);
    try {
      const res = await fetch(`/api/mypage/orders/${encodeURIComponent(orderNo)}/tax-request`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setTaxBusy(null);
    }
  }

  return (
    <>
      <Panel>
        <PanelHead title="구매 내역" sub="구매 이력, 환불 신청, 구매 확정 및 증빙 서류 출력" />
        <div className="grid items-center" style={{ gridTemplateColumns: P_GRID, gap: "19.52px", padding: "14.64px 19.52px", background: "rgba(29,29,31,0.02)", borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
          {["결제 일시", "주문 번호", "물품/용역명", "판매 업체명", "결제 금액", "상태", ""].map((h, i) => (
            <span key={i} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
          ))}
        </div>
        {purchases.map((r) => (
          <PurchaseRowView key={r.orderNo} r={r} onDetail={() => openDetail(r.orderNo)} onConfirm={() => setConfirmNo(r.orderNo)} onRefund={() => setRefundNo(r.orderNo)} onTaxRequest={() => requestTax(r.orderNo)} />
        ))}
      </Panel>

      {detail && <OrderDetailModal d={detail} onClose={() => setDetail(null)} />}
      {confirmNo && <ConfirmPurchaseModal orderNo={confirmNo} onClose={() => setConfirmNo(null)} />}
      {refundNo && <RefundModal orderNo={refundNo} onClose={() => setRefundNo(null)} />}
    </>
  );
}

function PurchaseRowView({ r, onDetail, onConfirm, onRefund, onTaxRequest }: { r: PurchaseRow; onDetail: () => void; onConfirm: () => void; onRefund: () => void; onTaxRequest: () => void }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: P_GRID, gap: "19.52px", padding: "16px 19.52px", borderBottom: `1px solid rgba(210,210,215,0.1)`, alignItems: "flex-start" }}>
      <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", paddingTop: "2px" }}>{r.date}</span>
      <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", paddingTop: "2px" }}>{r.orderNo}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, margin: 0 }}>{r.name}</p>
        <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{r.spec}</p>
      </div>
      <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)", paddingTop: "0px" }}>{r.supplier}</span>
      <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{r.amount}</span>
      <div className="flex flex-col" style={{ gap: "6px", alignItems: "flex-start" }}>
        {r.statuses.map((s) => (
          <Pill key={s} t={PURCHASE_BADGE[s]}>{s}</Pill>
        ))}
      </div>
      <div className="flex flex-col" style={{ gap: "8px", alignItems: "flex-start" }}>
        {r.actions.map((a, k) => (
          <PurchaseActionBtn key={k} action={a} orderNo={r.orderNo} onDetail={onDetail} onConfirm={onConfirm} onRefund={onRefund} onTaxRequest={onTaxRequest} />
        ))}
      </div>
    </div>
  );
}

function PurchaseActionBtn({ action, onDetail, onConfirm, onRefund, onTaxRequest }: { action: PurchaseAction; orderNo: string; onDetail: () => void; onConfirm: () => void; onRefund: () => void; onTaxRequest: () => void }) {
  if (action.kind === "detail")
    return <button type="button" onClick={onDetail} style={linkBtn(NAVY)}>상세 / 증빙</button>;
  if (action.kind === "refund")
    return <button type="button" onClick={onRefund} style={{ ...linkBtn(INK), fontWeight: 400 }}>환불 신청</button>;
  if (action.kind === "tax-request")
    return <button type="button" onClick={onTaxRequest} style={{ ...solidBtn, background: "#D97706" }}>세금계산서 발행 요청</button>;
  return <button type="button" onClick={onConfirm} style={{ ...solidBtn, background: NAVY }}>구매 확정</button>;
}

function linkBtn(color: string): React.CSSProperties {
  return { fontSize: "12px", fontWeight: 500, letterSpacing: "-0.24px", lineHeight: "21.6px", color, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", whiteSpace: "nowrap", textDecoration: "underline" };
}
const solidBtn: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "-0.24px",
  lineHeight: "21.6px",
  color: "#fff",
  borderRadius: "9.76px",
  border: "none",
  cursor: "pointer",
  padding: "4.88px 12.2px",
  whiteSpace: "nowrap",
};

function OrderDetailModal({ d, onClose }: { d: OrderDetail; onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ width: "625px", maxWidth: "calc(100vw - 40px)", maxHeight: "90vh", overflowY: "auto", borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)` }}>
        <div className="flex items-center justify-between" style={{ padding: "24.4px 29.28px", borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK, margin: 0 }}>주문 상세</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(29,29,31,0.4)", display: "inline-flex" }} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div style={{ padding: "24.4px 29.28px 29.28px" }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px 40px" }}>
            <KV label="주문번호" value={d.orderNo} />
            <KV label="결제 일시" value={d.payDate} />
            <KV label="결제 수단" value={d.payMethod} />
            <KVStatus label="주문 상태" status={d.status} />
          </div>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "24px 0 12px" }}>주문 품목</p>
          <div style={{ borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, overflow: "hidden" }}>
            {d.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between" style={{ gap: "16px", padding: "14px 18px", borderTop: i === 0 ? "none" : `1px solid rgba(210,210,215,0.1)` }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "21px", color: INK, margin: 0 }}>{it.name}</p>
                  <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{it.qtyUnit}</p>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", color: INK, whiteSpace: "nowrap" }}>{it.amount}</span>
              </div>
            ))}
            <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderTop: `1px solid rgba(210,210,215,0.1)`, background: "rgba(29,29,31,0.02)" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", color: INK }}>합계</span>
              <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", color: INK }}>{d.total}</span>
            </div>
          </div>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "24px 0 12px" }}>세금계산서 발행 정보</p>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px 40px" }}>
            <KV label="기관명(상호)" value={d.tax.org} />
            <KV label="사업자등록번호" value={d.tax.bizNo} />
            <KV label="대표자(기관장)" value={d.tax.ceo} />
            <KV label="수신 이메일" value={d.tax.email} />
          </div>
          <div style={{ marginTop: "16px" }}>
            <KV label="사업장 주소" value={d.tax.address} />
          </div>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", margin: "12px 0 0" }}>* 세금계산서 발행 정보 변경이 필요한 경우 관리자에게 문의하세요.</p>

          {d.taxIssued && (
            <div style={{ marginTop: "24.4px", borderRadius: "14.64px", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "20.52px" }}>
              <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "4.88px" }}>
                <TermCheckIcon style={{ width: "14px", height: "14px", color: "#059669" }} />
                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#047857" }}>세금계산서 발행 완료</span>
              </div>
              <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#059669", margin: 0 }}>세금계산서가 발행되었습니다. 아래 버튼으로 다운로드 가능합니다.</p>
            </div>
          )}

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "24px 0 4px" }}>증빙 서류 출력</p>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", margin: "0 0 12px" }}>클릭 시 새 창에서 열립니다.</p>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <DocBtn label="구매확인서" href={`/api/orders/${encodeURIComponent(d.orderNo)}/document?type=purchase`} />
            <DocBtn label="매출 전표" href={`/api/orders/${encodeURIComponent(d.orderNo)}/document?type=sales`} />
            <DocBtn label="세금 계산서" locked={!d.taxIssued} href={`/api/orders/${encodeURIComponent(d.orderNo)}/document?type=tax`} />
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "22.75px", color: INK, margin: "2px 0 0", wordBreak: "break-all" }}>{value}</p>
    </div>
  );
}
function KVStatus({ label, status }: { label: string; status: PurchaseStatus }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 4px" }}>{label}</p>
      <Pill t={PURCHASE_BADGE[status]}>{status}</Pill>
    </div>
  );
}
function DocBtn({ label, locked, href }: { label: string; locked?: boolean; href?: string }) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => { if (!locked && href) window.open(href, "_blank", "noopener,noreferrer"); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "47px",
        borderRadius: "14.64px",
        border: `1px solid rgba(210,210,215,${locked ? 0.1 : 0.2})`,
        background: "#fff",
        cursor: locked ? "default" : "pointer",
        fontSize: "12px",
        fontWeight: 400,
        letterSpacing: "-0.2928px",
        lineHeight: "21px",
        color: locked ? "rgba(29,29,31,0.3)" : "rgba(29,29,31,0.6)",
      }}
    >
      {locked ? `${label} \u{1F512}` : label}
    </button>
  );
}

function ConfirmPurchaseModal({ orderNo, onClose }: { orderNo: string; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/mypage/orders/${encodeURIComponent(orderNo)}/confirm`, { method: "POST" });
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ width: "468px", maxWidth: "calc(100vw - 40px)", borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "30.28px" }}>
        <div className="flex justify-center" style={{ marginBottom: "19.52px" }}>
          <div style={{ width: "59px", height: "59px", borderRadius: "9999px", background: "rgba(30,58,95,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY }}>
            <ConfirmCheckIcon style={{ width: "20px", height: "20px" }} />
          </div>
        </div>
        <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: INK, textAlign: "center", margin: "0 0 9.76px" }}>구매를 확정하시겠습니까?</p>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", textAlign: "center", margin: "0 0 4.88px" }}>구매 확정 후에는 취소/환불이 어려울 수 있습니다.</p>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", textAlign: "center", margin: "0 0 29.28px" }}>확정 후 세금계산서 발행 요청이 가능합니다.</p>
        <div className="flex" style={{ gap: "14.64px" }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>취소</button>
          <button type="button" onClick={submit} disabled={saving} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: "none", background: NAVY, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", color: "#fff", cursor: "pointer" }}>구매 확정</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function RefundModal({ orderNo, onClose }: { orderNo: string; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mypage/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo, reason: "환불 신청" }),
      });
      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ width: "468px", maxWidth: "calc(100vw - 40px)", borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "30.28px" }}>
        <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: INK, textAlign: "center", margin: "0 0 9.76px" }}>환불을 신청하시겠습니까?</p>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", textAlign: "center", margin: "0 0 29.28px" }}>환불 신청 후 관리자 확인을 거쳐 처리됩니다.</p>
        <div className="flex" style={{ gap: "14.64px" }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>취소</button>
          <button type="button" onClick={submit} disabled={saving} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: "none", background: NAVY, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", color: "#fff", cursor: "pointer" }}>환불 신청</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function QuoteTab({ notices, products, details }: { notices: MyQuoteNoticeRow[]; products: ProductQuoteRow[]; details: Record<string, MyQuoteRequestDetailView> }) {
  const [sub, setSub] = useState<"notice" | "product">("notice");
  return (
    <Panel>
      <div className="flex" style={{ gap: "4.88px", padding: "0 9.76px", borderBottom: `1px solid rgba(210,210,215,0.2)` }}>
        {([
          { key: "notice", label: "견적 공고 현황" },
          { key: "product", label: "상품 견적 관리" },
        ] as const).map((t) => {
          const on = sub === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setSub(t.key)}
              style={{
                padding: "14.64px 19.52px 16.64px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: on ? NAVY : "rgba(29,29,31,0.4)",
                background: "none",
                border: "none",
                borderBottom: on ? `2px solid ${NAVY}` : "2px solid transparent",
                marginBottom: "-1px",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {sub === "notice" ? <QuoteNoticeList notices={notices} /> : <ProductQuoteList products={products} details={details} />}
    </Panel>
  );
}

const Q_GRID = "76px minmax(0,1fr) 96px 78px 50px 74px 64px";
function QuoteNoticeList({ notices }: { notices: MyQuoteNoticeRow[] }) {
  const router = useRouter();
  return (
    <>
      <div style={{ padding: "24.4px 29.28px 25.4px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>견적 요청 공고 현황</h2>
      </div>
      <div className="grid items-center" style={{ gridTemplateColumns: Q_GRID, gap: "12px", padding: "14.64px 19.52px", background: "rgba(29,29,31,0.02)", borderTop: `1px solid rgba(210,210,215,0.1)`, borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
        {["등록일", "공고명", "예산", "마감일", "제안 수", "상태", ""].map((h, i) => (
          <span key={i} style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
        ))}
      </div>
      {notices.map((r, ri) => (
        <div key={ri} className="grid" style={{ gridTemplateColumns: Q_GRID, gap: "12px", padding: "16px 19.52px", borderBottom: `1px solid rgba(210,210,215,0.1)`, alignItems: "flex-start" }}>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", paddingTop: "2px" }}>{r.regDate}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "21px", color: INK, margin: 0 }}>{r.title}</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "3px 0 0" }}>{r.sub}</p>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{r.budget}</span>
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)", paddingTop: "1px" }}>{r.deadline}</span>
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)", paddingTop: "1px" }}>{r.proposals}</span>
          <span><Pill t={QUOTE_BADGE[r.status]}>{r.status}</Pill></span>
          <button type="button" onClick={() => router.push(`/quotes/${r.id}`)} style={linkBtn(NAVY)}>상세보기</button>
        </div>
      ))}
    </>
  );
}

function ProductQuoteList({ products, details }: { products: ProductQuoteRow[]; details: Record<string, MyQuoteRequestDetailView> }) {
  const [detailId, setDetailId] = useState<string | null>(null);
  return (
    <>
      <div style={{ padding: "24.4px 29.28px 25.4px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>상품 견적 관리</h2>
      </div>
      <div style={{ padding: "0 29.28px 8px" }}>
        {products.map((r, i) => (
          <ProductQuoteRowView key={r.id} r={r} first={i === 0} onView={() => setDetailId(r.id)} />
        ))}
      </div>
      {detailId && details[detailId] && <QuoteRequestModal detail={details[detailId]} onClose={() => setDetailId(null)} />}
    </>
  );
}

function ProductQuoteRowView({ r, first, onView }: { r: ProductQuoteRow; first: boolean; onView: () => void }) {
  return (
    <div style={{ padding: "20px 0", borderTop: first ? "none" : `1px solid rgba(210,210,215,0.1)` }}>
      <div className="flex items-start justify-between" style={{ gap: "16px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "22.75px", color: INK, margin: 0, textDecoration: "underline" }}>{r.product}</p>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
            공급업체: {r.supplier}&nbsp;&nbsp;&nbsp;&nbsp;연락처: {r.phone}&nbsp;&nbsp;&nbsp;&nbsp;요청일: {r.reqDate}&nbsp;&nbsp;&nbsp;&nbsp;수량: {r.qty}
          </p>
          {r.offer && (
            <div style={{ marginTop: "12.2px", borderRadius: "14.64px", background: "rgba(30,58,95,0.02)", border: `1px solid rgba(210,210,215,0.2)`, padding: "20.52px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, margin: 0 }}>제안 금액: {r.offer.amount}</p>
              <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)", margin: "7.32px 0 0" }}>{r.offer.note}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end" style={{ gap: "12px", flexShrink: 0 }}>
          <Pill t={PRODUCT_BADGE[r.status]}>{r.status}</Pill>
          <button type="button" onClick={onView} style={linkBtn(NAVY)}>견적 요청서 보기</button>
        </div>
      </div>
    </div>
  );
}

function QuoteRequestModal({ detail, onClose }: { detail: MyQuoteRequestDetailView; onClose: () => void }) {
  const router = useRouter();
  const d = detail;
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ width: "625px", maxWidth: "calc(100vw - 40px)", maxHeight: "90vh", overflowY: "auto", borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)` }}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 24.4px 20.52px", borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK, margin: 0 }}>견적 요청서</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(29,29,31,0.4)", display: "inline-flex" }} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div style={{ padding: "24.4px" }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "18px 40px" }}>
            <KV label="상품명" value={d.product} />
            <KV label="공급업체" value={d.supplier} />
            <KV label="소속 기관명" value={d.org} />
            <KV label="소속 부서" value={d.dept} />
            <KV label="이메일" value={d.email} />
            <KV label="연락처" value={d.phone} />
            <KV label="요청 수량" value={d.qty} />
            <KV label="납품 희망일" value={d.wishDate} />
          </div>
          <div style={{ marginTop: "18px" }}>
            <KV label="납품 주소" value={d.address} />
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "18px 40px", marginTop: "18px" }}>
            <KV label="요청일" value={d.reqDate} />
            <KVStatusProduct label="상태" status={d.status} />
          </div>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "24px 0 0" }}>요청 내용</p>
          <div style={{ marginTop: "9.76px", borderRadius: "14.64px", background: "rgba(29,29,31,0.01)", border: `1px solid rgba(210,210,215,0.2)`, padding: "20.52px" }}>
            <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "21.125px", color: "rgba(29,29,31,0.7)", margin: 0 }}>{d.content}</p>
          </div>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "24px 0 0" }}>첨부파일</p>
          <div className="flex flex-col" style={{ gap: "9.76px", marginTop: "9.76px" }}>
            {d.attachments.map((f) => (
              <div key={f.name} className="flex items-center" style={{ gap: "9.76px", borderRadius: "14.64px", background: "rgba(29,29,31,0.01)", border: `1px solid rgba(210,210,215,0.2)`, padding: "13.19px 18.08px" }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M9.5 2.5L4 8a2.5 2.5 0 003.5 3.5l5-5a4 4 0 00-5.66-5.66l-5 5a5.5 5.5 0 007.78 7.78L13 9" stroke="rgba(29,29,31,0.5)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                <a href={f.fileUrl} download={f.name} target="_blank" rel="noopener noreferrer" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", whiteSpace: "nowrap", textDecoration: "none" }}>다운로드</a>
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: "14.64px", marginTop: "24.4px" }}>
            <button type="button" onClick={onClose} style={{ width: "281px", maxWidth: "281px", flexShrink: 0, height: "49px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>닫기</button>
            <button type="button" disabled={!d.productId} onClick={() => { if (d.productId) router.push(`/products/${d.productId}`); }} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: "none", background: NAVY, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff", cursor: d.productId ? "pointer" : "default", opacity: d.productId ? 1 : 0.5 }}>상품 페이지로 이동</button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
function KVStatusProduct({ label, status }: { label: string; status: ProductQuoteStatus }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 4px" }}>{label}</p>
      <Pill t={PRODUCT_BADGE[status]}>{status}</Pill>
    </div>
  );
}

function DemandTab({ posts }: { posts: MyDemandPost[] }) {
  return (
    <Panel>
      <PanelHead title="수요 게시판 글" />
      <div style={{ padding: "0 29.28px 8px" }}>
        {posts.map((p, i) => (
          <div key={i} className="flex items-start justify-between" style={{ gap: "16px", padding: "20px 0", borderTop: i === 0 ? "none" : `1px solid rgba(210,210,215,0.1)` }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "21px", color: INK, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "8px 0 0" }}>{p.meta}</p>
            </div>
            <Pill t={GREEN_BADGE}>{p.status}</Pill>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function InfoShareTab({ posts }: { posts: MyInfoPost[] }) {
  const router = useRouter();
  return (
    <Panel>
      <PanelHead title="정보공유 게시판 글" />
      <div style={{ padding: "0 29.28px 8px" }}>
        {posts.map((p, i) => (
          <div key={i} style={{ padding: "20px 0", borderTop: i === 0 ? "none" : `1px solid rgba(210,210,215,0.1)` }}>
            <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "21px", color: INK, margin: 0 }}>{p.title}</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "8px 0 0" }}>{p.meta}</p>
            <button type="button" onClick={() => router.push(`/info/${p.id}`)} style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21px", color: NAVY, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", whiteSpace: "nowrap", marginTop: "8px", textDecoration: "underline" }}>글 보기</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const INQUIRY_KIND_BADGE: Record<InquiryKind, BadgeT> = {
  문의: NAVY_SOFT_BADGE,
  신고: NAVY_SOFT_BADGE,
};
function InquiryTab({ items = [], badge = INQUIRY_BADGE }: { items?: MyInquiryRow[]; badge?: Record<InquiryStatus, BadgeT> } = {}) {
  return (
    <Panel>
      <PanelHead title="문의/신고 내역" />
      <div style={{ padding: "0 29.28px 8px" }}>
        {items.map((q, i) => (
          <div key={i} style={{ padding: "22px 0", borderTop: i === 0 ? "none" : `1px solid rgba(210,210,215,0.1)` }}>
            <div className="flex items-start justify-between" style={{ gap: "16px" }}>
              <div style={{ minWidth: 0 }}>
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <Pill t={INQUIRY_KIND_BADGE[q.kind] ?? NAVY_SOFT_BADGE}>{q.kind}</Pill>
                  <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{q.category}</span>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, margin: "10px 0 0" }}>{q.title}</p>
                <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "8px 0 0" }}>{q.date}</p>
              </div>
              <Pill t={badge[q.status] ?? INQUIRY_BADGE.접수}>{q.status}</Pill>
            </div>
            {q.thread && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ borderRadius: "14.64px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "16px 19.52px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>접수 내용</p>
                  <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.125px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.7)", margin: "10px 0 0" }}>{q.thread.question}</p>
                </div>
                <div style={{ marginTop: "12px", borderRadius: "14.64px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "16px 19.52px" }}>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>관리자 답변</p>
                    <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{q.thread.answer.meta}</p>
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.125px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.7)", margin: "10px 0 0" }}>{q.thread.answer.body}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AlarmTab({ values }: { values: boolean[] }) {
  const [settings, setSettings] = useState(values);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/mypage/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderPayment: settings[0], quoteNotice: settings[1], delivery: settings[2], marketing: settings[3] }),
      });
    } finally {
      setSaving(false);
    }
  };
  return (
    <Panel>
      <PanelHead title="알림 설정" sub="수신하고 싶은 알림 종류를 설정합니다." />
      <div style={{ padding: "13px 29.28px 29.28px" }}>
        {ALARM_LABELS.map((s, i) => (
          <label key={i} className="flex items-start" style={{ gap: "14.64px", padding: "18.08px 20.52px", borderRadius: "14.64px", cursor: "pointer" }}>
            <span style={{ paddingTop: "2.44px", display: "inline-flex" }} onClick={(e) => { e.preventDefault(); setSettings((arr) => arr.map((v, k) => (k === i ? !v : v))); }}>
              <AlarmCheckIcon on={settings[i]} />
            </span>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, margin: 0 }}>{s.title}</p>
              <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{s.desc}</p>
            </div>
          </label>
        ))}
        <button type="button" onClick={save} disabled={saving} style={{ marginTop: "13px", borderRadius: "14.64px", background: NAVY, color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", border: "none", padding: "9.76px 24.4px", cursor: "pointer" }}>설정 저장</button>
      </div>
    </Panel>
  );
}

function WithdrawTab() {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Panel>
        <PanelHead title="회원 탈퇴" />
        <div style={{ padding: "13px 29.28px 29.28px" }}>
          <div style={{ borderRadius: "14.64px", background: "#FEF2F2", border: "1px solid #FECACA", padding: "20.52px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "21px", color: "#DC2626", margin: 0 }}>회원 탈퇴 시 유의사항</p>
            <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
              {WITHDRAW_NOTES.map((t, i) => (
                <li key={i} style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "#DC2626" }}>{t}</li>
              ))}
            </ul>
          </div>
          <button type="button" onClick={() => setConfirm(true)} style={{ marginTop: "20px", borderRadius: "14.64px", background: "#fff", color: "#EF4444", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", border: "1px solid #FCA5A5", padding: "10.76px 25.4px", cursor: "pointer" }}>회원 탈퇴</button>
        </div>
      </Panel>
      {confirm && <WithdrawConfirmModal onClose={() => setConfirm(false)} />}
    </>
  );
}

function WithdrawConfirmModal({ onClose }: { onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mypage/withdraw", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ width: "468px", maxWidth: "calc(100vw - 40px)", borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "30.28px" }}>
        <div className="flex justify-center" style={{ marginBottom: "19.52px" }}>
          <div style={{ width: "59px", height: "59px", borderRadius: "9999px", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
            <WithdrawIcon className="" />
          </div>
        </div>
        <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: INK, textAlign: "center", margin: "0 0 9.76px" }}>정말 탈퇴하시겠습니까?</p>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", textAlign: "center", margin: "0 0 29.28px" }}>탈퇴 후 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
        <div className="flex" style={{ gap: "14.64px" }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>취소</button>
          <button type="button" onClick={submit} disabled={saving} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: "none", background: "#EF4444", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", color: "#fff", cursor: "pointer" }}>탈퇴하기</button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function InfoTab({ basicInfo, supplierFields, supplier = false }: { basicInfo?: MyBasicInfo; supplierFields?: MySupplierField[]; supplier?: boolean }) {
  const [termView, setTermView] = useState<{ title: string; body: string } | null>(null);
  const [dbTerms, setDbTerms] = useState<Array<{ title: string; content: string }>>([]);
  async function openTerm(t: Term) {
    let loaded = dbTerms;
    if (!loaded.length) {
      try {
        const res = await fetch("/api/terms?portal=OFFICIAL");
        const d = (await res.json()) as { terms?: Array<{ title: string; content: string }> };
        loaded = (d.terms ?? []).map((x) => ({ title: x.title, content: x.content }));
        setDbTerms(loaded);
      } catch {}
    }
    const match = loaded.find((x) => x.title === t.title);
    setTermView({ title: t.title, body: match?.content ?? t.desc });
  }
  return (
    <div className="flex flex-col" style={{ gap: "19.52px" }}>
      <div style={{ borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "30.28px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>기본 정보</h2>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px 40px", marginTop: "20px" }}>
          {supplier ? (
            (supplierFields ?? []).map((f) => <Field key={f.label} label={f.label} value={f.value} />)
          ) : (
            <>
              <Field label="이메일" value={basicInfo?.email ?? ""} />
              <Field label="소속 기관" value={basicInfo?.org ?? ""} />
              <Field label="소속 부서" value={basicInfo?.dept ?? ""} />
              <Field label="부서 전화" value={basicInfo?.deptPhone ?? "-"} />
            </>
          )}
        </div>
        <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", margin: "20px 0 0" }}>* 기본 정보 변경은 관리자에게 문의하세요.</p>
      </div>

      <PasswordSection />

      {!supplier && (
        <div style={{ borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "30.28px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>약관 동의 현황</h2>
          <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "19px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", margin: "8px 0 0" }}>
            회원가입 및 서비스 이용 시 동의한 약관 내역입니다. 선택 약관은 토글로 동의 여부를 변경할 수 있습니다.
          </p>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "-0.165px", color: "rgba(29,29,31,0.6)", margin: "24px 0 12px" }}>회원가입 필수 약관</p>
          <div className="flex flex-col" style={{ gap: "12px" }}>
            {TERMS_REQUIRED.map((t, i) => (
              <TermCard key={i} term={t} onView={() => openTerm(t)} />
            ))}
          </div>

          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "-0.165px", color: "rgba(29,29,31,0.6)", margin: "24px 0 12px" }}>서비스 이용 선택 약관</p>
          <div className="flex flex-col" style={{ gap: "12px" }}>
            {TERMS_OPTIONAL.map((t, i) => (
              <TermCard key={i} term={t} onView={() => openTerm(t)} />
            ))}
          </div>
        </div>
      )}

      {termView && (
        <div onClick={() => setTermView(null)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "560px", maxWidth: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column", borderRadius: "19.52px", background: "#fff", overflow: "hidden" }}>
            <div className="flex items-center justify-between" style={{ padding: "24px 29.28px 16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", color: INK, margin: 0 }}>{termView.title}</h3>
              <button type="button" aria-label="닫기" onClick={() => setTermView(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(29,29,31,0.3)", fontSize: "18px", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "0 29.28px", overflowY: "auto", flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.7)", margin: 0, whiteSpace: "pre-wrap" }}>{termView.body}</p>
            </div>
            <div style={{ padding: "16px 29.28px 24px" }}>
              <button type="button" onClick={() => setTermView(null)} style={{ width: "100%", height: "49px", borderRadius: "14.64px", border: "none", background: NAVY, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", color: "#fff", cursor: "pointer" }}>확인했습니다</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next, confirmPassword: confirm }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) {
        setMsg({ ok: true, text: "비밀번호가 변경되었습니다." });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setMsg({ ok: false, text: data.message ?? "비밀번호 변경에 실패했습니다." });
      }
    } catch {
      setMsg({ ok: false, text: "비밀번호 변경에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ borderRadius: "19.52px", background: "#fff", border: `1px solid rgba(210,210,215,0.2)`, padding: "30.28px" }}>
      <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>비밀번호 변경</h2>
      <div style={{ maxWidth: "468px", marginTop: "20px" }}>
        <PwInput label="현재 비밀번호" value={current} onChange={setCurrent} />
        <PwInput label="새 비밀번호" value={next} onChange={setNext} />
        <PwInput label="새 비밀번호 확인" value={confirm} onChange={setConfirm} />
        {msg && (
          <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: msg.ok ? "#047857" : "#EF4444", margin: "0 0 8px", whiteSpace: "pre-line" }}>{msg.text}</p>
        )}
        <button type="button" onClick={submit} disabled={saving} style={{ marginTop: "14.64px", borderRadius: "14.64px", background: NAVY, color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", border: "none", padding: "9.76px 24.4px", cursor: "pointer" }}>비밀번호 변경</button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: INK, margin: "2px 0 0" }}>{value}</p>
    </div>
  );
}

function PwInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: "14.64px" }}>
      <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)", margin: "0 0 6px" }}>{label}</p>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", height: "49px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.3)`, padding: "13.19px 18.08px", fontSize: "13px", color: INK, outline: "none", background: "#fff" }} />
    </div>
  );
}

const TERM_TAG_STYLE: Record<Term["tag"]["tone"], { bg: string; color: string; weight: number }> = {
  required: { bg: "#FEF2F2", color: "#EF4444", weight: 700 },
  ai: { bg: "rgba(29,29,31,0.05)", color: "rgba(29,29,31,0.4)", weight: 500 },
  pay: { bg: "rgba(29,29,31,0.05)", color: "rgba(29,29,31,0.4)", weight: 500 },
  civil: { bg: "rgba(29,29,31,0.05)", color: "rgba(29,29,31,0.4)", weight: 500 },
};

function TermCard({ term, onView }: { term: Term; onView?: () => void }) {
  const [on, setOn] = useState(!!term.on);
  const checked = term.required || on;
  const tag = TERM_TAG_STYLE[term.tag.tone];
  const cardBg = !term.required && on ? "rgba(30,58,95,0.02)" : "#FAFAFA";
  const cardBorder = !term.required && on ? "rgba(30,58,95,0.2)" : "rgba(210,210,215,0.2)";
  return (
    <div style={{ borderRadius: "14.64px", border: `1px solid ${cardBorder}`, background: cardBg, padding: "15.64px 20.52px" }}>
      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "14.64px", minWidth: 0, flex: 1 }}>
          <span style={{ color: checked ? (term.required ? "#10B981" : NAVY) : "rgba(29,29,31,0.2)", display: "inline-flex", flexShrink: 0 }}>
            <TermCheckIcon style={{ width: "20px", height: "20px" }} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "9.76px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{term.title}</span>
              <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", padding: "2.44px 7.32px", fontSize: "10px", fontWeight: tag.weight, lineHeight: "18px", background: tag.bg, color: tag.color }}>{term.tag.label}</span>
            </div>
            <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>{term.desc}</p>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: "9.76px", flexShrink: 0 }}>
          {!term.required && <Toggle on={on} onClick={() => setOn((v) => !v)} />}
          {term.required ? (
            <button type="button" onClick={onView} style={{ borderRadius: "9.76px", border: `1px solid rgba(210,210,215,0.3)`, background: "#fff", padding: "8.32px 15.64px", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.25px", color: "rgba(29,29,31,0.5)", cursor: "pointer", whiteSpace: "nowrap" }}>전체보기</button>
          ) : (
            <button type="button" onClick={onView} style={{ background: "none", border: "none", padding: 0, fontSize: "11px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.25px", color: "rgba(29,29,31,0.5)", cursor: "pointer", whiteSpace: "nowrap" }}>전체보기</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: "49px", height: "24px", borderRadius: "9999px", background: on ? NAVY : "#D2D2D7", border: "none", position: "relative", cursor: "pointer", padding: 0, flexShrink: 0 }}
      aria-pressed={on}
    >
      <span style={{ position: "absolute", top: "2px", left: on ? "27px" : "2px", width: "20px", height: "20px", borderRadius: "9999px", background: "#fff", transition: "left 0.15s" }} />
    </button>
  );
}

function SupplierView({ data }: { data: MyPageData }) {
  const [tab, setTab] = useState<SupplierTabKey>("answer");
  return (
    <PageShell headerSub={data.headerSub} sidebar={<Sidebar items={SUPPLIER_TABS} active={tab} onSelect={setTab} />}>
      {tab === "info" && <InfoTab supplierFields={data.supplierFields} supplier />}
      {tab === "answer" && <DemandAnswerTab answers={data.demandAnswers} />}
      {tab === "inquiry" && <InquiryTab items={data.inquiries} badge={SUPPLIER_INQUIRY_BADGE} />}
      {tab === "alarm" && <AlarmTab values={data.alarmSettings} />}
      {tab === "withdraw" && <WithdrawTab />}
    </PageShell>
  );
}

function DemandAnswerTab({ answers }: { answers: MyDemandAnswer[] }) {
  return (
    <Panel>
      <PanelHead title="수요 게시판 답변 내역" />
      <div style={{ padding: "0 29.28px 8px" }}>
        {answers.map((a, i) => (
          <div key={i} style={{ padding: "20px 0", borderTop: i === 0 ? "none" : `1px solid rgba(210,210,215,0.1)` }}>
            <div className="flex items-start justify-between" style={{ gap: "16px" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "21px", color: INK, margin: 0 }}>{a.title}</p>
                <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "8px 0 0" }}>{a.meta}</p>
                <div style={{ marginTop: "16px", borderRadius: "14.64px", background: "rgba(30,58,95,0.02)", border: `1px solid rgba(210,210,215,0.15)`, padding: "18.08px" }}>
                  <div className="flex items-center" style={{ gap: "7.32px" }}>
                    <CompanyAvatarIcon />
                    <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.6)" }}>{a.supplier}</span>
                    <span style={{ padding: "2.44px 7.32px", fontSize: "10px", fontWeight: 500, letterSpacing: "-0.15px", lineHeight: "18px", color: NAVY }}>내 답변</span>
                    <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", marginLeft: "auto" }}>{a.answerDate}</span>
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)", margin: "10px 0 0" }}>{a.answer}</p>
                </div>
              </div>
              <Pill t={GREEN_BADGE}>{a.status}</Pill>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
