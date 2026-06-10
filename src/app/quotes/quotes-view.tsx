"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "견적공고중" | "견적검토중" | "선정완료" | "마감";
type Quote = { id: string; title: string; items: string; org: string; status: Status; budget: number; proposals: number; deadline: string };

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const QUOTES: Quote[] = [
  { id: "q1", title: "수지 보강 프로젝트 발전기 및 베어링 구매", items: "발전기 100kW급, 베어링 6206-2RS", org: "경기도 화성시 화폐과", status: "견적공고중", budget: 15000000, proposals: 1, deadline: "2026-06-20" },
  { id: "q2", title: "2026년 화성시 도시개발 건자재 대규모 구매 (다수 업체 비교)", items: "레미콘 24-40-140, 아스콘 표준배합 15-40, 철근 D16 10m", org: "경기도 화성시 도시건설과", status: "견적검토중", budget: 35000000, proposals: 10, deadline: "2026-07-31" },
  { id: "q3", title: "2026년 2분기 도로보수 공사 자재 구매", items: "레미콘 24-40-140, 아스콘 표준배합 15-40", org: "경기도 화성시 도로과", status: "견적공고중", budget: 8000000, proposals: 3, deadline: "2026-06-15" },
  { id: "q4", title: "2026년 화성시 도로유지보수 포장 자재 구매 (물품 견적)", items: "레미콘 24-40-140(중기), 아스콘 표준배합 15-40", org: "경기도 화성시 도로관리과", status: "선정완료", budget: 12000000, proposals: 4, deadline: "2026-03-20" },
  { id: "q5", title: "2026년 1분기 교통안전용품 구매 (물품 견적)", items: "반사원형콘 750mm, 강관난간 2중난간", org: "경기도 화성시 교통시설관리과", status: "마감", budget: 5500000, proposals: 6, deadline: "2026-02-28" },
];

const STATUS_FILTERS: Array<"전체" | Status> = ["전체", "견적공고중", "견적검토중", "선정완료", "마감"];
const GRID = "minmax(0,1fr) 214px 127px 130px 64px 110px 24px";

