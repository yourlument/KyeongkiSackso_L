import { prisma } from "@/lib/db";
import type { Performance, Equipment } from "@/app/partner/profile/profile-data";

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

export type PartnerProfileData = {
  intro: string;
  description: string;
  manager: { name: string; phone: string; email: string; position: string };
  performances: Performance[];
  equipments: Equipment[];
  account: { verified: boolean; bank: string; number: string; holder: string; summary: string; verifiedAt: string };
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
      intro: "", description: "",
      manager: { name: "", phone: "", email: "", position: "" },
      performances: [], equipments: [],
      account: { verified: false, bank: "", number: "", holder: "", summary: "", verifiedAt: "" },
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

  return {
    intro: c.intro ?? "",
    description: c.description ?? "",
    manager: {
      name: c.managerName ?? "",
      phone: c.managerPhone ?? "",
      email: c.managerEmail ?? "",
      position: c.managerPosition ?? "",
    },
    performances,
    equipments,
    account: {
      verified,
      bank,
      number,
      holder,
      summary: bank || number ? `${bank} ${number}${holder ? ` (${holder})` : ""}`.trim() : "",
      verifiedAt: c.bankVerifiedAt ? fmtVerifiedAt(c.bankVerifiedAt) : "",
    },
  };
}
