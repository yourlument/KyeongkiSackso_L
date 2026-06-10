"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "./rich-editor";

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
const reqStar = <span style={{ color: "#F87171" }}>*</span>;

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
const inputClass = "placeholder:text-[#1d1d1f]/30 placeholder:font-medium";

function inputBorder(error: boolean): string {
  return error ? "1px solid #F87171" : "1px solid rgba(210,210,215,0.4)";
}

const helperStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: "21.6px",
  letterSpacing: "-0.18px",
  color: "rgba(29,29,31,0.3)",
};

export function DemandForm({ initial }: { initial?: { title: string; content: string; videoUrl: string } } = {}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [videoMode, setVideoMode] = useState<"url" | "file">("url");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [attachFiles, setAttachFiles] = useState<string[]>([]);
  const [tried, setTried] = useState(false);

  const videoFileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);

  const errTitle = !title.trim();
  const errContent = !htmlHasContent(content);

  function handleSubmit() {
    setTried(true);
    if (errTitle || errContent) return;

    router.push("/community");
  }

  return (
    <div style={{ maxWidth: "996px", margin: "0 auto" }}>

      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "39.04px" }}>
        <a
          href="/community"
          className="flex items-center"
          style={{ gap: "4.88px", textDecoration: "none" }}
        >
          <BackIcon />
          <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.4)" }}>
            미등록 수요 게시판
          </span>
        </a>
        <span style={{ fontSize: "19.52px", fontWeight: 400, lineHeight: "35.136px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.2)" }}>/</span>
        <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "#1D1D1F" }}>
          수요 등록
        </span>
      </div>

      <div style={{ marginBottom: "29.28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: "27.5px", letterSpacing: "-0.55px", color: "#1D1D1F", margin: 0 }}>
          수요 등록
        </h1>
        <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
          조달 목록에 없는 품목을 등록하고 업체로부터 제안을 받아보세요
        </p>
      </div>

      <div>

        <div>
          <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>
            제목 {reqStar}
          </label>
          <input
            type="text"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="수요 제목을 입력하세요"
            style={{ ...inputBaseStyle, border: inputBorder(tried && errTitle) }}
          />
          {tried && errTitle && <ErrorLine text="제목을 입력하세요" />}
        </div>

        <div style={{ marginTop: "29.28px" }}>
          <label className="flex items-center" style={{ ...labelStyle, marginBottom: "9.76px" }}>
            <span style={{ display: "inline-flex", marginRight: "7.32px" }}>
              <VideoIcon />
            </span>
            동영상 첨부
          </label>

          <div
            className="flex"
            style={{ width: "243px", borderRadius: "14.64px", background: "#F5F5F7", padding: "4.88px", gap: "2.44px", marginBottom: "14.64px" }}
          >
            <VideoToggleBtn label="URL 입력" icon={<LinkIcon active={videoMode === "url"} />} active={videoMode === "url"} onClick={() => setVideoMode("url")} />
            <VideoToggleBtn label="파일 업로드" icon={<UploadIcon active={videoMode === "file"} />} active={videoMode === "file"} onClick={() => setVideoMode("file")} />
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
              <span style={{ display: "inline-flex", marginRight: "7.32px" }}>
                <UploadIcon dim />
              </span>
              <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: videoFile ? "#1D1D1F" : "rgba(29,29,31,0.4)" }}>
                {videoFile ?? "동영상 파일 선택 (MP4, WebM, MOV, AVI, MKV / 최대 200MB)"}
              </span>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => setVideoFile(e.target.files?.[0]?.name ?? null)}
              />
            </button>
          )}
        </div>

        <div style={{ marginTop: "29.28px" }}>
          <label className="block" style={{ ...labelStyle, marginBottom: "9.76px" }}>
            내용 {reqStar}
          </label>
          <RichEditor
            initialHTML={initial?.content ?? ""}
            onChange={setContent}
            error={tried && errContent}
          />
          {tried && errContent && <ErrorLine text="내용을 입력하세요" />}
          <p style={{ ...helperStyle, marginTop: "9.76px" }}>
            이미지는 에디터에 직접 드래그 앤 드롭하거나 붙여넣기로 삽입할 수 있습니다. (Base64 저장)
          </p>
        </div>

        <div style={{ marginTop: "29.28px" }}>
          <label className="flex items-center" style={{ ...labelStyle, marginBottom: "9.76px" }}>
            <span style={{ display: "inline-flex", marginRight: "7.32px" }}>
              <ClipIcon />
            </span>
            첨부파일
          </label>
          <div className="flex items-center" style={{ gap: "14.64px" }}>
            <button
              type="button"
              onClick={() => attachRef.current?.click()}
              className="flex items-center"
              style={{ flexShrink: 0, gap: "7.32px", borderRadius: "14.64px", border: "1px dashed rgba(210,210,215,0.4)", background: "#fff", padding: "13.2px 20.52px", cursor: "pointer" }}
            >
              <UploadIcon dim />
              <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.5)", whiteSpace: "nowrap" }}>
                파일 선택
              </span>
              <input
                ref={attachRef}
                type="file"
                multiple
                hidden
                onChange={(e) => setAttachFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
              />
            </button>
            <span style={helperStyle}>
              최대 10개, 파일당 50MB (PDF, HWP, Excel, Word, PPT, ZIP, 이미지, TXT, DWG)
            </span>
          </div>
          {attachFiles.length > 0 && (
            <div style={{ marginTop: "14.64px", display: "flex", flexDirection: "column", gap: "4.88px" }}>
              {attachFiles.map((name, i) => (
                <span
                  key={i}
                  style={{ fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "#1D1D1F" }}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex items-center"
          style={{ marginTop: "29.28px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.1)", gap: "14.64px" }}
        >
          <a
            href="/community"
            className="flex items-center"
            style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", padding: "15.64px 30.28px", fontSize: "14px", fontWeight: 400, lineHeight: "24.5px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)", textDecoration: "none" }}
          >
            취소
          </a>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center"
            style={{ gap: "9.76px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", cursor: "pointer", padding: "14.64px 39.04px" }}
          >
            <CheckIcon />
            <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: "24.5px", letterSpacing: "-0.2928px", color: "#fff", whiteSpace: "nowrap" }}>
              등록
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoToggleBtn({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center"
      style={{ borderRadius: "9.76px", padding: "9.76px 19.52px", border: "none", cursor: "pointer", background: active ? "#fff" : "transparent" }}
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

function BackIcon() {
  return (
    <svg width={9} height={9} viewBox="0 0 8.55 8.43" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M2.04131 4.75583L8.55 4.75583L8.55 3.6725L2.04131 3.6725L4.91625 0.769167L4.15744 0L0 4.21417L4.15744 8.42833L4.91625 7.65917L2.04131 4.75583Z" fill="#1D1D1F" fillOpacity="0.4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 9.619 9.75" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M0 9.20833C0 9.36 0.0516562 9.48819 0.154969 9.59292C0.258281 9.69764 0.38475 9.75 0.534375 9.75L9.08437 9.75C9.234 9.75 9.36047 9.69764 9.46378 9.59292C9.56709 9.48819 9.61875 9.36 9.61875 9.20833L9.61875 0.541667C9.61875 0.39 9.56709 0.261806 9.46378 0.157083C9.36047 0.0523611 9.234 0 9.08437 0L0.534375 0C0.38475 0 0.258281 0.0523611 0.154969 0.157083C0.0516562 0.261806 0 0.39 0 0.541667L0 9.20833ZM1.06875 8.66667L1.06875 1.08333L8.55 1.08333L8.55 8.66667L1.06875 8.66667ZM4.07194 6.81417L6.67969 5.05917C6.72956 5.02306 6.75984 4.97611 6.77053 4.91833C6.78122 4.86056 6.77231 4.80639 6.74381 4.75583C6.72244 4.73417 6.70106 4.7125 6.67969 4.69083L4.07194 2.93583C4.02206 2.89972 3.96862 2.88708 3.91162 2.89792C3.85462 2.90875 3.80831 2.93944 3.77269 2.99C3.75131 3.02611 3.74062 3.06583 3.74062 3.10917L3.74062 6.64083C3.74062 6.69861 3.762 6.74917 3.80475 6.7925C3.8475 6.83583 3.89737 6.8575 3.95437 6.8575C3.99712 6.8575 4.03631 6.84306 4.07194 6.81417Z" fill="#1D1D1F" fillOpacity="0.5" />
    </svg>
  );
}

function ClipIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 9.41 10.362" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M6.38578 7.23667L3.36122 4.18167C3.26147 4.07333 3.21159 3.94514 3.21159 3.79708C3.21159 3.64903 3.26325 3.52083 3.36656 3.4125C3.46988 3.30417 3.59634 3.25 3.74597 3.25C3.89559 3.25 4.02028 3.30417 4.12003 3.4125L7.14459 6.47833C7.35122 6.68778 7.49016 6.93153 7.56141 7.20958C7.63266 7.48764 7.63266 7.76569 7.56141 8.04375C7.49016 8.32181 7.35122 8.56556 7.14459 8.775C6.93797 8.98444 6.6975 9.12528 6.42319 9.1975C6.14888 9.26972 5.87456 9.26972 5.60025 9.1975C5.32594 9.12528 5.08547 8.98444 4.87884 8.775L1.85428 5.70917C1.51228 5.3625 1.28072 4.95625 1.15959 4.49042C1.03847 4.02458 1.03847 3.55875 1.15959 3.09292C1.28072 2.62708 1.51228 2.22083 1.85428 1.87417C2.19628 1.5275 2.59706 1.29458 3.05663 1.17542C3.51619 1.05625 3.97575 1.05625 4.43531 1.17542C4.89488 1.29458 5.29566 1.5275 5.63766 1.87417L8.65153 4.94L9.41034 4.18167L6.38578 1.11583C5.90841 0.631944 5.34553 0.303333 4.69716 0.13C4.06303 -0.0433333 3.42891 -0.0433333 2.79478 0.13C2.14641 0.303333 1.58175 0.631944 1.10081 1.11583C0.619875 1.59972 0.293906 2.17028 0.122906 2.8275C-0.0409687 3.47028 -0.0409687 4.11306 0.122906 4.75583C0.293906 5.41306 0.618094 5.98722 1.09547 6.47833L4.12003 9.54417C4.46203 9.89083 4.86281 10.1237 5.32238 10.2429C5.78194 10.3621 6.2415 10.3621 6.70106 10.2429C7.16062 10.1237 7.56141 9.89083 7.90341 9.54417C8.24541 9.1975 8.47519 8.79125 8.59275 8.32542C8.71031 7.85958 8.71031 7.39375 8.59275 6.92792C8.47519 6.46208 8.24541 6.05583 7.90341 5.70917L4.87884 2.64333C4.67222 2.43389 4.43175 2.29306 4.15744 2.22083C3.88313 2.14861 3.60881 2.14861 3.3345 2.22083C3.06019 2.29306 2.81972 2.43389 2.61309 2.64333C2.40647 2.85278 2.26753 3.09653 2.19628 3.37458C2.12503 3.65264 2.12503 3.93069 2.19628 4.20875C2.26753 4.48681 2.40647 4.73056 2.61309 4.94L5.63766 8.00583L6.38578 7.23667Z" fill="#1D1D1F" fillOpacity="0.5" />
    </svg>
  );
}

function LinkIcon({ active }: { active: boolean }) {
  return (
    <svg width={13} height={13} viewBox="0 0 10.547 10.691" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M8.65153 3.40708L7.89272 4.17625L8.65153 4.94542C8.99353 5.29208 9.22509 5.69653 9.34622 6.15875C9.46734 6.62097 9.46734 7.085 9.34622 7.55083C9.22509 8.01667 8.99353 8.42292 8.65153 8.76958C8.30953 9.11625 7.90875 9.35097 7.44919 9.47375C6.98962 9.59653 6.53184 9.59653 6.07584 9.47375C5.61984 9.35097 5.22084 9.11625 4.87884 8.76958L4.12003 8.00042L3.36122 8.76958L4.12003 9.53875C4.59741 10.0226 5.16384 10.3513 5.81934 10.5246C6.44634 10.6907 7.07691 10.6907 7.71103 10.5246C8.36653 10.3513 8.93297 10.0226 9.41034 9.53875C9.88772 9.05486 10.2119 8.48069 10.3829 7.81625C10.5468 7.17347 10.5468 6.53431 10.3829 5.89875C10.2119 5.23431 9.88772 4.66014 9.41034 4.17625L8.65153 3.40708ZM7.14459 1.87958L6.38578 1.11042C5.90841 0.626528 5.34197 0.297917 4.68647 0.124583C4.05947 -0.0415278 3.42891 -0.0415278 2.79478 0.124583C2.13928 0.297917 1.57284 0.626528 1.09547 1.11042C0.618094 1.59431 0.293906 2.16847 0.122906 2.83292C-0.0409687 3.47569 -0.0409687 4.11486 0.122906 4.75042C0.293906 5.41486 0.618094 5.98903 1.09547 6.47292L1.85428 7.24208L2.61309 6.47292L1.85428 5.70375C1.51228 5.35708 1.28072 4.95264 1.15959 4.49042C1.03847 4.02819 1.03847 3.56417 1.15959 3.09833C1.28072 2.6325 1.51228 2.22625 1.85428 1.87958C2.19628 1.53292 2.59706 1.29819 3.05663 1.17542C3.51619 1.05264 3.97397 1.05264 4.42997 1.17542C4.88597 1.29819 5.28497 1.53292 5.62697 1.87958L6.38578 2.64875L7.14459 1.87958ZM6.75984 7.62125L7.51866 6.85208L3.74597 3.02792L2.98716 3.79708L6.75984 7.62125Z" fill="#1D1D1F" fillOpacity={active ? 1 : 0.5} />
    </svg>
  );
}

function UploadIcon({ active, dim }: { active?: boolean; dim?: boolean }) {
  const opacity = dim ? 0.4 : active ? 1 : 0.5;
  return (
    <svg width={13} height={12} viewBox="0 0 11.756 10.833" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M5.87813 5.1025L8.14388 2.80583L7.38506 2.03667L6.4125 3.0225L6.4125 0L5.34375 0L5.34375 3.0225L4.37119 2.03667L3.61238 2.80583L5.87813 5.1025ZM5.87813 10.8333C6.50513 10.8333 7.0965 10.6817 7.65225 10.3783C8.1795 10.0894 8.61769 9.68861 8.96681 9.17583C9.31594 8.66306 9.52612 8.09611 9.59737 7.475C10.0106 7.35944 10.3811 7.16264 10.7089 6.88458C11.0366 6.60653 11.2931 6.26889 11.4784 5.87167C11.6636 5.47444 11.7563 5.05194 11.7563 4.60417C11.7563 4.09139 11.6387 3.61833 11.4036 3.185C11.1684 2.75167 10.846 2.39597 10.4363 2.11792C10.0267 1.83986 9.576 1.67917 9.08438 1.63583L9.08438 2.73C9.38363 2.77333 9.65616 2.88347 9.90197 3.06042C10.1478 3.23736 10.3402 3.46125 10.4791 3.73208C10.618 4.00292 10.6875 4.29361 10.6875 4.60417C10.6875 4.95083 10.6038 5.26861 10.4363 5.5575C10.2689 5.84639 10.0427 6.07569 9.75769 6.24542C9.47269 6.41514 9.15919 6.5 8.81719 6.5C8.70319 6.5 8.59275 6.48917 8.48588 6.4675C8.52863 6.65528 8.55 6.84667 8.55 7.04167C8.55 7.53278 8.43066 7.98597 8.19197 8.40125C7.95328 8.81653 7.62909 9.14514 7.21941 9.38708C6.80972 9.62903 6.36263 9.75 5.87813 9.75C5.39363 9.75 4.94653 9.62903 4.53684 9.38708C4.12716 9.14514 3.80297 8.81653 3.56428 8.40125C3.32559 7.98597 3.20625 7.53278 3.20625 7.04167C3.20625 6.84667 3.22763 6.65528 3.27038 6.4675C3.15638 6.48917 3.04594 6.5 2.93906 6.5C2.59706 6.5 2.28356 6.41514 1.99856 6.24542C1.71356 6.07569 1.48734 5.84639 1.31991 5.5575C1.15247 5.26861 1.06875 4.95083 1.06875 4.60417C1.06875 4.30083 1.13466 4.01736 1.26647 3.75375C1.39828 3.49014 1.57819 3.26986 1.80619 3.09292C2.03419 2.91597 2.29069 2.79861 2.57569 2.74083L2.67188 2.73L2.67188 1.63583C2.18025 1.67917 1.72959 1.83986 1.31991 2.11792C0.910219 2.39597 0.587813 2.75167 0.352688 3.185C0.117563 3.61833 0 4.09139 0 4.60417C0 5.05194 0.092625 5.47444 0.277875 5.87167C0.463125 6.26889 0.719625 6.60653 1.04737 6.88458C1.37513 7.16264 1.74563 7.35944 2.15887 7.475C2.23012 8.09611 2.44031 8.66306 2.78944 9.17583C3.13856 9.68861 3.57675 10.0894 4.104 10.3783C4.65975 10.6817 5.25113 10.8333 5.87813 10.8333Z" fill="#1D1D1F" fillOpacity={opacity} />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 10 10" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M4.93125 10C4.2606 10 3.61954 9.87 3.00806 9.61C2.42289 9.35667 1.90182 8.99833 1.44486 8.535C0.987894 8.07167 0.634488 7.54333 0.384638 6.95C0.128212 6.33 0 5.68 0 5C0 4.32 0.128212 3.67 0.384638 3.05C0.634488 2.45667 0.987894 1.92833 1.44486 1.465C1.90182 1.00167 2.42289 0.643333 3.00806 0.39C3.61954 0.13 4.2606 0 4.93125 0C5.6019 0 6.24296 0.13 6.85444 0.39C7.43961 0.643333 7.96068 1.00167 8.41764 1.465C8.87461 1.92833 9.22801 2.45667 9.47786 3.05C9.73429 3.67 9.8625 4.32 9.8625 5C9.8625 5.68 9.73429 6.33 9.47786 6.95C9.22801 7.54333 8.87461 8.07167 8.41764 8.535C7.96068 8.99833 7.43961 9.35667 6.85444 9.61C6.24296 9.87 5.6019 10 4.93125 10ZM4.93125 9C5.64792 9 6.312 8.81667 6.92348 8.45C7.51523 8.09667 7.98534 7.62 8.33381 7.02C8.69544 6.4 8.87625 5.72667 8.87625 5C8.87625 4.27333 8.69544 3.6 8.33381 2.98C7.98534 2.38 7.51523 1.90333 6.92348 1.55C6.312 1.18333 5.64792 1 4.93125 1C4.21458 1 3.5505 1.18333 2.93903 1.55C2.34728 1.90333 1.87716 2.38 1.52869 2.98C1.16706 3.6 0.98625 4.27333 0.98625 5C0.98625 5.72667 1.16706 6.4 1.52869 7.02C1.87716 7.62 2.34728 8.09667 2.93903 8.45C3.5505 8.81667 4.21458 9 4.93125 9ZM4.43813 6.5H5.42438V7.5H4.43813V6.5ZM4.43813 2.5H5.42438V5.5H4.43813V2.5Z" fill="#EF4444" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width={13} height={10} viewBox="0 0 10 8" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M3.74927 5.50218L9.17273 0.000106573L9.99805 0.849339L3.74927 7.20064L0 3.38508L0.82531 2.5478L3.74927 5.50218Z" fill="white" />
    </svg>
  );
}
