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

export type AdminUserStatus = "정상" | "차단";

export type SupplierDetail = {
  fieldLabel: string;
  joinDate: string;
  region: string;
  bizNo: string;
  repName: string;
  taxOrgName: string;
  taxEmail: string;
  taxAddress: string;
  licenseFileName: string;
  licenseFileUrl: string;
  certifications: string[];
  bankVerified: boolean;
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
};

export type OfficialDetail = {
  dept: string;
  joinDate: string;
  region: string;
  orgBizNo: string;
  orgName: string;
  orgRepName: string;
  orgTaxEmail: string;
  orgAddress: string;
};

export type AdminUserRow = {
  id: string;
  kind: "supplier" | "official";
  name: string;
  role: "공급업체" | "공무원";
  field: string;
  region: string;
  status: AdminUserStatus;
  supplier?: SupplierDetail;
  official?: OfficialDetail;
};

export async function loadAdminUsers(): Promise<AdminUserRow[]> {
  const [companies, officials] = await Promise.all([
    prisma.supplierCompany.findMany({
      where: { approvalStatus: "APPROVED" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "OFFICIAL" },
      orderBy: { createdAt: "asc" },
      include: { organization: true },
    }),
  ]);

  const supplierRows: AdminUserRow[] = companies.map((c) => {
    const field = c.categoryId ? CAT_TO_FIELD[c.categoryId] ?? "-" : "-";
    return {
      id: c.id,
      kind: "supplier",
      name: c.name,
      role: "공급업체",
      field,
      region: dash(c.region),
      status: c.isRestricted ? "차단" : "정상",
      supplier: {
        fieldLabel: field === "-" ? "" : field,
        joinDate: ymd(c.createdAt),
        region: dash(c.region),
        bizNo: dash(decrypt(c.businessRegistrationNo)),
        repName: dash(decrypt(c.representativeName)),
        taxOrgName: c.name,
        taxEmail: dash(c.taxEmail),
        taxAddress: dash(decrypt(c.address)),
        licenseFileName: dash(c.businessLicenseFileUrl),
        licenseFileUrl: c.businessLicenseFileUrl ?? "",
        certifications: c.certifications ?? [],
        bankVerified: c.bankVerifiedAt != null,
        bankName: dash(c.bankName),
        bankAccountNo: dash(c.bankAccountNo),
        bankAccountHolder: dash(c.bankAccountHolder),
      },
    };
  });

  const officialRows: AdminUserRow[] = officials.map((u) => {
    const dept = dash(u.departmentName ?? u.organization?.name);
    const org = u.organization;
    return {
      id: u.id,
      kind: "official",
      name: dash(decrypt(u.name)),
      role: "공무원",
      field: dept,
      region: dash(org?.region),
      status: u.status === "ACTIVE" ? "정상" : "차단",
      official: {
        dept: dept === "-" ? "" : dept,
        joinDate: ymd(u.createdAt),
        region: dash(org?.region),
        orgBizNo: dash(decrypt(org?.businessRegistrationNo)),
        orgName: dash(org?.name),
        orgRepName: dash(decrypt(org?.representativeName)),
        orgTaxEmail: dash(decrypt(org?.taxEmail)),
        orgAddress: dash(decrypt(org?.address)),
      },
    };
  });

  return [...supplierRows, ...officialRows];
}
