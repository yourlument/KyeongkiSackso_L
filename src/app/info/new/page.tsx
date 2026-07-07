"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { uploadFile } from "@/lib/upload-client";
import { RichEditor } from "@/app/community/new/rich-editor";
import { CATEGORIES, CATEGORY_DESC, type Category } from "../data";
import { BreadcrumbBackIcon, PaperclipIcon, UploadIcon, CheckIcon, VideoIcon, LinkIcon, ChevronDownIcon } from "../info-icons";

const NAVY = "#1E3A5F";
const EDITOR_PLACEHOLDER = "내용을 입력하세요. 이미지를 드래그하거나 붙여넣기할 수 있습니다.";

function htmlHasContent(html: string): boolean {
  if (/<img\b/i.test(html)) return true;
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length > 0;
}

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
  const videoFileRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [videoMode, setVideoMode] = useState<"url" | "file">("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoFileObj, setVideoFileObj] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [attachFiles, setAttachFiles] = useState<string[]>([]);
  const [attachFileObjs, setAttachFileObjs] = useState<File[]>([]);
  const [tried, setTried] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errTitle = !title.trim();
  const errContent = !htmlHasContent(content);

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

      let finalVideoUrl = videoUrl.trim();
      if (videoMode === "file" && videoFileObj) {
        const saved = await uploadFile(videoFileObj);
        finalVideoUrl = saved.url;
      }

      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, content, videoUrl: finalVideoUrl || null, attachments }),
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
          <div style={{ maxWidth: "995.52px", margin: "0 auto" }}>
            <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "39.04px" }}>
              <a href="/info" className="flex items-center" style={{ gap: "4.88px", textDecoration: "none", color: "rgba(29,29,31,0.4)" }}>
                <BreadcrumbBackIcon />
                <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.4)" }}>
                  정보 공유 라운지
                </span>
              </a>
              <span style={{ fontSize: "19.52px", fontWeight: 400, lineHeight: "35.136px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.2)" }}>/</span>
              <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "#1D1D1F" }}>
                새 글 작성
              </span>
            </div>

            <div style={{ marginBottom: "29.28px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: "27.5px", letterSpacing: "-0.55px", color: "#1D1D1F", margin: 0 }}>
                새 글 작성
              </h1>
              <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
                익명으로 작성됩니다
              </p>
            </div>

            <div>
              <div>
                <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>게시판 카테고리</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="appearance-none"
                    style={{ ...inputBaseStyle, border: inputBorder(false), paddingRight: "44px", cursor: "pointer", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: "20.52px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(29,29,31,0.4)", display: "inline-flex" }}>
                    <ChevronDownIcon />
                  </span>
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
                {tried && errTitle && <ErrorLine text="제목을 입력하세요" />}
              </div>

              <div style={{ marginTop: "29.28px" }}>
                <label className="flex items-center" style={{ ...labelStyle, marginBottom: "9.76px" }}>
                  <span style={{ display: "inline-flex", marginRight: "7.32px", color: "rgba(29,29,31,0.5)" }}>
                    <VideoIcon />
                  </span>
                  동영상 첨부
                </label>

                <div className="flex" style={{ width: "242.92px", borderRadius: "14.64px", background: "#F5F5F7", padding: "4.88px", gap: "2.44px", marginBottom: "14.64px" }}>
                  <VideoToggleBtn label="URL 입력" icon={<LinkIcon />} active={videoMode === "url"} onClick={() => setVideoMode("url")} />
                  <VideoToggleBtn label="파일 업로드" icon={<UploadIcon />} active={videoMode === "file"} onClick={() => setVideoMode("file")} />
                </div>

                {videoMode === "url" ? (
                  <>
                    <input
                      type="text"
                      className={inputClass}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="YouTube 또는 동영상 URL을 입력하세요 (선택사항)"
                      style={{ ...inputBaseStyle, border: inputBorder(false) }}
                    />
                    <p style={{ ...helperStyle, marginTop: "7.32px" }}>
                      YouTube URL 입력 시 게시글 상단에 동영상이 노출됩니다. (예: https://www.youtube.com/embed/...)
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoFileRef.current?.click()}
                    className="flex items-center"
                    style={{ width: "100%", boxSizing: "border-box", borderRadius: "14.64px", border: "1px dashed rgba(210,210,215,0.4)", background: "#fff", padding: "15.64px 20.52px", cursor: "pointer", textAlign: "left" }}
                  >
                    <span style={{ display: "inline-flex", marginRight: "7.32px", color: "rgba(29,29,31,0.4)" }}>
                      <UploadIcon />
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: videoFile ? "#1D1D1F" : "rgba(29,29,31,0.4)" }}>
                      {videoFile ?? "동영상 파일 선택 (MP4, WebM, MOV, AVI, MKV / 최대 200MB)"}
                    </span>
                    <input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setVideoFile(f?.name ?? null);
                        setVideoFileObj(f);
                      }}
                    />
                  </button>
                )}
              </div>

              <div style={{ marginTop: "29.28px" }}>
                <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>내용 {reqStar}</label>
                <RichEditor
                  initialHTML=""
                  onChange={setContent}
                  error={tried && errContent}
                  placeholder={EDITOR_PLACEHOLDER}
                  minHeight={520}
                />
                {tried && errContent && <ErrorLine text="내용을 입력하세요" />}
                <p style={{ ...helperStyle, marginTop: "9.76px" }}>
                  이미지는 에디터에 직접 드래그 앤 드롭하거나 붙여넣기로 삽입할 수 있습니다. (Base64 저장)
                </p>
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
                  <span style={helperStyle}>최대 10개, 파일당 50MB (PDF, HWP, Excel, Word, PPT, ZIP, 이미지, TXT, DWG)</span>
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

