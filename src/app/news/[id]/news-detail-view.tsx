"use client";

import Link from "next/link";
import type { Attachment, NewsDetail, NewsItem } from "@/lib/news";
import {
  CrumbBackIcon,
  ClipHeaderIcon,
  FileIcon,
  DownloadIcon,
  NavUpIcon,
  NavDownIcon,
  ListIcon,
} from "../news-icons";

const NAVY = "#1E3A5F";

export function NewsDetailView({
  item,
  detail,
  prev,
  next,
}: {
  item: NewsItem;
  detail: NewsDetail;
  prev?: NewsItem;
  next?: NewsItem;
}) {
  const isNotice = item.category === "공지";
  return (
    <>
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
        <div className="mx-auto w-full max-w-[937px]" style={{ padding: "48.8px 39.04px" }}>
          <Link href="/news" className="inline-flex items-center" style={{ gap: "4.88px", marginBottom: "24.4px" }}>
            <span className="flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
              <CrumbBackIcon />
            </span>
            <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "22.75px", color: "rgba(29,29,31,0.4)" }}>
              소식 목록
            </span>
          </Link>

          <div style={{ marginBottom: "19.52px" }}>
            <span
              className="inline-flex items-center justify-center"
              style={{
                background: isNotice ? "#1F2937" : "#E5E7EB",
                color: isNotice ? "#FFFFFF" : "#374151",
                border: isNotice ? "none" : "1px solid #D1D5DB",
                borderRadius: "9999px",
                padding: "4.88px 12.2px",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.165px",
                lineHeight: "19.8px",
              }}
            >
              {item.category}
            </span>
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.65px", lineHeight: "35.75px", color: "#1D1D1F", margin: 0 }}>
            {item.title}
          </h1>

          <div
            className="flex flex-wrap items-center"
            style={{ gap: "14.64px", marginTop: "19.52px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)" }}
          >
            <span>{detail.author}</span>
            <span style={{ color: "#D2D2D7" }}>·</span>
            <span>등록일 {item.date}</span>
            <span style={{ color: "#D2D2D7" }}>·</span>
            <span>조회 {detail.views}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[937px]" style={{ padding: "48.8px 39.04px" }}>
        <div style={{ background: "#000000", borderRadius: "19.52px", marginBottom: "39.04px" }}>
          <div
            className="flex items-center justify-center"
            style={{ background: "#FFFFFF", border: "1px solid #000000", borderRadius: "19.52px", aspectRatio: "779 / 438", width: "100%" }}
          >
            <span style={{ fontSize: "64px", fontWeight: 300, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#000000", textAlign: "center" }}>
              동영상 미디어 플레이어
            </span>
          </div>
        </div>

        <p style={{ fontSize: "15px", fontWeight: 400, letterSpacing: "-0.225px", lineHeight: "27.75px", color: "rgba(29,29,31,0.75)", whiteSpace: "pre-wrap", margin: 0 }}>
          {detail.body}
        </p>

        {detail.attachments.length > 0 && (
          <div style={{ background: "#F5F5F7", border: "1px solid rgba(210,210,215,0.1)", borderRadius: "19.52px", padding: "25.4px", marginTop: "39.04px" }}>
            <div className="flex items-center" style={{ gap: "7.32px", marginBottom: "14.64px" }}>
              <span className="flex items-center justify-center" style={{ width: "13px", height: "16px" }}>
                <ClipHeaderIcon />
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.364px", lineHeight: "16.25px", color: "rgba(29,29,31,0.6)" }}>
                첨부파일
              </span>
              <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.3)" }}>
                ({detail.attachments.length}개)
              </span>
            </div>
            <div className="flex flex-col" style={{ gap: "7.32px" }}>
              {detail.attachments.map((a) => (
                <AttachmentRow key={a.name} att={a} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-[937px]" style={{ padding: "0 39.04px 78.08px" }}>
        <div style={{ borderTop: "1px solid rgba(210,210,215,0.2)", paddingTop: "40.04px" }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14.64px" }}>
            <NavCard dir="prev" item={prev} />
            <NavCard dir="next" item={next} />
          </div>
        </div>
        <div className="flex justify-center" style={{ marginTop: "29.28px" }}>
          <Link
            href="/news"
            className="inline-flex items-center transition-colors hover:opacity-90"
            style={{ gap: "9.76px", background: NAVY, borderRadius: "14.64px", padding: "12.2px 29.28px", color: "#FFFFFF" }}
          >
            <span className="flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
              <ListIcon />
            </span>
            <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "22.75px" }}>목록으로</span>
          </Link>
        </div>
      </div>
    </>
  );
}

function AttachmentRow({ att }: { att: Attachment }) {
  return (
    <button
      type="button"
      className="flex items-center justify-between transition-colors hover:bg-[rgba(29,29,31,0.02)]"
      style={{ background: "#FFFFFF", border: "1px solid rgba(210,210,215,0.1)", borderRadius: "14.64px", padding: "15.64px 20.52px", width: "100%", cursor: "pointer", textAlign: "left" }}
    >
      <span className="flex min-w-0 items-center" style={{ gap: "14.64px" }}>
        <span
          className="flex shrink-0 items-center justify-center"
          style={{ width: "44px", height: "44px", background: "#F5F5F7", borderRadius: "9.76px" }}
        >
          <FileIcon />
        </span>
        <span className="flex min-w-0 flex-col">
          <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {att.name}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>
            {att.size}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center justify-center" style={{ width: "39px", height: "39px" }}>
        <DownloadIcon />
      </span>
    </button>
  );
}

function NavCard({ dir, item }: { dir: "prev" | "next"; item?: NewsItem }) {
  const label = dir === "prev" ? "이전 글" : "다음 글";
  const Arrow = dir === "prev" ? NavUpIcon : NavDownIcon;
  const align = dir === "next" ? "flex-end" : "flex-start";
  const inner = (
    <>
      <span className="flex items-center" style={{ gap: "4.88px", marginBottom: "9.76px", justifyContent: align }}>
        {dir === "prev" && (
          <span className="flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
            <Arrow />
          </span>
        )}
        <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.25px", color: "rgba(29,29,31,0.4)" }}>{label}</span>
        {dir === "next" && (
          <span className="flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
            <Arrow />
          </span>
        )}
      </span>
      <span
        className="block"
        style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", lineHeight: "25.2px", color: item ? "#1D1D1F" : "rgba(29,29,31,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: dir === "next" ? "right" : "left" }}
      >
        {item ? item.title : "-"}
      </span>
    </>
  );
  const style: React.CSSProperties = {
    background: "#F5F5F7",
    borderRadius: "19.52px",
    padding: "19.52px 24.4px",
    minWidth: 0,
  };
  if (item) {
    return (
      <Link href={`/news/${item.id}`} className="block transition-colors hover:bg-[#EEEEEF]" style={style}>
        {inner}
      </Link>
    );
  }
  return <div style={style}>{inner}</div>;
}
