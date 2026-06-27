"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminProfitData, ProfitPayState as PayState, ProfitPermState as PermState } from "@/lib/admin-profit";

const ICON_REVENUE = (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.2714 18.3327C9.1538 18.3327 8.08549 18.116 7.06649 17.6827C6.09131 17.2604 5.22296 16.6632 4.46145 15.891C3.69994 15.1188 3.111 14.2382 2.69463 13.2493C2.26731 12.216 2.05364 11.1327 2.05364 9.99933C2.05364 8.866 2.26731 7.78267 2.69463 6.74933C3.111 5.76044 3.69994 4.87989 4.46145 4.10767C5.22296 3.33544 6.09131 2.73822 7.06649 2.316C8.08549 1.88267 9.1538 1.666 10.2714 1.666C11.389 1.666 12.4573 1.88267 13.4763 2.316C14.4515 2.73822 15.3199 3.33544 16.0814 4.10767C16.8429 4.87989 17.4318 5.76044 17.8482 6.74933C18.2755 7.78267 18.4892 8.866 18.4892 9.99933C18.4892 11.1327 18.2755 12.216 17.8482 13.2493C17.4318 14.2382 16.8429 15.1188 16.0814 15.891C15.3199 16.6632 14.4515 17.2604 13.4763 17.6827C12.4573 18.116 11.389 18.3327 10.2714 18.3327ZM10.2714 16.666C11.4657 16.666 12.5724 16.3604 13.5914 15.7493C14.5775 15.1604 15.361 14.366 15.9417 13.366C16.5443 12.3327 16.8456 11.2104 16.8456 9.99933C16.8456 8.78822 16.5443 7.666 15.9417 6.63267C15.361 5.63267 14.5775 4.83822 13.5914 4.24933C12.5724 3.63822 11.4657 3.33267 10.2714 3.33267C9.0771 3.33267 7.97044 3.63822 6.95144 4.24933C5.9653 4.83822 5.18188 5.63267 4.60115 6.63267C3.99852 7.666 3.6972 8.78822 3.6972 9.99933C3.6972 11.2104 3.99852 12.3327 4.60115 13.366C5.18188 14.366 5.9653 15.1604 6.95144 15.7493C7.97044 16.3604 9.0771 16.666 10.2714 16.666ZM11.0932 10.8327H13.5585V12.4993H11.0932V14.166H9.44964V12.4993H6.98431V10.8327H9.44964V9.99933H6.98431V8.33267H9.10449L7.36232 6.566L8.52925 5.38267L10.2714 7.14933L12.0136 5.38267L13.1805 6.566L11.4383 8.33267H13.5585V9.99933H11.0932V10.8327Z" fill="#4B5563" />
  </svg>
);

const ICON_TICKET = (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.05364 16.2497H18.4892V17.9163H2.05364V16.2497ZM2.05364 4.583L6.16253 7.49967L10.2714 2.083L14.3803 7.49967L18.4892 4.583V14.583H2.05364V4.583ZM3.6972 7.783V12.9163H16.8456V7.783L14.0352 9.783L10.2714 4.81633L6.50768 9.783L3.6972 7.783Z" fill="#4B5563" />
  </svg>
);

