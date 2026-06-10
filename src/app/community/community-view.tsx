"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMAND_POSTS, type DemandPost, type DemandStatus } from "./data";

const NAVY = "#1E3A5F";
const STATUS_TABS: Array<"전체" | DemandStatus> = ["전체", "진행중", "마감"];
const PER_PAGE = 5;

export function CommunityView({ role }: { role: string | null }) {
  const router = useRouter();
  const isOfficial = role === "OFFICIAL";
  const isSupplier = role === "SUPPLIER";
  const secondLabel = isSupplier ? "답변 남긴 글" : "내가 쓴 글";
  const hasSecond = isOfficial || isSupplier;

  const [posts, setPosts] = useState<DemandPost[]>(DEMAND_POSTS);
  const [scope, setScope] = useState<"전체" | "second">("전체");
  const [status, setStatus] = useState<"전체" | DemandStatus>("전체");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const kw = q.trim();
    return posts
      .filter((p) => (status === "전체" ? true : p.status === status))
      .filter((p) =>
        scope === "전체"
          ? true
          : isSupplier
            ? !!p.comments?.length
            : !!p.mine,
      )
      .filter((p) => (kw ? (p.title + p.summary + p.org + p.category).includes(kw) : true));
  }, [posts, status, scope, q, isSupplier]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const cur = Math.min(page, pageCount);
  const pageRows = rows.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);

  const closePost = (id: string) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "마감" } : p)));
  const reopenPost = (id: string) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "진행중" } : p)));
  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ marginTop: "39.04px" }}>

      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "14.64px" }}>
        <Pill active={scope === "전체"} onClick={() => { setScope("전체"); setPage(1); }}>전체</Pill>
        {hasSecond && (
          <Pill active={scope === "second"} onClick={() => { setScope("second"); setPage(1); }}>{secondLabel}</Pill>
        )}
      </div>

      <div className="flex items-center" style={{ gap: "9.76px", height: "49px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "0 20.52px 0 19.52px", marginBottom: "14.64px" }}>
        <SearchIcon />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="제목, 내용, 작성자, 카테고리 검색"
          className="flex-1 placeholder:text-[#1d1d1f]/30 placeholder:font-medium"
          style={{ border: "none", outline: "none", background: "transparent", fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.293px", color: "#1D1D1F" }}
        />
      </div>

      <div className="flex items-center" style={{ gap: "7.32px", marginBottom: "29.28px" }}>
        {STATUS_TABS.map((s) => (
          <Tab key={s} active={status === s} onClick={() => { setStatus(s); setPage(1); }}>{s}</Tab>
        ))}
      </div>

      <div style={{ borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", overflow: "hidden" }}>
        {pageRows.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(29,29,31,0.4)", fontSize: "14px" }}>해당 조건의 수요 게시물이 없습니다.</div>
        ) : (
          pageRows.map((p, i) => (
            <DemandRow
              key={p.id}
              p={p}
              last={i === pageRows.length - 1}
              showMine={isOfficial && !!p.mine}
              isOwner={isOfficial && !!p.mine}
              isSupplier={isSupplier}
              onOpen={() => router.push(`/community/${p.id}`)}
              onClose={() => closePost(p.id)}
              onReopen={() => reopenPost(p.id)}
              onEdit={() => router.push(`/community/new?edit=${p.id}`)}
              onDelete={() => deletePost(p.id)}
            />
          ))
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center" style={{ gap: "4.88px", marginTop: "19.52px" }}>
          <PageArrow dir="prev" disabled={cur === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
            const on = n === cur;
            return (
              <button key={n} type="button" onClick={() => setPage(n)}
                style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", cursor: "pointer", background: on ? "#1F2937" : "transparent", color: on ? "#fff" : "#4B5563", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.293px", lineHeight: "24.4px" }}>
                {n}
              </button>
            );
          })}
          <PageArrow dir="next" disabled={cur === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} />
        </div>
      )}
    </div>
  );
}

function DemandRow({ p, last, showMine, isOwner, isSupplier, onOpen, onClose, onReopen, onEdit, onDelete }: {
  p: DemandPost; last: boolean; showMine: boolean; isOwner: boolean; isSupplier: boolean;
  onOpen: () => void; onClose: () => void; onReopen: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div
      onClick={onOpen}
      style={{ padding: "24.4px 29.28px", borderBottom: last ? "none" : "1px solid rgba(210,210,215,0.15)", cursor: "pointer" }}
    >

      <div className="flex items-center" style={{ gap: "9.76px" }}>
        <StatusBadge status={p.status} />
        <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", color: "rgba(29,29,31,0.3)" }}>{p.date}</span>
        {showMine && (
          <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", padding: "2.44px 9.76px", background: "transparent", fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "-0.165px", color: NAVY }}>내 글</span>
        )}
      </div>

      <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: "25.2px", letterSpacing: "-0.21px", color: "#1D1D1F", margin: "9.76px 0 0" }}>{p.title}</p>
      <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.125px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)", margin: "4.88px 0 0", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.summary}</p>

      <div className="flex items-center justify-between" style={{ marginTop: "14.64px", gap: "12px" }}>
        <div className="flex items-center flex-wrap" style={{ gap: "14.64px", minWidth: 0 }}>
          <Meta>{p.org}</Meta>
          {!isSupplier && <Meta>{p.category}</Meta>}
          <Meta>조회 {p.views}</Meta>
        </div>
        <div className="flex items-center" style={{ gap: "9.76px", flexShrink: 0 }}>
          {isSupplier ? (
            <>
              <AnswerCount n={p.answers} />
              {p.status === "진행중" && (
                <button type="button" onClick={(e) => { stop(e); onOpen(); }}
                  style={{ borderRadius: "9.76px", background: "#F5F5F7", border: "none", padding: "7.32px 14.64px", fontSize: "12px", fontWeight: 500, lineHeight: "21px", letterSpacing: "-0.293px", color: "rgba(29,29,31,0.7)", cursor: "pointer" }}>답변하기</button>
              )}
            </>
          ) : (
            <>
              {isOwner && (
                <>
                  {p.status === "진행중" ? (
                    <button type="button" onClick={(e) => { stop(e); onClose(); }}
                      style={{ borderRadius: "9.76px", background: "#F5F5F7", border: "none", padding: "7.32px 14.64px", fontSize: "12px", fontWeight: 500, lineHeight: "21px", letterSpacing: "-0.293px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>마감 처리</button>
                  ) : (
                    <button type="button" onClick={(e) => { stop(e); onReopen(); }}
                      style={{ borderRadius: "9.76px", background: "transparent", border: "none", padding: "7.32px 14.64px", fontSize: "12px", fontWeight: 500, lineHeight: "21px", letterSpacing: "-0.293px", color: NAVY, cursor: "pointer" }}>재개 처리</button>
                  )}
                  <button type="button" onClick={(e) => { stop(e); onEdit(); }} style={actionTextBtn("rgba(29,29,31,0.4)")}>수정</button>
                  <button type="button" onClick={(e) => { stop(e); onDelete(); }} style={actionTextBtn("#F87171")}>삭제</button>
                </>
              )}
              <AnswerCount n={p.answers} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", whiteSpace: "nowrap" }}>{children}</span>;
}
function actionTextBtn(color: string): React.CSSProperties {
  return { background: "none", border: "none", padding: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.293px", color, cursor: "pointer" };
}
function AnswerCount({ n }: { n: number }) {
  return (
    <span className="flex items-center" style={{ gap: "4.88px", fontSize: "12px", fontWeight: 400, lineHeight: "21px", letterSpacing: "-0.293px", color: "rgba(29,29,31,0.6)", whiteSpace: "nowrap" }}>
      <CommentIcon /> 업체 답변 {n}건
    </span>
  );
}

function PageArrow({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={dir === "prev" ? "이전" : "다음"}
      className="flex items-center justify-center"
      style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", background: "transparent", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1 }}>
      <svg width={5} height={9} viewBox="0 0 5 9" fill="none" stroke="#D1D5DB" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {dir === "prev" ? <path d="M4.25 0.75 0.75 4.5 4.25 8.25" /> : <path d="M0.75 0.75 4.25 4.5 0.75 8.25" />}
      </svg>
    </button>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      style={{ borderRadius: "9999px", padding: "9.76px 19.52px", border: "none", cursor: "pointer", background: active ? "#1D1D1F" : "transparent", color: active ? "#fff" : "rgba(29,29,31,0.5)", fontSize: "13px", fontWeight: 500, lineHeight: "22.75px", letterSpacing: "-0.293px" }}>
      {children}
    </button>
  );
}
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      style={{ borderRadius: "9999px", padding: "7.32px 14.64px", border: "none", cursor: "pointer", background: active ? "#1D1D1F" : "transparent", color: active ? "#fff" : "rgba(29,29,31,0.5)", fontSize: "12px", fontWeight: 500, lineHeight: "21px", letterSpacing: "-0.293px" }}>
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: DemandStatus }) {
  const active = status === "진행중";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", padding: "2.44px 12.2px", fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "-0.165px", whiteSpace: "nowrap", background: active ? "rgba(30,58,95,0.1)" : "#F5F5F7", color: active ? NAVY : "rgba(29,29,31,0.4)" }}>
      {status}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.3)" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