export function QuotesView({ isGuest = false }: { isGuest?: boolean }) {
  const router = useRouter();
  const [mine, setMine] = useState(!isGuest);
  const [statusF, setStatusF] = useState<"전체" | Status>("전체");
  const [q, setQ] = useState("");
  const [loginPrompt, setLoginPrompt] = useState(false);

  const rows = useMemo(() => {
    return QUOTES.filter((r) => (statusF === "전체" ? true : r.status === statusF))
      .filter((r) => (q.trim() ? (r.title + r.org + r.items).includes(q.trim()) : true));
  }, [statusF, q]);

  function openRow(id: string) {

    if (isGuest) { setLoginPrompt(true); return; }
    router.push(`/quotes/${id}`);
  }

  return (
    <div style={{ marginTop: "39.04px" }}>

      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "16px" }}>
        <Toggle active={isGuest ? true : !mine} onClick={() => setMine(false)}>전체</Toggle>
        {!isGuest && <Toggle active={mine} onClick={() => setMine(true)}>내가 쓴 글</Toggle>}
      </div>

      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "16px" }}>
        <div className="flex flex-1 items-center" style={{ gap: "9.76px", height: "49px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 18px" }}>
          <SearchIcon />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="공고명, 요청기관, 품목으로 검색"
            className="flex-1 placeholder:text-[#1d1d1f]/30 placeholder:font-medium"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#1D1D1F" }}
          />
        </div>
        <div className="flex items-center justify-center" style={{ height: "49px", padding: "0 16px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", fontSize: "13px", color: "#1D1D1F" }}>
          최신순 <span style={{ marginLeft: "6px", color: "#000000" }}>▾</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: "7.32px", marginBottom: "29.28px" }}>
        {STATUS_FILTERS.map((s) => {
          const active = statusF === s;
          return (
            <button key={s} type="button" onClick={() => setStatusF(s)} style={{ borderRadius: "9999px", padding: "7px 14px", fontSize: "12px", fontWeight: 500, letterSpacing: "-0.2928px", border: "none", cursor: "pointer", background: active ? "#1D1D1F" : "transparent", color: active ? "#fff" : "rgba(29,29,31,0.5)" }}>
              {s}
            </button>
          );
        })}
      </div>

      <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
        <div className="grid items-center" style={{ gridTemplateColumns: GRID, gap: "14.64px", padding: "16px 25.4px", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
          {["공고명", "요청 기관", "상태", "예산", "제안", "마감일", ""].map((h, i) => (
            <span key={i} style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.6)" }}>{h}</span>
          ))}
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(29,29,31,0.4)", fontSize: "14px" }}>해당 조건의 견적 공고가 없습니다.</div>
        ) : rows.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => openRow(r.id)}
            className="grid w-full items-center text-left"
            style={{ gridTemplateColumns: GRID, gap: "14.64px", padding: "19.52px 25.4px", borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.15)", background: "none", border: "none", cursor: "pointer" }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", color: "#1D1D1F", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</p>
              <p style={{ fontSize: "12px", fontWeight: 400, color: "rgba(29,29,31,0.4)", margin: "3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.items}</p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.6)" }}>{r.org}</span>
            <span><Badge status={r.status} /></span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>{won(r.budget)}</span>
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>{r.proposals}건</span>
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.4)" }}>{r.deadline}</span>
            <span style={{ justifySelf: "end" }}><Chevron /></span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center" style={{ gap: "4.88px", marginTop: "29.28px" }}>
        <span style={{ color: "rgba(29,29,31,0.3)", fontSize: "13px" }}>‹</span>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", background: n === 1 ? "#1F2937" : "transparent", color: n === 1 ? "#fff" : "#4B5563" }}>{n}</span>
        ))}
        <span style={{ color: "rgba(29,29,31,0.3)", fontSize: "13px" }}>›</span>
      </div>

      {loginPrompt && (
        <div onClick={() => setLoginPrompt(false)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "468px", maxWidth: "100%", borderRadius: "19.52px", background: "#fff", padding: "29.28px", textAlign: "center" }}>
            <button type="button" aria-label="닫기" onClick={() => setLoginPrompt(false)} style={{ position: "absolute", top: "19.52px", right: "19.52px", background: "none", border: "none", cursor: "pointer", color: "rgba(29,29,31,0.3)", fontSize: "18px", lineHeight: 1 }}>✕</button>

            <div className="flex items-center justify-center" style={{ width: "68px", height: "68px", borderRadius: "9999px", background: "#FFFBEB", margin: "0 auto 19.52px" }}>
              <LockIcon />
            </div>
            <p style={{ fontSize: "17px", fontWeight: 700, lineHeight: "21.25px", letterSpacing: "-0.476px", color: "#1D1D1F", margin: 0 }}>회원만 열람 가능</p>
            <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.1px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)", margin: "9.76px 0 0" }}>
              공고 상세 내용은 회원만 확인할 수 있습니다.<br />회원가입 후 모든 공고를 열람하세요.
            </p>
            <div className="flex" style={{ gap: "14.64px", marginTop: "9.76px" }}>
              <button type="button" onClick={() => setLoginPrompt(false)} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>닫기</button>
              <button type="button" onClick={() => router.push("/signup")} style={{ flex: 1, height: "49px", borderRadius: "14.64px", border: "none", background: "#1E3A5F", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", color: "#fff", cursor: "pointer" }}>회원가입</button>
            </div>
            <button type="button" onClick={() => router.push("/login")} style={{ marginTop: "14.64px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.4)" }}>이미 계정이 있으시나요? 로그인</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ borderRadius: "9999px", padding: "9.76px 19.52px", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", border: "none", cursor: "pointer", background: active ? "#1D1D1F" : "transparent", color: active ? "#fff" : "rgba(29,29,31,0.5)" }}>
      {children}
    </button>
  );
}

function Badge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; color: string }> = {
    견적공고중: { bg: "#F5F5F7", color: "rgba(29,29,31,0.6)" },
    견적검토중: { bg: "rgba(30,58,95,0.1)", color: "#1E3A5F" },
    선정완료: { bg: "#1E3A5F", color: "#FFFFFF" },
    마감: { bg: "#F5F5F7", color: "rgba(29,29,31,0.3)" },
  };
  const s = map[status];
  return <span style={{ display: "inline-flex", borderRadius: "9999px", padding: "4.88px 12.2px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{status}</span>;
}

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.3)" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function Chevron() {
  return <svg width={6} height={10} viewBox="0 0 6 10" fill="none" aria-hidden><path d="M1 1l4 4-4 4" stroke="rgba(29,29,31,0.3)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
