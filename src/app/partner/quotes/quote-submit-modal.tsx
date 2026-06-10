"use client";

import { useState } from "react";
import type { AnnouncementRow, ProductRequest } from "./quotes-data";
import { CloseIcon, ClipIcon, CalendarIcon } from "./quotes-icons";

const NAVY = "#1E3A5F";
const LABEL = "#6B7280";

type SubmitTarget =
  | { kind: "announcement"; row: AnnouncementRow }
  | { kind: "product"; row: ProductRequest };

export function QuoteSubmitModal({ target, onClose }: { target: SubmitTarget; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [spec, setSpec] = useState("");
  const [content, setContent] = useState("");
  const canSubmit = amount.trim() !== "" && spec.trim() !== "";

  const heading = target.kind === "product" ? "견적 제출 (상품)" : "견적 제출 (공고)";
  const targetTitle = target.kind === "product" ? target.row.product : target.row.title;
  const targetMeta =
    target.kind === "product"
      ? `${target.row.org} · 마감: ${target.row.deadline}`
      : `${target.row.org} · 마감: ${target.row.deadline}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }} onClick={onClose}>
      <div
        className="flex flex-col"
        style={{ width: "624px", maxHeight: "calc(100vh - 39.04px)", borderRadius: "14.64px", background: "#fff", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: "19.52px", fontWeight: 700, letterSpacing: "-0.5466px", lineHeight: "29.28px", color: "#111827" }}>{heading}</span>
          <button type="button" onClick={onClose} aria-label="닫기" className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", border: "none", background: "none", cursor: "pointer" }}>
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: "29.28px", overflowY: "auto" }}>

          <div style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", background: "rgba(29,29,31,0.02)", padding: "15.64px" }}>
            <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.4)", margin: "0 0 2.44px" }}>대상 공고</p>
            <p style={{ fontSize: "17.08px", fontWeight: 600, letterSpacing: "-0.2562px", lineHeight: "24.4px", color: "#1D1D1F", margin: 0 }}>{targetTitle}</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)", margin: "4.88px 0 0" }}>
              {targetMeta}
            </p>
          </div>

          <Field label="제안 금액 (원)" required>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
              inputMode="numeric"
              placeholder="제안할 총 금액을 숫자로 입력하세요"
              className="w-full placeholder:text-[#9CA3AF]"
              style={{ borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "13.18px 15.64px", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: "#1D1D1F", outline: "none" }}
            />
          </Field>

          <Field label="규격 요약" required>
            <textarea
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="주요 사양을 간략히 입력하세요"
              rows={3}
              className="w-full placeholder:text-[#9CA3AF]"
              style={{ borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "13.2px 15.64px", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: "#1D1D1F", outline: "none", resize: "none" }}
            />
          </Field>

          <Field label="납품 가능일">
            <div className="flex items-center justify-between" style={{ borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "13.2px 15.64px" }}>
              <span style={{ fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: "#1D1D1F" }}>-/-/-</span>
              <CalendarIcon />
            </div>
          </Field>

          <Field label="견적 내용">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="견적에 대한 부가 설명을 입력하세요"
              rows={3}
              className="w-full placeholder:text-[#9CA3AF]"
              style={{ borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "13.2px 15.64px", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: "#1D1D1F", outline: "none", resize: "none" }}
            />
          </Field>

          <Field label="견적서 첨부파일">
            <label className="flex items-center cursor-pointer" style={{ gap: "9.76px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "13.2px 15.64px" }}>
              <ClipIcon />
              <span style={{ fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2562px", lineHeight: "24.4px", color: "#6B7280" }}>PDF, 엑셀, 워드, 한글 파일 첨부</span>
              <input type="file" accept=".pdf,.xls,.xlsx,.doc,.docx,.hwp" className="hidden" />
            </label>
            <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", margin: "4.88px 0 0" }}>
              최대 10MB, PDF/엑셀/워드/한글 파일만 업로드 가능합니다.
            </p>
          </Field>

          <div className="flex items-center" style={{ gap: "14.64px", paddingTop: "19.52px" }}>
            <button type="button" onClick={onClose} style={{ width: "277px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "13.2px 0", cursor: "pointer", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: "#4B5563" }}>
              취소
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={onClose}
              style={{
                flex: 1,
                borderRadius: "9.76px",
                border: "none",
                padding: "12.2px 0",
                cursor: canSubmit ? "pointer" : "default",
                fontSize: "17.08px",
                fontWeight: 600,
                letterSpacing: "-0.2928px",
                lineHeight: "24.4px",
                background: canSubmit ? NAVY : "rgba(30,58,95,0.4)",
                color: canSubmit ? "#fff" : "rgba(255,255,255,0.16)",
              }}
            >
              견적 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: "19.52px" }}>
      <div style={{ paddingBottom: "7.32px" }}>
        <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: LABEL }}>{label} </span>
        {required && <span style={{ fontSize: "14.64px", fontWeight: 500, lineHeight: "26.35px", color: "#F87171" }}>*</span>}
      </div>
      {children}
    </div>
  );
}
