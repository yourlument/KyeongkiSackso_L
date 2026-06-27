"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { uploadFile } from "@/lib/upload-client";
import { CATEGORIES, CATEGORY_DESC, type Category } from "../data";
import { BreadcrumbBackIcon, PaperclipIcon, UploadIcon, CheckIcon } from "../info-icons";

const NAVY = "#1E3A5F";

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: "23.4px",
  letterSpacing: "-0.195px",
  color: "rgba(29,29,31,0.5)",
};
const inputBaseStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "14.64px",
  background: "#fff",
  padding: "15.625px 20.52px",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "24.5px",
  letterSpacing: "-0.2928px",
  color: "#1D1D1F",
  outline: "none",
};
const helperStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: "21.6px",
  letterSpacing: "-0.18px",
  color: "rgba(29,29,31,0.3)",
};
const inputClass = "placeholder:text-[#1d1d1f]/30 placeholder:font-medium";
const reqStar = <span style={{ color: "#F87171" }}>*</span>;

function inputBorder(error: boolean): string {
  return error ? "1px solid #F87171" : "1px solid rgba(210,210,215,0.4)";
}

export default function InfoNewPage() {
  const router = useRouter();
  const attachRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachFiles, setAttachFiles] = useState<string[]>([]);
  const [attachFileObjs, setAttachFileObjs] = useState<File[]>([]);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errTitle = !title.trim();
  const errContent = !content.trim();

  async function handleSubmit() {
    setTried(true);
    if (errTitle || errContent || submitting) return;
    setSubmitting(true);
    try {
      const attachments = attachFileObjs.length
        ? await Promise.all(attachFileObjs.map(async (f) => {
            const saved = await uploadFile(f);
            return { url: saved.url, name: saved.name };
          }))
        : [];

      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, content, attachments }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        alert(d.error ?? "저장 중 오류가 발생했습니다");
        return;
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/info/${id}`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pt-[58.56px] pb-[78.08px]">
          <div style={{ maxWidth: "996px", margin: "0 auto" }}>
            <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "39.04px" }}>
              <a href="/info" className="flex items-center" style={{ gap: "4.88px", textDecoration: "none", color: "rgba(29,29,31,0.4)" }}>
                <BreadcrumbBackIcon />
                <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.4)" }}>
                  정보 공유 라운지
                </span>
              </a>
              <span style={{ fontSize: "19.52px", fontWeight: 400, lineHeight: "35.136px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.2)" }}>/</span>
              <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "#1D1D1F" }}>
                글쓰기
              </span>
            </div>

            <div style={{ marginBottom: "29.28px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: "27.5px", letterSpacing: "-0.55px", color: "#1D1D1F", margin: 0 }}>
                글쓰기
              </h1>
              <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
                익명으로 작성됩니다
              </p>
            </div>

            <div>
              <div>
                <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>카테고리</label>
                <div className="flex flex-wrap items-center" style={{ gap: "9.76px" }}>
                  {CATEGORIES.map((c) => {
                    const active = c === category;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        style={{ borderRadius: "9999px", padding: "9.76px 19.52px", border: "none", cursor: "pointer", background: active ? "#1D1D1F" : "transparent", color: active ? "#fff" : "rgba(29,29,31,0.5)", fontSize: "13px", fontWeight: 500, lineHeight: "22.75px", letterSpacing: "-0.293px", whiteSpace: "nowrap" }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <p style={{ ...helperStyle, marginTop: "9.76px" }}>{CATEGORY_DESC[category]}</p>
              </div>

              <div style={{ marginTop: "29.28px" }}>
                <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>제목 {reqStar}</label>
                <input
                  type="text"
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  style={{ ...inputBaseStyle, border: inputBorder(tried && errTitle) }}
                />
              </div>

              <div style={{ marginTop: "29.28px" }}>
                <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>내용 {reqStar}</label>
                <textarea
                  className={inputClass}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  style={{ ...inputBaseStyle, minHeight: "240px", resize: "vertical", lineHeight: "24.375px", border: inputBorder(tried && errContent) }}
                />
              </div>

              <div style={{ marginTop: "29.28px" }}>
                <label className="flex items-center" style={{ ...labelStyle, marginBottom: "9.76px" }}>
                  <span style={{ display: "inline-flex", marginRight: "7.32px", color: "rgba(29,29,31,0.5)" }}>
                    <PaperclipIcon />
                  </span>
                  첨부파일
                </label>
                <div className="flex items-center" style={{ gap: "14.64px" }}>
                  <button
                    type="button"
                    onClick={() => attachRef.current?.click()}
                    className="flex items-center"
                    style={{ flexShrink: 0, gap: "7.32px", borderRadius: "14.64px", border: "1px dashed rgba(210,210,215,0.4)", background: "#fff", padding: "13.2px 20.52px", cursor: "pointer", color: "rgba(29,29,31,0.5)" }}
                  >
                    <UploadIcon />
                    <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.5)", whiteSpace: "nowrap" }}>
                      파일 선택
                    </span>
                    <input
                      ref={attachRef}
                      type="file"
                      multiple
                      hidden
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        setAttachFiles(files.map((f) => f.name));
                        setAttachFileObjs(files);
                      }}
                    />
                  </button>
                  <span style={helperStyle}>최대 10개</span>
                </div>
                {attachFiles.length > 0 && (
                  <div style={{ marginTop: "14.64px", display: "flex", flexDirection: "column", gap: "4.88px" }}>
                    {attachFiles.map((name, i) => (
                      <span key={i} style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "#1D1D1F" }}>
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center" style={{ marginTop: "29.28px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.1)", gap: "14.64px" }}>
                <a
                  href="/info"
                  className="flex items-center"
                  style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", padding: "15.64px 30.28px", fontSize: "14px", fontWeight: 400, lineHeight: "24.5px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)", textDecoration: "none" }}
                >
                  취소
                </a>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center"
                  style={{ gap: "9.76px", borderRadius: "14.64px", background: NAVY, border: "none", cursor: submitting ? "default" : "pointer", padding: "14.64px 39.04px", opacity: submitting ? 0.6 : 1, color: "#fff" }}
                >
                  <CheckIcon />
                  <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: "24.5px", letterSpacing: "-0.2928px", color: "#fff", whiteSpace: "nowrap" }}>
                    등록
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
