import { prisma } from "@/lib/db";

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

export type MyInquiryRow = {
  kind: "문의" | "신고";
  category: string;
  title: string;
  date: string;
  status: "접수" | "처리중" | "완료";
  thread?: { question: string; answer: { meta: string; body: string } };
};
export type MyDemandPost = { title: string; meta: string; status: "진행중" };
export type MyInfoPost = { title: string; meta: string };
export type MyDemandAnswer = { title: string; meta: string; supplier: string; answerDate: string; answer: string; status: "진행중" };
export type MyBasicInfo = { email: string; org: string; dept: string; deptPhone: string };
export type MySupplierField = { label: string; value: string };

export type MyPageData = {
  headerSub: string;
  basicInfo: MyBasicInfo;
  supplierFields: MySupplierField[];
  supplierName: string;
  demandPosts: MyDemandPost[];
  infoPosts: MyInfoPost[];
  inquiries: MyInquiryRow[];
  demandAnswers: MyDemandAnswer[];
};

const IQ_ST: Record<string, string> = {
  OPEN: "접수", IN_PROGRESS: "처리중", ANSWERED: "완료", REJECTED: "반려", CLOSED: "완료",
};
const RP_ST: Record<string, string> = {
  OPEN: "접수", REVIEWING: "처리중", RESOLVED: "완료", DISMISSED: "반려",
};

export async function loadMyPage(userId: string, isSupplier: boolean): Promise<MyPageData> {
  const [user, demandRows, infoRows, inqRows, rptRows, answerRows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true, name: true, phone: true, departmentName: true,
        organization: { select: { name: true } },
        supplierCompany: {
          select: {
            name: true, businessRegistrationNo: true, representativeName: true,
            address: true, businessType: true, businessItem: true, phone: true, managerName: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: { boardType: "DEMAND", authorId: userId, isPublished: true },
      orderBy: { createdAt: "desc" }, take: 20,
      include: { _count: { select: { comments: true } } },
    }),
    prisma.post.findMany({
      where: { boardType: "INFO", authorId: userId, isPublished: true },
      orderBy: { createdAt: "desc" }, take: 20,
      include: { _count: { select: { comments: true } } },
    }),
    prisma.inquiry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.report.findMany({ where: { reporterId: userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.comment.findMany({
      where: { authorId: userId, parentId: null, post: { boardType: "DEMAND" } },
      orderBy: { createdAt: "desc" }, take: 20,
      include: {
        post: { select: { title: true, category: true, createdAt: true, views: true, _count: { select: { comments: true } } } },
      },
    }),
  ]);

  const email = user?.email ?? "";
  const org = user?.organization?.name ?? "";
  const dept = user?.departmentName ?? "";
  const sc = user?.supplierCompany;
  const supplierName = sc?.name ?? user?.name ?? "";

  return {
    headerSub: isSupplier
      ? `${supplierName} · ${email}`
      : `${org}${dept ? ` · ${dept}` : ""} · ${email}`,

    basicInfo: { email, org, dept, deptPhone: user?.phone ?? "-" },

    supplierFields: [
      { label: "상호(회사명)", value: sc?.name ?? "-" },
      { label: "사업자등록번호", value: sc?.businessRegistrationNo ?? "-" },
      { label: "대표자", value: sc?.representativeName ?? "-" },
      { label: "사업장 주소", value: sc?.address ?? "-" },
      { label: "업태", value: sc?.businessType ?? "-" },
      { label: "업종", value: sc?.businessItem ?? "-" },
      { label: "회사 전화", value: sc?.phone ?? "-" },
      { label: "담당자명", value: sc?.managerName ?? user?.name ?? "-" },
    ],

    supplierName,

    demandPosts: demandRows.map((p) => ({
      title: p.title,
      meta: `${p.category ?? "-"} · ${ymd(p.createdAt)} · 답변 ${p._count.comments}개 · 조회 ${p.views}`,
      status: "진행중" as const,
    })),

    infoPosts: infoRows.map((p) => ({
      title: p.title,
      meta: `${p.category ?? "정보공유"} · ${ymd(p.createdAt)} · 조회 ${p.views}`,
    })),

    inquiries: [
      ...inqRows.map((q) => ({
        kind: "문의" as const,
        category: q.category ?? "-",
        title: q.title,
        date: ymd(q.createdAt),
        status: (IQ_ST[q.status] ?? "접수") as "접수" | "처리중" | "완료",
        thread: q.answer
          ? { question: q.content, answer: { meta: `${q.answeredBy ?? "관리자"} · ${q.answeredAt ? ymd(q.answeredAt) : "-"}`, body: q.answer } }
          : undefined,
      })),
      ...rptRows.map((r) => ({
        kind: "신고" as const,
        category: r.category ?? "-",
        title: r.title ?? r.reason.slice(0, 40),
        date: ymd(r.createdAt),
        status: (RP_ST[r.status] ?? "접수") as "접수" | "처리중" | "완료",
        thread: r.answer
          ? { question: r.reason, answer: { meta: `${r.answeredBy ?? "관리자"} · ${r.answeredAt ? ymd(r.answeredAt) : "-"}`, body: r.answer } }
          : undefined,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date)),

    demandAnswers: answerRows.map((c) => ({
      title: c.post.title,
      meta: `${c.post.category ?? "-"} · ${ymd(c.post.createdAt)} · 답변 ${c.post._count.comments}개 · 조회 ${c.post.views}`,
      supplier: supplierName,
      answerDate: ymd(c.createdAt),
      answer: c.content,
      status: "진행중" as const,
    })),
  };
}
