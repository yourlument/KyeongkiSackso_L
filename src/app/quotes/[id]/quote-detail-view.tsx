"use client";

import { useState } from "react";
import type { QuoteDetailData, QuoteDetailProposal } from "@/lib/quotes";
import { EditNoticeModal, QuotePreviewModal, ProposalStatusModal, DeleteNoticeModal } from "./quote-action-modals";

const NAVY = "#1E3A5F";
const TEXT = "#1D1D1F";

const TABS = ["개요", "제안서", "실시간 상담", "제안서 비교"] as const;
type Tab = (typeof TABS)[number];

export function QuoteDetailView({ id, data }: { id: string; data: QuoteDetailData }) {
  const [tab, setTab] = useState<Tab>("개요");
  const [modal, setModal] = useState<null | "edit" | "quote" | "status" | "delete">(null);
  const [selectedProposal, setSelectedProposal] = useState<QuoteDetailProposal | null>(null);

  return (
    <div>
      <nav className="flex items-center" style={{ gap: "7.32px", marginBottom: "24.4px" }}>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21px", color: "rgba(29,29,31,0.4)" }}>견적요청</span>
        <svg width={4} height={6} viewBox="0 0 4 6" fill="none" aria-hidden>
          <path d="M1 1l2 2-2 2" stroke="rgba(29,29,31,0.4)" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.7)" }}>
          {data.title}
        </span>
      </nav>

      <section style={card()}>
        <div className="flex items-start justify-between" style={{ paddingBottom: "19.52px" }}>
          <div style={{ minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "9.76px" }}>
              <span style={pill(NAVY, "rgba(30,58,95,0.1)", "rgba(30,58,95,0.2)")}>{data.statusLabel}</span>
              <span style={pill("rgba(29,29,31,0.5)", "#F5F5F7", "rgba(210,210,215,0.2)")}>{data.quoteType}</span>
              <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
                등록일: {data.createdAt}
              </span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.55px", lineHeight: "27.5px", color: TEXT, margin: 0 }}>
              {data.title}
            </h1>
            <p style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "rgba(29,29,31,0.5)", margin: "4.88px 0 0" }}>
              {data.org}
            </p>
            <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
              {data.categoryPath}
            </p>
          </div>
          <div className="text-right" style={{ flexShrink: 0 }}>
            <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: 0 }}>예산</p>
            <p style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.36px", lineHeight: "43.2px", color: TEXT, margin: 0 }}>{data.budget}</p>
          </div>
        </div>

        <div className="flex" style={{ gap: "14.64px", borderTop: `1px solid rgba(210,210,215,0.15)`, paddingTop: "20.52px" }}>
          {[
            ["마감 일시", data.deadline],
            ["납기 기한", data.dueDate],
            ["인도 조건", data.deliveryCondition],
            ["납품 장소", data.deliveryPlace],
            ["요청 품목", `${data.items.length}개`],
            ["접수 제안", `${data.proposals.length}건`],
          ].map(([label, value]) => (
            <div key={label} style={{ flex: 1, minWidth: 0 }}>
              <p style={caption(0.4)}>{label}</p>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: TEXT, margin: "0" }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid rgba(210,210,215,0.15)`, paddingTop: "20.52px", marginTop: "19.52px" }}>
          <p style={{ ...caption(0.4), fontWeight: 600, marginBottom: "9.76px" }}>요청 품목</p>
          <div className="flex flex-wrap items-center" style={{ gap: "9.76px" }}>
            {data.items.map((item) => (
              <span key={item.no} style={chip()}>{item.chipLabel}</span>
            ))}
          </div>
        </div>
      </section>

      {data.isOwner && (
        <div className="flex items-center" style={{ gap: "9.76px", marginTop: "24.4px", marginBottom: "19.52px" }}>
          <button type="button" onClick={() => setModal("edit")} style={actionBtn("rgba(210,210,215,0.3)", "rgba(29,29,31,0.6)")}>
            <PencilIcon />
            <span>수정</span>
          </button>
          <button type="button" onClick={() => setModal("delete")} style={actionBtn("#FECACA", "#F87171")}>
            <TrashIcon />
            <span>삭제</span>
          </button>
        </div>
      )}

      <div className="flex" style={{ gap: "4.88px", borderBottom: `1px solid rgba(210,210,215,0.2)`, marginBottom: "29.28px" }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "14.64px 19.52px 16.64px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.293px",
                lineHeight: "22.75px",
                color: active ? NAVY : "rgba(29,29,31,0.4)",
                borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "개요" ? (
        <>
          <section style={{ ...card(), marginBottom: "24.4px" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.42px", lineHeight: "18.75px", color: TEXT, margin: "0 0 24.4px" }}>
              공고 상세 정보
            </p>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24.4px", rowGap: "24.4px" }}>
              {[
                ["공고 유형", data.quoteType],
                ["카테고리", data.categoryPath],
                ["마감 일시", data.deadline],
                ["요청 기관", data.org],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ ...caption(0.4), fontWeight: 500, marginBottom: "4.88px" }}>{label}</p>
                  <p style={detailValue()}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid rgba(210,210,215,0.15)`, paddingTop: "20.52px", marginTop: "24.4px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", margin: "0 0 14.64px" }}>
                물품 상세 사양
              </p>
              {data.items.map((item, i) => (
                <div key={item.no}>
                  {i > 0 && <div style={{ height: "9.76px" }} />}
                  <SpecRow no={item.no} title={item.name} detail={item.detail} />
                </div>
              ))}
            </div>

            <div className="flex" style={{ gap: "24.4px", borderTop: `1px solid rgba(210,210,215,0.15)`, paddingTop: "20.52px", marginTop: "24.4px" }}>
              {[
                ["납기 기한", data.dueDate],
                ["납품 장소", data.deliveryPlace],
                ["인도 조건", data.deliveryCondition],
              ].map(([label, value]) => (
                <div key={label} style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...caption(0.4), fontWeight: 500, marginBottom: "4.88px" }}>{label}</p>
                  <p style={detailValue()}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid rgba(210,210,215,0.15)`, paddingTop: "20.52px", marginTop: "24.4px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", margin: "0 0 14.64px" }}>
                첨부파일
              </p>
              {data.attachments.length === 0 ? (
                <div className="flex items-center" style={{ gap: "14.64px", borderRadius: "14.64px", border: `1px dashed rgba(210,210,215,0.3)`, padding: "20.52px" }}>
                  <AttachIcon />
                  <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)" }}>
                    첨부된 파일이 없습니다
                  </span>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: "7.32px" }}>
                  {data.attachments.map((a, i) => (
                    <div key={i} className="flex items-center" style={{ gap: "9.76px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, padding: "12.2px 15.64px" }}>
                      <AttachIcon />
                      <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)" }}>{a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section style={card()}>
            <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.42px", lineHeight: "18.75px", color: TEXT, margin: "0 0 24.4px" }}>
              프로세스 히스토리
            </p>
            <div className="flex flex-col" style={{ gap: "24.4px" }}>
              <HistoryRow done title="공고 등록 완료" sub="2026-05-08 · 경기도 화성시 화폐과" />
              <HistoryRow title="견적 접수 완료" sub="1개 업체 제안 접수" />
              <HistoryRow title="견적 검토" sub="대기 중" />
              <HistoryRow title="업체 선정" sub="미선정" />
              <HistoryRow title="결제 완료" sub="대기 중" />
            </div>
          </section>
        </>
      ) : tab === "제안서" ? (
        <ProposalsPanel proposals={data.proposals} onQuote={() => setModal("quote")} onStatus={(p) => { setSelectedProposal(p); setModal("status"); }} onChat={() => setTab("실시간 상담")} onCompare={() => setTab("제안서 비교")} />
      ) : tab === "실시간 상담" ? (
        <ChatPanel onQuote={() => setModal("quote")} />
      ) : (
        <ComparePanel onQuote={() => setModal("quote")} onStatus={() => setModal("status")} onChat={() => setTab("실시간 상담")} onBack={() => setTab("제안서")} />
      )}
      {modal === "edit" && <EditNoticeModal onClose={() => setModal(null)} />}
      {modal === "quote" && <QuotePreviewModal onClose={() => setModal(null)} />}
      {modal === "status" && selectedProposal && (
        <ProposalStatusModal
          onClose={() => setModal(null)}
          quoteId={id}
          responseId={selectedProposal.id}
          company={selectedProposal.company}
          totalAmount={selectedProposal.totalAmount}
          current={selectedProposal.statusLabel}
        />
      )}
      {modal === "delete" && <DeleteNoticeModal onClose={() => setModal(null)} quoteId={id} quoteTitle={data.title} />}
    </div>
  );
}

const PROP_COLS = [
  { label: "업체명", width: "11.25%" },
  { label: "연락처", width: "11.71%" },
  { label: "제안 금액", width: "12.61%" },
  { label: "규격 요약", width: "25.95%" },
  { label: "상태", width: "8.8%" },
  { label: "작업", width: "29.66%" },
];

function ProposalsPanel({ proposals, onQuote, onStatus, onChat, onCompare }: { proposals: QuoteDetailProposal[]; onQuote: () => void; onStatus: (p: QuoteDetailProposal) => void; onChat: () => void; onCompare: () => void }) {
  return (
    <div style={{ paddingBottom: "58.6px" }}>
      <div style={{ borderRadius: "19.52px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", overflow: "hidden" }}>
        <div className="flex" style={{ borderBottom: `1px solid rgba(210,210,215,0.2)` }}>
          {PROP_COLS.map((c) => (
            <div key={c.label} className="flex items-center" style={{ width: c.width, padding: "17.08px 24.4px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)" }}>{c.label}</span>
            </div>
          ))}
        </div>
        {proposals.length === 0 ? (
          <div className="flex items-center justify-center" style={{ padding: "39.04px 24.4px" }}>
            <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.3)" }}>접수된 제안이 없습니다</span>
          </div>
        ) : proposals.map((p) => (
          <div key={p.id} className="flex items-center" style={{ borderTop: `1px solid rgba(210,210,215,0.1)` }}>
            <div className="flex items-center" style={{ width: PROP_COLS[0].width, padding: "19.52px 24.4px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: TEXT }}>{p.company}</span>
            </div>
            <div className="flex items-center" style={{ width: PROP_COLS[1].width, padding: "19.52px 24.4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.5)" }}>{p.phone}</span>
            </div>
            <div className="flex items-center" style={{ width: PROP_COLS[2].width, padding: "19.52px 24.4px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: TEXT }}>{p.totalAmount}</span>
            </div>
            <div className="flex items-center" style={{ width: PROP_COLS[3].width, padding: "19.52px 24.4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.5)" }}>{p.specSummary}</span>
            </div>
            <div className="flex items-center" style={{ width: PROP_COLS[4].width, padding: "19.52px 24.4px" }}>
              <span style={statusBadge()}>{p.statusLabel}</span>
            </div>
            <div className="flex items-center" style={{ width: PROP_COLS[5].width, padding: "19.52px 24.4px", gap: "9.76px" }}>
              <button type="button" onClick={onQuote} style={chipBtn()}><QuoteIcon /><span>견적서</span></button>
              <button type="button" onClick={onChat} style={chipBtn()}><ChatBubbleIcon /><span>대화</span></button>
              <button type="button" onClick={() => onStatus(p)} style={chipBtn()}><StatusIcon /><span>상태 변경</span></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end" style={{ paddingTop: "19.52px" }}>
        <button type="button" onClick={onCompare} style={compareViewerBtn()}>
          <CompareIcon />
          <span>제안서 비교 뷰어</span>
        </button>
      </div>
    </div>
  );
}

function nowStamp() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const ap = d.getHours() < 12 ? "오전" : "오후";
  let h = d.getHours() % 12;
  if (h === 0) h = 12;
  const hh = String(h).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}- ${dd}- ${ap} ${hh}:${min}`;
}

