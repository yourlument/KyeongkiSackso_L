"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPaymentData, Txn, Settle, SubRow, SubStatus, RefundReq, Kpi } from "@/lib/admin-payment";

const TABS = ["전체 거래 모니터링", "이용권 수납 관리", "환불 요청 관리"] as const;
const CHIPS = ["전체", "정산대기", "정산완료"] as const;

const SETTLE_STYLE: Record<Settle, { bg: string; border: string; color: string }> = {
  정산완료: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  정산대기: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
};

const COLS = [
  { key: "date", w: 139 },
  { key: "pg", w: 159 },
  { key: "method", w: 89 },
  { key: "buyer", w: 104 },
  { key: "supplier", w: 134 },
  { key: "amount", w: 129 },
  { key: "settle", w: 115 },
  { key: "action", w: 218 },
] as const;

const HEAD_TEXT = "rgba(29,29,31,0.4)";
const CELL_PAD = "14.64px 24.4px";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M11.6793 10.7922L14.7957 13.9517L13.7618 15L10.6454 11.8404C10.0726 12.3031 9.44637 12.6574 8.76677 12.9035C8.04834 13.1594 7.3105 13.2873 6.55324 13.2873C5.3688 13.2873 4.26688 12.9871 3.24749 12.3867C2.25723 11.7962 1.47569 10.9989 0.90289 9.99491C0.300963 8.96141 0 7.84424 0 6.64341C0 5.44259 0.300963 4.32542 0.90289 3.29192C1.47569 2.28795 2.25723 1.4956 3.24749 0.914872C4.26688 0.304614 5.3688 -0.000513477 6.55324 -0.000513477C7.73767 -0.000513477 8.83959 0.304614 9.85898 0.914872C10.8492 1.4956 11.6356 2.28795 12.2181 3.29192C12.8104 4.32542 13.1065 5.44259 13.1065 6.64341C13.1065 7.41116 12.9803 8.15921 12.7278 8.88759C12.4851 9.57659 12.1356 10.2115 11.6793 10.7922ZM10.2085 10.2459C10.6648 9.77344 11.0191 9.23209 11.2716 8.62183C11.524 7.99189 11.6502 7.33241 11.6502 6.64341C11.6502 5.70834 11.4172 4.83725 10.9512 4.03014C10.5046 3.25255 9.89781 2.63737 9.13084 2.1846C8.33474 1.71214 7.47554 1.47591 6.55324 1.47591C5.63093 1.47591 4.77173 1.71214 3.97563 2.1846C3.20866 2.63737 2.60188 3.25255 2.15529 4.03014C1.68928 4.83725 1.45627 5.70834 1.45627 6.64341C1.45627 7.57849 1.68928 8.44958 2.15529 9.25669C2.60188 10.0343 3.20866 10.6495 3.97563 11.1022C4.77173 11.5747 5.63093 11.8109 6.55324 11.8109C7.23283 11.8109 7.8833 11.683 8.50464 11.427C9.10657 11.1711 9.64054 10.8119 10.1065 10.3493L10.2085 10.2459Z"
        fill="#1D1D1F"
        fillOpacity="0.3"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4.3182 2.5V3.33333H2.26195V7.91667H6.7857V5.83333H7.6082V8.33333C7.6082 8.45 7.56845 8.54861 7.48894 8.62917C7.40943 8.70972 7.3121 8.75 7.19695 8.75H1.8507C1.73555 8.75 1.63822 8.70972 1.55872 8.62917C1.47921 8.54861 1.43945 8.45 1.43945 8.33333V2.91667C1.43945 2.8 1.47921 2.70139 1.55872 2.62083C1.63822 2.54028 1.73555 2.5 1.8507 2.5H4.3182ZM8.84195 1.25V4.58333H8.01945V2.675L4.8117 5.91667L4.23595 5.33333L7.43548 2.08333H5.55195V1.25H8.84195Z"
        fill="#1D1D1F"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M5.91598 4.66013L10.5111 -0.000403281L11.832 1.33927L7.23685 5.9998L11.832 10.6603L10.5111 12L5.91598 7.33947L1.32086 12L0 10.6603L4.59512 5.9998L0 1.33927L1.32086 -0.000403281L5.91598 4.66013Z"
        fill="#1D1D1F"
        fillOpacity="0.3"
      />
    </svg>
  );
}

function RefundCashIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4.54128 2.83092C6.13428 1.49794 7.94078 0.631505 9.96078 0.231611C11.9315 -0.151619 13.8858 -0.0599777 15.8237 0.506538C17.8108 1.10638 19.5517 2.1561 21.0461 3.6557C22.2121 4.85538 23.1072 6.23834 23.7312 7.80459C24.3389 9.30419 24.6427 10.8704 24.6427 12.5033C24.6427 14.1362 24.3389 15.7025 23.7312 17.2021C23.1072 18.7683 22.208 20.1471 21.0338 21.3385C19.8596 22.5298 18.5006 23.4421 16.9569 24.0752C15.4788 24.6917 13.9351 25 12.3257 25C10.7162 25 9.17249 24.6917 7.69444 24.0752C6.15071 23.4421 4.78762 22.534 3.60518 21.351C2.07787 19.7847 1.02681 17.9519 0.452016 15.8524C-0.106357 13.8197 -0.147414 11.7702 0.328846 9.70408L0.402748 9.32918L2.79226 9.95402C2.34884 11.6536 2.34884 13.3448 2.79226 15.0277C3.23567 16.7772 4.08965 18.2935 5.3542 19.5764C6.61875 20.8594 8.11322 21.7259 9.83761 22.1758C11.4963 22.609 13.155 22.609 14.8137 22.1758C16.5381 21.7259 18.0326 20.8594 19.2971 19.5764C20.5617 18.2935 21.4156 16.7772 21.8591 15.0277C22.286 13.3448 22.286 11.6619 21.8591 9.97901C21.4156 8.22948 20.5617 6.71321 19.2971 5.43023C18.1639 4.28053 16.8337 3.46408 15.3064 2.98088C13.8283 2.49767 12.3174 2.38104 10.7737 2.63097C9.22997 2.8809 7.82583 3.47241 6.56127 4.4055L6.2903 4.60544L7.54664 5.8801L1.88079 7.20475L3.1864 1.45628L4.54128 2.83092ZM13.5574 5.00534V7.50467H16.6366V10.004H9.86225C9.69802 10.004 9.55432 10.0665 9.43115 10.1915C9.30798 10.3164 9.24639 10.458 9.24639 10.6163C9.24639 10.7746 9.29566 10.9121 9.3942 11.0287C9.49273 11.1454 9.6159 11.2203 9.76371 11.2537H9.86225H14.7891C15.3474 11.2537 15.8606 11.3953 16.3287 11.6786C16.7967 11.9618 17.1704 12.3409 17.4495 12.8158C17.7287 13.2906 17.8683 13.8113 17.8683 14.3778C17.8683 14.9444 17.7287 15.465 17.4495 15.9399C17.1704 16.4148 16.7967 16.7939 16.3287 17.0771C15.8606 17.3604 15.3474 17.502 14.7891 17.502H13.5574V20.0013H11.094V17.502H8.01469V15.0027H14.7891C14.9533 15.0027 15.097 14.9402 15.2202 14.8152C15.3433 14.6903 15.4049 14.5486 15.4049 14.3903C15.4049 14.232 15.3556 14.0946 15.2571 13.9779C15.1586 13.8613 15.0354 13.7863 14.8876 13.753H14.7891H9.86225C9.30387 13.753 8.79066 13.6114 8.32261 13.3281C7.85457 13.0449 7.48095 12.6658 7.20176 12.1909C6.92258 11.716 6.78298 11.1954 6.78298 10.6288C6.78298 10.0623 6.92258 9.54163 7.20176 9.06675C7.48095 8.59188 7.85457 8.21281 8.32261 7.92956C8.79066 7.6463 9.30387 7.50467 9.86225 7.50467H11.094V5.00534H13.5574Z"
        fill="#EF4444"
      />
    </svg>
  );
}

function ApproveCircleIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12.32 25C10.6445 25 9.04289 24.675 7.51521 24.025C6.05323 23.3917 4.75142 22.4959 3.60976 21.3376C2.46811 20.1793 1.58518 18.8585 0.960961 17.3752C0.32032 15.8252 0 14.2003 0 12.5003C0 10.8004 0.32032 9.17542 0.960961 7.62546C1.58518 6.14217 2.46811 4.82137 3.60976 3.66307C4.75142 2.50477 6.05323 1.60896 7.51521 0.975642C9.04289 0.325659 10.6445 0.000666709 12.32 0.000666709C13.9955 0.000666709 15.5971 0.325659 17.1248 0.975642C18.5868 1.60896 19.8886 2.50477 21.0303 3.66307C22.1719 4.82137 23.0549 6.14217 23.6791 7.62546C24.3197 9.17542 24.64 10.8004 24.64 12.5003C24.64 14.2003 24.3197 15.8252 23.6791 17.3752C23.0549 18.8585 22.1719 20.1793 21.0303 21.3376C19.8886 22.4959 18.5868 23.3917 17.1248 24.025C15.5971 24.675 13.9955 25 12.32 25ZM12.32 22.5001C14.1105 22.5001 15.7696 22.0417 17.2973 21.1251C18.7757 20.2418 19.9502 19.0502 20.8208 17.5502C21.7243 16.0002 22.176 14.317 22.176 12.5003C22.176 10.6837 21.7243 9.00043 20.8208 7.45047C19.9502 5.95051 18.7757 4.75887 17.2973 3.87556C15.7696 2.95892 14.1105 2.5006 12.32 2.5006C10.5295 2.5006 8.87041 2.95892 7.34273 3.87556C5.86433 4.75887 4.68982 5.95051 3.8192 7.45047C2.91574 9.00043 2.464 10.6837 2.464 12.5003C2.464 14.317 2.91574 16.0002 3.8192 17.5502C4.68982 19.0502 5.86433 20.2418 7.34273 21.1251C8.87041 22.0417 10.5295 22.5001 12.32 22.5001ZM11.088 17.5002L5.86433 12.2003L7.61377 10.4254L11.088 13.9753L18.0611 6.90048L19.8106 8.65044L11.088 17.5002Z"
        fill="#10B981"
      />
    </svg>
  );
}

function RejectCircleIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12.32 25C10.6445 25 9.04289 24.675 7.51521 24.025C6.05323 23.3917 4.75142 22.4959 3.60976 21.3376C2.46811 20.1793 1.58518 18.8585 0.960961 17.3752C0.32032 15.8252 0 14.2003 0 12.5003C0 10.8004 0.32032 9.17542 0.960961 7.62546C1.58518 6.14217 2.46811 4.82137 3.60976 3.66307C4.75142 2.50477 6.05323 1.60896 7.51521 0.975642C9.04289 0.325659 10.6445 0.000666709 12.32 0.000666709C13.9955 0.000666709 15.5971 0.325659 17.1248 0.975642C18.5868 1.60896 19.8886 2.50477 21.0303 3.66307C22.1719 4.82137 23.0549 6.14217 23.6791 7.62546C24.3197 9.17542 24.64 10.8004 24.64 12.5003C24.64 14.2003 24.3197 15.8252 23.6791 17.3752C23.0549 18.8585 22.1719 20.1793 21.0303 21.3376C19.8886 22.4959 18.5868 23.3917 17.1248 24.025C15.5971 24.675 13.9955 25 12.32 25ZM12.32 22.5001C14.1105 22.5001 15.7696 22.0417 17.2973 21.1251C18.7757 20.2418 19.9502 19.0502 20.8208 17.5502C21.7243 16.0002 22.176 14.317 22.176 12.5003C22.176 10.6837 21.7243 9.00043 20.8208 7.45047C19.9502 5.95051 18.7757 4.75887 17.2973 3.87556C15.7696 2.95892 14.1105 2.5006 12.32 2.5006C10.5295 2.5006 8.87041 2.95892 7.34273 3.87556C5.86433 4.75887 4.68982 5.95051 3.8192 7.45047C2.91574 9.00043 2.464 10.6837 2.464 12.5003C2.464 14.317 2.91574 16.0002 3.8192 17.5502C4.68982 19.0502 5.86433 20.2418 7.34273 21.1251C8.87041 22.0417 10.5295 22.5001 12.32 22.5001ZM12.32 10.7254L15.7943 7.20047L17.5437 8.97543L14.0695 12.5003L17.5437 16.0252L15.7943 17.8002L12.32 14.2753L8.84577 17.8002L7.09633 16.0252L10.5706 12.5003L7.09633 8.97543L8.84577 7.20047L12.32 10.7254Z"
        fill="#EF4444"
      />
    </svg>
  );
}

