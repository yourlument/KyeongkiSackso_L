import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

const CAT_TO_FIELD: Record<string, string> = {
  "cat-1": "도로교통 및 토목 분야",
  "cat-2": "건축시설 및 전기/설비 분야",
  "cat-3": "일반행정 및 교육/지원 분야",
  "cat-4": "재난안전 및 소방/보건 분야",
  "cat-5": "정보통신 및 디지털/4차산업 분야",
  "cat-6": "환경/산림 및 조경/청소 분야",
  "cat-7": "복지/식품 및 문화/관광 분야",
};

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

export type MemberStatus = "대기" | "승인" | "반려";
export type CertStatus = "검토중" | "승인완료" | "반려";

export type MemberFullData = {
  email: string;
  joinDate: string;
  company: string;
  corpNo: string;
  bizType: string;
  bizItem: string;
  address: string;
  phone: string;
  managerName: string;
  managerPhone: string;
  bank: string;
  account: string;
  accountHolder: string;
  accountVerified: boolean;
};

export type MemberDetailData = {
  bizNo: string;
  ceo: string;
  category: string;
  region: string;
  docs: string[];
  full?: MemberFullData;
};

export type MemberRow = {
  id: string;
  name: string;
  biz: string;
  date: string;
  status: MemberStatus;
  detail: MemberDetailData;
};

export type CertRow = {
  id: string;
  name: string;
  kind: string;
  date: string;
  status: CertStatus;
};

export type AdminApprovalData = { members: MemberRow[]; certs: CertRow[] };

const APPROVAL_ST: Record<string, MemberStatus> = { PENDING: "대기", APPROVED: "승인", REJECTED: "반려" };
const CERT_ST: Record<string, CertStatus> = { REVIEWING: "검토중", APPROVED: "승인완료", REJECTED: "반려" };

export async function loadAdminApproval(): Promise<AdminApprovalData> {
  const [companies, certs] = await Promise.all([
    prisma.supplierCompany.findMany({
      orderBy: { createdAt: "desc" },
      include: { users: { select: { email: true }, take: 1 } },
    }),
    prisma.supplierCertification.findMany({
      orderBy: { submittedAt: "desc" },
      include: { supplierCompany: { select: { name: true } } },
    }),
  ]);

  const members: MemberRow[] = companies.map((c) => {
    const docs: string[] = [];
    if (c.businessLicenseFileUrl) docs.push("사업자등록증");
    const hasFull = !!(c.managerName || c.corporateRegistrationNo || c.bankName);
    return {
      id: c.id,
      name: c.name,
      biz: dash(decrypt(c.businessRegistrationNo)),
      date: ymd(c.createdAt),
      status: APPROVAL_ST[c.approvalStatus] ?? "대기",
      detail: {
        bizNo: dash(decrypt(c.businessRegistrationNo)),
        ceo: dash(decrypt(c.representativeName)),
        category: c.categoryId ? CAT_TO_FIELD[c.categoryId] ?? "-" : "-",
        region: dash(c.region),
        docs,
        full: hasFull
          ? {
              email: dash(c.users[0]?.email),
              joinDate: ymd(c.createdAt),
              company: c.name,
              corpNo: dash(decrypt(c.corporateRegistrationNo)),
              bizType: dash(c.businessType),
              bizItem: dash(c.businessItem),
              address: dash(decrypt(c.address)),
              phone: dash(decrypt(c.phone)),
              managerName: dash(c.managerName),
              managerPhone: dash(c.managerPhone),
              bank: dash(c.bankName),
              account: dash(c.bankAccountNo),
              accountHolder: dash(c.bankAccountHolder),
              accountVerified: c.bankVerifiedAt != null,
            }
          : undefined,
      },
    };
  });

  const certRows: CertRow[] = certs.map((c) => ({
    id: c.id,
    name: c.supplierCompany.name,
    kind: c.name,
    date: ymd(c.submittedAt),
    status: CERT_ST[c.status] ?? "검토중",
  }));

  return { members, certs: certRows };
}
