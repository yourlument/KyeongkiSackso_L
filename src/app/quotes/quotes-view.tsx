"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuoteRow, QuoteStatus } from "@/lib/quotes";

type Status = QuoteStatus;
type Quote = QuoteRow;

const STATUS_FILTERS: Array<"전체" | Status> = ["전체", "견적공고중", "견적검토중", "선정완료", "마감"];
const GRID = "minmax(0,1fr) 214px 127px 130px 64px 110px 24px";
const SORTS = [
  { key: "latest", label: "최신순" },
  { key: "deadline", label: "마감임박순" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];
const PER_PAGE = 10;

export function QuotesView({ quotes, isGuest = false, browseOnly = false }: { quotes: QuoteRow[]; isGuest?: boolean; browseOnly?: boolean }) {
  const router = useRouter();
  const [mine, setMine] = useState(!isGuest && !browseOnly);
  const [statusF, setStatusF] = useState<"전체" | Status>("전체");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [page, setPage] = useState(1);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const rows = useMemo(() => {
    const filtered = quotes
      .filter((r) => (mine ? r.mine : true))
      .filter((r) => (statusF === "전체" ? true : r.status === statusF))
      .filter((r) => (q.trim() ? (r.title + r.org + r.items).includes(q.trim()) : true));
    if (sort === "deadline") {
      return [...filtered].sort((a, b) => a.deadline.localeCompare(b.deadline));
    }
    return filtered;
  }, [quotes, mine, statusF, q, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const cur = Math.min(page, pageCount);
  const paged = rows.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  function openRow(id: string) {
    if (isGuest) { setLoginPrompt(true); return; }
    router.push(`/quotes/${id}`);
  }

  return (
    <div style={{ marginTop: "39.04px" }}>
      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "16px" }}>
        <Toggle active={isGuest || browseOnly ? true : !mine} onClick={() => { setMine(false); setPage(1); }}>전체</Toggle>
        {!isGuest && !browseOnly && <Toggle active={mine} onClick={() => { setMine(true); setPage(1); }}>내가 쓴 글</Toggle>}
      </div>

      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "16px" }}>
        <div className="flex flex-1 items-center" style={{ gap: "9.76px", height: "49px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 18px" }}>
          <SearchIcon />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="공고명, 요청기관, 품목으로 검색"
            className="flex-1 placeholder:text-[#1d1d1f]/30 placeholder:font-medium"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#1D1D1F" }}
          />
        </div>
        <div className="relative flex items-center" style={{ height: "49px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff" }}>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
            aria-label="정렬"
            className="h-full cursor-pointer appearance-none outline-none"
            style={{ background: "transparent", border: "none", padding: "0 32px 0 16px", fontSize: "13px", color: "#1D1D1F" }}
          >
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <span style={{ position: "absolute", right: "13px", color: "#000000", pointerEvents: "none" }}>▾</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: "7.32px", marginBottom: "29.28px" }}>
        {STATUS_FILTERS.map((s) => {
          const active = statusF === s;
          return (
            <button key={s} type="button" onClick={() => { setStatusF(s); setPage(1); }} style={{ borderRadius: "9999px", padding: "7px 14px", fontSize: "12px", fontWeight: 500, letterSpacing: "-0.2928px", border: "none", cursor: "pointer", background: active ? "#1D1D1F" : "transparent", color: active ? "#fff" : "rgba(29,29,31,0.5)" }}>
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
        ) : paged.map((r, i) => (
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
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>{r.budget}</span>
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>{r.proposals}건</span>
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.4)" }}>{r.deadline}</span>
            <span style={{ justifySelf: "end" }}><Chevron /></span>
          </button>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center" style={{ gap: "4.88px", marginTop: "29.28px" }}>
          <button type="button" aria-label="이전" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={cur <= 1} style={{ background: "none", border: "none", color: "rgba(29,29,31,0.3)", fontSize: "13px", cursor: cur <= 1 ? "default" : "pointer", opacity: cur <= 1 ? 0.4 : 1 }}>‹</button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => setPage(n)} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", background: n === cur ? "#1F2937" : "transparent", color: n === cur ? "#fff" : "#4B5563" }}>{n}</button>
          ))}
          <button type="button" aria-label="다음" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={cur >= pageCount} style={{ background: "none", border: "none", color: "rgba(29,29,31,0.3)", fontSize: "13px", cursor: cur >= pageCount ? "default" : "pointer", opacity: cur >= pageCount ? 0.4 : 1 }}>›</button>
        </div>
      )}

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
