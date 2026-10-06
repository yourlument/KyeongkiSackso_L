import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import {
  certificationMarkOptions,
  normalizeCertificationMark,
} from "@/lib/certification-options";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10);
}
const dash = (v: string | null | undefined) => (v && v.trim() ? v : "-");

function approvalRegion(address: string | null | undefined): string {
  if (!address?.trim()) return "-";
  return address.trim().split(/\s+/).slice(0, 2).join(" ");
}

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
  docs: { name: string; fileUrl: string }[];
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
  fileUrl: string;
  fileName: string;
  reviewedAt: string;
  rejectReason: string;
};

export type AdminApprovalData = {
  members: MemberRow[];
  certs: CertRow[];
  certificationNameOptions: string[];
};

const APPROVAL_ST: Record<string, MemberStatus> = { PENDING: "대기", APPROVED: "승인", REJECTED: "반려" };
const CERT_ST: Record<string, CertStatus> = { REVIEWING: "검토중", APPROVED: "승인완료", REJECTED: "반려" };

export async function loadAdminApproval(): Promise<AdminApprovalData> {
  const [companies, certs] = await Promise.all([
    prisma.supplierCompany.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: { select: { email: true }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    prisma.supplierCertification.findMany({
      orderBy: { submittedAt: "desc" },
      include: { supplierCompany: { select: { name: true } } },
    }),
  ]);

  const members: MemberRow[] = companies.map((c) => {
    const docs: { name: string; fileUrl: string }[] = [];
    if (c.businessLicenseFileUrl) docs.push({ name: "사업자등록증", fileUrl: c.businessLicenseFileUrl });
    return {
      id: c.id,
      name: c.name,
      biz: dash(decrypt(c.businessRegistrationNo)),
      date: ymd(c.createdAt),
      status: APPROVAL_ST[c.approvalStatus] ?? "대기",
      detail: {
        bizNo: dash(decrypt(c.businessRegistrationNo)),
        ceo: dash(decrypt(c.representativeName)),
        category: dash(c.category?.name ?? c.businessType),
        region: dash(c.region) !== "-" ? dash(c.region) : approvalRegion(decrypt(c.address)),
        docs,
        full: {
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
        },
      },
    };
  });

  const certRows: CertRow[] = certs.map((c) => ({
    id: c.id,
    name: c.supplierCompany.name,
    kind: normalizeCertificationMark(c.name),
    date: ymd(c.submittedAt),
    status: CERT_ST[c.status] ?? "검토중",
    fileUrl: c.fileUrl ?? "",
    fileName: c.fileName ?? "",
    reviewedAt: ymd(c.reviewedAt),
    rejectReason: c.rejectReason ?? "",
  }));

  const certificationNameOptions = certificationMarkOptions(
    certs
      .filter((certification) => certification.status === "APPROVED")
      .map((certification) => certification.name),
  );

  return { members, certs: certRows, certificationNameOptions };
}
