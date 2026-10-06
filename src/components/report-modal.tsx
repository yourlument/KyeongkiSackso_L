"use client";

import { useState } from "react";

export type ReportKind = "문의" | "신고";

const NAVY = "#1E3A5F";
const RED = "#EF4444";

function CloseIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M5.91574 4.66044L10.5107 0.000100324L11.8315 1.33971L7.23655 6.00005L11.8315 10.6604L10.5107 12L5.91574 7.33966L1.32081 12L0 10.6604L4.59493 6.00005L0 1.33971L1.32081 0.000100324L5.91574 4.66044Z" fill="#1D1D1F" fillOpacity={0.4} />
    </svg>
  );
}
function InquiryIcon({ color }: { color: string }) {
  return (
    <svg width={13} height={13} viewBox="0 0 11 11" fill="none" aria-hidden>
      <path d="M5.42588 11C4.68796 11 3.9826 10.857 3.30979 10.571C2.66592 10.2923 2.09258 9.89818 1.58978 9.38852C1.08698 8.87887 0.69813 8.29771 0.423219 7.64505C0.141073 6.96306 0 6.24807 0 5.50008C0 4.75209 0.141073 4.0371 0.423219 3.35511C0.69813 2.70246 1.08698 2.1213 1.58978 1.61164C2.09258 1.10198 2.66592 0.707821 3.30979 0.429159C3.9826 0.143163 4.68796 0.000165585 5.42588 0.000165585C6.1638 0.000165585 6.86916 0.143163 7.54197 0.429159C8.18584 0.707821 8.75918 1.10198 9.26198 1.61164C9.76478 2.1213 10.1536 2.70246 10.4285 3.35511C10.7107 4.0371 10.8518 4.75209 10.8518 5.50008C10.8518 6.24807 10.7107 6.96306 10.4285 7.64505C10.1536 8.29771 9.76478 8.87887 9.26198 9.38852C8.75918 9.89818 8.18584 10.2923 7.54197 10.571C6.86916 10.857 6.1638 11 5.42588 11ZM5.42588 9.90002C6.21444 9.90002 6.94513 9.69835 7.61794 9.29503C8.26904 8.90636 8.78631 8.38204 9.16974 7.72205C9.56764 7.04006 9.76658 6.2994 9.76658 5.50008C9.76658 4.70076 9.56764 3.96011 9.16974 3.27812C8.78631 2.61813 8.26904 2.0938 7.61794 1.70514C6.94513 1.30181 6.21444 1.10015 5.42588 1.10015C4.63732 1.10015 3.90663 1.30181 3.23382 1.70514C2.58272 2.0938 2.06545 2.61813 1.68202 3.27812C1.28412 3.96011 1.08518 4.70076 1.08518 5.50008C1.08518 6.2994 1.28412 7.04006 1.68202 7.72205C2.06545 8.38204 2.58272 8.90636 3.23382 9.29503C3.90663 9.69835 4.63732 9.90002 5.42588 9.90002ZM4.88329 7.15006H5.96847V8.25004H4.88329V7.15006ZM5.96847 6.24807V6.60007H4.88329V5.77508C4.88329 5.62108 4.93574 5.49092 5.04064 5.38458C5.14554 5.27825 5.27396 5.22509 5.42588 5.22509C5.65015 5.22509 5.84186 5.14442 6.00102 4.98309C6.16018 4.82176 6.23976 4.62743 6.23976 4.4001C6.23976 4.17277 6.16018 3.97844 6.00102 3.81711C5.84186 3.65578 5.65015 3.57511 5.42588 3.57511C5.23055 3.57511 5.05873 3.63744 4.91042 3.76211C4.76211 3.88677 4.66626 4.04444 4.62285 4.2351L3.55938 4.0261C3.61725 3.73278 3.73662 3.46878 3.91749 3.23412C4.09835 2.99945 4.319 2.81429 4.57944 2.67863C4.83988 2.54296 5.12203 2.47513 5.42588 2.47513C5.77314 2.47513 6.09145 2.56129 6.38084 2.73362C6.67022 2.90596 6.89991 3.13878 7.06992 3.43211C7.23993 3.72544 7.32494 4.0481 7.32494 4.4001C7.32494 4.83276 7.19833 5.21775 6.94513 5.55508C6.69192 5.89241 6.36637 6.12341 5.96847 6.24807Z" fill={color} />
    </svg>
  );
}
function ReportTriIcon({ color }: { color: string }) {
  return (
    <svg width={13} height={12} viewBox="0 0 12 11" fill="none" aria-hidden>
      <path d="M6.4866 0.294271L11.9244 9.8276C12.0004 9.95857 12.0175 10.1011 11.9757 10.2552C11.9339 10.4092 11.8446 10.5286 11.7078 10.6134C11.6242 10.6673 11.5292 10.6943 11.4228 10.6943H0.57C0.4104 10.6943 0.2755 10.6365 0.1653 10.5209C0.0551 10.4054 0 10.2706 0 10.1165C0 10.0086 0.0228 9.91234 0.0684 9.8276L5.5062 0.294271C5.5822 0.155604 5.6962 0.0650859 5.8482 0.0227153C6.0002 -0.0196554 6.1446 -0.00232137 6.2814 0.0747152C6.3726 0.128642 6.441 0.201826 6.4866 0.294271ZM1.5504 9.53872H10.4424L5.9964 1.73872L1.5504 9.53872ZM5.4264 7.80538H6.5664V8.96094H5.4264V7.80538ZM5.4264 3.76094H6.5664V6.64983H5.4264V3.76094Z" fill={color} />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width={8} height={4} viewBox="0 0 8 4" fill="none" aria-hidden>
      <path d="M0 0L4 4L8 0H0Z" fill="black" />
    </svg>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>
      {children}
    </span>
  );
}

