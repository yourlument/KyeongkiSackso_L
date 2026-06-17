"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATS,
  ORDER_FILTERS,
  STATUS_STYLE,
  NEXT_ACTION,
  type OrderRow,
  type OrderStatus,
  type OrderFilter,
} from "./orders-data";
import { InvoiceModal } from "./invoice-modal";
import { StatusChangeModal } from "./status-change-modal";

const INK = "#1D1D1F";

const GRID = "162px 261px 115px 150px 224px 129px 84px";

export function OrdersListView({
  rows: allRows,
  stats,
}: {
  rows: OrderRow[];
  stats: { total: number; paid: number; shipping: number; delivered: number };
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderFilter>("전체");
  const [invoiceFor, setInvoiceFor] = useState<OrderRow | null>(null);
  const [confirmFor, setConfirmFor] = useState<{ order: OrderRow; next: OrderStatus } | null>(null);

  const statValue: Record<string, number> = { total: stats.total, paid: stats.paid, shipping: stats.shipping, delivered: stats.delivered };

  const rows = useMemo(
    () => allRows.filter((o) => (filter === "전체" ? true : o.status === filter)),
    [filter, allRows],
  );

  function advance(order: OrderRow) {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    if (order.status === "결제완료") {
      setInvoiceFor(order);
      return;
    }
    setConfirmFor({ order, next: action.next });
  }

  async function patchStatus(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/partner/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <div style={{ paddingBottom: "34.16px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.56px", lineHeight: "25px", color: INK, margin: 0 }}>
          주문 / 배송 관리
        </h1>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>
          주문 확인, 송장 등록, 배송 상태 업데이트
        </p>
      </div>

      <div className="flex" style={{ gap: "19.52px", paddingBottom: "34.16px" }}>
        {ORDER_STATS.map((s) => (
          <div key={s.key} style={{ width: "267px", borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", padding: "20.52px" }}>
            <div className="flex items-start justify-between" style={{ paddingBottom: "14.64px" }}>
              <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{s.label}</span>
              <span className="flex items-center justify-center" style={{ width: "34px", height: "34px", borderRadius: "9.76px", background: s.tint ? "rgba(30,58,95,0.12)" : "transparent" }}>
                <img src={s.icon} alt="" width={18} height={24} aria-hidden="true" />
              </span>
            </div>
            <div className="flex items-baseline">
              <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.33px", lineHeight: "39.6px", color: INK }}>{statValue[s.key] ?? 0}</span>
              <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)" }}>건</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center" style={{ gap: "9.76px", paddingBottom: "24.4px" }}>
        {ORDER_FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{ borderRadius: "9999px", padding: "8.32px 18.08px", fontSize: "12px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "21px", cursor: "pointer", background: active ? "#1E3A5F" : "#fff", border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.2)", color: active ? "#fff" : "rgba(29,29,31,0.5)" }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
        <div className="grid" style={{ gridTemplateColumns: GRID, background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          {["주문번호", "품목", "구매자", "금액", "상태", "주문일", "관리"].map((h) => (
            <div key={h} style={{ padding: "17.08px 19.52px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
            </div>
          ))}
        </div>

        {rows.map((r, i) => {
          const sStyle = STATUS_STYLE[r.status];
          const action = NEXT_ACTION[r.status];
          return (
            <div key={r.orderNo} className="grid" style={{ gridTemplateColumns: GRID, alignItems: "center", borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)" }}>
              <div style={{ padding: "17.08px 19.52px" }}>
                <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{r.orderNo}</span>
              </div>
              <div style={{ padding: "17.08px 19.52px" }}>
                <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, margin: 0 }}>{r.itemName}</p>
                <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>{r.qty}</p>
              </div>
              <div style={{ padding: "17.08px 19.52px" }}>
                <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: INK, margin: 0 }}>{r.buyerName}</p>
                <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{r.buyerOrg}</p>
              </div>
              <div style={{ padding: "17.08px 19.52px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{r.amount}</span>
              </div>
              <div style={{ padding: "17.08px 19.52px" }}>
                <div className="flex flex-col" style={{ gap: "7.32px", alignItems: "flex-start" }}>
                  <span style={{ display: "inline-flex", borderRadius: "9999px", padding: "5.88px 13.2px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", background: sStyle.bg, border: `1px solid ${sStyle.border}`, color: sStyle.color }}>
                    {r.status}
                  </span>
                  {action && (
                    <button
                      type="button"
                      onClick={() => advance(r)}
                      style={{ width: "185px", borderRadius: "14.64px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", padding: "5.88px 13.2px", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.240096px", lineHeight: "19.8px", color: "rgba(29,29,31,0.6)", cursor: "pointer", textAlign: "center" }}
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ padding: "17.08px 19.52px" }}>
                <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{r.orderDate}</span>
              </div>
              <div style={{ padding: "17.08px 19.52px" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/partner/orders/${r.orderNo}`)}
                  style={{ background: "none", border: "none", padding: 0, fontSize: "12px", fontWeight: 500, letterSpacing: "-0.240096px", lineHeight: "21.6px", color: "#1E3A5F", textDecoration: "underline", cursor: "pointer" }}
                >
                  상세
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {invoiceFor && (
        <InvoiceModal
          order={invoiceFor}
          onClose={() => setInvoiceFor(null)}
          onSubmit={async (courier, trackingNo) => {
            await patchStatus(invoiceFor.id, { status: "SHIPPING", courier, trackingNo });
            setInvoiceFor(null);
          }}
        />
      )}

      {confirmFor && (
        <StatusChangeModal
          order={confirmFor.order}
          next={confirmFor.next}
          onClose={() => setConfirmFor(null)}
          onConfirm={async () => {
            await patchStatus(confirmFor.order.id, { status: "DELIVERED" });
            setConfirmFor(null);
          }}
        />
      )}
    </>
  );
}