function ModalField({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          paddingBottom: "4.88px",
          fontSize: "11px",
          fontWeight: 400,
          letterSpacing: "-0.165px",
          lineHeight: "19.8px",
          color: "rgba(29,29,31,0.4)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: big ? "18px" : "13px",
          fontWeight: big ? 700 : 400,
          letterSpacing: big ? "-0.27px" : "-0.195px",
          lineHeight: big ? "32.4px" : "23.4px",
          color: "#1D1D1F",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ModalCard({ title, plain, children }: { title: string; plain?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: "19.52px" }}>
      <div
        style={{
          borderRadius: "14.64px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: plain ? undefined : "rgba(29,29,31,0.016)",
          padding: "20.52px",
        }}
      >
        <p
          style={{
            margin: 0,
            paddingBottom: "14.64px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.275px",
            lineHeight: "19.8px",
            color: "rgba(29,29,31,0.4)",
          }}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

const KV_LABEL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: "-0.18px",
  lineHeight: "21.6px",
  color: "rgba(29,29,31,0.4)",
  whiteSpace: "nowrap",
};

const KV_VALUE: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: "-0.18px",
  lineHeight: "21.6px",
  color: "#1D1D1F",
};

function ModalKV({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <p className="flex" style={{ margin: 0, gridColumn: span ? "1 / -1" : undefined }}>
      <span style={KV_LABEL}>{label}</span>
      <span style={KV_VALUE}>{value}</span>
    </p>
  );
}

function ModalGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: "9.76px", rowGap: "9.76px" }}
    >
      {children}
    </div>
  );
}

