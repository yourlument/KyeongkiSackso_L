"use client";

import { useRouter } from "next/navigation";
import { ORDER_DETAIL, STATUS_STYLE } from "./orders-data";

const INK = "#1D1D1F";
const NAVY = "#1E3A5F";

export function OrderDetailModal() {
  const router = useRouter();
  const d = ORDER_DETAIL;
  const sStyle = STATUS_STYLE[d.status];
  const close = () => router.push("/partner/orders");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "625px", borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}
      >

        <div className="flex items-start justify-between" style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid rgba(210,210,215,0.1)", padding: "19.52px 24.4px 20.52px" }}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK, margin: 0 }}>주문 상세</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>
              {d.orderNo} · {d.payDate}
            </p>
          </div>
          <button type="button" onClick={close} className="flex items-center justify-center" style={{ width: "34px", height: "34px", borderRadius: "9999px", border: "none", background: "transparent", cursor: "pointer" }} aria-label="닫기">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1 1l8 8M9 1l-8 8" stroke="#1D1D1F" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "24.4px" }}>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "19.52px" }}>
            <SummaryField label="주문번호" value={d.orderNo} valueSize={12} />
            <SummaryField label="결제 일시" value={d.payDate} valueSize={13} />
            <SummaryField label="결제 수단" value={d.payMethod} valueSize={13} />
            <div>
              <FieldLabel>주문 상태</FieldLabel>
              <span style={{ display: "inline-flex", borderRadius: "9999px", padding: "5.88px 13.2px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", background: sStyle.bg, border: `1px solid ${sStyle.border}`, color: sStyle.color }}>
                {d.status}
              </span>
            </div>
          </div>

          <Section title="주문 품목">
            <div style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
              {d.items.map((it, i) => (
                <div key={i} className="flex items-start justify-between" style={{ padding: "14.64px 19.52px 15.64px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, margin: 0 }}>{it.name}</p>
                    <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{it.spec}</p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{it.amount}</span>
                </div>
              ))}
              <div className="flex items-center justify-between" style={{ background: "rgba(30,58,95,0.03)", padding: "14.64px 19.52px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>합계</span>
                <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: INK }}>{d.total}</span>
              </div>
            </div>
          </Section>

          <Section
            title="세금계산서 발행 정보"
            badge={<span style={{ display: "inline-flex", borderRadius: "9999px", padding: "5.88px 13.2px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", background: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309" }}>{d.tax.badge}</span>}
          >
            <InfoCard>
              <InfoPair label="기관명(상호)" value={d.tax.orgName} />
              <InfoPair label="사업자등록번호" value={d.tax.bizNo} />
              <InfoPair label="대표자(기관장)" value={d.tax.ceo} />
              <InfoPair label="수신 이메일" value={d.tax.email} />
              <InfoPair label="사업장 주소" value={d.tax.address} full />
            </InfoCard>
            <button type="button" style={{ width: "100%", marginTop: "14.64px", borderRadius: "14.64px", border: "none", background: NAVY, padding: "12.2px 0", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "21px", color: "#fff", cursor: "pointer" }}>
              세금계산서 발행 완료 처리
            </button>
          </Section>

          <Section title="납품 정보">
            <InfoCard>
              <InfoPair label="납품기한" value={d.delivery.deadline} />
              <InfoPair label="납품일" value={d.delivery.deliveredDate} />
              <InfoPair label="납품장소" value={d.delivery.place} full />
              <InfoPair label="담당자 연락처" value={d.delivery.contact} />
            </InfoCard>
          </Section>

          <Section title="수령인 / 배송 정보">
            <InfoCard>
              <InfoPair label="수령인/담당자" value={d.recipient.name} />
              <InfoPair label="연락처" value={d.recipient.phone} />
              <InfoPair label="소속 기관" value={d.recipient.org} />
              <InfoPair label="소속 부서" value={d.recipient.dept} />
              <InfoPair label="배송지 주소" value={d.recipient.address} full />
              <InfoPair label="배송 메모" value={d.recipient.memo} full />
            </InfoCard>
          </Section>

          <div style={{ marginTop: "24.4px", borderTop: "1px solid rgba(210,210,215,0.1)", paddingTop: "20.52px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 9.76px" }}>증빙 서류 출력</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", margin: "0 0 14.64px" }}>클릭 시 새 창에서 열립니다.</p>
            <div className="flex" style={{ gap: "9.76px" }}>
              <DocButton>구매확인서</DocButton>
              <DocButton>매출 전표</DocButton>
              <DocButton locked>세금 계산서 🔒</DocButton>
            </div>
          </div>

          <div style={{ marginTop: "24.4px", borderTop: "1px solid rgba(210,210,215,0.1)", paddingTop: "20.52px" }}>
            <button type="button" style={{ width: "100%", borderRadius: "14.64px", border: "none", background: NAVY, padding: "12.2px 0", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff", cursor: "pointer" }}>
              송장 번호 등록 후 배송중으로 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 4.88px" }}>{children}</p>;
}

function SummaryField({ label, value, valueSize }: { label: string; value: string; valueSize: number }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <span style={{ fontSize: `${valueSize}px`, fontWeight: 400, letterSpacing: valueSize === 12 ? "-0.18px" : "-0.195px", lineHeight: valueSize === 12 ? "21.6px" : "22.75px", color: INK }}>{value}</span>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "24.4px", borderTop: "1px solid rgba(210,210,215,0.1)", paddingTop: "20.52px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "14.64px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14.64px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", background: "rgba(29,29,31,0.01)", padding: "20.52px" }}>
      {children}
    </div>
  );
}

function InfoPair({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "0 0 2.44px" }}>{label}</p>
      <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: INK, margin: 0 }}>{value}</p>
    </div>
  );
}

function DocButton({ children, locked }: { children: React.ReactNode; locked?: boolean }) {
  return (
    <button
      type="button"
      disabled={locked}
      style={{ flex: 1, borderRadius: "14.64px", border: `1px solid ${locked ? "rgba(210,210,215,0.1)" : "rgba(210,210,215,0.2)"}`, background: "#fff", padding: "13.2px 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "21px", color: locked ? "rgba(29,29,31,0.3)" : "rgba(29,29,31,0.6)", cursor: locked ? "default" : "pointer" }}
    >
      {children}
    </button>
  );
}
