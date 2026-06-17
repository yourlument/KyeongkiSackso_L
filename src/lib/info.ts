import { prisma } from "@/lib/db";

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

export async function loadInfo(currentUserId?: string | null): Promise<{
  posts: InfoPost[];
  hotPosts: InfoHotPost[];
}> {
  const [rawPosts, rawHot] = await Promise.all([
    prisma.post.findMany({
      where: { boardType: "INFO", isPublished: true },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true } } },
    }),
    prisma.post.findMany({
      where: { boardType: "INFO", isPublished: true },
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

  return { posts, hotPosts };
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type InfoDetailData = {
  id: string;
  category: string;
  title: string;
  date: string;
  views: string;
  commentsCount: string;
  body: string;
  videoUrl?: string;
  attachments: { type: string; name: string; size: string }[];
};

export async function loadInfoDetail(id: string): Promise<InfoDetailData | null> {
  const post = await prisma.post.findUnique({
    where: { id, boardType: "INFO", isPublished: true },
    include: {
      attachments: true,
      _count: { select: { comments: true } },
    },
  });

  if (!post) return null;

  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });

  return {
    id: post.id,
    category: post.category ?? "정보공유",
    title: post.title,
    date: ymd(post.createdAt),
    views: String(post.views + 1),
    commentsCount: String(post._count.comments),
    body: post.content,
    videoUrl: post.videoUrl ?? undefined,
    attachments: post.attachments.map((a) => ({
      type: a.fileName.split(".").pop()?.toLowerCase() ?? "pdf",
      name: a.fileName,
      size: a.fileSize ? formatSize(a.fileSize) : "-",
    })),
  };
}
