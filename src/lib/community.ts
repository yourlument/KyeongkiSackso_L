import { prisma } from "@/lib/db";

export type DemandStatus = "진행중" | "마감";

export type DemandPost = {
  id: string;
  status: DemandStatus;
  date: string;
  title: string;
  summary: string;
  org: string;
  category: string;
  views: number;
  answers: number;
  mine?: boolean;
  answered?: boolean;
};

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

export async function loadDemand(currentUserId?: string | null): Promise<{ posts: DemandPost[] }> {
  const rows = await prisma.post.findMany({
    where: { boardType: "DEMAND", isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { departmentName: true, organization: { select: { name: true } } } },
      _count: { select: { comments: true } },
    },
  });

  const posts: DemandPost[] = rows.map((p) => {
    const dept = p.author.departmentName ?? "";
    const orgName = p.author.organization?.name ?? "";
    const org = [dept, orgName].filter(Boolean).join("_") || "-";
    return {
      id: p.id,
      status: p.status === "OPEN" ? "진행중" : "마감",
      date: ymd(p.createdAt),
      title: p.title,
      summary: p.content.slice(0, 150).replace(/\n/g, " "),
      org,
      category: p.category ?? "-",
      views: p.views,
      answers: p._count.comments,
      mine: !!currentUserId && p.authorId === currentUserId,
      answered: p._count.comments > 0,
    };
  });

  return { posts };
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type CommunityDetailComment = {
  id: string;
  company: string;
  date: string;
  body: string;
  mine?: boolean;
  reply?: { name: string; date: string; body: string };
};

export type CommunityDetailPost = {
  id: string;
  status: DemandStatus;
  title: string;
  org: string;
  date: string;
  views: number;
  answers: number;
  summary: string;
  videoUrl?: string;
  attachments: { name: string; size: string; url: string }[];
  comments: CommunityDetailComment[];
  isOwner: boolean;
};

export async function loadCommunityDetail(
  id: string,
  currentUserId?: string | null,
): Promise<CommunityDetailPost | null> {
  const post = await prisma.post.findUnique({
    where: { id, boardType: "DEMAND", isPublished: true },
    include: {
      author: { select: { departmentName: true, organization: { select: { name: true } } } },
      attachments: true,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, supplierCompany: { select: { name: true } } } },
          replies: {
            orderBy: { createdAt: "asc" },
            take: 1,
            include: { author: { select: { name: true, departmentName: true } } },
          },
        },
      },
    },
  });

  if (!post) return null;

  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });

  const dept = post.author.departmentName ?? "";
  const orgName = post.author.organization?.name ?? "";
  const org = [dept, orgName].filter(Boolean).join("_") || "-";

  return {
    id: post.id,
    status: post.status === "OPEN" ? "진행중" : "마감",
    title: post.title,
    org,
    date: ymd(post.createdAt),
    views: post.views + 1,
    answers: post.comments.length,
    summary: post.content,
    videoUrl: post.videoUrl ?? undefined,
    attachments: post.attachments.map((a) => ({
      name: a.fileName,
      size: a.fileSize ? formatSize(a.fileSize) : "-",
      url: a.fileUrl,
    })),
    comments: post.comments.map((c) => ({
      id: c.id,
      company: c.author.supplierCompany?.name ?? c.author.name,
      date: ymd(c.createdAt),
      body: c.content,
      mine: !!currentUserId && c.authorId === currentUserId,
      reply: c.replies[0]
        ? {
            name: [c.replies[0].author.departmentName, c.replies[0].author.name].filter(Boolean).join(" "),
            date: ymd(c.replies[0].createdAt),
            body: c.replies[0].content,
          }
        : undefined,
    })),
    isOwner: !!currentUserId && post.authorId === currentUserId,
  };
}