function ChatPanel({ onQuote }: { onQuote: () => void }) {
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<{ text: string; time: string }[]>([]);
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setSent((m) => [...m, { text: t, time: nowStamp() }]);
    setDraft("");
  };
  return (
    <div className="flex" style={{ gap: "19.52px", marginBottom: "58.6px" }}>
      <div style={{ width: "422.9px", flexShrink: 0, borderRadius: "19.52px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 24.4px 20.52px", borderBottom: `1px solid rgba(210,210,215,0.15)` }}>
          <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.392px", lineHeight: "17.5px", color: TEXT }}>참여 업체</span>
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>1개</span>
        </div>
        <div
          className="flex flex-col"
          style={{ padding: "17.08px 24.4px 18.08px 28.44px", background: "rgba(30,58,95,0.05)", borderLeft: `2px solid ${NAVY}`, gap: "0" }}
        >
          <div className="flex items-center justify-between" style={{ paddingBottom: "4.88px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: NAVY }}>기계공업(주)</span>
            <span style={statusBadgeSm()}>접수</span>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>메시지를 시작하세요</span>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", paddingTop: "2.44px" }}>14,800,000원</span>
        </div>
      </div>

      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, borderRadius: "19.52px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 24.4px 20.52px", borderBottom: `1px solid rgba(210,210,215,0.15)` }}>
          <div className="flex items-center" style={{ gap: "14.64px" }}>
            <span className="flex items-center justify-center" style={{ width: "43.9px", height: "43.9px", borderRadius: "9999px", background: "rgba(30,58,95,0.1)", flexShrink: 0 }}>
              <BuildingIcon />
            </span>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: TEXT, margin: 0 }}>기계공업(주)</p>
              <p style={{ margin: 0 }}>
                <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>제안가:&#8203; </span>
                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)" }}>14,800,000원</span>
              </p>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: "9.76px" }}>
            <span style={statusBadge()}>접수</span>
            <button type="button" onClick={onQuote} style={{ ...chipBtn(), fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "21px" }}><QuoteIcon /><span>견적서</span></button>
          </div>
        </div>

        <div className="flex flex-col" style={{ flex: 1, padding: "19.52px" }}>
          <ChatBubble text="안녕하세요" />
          <div style={{ height: "14.64px" }} />
          <ChatBubble text="견적서 관련 자료입니다." />
          <div style={{ height: "14.64px" }} />
          <ChatFileBubble />
          {sent.map((m, i) => (
            <div key={i}>
              <div style={{ height: "14.64px" }} />
              <ChatBubble text={m.text} time={m.time} />
            </div>
          ))}
        </div>

        <div style={{ padding: "15.6px 14.64px 14.64px", borderTop: `1px solid rgba(210,210,215,0.15)` }}>
          <div className="flex items-center" style={{ gap: "9.76px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, background: "rgba(29,29,31,0.02)", padding: "1px 15.6px" }}>
            <span className="flex items-center justify-center" style={{ width: "34.2px", height: "34.2px", flexShrink: 0 }}>
              <AttachChatIcon />
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
              placeholder="메시지를 입력하세요..."
              className="placeholder:text-[rgba(29,29,31,0.3)]"
              style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", padding: "14.64px 0", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.293px", lineHeight: "22.75px", color: TEXT }}
            />
            <button type="button" aria-label="전송" onClick={send} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: draft.trim() ? NAVY : "rgba(30,58,95,0.3)", flexShrink: 0, border: "none", cursor: "pointer" }}>
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ text, time = "05- 19- 오후 04:59" }: { text: string; time?: string }) {
  return (
    <div className="flex flex-col items-end">
      <div style={{ borderRadius: "19.52px 19.52px 7.32px 19.52px", background: NAVY, padding: "12.2px 19.52px" }}>
        <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#fff" }}>{text}</span>
      </div>
      <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)", padding: "4.88px 4.88px 0" }}>{time}</span>
    </div>
  );
}

