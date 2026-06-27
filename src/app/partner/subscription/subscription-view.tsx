"use client";

import { useState } from "react";
import type { PartnerSubscriptionData } from "@/lib/partner-subscription";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

type Cycle = "monthly" | "annual";

const PLAN = {
  monthly: { price: "299,000", unit: "/월", next: "299,000원", cycleLabel: "월간" },
  annual: { price: "2,990,000", unit: "/년", next: "2,990,000원", cycleLabel: "연간" },
};

const FEATURES = [
  "상품 등록 무제한",
  "견적 요청 우선 열람",
  "고급 통계/분석",
  "실시간 채팅",
  "우선 노출",
  "전화/이메일 지원",
];

function CheckIcon() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.375 4.94963L8.25707 -0.000504409L9 0.763539L3.375 6.47772L0 3.04491L0.742924 2.29162L3.375 4.94963Z" fill="#1E3A5F" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.712364 0H13.5349C13.7344 0 13.903 0.0698145 14.0407 0.209444C14.1784 0.349074 14.2473 0.52 14.2473 0.722222V12.2778C14.2473 12.48 14.1784 12.6509 14.0407 12.7906C13.903 12.9302 13.7344 13 13.5349 13H0.712364C0.512902 13 0.344309 12.9302 0.206585 12.7906C0.0688618 12.6509 0 12.48 0 12.2778V0.722222C0 0.52 0.0688618 0.349074 0.206585 0.209444C0.344309 0.0698145 0.512902 0 0.712364 0ZM12.8225 5.77778H1.42473V11.5556H12.8225V5.77778ZM12.8225 4.33333V1.44444H1.42473V4.33333H12.8225ZM8.54836 8.66667H11.3978V10.1111H8.54836V8.66667Z" fill="#1D1D1F" fillOpacity="0.4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 3.54302L7.99528 -0.000629704L8.99999 1.01799L5.50471 4.56164L8.99999 8.1053L7.99528 9.12392L4.5 5.58027L1.00472 9.12392L0 8.1053L3.49528 4.56164L0 1.01799L1.00472 -0.000629704L4.5 3.54302Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}

function ModalCloseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.42349 4.27232L9.63607 0.00049999L10.847 1.22843L6.63439 5.50025L10.847 9.77207L9.63607 11L5.42349 6.72818L1.2109 11L0 9.77207L4.21258 5.50025L0 1.22843L1.2109 0.00049999L5.42349 4.27232Z" fill="#9CA3AF" />
    </svg>
  );
}