const ICON_PLATFORM = (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7921 17.5C14.2661 17.5 13.784 17.3694 13.3457 17.1083C12.9075 16.8472 12.5596 16.4944 12.3021 16.05C12.0446 15.6056 11.9159 15.1167 11.9159 14.5833C11.9159 14.05 12.0446 13.5611 12.3021 13.1167C12.5596 12.6722 12.9075 12.3194 13.3457 12.0583C13.784 11.7972 14.2661 11.6667 14.7921 11.6667C15.318 11.6667 15.8001 11.7972 16.2384 12.0583C16.6767 12.3194 17.0246 12.6722 17.2821 13.1167C17.5395 13.5611 17.6683 14.05 17.6683 14.5833C17.6683 15.1167 17.5395 15.6056 17.2821 16.05C17.0246 16.4944 16.6767 16.8472 16.2384 17.1083C15.8001 17.3694 15.318 17.5 14.7921 17.5ZM14.7921 15.8333C15.1317 15.8333 15.4221 15.7111 15.6632 15.4667C15.9042 15.2222 16.0247 14.9278 16.0247 14.5833C16.0247 14.2389 15.9042 13.9444 15.6632 13.7C15.4221 13.4556 15.1317 13.3333 14.7921 13.3333C14.4524 13.3333 14.162 13.4556 13.921 13.7C13.6799 13.9444 13.5594 14.2389 13.5594 14.5833C13.5594 14.9278 13.6799 15.2222 13.921 15.4667C14.162 15.7111 14.4524 15.8333 14.7921 15.8333ZM5.75252 8.33333C5.22658 8.33333 4.74448 8.20278 4.30619 7.94167C3.86791 7.68056 3.52003 7.32778 3.26254 6.88333C3.00505 6.43889 2.8763 5.95 2.8763 5.41667C2.8763 4.88333 3.00505 4.39444 3.26254 3.95C3.52003 3.50556 3.86791 3.15278 4.30619 2.89167C4.74448 2.63056 5.22658 2.5 5.75252 2.5C6.27846 2.5 6.76057 2.63056 7.19885 2.89167C7.63713 3.15278 7.98502 3.50556 8.24251 3.95C8.5 4.39444 8.62874 4.88333 8.62874 5.41667C8.62874 5.95 8.5 6.43889 8.24251 6.88333C7.98502 7.32778 7.63713 7.68056 7.19885 7.94167C6.76057 8.20278 6.27846 8.33333 5.75252 8.33333ZM5.75252 6.66667C6.09219 6.66667 6.38255 6.54444 6.62361 6.3C6.86466 6.05556 6.98519 5.76111 6.98519 5.41667C6.98519 5.07222 6.86466 4.77778 6.62361 4.53333C6.38255 4.28889 6.09219 4.16667 5.75252 4.16667C5.41285 4.16667 5.12249 4.28889 4.88144 4.53333C4.64038 4.77778 4.51986 5.07222 4.51986 5.41667C4.51986 5.76111 4.64038 6.05556 4.88144 6.3C5.12249 6.54444 5.41285 6.66667 5.75252 6.66667ZM16.0905 2.93333L17.241 4.1L4.45411 17.0667L3.30363 15.9L16.0905 2.93333Z" fill="#4B5563" />
  </svg>
);

const ICON_UNPAID = (
  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.9791 2.71817L18.8189 16.4682C18.9285 16.6571 18.9531 16.8626 18.8928 17.0848C18.8326 17.3071 18.7038 17.4793 18.5066 17.6015C18.3861 17.6793 18.2491 17.7182 18.0957 17.7182H2.44908C2.21898 17.7182 2.02449 17.6348 1.86562 17.4682C1.70674 17.3015 1.6273 17.1071 1.6273 16.8848C1.6273 16.7293 1.66017 16.5904 1.72592 16.4682L9.56567 2.71817C9.67524 2.51817 9.8396 2.38762 10.0587 2.32651C10.2779 2.2654 10.4861 2.2904 10.6833 2.40151C10.8148 2.47929 10.9134 2.58484 10.9791 2.71817ZM3.86254 16.0515H16.6823L10.2724 4.80151L3.86254 16.0515ZM9.45062 13.5515H11.0942V15.2182H9.45062V13.5515ZM9.45062 7.71817H11.0942V11.8848H9.45062V7.71817Z" fill="#EF4444" />
  </svg>
);

const KPI_ICONS = [ICON_REVENUE, ICON_TICKET, ICON_PLATFORM];

const FILTERS = ["전체", "결제완료", "미납", "미납만 보기"] as const;
type Filter = (typeof FILTERS)[number];

const COL_WIDTHS = ["229px", "149px", "167px", "157px", "127px", "258px"];

