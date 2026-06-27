import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");
const comma = (v: { toString(): string } | number | null | undefined) =>
  v == null ? null : Number(v).toLocaleString("ko-KR");
const won = (v: { toString(): string } | number | null | undefined) => {
  const c = comma(v);
  return c == null ? "-" : `${c}원`;
};

export type BidStatus = "공고중" | "검토중" | "선정완료" | "마감";
const BID_ST: Record<string, BidStatus> = {
  OPEN: "공고중",
  REVIEWING: "검토중",
  AWARDED: "선정완료",
  CLOSED: "마감",
};
const RESP_ST: Record<string, string> = {
  SUBMITTED: "접수",
  UNDER_REVIEW: "검토중",
  AWARDED: "선정",
  REJECTED: "탈락",
  WITHDRAWN: "철회",
};

export type ProductRow = {
  id: string;
  itemNo: string;
  name: string;
  company: string;
  category: string;
  price: string;
  status: "정상";
};

export type BidRow = {
  id: string;
  status: BidStatus;
  name: string;
  org: string;
  phone: string;
  budget: string;
  due: string;
  bids: string;
};

export type QuoteItem = {
  no: string;
  name: string;
  qty: string;
};

export type BidEntry = {
  quoteId: string;
  responseId: string;
  company: string;
  phone: string;
  amount: string;
  state: string;
  spec: string;
  date: string;
  quoteNo?: string;
  budgetRatio?: string;
  items?: QuoteItem[];
};

export type AdminContentsData = {
  productRows: ProductRow[];
  bidRows: BidRow[];
  bidEntries: Record<string, BidEntry[]>;
  filterCounts: Record<"전체" | BidStatus, number>;
};

export async function loadAdminContents(): Promise<AdminContentsData> {
  const [products, requests] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      include: {
        supplierCompany: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.quoteRequest.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        official: { include: { organization: { select: { name: true, phone: true } } } },
        responses: {
          orderBy: { createdAt: "asc" },
          include: {
            supplierCompany: { select: { name: true, phone: true } },
            quoteRequest: { select: { items: { orderBy: { id: "asc" } } } },
          },
        },
      },
    }),
  ]);

  const productRows: ProductRow[] = products.map((p) => ({
    id: p.id,
    itemNo: dash(p.npsCode),
    name: p.name,
    company: p.supplierCompany.name,
    category: dash(p.category?.name),
    price: won(p.price),
    status: "정상",
  }));

  const sorted = [...requests].sort((a, b) => {
    if (b.responses.length !== a.responses.length) return b.responses.length - a.responses.length;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const bidRows: BidRow[] = sorted.map((q) => {
    const org = q.official.organization;
    return {
      id: q.id,
      status: BID_ST[q.status] ?? "마감",
      name: q.title,
      org: dash(org?.name),
      phone: dash(org?.phone),
      budget: q.budget != null ? won(q.budget) : "-",
      due: ymd(q.deadline),
      bids: `${q.responses.length}건`,
    };
  });

  const bidEntries: Record<string, BidEntry[]> = {};
  for (const quote of sorted) {
    bidEntries[quote.id] = quote.responses.map((r) => {
      const items: QuoteItem[] = (r.quoteRequest.items ?? []).map((it, i) => ({
        no: String(i + 1),
        name: it.name,
        qty: it.unit ? `${it.quantity}${it.unit}` : String(it.quantity),
      }));
      const ratio =
        quote.budget != null && Number(quote.budget) > 0
          ? `${((Number(r.totalAmount) / Number(quote.budget)) * 100).toFixed(1)}%`
          : undefined;
      return {
        quoteId: quote.id,
        responseId: r.id,
        company: r.supplierCompany.name,
        phone: dash(decrypt(r.supplierCompany.phone)),
        amount: won(r.totalAmount),
        state: RESP_ST[r.status] ?? "접수",
        spec: dash(r.specSummary),
        date: ymd(r.createdAt),
        ...(r.quoteNo ? { quoteNo: r.quoteNo } : {}),
        ...(ratio ? { budgetRatio: ratio } : {}),
        ...(items.length ? { items } : {}),
      };
    });
  }

  const filterCounts: Record<"전체" | BidStatus, number> = {
    전체: bidRows.length,
    공고중: bidRows.filter((b) => b.status === "공고중").length,
    검토중: bidRows.filter((b) => b.status === "검토중").length,
    선정완료: bidRows.filter((b) => b.status === "선정완료").length,
    마감: bidRows.filter((b) => b.status === "마감").length,
  };

  return { productRows, bidRows, bidEntries, filterCounts };
}
