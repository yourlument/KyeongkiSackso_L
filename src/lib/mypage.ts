import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import type {
  PurchaseRow,
  PurchaseStatus,
  PurchaseAction,
  OrderDetail,
  QuoteNoticeRow,
  QuoteNoticeStatus,
  ProductQuoteRow,
  QuoteRequestDetailView,
} from "@/app/mypage/mypage-data";

function ymd(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}원`;
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

const PURCHASE_ST: Record<string, PurchaseStatus[]> = {
  PENDING: ["결제대기"],
  PAID: ["결제완료"],
  CONTRACTED: ["결제완료"],
  SHIPPING: ["배송중"],
  DELIVERED: ["납품완료"],
  COMPLETED: ["납품완료", "구매확정"],
};

export type MyInquiryRow = {
  kind: "문의" | "신고";
  category: string;
  title: string;
  date: string;
  status: "접수" | "처리중" | "완료";
  thread?: { question: string; answer: { meta: string; body: string } };
};
export type MyDemandPost = { title: string; meta: string; status: "진행중" };
export type MyInfoPost = { id: string; title: string; meta: string };
export type MyDemandAnswer = { title: string; meta: string; supplier: string; answerDate: string; answer: string; status: "진행중" };
export type MyBasicInfo = { email: string; org: string; dept: string; deptPhone: string };
export type MySupplierField = { label: string; value: string };

export type MyQuoteNoticeRow = QuoteNoticeRow & { id: string };
export type MyQuoteAttachment = { name: string; fileUrl: string };
export type MyQuoteRequestDetailView = Omit<QuoteRequestDetailView, "attachments"> & {
  productId: string | null;
  attachments: MyQuoteAttachment[];
};

export type MyPageData = {
  headerSub: string;
  basicInfo: MyBasicInfo;
  supplierFields: MySupplierField[];
  supplierName: string;
  demandPosts: MyDemandPost[];
  infoPosts: MyInfoPost[];
  inquiries: MyInquiryRow[];
  demandAnswers: MyDemandAnswer[];
  purchases: PurchaseRow[];
  orderDetails: Record<string, OrderDetail>;
  quoteNotices: MyQuoteNoticeRow[];
  productQuotes: ProductQuoteRow[];
  quoteDetails: Record<string, MyQuoteRequestDetailView>;
  alarmSettings: boolean[];
};

const QN_ST: Record<string, QuoteNoticeStatus> = {
  DRAFT: "공고중", OPEN: "공고중", REVIEWING: "검토중", AWARDED: "선정완료", CLOSED: "마감", CANCELLED: "마감",
};

const IQ_ST: Record<string, string> = {
  OPEN: "접수", IN_PROGRESS: "처리중", ANSWERED: "완료", REJECTED: "반려", CLOSED: "완료",
};
const RP_ST: Record<string, string> = {
  OPEN: "접수", REVIEWING: "처리중", RESOLVED: "완료", DISMISSED: "반려",
};

export async function loadMyPage(userId: string, isSupplier: boolean): Promise<MyPageData> {
  const [user, demandRows, infoRows, inqRows, rptRows, answerRows, orderRows, quoteReqRows, notifRow] = await Promise.all([
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
    isSupplier
      ? Promise.resolve([])
      : prisma.order.findMany({
          where: { buyerId: userId, status: { not: "CANCELLED" } },
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              select: {
                name: true,
                spec: true,
                quantity: true,
                unitPrice: true,
                amount: true,
                product: { select: { unit: true } },
                supplierCompany: { select: { name: true } },
              },
            },
            payments: { orderBy: { createdAt: "desc" }, take: 1 },
            buyer: { select: { organization: true } },
          },
        }),
    isSupplier
      ? Promise.resolve([])
      : prisma.quoteRequest.findMany({
          where: { officialId: userId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            kind: true,
            status: true,
            budget: true,
            budgetTbd: true,
            dueDate: true,
            deadline: true,
            desiredDeliveryDate: true,
            deliveryAddress: true,
            deliveryAddressDetail: true,
            contactOrgName: true,
            contactDepartment: true,
            contactEmail: true,
            contactPhone: true,
            createdAt: true,
            targetSupplierCompany: { select: { name: true, phone: true } },
            items: { select: { name: true, quantity: true, unit: true, productId: true } },
            attachments: { select: { fileName: true, fileUrl: true } },
            responses: { orderBy: { createdAt: "asc" }, take: 1, select: { totalAmount: true, memo: true, specSummary: true } },
            _count: { select: { responses: true } },
          },
        }),
    prisma.userNotificationSetting.findUnique({ where: { userId } }),
  ]);

  const email = user?.email ?? "";
  const org = user?.organization?.name ?? "";
  const dept = user?.departmentName ?? "";
  const sc = user?.supplierCompany;
  const supplierName = sc?.name ?? user?.name ?? "";

  const purchases: PurchaseRow[] = orderRows.map((o) => {
    const first = o.items[0];
    const statuses = [...(PURCHASE_ST[o.status] ?? ["결제완료"])];
    if (o.taxInvoiceStatus === "ISSUED") statuses.push("세금계산서 발행완료");
    else if (o.taxInvoiceStatus === "REQUESTED") statuses.push("세금계산서 발행요청");

    const actions: PurchaseAction[] = [{ kind: "detail" }];
    if (o.status === "PAID" || o.status === "SHIPPING") actions.push({ kind: "refund" });
    if (o.status === "DELIVERED") actions.push({ kind: "confirm" });
    if ((o.status === "DELIVERED" || o.status === "COMPLETED") && o.taxInvoiceStatus === "NONE") actions.push({ kind: "tax-request" });

    const specParts = o.items.map((it) => `${it.quantity}${it.product?.unit ?? "개"}`);
    return {
      date: ymd(o.createdAt),
      orderNo: o.orderNo,
      name: first ? (o.items.length > 1 ? `${first.name} 외 ${o.items.length - 1}건` : first.name) : "-",
      spec: specParts.join(", ") || "-",
      supplier: dash(first?.supplierCompany?.name),
      amount: won(o.totalAmount),
      statuses,
      actions,
    };
  });

  const orderDetails: Record<string, OrderDetail> = {};
  for (const o of orderRows) {
    const pay = o.payments[0];
    const o2 = o.buyer?.organization ?? null;
    orderDetails[o.orderNo] = {
      orderNo: o.orderNo,
      payDate: ymd(pay?.paidAt ?? o.createdAt),
      payMethod: dash(pay?.method),
      status: (PURCHASE_ST[o.status] ?? ["결제완료"])[0],
      items: o.items.map((it) => ({
        name: it.name,
        qtyUnit: `${it.quantity}${it.product?.unit ?? "개"} · 단가 ${won(it.unitPrice)}`,
        amount: won(it.amount),
      })),
      total: won(o.totalAmount),
      tax: {
        org: dash(o.recipientOrgName ?? o2?.name),
        bizNo: dash(decrypt(o2?.businessRegistrationNo)),
        ceo: dash(decrypt(o2?.representativeName)),
        email: dash(decrypt(o2?.taxEmail)),
        address: dash(decrypt(o2?.address)),
      },
      taxIssued: o.taxInvoiceStatus === "ISSUED",
    };
  }

  const qtyLabel = (q: number, unit: string | null) => `${q}${unit ?? "개"}`;

  const quoteNotices: MyQuoteNoticeRow[] = quoteReqRows
    .filter((q) => q.kind === "OPEN_BID")
    .map((q) => ({
      id: q.id,
      regDate: ymd(q.createdAt),
      title: q.title,
      sub: q.items.map((it) => `${it.name} ${it.quantity}${it.unit ?? ""}`).join(", "),
      budget: q.budgetTbd ? "미정" : won(q.budget),
      deadline: q.dueDate ? ymd(q.dueDate) : q.deadline ? ymd(q.deadline) : "-",
      proposals: `${q._count.responses}건`,
      status: QN_ST[q.status] ?? "공고중",
    }));

  const directQuotes = quoteReqRows.filter((q) => q.kind === "DIRECT");

  const productQuotes: ProductQuoteRow[] = directQuotes.map((q) => {
    const r = q.responses[0];
    const item = q.items[0];
    return {
      id: q.id,
      product: item?.name ?? q.title,
      supplier: dash(q.targetSupplierCompany?.name),
      phone: dash(decrypt(q.targetSupplierCompany?.phone) ?? q.contactPhone),
      reqDate: ymd(q.createdAt),
      qty: item ? qtyLabel(item.quantity, item.unit) : "-",
      status: r ? "견적 도착" : "대기중",
      offer: r ? { amount: won(r.totalAmount), note: dash(r.memo ?? r.specSummary) } : undefined,
    };
  });

  const quoteDetails: Record<string, MyQuoteRequestDetailView> = {};
  for (const q of directQuotes) {
    const item = q.items[0];
    const r = q.responses[0];
    const addr = [q.deliveryAddress, q.deliveryAddressDetail].filter(Boolean).join(" ");
    quoteDetails[q.id] = {
      productId: item?.productId ?? null,
      product: item?.name ?? q.title,
      supplier: dash(q.targetSupplierCompany?.name),
      org: dash(q.contactOrgName ?? org),
      dept: dash(q.contactDepartment ?? dept),
      email: dash(q.contactEmail ?? email),
      phone: dash(q.contactPhone ?? decrypt(q.targetSupplierCompany?.phone)),
      qty: item ? qtyLabel(item.quantity, item.unit) : "-",
      wishDate: q.desiredDeliveryDate ? ymd(q.desiredDeliveryDate) : "-",
      address: addr || "-",
      reqDate: ymd(q.createdAt),
      status: r ? "견적 도착" : "대기중",
      content: dash(q.description),
      attachments: q.attachments.map((a) => ({ name: a.fileName, fileUrl: a.fileUrl })),
    };
  }

  const alarmSettings: boolean[] = [
    notifRow?.orderPayment ?? true,
    notifRow?.quoteNotice ?? true,
    notifRow?.delivery ?? true,
    notifRow?.marketing ?? false,
  ];

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
      id: p.id,
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

    purchases,
    orderDetails,
    quoteNotices,
    productQuotes,
    quoteDetails,
    alarmSettings,
  };
}