function ChatFileBubble() {
  return (
    <div className="flex flex-col items-end">
      <div
        className="flex items-center"
        style={{ gap: "12.2px", borderRadius: "19.52px 19.52px 7.32px 19.52px", background: "rgba(30,58,95,0.9)", border: `1px solid rgba(22,48,79,0.4)`, padding: "13.2px 18.08px" }}
      >
        <span className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "rgba(255,255,255,0.15)", flexShrink: 0 }}>
          <FileJpgIcon />
        </span>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#fff", margin: 0 }}>다운로드.jpg</p>
          <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(255,255,255,0.6)", margin: "2.44px 0 0" }}>JPG 스파일</p>
        </div>
        <span className="flex items-center justify-center" style={{ width: "29.3px", height: "29.3px", flexShrink: 0 }}>
          <DownloadIcon />
        </span>
      </div>
      <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)", padding: "4.88px 4.88px 0" }}>05- 19- 오후 04:59</span>
    </div>
  );
}

function ComparePanel({ onQuote, onStatus, onChat, onBack }: { onQuote: () => void; onStatus: () => void; onChat: () => void; onBack: () => void }) {
  const LABEL_W = "175.7px";
  return (
    <div style={{ paddingBottom: "58.6px" }}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.42px", lineHeight: "18.75px", color: TEXT, margin: 0 }}>업체별 제안 비교 분석</p>
          <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>
            총 1개 업체 제안 · 좌우로 스크롤하여 전체 비교
          </p>
        </div>
        <button type="button" onClick={onBack} className="flex items-center" style={{ gap: "4.88px", border: "none", background: "none", cursor: "pointer", padding: 0 }}>
          <BackArrowIcon />
          <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", lineHeight: "22.75px", color: "rgba(29,29,31,0.5)" }}>목록으로</span>
        </button>
      </div>

      <div style={{ marginTop: "19.52px", borderRadius: "19.52px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", overflow: "hidden" }}>
        <div className="flex" style={{ background: "rgba(210,210,215,0.1)", gap: "1px" }}>
          <SummaryCell label="최저 제안가" value="14,800,000원" color="#EF4444" />
          <SummaryCell label="평균 제안가" value="14,800,000원" color={TEXT} />
          <SummaryCell label="최고 제안가" value="14,800,000원" color="rgba(29,29,31,0.5)" />
        </div>

        <div style={{ maxWidth: "700px" }}>
          <div className="flex" style={{ borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
            <CompareLabel w={LABEL_W} text="비교 항목" padY="19.52px" />
            <div className="flex flex-col items-center justify-center" style={{ flex: 1, padding: "19.52px 14.64px", gap: "4.88px" }}>
              <span style={lowBadge()}>최저가</span>
              <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: TEXT }}>기계공업(주)</span>
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)" }}>2026-05-09</span>
            </div>
          </div>
          <div className="flex" style={{ background: "rgba(29,29,31,0.01)", borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
            <CompareLabel w={LABEL_W} text="제안 금액" />
            <div className="flex items-center justify-center" style={{ flex: 1, padding: "17.08px 14.64px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#EF4444" }}>14,800,000원</span>
            </div>
          </div>
          <div className="flex" style={{ borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
            <CompareLabel w={LABEL_W} text="예산 대비" />
            <div className="flex flex-col items-center justify-center" style={{ flex: 1, padding: "17.08px 14.64px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#059669" }}>99%</span>
              <div style={{ width: "100px", height: "4.9px", borderRadius: "9999px", background: "rgba(210,210,215,0.2)", marginTop: "7.32px", overflow: "hidden" }}>
                <div style={{ width: "99%", height: "100%", borderRadius: "9999px", background: "#34D399" }} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#10B981", paddingTop: "4.88px" }}>예산내</span>
            </div>
          </div>
          <div className="flex" style={{ background: "rgba(29,29,31,0.01)", borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
            <CompareLabel w={LABEL_W} text="규격 요약" />
            <div className="flex items-center justify-center" style={{ flex: 1, padding: "17.08px 14.64px" }}>
              <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "19.5px", color: "rgba(29,29,31,0.6)", textAlign: "center" }}>발전기 100kW 2대, 베어링 500개, 설치 포함</span>
            </div>
          </div>
          <div className="flex" style={{ borderBottom: `1px solid rgba(210,210,215,0.1)` }}>
            <CompareLabel w={LABEL_W} text="상태" />
            <div className="flex items-center justify-center" style={{ flex: 1, padding: "17.08px 14.64px" }}>
              <span style={statusBadge()}>접수</span>
            </div>
          </div>
          <div className="flex">
            <CompareLabel w={LABEL_W} text="작업" />
            <div className="flex flex-col items-center justify-center" style={{ flex: 1, padding: "17.08px 14.64px", gap: "7.32px" }}>
              <button type="button" onClick={onQuote} style={compareActionBtn()}><QuoteIcon /><span>견적서</span></button>
              <button type="button" onClick={onChat} style={compareActionBtn()}><ChatBubbleIcon /><span>대화</span></button>
              <button type="button" onClick={onStatus} style={compareActionBtn()}><StatusIcon /><span>상태 변경</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ flex: 1, background: "#fff", padding: "19.52px 24.4px" }}>
      <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 4.88px" }}>{label}</p>
      <p style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.27px", lineHeight: "32.4px", color, margin: 0 }}>{value}</p>
    </div>
  );
}

function CompareLabel({ w, text, padY = "17.08px" }: { w: string; text: string; padY?: string }) {
  return (
    <div className="flex items-center" style={{ width: w, flexShrink: 0, padding: `${padY} 20.52px ${padY} 19.52px`, borderRight: `1px solid rgba(210,210,215,0.1)` }}>
      <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>{text}</span>
    </div>
  );
}

function SpecRow({ no, title, detail }: { no: string; title: string; detail: string }) {
  return (
    <div className="flex items-start" style={{ gap: "19.52px", borderRadius: "14.64px", border: `1px solid rgba(210,210,215,0.2)`, padding: "18.08px 20.52px" }}>
      <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(30,58,95,0.5)", paddingTop: "2.44px" }}>{no}</span>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: TEXT, margin: 0 }}>{title}</p>
        <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.5)", margin: "2.44px 0 0" }}>{detail}</p>
      </div>
    </div>
  );
}

