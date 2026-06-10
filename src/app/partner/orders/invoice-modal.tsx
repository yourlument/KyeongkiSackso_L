"use client";

import { useState } from "react";
import type { OrderRow } from "./orders-data";

const INK = "#1D1D1F";

const COURIERS = ["CJ대한통운", "롯데택배", "한진택배", "우체국택배", "로젠택배"];

export function InvoiceModal({
  order,
  onClose,
  onSubmit,
}: {
  order: OrderRow;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [courier, setCourier] = useState("");
  const [invoice, setInvoice] = useState("");
  const canSubmit = courier !== "" && invoice.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "547px", borderRadius: "19.52px", background: "#fff", padding: "29.28px" }}
      >

        <div style={{ paddingBottom: "4.88px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: INK }}>
            송장 번호 등록
          </span>
        </div>

        <div style={{ paddingBottom: "24.4px" }}>
          <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)" }}>
            배송 상태로 변경하기 위해 택배사와 송장 번호를 입력해주세요.
          </span>
        </div>

        <div>
          <div style={{ paddingBottom: "7.32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>택배사</span>
          </div>
          <div className="relative">
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full appearance-none"
              style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "13.2px 15.64px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19px", color: INK, outline: "none", cursor: "pointer" }}
            >
              <option value="" disabled>택배사를 선택하세요</option>
              {COURIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <img src="/icons/srch-chevron.svg" alt="" width={8} height={4} aria-hidden="true" className="pointer-events-none absolute" style={{ right: "15.64px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        <div style={{ paddingTop: "19.52px" }}>
          <div style={{ paddingBottom: "7.32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>송장 번호</span>
          </div>
          <input
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="송장 번호를 입력하세요"
            className="w-full placeholder:text-[#9CA3AF] placeholder:font-medium"
            style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "13.1875px 15.64px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: INK, outline: "none" }}
          />
        </div>

        <div className="flex" style={{ gap: "14.64px", paddingTop: "29.28px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ width: "238px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "13.2px 0", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            style={{ flex: 1, borderRadius: "14.64px", border: "none", background: "#1E3A5F", opacity: canSubmit ? 1 : 0.4, padding: "12.2px 0", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: canSubmit ? "#fff" : "rgba(255,255,255,0.16)", cursor: canSubmit ? "pointer" : "default" }}
          >
            등록
          </button>
        </div>

        <span className="sr-only">{order.orderNo}</span>
      </div>
    </div>
  );
}
