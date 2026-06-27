function fileType(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0) return "파일";
  const ext = name.slice(i + 1).toUpperCase();
  return ext ? `${ext} 파일` : "파일";
}

export function ChatFileChip({ url, name, mine, spaced }: { url: string; name?: string | null; mine: boolean; spaced?: boolean }) {
  const fname = name ?? "첨부파일";
  const fg = mine ? "#fff" : "#1E3A5F";
  return (
    <a
      href={url}
      download={fname}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center"
      style={{
        gap: "9.76px",
        marginTop: spaced ? "7.32px" : 0,
        padding: "9.76px 12.2px",
        borderRadius: "12.2px",
        background: mine ? "rgba(255,255,255,0.14)" : "#fff",
        border: mine ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(210,210,215,0.5)",
        textDecoration: "none",
        maxWidth: "240px",
        boxSizing: "border-box",
      }}
    >
      <span className="flex items-center justify-center" style={{ width: "34px", height: "34px", flexShrink: 0, borderRadius: "8px", background: mine ? "rgba(255,255,255,0.18)" : "rgba(30,58,95,0.08)" }}>
        <svg width={17} height={17} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 2.5h6L15.5 7v10A1.5 1.5 0 0 1 14 18.5H5A1.5 1.5 0 0 1 3.5 17V4A1.5 1.5 0 0 1 5 2.5Z" stroke={fg} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M11 2.5V7h4.5" stroke={fg} strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex flex-col" style={{ minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "18px", color: mine ? "#fff" : "#1D1D1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fname}</span>
        <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "16px", color: mine ? "rgba(255,255,255,0.65)" : "rgba(29,29,31,0.4)", marginTop: "1.5px" }}>{fileType(fname)}</span>
      </span>
      <svg width={16} height={16} viewBox="0 0 20 20" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5h12" stroke={fg} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
