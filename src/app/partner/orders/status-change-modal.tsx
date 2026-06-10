"use client";

import type { OrderRow, OrderStatus } from "./orders-data";

const INK = "#1D1D1F";
const NAVY = "#1E3A5F";

export function StatusChangeModal({
  order,
  next,
  onClose,
  onConfirm,
}: {
  order: OrderRow;
  next: OrderStatus;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "468px", borderRadius: "19.52px", background: "#fff", padding: "29.28px" }}
      >
        <div className="flex" style={{ gap: "14.64px", paddingBottom: "19.52px" }}>
          <span className="flex items-center justify-center shrink-0" style={{ width: "44px", height: "44px", borderRadius: "9.76px", background: "rgba(30,58,95,0.1)" }}>

            <img src="/icons/ord-status-change.svg" alt="" width={16} height={16} aria-hidden="true" />
          </span>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK, margin: 0 }}>상태 변경</p>
            <p style={{ margin: "4.88px 0 0", fontSize: "12px", letterSpacing: "-0.18px", lineHeight: "21.6px" }}>
              <span style={{ fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>{order.orderNo} 주문을 </span>
              <span style={{ fontWeight: 700, color: NAVY }}>{next}</span>
              <span style={{ fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>(으)로 변경하시겠습니까?</span>
            </p>
          </div>
        </div>

        <div className="flex" style={{ gap: "14.64px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ width: "199px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "13.2px 0", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ flex: 1, borderRadius: "14.64px", border: "none", background: NAVY, padding: "12.2px 0", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff", cursor: "pointer" }}
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
}
