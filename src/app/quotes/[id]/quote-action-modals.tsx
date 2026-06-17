"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAVY = "#1E3A5F";
const TEXT = "#1D1D1F";

function Overlay({ onClose, width, children }: { onClose: () => void; width: string; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width, maxWidth: "100%", maxHeight: "calc(100vh - 32px)", borderRadius: "19.52px", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", padding: "29.28px" }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose, showClose = true }: { title: string; onClose: () => void; showClose?: boolean }) {
  return (
    <div className="flex items-center justify-between" style={{ flexShrink: 0, marginBottom: "24.4px" }}>
      <h2 style={{ fontSize: "17px", fontWeight: 700, lineHeight: "21.25px", letterSpacing: "-0.476px", color: TEXT, margin: 0 }}>{title}</h2>
      {showClose && (
        <button type="button" aria-label="닫기" onClick={onClose}
          style={{ width: "39px", height: "39px", borderRadius: "9.76px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
          <XIcon />
        </button>
      )}
    </div>
  );
}

const editLabel: React.CSSProperties = { fontSize: "12px", fontWeight: 600, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", display: "block", marginBottom: "7.32px" };
const editInput: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff",
  padding: "13.19px 20.52px", fontSize: "14px", fontWeight: 400, letterSpacing: "-0.293px", color: TEXT, outline: "none",
};

export function EditNoticeModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("수지 보강 프로젝트 발전기 및 베어링 구매");
  const [budget, setBudget] = useState("15000000");
  const [dueDate, setDueDate] = useState("");
  const [delivery, setDelivery] = useState("상차도");

  return (
    <Overlay onClose={onClose} width="625px">
      <ModalHeader title="공고 수정" onClose={onClose} showClose={false} />
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "19.52px" }}>
        <div>
          <label style={editLabel}>공고명</label>
          <input className="placeholder:text-[#9CA3AF] placeholder:font-medium" style={editInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공고명을 입력하세요" />
        </div>
        <div>
          <label style={editLabel}>예산 (원)</label>
          <input className="placeholder:text-[#9CA3AF] placeholder:font-medium" inputMode="numeric" style={editInput} value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ""))} placeholder="예: 12,000,000" />
        </div>
        <div>
          <label style={editLabel}>납기 기한</label>
          <ModalDateField value={dueDate} onChange={setDueDate} />
        </div>
        <div>
          <label style={editLabel}>인도 조건</label>
          <input className="placeholder:text-[#9CA3AF] placeholder:font-medium" style={editInput} value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="예: 상차도, 하차도" />
        </div>
        <div className="flex items-center" style={{ gap: "14.64px", marginTop: "9.76px" }}>
          <button type="button" onClick={onClose} style={outlineBtn()}>취소</button>
          <button type="button" onClick={onClose} style={primaryBtn()}>저장</button>
        </div>
      </div>
    </Overlay>
  );
}

const PREVIEW_ROWS: Array<[string, React.ReactNode]> = [
  ["업체명", <span key="v" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: TEXT }}>기계공업(주)</span>],
  ["연락처", <span key="v" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)" }}>031-123-4567</span>],
  ["제안 금액", <span key="v" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.24px", lineHeight: "28.8px", color: TEXT }}>14,800,000원</span>],
  ["규격 요약", <span key="v" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)", textAlign: "right" }}>발전기 100kW 2대, 베어링 500개, 설치 포함</span>],
  ["상태", <span key="v" style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", background: "rgba(29,29,31,0.05)", border: "1px solid rgba(210,210,215,0.2)", padding: "3.44px 10.76px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.6)" }}>접수</span>],
  ["제출일", <span key="v" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)" }}>2026-05-09</span>],
];

