import { prisma } from "@/lib/db";

export type NewsCategory = "공지" | "이벤트";

export type NewsItem = {
  id: string;
  category: NewsCategory;
  title: string;
  date: string;
  pinned?: boolean;
  hasMedia?: boolean;
  hasAttachment?: boolean;
};

export type Attachment = { name: string; size: string };

export type NewsDetail = {
  author: string;
  views: number;
  body: string;
  attachments: Attachment[];
};

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function toItem(n: {
  id: string;
  type: string;
  title: string;
  createdAt: Date;
  isPinned: boolean;
  videoUrl: string | null;
  attachments: { id: string }[];
}): NewsItem {
  return {
    id: n.id,
    category: n.type === "NOTICE" ? "공지" : "이벤트",
    title: n.title,
    date: ymd(n.createdAt),
    pinned: n.isPinned || undefined,
    hasMedia: n.videoUrl ? true : undefined,
    hasAttachment: n.attachments.length > 0 ? true : undefined,
  };
}

export async function loadNews(): Promise<{
  items: NewsItem[];
  tabCounts: { 전체: number; 공지: number; 이벤트: number };
}> {
  const rows = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { attachments: { select: { id: true } } },
  });

  const items = rows.map(toItem);
  return {
    items,
    tabCounts: {
      전체: items.length,
      공지: items.filter((i) => i.category === "공지").length,
      이벤트: items.filter((i) => i.category === "이벤트").length,
    },
  };
}

export async function loadNewsById(id: string): Promise<{
  item: NewsItem;
  detail: NewsDetail;
  prev?: NewsItem;
  next?: NewsItem;
} | null> {
  const n = await prisma.news.findUnique({
    where: { id },
    include: { attachments: { select: { id: true, fileName: true, fileSize: true, fileUrl: true } } },
  });
  if (!n || n.status !== "PUBLISHED") return null;

  const all = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    select: { id: true, type: true, title: true, createdAt: true, isPinned: true, videoUrl: true, attachments: { select: { id: true } } },
  });

  const idx = all.findIndex((a) => a.id === id);
  const prev = idx > 0 ? toItem(all[idx - 1]) : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? toItem(all[idx + 1]) : undefined;

  return {
    item: toItem({ ...n, attachments: n.attachments.map((a) => ({ id: a.id })) }),
    detail: {
      author: n.authorName ?? "KORLINK 관리자",
      views: n.views,
      body: n.content,
      attachments: n.attachments.map((a) => ({
        name: a.fileName,
        size: a.fileSize != null ? formatSize(a.fileSize) : "-",
      })),
    },
    prev,
    next,
  };
}
