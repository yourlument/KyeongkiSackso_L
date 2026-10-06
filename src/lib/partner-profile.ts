import { prisma } from "@/lib/db";
import type { PrismaClient } from "@prisma/client";
import type { Performance, Equipment } from "@/app/partner/profile/profile-data";
import {
  getSettlementAccountVerificationStatus,
  supplierCanRevokeSettlementAccount,
  type SettlementAccountVerificationStatus,
} from "@/lib/supplier-account-verification";

export function wonToEok(n: number | null | undefined): string {
  if (!n) return "";
  if (n >= 1e8) {
    const e = n / 1e8;
    return `${Number.isInteger(e) ? e : Number(e.toFixed(1))}억`;
  }
  return `${n.toLocaleString("ko-KR")}원`;
}
export function eokToWon(s: string | null | undefined): number | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  if (t.includes("억")) return Math.round(parseFloat(t) * 1e8);
  const digits = t.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export type PartnerProfileUpdate = {
  intro?: string | null;
  description?: string | null;
  manager?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    position?: string | null;
  };
  performances?: Array<{
    project: string;
    client?: string;
    year?: string;
    amount?: string;
  }>;
  equipments?: Array<{ name: string; quantity?: string }>;
  portfolioFileName?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankAccountHolder?: string | null;
  bankbookFileUrl?: string | null;
};

type PartnerProfilePersistenceClient = Pick<PrismaClient, "$transaction">;

   
                                                                              
                                                                          
   
export async function savePartnerProfile(
  companyId: string,
  data: PartnerProfileUpdate,
  db: PartnerProfilePersistenceClient = prisma,
): Promise<{ ok: true; savedAt: string }> {
  await db.$transaction(async (tx) => {
    await tx.supplierCompany.update({
      where: { id: companyId },
      data: {
        ...(data.intro !== undefined ? { intro: data.intro } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.manager
          ? {
              managerName: data.manager.name ?? null,
              managerPhone: data.manager.phone ?? null,
              managerEmail: data.manager.email ?? null,
              managerPosition: data.manager.position ?? null,
            }
          : {}),
        ...(data.portfolioFileName !== undefined
          ? { portfolioFileName: data.portfolioFileName }
          : {}),
        ...(data.bankName !== undefined ? { bankName: data.bankName } : {}),
        ...(data.bankAccountNo !== undefined
          ? { bankAccountNo: data.bankAccountNo }
          : {}),
        ...(data.bankAccountHolder !== undefined
          ? { bankAccountHolder: data.bankAccountHolder }
          : {}),
        ...(data.bankbookFileUrl !== undefined
          ? { bankbookFileUrl: data.bankbookFileUrl }
          : {}),
      },
    });

    if (data.performances !== undefined) {
      await tx.supplierPerformance.deleteMany({ where: { supplierCompanyId: companyId } });
      const rows = data.performances
        .filter((performance) => performance.project.trim())
        .map((performance, index) => ({
          supplierCompanyId: companyId,
          projectName: performance.project.trim(),
          client: performance.client?.trim() || null,
          year:
            performance.year && /\d/.test(performance.year)
              ? Number(performance.year.replace(/[^\d]/g, ""))
              : null,
          amount: eokToWon(performance.amount),
          sortOrder: index,
        }));
      if (rows.length) await tx.supplierPerformance.createMany({ data: rows });
    }

    if (data.equipments !== undefined) {
      await tx.supplierEquipment.deleteMany({ where: { supplierCompanyId: companyId } });
      const rows = data.equipments
        .filter((equipment) => equipment.name.trim())
        .map((equipment, index) => ({
          supplierCompanyId: companyId,
          name: equipment.name.trim(),
          quantity:
            equipment.quantity && /\d/.test(equipment.quantity)
              ? Number(equipment.quantity.replace(/[^\d]/g, ""))
              : 1,
          sortOrder: index,
        }));
      if (rows.length) await tx.supplierEquipment.createMany({ data: rows });
    }
  });

  return { ok: true, savedAt: new Date().toISOString() };
}

export type PartnerProfileData = {
  intro: string;
  description: string;
  portfolioFileName: string | null;
  manager: { name: string; phone: string; email: string; position: string };
  performances: Performance[];
  equipments: Equipment[];
  seal: {
    companyName: string;
    customImageUrl: string | null;
  };
  account: {
    verified: boolean;
    verificationStatus: SettlementAccountVerificationStatus;
    pending: { bankName: string; bankAccountNo: string } | null;
    canRevoke: boolean;
    bank: string;
    number: string;
    holder: string;
    summary: string;
    verifiedAt: string;
  };
};

function fmtVerifiedAt(d: Date): string {
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const [y, m, day] = k.toISOString().slice(0, 10).split("-");
  return `인증일시: ${y}. ${Number(m)}. ${Number(day)}.`;
}

export async function loadPartnerProfile(companyId: string): Promise<PartnerProfileData> {
  const c = await prisma.supplierCompany.findUnique({
    where: { id: companyId },
    include: {
      performances: { orderBy: { sortOrder: "asc" } },
      equipments: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!c) {
    return {
      intro: "", description: "", portfolioFileName: null,
      manager: { name: "", phone: "", email: "", position: "" },
      performances: [], equipments: [],
      seal: { companyName: "업체", customImageUrl: null },
      account: {
        verified: false,
        verificationStatus: "UNVERIFIED",
        pending: null,
        canRevoke: false,
        bank: "",
        number: "",
        holder: "",
        summary: "",
        verifiedAt: "",
      },
    };
  }

  const performances: Performance[] = c.performances.map((p, i) => ({
    label: `실적 ${i + 1}`,
    project: p.projectName ?? "",
    client: p.client ?? "",
    year: p.year != null ? String(p.year) : "",
    amount: wonToEok(p.amount != null ? Number(p.amount) : null),
  }));
  const equipments: Equipment[] = c.equipments.map((e) => ({ name: e.name, quantity: e.quantity != null ? `${e.quantity}대` : "" }));

  const verified = c.bankVerifiedAt != null;
  const bank = c.bankName ?? "";
  const number = c.bankAccountNo ?? "";
  const holder = c.bankAccountHolder ?? "";
  const verificationStatus = getSettlementAccountVerificationStatus(c);
  const pending = c.pendingBankName && c.pendingBankAccountNo
    ? { bankName: c.pendingBankName, bankAccountNo: c.pendingBankAccountNo }
    : null;
  const canRevoke = verified
    ? await supplierCanRevokeSettlementAccount(companyId)
    : false;

  return {
    intro: c.intro ?? "",
    description: c.description ?? "",
    portfolioFileName: c.portfolioFileName ?? null,
    manager: {
      name: c.managerName ?? "",
      phone: c.managerPhone ?? "",
      email: c.managerEmail ?? "",
      position: c.managerPosition ?? "",
    },
    performances,
    equipments,
    seal: {
      companyName: c.name.trim() || c.quoteSealCompanyName?.trim() || "업체",
      customImageUrl: c.quoteSealImageKey
        ? `/api/files/${encodeURIComponent(c.quoteSealImageKey)}`
        : null,
    },
    account: {
      verified,
      verificationStatus,
      pending,
      canRevoke,
      bank,
      number,
      holder,
      summary: bank || number ? `${bank} ${number}${holder ? ` (${holder})` : ""}`.trim() : "",
      verifiedAt: c.bankVerifiedAt ? fmtVerifiedAt(c.bankVerifiedAt) : "",
    },
  };
}
