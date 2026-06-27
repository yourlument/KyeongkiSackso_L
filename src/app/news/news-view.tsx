"use client";

import Link from "next/link";
import { useState } from "react";
import type { NewsItem, NewsCategory } from "@/lib/news";
import {
  PinIcon,
  MediaIcon,
  PaperclipIcon,
  RowChevronIcon,
  PageChevronLeftIcon,
  PageChevronRightIcon,
} from "./news-icons";

type Tab = "전체" | NewsCategory;
const TABS: Tab[] = ["전체", "공지", "이벤트"];
const NEWS_PER_PAGE = 10;

export function NewsView({ allNews, tabCounts }: { allNews: NewsItem[]; tabCounts: { 전체: number; 공지: number; 이벤트: number } }) {
  const [tab, setTab] = useState<Tab>("전체");
  const [page, setPage] = useState(1);

  const items = allNews.filter((n) => tab === "전체" || n.category === tab);
  const featured = allNews.filter((n) => n.pinned && (tab === "전체" || n.category === tab));
  const pageCount = Math.max(1, Math.ceil(items.length / NEWS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const paged = items.slice((safePage - 1) * NEWS_PER_PAGE, safePage * NEWS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-wrap items-center" style={{ gap: "4.88px", marginBottom: "39.04px" }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setPage(1); }}
              className="inline-flex items-center"
              style={{
                gap: "7px",
                borderRadius: "9999px",
                padding: "9.76px 19.52px",
                background: active ? "#1D1D1F" : "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "-0.293px",
                  lineHeight: "22.75px",
                  color: active ? "#FFFFFF" : "rgba(29,29,31,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "-0.165px",
                  lineHeight: "19.8px",
                  color: active ? "rgba(255,255,255,0.6)" : "rgba(29,29,31,0.3)",
                }}
              >
                {tabCounts[t]}
              </span>
            </button>
          );
        })}
      </div>

      {featured.length > 0 && (
        <div className="flex flex-col" style={{ gap: "9.76px", marginBottom: "29.28px" }}>
          {featured.map((n) => (
            <FeaturedRow key={n.id} item={n} />
          ))}
        </div>
      )}

      <div className="flex flex-col">
        {paged.map((n, i) => (
          <NewsRow key={n.id} item={n} last={i === paged.length - 1} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center" style={{ gap: "4.88px", paddingTop: "19.52px", paddingBottom: "19.52px" }}>
          <button type="button" aria-label="이전" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="inline-flex items-center justify-center" style={pageBtn(false)}>
            <PageChevronLeftIcon />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => setPage(n)} className="inline-flex items-center justify-center" style={pageBtn(n === safePage)}>
              <span style={{ fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.293px", lineHeight: "24.4px", color: n === safePage ? "#FFFFFF" : "#4B5563" }}>{n}</span>
            </button>
          ))}
          <button type="button" aria-label="다음" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage >= pageCount} className="inline-flex items-center justify-center" style={pageBtn(false)}>
            <PageChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function pageBtn(active: boolean): React.CSSProperties {
  return {
    width: "39px",
    height: "39px",
    borderRadius: "7.32px",
    background: active ? "#1F2937" : "transparent",
    border: "none",
    cursor: "pointer",
  };
}

function Pill({ cat }: { cat: NewsCategory }) {
  const isNotice = cat === "공지";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        background: isNotice ? "#1F2937" : "#E5E7EB",
        color: isNotice ? "#FFFFFF" : "#374151",
        border: isNotice ? "none" : "1px solid #D1D5DB",
        borderRadius: "7.32px",
        padding: isNotice ? "2.44px 9.76px" : "3.44px 10.76px",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "-0.165px",
        lineHeight: "19.8px",
        whiteSpace: "nowrap",
      }}
    >
      {cat}
    </span>
  );
}

function FeaturedRow({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className="flex items-center transition-colors hover:bg-[#EEEEEF]"
      style={{ gap: "19.52px", background: "#F5F5F7", borderRadius: "19.52px", padding: "19.52px 24.4px" }}
    >
      <span className="flex shrink-0 items-center justify-center" style={{ width: "20px", height: "20px" }}>
        <PinIcon />
      </span>
      <Pill cat={item.category} />
      <span style={{ flex: 1, minWidth: 0, fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.title}
      </span>
      <span style={{ flexShrink: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
        {item.date}
      </span>
    </Link>
  );
}

function NewsRow({ item, last }: { item: NewsItem; last: boolean }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className="flex items-center transition-colors hover:bg-[rgba(29,29,31,0.015)]"
      style={{
        gap: "19.52px",
        borderRadius: "14.64px",
        padding: "19.52px 9.76px 20.52px",
        borderBottom: last ? "none" : "1px solid rgba(210,210,215,0.2)",
      }}
    >
      <Pill cat={item.category} />
      <span className="flex min-w-0 items-center" style={{ gap: "7.32px", flex: 1 }}>
        <span style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title}
        </span>
        {item.hasMedia && (
          <span className="flex shrink-0 items-center justify-center" style={{ width: "20px", height: "20px" }}>
            <MediaIcon />
          </span>
        )}
        {item.hasAttachment && (
          <span className="flex shrink-0 items-center justify-center" style={{ width: "20px", height: "20px" }}>
            <PaperclipIcon />
          </span>
        )}
      </span>
      <span style={{ flexShrink: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
        {item.date}
      </span>
      <span className="flex shrink-0 items-center justify-center" style={{ width: "20px", height: "20px" }}>
        <RowChevronIcon />
      </span>
    </Link>
  );
}
