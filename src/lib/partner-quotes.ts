import { prisma } from "@/lib/db";
import type {
  ProductRequest,
  AnnouncementRow,
  Proposal,
  ProposalStatusKind,
} from "@/app/partner/quotes/quotes-data";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}원`;
}
function qtyText(items: { quantity: number; unit: string | null }[]): string {
  if (items.length === 0) return "-";
  const it = items[0];
  return `${it.quantity}${it.unit ?? "개"}`;
}

const RESP_KIND: Record<string, ProposalStatusKind> = {
  SUBMITTED: "접수",
  UNDER_REVIEW: "검토중",
  AWARDED: "선정",
  REJECTED: "탈락",
  WITHDRAWN: "접수",
};

export type PartnerQuotesData = {
  stats: { total: number; waiting: number; submitted: number };
  productRequests: ProductRequest[];
  announcements: AnnouncementRow[];
  proposals: Proposal[];
};

export async function loadPartnerQuotes(companyId: string): Promise<PartnerQuotesData> {
  const officialInclude = {
    official: { select: { departmentName: true, organization: { select: { name: true } } } },
  };

  const direct = await prisma.quoteRequest.findMany({
    where: { kind: "DIRECT", targetSupplierCompanyId: companyId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      attachments: { select: { fileName: true, fileUrl: true }, take: 1 },
      responses: { where: { supplierCompanyId: companyId }, take: 1 },
      ...officialInclude,
    },
  });

  const productRequests: ProductRequest[] = direct.map((q) => {
    const myResp = q.responses[0];
    const orgName = q.contactOrgName ?? q.official?.organization?.name ?? "-";
    const dept = q.contactDepartment ?? q.official?.departmentName ?? "";
    return {
      id: q.id,
      product: q.items[0]?.name ?? q.title,
      status: myResp ? "견적 제출됨" : "대기중",
      org: dept ? `${orgName} ${dept}` : orgName,
      qty: qtyText(q.items),
      deadline: ymd(q.deadline),
      ...(myResp ? { amount: won(myResp.totalAmount), submittedAt: `${ymd(myResp.createdAt)} 제출` } : {}),
      detail: {
        orgName,
        department: dept || "-",
        email: q.contactEmail ?? "-",
        phone: q.contactPhone ?? "-",
        reqQty: qtyText(q.items),
        desiredDate: ymd(q.desiredDeliveryDate ?? q.dueDate),
        address: [q.deliveryAddress, q.deliveryAddressDetail].filter(Boolean).join(" ") || q.deliveryPlace || "-",
        note: q.description ?? "-",
        attachment: q.attachments[0]?.fileName ?? "첨부 파일 없음",
        attachmentUrl: q.attachments[0]?.fileUrl ?? null,
      },
    };
  });

  const submittedCount = productRequests.filter((r) => r.status === "견적 제출됨").length;
  const stats = { total: productRequests.length, waiting: productRequests.length - submittedCount, submitted: submittedCount };

  const open = await prisma.quoteRequest.findMany({
    where: { kind: "OPEN_BID", status: { in: ["OPEN", "REVIEWING"] } },
    orderBy: { createdAt: "desc" },
    include: { items: true, _count: { select: { responses: true } }, ...officialInclude },
  });

  const announcements: AnnouncementRow[] = open.map((q) => {
    const orgName = q.contactOrgName ?? q.official?.organization?.name ?? "-";
    const dept = q.contactDepartment ?? q.official?.departmentName ?? "";
    return {
      id: q.id,
      title: q.title,
      items: q.items.map((i) => i.name).join(", ") || "-",
      org: dept ? `${orgName} ${dept}` : orgName,
      budget: q.budgetTbd ? "미정" : won(q.budget),
      deadline: ymd(q.deadline),
      proposals: `${q._count.responses}건`,
    };
  });

  const myResponses = await prisma.quoteResponse.findMany({
    where: { supplierCompanyId: companyId },
    orderBy: { createdAt: "desc" },
    include: { quoteRequest: { include: officialInclude }, attachments: { select: { fileName: true, fileUrl: true }, take: 1 } },
  });

  const proposals: Proposal[] = myResponses.map((r) => {
    const q = r.quoteRequest;
    const orgName = q.contactOrgName ?? q.official?.organization?.name ?? "-";
    return {
      id: r.id,
      quoteRequestId: q.id,
      title: q.title,
      statusKind: RESP_KIND[r.status] ?? "접수",
      org: orgName,
      deadline: ymd(q.deadline),
      submittedAt: ymd(r.createdAt),
      amount: won(r.totalAmount),
      spec: r.specSummary ?? "-",
      attachment: r.attachments[0]?.fileName ?? "첨부 파일 없음",
      attachmentUrl: r.attachments[0]?.fileUrl ?? null,
    };
  });

  return { stats, productRequests, announcements, proposals };
}