export function ReportModal({ kind, onKind, onClose }: { kind: ReportKind; onKind: (k: ReportKind) => void; onClose: () => void }) {
  const isReport = kind === "신고";
  const accent = isReport ? RED : NAVY;

  const CATS_Q = ["견적문의", "결제문의", "입점신청", "구독문의", "시스템오류", "기타"];
  const CATS_R = ["허위상품", "부정거래", "악성유저", "기타"];

  const [category, setCategory] = useState(CATS_Q[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactOrg, setContactOrg] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleKind = (k: ReportKind) => {
    onKind(k);
    setCategory(k === "신고" ? CATS_R[0] : CATS_Q[0]);
    setError("");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setError("제목과 내용을 입력하세요"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, category, title, content, contactName, contactOrg, contactPhone, contactEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? "오류가 발생했습니다");
      } else {
        setDone(true);
        setTimeout(onClose, 1200);
      }
    } catch { setError("네트워크 오류가 발생했습니다"); }
    finally { setSubmitting(false); }
  };

  const cats = isReport ? CATS_R : CATS_Q;
  const inputStyle: React.CSSProperties = { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#1D1D1F" };
  const boxStyle: React.CSSProperties = { height: "49px", display: "flex", alignItems: "center", padding: "0 15.64px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.5)", background: "#fff", boxSizing: "border-box" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "19.52px", background: "rgba(0,0,0,0.4)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "625px", maxHeight: "100%", overflowY: "auto", borderRadius: "19.52px", background: "#fff", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "19.52px 29.28px 20.52px" }}>
          <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.42px", lineHeight: "18.75px", color: "#1D1D1F" }}>신고 / 문의하기</span>
          <button type="button" onClick={onClose} aria-label="닫기" style={{ width: "39px", height: "39px", borderRadius: "9999px", border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: "29.28px", display: "flex", flexDirection: "column" }}>
          <div>
            <div style={{ paddingBottom: "9.76px" }}><FieldLabel>유형</FieldLabel></div>
            <div style={{ display: "flex", gap: "9.76px" }}>
              <button type="button" onClick={() => handleKind("문의")} style={{ flex: 1, height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4.88px", padding: "10.76px 1px", borderRadius: "14.64px", border: kind === "문의" ? `1px solid ${NAVY}` : "1px solid rgba(210,210,215,0.5)", background: kind === "문의" ? NAVY : "#fff", cursor: "pointer" }}>
                <InquiryIcon color={kind === "문의" ? "#fff" : "rgba(29,29,31,0.6)"} />
                <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: kind === "문의" ? "#fff" : "rgba(29,29,31,0.6)" }}>문의</span>
              </button>
              <button type="button" onClick={() => handleKind("신고")} style={{ flex: 1, height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4.88px", padding: "10.76px 1px", borderRadius: "14.64px", border: kind === "신고" ? `1px solid ${RED}` : "1px solid rgba(210,210,215,0.5)", background: kind === "신고" ? RED : "#fff", cursor: "pointer" }}>
                <ReportTriIcon color={kind === "신고" ? "#fff" : "rgba(29,29,31,0.6)"} />
                <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: kind === "신고" ? "#fff" : "rgba(29,29,31,0.6)" }}>신고</span>
              </button>
            </div>
          </div>

          <div style={{ paddingTop: "19.52px" }}>
            <div style={{ paddingBottom: "7.32px" }}><FieldLabel>카테고리</FieldLabel></div>
            <div style={{ position: "relative", height: "43px" }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", height: "100%", appearance: "none", WebkitAppearance: "none", paddingLeft: "15.64px", paddingRight: "40px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.5)", background: "#fff", boxSizing: "border-box", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", color: "#1D1D1F", cursor: "pointer", outline: "none" }}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span style={{ position: "absolute", right: "15.64px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevronIcon /></span>
            </div>
          </div>

          <div style={{ paddingTop: "19.52px" }}>
            <div style={{ paddingBottom: "7.32px" }}><FieldLabel>제목</FieldLabel></div>
            <div style={boxStyle}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="placeholder:text-[rgba(29,29,31,0.3)]" style={inputStyle} />
            </div>
          </div>

          <div style={{ paddingTop: "19.52px" }}>
            <div style={{ paddingBottom: "7.32px" }}><FieldLabel>내용</FieldLabel></div>
            <div style={{ height: "117px", padding: "13.2px 15.64px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.5)", background: "#fff", boxSizing: "border-box" }}>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="상세 내용을 입력하세요 (최대 500자)" maxLength={500} className="placeholder:text-[rgba(29,29,31,0.3)]" style={{ width: "100%", height: "100%", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#1D1D1F" }} />
            </div>
          </div>

          <div style={{ paddingTop: "19.52px", display: "flex", gap: "14.64px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ paddingBottom: "7.32px" }}><FieldLabel>이름</FieldLabel></div>
              <div style={boxStyle}><input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="이름" className="placeholder:text-[rgba(29,29,31,0.3)]" style={inputStyle} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ paddingBottom: "7.32px" }}><FieldLabel>소속기관/업체</FieldLabel></div>
              <div style={boxStyle}><input type="text" value={contactOrg} onChange={(e) => setContactOrg(e.target.value)} placeholder="소속 기관" className="placeholder:text-[rgba(29,29,31,0.3)]" style={inputStyle} /></div>
            </div>
          </div>

          <div style={{ paddingTop: "19.52px", display: "flex", gap: "14.64px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ paddingBottom: "7.32px" }}><FieldLabel>연락처</FieldLabel></div>
              <div style={boxStyle}><input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="010-0000-0000" className="placeholder:text-[rgba(29,29,31,0.3)]" style={inputStyle} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ paddingBottom: "7.32px" }}><FieldLabel>이메일</FieldLabel></div>
              <div style={boxStyle}><input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com" className="placeholder:text-[rgba(29,29,31,0.3)]" style={inputStyle} /></div>
            </div>
          </div>

          {error && <p style={{ paddingTop: "9.76px", fontSize: "12px", color: RED, margin: 0 }}>{error}</p>}

          <div style={{ paddingTop: "19.52px", display: "flex", gap: "14.64px", alignItems: "center" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: "49px", display: "flex", alignItems: "center", justifyContent: "center", padding: "13.2px 1px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.5)", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.6)" }}>
              취소
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting || done} style={{ flex: 1, height: "49px", display: "flex", alignItems: "center", justifyContent: "center", padding: "12.2px 0", borderRadius: "14.64px", border: "none", background: done ? "#059669" : accent, cursor: submitting || done ? "default" : "pointer", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff" }}>
              {done ? "접수 완료" : submitting ? "처리중..." : isReport ? "신고 접수" : "문의 접수"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