function downloadQuote() {
  const content = [
    "견적서",
    "업체명: 기계공업(주)",
    "연락처: 031-123-4567",
    "제안 금액: 14,800,000원",
    "규격 요약: 발전기 100kW 2대, 베어링 500개, 설치 포함",
    "상태: 접수",
    "제출일: 2026-05-09",
    "",
    "공고 정보",
    "수지 보강 프로젝트 발전기 및 베어링 구매",
    "요청 기관: 경기도 화성시 화폐과",
    "예산 15,000,000원 · 마감 2026. 06. 20",
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "견적서_기계공업.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function QuotePreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClose={onClose} width="547px">
      <ModalHeader title="견적서 미리보기" onClose={onClose} />
      <div style={{ overflowY: "auto" }}>
        <div style={{ borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", padding: "20.52px" }}>
          {PREVIEW_ROWS.map(([label, value], i) => (
            <div key={label} className="flex items-start justify-between" style={{ gap: "16px", padding: i === 0 ? "0" : "12.2px 0 0" }}>
              <span style={{ flexShrink: 0, fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.5)" }}>{label}</span>
              <span style={{ textAlign: "right" }}>{value}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(210,210,215,0.15)", marginTop: "12.2px", paddingTop: "15.64px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: "0 0 9.76px" }}>공고 정보</p>
            <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", color: TEXT, margin: "0 0 7.32px" }}>수지 보강 프로젝트 발전기 및 베어링 구매</p>
            <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.6)", margin: "0 0 7.32px" }}>요청 기관: 경기도 화성시 화폐과</p>
            <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.6)", margin: 0 }}>예산 15,000,000원 · 마감 2026. 06. 20</p>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: "14.64px", marginTop: "24.4px" }}>
          <button type="button" onClick={onClose} style={outlineBtn()}>닫기</button>
          <button type="button" onClick={downloadQuote} style={{ ...primaryBtn(), display: "flex", alignItems: "center", justifyContent: "center", gap: "7.32px" }}>
            <DownloadIcon /><span>견적서 다운로드</span>
          </button>
        </div>
      </div>
    </Overlay>
  );
}

const STATUS_OPTIONS = [
  { key: "접수", desc: "새 접수 상태" },
  { key: "검토중", desc: "내부 검토 진행" },
  { key: "선정", desc: "거래 업체로 선정" },
  { key: "탈락", desc: "제안 불채택" },
];

const STATUS_DB: Record<string, string> = {
  "접수": "SUBMITTED", "검토중": "UNDER_REVIEW", "선정": "AWARDED", "탈락": "REJECTED",
};

export function ProposalStatusModal({ onClose, quoteId, responseId, company, totalAmount, current = "접수" }: { onClose: () => void; quoteId: string; responseId: string; company: string; totalAmount: string; current?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(current);
  const [saving, setSaving] = useState(false);
  const changed = selected !== current;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: STATUS_DB[selected] }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; alert(d.error ?? "오류"); return; }
      onClose();
      router.refresh();
    } finally { setSaving(false); }
  }

  return (
    <Overlay onClose={onClose} width="547px">
      <ModalHeader title="제안서 상태 변경" onClose={onClose} />
      <div style={{ overflowY: "auto" }}>
        <div style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", padding: "15.64px" }}>
          <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: 0 }}>업체명</p>
          <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", color: TEXT, margin: "2.44px 0 0" }}>{company}</p>
          <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)", margin: "2.44px 0 0" }}>{totalAmount}</p>
        </div>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", margin: "19.52px 0 9.76px" }}>변경할 상태를 선택하세요</p>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "9.76px" }}>
          {STATUS_OPTIONS.map((o) => {
            const on = selected === o.key;
            const TH = ({
              "접수": { bg: "rgba(29,29,31,0.05)", bd: "rgba(210,210,215,0.2)", tc: TEXT, to: 0.6, dco: 0.22 },
              "검토중": { bg: "#FFFBEB", bd: "#FDE68A", tc: "#B45309", to: 1, dco: 0.36 },
              "선정": { bg: "#ECFDF5", bd: "#A7F3D0", tc: "#047857", to: 1, dco: 0.36 },
              "탈락": { bg: "#FEF2F2", bd: "#FECACA", tc: "#EF4444", to: 1, dco: 0.36 },
            } as Record<string, { bg: string; bd: string; tc: string; to: number; dco: number }>)[o.key];
            return (
              <button key={o.key} type="button" onClick={() => setSelected(o.key)}
                style={{ textAlign: "left", borderRadius: "14.64px", border: on ? `2px solid ${TH.bd}` : "1px solid rgba(210,210,215,0.2)", background: on ? TH.bg : "#fff", cursor: "pointer", padding: on ? "16.64px 21.52px" : "15.64px 20.52px" }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", color: on ? TH.tc : TEXT, opacity: on ? TH.to : 1 }}>{o.key}</span>
                <span style={{ display: "block", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", color: on ? TH.tc : TEXT, opacity: on ? TH.dco : 0.36, marginTop: "2.44px" }}>{o.desc}</span>
              </button>
            );
          })}
        </div>
        {selected === "선정" && (
          <div className="flex items-center" style={{ gap: "4.88px", marginTop: "24.4px", borderRadius: "14.64px", background: "#FFFBEB", border: "1px solid #FEF3C7", padding: "15.64px" }}>
            <span className="flex items-center justify-center" style={{ width: "12px", height: "12px", flexShrink: 0 }}>
              <WarnTriIcon size={12} color="#B45309" />
            </span>
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#B45309" }}>선정 확정 시 다른 업체는 자동 탈락 처리됩니다.</span>
          </div>
        )}
        <div className="flex items-center" style={{ gap: "14.64px", marginTop: selected === "선정" ? "19.52px" : "24.4px" }}>
          <button type="button" onClick={onClose} style={outlineBtn()}>취소</button>
          <button type="button" onClick={handleSave} disabled={!changed || saving}
            style={{ ...primaryBtn(), background: changed && !saving ? NAVY : "rgba(30,58,95,0.4)", color: changed && !saving ? "#fff" : "rgba(255,255,255,0.16)", cursor: changed && !saving ? "pointer" : "default" }}>
            {saving ? "저장 중..." : "상태 저장"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

export function DeleteNoticeModal({ onClose, quoteId, quoteTitle }: { onClose: () => void; quoteId: string; quoteTitle: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json() as { error?: string }; alert(d.error ?? "삭제 중 오류"); return; }
      onClose();
      router.push("/quotes");
      router.refresh();
    } finally { setDeleting(false); }
  }

  return (
    <Overlay onClose={onClose} width="547px">
      <div className="flex justify-center" style={{ paddingBottom: "19.52px" }}>
        <span className="flex items-center justify-center" style={{ width: "59px", height: "59px", borderRadius: "9999px", background: "#FEF2F2", flexShrink: 0 }}>
          <WarnTriIcon size={20} color="#EF4444" />
        </span>
      </div>
      <p style={{ textAlign: "center", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.476px", lineHeight: "21.25px", color: TEXT, margin: "0 0 9.76px" }}>공고 삭제</p>
      <div style={{ paddingBottom: "29.28px" }}>
        <p style={{ textAlign: "center", margin: 0, lineHeight: "25.2px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", color: TEXT }}>&quot;{quoteTitle}&quot;</span>
          <span style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", color: "rgba(29,29,31,0.6)" }}> 공고를 삭제하시겠습니까?</span>
        </p>
        <p style={{ textAlign: "center", margin: 0, fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "rgba(29,29,31,0.6)" }}>삭제 후 복구가 불가능합니다.</p>
      </div>
      <div className="flex items-center" style={{ gap: "14.64px" }}>
        <button type="button" onClick={onClose} style={outlineBtn()}>취소</button>
        <button type="button" onClick={handleDelete} disabled={deleting} style={{ ...primaryBtn(), background: "#EF4444", cursor: deleting ? "default" : "pointer" }}>
          {deleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </Overlay>
  );
}

function outlineBtn(): React.CSSProperties {
  return { flex: 1, borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", cursor: "pointer", padding: "13.2px 0", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", color: "rgba(29,29,31,0.6)" };
}
function primaryBtn(): React.CSSProperties {
  return { flex: 1, borderRadius: "14.64px", border: "none", background: NAVY, cursor: "pointer", padding: "12.2px 0", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.293px", color: "#fff" };
}

function ModalDateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  let display = "";
  if (value) { const [y, mo, da] = value.split("-"); display = `${y}/${mo}/${da}`; }
  return (
    <div className="flex items-center" style={{ position: "relative", height: "53px", boxSizing: "border-box", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 20.52px" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: "14px", fontWeight: 400, letterSpacing: "-0.293px", color: display ? TEXT : "#9CA3AF" }}>{display || "연도/월/일"}</span>
      <CalendarIcon />
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
        onClick={(e) => { const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void }; if (typeof el.showPicker === "function") { try { el.showPicker(); } catch {  } } }}
        aria-label="납기 기한 선택"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, border: "none", margin: 0, padding: 0, cursor: "pointer" }} />
    </div>
  );
}

function WarnTriIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill={color} />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M5.91574 4.66044L10.5107 0.000100324L11.8315 1.33971L7.23655 6.00005L11.8315 10.6604L10.5107 12L5.91574 7.33966L1.32081 12L0 10.6604L4.59493 6.00005L0 1.33971L1.32081 0.000100324L5.91574 4.66044Z" fill="#1D1D1F" fillOpacity="0.4" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width={16} height={15} viewBox="0 0 16 15" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#mcal)">
        <path d="M13 1.875H12.375V0.625H11.125V1.875H4.875V0.625H3.625V1.875H3C2.3125 1.875 1.75 2.4375 1.75 3.125V13.125C1.75 13.8125 2.3125 14.375 3 14.375H13C13.6875 14.375 14.25 13.8125 14.25 13.125V3.125C14.25 2.4375 13.6875 1.875 13 1.875ZM13 13.125H3V5H13V13.125Z" fill="#1D1D1F" />
      </g>
      <defs><clipPath id="mcal"><rect width="16" height="15" fill="white" /></clipPath></defs>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M6.5 0.5V8.5M6.5 8.5L3.5 5.5M6.5 8.5L9.5 5.5M1 9.5V11.5C1 12.0523 1.44772 12.5 2 12.5H11C11.5523 12.5 12 12.0523 12 11.5V9.5" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
