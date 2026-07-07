"use client";

import { useEffect, useState } from "react";
import { RichEditor } from "@/app/community/new/rich-editor";

type TermRow = { id: string; title: string };
type TermDetail = {
  id: string;
  type: string;
  title: string;
  summary: string | null;
  content: string;
  contentHtml: string | null;
  required: boolean;
  version: string;
};

const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", color: "#1D1D1F" };
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "49.25px",
  padding: "0 20.52px",
  borderRadius: "14.64px",
  background: "#fff",
  border: "1px solid rgba(210,210,215,0.3)",
  outline: "none",
  fontSize: "14px",
  fontWeight: 400,
  letterSpacing: "-0.2928px",
  color: "#1D1D1F",
};

export function TermsView({ terms }: { terms: TermRow[] }) {
  const [list, setList] = useState(terms);
  const [selectedId, setSelectedId] = useState<string | null>(terms[0]?.id ?? null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setLoaded(false);
    setMessage(null);
    (async () => {
      const res = await fetch(`/api/admin/terms/${selectedId}`, { cache: "no-store" });
      if (!active) return;
      if (!res.ok) {
        setMessage("불러오지 못했어요");
        return;
      }
      const d: TermDetail = await res.json();
      if (!active) return;
      setTitle(d.title);
      setSummary(d.summary ?? "");
      setContentHtml(d.contentHtml ?? "");
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [selectedId]);

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/terms/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, contentHtml }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setMessage(e.message ?? "저장에 실패했어요");
        return;
      }
      setList((prev) => prev.map((t) => (t.id === selectedId ? { ...t, title, summary } : t)));
      setMessage("저장되었습니다");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: "24.4px", fontWeight: 700, letterSpacing: "-0.61px", color: "#111827" }}>약관 관리</h1>
      <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#9CA3AF", letterSpacing: "-0.195px" }}>
        약관 내용을 리치텍스트로 수정하면 공개 약관 화면에 즉시 반영됩니다.
      </p>

      <div className="flex" style={{ gap: "24.4px", marginTop: "24.4px", alignItems: "flex-start" }}>
        <div style={{ width: "300px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "9.76px" }}>
          {list.map((t) => {
            const active = t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                style={{
                  textAlign: "left",
                  padding: "16px 18px",
                  borderRadius: "14.64px",
                  cursor: "pointer",
                  background: active ? "#F3F4F6" : "#fff",
                  border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.4)",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1D1D1F", letterSpacing: "-0.2px" }}>{t.title}</p>
              </button>
            );
          })}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            borderRadius: "19.52px",
            border: "1px solid rgba(210,210,215,0.4)",
            background: "#fff",
            padding: "24.4px",
          }}
        >
          <div>
            <p style={{ ...labelStyle, margin: "0 0 9.76px" }}>
              제목 <span style={{ color: "#F87171" }}>*</span>
            </p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="약관 제목" style={inputStyle} />
          </div>

          <div style={{ marginTop: "20px" }}>
            <p style={{ ...labelStyle, margin: "0 0 9.76px" }}>요약</p>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="약관 요약 (동의 화면 안내 문구)"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <p style={{ ...labelStyle, margin: "0 0 9.76px" }}>
              내용 <span style={{ color: "#F87171" }}>*</span>
            </p>
            {loaded ? (
              <RichEditor
                key={selectedId ?? "none"}
                initialHTML={contentHtml}
                onChange={setContentHtml}
                placeholder="약관 내용을 입력하세요"
                minHeight={495}
              />
            ) : (
              <div style={{ height: "551px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)" }} />
            )}
          </div>

          <div className="flex" style={{ marginTop: "24.4px", gap: "12px", alignItems: "center" }}>
            <button
              type="button"
              onClick={save}
              disabled={saving || !loaded}
              style={{
                padding: "14px 28px",
                borderRadius: "14.64px",
                background: "#1E3A5F",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: saving || !loaded ? "default" : "pointer",
                opacity: saving || !loaded ? 0.6 : 1,
              }}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
            {message && (
              <span style={{ fontSize: "13px", color: message === "저장되었습니다" ? "#047857" : "#DC2626" }}>{message}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
