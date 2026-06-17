import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";
import { encryptLookup } from "../../src/lib/crypto/pii";

const SUBS: Array<{
  id: string;
  bizNo: string;
  company: string;
  planName: string;
  price: number;
  status: "ACTIVE" | "OVERDUE";
  startedAt: Date;
  nextBillingDate: Date | null;
  payMethod: string | null;
  cardNo: string | null;
}> = [
  {
    id: "sub-1",
    bizNo: "211-88-00001",
    company: "디지털솔루션(주)",
    planName: "프리미엄 (월간)",
    price: 299000,
    status: "ACTIVE",
    startedAt: new Date("2026-01-08"),
    nextBillingDate: new Date("2026-06-08"),
    payMethod: "법인카드",
    cardNo: "**** **** **** 1234 (삼성카드)",
  },
  {
    id: "sub-2",
    bizNo: "700-01-00007",
    company: "오피스텍(주)",
    planName: "프리미엄",
    price: 299000,
    status: "ACTIVE",
    startedAt: new Date("2026-05-03"),
    nextBillingDate: new Date("2026-06-03"),
    payMethod: null,
    cardNo: null,
  },
  {
    id: "sub-3",
    bizNo: "700-01-00009",
    company: "안전소방(주)",
    planName: "프리미엄",
    price: 299000,
    status: "ACTIVE",
    startedAt: new Date("2026-04-20"),
    nextBillingDate: new Date("2026-05-20"),
    payMethod: null,
    cardNo: null,
  },
  {
    id: "sub-4",
    bizNo: "700-01-00003",
    company: "포장산업(주)",
    planName: "프리미엄",
    price: 299000,
    status: "OVERDUE",
    startedAt: new Date("2026-04-01"),
    nextBillingDate: new Date("2026-05-01"),
    payMethod: null,
    cardNo: null,
  },
  {
    id: "sub-5",
    bizNo: "123-45-67890",
    company: "경기건설(주)",
    planName: "프리미엄",
    price: 299000,
    status: "ACTIVE",
    startedAt: new Date("2026-05-10"),
    nextBillingDate: new Date("2026-06-10"),
    payMethod: null,
    cardNo: null,
  },
  {
    id: "sub-6",
    bizNo: "700-01-00008",
    company: "네트웍솔루션(주)",
    planName: "프리미엄",
    price: 299000,
    status: "OVERDUE",
    startedAt: new Date("2026-05-01"),
    nextBillingDate: null,
    payMethod: null,
    cardNo: null,
  },
];

const SUB1_PAYMENTS: Array<{ id: string; paidAt: Date; billingMonth: string }> = [
  { id: "subpay-1-1", paidAt: new Date("2026-05-08"), billingMonth: "2026-05" },
  { id: "subpay-1-2", paidAt: new Date("2026-04-08"), billingMonth: "2026-04" },
  { id: "subpay-1-3", paidAt: new Date("2026-03-08"), billingMonth: "2026-03" },
  { id: "subpay-1-4", paidAt: new Date("2026-02-08"), billingMonth: "2026-02" },
  { id: "subpay-1-5", paidAt: new Date("2026-01-08"), billingMonth: "2026-01" },
];

export async function seedSubscriptions(prisma: PrismaClient, _ctx: SeedCtx): Promise<string> {
  let subCount = 0;

  for (const s of SUBS) {
    const company = await prisma.supplierCompany.findUnique({
      where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", s.bizNo) },
    });
    if (!company) throw new Error(`seedSubscriptions: 공급사 미존재 — ${s.company} (${s.bizNo}). prisma/seed.ts 선행 실행 필요`);

    const data = {
      supplierCompanyId: company.id,
      planName: s.planName,
      price: s.price,
      status: s.status,
      startedAt: s.startedAt,
      nextBillingDate: s.nextBillingDate,
      payMethod: s.payMethod,
      cardNo: s.cardNo,
    };
    await prisma.subscription.upsert({
      where: { id: s.id },
      update: data,
      create: { id: s.id, ...data },
    });
    subCount++;
  }

  let payCount = 0;
  for (const p of SUB1_PAYMENTS) {
    const data = {
      subscriptionId: "sub-1",
      amount: 299000,
      status: "PAID" as const,
      billingMonth: p.billingMonth,
      paidAt: p.paidAt,
    };
    await prisma.subscriptionPayment.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
    payCount++;
  }

  const restricted = await prisma.supplierCompany.findUnique({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "700-01-00008") },
  });
  if (!restricted) throw new Error("seedSubscriptions: 네트웍솔루션(주) 미존재 — prisma/seed.ts 선행 실행 필요");
  await prisma.supplierCompany.update({
    where: { id: restricted.id },
    data: { isRestricted: true },
  });

  return `구독 ${subCount}건(정상 4·미납 2) + 결제이력 ${payCount}건(sub-1) + 권한제한 1사(네트웍솔루션(주))`;
}
