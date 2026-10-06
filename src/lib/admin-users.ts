import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import { certificationMarksFromNames } from "@/lib/certification-marks";

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

export type AdminUserStatus = "정상" | "차단" | "탈퇴";
export type AdminUserSort = "recent" | "name";
export type AdminUserSortDirection = "asc" | "desc";
export type AdminUserSortSelection = {
  joinedAt: AdminUserSortDirection | null;
  name: AdminUserSortDirection | null;
};

export function parseAdminUserSort(value: string | null | undefined): AdminUserSort {
  return value === "name" ? "name" : "recent";
}

export function defaultAdminUserSortDirection(sort: AdminUserSort): AdminUserSortDirection {
  return sort === "recent" ? "desc" : "asc";
}

export function parseAdminUserSortDirection(
  sort: AdminUserSort,
  value: string | null | undefined,
): AdminUserSortDirection {
  return value === "asc" || value === "desc" ? value : defaultAdminUserSortDirection(sort);
}

export function parseAdminUserSortSelection(input: {
  joinOrder?: string | null;
  nameOrder?: string | null;
  sort?: string | null;
  direction?: string | null;
}): AdminUserSortSelection {
  const hasIndependentOrder = input.joinOrder != null || input.nameOrder != null;
  if (hasIndependentOrder) {
    return {
      joinedAt: input.joinOrder === "none"
        ? null
        : input.joinOrder === "asc" || input.joinOrder === "desc"
          ? input.joinOrder
          : "desc",
      name: input.nameOrder === "asc" || input.nameOrder === "desc" ? input.nameOrder : null,
    };
  }

  const legacySort = parseAdminUserSort(input.sort);
  const legacyDirection = parseAdminUserSortDirection(legacySort, input.direction);
  return legacySort === "name"
    ? { joinedAt: null, name: legacyDirection }
    : { joinedAt: legacyDirection, name: null };
}

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
  payoutRegistered: boolean;
  payoutRegisteredAt: string;
  payoutLastError: string;
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
  createdAt: string;
  name: string;
  role: "공급업체" | "공무원";
  field: string;
  region: string;
  status: AdminUserStatus;
  supplier?: SupplierDetail;
  official?: OfficialDetail;
};

export function sortAdminUsers(
  rows: AdminUserRow[],
  sort: AdminUserSort | AdminUserSortSelection,
  direction?: AdminUserSortDirection,
): AdminUserRow[] {
  return [...rows].sort((left, right) => {
    const identity = () => left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id);
    const name = left.name.localeCompare(right.name, "ko");
    const joinedAt = left.createdAt.localeCompare(right.createdAt);
    const ordered = (value: number, order: AdminUserSortDirection) => (order === "asc" ? value : -value);

    if (typeof sort === "string") {
      const legacyDirection = direction ?? defaultAdminUserSortDirection(sort);
      if (sort === "name") return ordered(name, legacyDirection) || -joinedAt || identity();
      return ordered(joinedAt, legacyDirection) || name || identity();
    }

    if (sort.joinedAt) {
      const byJoinedAt = ordered(joinedAt, sort.joinedAt);
      if (byJoinedAt) return byJoinedAt;
    }
    if (sort.name) {
      const byName = ordered(name, sort.name);
      if (byName) return byName;
    }
    return identity();
  });
}

export async function loadAdminUsers(
  sort: AdminUserSort | AdminUserSortSelection = "recent",
  direction?: AdminUserSortDirection,
): Promise<AdminUserRow[]> {
  const [companies, officials] = await Promise.all([
    prisma.supplierCompany.findMany({
      where: {
        approvalStatus: "APPROVED",
        users: { some: { role: "SUPPLIER" } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      include: {
        users: { select: { status: true } },
        certificationRequests: {
          where: { status: "APPROVED" },
          orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
          select: { name: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "OFFICIAL" },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      include: { organization: true },
    }),
  ]);

  const supplierRows: AdminUserRow[] = companies.map((c) => {
    const field = c.categoryId ? CAT_TO_FIELD[c.categoryId] ?? "-" : "-";
    const hasActiveUser = c.users.some((u) => u.status === "ACTIVE");
    const hasWithdrawnUser = c.users.some((u) => u.status === "WITHDRAWN");
    const status: AdminUserStatus =
      hasWithdrawnUser && !hasActiveUser
        ? "탈퇴"
        : c.isRestricted
          ? "차단"
          : "정상";
    return {
      id: c.id,
      kind: "supplier",
      createdAt: c.createdAt.toISOString(),
      name: c.name,
      role: "공급업체",
      field,
      region: dash(c.region),
      status,
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
        certifications: certificationMarksFromNames(
          c.certificationRequests.map((certification) => certification.name),
        ),
        bankVerified: c.bankVerifiedAt != null,
        bankName: dash(c.bankName),
        bankAccountNo: dash(c.bankAccountNo),
        bankAccountHolder: dash(c.bankAccountHolder),
        payoutRegistered: c.nicepaySubmallSyncedAt != null,
        payoutRegisteredAt: ymd(c.nicepaySubmallSyncedAt),
        payoutLastError: dash(c.nicepaySubmallLastError),
      },
    };
  });

  const officialRows: AdminUserRow[] = officials.map((u) => {
    const dept = dash(u.departmentName ?? u.organization?.name);
    const org = u.organization;
    return {
      id: u.id,
      kind: "official",
      createdAt: u.createdAt.toISOString(),
      name: dash(decrypt(u.name)),
      role: "공무원",
      field: dept,
      region: dash(org?.region),
      status:
        u.status === "WITHDRAWN"
          ? "탈퇴"
          : u.status === "SUSPENDED"
            ? "차단"
            : "정상",
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

  return sortAdminUsers([...supplierRows, ...officialRows], sort, direction);
}
