"use client";

import { useState } from "react";
import {
  CHAT_THREADS,
  CHAT_MESSAGES,
  CHAT_SYSTEM_NOTE,
  type ChatThread,
} from "../quotes-data";
import {
  PersonIcon,
  EmptyChatIcon,
  ChatAttachIcon,
  SendIcon,
  ViewNoticeIcon,
} from "./chat-icons";

const NAVY = "#1E3A5F";

export function QuoteChatView() {
  const [selected, setSelected] = useState<string | null>(CHAT_THREADS[0]?.id ?? null);
  const active = CHAT_THREADS.find((t) => t.id === selected) ?? null;

  return (
    <div className="flex" style={{ height: "100vh", background: "#fff", overflow: "hidden" }}>

      <div className="flex flex-col" style={{ width: "351px", flexShrink: 0, borderRight: "1px solid rgba(210,210,215,0.2)" }}>
        <div style={{ padding: "19.52px 24.4px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: "#1D1D1F", margin: 0 }}>대화 목록</p>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "2.44px 0 0" }}>공무원과의 1:1 상담</p>
        </div>
        <div className="flex-1" style={{ overflowY: "auto" }}>
          {CHAT_THREADS.map((t) => (
            <ThreadItem key={t.id} thread={t} active={t.id === selected} onClick={() => setSelected(t.id)} />
          ))}
        </div>
      </div>

      {active ? <ChatRoom thread={active} /> : <EmptyState />}
    </div>
  );
}

function ThreadItem({ thread, active, onClick }: { thread: ChatThread; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left"
      style={{ padding: "17.08px 24.4px 18.08px 28.4px", border: "none", cursor: "pointer", background: active ? "rgba(30,58,95,0.05)" : "transparent" }}
    >
      <div className="flex items-center justify-between" style={{ paddingBottom: "4.88px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: active ? NAVY : "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{thread.title}</span>
        {thread.unread > 0 && (
          <span className="inline-flex items-center justify-center" style={{ width: "24px", height: "24px", flexShrink: 0, marginLeft: "4.88px", borderRadius: "9999px", background: NAVY, fontSize: "10px", fontWeight: 700, lineHeight: "18px", letterSpacing: "-0.15px", color: "#fff" }}>{thread.unread}</span>
        )}
      </div>
      <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{thread.preview}</p>
      <div className="flex items-center justify-between" style={{ marginTop: "4.88px" }}>
        <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)" }}>{thread.org}</span>
        <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.2)" }}>{thread.time}</span>
      </div>
    </button>
  );
}

function ChatRoom({ thread }: { thread: ChatThread }) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim() !== "";
  return (
    <div className="flex flex-col flex-1 min-w-0" style={{ background: "#fff" }}>

      <div className="flex items-center" style={{ gap: "14.64px", padding: "19.52px 24.4px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.15)" }}>
        <span className="inline-flex items-center justify-center" style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "9999px", background: "rgba(30,58,95,0.1)" }}>
          <PersonIcon opacity={1} />
        </span>
        <div className="min-w-0">
          <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F", margin: 0 }}>{thread.buyerName}</p>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{thread.buyerDept} · {thread.buyerPhone}</p>
        </div>
        <button type="button" className="inline-flex items-center justify-center" style={{ gap: "4.88px", marginLeft: "auto", flexShrink: 0, borderRadius: "9.76px", border: "1px solid rgba(210,210,215,0.3)", background: "none", padding: "8.32px 15.64px", cursor: "pointer" }}>
          <ViewNoticeIcon />
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "21px", color: "rgba(29,29,31,0.6)" }}>공고 보기</span>
        </button>
      </div>

      <div className="flex-1" style={{ overflowY: "auto", padding: "19.52px" }}>

        <div className="flex">
          <span style={{ borderRadius: "9999px", border: "1px solid rgba(210,210,215,0.2)", background: "rgba(29,29,31,0.02)", padding: "5.88px 15.64px", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{CHAT_SYSTEM_NOTE}</span>
        </div>
        {CHAT_MESSAGES.map((m, i) => (
          <div key={i} className="flex" style={{ justifyContent: m.mine ? "flex-end" : "flex-start", gap: "9.76px", marginTop: "19.52px" }}>
            {!m.mine && (
              <span className="inline-flex items-center justify-center" style={{ width: "34px", height: "34px", flexShrink: 0, borderRadius: "9999px", background: "rgba(30,58,95,0.1)" }}>
                <PersonIcon opacity={1} style={{ width: "9px", height: "11px" }} />
              </span>
            )}
            <div style={{ maxWidth: m.mine ? "530px" : "517px" }}>
              {!m.mine && <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 2.44px 4.88px" }}>{thread.buyerName} {thread.buyerDept}</p>}
              <div
                style={{
                  padding: "12.2px 19.52px",
                  background: m.mine ? NAVY : "rgba(29,29,31,0.05)",
                  borderRadius: m.mine ? "19.52px 19.52px 7.32px 19.52px" : "19.52px 19.52px 19.52px 7.32px",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: m.mine ? "#fff" : "#1D1D1F", margin: 0 }}>{m.text}</p>
              </div>
              <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)", margin: "2.44px 4.88px 0", textAlign: m.mine ? "right" : "left" }}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "15.64px 14.64px", borderTop: "1px solid rgba(210,210,215,0.15)" }}>
        <div className="flex items-center" style={{ gap: "9.76px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", background: "rgba(29,29,31,0.02)", padding: "1px 15.64px" }}>
          <button type="button" aria-label="첨부" className="inline-flex items-center justify-center" style={{ width: "34px", height: "34px", flexShrink: 0, border: "none", background: "none", cursor: "pointer" }}>
            <ChatAttachIcon />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 placeholder:text-[#1d1d1f]/30 placeholder:font-medium"
            style={{ border: "none", outline: "none", background: "transparent", padding: "14.62px 0", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#1D1D1F" }}
          />
          <button type="button" disabled={!canSend} aria-label="전송" className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", border: "none", flexShrink: 0, cursor: canSend ? "pointer" : "default", background: canSend ? NAVY : "rgba(30,58,95,0.3)" }}>
            <SendIcon opacity={canSend ? 1 : 0.3} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center" style={{ background: "#fff" }}>
      <span className="inline-flex items-center justify-center" style={{ width: "68px", height: "68px", borderRadius: "19.52px", background: "rgba(30,58,95,0.05)", marginBottom: "19.52px" }}>
        <EmptyChatIcon />
      </span>
      <p style={{ fontSize: "15px", fontWeight: 500, letterSpacing: "-0.225px", lineHeight: "27px", color: "rgba(29,29,31,0.6)", margin: 0 }}>대화를 선택하세요</p>
      <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.3)", margin: "4.88px 0 0" }}>공고 제안 후 자동으로 대화방이 생성됩니다</p>
    </div>
  );
}