function TxnDetailModal({ txn, onClose }: { txn: Txn; onClose: () => void }) {
  const extra = txn.extra;
  const st = SETTLE_STYLE[txn.settle];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }}
      onClick={onClose}
    >
      <div
        className="flex w-full flex-col"
        style={{
          maxWidth: "624px",
          maxHeight: "min(879px, calc(100vh - 39.04px))",
          background: "#FFFFFF",
          borderRadius: "19.52px",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 items-center justify-between"
          style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "-0.42px",
              lineHeight: "18.75px",
              color: "#1D1D1F",
            }}
          >
            거래 상세
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex shrink-0 items-center justify-center"
            style={{
              width: "39.03px",
              height: "39.03px",
              borderRadius: "9.76px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="닫기"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto" style={{ padding: "29.28px" }}>
          <div className="flex flex-col" style={{ gap: "14.64px" }}>
            <div className="flex" style={{ gap: "14.64px" }}>
              <ModalField label="결제 일시" value={txn.date} />
              <ModalField label="결제 수단" value={txn.method} />
            </div>
            <ModalField label="PG 승인번호" value={txn.pg} />
            <ModalField label="결제 금액" value={`${txn.amount}원`} big />
          </div>

          <ModalCard title="수요자">
            <ModalGrid>
              <ModalKV label="기관명:" value={txn.buyer} />
              <ModalKV label="부서명:" value={txn.buyerDept} />
              {extra && <ModalKV label="담당자:" value={extra.manager} />}
              {extra && <ModalKV label="연락처:" value={extra.buyerPhone} />}
            </ModalGrid>
          </ModalCard>

          {extra && (
            <ModalCard title="세금계산서 발행 정보">
              <ModalGrid>
                <ModalKV label="사업자등록번호:" value={extra.tax.bizNo} />
                <ModalKV label="대표자:" value={extra.tax.ceo} />
                <ModalKV label="수신 이메일:" value={extra.tax.email} span />
                <ModalKV label="사업장 주소:" value={extra.tax.address} />
                <p className="flex items-center" style={{ margin: 0 }}>
                  <span style={KV_LABEL}>세금계산서:</span>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ borderRadius: "9999px", padding: "2.44px 9.76px" }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 400,
                        letterSpacing: "-0.165px",
                        lineHeight: "19.8px",
                        color: "rgba(29,29,31,0.3)",
                      }}
                    >
                      {extra.tax.status}
                    </span>
                  </span>
                </p>
              </ModalGrid>
            </ModalCard>
          )}

          <ModalCard title="공급자">
            <ModalGrid>
              <ModalKV label="업체명:" value={txn.supplier} />
              {extra && <ModalKV label="대표자:" value={extra.supplierCeo} />}
              <ModalKV label="사업자번호:" value={txn.supplierBiz} />
              {extra && <ModalKV label="연락처:" value={extra.supplierPhone} />}
            </ModalGrid>
          </ModalCard>

          <ModalCard title="정산 제어" plain>
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  letterSpacing: "-0.195px",
                  lineHeight: "23.4px",
                  color: "rgba(29,29,31,0.6)",
                }}
              >
                정산 상태
              </span>
              <div className="flex items-center" style={{ gap: "9.76px" }}>
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    borderRadius: "9999px",
                    padding: "5.88px 13.2px",
                    background: st.bg,
                    border: `1px solid ${st.border}`,
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: st.color,
                  }}
                >
                  {txn.settle}
                </span>
                {extra && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 400,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      color: "rgba(29,29,31,0.3)",
                    }}
                  >
                    {extra.settleNote}
                  </span>
                )}
              </div>
            </div>
          </ModalCard>
        </div>

        <div className="shrink-0" style={{ padding: "0 29.28px 24.4px" }}>
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center"
            style={{
              borderRadius: "14.64px",
              border: "1px solid rgba(210,210,215,0.2)",
              background: "transparent",
              padding: "13.2px 1px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "-0.2928px",
              lineHeight: "22.75px",
              color: "rgba(29,29,31,0.5)",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

const MODAL_SHADOW = "0px 20px 25px 0px rgba(0,0,0,0.1), 0px 8px 10px 0px rgba(0,0,0,0.1)";

function ModalOverlay({
  maxWidth,
  onClose,
  children,
}: {
  maxWidth: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }}
      onClick={onClose}
    >
      <div
        className="w-full"
        style={{
          maxWidth,
          maxHeight: "calc(100vh - 39.04px)",
          overflowY: "auto",
          background: "#FFFFFF",
          borderRadius: "19.52px",
          padding: "29.28px",
          boxShadow: MODAL_SHADOW,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmBg,
  confirmDim,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmBg: string;
  confirmDim?: boolean;
}) {
  return (
    <div className="flex items-center" style={{ gap: "14.64px" }}>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex flex-1 items-center justify-center"
        style={{
          height: "49.13px",
          borderRadius: "14.64px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: "transparent",
          padding: "0 1px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "-0.2928px",
          lineHeight: "22.75px",
          color: "rgba(29,29,31,0.5)",
        }}
      >
        취소
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="inline-flex flex-1 items-center justify-center"
        style={{
          height: "49.13px",
          borderRadius: "14.64px",
          border: "none",
          background: confirmBg,
          opacity: confirmDim ? 0.4 : undefined,
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "-0.2928px",
          lineHeight: "22.75px",
          color: confirmDim ? "rgba(255,255,255,0.4)" : "#FFFFFF",
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

function RefundField({
  label,
  value,
  valueStyle,
  first,
}: {
  label: string;
  value: string;
  valueStyle: React.CSSProperties;
  first?: boolean;
}) {
  return (
    <div className="flex items-center justify-between" style={{ paddingTop: first ? undefined : "4.88px" }}>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 400,
          letterSpacing: "-0.165px",
          lineHeight: "19.8px",
          color: "rgba(29,29,31,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={valueStyle}>{value}</span>
    </div>
  );
}

function RefundModal({ txn, onClose }: { txn: Txn; onClose: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/payment/orders/${txn.orderId}/refund`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };
  return (
    <ModalOverlay maxWidth="468px" onClose={onClose}>
      <div className="flex justify-center" style={{ paddingBottom: "19.52px" }}>
        <span
          className="flex shrink-0 items-center justify-center"
          style={{ width: "68.31px", height: "68.31px", borderRadius: "19.52px", background: "#FEF2F2" }}
        >
          <RefundCashIcon />
        </span>
      </div>
      <p
        style={{
          margin: 0,
          paddingBottom: "9.76px",
          textAlign: "center",
          fontSize: "17px",
          fontWeight: 700,
          letterSpacing: "-0.476px",
          lineHeight: "21.25px",
          color: "#1D1D1F",
        }}
      >
        환불 처리
      </p>
      <div
        style={{
          marginBottom: "19.52px",
          borderRadius: "14.64px",
          background: "rgba(29,29,31,0.02)",
          padding: "14.64px",
        }}
      >
        <RefundField
          first
          label="PG 승인번호"
          value={txn.pg}
          valueStyle={{
            fontSize: "11px",
            fontWeight: 400,
            letterSpacing: "-0.165px",
            lineHeight: "19.8px",
            color: "rgba(29,29,31,0.6)",
          }}
        />
        <RefundField
          label="수요자"
          value={txn.buyer}
          valueStyle={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "-0.18px",
            lineHeight: "21.6px",
            color: "#1D1D1F",
          }}
        />
        <RefundField
          label="공급자"
          value={txn.supplier}
          valueStyle={{
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "-0.18px",
            lineHeight: "21.6px",
            color: "#1D1D1F",
          }}
        />
        <RefundField
          label="결제 금액"
          value={`${txn.amount}원`}
          valueStyle={{
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "-0.21px",
            lineHeight: "25.2px",
            color: "#1D1D1F",
          }}
        />
      </div>
      <ModalActions onCancel={onClose} onConfirm={submit} confirmLabel="환불 처리" confirmBg="#EF4444" confirmDim={saving} />
    </ModalOverlay>
  );
}

function SubConfirmModal({
  title,
  message,
  subId,
  action,
  onClose,
}: {
  title: string;
  message: string;
  subId: string;
  action: "confirm-payment" | "suspend" | "unsuspend";
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/payment/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };
  return (
    <ModalOverlay maxWidth="468.47px" onClose={onClose}>
      <p
        style={{
          margin: 0,
          paddingBottom: "14.64px",
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "-0.42px",
          lineHeight: "18.75px",
          color: "#1D1D1F",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          paddingBottom: "24.4px",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "-0.195px",
          lineHeight: "23.4px",
          color: "rgba(29,29,31,0.6)",
        }}
      >
        {message}
      </p>
      <ModalActions onCancel={onClose} onConfirm={submit} confirmLabel="확인" confirmBg="#1E3A5F" confirmDim={saving} />
    </ModalOverlay>
  );
}

function RefundDecisionModal({
  kind,
  req,
  onClose,
}: {
  kind: "approve" | "reject";
  req: RefundReq;
  onClose: () => void;
}) {
  const approve = kind === "approve";
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/payment/refunds/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: approve ? "APPROVED" : "REJECTED" }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };
  return (
    <ModalOverlay maxWidth="468px" onClose={onClose}>
      <div className="flex justify-center" style={{ paddingBottom: "19.52px" }}>
        <span
          className="flex shrink-0 items-center justify-center"
          style={{
            width: "68.31px",
            height: "68.31px",
            borderRadius: "19.52px",
            background: approve ? "#ECFDF5" : "#FEF2F2",
          }}
        >
          {approve ? <ApproveCircleIcon /> : <RejectCircleIcon />}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          paddingBottom: "9.76px",
          textAlign: "center",
          fontSize: "17px",
          fontWeight: 700,
          letterSpacing: "-0.476px",
          lineHeight: "21.25px",
          color: "#1D1D1F",
        }}
      >
        {approve ? "환불 승인" : "환불 거부"}
      </p>
      <p style={{ margin: 0, paddingBottom: "9.76px", textAlign: "center" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "-0.195px",
            lineHeight: "23.4px",
            color: "#1D1D1F",
          }}
        >
          {req.buyer}
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "-0.195px",
            lineHeight: "23.4px",
            color: "rgba(29,29,31,0.6)",
          }}
        >
          {` (${req.buyerOrg})`}
        </span>
      </p>
      <p
        style={{
          margin: 0,
          paddingBottom: "4.88px",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "-0.195px",
          lineHeight: "23.4px",
          color: "rgba(29,29,31,0.5)",
        }}
      >
        {`주문 #${req.order}`}
      </p>
      <p
        style={{
          margin: 0,
          paddingBottom: "19.52px",
          textAlign: "center",
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "-0.225px",
          lineHeight: "27px",
          color: "#1D1D1F",
        }}
      >
        {req.amount}
      </p>
      <ModalActions
        onCancel={onClose}
        onConfirm={submit}
        confirmLabel={saving ? "처리 중…" : approve ? "승인 처리" : "거부 처리"}
        confirmBg={approve ? "#10B981" : "#EF4444"}
        confirmDim
      />
    </ModalOverlay>
  );
}

function TabKpiCard({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <div
      style={{
        width,
        flexShrink: 0,
        borderRadius: "14.64px",
        border: "1px solid rgba(210,210,215,0.2)",
        background: "#FFFFFF",
        padding: "20.52px",
      }}
    >
      <p
        style={{
          margin: 0,
          paddingBottom: "9.76px",
          fontSize: "11px",
          fontWeight: 400,
          letterSpacing: "-0.165px",
          lineHeight: "19.8px",
          color: "rgba(29,29,31,0.4)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.3px",
          lineHeight: "36px",
          color: "#1D1D1F",
        }}
      >
        {value}
      </p>
    </div>
  );
}

const ROW_BTN_BASE: React.CSSProperties = {
  height: "36.42px",
  borderRadius: "9.76px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 400,
  letterSpacing: "-0.2401px",
  lineHeight: "19.8px",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const SUB_CHIPS = ["전체", "정상", "미납"] as const;

const SUB_STATUS_STYLE: Record<SubStatus, { bg: string; border: string; color: string }> = {
  정상: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  미납: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};

const SUB_COLS = [
  { label: "업체명", w: 184.78 },
  { label: "플랜", w: 121.83 },
  { label: "월 이용료", w: 140.5 },
  { label: "다음 결제일", w: 142 },
  { label: "잔여일", w: 119.81 },
  { label: "상태", w: 125.58 },
  { label: "", w: 252.17 },
] as const;

function SubscriptionTab({ subscriptions, subKpi }: { subscriptions: SubRow[]; subKpi: Kpi }) {
  const [chip, setChip] = useState<(typeof SUB_CHIPS)[number]>("전체");
  const [subSearch, setSubSearch] = useState("");
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    subId: string;
    action: "confirm-payment" | "suspend" | "unsuspend";
  } | null>(null);

  const rows = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    return subscriptions.filter((r) => {
      if (chip !== "전체" && r.status !== chip) return false;
      if (q && !r.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subscriptions, chip, subSearch]);

  return (
    <div>
      <div className="flex" style={{ gap: "14.64px", marginBottom: "24.4px" }}>
        <TabKpiCard label={subKpi.label} value={subKpi.value} width="536.72px" />
      </div>

      <div
        style={{
          marginBottom: "19.52px",
          borderRadius: "14.64px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: "#FFFFFF",
          padding: "20.52px",
        }}
      >
        <div className="flex items-center" style={{ gap: "14.64px" }}>
          <div
            className="flex items-center"
            style={{
              flex: 1,
              position: "relative",
              borderRadius: "14.64px",
              border: "1px solid rgba(210,210,215,0.3)",
              background: "#FFFFFF",
              padding: "13.19px 15.64px 13.19px 44.92px",
            }}
          >
            <span
              className="inline-flex items-center justify-center"
              style={{ position: "absolute", left: "17.25px", top: "50%", transform: "translateY(-50%)" }}
            >
              <SearchIcon />
            </span>
            <input
              type="text"
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              placeholder="업체명 검색"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: "#1D1D1F",
              }}
            />
          </div>
          <div className="flex items-center" style={{ gap: "9.76px" }}>
            {SUB_CHIPS.map((c) => {
              const active = chip === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChip(c)}
                  className="inline-flex items-center justify-center"
                  style={{
                    borderRadius: "9999px",
                    height: "49.13px",
                    padding: "0 15.64px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "-0.2928px",
                    lineHeight: "21px",
                    border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
                    background: active ? "#1E3A5F" : "#FFFFFF",
                    color: active ? "#FFFFFF" : "rgba(29,29,31,0.5)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          borderRadius: "14.64px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: "#FFFFFF",
          padding: "1px",
          overflow: "hidden",
        }}
      >
        <div>
          <div
            className="flex"
            style={{ background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}
          >
            {SUB_COLS.map((c, i) => (
              <div key={i} style={{ flex: `${c.w} 1 0px`, minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: HEAD_TEXT,
                  }}
                >
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {rows.map((r, i) => {
            const st = SUB_STATUS_STYLE[r.status];
            return (
              <div
                key={r.name}
                className="flex items-center"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)" }}
              >
                <div style={{ width: "184.78px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "-0.195px",
                      lineHeight: "23.4px",
                      color: "#1D1D1F",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.name}
                  </span>
                </div>
                <div style={{ width: "121.83px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.18px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.6)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.plan}
                  </span>
                </div>
                <div style={{ width: "140.5px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "-0.195px",
                      lineHeight: "23.4px",
                      color: "#1D1D1F",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.fee}
                  </span>
                </div>
                <div style={{ width: "142px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.18px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.nextPay}
                  </span>
                </div>
                <div style={{ width: "119.81px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.18px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.remain}
                  </span>
                </div>
                <div style={{ width: "125.58px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{
                      borderRadius: "9999px",
                      height: "24.75px",
                      padding: "0 13.2px",
                      background: st.bg,
                      border: `1px solid ${st.border}`,
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      color: st.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <div style={{ width: "252.17px", flexShrink: 0, padding: CELL_PAD }}>
                  <div className="flex items-center" style={{ gap: "7.32px" }}>
                    {r.status === "미납" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirm({
                              title: "결제 확인",
                              message: `${r.name} 업체의 결제를 확인 처리하시겠습니까?`,
                              subId: r.id,
                              action: "confirm-payment",
                            })
                          }
                          className="inline-flex items-center justify-center"
                          style={{
                            ...ROW_BTN_BASE,
                            padding: "0 12.2px",
                            border: "none",
                            background: "#1E3A5F",
                            color: "#FFFFFF",
                          }}
                        >
                          결제 확인
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirm({
                              title: "권한 제한 해제",
                              message: `${r.name} 업체의 권한 제한을 해제하시겠습니까?`,
                              subId: r.id,
                              action: "unsuspend",
                            })
                          }
                          className="inline-flex items-center justify-center"
                          style={{
                            ...ROW_BTN_BASE,
                            padding: "0 13.2px",
                            border: "1px solid rgba(210,210,215,0.3)",
                            background: "transparent",
                            color: "rgba(29,29,31,0.5)",
                          }}
                        >
                          제한 해제
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirm({
                            title: "권한 제한",
                            message: `${r.name} 업체의 권한을 제한하시겠습니까?`,
                            subId: r.id,
                            action: "suspend",
                          })
                        }
                        className="inline-flex items-center justify-center"
                        style={{
                          ...ROW_BTN_BASE,
                          padding: "0 13.2px",
                          border: "1px solid #FECACA",
                          background: "transparent",
                          color: "#DC2626",
                        }}
                      >
                        권한 제한
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {confirm && (
        <SubConfirmModal
          title={confirm.title}
          message={confirm.message}
          subId={confirm.subId}
          action={confirm.action}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

const REFUND_COLS = [
  { label: "주문번호", w: 74.63 },
  { label: "구매자", w: 88.61 },
  { label: "공급업체", w: 132.72 },
  { label: "품목", w: 160 },
  { label: "금액", w: 117.36 },
  { label: "요청일", w: 107.52 },
  { label: "사유", w: 200 },
  { label: "상태", w: 117.56 },
  { label: "처리", w: 146.38 },
] as const;

const REFUND_STATUS_CHIP: Record<RefundReq["status"], { bg: string; border: string; color: string; label: string }> = {
  PENDING: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626", label: "처리 대기" },
  APPROVED: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857", label: "승인 완료" },
  REJECTED: { bg: "rgba(29,29,31,0.05)", border: "rgba(210,210,215,0.4)", color: "rgba(29,29,31,0.5)", label: "거부 완료" },
};

function RefundRequestTab({ refunds, refundKpis }: { refunds: RefundReq[]; refundKpis: Kpi[] }) {
  const [decision, setDecision] = useState<{ kind: "approve" | "reject"; req: RefundReq } | null>(null);

  return (
    <div>
      <div className="flex" style={{ gap: "14.64px", marginBottom: "24.4px" }}>
        {refundKpis.map((k) => (
          <TabKpiCard key={k.label} label={k.label} value={k.value} width="353.42px" />
        ))}
      </div>

      <div
        style={{
          borderRadius: "14.64px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: "#FFFFFF",
          padding: "1px",
          overflow: "hidden",
        }}
      >
        <div>
          <div
            className="flex"
            style={{ background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}
          >
            {REFUND_COLS.map((c) => (
              <div key={c.label} style={{ flex: `${c.w} 1 0px`, minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: HEAD_TEXT,
                  }}
                >
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {refunds.map((r, i) => (
            <div
              key={r.order}
              className="flex items-center"
              style={{
                background: "rgba(254,242,242,0.2)",
                borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)",
              }}
            >
              <div style={{ flex: "74.63 1 0px", minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: "rgba(29,29,31,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.order}
                </span>
              </div>
              <div style={{ flex: "88.61 1 0px", minWidth: 0, padding: CELL_PAD }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "-0.195px",
                    lineHeight: "23.4px",
                    color: "#1D1D1F",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.buyer}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: "rgba(29,29,31,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.buyerOrg}
                </p>
              </div>
              <div style={{ flex: "132.72 1 0px", minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "-0.18px",
                    lineHeight: "21.6px",
                    color: "rgba(29,29,31,0.6)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.supplier}
                </span>
              </div>
              <div style={{ flex: "160 1 0px", minWidth: 0, padding: CELL_PAD, overflow: "hidden" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "-0.18px",
                    lineHeight: "21.6px",
                    color: "rgba(29,29,31,0.6)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {r.item}
                </span>
              </div>
              <div style={{ flex: "117.36 1 0px", minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "-0.195px",
                    lineHeight: "23.4px",
                    color: "#1D1D1F",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.amount}
                </span>
              </div>
              <div style={{ flex: "107.52 1 0px", minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "-0.18px",
                    lineHeight: "21.6px",
                    color: "rgba(29,29,31,0.5)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.date}
                </span>
              </div>
              <div style={{ flex: "200 1 0px", minWidth: 0, padding: CELL_PAD, overflow: "hidden" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "-0.18px",
                    lineHeight: "21.6px",
                    color: "rgba(29,29,31,0.6)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {r.reason}
                </span>
              </div>
              <div style={{ flex: "117.56 1 0px", minWidth: 0, padding: CELL_PAD }}>
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    borderRadius: "9999px",
                    height: "24.75px",
                    padding: "0 13.2px",
                    background: REFUND_STATUS_CHIP[r.status].bg,
                    border: `1px solid ${REFUND_STATUS_CHIP[r.status].border}`,
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: REFUND_STATUS_CHIP[r.status].color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {REFUND_STATUS_CHIP[r.status].label}
                </span>
              </div>
              <div style={{ flex: "146.38 1 0px", minWidth: 0, padding: CELL_PAD }}>
                {r.status === "PENDING" ? (
                  <div className="flex items-center" style={{ gap: "7.32px" }}>
                    <button
                      type="button"
                      onClick={() => setDecision({ kind: "approve", req: r })}
                      className="inline-flex items-center justify-center"
                      style={{
                        ...ROW_BTN_BASE,
                        padding: "0 12.2px",
                        border: "none",
                        background: "#1E3A5F",
                        color: "#FFFFFF",
                      }}
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision({ kind: "reject", req: r })}
                      className="inline-flex items-center justify-center"
                      style={{
                        ...ROW_BTN_BASE,
                        padding: "0 13.2px",
                        border: "1px solid rgba(210,210,215,0.3)",
                        background: "transparent",
                        color: "rgba(29,29,31,0.5)",
                      }}
                    >
                      거부
                    </button>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.18px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.4)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    처리 완료
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {decision && <RefundDecisionModal kind={decision.kind} req={decision.req} onClose={() => setDecision(null)} />}
    </div>
  );
}

export function PaymentView({ data }: { data: AdminPaymentData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("전체 거래 모니터링");
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("전체");
  const [txnSearch, setTxnSearch] = useState("");
  const [detailTxn, setDetailTxn] = useState<Txn | null>(null);
  const [refundTxn, setRefundTxn] = useState<Txn | null>(null);

  const rows = useMemo(() => {
    const q = txnSearch.trim().toLowerCase();
    return data.txns.filter((t) => {
      if (chip !== "전체" && t.settle !== chip) return false;
      if (q) {
        const hit =
          t.buyer.toLowerCase().includes(q) ||
          t.supplier.toLowerCase().includes(q) ||
          t.pg.toLowerCase().includes(q) ||
          t.method.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [data.txns, chip, txnSearch]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "34.16px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "-0.504px",
            lineHeight: "22.5px",
            color: "#1D1D1F",
          }}
        >
          전체 결제 관제
        </h1>
        <p
          style={{
            margin: "2.44px 0 0",
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "-0.18px",
            lineHeight: "21.6px",
            color: "rgba(29,29,31,0.4)",
          }}
        >
          플랫폼 전체 자금 흐름 모니터링 및 정산 제어
        </p>
      </div>

      <div className="flex" style={{ gap: "14.64px", marginBottom: "29.28px" }}>
        {data.kpis.map((k) => (
          <div
            key={k.label}
            style={{
              flex: 1,
              borderRadius: "14.64px",
              border: "1px solid rgba(210,210,215,0.2)",
              background: "#FFFFFF",
              padding: "20.52px",
            }}
          >
            <p
              style={{
                margin: "0 0 9.76px",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "-0.165px",
                lineHeight: "19.8px",
                color: "rgba(29,29,31,0.4)",
              }}
            >
              {k.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.3px",
                lineHeight: "20px",
                color: "#1D1D1F",
              }}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-stretch" style={{ marginBottom: "24.4px" }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="inline-flex items-center justify-center"
              style={{
                position: "relative",
                gap: "7.32px",
                padding: "12.2px 19.52px 14.2px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: active ? "#1E3A5F" : "rgba(29,29,31,0.4)",
              }}
            >
              {t}
              {t === "환불 요청 관리" && (
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    borderRadius: "9999px",
                    padding: "2.44px 7.32px",
                    background: "#FEE2E2",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "-0.15px",
                    lineHeight: "18px",
                    color: "#DC2626",
                  }}
                >
                  {data.refunds.length}
                </span>
              )}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "1px",
                    background: "#1E3A5F",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "전체 거래 모니터링" && (
        <>
      <div className="flex items-center" style={{ gap: "14.64px", marginBottom: "19.52px" }}>
        <div
          className="flex items-center"
          style={{
            flex: 1,
            position: "relative",
            borderRadius: "14.64px",
            border: "1px solid rgba(210,210,215,0.3)",
            background: "#FFFFFF",
            padding: "13.19px 15.64px 13.19px 44.92px",
          }}
        >
          <span
            className="inline-flex items-center justify-center"
            style={{ position: "absolute", left: "19.52px", top: "50%", transform: "translateY(-50%)" }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            value={txnSearch}
            onChange={(e) => setTxnSearch(e.target.value)}
            placeholder="수요자, 공급자, PG번호, 결제수단 검색"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "-0.2928px",
              lineHeight: "22.75px",
              color: "#1D1D1F",
            }}
          />
        </div>

        <div className="flex items-center" style={{ gap: "9.76px" }}>
          {CHIPS.map((c) => {
            const active = chip === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className="inline-flex items-center justify-center"
                style={{
                  borderRadius: "9999px",
                  height: "49px",
                  padding: "0 15.64px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "-0.2928px",
                  lineHeight: "21px",
                  border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
                  background: active ? "#1E3A5F" : "#FFFFFF",
                  color: active ? "#FFFFFF" : "rgba(29,29,31,0.5)",
                }}
              >
                {c}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => window.open("/api/admin/payment/export", "_blank", "noopener,noreferrer")}
            className="inline-flex items-center justify-center"
            style={{
              borderRadius: "9999px",
              height: "49px",
              padding: "0 17.08px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "-0.2928px",
              lineHeight: "21px",
              border: "1px solid #1E3A5F",
              background: "#1E3A5F",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
            }}
          >
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div
        style={{
          borderRadius: "14.64px",
          border: "1px solid rgba(210,210,215,0.2)",
          background: "#FFFFFF",
          padding: "1px",
          overflow: "hidden",
        }}
      >
        <div>
          <div
            className="flex"
            style={{ background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}
          >
            {COLS.map((c) => (
              <div key={c.key} style={{ flex: `${c.w} 1 0px`, minWidth: 0, padding: CELL_PAD }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: HEAD_TEXT,
                  }}
                >
                  {c.key === "date"
                    ? "결제 일시"
                    : c.key === "pg"
                      ? "PG 승인번호"
                      : c.key === "method"
                        ? "결제수단"
                        : c.key === "buyer"
                          ? "수요자"
                          : c.key === "supplier"
                            ? "공급자"
                            : c.key === "amount"
                              ? "결제 금액"
                              : c.key === "settle"
                                ? "정산 상태"
                                : ""}
                </span>
              </div>
            ))}
          </div>

          {rows.map((r, i) => {
            const st = SETTLE_STYLE[r.settle];
            return (
              <div
                key={r.pg}
                className="flex items-start"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)" }}
              >
                <div style={{ width: "139px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.18px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.date}
                  </span>
                </div>
                <div style={{ width: "159px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 400,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      color: "rgba(29,29,31,0.4)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.pg}
                  </span>
                </div>
                <div style={{ width: "89px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.18px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.6)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.method}
                  </span>
                </div>
                <div style={{ width: "104px", flexShrink: 0, padding: CELL_PAD }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "-0.195px",
                      lineHeight: "23.4px",
                      color: "#1D1D1F",
                    }}
                  >
                    {r.buyer}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      fontWeight: 400,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      color: "rgba(29,29,31,0.4)",
                    }}
                  >
                    {r.buyerDept}
                  </p>
                </div>
                <div style={{ width: "134px", flexShrink: 0, padding: CELL_PAD }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "-0.195px",
                      lineHeight: "23.4px",
                      color: "#1D1D1F",
                    }}
                  >
                    {r.supplier}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      fontWeight: 400,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      color: "rgba(29,29,31,0.4)",
                    }}
                  >
                    {r.supplierBiz}
                  </p>
                </div>
                <div style={{ width: "129px", flexShrink: 0, padding: CELL_PAD }}>
                  <span className="inline-flex items-baseline">
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "-0.21px",
                        lineHeight: "25.2px",
                        color: "#1D1D1F",
                      }}
                    >
                      {r.amount}
                    </span>
                    <span
                      style={{
                        marginLeft: "2px",
                        fontSize: "11px",
                        fontWeight: 400,
                        letterSpacing: "-0.165px",
                        lineHeight: "19.8px",
                        color: "rgba(29,29,31,0.4)",
                      }}
                    >
                      원
                    </span>
                  </span>
                </div>
                <div style={{ width: "115px", flexShrink: 0, padding: CELL_PAD }}>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{
                      borderRadius: "9999px",
                      height: "25px",
                      padding: "0 13.2px",
                      background: st.bg,
                      border: `1px solid ${st.border}`,
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      color: st.color,
                    }}
                  >
                    {r.settle}
                  </span>
                </div>
                <div style={{ width: "218px", flexShrink: 0, padding: "14.64px 14.64px" }}>
                  <div className="flex items-center" style={{ gap: "4.88px" }}>
                    <button
                      type="button"
                      onClick={() => setDetailTxn(r)}
                      className="inline-flex items-center justify-center"
                      style={{
                        borderRadius: "9.76px",
                        border: "1px solid rgba(210,210,215,0.2)",
                        background: "#FFFFFF",
                        padding: "8.32px 13.2px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 400,
                        letterSpacing: "-0.2401px",
                        lineHeight: "21.6px",
                        color: "rgba(29,29,31,0.5)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      상세
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(`/api/orders/${r.orderId}/document?type=sales`, "_blank")}
                      className="inline-flex items-center justify-center"
                      style={{
                        gap: "4.88px",
                        borderRadius: "9.76px",
                        border: "1px solid rgba(210,210,215,0.2)",
                        background: "#FFFFFF",
                        padding: "8.32px 13.2px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 400,
                        letterSpacing: "-0.2401px",
                        lineHeight: "21.6px",
                        color: "rgba(29,29,31,0.5)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      증빙
                      <ExternalIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundTxn(r)}
                      className="inline-flex items-center justify-center"
                      style={{
                        borderRadius: "9.76px",
                        border: "1px solid #FECACA",
                        background: "#FFFFFF",
                        padding: "8.32px 13.2px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 400,
                        letterSpacing: "-0.2401px",
                        lineHeight: "21.6px",
                        color: "#EF4444",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      환불
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {tab === "이용권 수납 관리" && <SubscriptionTab subscriptions={data.subscriptions} subKpi={data.subKpi} />}
      {tab === "환불 요청 관리" && <RefundRequestTab refunds={data.refunds} refundKpis={data.refundKpis} />}

      {detailTxn && <TxnDetailModal txn={detailTxn} onClose={() => setDetailTxn(null)} />}
      {refundTxn && <RefundModal txn={refundTxn} onClose={() => setRefundTxn(null)} />}
    </div>
  );
}