function HistoryRow({ done, title, sub }: { done?: boolean; title: string; sub: string }) {
  return (
    <div className="flex items-center" style={{ gap: "19.52px" }}>
      <span
        className="flex items-center justify-center"
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "9999px",
          flexShrink: 0,
          background: done ? NAVY : "transparent",
          border: done ? "none" : `1px solid rgba(210,210,215,0.3)`,
        }}
      >
        <CheckIcon color={done ? "#FFFFFF" : "rgba(29,29,31,0.2)"} />
      </span>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", lineHeight: "25.2px", color: done ? TEXT : "rgba(29,29,31,0.3)", margin: 0 }}>{title}</p>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}

function card(): React.CSSProperties {
  return { borderRadius: "19.52px", border: `1px solid rgba(210,210,215,0.2)`, background: "#fff", padding: "30.28px" };
}
function pill(color: string, bg: string, border: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    border: `1px solid ${border}`,
    background: bg,
    padding: "5.88px 13.2px",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "-0.165px",
    lineHeight: "19.8px",
    color,
    whiteSpace: "nowrap",
  };
}
function caption(alpha: number): React.CSSProperties {
  return { fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: `rgba(29,29,31,${alpha})`, margin: 0 };
}
function chip(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9.76px",
    background: "#F5F5F7",
    padding: "7.32px 14.64px",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "-0.18px",
    lineHeight: "21.6px",
    color: "rgba(29,29,31,0.7)",
    whiteSpace: "nowrap",
  };
}
function detailValue(): React.CSSProperties {
  return { fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", lineHeight: "25.2px", color: TEXT, margin: 0 };
}
function statusBadge(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    border: `1px solid rgba(210,210,215,0.2)`,
    background: "rgba(29,29,31,0.05)",
    padding: "5.88px 13.2px",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "-0.165px",
    lineHeight: "19.8px",
    color: "rgba(29,29,31,0.6)",
    whiteSpace: "nowrap",
  };
}
function statusBadgeSm(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    border: `1px solid rgba(210,210,215,0.2)`,
    background: "rgba(29,29,31,0.05)",
    padding: "3.42px 8.3px",
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "-0.15px",
    lineHeight: "18px",
    color: "rgba(29,29,31,0.6)",
    whiteSpace: "nowrap",
  };
}
function chipBtn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "4.88px",
    borderRadius: "9.76px",
    border: `1px solid rgba(210,210,215,0.3)`,
    background: "#fff",
    padding: "8.3px 15.6px",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "-0.24px",
    lineHeight: "21.6px",
    color: "rgba(29,29,31,0.6)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