function VideoToggleBtn({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center"
      style={{ borderRadius: "9.76px", padding: "9.76px 19.52px", border: "none", cursor: "pointer", background: active ? "#fff" : "transparent", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none", color: active ? "#1D1D1F" : "rgba(29,29,31,0.5)" }}
    >
      <span style={{ display: "inline-flex", marginRight: "4.88px" }}>{icon}</span>
      <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: active ? "#1D1D1F" : "rgba(29,29,31,0.5)", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </button>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <div className="flex items-center" style={{ gap: "4.88px", marginTop: "7.32px" }}>
      <AlertCircleIcon />
      <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "#EF4444" }}>{text}</span>
    </div>
  );
}

function AlertCircleIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 10 10" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M4.93125 10C4.2606 10 3.61954 9.87 3.00806 9.61C2.42289 9.35667 1.90182 8.99833 1.44486 8.535C0.987894 8.07167 0.634488 7.54333 0.384638 6.95C0.128212 6.33 0 5.68 0 5C0 4.32 0.128212 3.67 0.384638 3.05C0.634488 2.45667 0.987894 1.92833 1.44486 1.465C1.90182 1.00167 2.42289 0.643333 3.00806 0.39C3.61954 0.13 4.2606 0 4.93125 0C5.6019 0 6.24296 0.13 6.85444 0.39C7.43961 0.643333 7.96068 1.00167 8.41764 1.465C8.87461 1.92833 9.22801 2.45667 9.47786 3.05C9.73429 3.67 9.8625 4.32 9.8625 5C9.8625 5.68 9.73429 6.33 9.47786 6.95C9.22801 7.54333 8.87461 8.07167 8.41764 8.535C7.96068 8.99833 7.43961 9.35667 6.85444 9.61C6.24296 9.87 5.6019 10 4.93125 10ZM4.93125 9C5.64792 9 6.312 8.81667 6.92348 8.45C7.51523 8.09667 7.98534 7.62 8.33381 7.02C8.69544 6.4 8.87625 5.72667 8.87625 5C8.87625 4.27333 8.69544 3.6 8.33381 2.98C7.98534 2.38 7.51523 1.90333 6.92348 1.55C6.312 1.18333 5.64792 1 4.93125 1C4.21458 1 3.5505 1.18333 2.93903 1.55C2.34728 1.90333 1.87716 2.38 1.52869 2.98C1.16706 3.6 0.98625 4.27333 0.98625 5C0.98625 5.72667 1.16706 6.4 1.52869 7.02C1.87716 7.62 2.34728 8.09667 2.93903 8.45C3.5505 8.81667 4.21458 9 4.93125 9ZM4.43813 6.5H5.42438V7.5H4.43813V6.5ZM4.43813 2.5H5.42438V5.5H4.43813V2.5Z" fill="#EF4444" />
    </svg>
  );
}
