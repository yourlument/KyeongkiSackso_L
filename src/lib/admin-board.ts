import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

export type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  boardLabel: string;
  authorName: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isPublished: boolean;
};

export type NewsRow = {
  id: string;
  type: "공지" | "이벤트";
  title: string;
  authorName: string;
  createdAt: string;
  status: "게시중" | "임시저장";
  views: number;
  isPinned: boolean;
};

export type AdminBoardKpi = { value: string; label: string };

export type AdminBoardData = {
  posts: PostRow[];
  news: NewsRow[];
  postKpis: { total: AdminBoardKpi; views: AdminBoardKpi; comments: AdminBoardKpi };
  newsKpis: { total: AdminBoardKpi; published: AdminBoardKpi; draft: AdminBoardKpi; pinned: AdminBoardKpi };
};

const NEWS_TYPE: Record<string, "공지" | "이벤트"> = { NOTICE: "공지", EVENT: "이벤트" };

export async function loadAdminBoard(): Promise<AdminBoardData> {
  const [posts, news] = await Promise.all([
    prisma.post.findMany({
      where: { boardType: "INFO" },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.news.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const postRows: PostRow[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.content,
    boardLabel: dash(p.category),
    authorName: dash(decrypt(p.author.name)),
    createdAt: ymd(p.createdAt),
    views: p.views,
    likes: p.likes,
    comments: p._count.comments,
    isPublished: p.isPublished,
  }));

  const newsRows: NewsRow[] = news.map((n) => ({
    id: n.id,
    type: NEWS_TYPE[n.type] ?? "공지",
    title: n.title,
    authorName: dash(n.authorName),
    createdAt: ymd(n.createdAt),
    status: n.status === "DRAFT" ? "임시저장" : "게시중",
    views: n.views,
    isPinned: n.isPinned,
  }));

  const postViews = postRows.reduce((s, p) => s + p.views, 0);
  const postComments = postRows.reduce((s, p) => s + p.comments, 0);
  const postKpis = {
    total: { value: postRows.length.toLocaleString(), label: "전체 게시글" },
    views: { value: postViews.toLocaleString(), label: "총 조회수" },
    comments: { value: postComments.toLocaleString(), label: "총 댓글수" },
  };

  const newsPublished = newsRows.filter((n) => n.status === "게시중").length;
  const newsDraft = newsRows.filter((n) => n.status === "임시저장").length;
  const newsPinned = newsRows.filter((n) => n.isPinned).length;
  const newsKpis = {
    total: { value: newsRows.length.toLocaleString(), label: "전체" },
    published: { value: newsPublished.toLocaleString(), label: "게시중" },
    draft: { value: newsDraft.toLocaleString(), label: "임시저장" },
    pinned: { value: newsPinned.toLocaleString(), label: "상단고정" },
  };

  return { posts: postRows, news: newsRows, postKpis, newsKpis };
}