export function ProfitView({ data }: { data: AdminProfitData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("전체");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    let list = data.companies;
    if (filter === "결제완료") list = list.filter((c) => c.pay === "결제완료");
    else if (filter === "미납" || filter === "미납만 보기") list = list.filter((c) => c.pay === "미납");
    const q = search.trim();
    if (q) list = list.filter((c) => c.name.includes(q));
    return list;
  }, [data.companies, filter, search]);

  async function setRestrict(id: string, restricted: boolean) {
    const res = await fetch("/api/admin/profit/restrict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restricted }),
    });
    if (res.ok) startTransition(() => router.refresh());
  }

  async function confirmPayment(id: string) {
    if (confirmingId) return;
    setConfirmingId(id);
    try {
      const res = await fetch(`/api/admin/profit/${id}/confirm`, { method: "POST" });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "34.16px" }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.504px", lineHeight: "22.5px", color: "#1D1D1F" }}>수익 관리</h1>
        <p style={{ margin: "2.44px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
          업체별 구독 수납 현황 및 미납 권한 제어
        </p>
      </div>

      <div style={{ display: "flex", gap: "19.52px", marginBottom: "29.28px" }}>
        {data.kpis.map((k, i) => (
          <div
            key={k.label}
            style={{
              width: "257.36px",
              flexShrink: 0,
              padding: "20.52px",
              borderRadius: "9.76px",
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ marginBottom: "14.64px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "9.76px",
                  background: "#F3F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {KPI_ICONS[i]}
              </div>
            </div>
            <div style={{ fontSize: "24.4px", fontWeight: 700, letterSpacing: "-0.366px", lineHeight: "34.16px", color: "#111827" }}>
              {k.value}
            </div>
            <div style={{ marginTop: "4.88px", fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#9CA3AF" }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginBottom: "29.28px",
          padding: "25.4px",
          borderRadius: "14.64px",
          background: "#FFFFFF",
          border: "1px solid rgba(210,210,215,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "19.52px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.364px", lineHeight: "16.25px", color: "#1D1D1F" }}>
            월별 수익 추이 (만원)
          </span>
          <span
            style={{
              padding: "4.88px 12.2px",
              borderRadius: "9.76px",
              background: "rgba(30,58,95,0.1)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "-0.2928px",
              lineHeight: "21px",
              color: "#1E3A5F",
            }}
          >
            월간
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: "19.52px", padding: "0 9.76px", height: "234px" }}>
          {data.bars.map((b) => (
            <div key={b.month} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "7.32px" }}>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.4)" }}>
                {b.label}
              </span>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "9.76px 9.76px 0 0",
                  overflow: "hidden",
                }}
              >
                <div style={{ height: `${b.platform}px`, background: "rgba(30,58,95,0.7)" }} />
                <div style={{ height: `${b.license}px`, background: "rgba(30,58,95,0.2)" }} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.4)" }}>
                {b.month}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "19.52px", paddingTop: "14.64px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "7.32px" }}>
            <span style={{ width: "15px", height: "15px", borderRadius: "4.88px", background: "rgba(30,58,95,0.7)" }} />
            <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.4)" }}>플랫폼 수익</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "7.32px" }}>
            <span style={{ width: "15px", height: "15px", borderRadius: "4.88px", background: "rgba(30,58,95,0.2)" }} />
            <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.4)" }}>이용권 수익</span>
          </span>
        </div>
      </div>

      <div
        style={{
          marginBottom: "19.52px",
          padding: "20.52px",
          borderRadius: "14.64px",
          background: "#FFFFFF",
          border: "1px solid rgba(210,210,215,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14.64px" }}>
          <div style={{ position: "relative", flex: "1 1 0", minWidth: 0 }}>
            <span style={{ position: "absolute", left: "15.64px", top: "50%", transform: "translateY(-50%)", display: "flex" }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.6777 10.7927L14.7938 13.9519L13.7599 15L10.6439 11.8409C10.0712 12.3034 9.44509 12.6577 8.76559 12.9038C8.04726 13.1596 7.30951 13.2876 6.55235 13.2876C5.36807 13.2876 4.26631 12.9874 3.24705 12.3871C2.25692 11.7966 1.47549 10.9994 0.902768 9.99558C0.300923 8.96222 0 7.84521 0 6.64454C0 5.44388 0.300923 4.32686 0.902768 3.2935C1.47549 2.28967 2.25692 1.49742 3.24705 0.916775C4.26631 0.306599 5.36807 0.00151252 6.55235 0.00151252C7.73663 0.00151252 8.83839 0.306599 9.85765 0.916775C10.8478 1.49742 11.6341 2.28967 12.2165 3.2935C12.8086 4.32686 13.1047 5.44388 13.1047 6.64454C13.1047 7.41218 12.9785 8.16014 12.7261 8.88841C12.4834 9.57732 12.134 10.2121 11.6777 10.7927ZM10.2071 10.2465C10.6633 9.77415 11.0177 9.23286 11.27 8.62269C11.5224 7.99283 11.6486 7.33345 11.6486 6.64454C11.6486 5.7096 11.4156 4.83862 10.9497 4.03162C10.5032 3.25414 9.89648 2.63904 9.12961 2.18633C8.33362 1.71394 7.47453 1.47774 6.55235 1.47774C5.63017 1.47774 4.77108 1.71394 3.97509 2.18633C3.20822 2.63904 2.60153 3.25414 2.155 4.03162C1.68905 4.83862 1.45608 5.7096 1.45608 6.64454C1.45608 7.57949 1.68905 8.45046 2.155 9.25747C2.60153 10.0349 3.20822 10.65 3.97509 11.1028C4.77108 11.5751 5.63017 11.8113 6.55235 11.8113C7.23185 11.8113 7.88223 11.6834 8.50349 11.4275C9.10534 11.1716 9.63923 10.8124 10.1052 10.3499L10.2071 10.2465Z" fill="#1D1D1F" fillOpacity="0.3" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="업체명 검색"
              style={{
                width: "100%",
                height: "49px",
                padding: "13.19px 15.64px 13.19px 44.92px",
                borderRadius: "14.64px",
                background: "#FFFFFF",
                border: "1px solid rgba(210,210,215,0.3)",
                outline: "none",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: "#1D1D1F",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "9.76px" }}>
            {FILTERS.map((f) => {
              const active = filter === f;
              const isUnpaidOnly = f === "미납만 보기";
              let bg = "#FFFFFF";
              let color = "rgba(29,29,31,0.5)";
              let border = "1px solid rgba(210,210,215,0.3)";
              if (active && f === "전체") {
                bg = "#1E3A5F";
                color = "#FFFFFF";
                border = "1px solid #1E3A5F";
              } else if (active) {
                bg = "#1E3A5F";
                color = "#FFFFFF";
                border = "1px solid #1E3A5F";
              }
              if (isUnpaidOnly && !active) {
                color = "#EF4444";
                border = "1px solid #FECACA";
              }
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    height: "49px",
                    padding: "0 15.64px",
                    borderRadius: "9999px",
                    background: bg,
                    border,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "-0.2928px",
                    lineHeight: "21px",
                    color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ borderRadius: "14.64px", background: "#FFFFFF", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17.08px 24.4px 18.08px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.364px", lineHeight: "16.25px", color: "#1D1D1F" }}>
            업체별 구독 수납 현황
          </span>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.25px", color: "rgba(29,29,31,0.4)" }}>
            전체 미납 목록
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["업체명", "플랜", "월 이용료", "5월 상태", "권한", ""].map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "14.64px 19.52px",
                    fontSize: "14.64px",
                    fontWeight: 600,
                    letterSpacing: "-0.2196px",
                    lineHeight: "19.52px",
                    color: "#6B7280",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c, idx) => (
              <tr key={c.name} style={{ borderTop: idx === 0 ? "none" : "1px solid #F3F4F6" }}>
                <td style={{ padding: "14.64px 19.52px", fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827" }}>
                  {c.name}
                </td>
                <td style={{ padding: "14.64px 19.52px", fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#374151" }}>
                  {c.plan}
                </td>
                <td style={{ padding: "14.64px 19.52px", fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827" }}>
                  {c.fee}
                </td>
                <td style={{ padding: "14.64px 19.52px" }}>
                  <Badge state={c.pay} />
                </td>
                <td style={{ padding: "14.64px 19.52px" }}>
                  <PermBadge state={c.perm} />
                </td>
                <td style={{ padding: "14.64px 19.52px" }}>
                  <div style={{ display: "flex", gap: "4.88px" }}>
                    {c.pay === "미납" && <ActionButton label="결제 확인" bg="#374151" color="#FFFFFF" onClick={() => confirmPayment(c.id)} />}
                    {c.perm === "제한" ? (
                      <ActionButton label="권한 해제" bg="#E5E7EB" color="#374151" onClick={() => setRestrict(c.id, false)} />
                    ) : (
                      <ActionButton label="권한 제한" bg="#DC2626" color="#FFFFFF" onClick={() => setRestrict(c.id, true)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ state }: { state: PayState }) {
  const unpaid = state === "미납";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 10.76px",
        borderRadius: "9999px",
        height: "18px",
        background: unpaid ? "#FEF2F2" : "#F3F4F6",
        border: `1px solid ${unpaid ? "#FECACA" : "#E5E7EB"}`,
        fontSize: "10px",
        fontWeight: 400,
        letterSpacing: "-0.15px",
        lineHeight: "18px",
        color: unpaid ? "#EF4444" : "#4B5563",
      }}
    >
      {state}
    </span>
  );
}

function PermBadge({ state }: { state: PermState }) {
  const restricted = state === "제한";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 10.76px",
        borderRadius: "9999px",
        height: "18px",
        background: restricted ? "#FEF2F2" : "#F3F4F6",
        border: `1px solid ${restricted ? "#FECACA" : "#E5E7EB"}`,
        fontSize: "10px",
        fontWeight: 400,
        letterSpacing: "-0.15px",
        lineHeight: "18px",
        color: restricted ? "#DC2626" : "#4B5563",
      }}
    >
      {state}
    </span>
  );
}

function ActionButton({ label, bg, color, onClick }: { label: string; bg: string; color: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "4.88px 9.76px",
        borderRadius: "4.88px",
        background: bg,
        border: "none",
        cursor: "pointer",
        fontSize: "10px",
        fontWeight: 400,
        letterSpacing: "-0.24px",
        lineHeight: "18px",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
