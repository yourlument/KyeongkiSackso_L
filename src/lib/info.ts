import { prisma } from "@/lib/db";
import { CATEGORY_DESC, type Category } from "@/app/info/data";

export type InfoPost = {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  author: string;
  comments: number;
  views: number;
  likes: number;
  dislikes: number;
  mine?: boolean;
};

export type InfoHotPost = {
  rank: number;
  id: string;
  title: string;
  comments: number;
  attachments: number;
  author: string;
  date: string;
  likes: number;
  views: number;
};

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

export const INFO_PER_PAGE = 10;

export async function loadInfo(
  currentUserId?: string | null,
  page = 1,
): Promise<{
  posts: InfoPost[];
  hotPosts: InfoHotPost[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const where = { boardType: "INFO" as const, isPublished: true };
  const total = await prisma.post.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / INFO_PER_PAGE));
  const cur = Math.min(Math.max(1, page), pageCount);

  const [rawPosts, rawHot] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (cur - 1) * INFO_PER_PAGE,
      take: INFO_PER_PAGE,
      include: { _count: { select: { comments: true } } },
    }),
    prisma.post.findMany({
      where,
      orderBy: { likes: "desc" },
      take: 5,
      include: { _count: { select: { comments: true, attachments: true } } },
    }),
  ]);

  const posts: InfoPost[] = rawPosts.map((p) => ({
    id: p.id,
    category: p.category ?? "기타",
    date: ymd(p.createdAt),
    title: p.title,
    excerpt: p.content.slice(0, 120).replace(/\n/g, " "),
    author: "익명",
    comments: p._count.comments,
    views: p.views,
    likes: p.likes,
    dislikes: p.dislikes,
    mine: !!currentUserId && p.authorId === currentUserId,
  }));

  const hotPosts: InfoHotPost[] = rawHot.map((p, i) => ({
    rank: i + 1,
    id: p.id,
    title: p.title,
    comments: p._count.comments,
    attachments: p._count.attachments,
    author: "익명",
    date: ymd(p.createdAt),
    likes: p.likes,
    views: p.views,
  }));

  return { posts, hotPosts, total, page: cur, pageCount };
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type InfoComment = {
  id: string;
  author: string;
  date: string;
  text: string;
  likes: string;
  replies: string;
  openReply: boolean;
  myReaction?: "LIKE" | "DISLIKE" | null;
  badge?: string;
  reply?: { author: string; date: string; text: string; likes: string; replies: string };
};

export type InfoDetailData = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  date: string;
  views: string;
  commentsCount: string;
  likes: number;
  dislikes: number;
  myReaction?: "LIKE" | "DISLIKE" | null;
  body: string;
  videoUrl?: string;
  attachments: { type: string; name: string; size: string; fileUrl: string }[];
  comments: InfoComment[];
  popularComments: InfoComment[];
};

export async function loadInfoDetail(id: string, currentUserId?: string | null): Promise<InfoDetailData | null> {
  const reactionFilter = { where: { userId: currentUserId ?? "__none__" }, select: { type: true } } as const;
  const post = await prisma.post.findUnique({
    where: { id, boardType: "INFO", isPublished: true },
    include: {
      attachments: true,
      _count: { select: { comments: true } },
      reactions: reactionFilter,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: true,
          replies: { orderBy: { createdAt: "asc" }, include: { author: true } },
          reactions: reactionFilter,
        },
      },
    },
  });

  if (!post) return null;

  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });

  const myReaction = currentUserId ? (post.reactions[0]?.type ?? null) : null;

  const comments: InfoComment[] = post.comments.map((c) => {
    const firstReply = c.replies[0];
    return {
      id: c.id,
      author: "익명",
      date: ymd(c.createdAt),
      text: c.content,
      likes: String(c.likes),
      replies: String(c.replies.length),
      openReply: false,
      myReaction: currentUserId ? (c.reactions[0]?.type ?? null) : null,
      reply: firstReply
        ? { author: "익명", date: ymd(firstReply.createdAt), text: firstReply.content, likes: String(firstReply.likes), replies: "0" }
        : undefined,
    };
  });

  const popularComments: InfoComment[] = [...post.comments]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      author: "익명",
      date: ymd(c.createdAt),
      badge: String(c.likes),
      text: c.content,
      likes: String(c.likes),
      replies: String(c.replies.length),
      openReply: false,
      myReaction: currentUserId ? (c.reactions[0]?.type ?? null) : null,
    }));

  const subtitleFallback = "업무관련 서류/자료 정보 무엇이든 공유해요";
  const subtitle =
    post.category && post.category in CATEGORY_DESC ? CATEGORY_DESC[post.category as Category] : subtitleFallback;

  return {
    id: post.id,
    category: post.category ?? "정보공유",
    title: post.title,
    subtitle,
    date: ymd(post.createdAt),
    views: String(post.views + 1),
    commentsCount: String(post._count.comments),
    likes: post.likes,
    dislikes: post.dislikes,
    myReaction,
    body: post.content,
    videoUrl: post.videoUrl ?? undefined,
    attachments: post.attachments.map((a) => ({
      type: a.fileName.split(".").pop()?.toLowerCase() ?? "pdf",
      name: a.fileName,
      size: a.fileSize ? formatSize(a.fileSize) : "-",
      fileUrl: a.fileUrl,
    })),
    comments,
    popularComments,
  };
}