function compareViewerBtn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "7.32px",
    borderRadius: "14.64px",
    border: "none",
    background: NAVY,
    padding: "12.2px 19.52px",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "-0.293px",
    lineHeight: "22.75px",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
function lowBadge(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    border: `1px solid #FEE2E2`,
    background: "#FEF2F2",
    padding: "3.42px 10.76px",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "-0.135px",
    lineHeight: "16.2px",
    color: "#EF4444",
    whiteSpace: "nowrap",
  };
}
function compareActionBtn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4.88px",
    width: "100%",
    borderRadius: "9.76px",
    border: `1px solid rgba(210,210,215,0.3)`,
    background: "#fff",
    padding: "8.3px 13.2px",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "-0.24px",
    lineHeight: "19.8px",
    color: "rgba(29,29,31,0.6)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
function actionBtn(border: string, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "7.32px",
    borderRadius: "9.76px",
    border: `1px solid ${border}`,
    background: "#fff",
    padding: "10.76px 20.52px",
    fontSize: "13px",
    fontWeight: 400,
    letterSpacing: "-0.293px",
    lineHeight: "22.75px",
    color,
    cursor: "pointer",
  };
}

function PencilIcon() {
  return (
    <svg width={14} height={13} viewBox="0 0 14 13" fill="none" aria-hidden>
      <path d="M3.69866 8.65625L9.11722 3.16375L8.35841 2.39458L2.93984 7.89792V8.65625H3.69866ZM4.13684 9.73958H1.87109V7.44292L7.98434 1.24625C8.08409 1.14514 8.20878 1.09458 8.35841 1.09458C8.50803 1.09458 8.63272 1.14514 8.73247 1.24625L10.2501 2.78458C10.357 2.88569 10.4104 3.01208 10.4104 3.16375C10.4104 3.31542 10.357 3.44542 10.2501 3.55375L4.13684 9.73958ZM1.87109 10.8229H11.4898V11.9062H1.87109V10.8229Z" fill="#1D1D1F" fillOpacity="0.6" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width={14} height={13} viewBox="0 0 14 13" fill="none" aria-hidden>
      <path d="M9.35156 3.25033H12.0234V4.33366H10.9547V11.3753C10.9547 11.527 10.903 11.6552 10.7997 11.7599C10.6964 11.8646 10.5699 11.917 10.4203 11.917H2.93906C2.78944 11.917 2.66297 11.8646 2.55966 11.7599C2.45634 11.6552 2.40469 11.527 2.40469 11.3753V4.33366H1.33594V3.25033H4.00781V1.62533C4.00781 1.47366 4.05947 1.34546 4.16278 1.24074C4.26609 1.13602 4.39256 1.08366 4.54219 1.08366H8.81719C8.96681 1.08366 9.09328 1.13602 9.19659 1.24074C9.29991 1.34546 9.35156 1.47366 9.35156 1.62533V3.25033ZM9.88594 4.33366H3.47344V10.8337H9.88594V4.33366ZM5.07656 5.95866H6.14531V9.20866H5.07656V5.95866ZM7.21406 5.95866H8.28281V9.20866H7.21406V5.95866ZM5.07656 2.16699V3.25033H8.28281V2.16699H5.07656Z" fill="#F87171" />
    </svg>
  );
}
function AttachIcon() {
  return (
    <svg width={23} height={22} viewBox="0 0 23 22" fill="none" aria-hidden>
      <path d="M14.1356 7.49853L9.02014 12.6685C8.85143 12.8519 8.76707 13.0688 8.76707 13.3194C8.76707 13.5699 8.85444 13.7869 9.02918 13.9702C9.20391 14.1535 9.41781 14.2452 9.67087 14.2452C9.92394 14.2452 10.1348 14.1535 10.3035 13.9702L15.419 8.78186C15.7685 8.42742 16.0035 8.01492 16.124 7.54436C16.2445 7.07381 16.2445 6.60325 16.124 6.1327C16.0035 5.66214 15.7685 5.24964 15.419 4.8952C15.0696 4.54075 14.6629 4.30242 14.1989 4.1802C13.735 4.05797 13.271 4.05797 12.8071 4.1802C12.3431 4.30242 11.9364 4.54075 11.5869 4.8952L6.47142 10.0835C5.89299 10.6702 5.50134 11.3577 5.29648 12.146C5.09162 12.9344 5.09162 13.7227 5.29648 14.511C5.50134 15.2994 5.89299 15.9869 6.47142 16.5735C7.04985 17.1602 7.7277 17.5544 8.50497 17.756C9.28224 17.9577 10.0595 17.9577 10.8368 17.756C11.614 17.5544 12.2919 17.1602 12.8703 16.5735L17.9678 11.3852L19.2512 12.6685L14.1356 17.8569C13.3283 18.6758 12.3763 19.2319 11.2796 19.5252C10.2071 19.8185 9.13462 19.8185 8.06211 19.5252C6.9655 19.2319 6.01048 18.6758 5.19706 17.8569C4.38364 17.038 3.83232 16.0724 3.54311 14.9602C3.26594 13.8724 3.26594 12.7846 3.54311 11.6969C3.83232 10.5846 4.38063 9.61297 5.18802 8.78186L10.3035 3.59353C10.882 3.00686 11.5598 2.61269 12.3371 2.41103C13.1144 2.20936 13.8916 2.20936 14.6689 2.41103C15.4462 2.61269 16.124 3.00686 16.7024 3.59353C17.2809 4.1802 17.6695 4.8677 17.8683 5.65603C18.0672 6.44436 18.0672 7.2327 17.8683 8.02103C17.6695 8.80936 17.2809 9.49686 16.7024 10.0835L11.5869 15.2719C11.2375 15.6263 10.8308 15.8646 10.3668 15.9869C9.90285 16.1091 9.4389 16.1091 8.97495 15.9869C8.511 15.8646 8.10429 15.6263 7.75482 15.2719C7.40535 14.9174 7.17036 14.5049 7.04985 14.0344C6.92935 13.5638 6.92935 13.0933 7.04985 12.6227C7.17036 12.1521 7.40535 11.7396 7.75482 11.3852L12.8703 6.19686L14.1356 7.49853Z" fill="#1D1D1F" fillOpacity="0.2" />
    </svg>
  );
}
function CheckIcon({ color }: { color: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M7.47435 11.0813L14.0983 4.36561L15.1063 5.40216L7.47435 13.1544L2.89515 8.49721L3.90315 7.47526L7.47435 11.0813Z" fill={color} />
    </svg>
  );
}
function QuoteIcon() {
  return (
    <svg width={9} height={10} viewBox="0 0 9 10" fill="none" aria-hidden>
      <path d="M8.87625 3V9.5C8.87625 9.64 8.82858 9.75833 8.73324 9.855C8.63791 9.95167 8.5212 10 8.38313 10H0.493125C0.35505 10 0.238344 9.95167 0.143006 9.855C0.0476687 9.75833 0 9.64 0 9.5V0.5C0 0.360001 0.0476687 0.241667 0.143006 0.145C0.238344 0.0483332 0.35505 0 0.493125 0H5.9175L8.87625 3ZM7.89 3.5H5.42438V1H0.98625V9H7.89V3.5ZM2.46563 2.5H3.945V3.5H2.46563V2.5ZM2.46563 4.5H6.41062V5.5H2.46563V4.5ZM2.46563 6.5H6.41062V7.5H2.46563V6.5Z" fill="#1D1D1F" fillOpacity="0.6" />
    </svg>
  );
}
function ChatBubbleIcon() {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M3.99968 0H5.99952C6.72613 0 7.39941 0.185875 8.01936 0.557624C8.61932 0.915855 9.09595 1.40251 9.44925 2.01758C9.81589 2.64618 9.99921 3.32716 9.99921 4.06051C9.99921 4.79387 9.81589 5.47485 9.44925 6.10345C9.09595 6.71852 8.61932 7.20518 8.01936 7.56341C7.39941 7.9284 6.72613 8.11089 5.99952 8.11089V9.88515C5.17292 9.55395 4.50964 9.26331 4.00968 9.01323C3.24308 8.63472 2.59313 8.23931 2.05984 7.82701C1.41989 7.3336 0.929926 6.79625 0.589953 6.21497C0.196651 5.55934 0 4.8395 0 4.05545C0 3.32547 0.183319 2.64618 0.549956 2.01758C0.903262 1.40251 1.37989 0.915855 1.97984 0.557624C2.59979 0.192634 3.27307 0.0101388 3.99968 0.0101388V0ZM4.9996 7.09703H5.99952C6.53948 7.10379 7.04278 6.96861 7.50941 6.69149C7.9627 6.42112 8.32267 6.05613 8.58932 5.59651C8.86263 5.12338 8.99929 4.61138 8.99929 4.06051C8.99929 3.50965 8.86263 2.99765 8.58932 2.52452C8.32267 2.0649 7.9627 1.69991 7.50941 1.42954C7.04278 1.15242 6.53948 1.01386 5.99952 1.01386H3.99968C3.45973 1.01386 2.95643 1.15242 2.4898 1.42954C2.03651 1.69991 1.67653 2.0649 1.40989 2.52452C1.13658 2.99765 0.999921 3.50796 0.999921 4.05545C0.999921 4.66376 1.13991 5.21125 1.41989 5.6979C1.69987 6.18455 2.1365 6.64755 2.72978 7.08689C3.29641 7.49919 4.05301 7.92164 4.9996 8.35422V7.09703Z" fill="#1D1D1F" fillOpacity="0.6" />
    </svg>
  );
}
function StatusIcon() {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M5.26658 1.01C5.1548 1.00333 5.04303 1 4.93125 1C4.21458 1 3.5505 1.18333 2.93903 1.55C2.34728 1.90333 1.87716 2.38 1.52869 2.98C1.16706 3.6 0.98625 4.27333 0.98625 5C0.98625 5.72667 1.16706 6.4 1.52869 7.02C1.87716 7.62 2.34728 8.09667 2.93903 8.45C3.5505 8.81667 4.21458 9 4.93125 9C5.64792 9 6.312 8.81667 6.92348 8.45C7.51523 8.09667 7.98534 7.62 8.33381 7.02C8.69544 6.4 8.87625 5.72667 8.87625 5C8.87625 4.88667 8.87296 4.77333 8.86639 4.66C8.82694 4.23333 8.72503 3.82667 8.56065 3.44L9.30034 2.69C9.47129 3.01 9.60279 3.34667 9.69484 3.7C9.77374 4.00667 9.82634 4.31667 9.85264 4.63C9.85921 4.75 9.8625 4.87333 9.8625 5C9.8625 5.68 9.73429 6.33 9.47786 6.95C9.22801 7.54333 8.87461 8.07167 8.41764 8.535C7.96068 8.99833 7.43961 9.35667 6.85444 9.61C6.24296 9.87 5.6019 10 4.93125 10C4.2606 10 3.61954 9.87 3.00806 9.61C2.42289 9.35667 1.90182 8.99833 1.44486 8.535C0.987894 8.07167 0.634488 7.54333 0.384638 6.95C0.128212 6.33 0 5.68 0 5C0 4.32 0.128212 3.67 0.384638 3.05C0.634488 2.45667 0.987894 1.92833 1.44486 1.465C1.90182 1.00167 2.42289 0.643333 3.00806 0.39C3.61954 0.13 4.2606 0 4.93125 0C5.05618 0 5.17781 0.00333309 5.29616 0.0100002C5.60519 0.0366669 5.90764 0.0900002 6.20351 0.17C6.55199 0.263333 6.88731 0.396667 7.20949 0.570001L6.4698 1.32C6.08845 1.15333 5.68738 1.05 5.26658 1.01ZM9.11295 0.0500002L9.81319 0.76L5.27644 5.35H4.58606V4.65L9.11295 0.0500002Z" fill="#1D1D1F" fillOpacity="0.6" />
    </svg>
  );
}
function CompareIcon() {
  return (
    <svg width={11} height={10} viewBox="0 0 11 10" fill="none" aria-hidden>
      <path d="M1.09615 2.77778H9.86539V1.11111H1.09615V2.77778ZM6.57692 8.88889V3.88889H4.38462V8.88889H6.57692ZM7.67308 8.88889H9.86539V3.88889H7.67308V8.88889ZM3.28846 8.88889V3.88889H1.09615V8.88889H3.28846ZM0.548077 0H10.4135C10.5669 0 10.6966 0.0537041 10.8026 0.161111C10.9086 0.268518 10.9615 0.4 10.9615 0.555556V9.44444C10.9615 9.6 10.9086 9.73148 10.8026 9.83889C10.6966 9.9463 10.5669 10 10.4135 10H0.548077C0.394615 10 0.264904 9.9463 0.158942 9.83889C0.0529808 9.73148 0 9.6 0 9.44444V0.555556C0 0.4 0.0529808 0.268518 0.158942 0.161111C0.264904 0.0537041 0.394615 0 0.548077 0Z" fill="white" />
    </svg>
  );
}
function BackArrowIcon() {
  return (
    <svg width={9} height={9} viewBox="0 0 9 9" fill="none" aria-hidden>
      <path d="M2.14855 3.86583H8.99918V5.00608H2.14855L5.17453 8.06194L4.37585 8.87152L0 4.43596L4.37585 0.000397495L5.17453 0.809972L2.14855 3.86583Z" fill="#1D1D1F" fillOpacity="0.5" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width={16} height={15} viewBox="0 0 16 15" fill="none" aria-hidden>
      <path d="M1.45453 13.1229V3.31637C1.45453 3.15907 1.49817 3.01652 1.58544 2.88872C1.67271 2.76091 1.78907 2.67243 1.93453 2.62328L8.95991 0.0278744C9.05688 -0.01145 9.15142 -0.00899139 9.24354 0.0352482C9.33566 0.0794877 9.39627 0.150763 9.42536 0.249074C9.44475 0.288398 9.45445 0.327723 9.45445 0.367046V4.0242L14.0508 5.5726C14.1962 5.62175 14.315 5.71269 14.4071 5.84541C14.4992 5.97813 14.5453 6.12314 14.5453 6.28044V13.1229H15.9998V14.5975H0V13.1229H1.45453ZM2.90906 13.1229H7.99992V1.94493L2.90906 3.8325V13.1229ZM13.0908 13.1229V6.81131L9.45445 5.5726V13.1229H13.0908Z" fill="#1E3A5F" />
    </svg>
  );
}
function FileJpgIcon() {
  return (
    <svg width={15} height={17} viewBox="0 0 15 17" fill="none" aria-hidden>
      <path d="M5.00005 -0.000338956H14.1668C14.4002 -0.000338956 14.5974 0.0813514 14.7585 0.24473C14.9196 0.408108 15.0002 0.608105 15.0002 0.844722V16.0558C15.0002 16.2924 14.9196 16.4924 14.7585 16.6558C14.5974 16.8192 14.4002 16.9009 14.1668 16.9009H0.833342C0.600006 16.9009 0.402782 16.8192 0.241669 16.6558C0.0805564 16.4924 0 16.2924 0 16.0558V5.07003L5.00005 -0.000338956ZM2.35003 5.07003H5.00005V2.39963L2.35003 5.07003ZM6.66674 1.68978V5.91509C6.66674 6.1517 6.58618 6.3517 6.42507 6.51508C6.26396 6.67846 6.06673 6.76015 5.8334 6.76015H1.66668V15.2108H13.3335V1.68978H6.66674Z" fill="white" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width={13} height={14} viewBox="0 0 13 14" fill="none" aria-hidden>
      <path d="M0 12.449H13.001V13.9135H0V12.449ZM7.22276 8.18713L11.6142 3.73492L12.6254 4.77475L6.50048 10.9844L0.375583 4.77475L1.38677 3.73492L5.77821 8.18713V0.000334655H7.22276V8.18713Z" fill="white" fillOpacity="0.6" />
    </svg>
  );
}
function AttachChatIcon() {
  return (
    <svg width={14} height={17} viewBox="0 0 14 17" fill="none" aria-hidden>
      <path d="M8.23473 9.60277V5.00998C8.23473 4.40874 8.0865 3.85204 7.79005 3.33988C7.4936 2.82771 7.09285 2.42132 6.58778 2.1207C6.08272 1.82008 5.53374 1.66977 4.94084 1.66977C4.34794 1.66977 3.79895 1.82008 3.29389 2.1207C2.78883 2.42132 2.38807 2.82771 2.09162 3.33988C1.79517 3.85204 1.64695 4.40874 1.64695 5.00998V9.60277C1.64695 10.5826 1.8885 11.4956 2.3716 12.3417C2.84373 13.1657 3.48603 13.817 4.29853 14.2958C5.13298 14.7857 6.03331 15.0306 6.99952 15.0306C7.96573 15.0306 8.86606 14.7857 9.70051 14.2958C10.513 13.817 11.1553 13.1657 11.6274 12.3417C12.1105 11.4956 12.3521 10.5826 12.3521 9.60277V1.66977H13.999V9.60277C13.999 10.8832 13.6806 12.0801 13.0438 13.1935C12.4289 14.2624 11.5945 15.1085 10.5405 15.7321C9.44249 16.3778 8.26218 16.7007 6.99952 16.7007C5.73686 16.7007 4.55655 16.3778 3.45859 15.7321C2.40454 15.1085 1.57009 14.2624 0.955228 13.1935C0.318409 12.0801 0 10.8832 0 9.60277V5.00998C0 4.10812 0.225083 3.2675 0.675248 2.48812C1.11443 1.73101 1.70733 1.12977 2.45395 0.684409C3.22252 0.227913 4.05149 -0.000334941 4.94084 -0.000334941C5.83019 -0.000334941 6.65915 0.227913 7.42772 0.684409C8.17434 1.12977 8.76724 1.73101 9.20643 2.48812C9.65659 3.2675 9.88167 4.10812 9.88167 5.00998V9.60277C9.88167 10.1372 9.75266 10.6271 9.49464 11.0725C9.23662 11.5178 8.88802 11.8713 8.44883 12.133C8.00964 12.3946 7.52654 12.5255 6.99952 12.5255C6.4725 12.5255 5.98939 12.3946 5.55021 12.133C5.11102 11.8713 4.76242 11.5178 4.5044 11.0725C4.24637 10.6271 4.11736 10.1372 4.11736 9.60277V5.00998H5.76431V9.60277C5.76431 9.94792 5.88509 10.243 6.12664 10.4879C6.36819 10.7329 6.65915 10.8553 6.99952 10.8553C7.33989 10.8553 7.63085 10.7329 7.8724 10.4879C8.11395 10.243 8.23473 9.94792 8.23473 9.60277Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M0.27846 5.24513C0.09282 5.17579 0 5.09654 0 5.00739C0 4.91824 0.0977053 4.83899 0.293116 4.76965L14.2747 0.0446104C14.4702 -0.0247297 14.6167 -0.0123474 14.7144 0.0817572C14.8121 0.175862 14.8317 0.321971 14.773 0.520086L10.7867 14.6952C10.728 14.8933 10.6499 14.9949 10.5522 14.9998C10.4545 15.0048 10.3665 14.9131 10.2884 14.7249L7.65032 8.72204L12.0471 2.7786L6.18474 7.23618L0.27846 5.24513Z" fill="white" />
    </svg>
  );
}