export function SubscriptionView({ data }: { data: PartnerSubscriptionData }) {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [modalOpen, setModalOpen] = useState(false);
  const plan = PLAN[cycle];

  return (
    <div data-partner-area="subscription">
      <div style={{ paddingBottom: "29.28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, lineHeight: "25px", letterSpacing: "-0.56px", color: INK, margin: 0 }}>
          이용권 관리
        </h1>
        <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
          월간 결제 (최소 3개월) 또는 연간 결제를 선택하세요
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "9.76px", paddingBottom: "39.04px" }}>
        <CycleButton active={cycle === "monthly"} onClick={() => setCycle("monthly")}>
          월간 결제
        </CycleButton>
        <CycleButton active={cycle === "annual"} onClick={() => setCycle("annual")}>
          연간 결제
        </CycleButton>
      </div>

      <div style={{ maxWidth: "547px", margin: "0 auto" }}>
        <section
          style={{
            padding: "31.28px",
            borderRadius: "19.52px",
            background: "rgba(30,58,95,0.03)",
            border: `2px solid ${NAVY}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, lineHeight: "20px", letterSpacing: "-0.448px", color: INK, margin: 0 }}>
              프리미엄 이용권
            </h3>
            {data.hasSubscription && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4.88px 14.64px",
                  borderRadius: "9999px",
                  background: NAVY,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 500,
                  lineHeight: "19.8px",
                  letterSpacing: "-0.165px",
                }}
              >
                현재 이용 중
              </span>
            )}
          </div>

          <div style={{ paddingTop: "14.64px", paddingBottom: "19.52px" }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: "30px", fontWeight: 700, lineHeight: "54px", letterSpacing: "-0.45px", color: INK }}>{plan.price}</span>
              <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", marginLeft: "2px" }}>원</span>
              <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", marginLeft: "2px" }}>{plan.unit}</span>
            </div>
          </div>

          {cycle === "monthly" && (
            <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: "0 0 19.52px" }}>
              최소 3개월 이상 결제
            </p>
          )}

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {FEATURES.map((f, i) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9.76px",
                  marginTop: i === 0 ? 0 : "9.76px",
                }}
              >
                <span style={{ display: "flex", width: "20px", height: "20px", alignItems: "center", justifyContent: "center", flexShrink: 0, paddingTop: "2.44px" }}>
                  <CheckIcon />
                </span>
                <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.7)" }}>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          style={{
            marginTop: "39.04px",
            padding: "25.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, lineHeight: "17.5px", letterSpacing: "-0.392px", color: INK, margin: "0 0 14.64px" }}>
            현재 이용 현황
          </h3>
          <div style={{ display: "flex", gap: "19.52px" }}>
            <StatusItem label="현재 플랜" value={data.planName || "-"} />
            <StatusItem label="결제 주기" value={data.cycleLabel || plan.cycleLabel} />
            <StatusItem label="다음 결제일" value={data.nextBillingDate} />
          </div>
          <div style={{ marginTop: "19.52px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.6)" }}>{"다음 결제 금액: ​"}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{data.nextAmount}</span>
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                padding: "12.2px 19.52px",
                borderRadius: "14.64px",
                background: NAVY,
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "21px",
                letterSpacing: "-0.2928px",
                border: "none",
                cursor: "pointer",
              }}
            >
              결제 수단 변경
            </button>
          </div>
        </section>

        <section
          style={{
            marginTop: "24.4px",
            padding: "25.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, lineHeight: "17.5px", letterSpacing: "-0.392px", color: INK, margin: "0 0 14.64px" }}>
            등록된 결제 수단
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12.2px 14.64px",
              borderRadius: "14.64px",
              background: "rgba(29,29,31,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14.64px" }}>
              <span style={{ display: "flex", width: "39px", height: "39px", alignItems: "center", justifyContent: "center", borderRadius: "9.76px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)" }}>
                <CardIcon />
              </span>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: INK, margin: 0 }}>{data.payMethod}</p>
                <p style={{ fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{data.cardNo}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "9.76px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "2.44px 9.76px", borderRadius: "9999px", background: "rgba(30,58,95,0.1)", color: NAVY, fontSize: "10px", fontWeight: 500, lineHeight: "18px", letterSpacing: "-0.15px" }}>
                기본
              </span>
              <button type="button" onClick={() => setModalOpen(true)} style={{ display: "flex", width: "24px", height: "24px", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0 }} aria-label="결제 수단 관리">
                <CloseIcon />
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: "24.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "19.52px 24.4px 20.52px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, lineHeight: "17.5px", letterSpacing: "-0.392px", color: INK, margin: 0 }}>
              결제 내역
            </h3>
          </div>
          <div>
            {data.history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: i === 0 ? "17.08px 24.4px" : "18.08px 24.4px 17.08px",
                  borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "19.52px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>{h.date}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK }}>{h.amount}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "9.76px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}>{h.method}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "3.44px 13.2px", borderRadius: "9999px", background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#047857", fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px" }}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {modalOpen && <PaymentMethodModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function CycleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: active ? "12.2px 24.4px" : "13.2px 25.4px",
        borderRadius: "14.64px",
        background: active ? NAVY : "#fff",
        color: active ? "#fff" : "rgba(29,29,31,0.6)",
        border: active ? "none" : "1px solid rgba(210,210,215,0.3)",
        fontSize: "13px",
        fontWeight: 600,
        lineHeight: "22.75px",
        letterSpacing: "-0.2928px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ width: "152px" }}>
      <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: "23.4px", letterSpacing: "-0.195px", color: INK, margin: 0 }}>{value}</p>
    </div>
  );
}

function PaymentMethodModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "19.52px",
        background: "rgba(0,0,0,0.4)",
      }}
      onClick={onClose}
    >
      <style>{".sub-card-input::placeholder{color:#9CA3AF;font-weight:500;opacity:1}"}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "547px",
          maxHeight: "100%",
          overflowY: "auto",
          padding: "29.28px",
          borderRadius: "14.64px",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "19.52px" }}>
          <h2 style={{ fontSize: "19.52px", fontWeight: 700, lineHeight: "29.28px", letterSpacing: "-0.546px", color: "#111827", margin: 0 }}>
            결제 수단 관리
          </h2>
          <button type="button" onClick={onClose} style={{ display: "flex", width: "39px", height: "39px", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", padding: 0 }} aria-label="닫기">
            <ModalCloseIcon />
          </button>
        </div>

        <div style={{ paddingBottom: "19.52px" }}>
          <p style={{ fontSize: "14.64px", fontWeight: 500, lineHeight: "19.52px", letterSpacing: "-0.2196px", color: "#6B7280", margin: "0 0 9.76px" }}>
            등록된 카드
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9.76px 14.64px", borderRadius: "9.76px", background: "#F9FAFB" }}>
            <div>
              <p style={{ fontSize: "14.64px", fontWeight: 500, lineHeight: "19.52px", letterSpacing: "-0.2196px", color: "#111827", margin: 0 }}>법인카드</p>
              <p style={{ fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: "#9CA3AF", margin: 0 }}>**** **** **** 1234 (삼성카드)</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "9.76px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "2.44px 7.32px", borderRadius: "4.88px", background: "#E5E7EB", color: "#4B5563", fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px" }}>
                기본
              </span>
              <button type="button" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF", fontSize: "14.64px", fontWeight: 400, lineHeight: "19.52px", letterSpacing: "-0.2928px" }}>
                삭제
              </button>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "20.52px", borderTop: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: "14.64px", fontWeight: 500, lineHeight: "19.52px", letterSpacing: "-0.2196px", color: "#6B7280", margin: "0 0 14.64px" }}>
            새 카드 등록
          </p>

          <Field label="카드 번호" placeholder="1234 5678 9012 3456" />

          <div style={{ marginTop: "14.64px" }}>
            <Field label="카드명 (선택)" placeholder="예: 법인카드" />
          </div>

          <div style={{ marginTop: "14.64px", display: "flex", gap: "14.64px" }}>
            <div style={{ flex: 1 }}>
              <Field label="유효기간" placeholder="MM/YY" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="CVC" placeholder="123" />
            </div>
          </div>

          <div style={{ marginTop: "14.64px" }}>
            <Field label="카드 비밀번호 (앞 2자리)" placeholder="**##" />
          </div>
        </div>

        <div style={{ marginTop: "19.52px", display: "flex", gap: "14.64px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13.2px 0",
              borderRadius: "9.76px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              color: "#4B5563",
              fontSize: "17.08px",
              fontWeight: 400,
              lineHeight: "24.4px",
              letterSpacing: "-0.2928px",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            type="button"
            disabled
            style={{
              flex: 1,
              padding: "12.2px 0",
              borderRadius: "9.76px",
              background: "rgba(31,41,55,0.4)",
              border: "none",
              color: "rgba(255,255,255,0.16)",
              fontSize: "17.08px",
              fontWeight: 600,
              lineHeight: "24.4px",
              letterSpacing: "-0.2928px",
              cursor: "not-allowed",
            }}
          >
            카드 등록
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "14.64px", fontWeight: 400, lineHeight: "19.52px", letterSpacing: "-0.2196px", color: "#9CA3AF", marginBottom: "4.88px" }}>
        {label}
      </label>
      <input
        placeholder={placeholder}
        className="sub-card-input"
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: "46px",
          padding: "10.745px 15.64px",
          borderRadius: "9.76px",
          background: "#fff",
          border: "1px solid #E5E7EB",
          fontSize: "17.08px",
          fontWeight: 400,
          lineHeight: "24.4px",
          letterSpacing: "-0.2928px",
          color: INK,
          outline: "none",
        }}
      />
    </div>
  );
}
