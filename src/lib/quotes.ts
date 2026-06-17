import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}

const ST: Record<string, QuoteStatus> = {
  OPEN: "견적공고중",
  REVIEWING: "견적검토중",
  AWARDED: "선정완료",
  CLOSED: "마감",
};

export type QuoteStatus = "견적공고중" | "견적검토중" | "선정완료" | "마감";
export type QuoteRow = {
  id: string;
  title: string;
  items: string;
  org: string;
  status: QuoteStatus;
  budget: string;
  proposals: number;
  deadline: string;
  mine: boolean;
};

export async function loadQuotes(officialId?: string | null): Promise<{ rows: QuoteRow[] }> {
  const reqs = await prisma.quoteRequest.findMany({
    where: { status: { in: ["OPEN", "REVIEWING", "AWARDED", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { name: true, spec: true } },
      official: { select: { departmentName: true, organization: { select: { name: true } } } },
      _count: { select: { responses: true } },
    },
  });

  const rows: QuoteRow[] = reqs.map((r) => {
    const orgName = r.official?.organization?.name ?? null;
    const dept = r.official?.departmentName ?? null;
    const org =
      r.contactOrgName ??
      ([orgName, dept].filter(Boolean).join(" ") || "-");
    const items =
      r.items.map((i) => (i.spec ? `${i.name} ${i.spec}` : i.name)).filter(Boolean).join(", ") || "-";
    return {
      id: r.id,
      title: r.title,
      items,
      org,
      status: ST[r.status] ?? "마감",
      budget: r.budgetTbd ? "예산 미정" : r.budget != null ? `${Number(r.budget).toLocaleString("ko-KR")}원` : "-",
      proposals: r._count.responses,
      deadline: ymd(r.deadline),
      mine: !!officialId && r.officialId === officialId,
    };
  });
  return { rows };
}

const RESP_ST: Record<string, string> = {
  SUBMITTED: "접수",
  UNDER_REVIEW: "검토중",
  AWARDED: "선정",
  REJECTED: "탈락",
  WITHDRAWN: "탈락",
};

const QT: Record<string, string> = {
  GOODS: "물품 견적",
  SERVICE: "용역 견적",
};

export type QuoteDetailItem = {
  no: string;
  name: string;
  detail: string;
  chipLabel: string;
};

export type QuoteDetailProposal = {
  id: string;
  company: string;
  phone: string;
  totalAmount: string;
  specSummary: string;
  statusLabel: string;
};

export type QuoteDetailData = {
  id: string;
  title: string;
  statusLabel: string;
  quoteType: string;
  createdAt: string;
  org: string;
  categoryPath: string;
  budget: string;
  deadline: string;
  dueDate: string;
  deliveryCondition: string;
  deliveryPlace: string;
  items: QuoteDetailItem[];
  attachments: { name: string }[];
  proposals: QuoteDetailProposal[];
  isOwner: boolean;
};

export async function loadQuoteDetail(
  id: string,
  viewerId?: string | null,
): Promise<QuoteDetailData | null> {
  const req = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      official: { select: { departmentName: true, organization: { select: { name: true } } } },
      category: true,
      items: { orderBy: { id: "asc" } },
      attachments: true,
      responses: {
        include: { supplierCompany: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!req || req.status === "DRAFT" || req.status === "CANCELLED") return null;

  const catParts: string[] = [];
  let cat = req.category as { id: string; name: string; parentId: string | null } | null;
  while (cat) {
    catParts.unshift(cat.name);
    if (!cat.parentId) break;
    cat = await prisma.category.findUnique({ where: { id: cat.parentId } });
  }
  const categoryPath = catParts.join(" > ") || "-";

  const orgName = req.official?.organization?.name ?? req.contactOrgName ?? "";
  const dept = req.official?.departmentName ?? req.contactDepartment ?? "";
  const org = [dept, orgName].filter(Boolean).join(" ") || "-";

  const items: QuoteDetailItem[] = req.items.map((item, i) => ({
    no: String(i + 1).padStart(2, "0"),
    name: item.name,
    detail: [`수량: ${item.quantity}${item.unit ?? ""}`, item.spec].filter(Boolean).join(" · "),
    chipLabel: `${item.name} · ${item.quantity}${item.unit ?? ""}`,
  }));

  const proposals: QuoteDetailProposal[] = req.responses.map((r) => ({
    id: r.id,
    company: r.supplierCompany.name,
    phone: r.supplierCompany.phone ? (decrypt(r.supplierCompany.phone) ?? "-") : "-",
    totalAmount: `${Number(r.totalAmount).toLocaleString("ko-KR")}원`,
    specSummary: r.specSummary ?? "-",
    statusLabel: RESP_ST[r.status] ?? "접수",
  }));

  const deadlineYmd = ymd(req.deadline);
  const deadlineDisplay = req.deadline
    ? deadlineYmd.replace(/-/g, ". ")
    : "-";

  const addrParts = [req.deliveryAddress, req.deliveryAddressDetail].filter(Boolean);
  const deliveryPlace =
    addrParts.length > 0 ? addrParts.join(" ") : (req.deliveryPlace ?? "-");

  return {
    id: req.id,
    title: req.title,
    statusLabel: ST[req.status] ?? "마감",
    quoteType: req.quoteType ? (QT[req.quoteType] ?? req.quoteType) : "-",
    createdAt: ymd(req.createdAt),
    org,
    categoryPath,
    budget: req.budgetTbd
      ? "예산 미정"
      : req.budget != null
        ? `${Number(req.budget).toLocaleString("ko-KR")}원`
        : "-",
    deadline: deadlineDisplay,
    dueDate: ymd(req.dueDate),
    deliveryCondition: req.deliveryCondition ?? "-",
    deliveryPlace,
    items,
    attachments: req.attachments.map((a) => ({ name: a.fileName })),
    proposals,
    isOwner: !!viewerId && req.officialId === viewerId,
  };
}
