"use client";

import type { Proposal, ProposalStatusKind } from "./quotes-data";
import { CloseIcon } from "./quotes-icons";

const NAVY = "#1E3A5F";

const PILL: Record<ProposalStatusKind, { bg: string; border: string; color: string }> = {
  접수: { bg: "transparent", border: "#E5E7EB", color: "#6B7280" },
  검토중: { bg: "transparent", border: "#9CA3AF", color: "#374151" },
  탈락: { bg: "transparent", border: "#FECACA", color: "#EF4444" },
  선정: { bg: "rgba(30,58,95,0.05)", border: NAVY, color: NAVY },
};

export function ProposalDetailModal({ proposal, onClose, onChat }: { proposal: Proposal; onClose: () => void; onChat: () => void }) {
  const pill = PILL[proposal.statusKind];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", padding: "19.52px" }} onClick={onClose}>
      <div
        className="flex flex-col"
        style={{ width: "625px", maxHeight: "calc(100vh - 39.04px)", borderRadius: "19.52px", background: "#fff", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-start justify-between" style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <div>
            <p style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: "#1D1D1F", margin: 0 }}>제출 견적서 상세</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>공고 대응 제출 내역</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", border: "none", background: "none", cursor: "pointer" }}>
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: "29.28px", overflowY: "auto" }}>

          <div style={{ borderRadius: "14.64px", background: "rgba(29,29,31,0.02)", padding: "19.52px" }}>
            <div className="flex items-center justify-between" style={{ gap: "9.76px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F" }}>{proposal.title}</span>
              <span style={{ flexShrink: 0, borderRadius: "9999px", border: `1px solid ${pill.border}`, background: pill.bg, padding: "3.44px 10.76px", fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: pill.color }}>{proposal.statusKind}</span>
            </div>
            <div className="flex items-center" style={{ gap: "14.64px", marginTop: "9.76px" }}>
              <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>{proposal.org}</span>
              <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>마감: {proposal.deadline}</span>
            </div>
          </div>

          <Row label="제안 금액" first>
            <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F" }}>{proposal.amount}</span>
          </Row>
          <Row label="규격 요약">
            <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F" }}>{proposal.spec}</span>
          </Row>
          <Row label="제출일">
            <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F" }}>{proposal.submittedAt}</span>
          </Row>
          <Row label="첨부 견적서" divider>
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.3)" }}>{proposal.attachment}</span>
          </Row>

          <button type="button" onClick={onChat} className="inline-flex items-center justify-center w-full" style={{ gap: "7.32px", marginTop: "29.28px", borderRadius: "14.64px", background: NAVY, border: "none", padding: "12.2px 0", cursor: "pointer" }}>
            <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M5.61094 1.21289H7.74844C8.52506 1.21289 9.24469 1.4115 9.90731 1.80872C10.5486 2.1915 11.058 2.7115 11.4356 3.36872C11.8275 4.04039 12.0234 4.76803 12.0234 5.55164C12.0234 6.33525 11.8275 7.06289 11.4356 7.73456C11.058 8.39178 10.5486 8.91178 9.90731 9.29456C9.24469 9.68456 8.52506 9.87956 7.74844 9.87956V11.7754C6.86494 11.4215 6.156 11.1109 5.62162 10.8437C4.80225 10.4393 4.10756 10.0168 3.53756 9.57622C2.85356 9.049 2.32987 8.47484 1.9665 7.85372C1.54613 7.15317 1.33594 6.384 1.33594 5.54622C1.33594 4.76622 1.53187 4.04039 1.92375 3.36872C2.30138 2.7115 2.81081 2.1915 3.45206 1.80872C4.11469 1.41872 4.83431 1.22372 5.61094 1.22372V1.21289ZM6.67969 8.79622H7.74844C8.32556 8.80345 8.8635 8.659 9.36225 8.36289C9.84675 8.074 10.2315 7.684 10.5165 7.19289C10.8086 6.68734 10.9547 6.14025 10.9547 5.55164C10.9547 4.96303 10.8086 4.41595 10.5165 3.91039C10.2315 3.41928 9.84675 3.02928 9.36225 2.74039C8.8635 2.44428 8.32556 2.29622 7.74844 2.29622H5.61094C5.03381 2.29622 4.49588 2.44428 3.99713 2.74039C3.51262 3.02928 3.12788 3.41928 2.84288 3.91039C2.55075 4.41595 2.40469 4.96122 2.40469 5.54622C2.40469 6.19622 2.55431 6.78122 2.85356 7.30122C3.15281 7.82122 3.6195 8.31595 4.25363 8.78539C4.85925 9.22595 5.66794 9.67734 6.67969 10.1396V8.79622Z" fill="#fff" />
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff" }}>담당자와 대화하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, divider, first }: { label: string; children: React.ReactNode; divider?: boolean; first?: boolean }) {
  return (
    <div className="flex" style={{ gap: "9.76px", marginTop: first ? "19.52px" : "14.64px", paddingTop: divider ? "15.64px" : 0, borderTop: divider ? "1px solid rgba(210,210,215,0.1)" : "none" }}>
      <span style={{ width: "117px", flexShrink: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", paddingTop: "2.44px" }}>{label}</span>
      <span style={{ minWidth: 0 }}>{children}</span>
    </div>
  );
}
