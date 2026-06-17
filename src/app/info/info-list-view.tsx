"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, CATEGORY_DESC, type Category } from "./data";
import type { InfoPost, InfoHotPost } from "@/lib/info";
import {
  SearchIcon,
  FireIcon,
  BookmarkIcon,
  UserIcon,
  CommentIcon,
  EyeIcon,
  LikeIcon,
  DislikeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "./info-icons";

const NAVY = "#1E3A5F";
type Tab = "전체" | Category;
const TABS: Tab[] = ["전체", ...CATEGORIES];

const RANK_BG = ["#1E3A5F", "rgba(30,58,95,0.8)", "rgba(30,58,95,0.6)", "rgba(30,58,95,0.4)", "rgba(30,58,95,0.25)"];

export function InfoListView({ posts: allPosts, hotPosts }: { posts: InfoPost[]; hotPosts: InfoHotPost[] }) {
  const [tab, setTab] = useState<Tab>("전체");
  const [q, setQ] = useState("");

  const posts = allPosts.filter((p) => {
    if (tab !== "전체" && p.category !== tab) return false;
    if (q.trim()) {
      const k = q.trim();
      return p.title.includes(k) || p.excerpt.includes(k) || p.author.includes(k);
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center" style={{ gap: "9.76px", paddingBottom: "29.28px" }}>
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                borderRadius: "9999px",
                padding: "9.76px 19.52px",
                background: active ? "#1D1D1F" : "transparent",
                color: active ? "#fff" : "rgba(29,29,31,0.5)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.293px",
                lineHeight: "22.75px",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab !== "전체" && (
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "-19.52px 0 19.52px 4.88px" }}>
          {CATEGORY_DESC[tab]}
        </p>
      )}

      <div style={{ position: "relative", paddingBottom: "29.28px" }}>
        <span style={{ position: "absolute", left: "20.52px", top: "13px", color: "rgba(29,29,31,0.3)" }}>
          <SearchIcon />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목, 내용, 작성자 검색"
          style={{
            width: "100%",
            height: "44px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.3)",
            borderRadius: "14.64px",
            padding: "0 20.52px 0 44.92px",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "-0.293px",
            color: "#1D1D1F",
            outline: "none",
          }}
        />
      </div>

      <div style={{ background: "#FAFAFA", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.15)", overflow: "hidden", marginBottom: "39.04px" }}>
        <div className="flex items-center" style={{ gap: "9.76px", background: "#F0F0F0", padding: "14.64px 24.4px 15.64px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <span style={{ color: "#D97706" }}><FireIcon /></span>
          <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)" }}>
            {tab === "전체" ? "전체 인기글" : `${tab} 인기글`}
          </span>
        </div>
        <div>
          {hotPosts.map((h, i) => (
            <HotRow key={h.rank} post={h} bg={RANK_BG[i] ?? RANK_BG[4]} first={i === 0} />
          ))}
        </div>
      </div>

      <div>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      <div className="flex items-center justify-center" style={{ gap: "4.88px", padding: "19.52px 0" }}>
        <button type="button" aria-label="이전" style={pageBtn(false)}>
          <span style={{ color: "#D1D5DB" }}><ChevronLeftIcon /></span>
        </button>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            style={{ ...pageBtn(n === 1), color: n === 1 ? "#fff" : "#4B5563", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.293px" }}
          >
            {n}
          </button>
        ))}
        <button type="button" aria-label="다음" style={pageBtn(false)}>
          <span style={{ color: "#4B5563" }}><ChevronRightIcon /></span>
        </button>
      </div>
    </div>
  );
}

function pageBtn(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "39px",
    height: "39px",
    borderRadius: "7.32px",
    background: active ? "#1F2937" : "transparent",
    border: "none",
    cursor: "pointer",
  };
}

function HotRow({ post, bg, first }: { post: InfoHotPost; bg: string; first: boolean }) {
  return (
    <Link
      href={`/info/${post.id}`}
      className="flex items-center"
      style={{ gap: "14.64px", padding: first ? "17.08px 24.4px" : "18.08px 24.4px 17.08px", borderTop: first ? "none" : "1px solid rgba(210,210,215,0.1)" }}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: "34px", height: "34px", borderRadius: "9.76px", background: bg, color: "#fff", fontSize: "12px", fontWeight: 700, lineHeight: "21px", letterSpacing: "-0.18px" }}
      >
        {post.rank}
      </span>
      <div className="flex min-w-0 items-center" style={{ gap: "9.76px", flex: 1 }}>
        <span style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {post.title}
        </span>
        {post.attachments > 0 && (
          <span style={{ color: "rgba(30,58,95,0.6)", flexShrink: 0 }}><BookmarkIcon /></span>
        )}
        <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#D97706", flexShrink: 0 }}>({post.comments})</span>
        <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: NAVY, flexShrink: 0 }}>[{post.attachments}]</span>
      </div>
      <div className="flex shrink-0 items-center" style={{ gap: "19.52px" }}>
        <span className="flex items-center" style={{ gap: "7.32px" }}>
          <span className="flex items-center justify-center" style={{ width: "29px", height: "29px", borderRadius: "9999px", background: "#F5F5F7", color: "rgba(29,29,31,0.4)" }}>
            <UserIcon />
          </span>
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>{post.author}</span>
        </span>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.3)" }}>{post.date}</span>
        <span className="flex items-center" style={{ gap: "2.44px", color: "#D97706" }}>
          <LikeIcon width={11} height={11} />
          <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px" }}>{post.likes}</span>
        </span>
        <span className="flex items-center" style={{ gap: "2.44px", color: "#EF4444" }}>
          <EyeIcon width={11} height={11} />
          <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px" }}>{post.views.toLocaleString("ko-KR")}</span>
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: InfoPost }) {
  return (
    <Link
      href={`/info/${post.id}`}
      className="block transition-colors hover:bg-[rgba(29,29,31,0.015)]"
      style={{ borderRadius: "14.64px", padding: "24.4px 19.52px 25.4px" }}
    >
      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "9.76px" }}>
        <span style={{ background: "#F5F5F7", borderRadius: "7.32px", padding: "2.44px 9.76px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)" }}>
          {post.category}
        </span>
        {post.mine && (
          <span style={{ background: "rgba(30,58,95,0.1)", borderRadius: "7.32px", padding: "2.44px 9.76px", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: NAVY }}>
            내 글
          </span>
        )}
        <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{post.date}</span>
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", lineHeight: "27px", color: "#1D1D1F", margin: "0 0 7.32px" }}>
        {post.title}
      </h3>
      <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "21.06px", color: "rgba(29,29,31,0.5)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {post.excerpt}
      </p>
      <div className="flex items-center" style={{ gap: "19.52px", marginTop: "14.64px", color: "rgba(29,29,31,0.3)" }}>
        <Meta icon={<UserIcon />} text={post.author} />
        <Meta icon={<CommentIcon />} text={String(post.comments)} />
        <Meta icon={<EyeIcon />} text={String(post.views)} />
        <Meta icon={<LikeIcon />} text={String(post.likes)} />
        <Meta icon={<DislikeIcon />} text={String(post.dislikes)} />
      </div>
    </Link>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center" style={{ gap: "4.88px" }}>
      {icon}
      <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px" }}>{text}</span>
    </span>
  );
}
