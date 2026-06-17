import type { PrismaClient } from "@prisma/client";
import { encField, encryptLookup } from "../../src/lib/crypto/pii";
import type { SeedCtx } from "./types";

type OStatus = "PENDING" | "PAID" | "SHIPPING" | "DELIVERED" | "COMPLETED";
type TaxStatus = "NONE" | "REQUESTED" | "ISSUED";

export async function seedOrders(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  const official = await prisma.user.findUnique({ where: { email: "official@korlink.co.kr" } });
  const hwaseongOrg = await prisma.organization.findUnique({
    where: { businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", "123-45-67890") },
  });
  const findCompany = (bizNo: string) =>
    prisma.supplierCompany.findUnique({
      where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", bizNo) },
    });
  const ggBuild = await findCompany("123-45-67890");
  const digital = await findCompany("211-88-00001");
  const fire = await findCompany("700-01-00009");
  const officeFurn = await findCompany("700-01-00013");
  const medical = await findCompany("700-01-00012");
  if (!official || !hwaseongOrg || !ggBuild || !digital || !fire || !officeFurn || !medical) {
    throw new Error("seedOrders: 기본 시드(prisma/seed.ts) 엔티티 누락 — seed.ts 선실행 필요");
  }

  const networkTek = await prisma.supplierCompany.upsert({
    where: { id: "sco-네트워크텍(주)" },
    update: { approvalStatus: "APPROVED" },
    create: {
      id: "sco-네트워크텍(주)",
      name: "네트워크텍(주)",
      representativeName: encField("SupplierCompany", "representativeName", "네트워크텍(주)")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "999-00-10009")!,
      approvalStatus: "APPROVED",
    },
  });
  const secureTek = await prisma.supplierCompany.upsert({
    where: { id: "sco-시큐어텍(주)" },
    update: { approvalStatus: "APPROVED" },
    create: {
      id: "sco-시큐어텍(주)",
      name: "시큐어텍(주)",
      representativeName: encField("SupplierCompany", "representativeName", "시큐어텍(주)")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "999-00-10010")!,
      approvalStatus: "APPROVED",
    },
  });

  await prisma.supplierCompany.update({
    where: { id: digital.id },
    data: {
      representativeName: encField("SupplierCompany", "representativeName", "김태현")!,
      phone: encField("SupplierCompany", "phone", "031-780-4500"),
    },
  });

  const ggProvince = await prisma.organization.upsert({
    where: { id: "org-경기도청" },
    update: {},
    create: {
      id: "org-경기도청",
      name: "경기도청",
      businessRegistrationNo: encField("Organization", "businessRegistrationNo", "124-83-00001"),
      representativeName: encField("Organization", "representativeName", "김동연"),
      taxEmail: encField("Organization", "taxEmail", "tax@gg.go.kr"),
      address: encField("Organization", "address", "경기도 수원시 팔달구 효원로 1"),
    },
  });
  void ggProvince;
  const suwonOrg = await prisma.organization.upsert({
    where: { id: "org-수원시청" },
    update: {},
    create: { id: "org-수원시청", name: "수원시청" },
  });
  const seongnamOrg = await prisma.organization.upsert({
    where: { id: "org-성남시청" },
    update: {},
    create: { id: "org-성남시청", name: "성남시청" },
  });

  const newUsers: string[] = [];
  async function upsertOfficial(args: { name: string; orgId: string; dept?: string }): Promise<string> {
    const email = `seed-${args.name.replace(/\s/g, "")}@korlink.demo`;
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        name: encField("User", "name", args.name)!,
        organizationId: args.orgId,
        departmentName: args.dept ?? null,
      },
    });
    newUsers.push(email);
    return u.id;
  }
  const uKim = await upsertOfficial({ name: "김주무관", orgId: hwaseongOrg.id, dept: "도로관리과" });
  const uLeeD = await upsertOfficial({ name: "이담당", orgId: hwaseongOrg.id, dept: "정보통신과" });
  const uParkJ = await upsertOfficial({ name: "박주임", orgId: hwaseongOrg.id, dept: "안전총괄과" });
  const uChoi = await upsertOfficial({ name: "최담당", orgId: suwonOrg.id, dept: "총무과" });
  const uJeong = await upsertOfficial({ name: "정주무관", orgId: suwonOrg.id, dept: "보건소" });
  const uLeeDaeri = await upsertOfficial({ name: "이대리", orgId: hwaseongOrg.id });
  const uParkGwa = await upsertOfficial({ name: "박과장", orgId: seongnamOrg.id });

  type ItemDef = { name: string; spec?: string; qty: number; unit: number; product?: string };
  type OrderDef = {
    id: string;
    orderNo: string;
    date: string;
    status: OStatus;
    total: number;
    supplierId: string;
    buyerId: string;
    tax: TaxStatus;
    settlementId?: string;
    recipient?: { name?: string; phone?: string; org?: string; dept?: string; addr?: string; memo?: string };
    delivery?: { deadline?: string; place?: string; contact?: string };
    items: ItemDef[];
  };

  const PARTNER_ORDERS: OrderDef[] = [
    {
      id: "ord-1", orderNo: "ORD-2026-101", date: "2026-05-15", status: "PAID", total: 900000,
      supplierId: digital.id, buyerId: uKim, tax: "REQUESTED",
      recipient: { name: "김과장", phone: "010-1234-5678", org: "화성시청", dept: "도로관리과", addr: "경기도 화성시 향남로 45 시청본관", memo: "출고 전 연락 부탁드립니다" },
      delivery: { deadline: "2026-05-25", place: "경기도 화성시 향남로 45 시청본관 도로과", contact: "010-1234-5678" },
      items: [{ name: "반사형 교통콘 750mm", spec: "20개 · 단가 45,000원", qty: 20, unit: 45000 }],
    },
    {
      id: "ord-2", orderNo: "ORD-2026-102", date: "2026-05-10", status: "PAID", total: 1200000,
      supplierId: digital.id, buyerId: uLeeD, tax: "NONE",
      recipient: { name: "이담당", org: "화성시청", dept: "정보통신과" },
      items: [{ name: "방호울타리 강관형 W-빔 4m", qty: 10, unit: 120000 }],
    },
    {
      id: "ord-3", orderNo: "ORD-2026-103", date: "2026-05-05", status: "SHIPPING", total: 400000,
      supplierId: digital.id, buyerId: uParkJ, tax: "NONE",
      recipient: { name: "박주임", org: "화성시청", dept: "안전총괄과" },
      items: [{ name: "도로표지판 주의 900mm", qty: 5, unit: 80000 }],
    },
    {
      id: "ord-4", orderNo: "ORD-2026-104", date: "2026-04-20", status: "DELIVERED", total: 1440000,
      supplierId: digital.id, buyerId: uChoi, tax: "NONE",
      recipient: { name: "최담당", org: "수원시청", dept: "총무과" },
      items: [{ name: "사무용 책상 1400x700", qty: 8, unit: 180000 }],
    },
    {
      id: "ord-5", orderNo: "ORD-2026-105", date: "2026-04-15", status: "DELIVERED", total: 1950000,
      supplierId: digital.id, buyerId: uJeong, tax: "NONE",
      recipient: { name: "정주무관", org: "수원시청", dept: "보건소" },
      items: [{ name: "학생용 책상 600x400", qty: 30, unit: 65000 }],
    },
  ];

  const MY_ORDERS: OrderDef[] = [
    {
      id: "ord-6", orderNo: "o001", date: "2026-04-01", status: "COMPLETED", total: 1625000,
      supplierId: ggBuild.id, buyerId: official.id, tax: "ISSUED",
      recipient: { org: "화성시청", dept: "도로관리과" },
      items: [
        { name: "레미콘 24-40-140", spec: "10m³", qty: 10, unit: 115000, product: "demo-1" },
        { name: "아스콘 표준배합 15-40", spec: "5톤", qty: 5, unit: 95000, product: "demo-3" },
      ],
    },
    {
      id: "ord-7", orderNo: "o002", date: "2026-04-15", status: "PAID", total: 4450000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE", settlementId: "set-3",
      recipient: { name: "박주임", phone: "031-369-1234", org: "화성시청", dept: "정보통신과" },
      items: [{ name: "업무용 PC i7/16GB/512GB", spec: "5대", qty: 5, unit: 890000, product: "demo-6" }],
    },
    {
      id: "ord-8", orderNo: "o003", date: "2026-04-20", status: "SHIPPING", total: 1780000,
      supplierId: fire.id, buyerId: official.id, tax: "NONE",
      recipient: { org: "화성시청", dept: "안전총괄과" },
      items: [
        { name: "분말소화기 3.3kg", spec: "20개", qty: 20, unit: 35000, product: "demo-9" },
        { name: "소방호스 65A 20m", spec: "10개", qty: 10, unit: 108000, product: "demo-10" },
      ],
    },
    {
      id: "ord-9", orderNo: "o004", date: "2026-05-07", status: "PENDING", total: 1450000,
      supplierId: officeFurn.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "일반 사무용 책상 1400x700", spec: "10개", qty: 10, unit: 145000, product: "demo-13" }],
    },
    {
      id: "ord-10", orderNo: "o005", date: "2026-03-20", status: "COMPLETED", total: 475000,
      supplierId: medical.id, buyerId: official.id, tax: "REQUESTED",
      recipient: { org: "화성시청", dept: "보건소" },
      items: [{ name: "자동전자혈압계 상완식", spec: "5대", qty: 5, unit: 95000, product: "demo-12" }],
    },
    {
      id: "ord-11", orderNo: "o006", date: "2026-03-10", status: "DELIVERED", total: 22600000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE", settlementId: "set-5",
      recipient: { org: "수원시청", dept: "스마트도시과" },
      items: [
        { name: "업무용 PC i7/16GB/512GB", spec: "20대", qty: 20, unit: 890000, product: "demo-6" },
        { name: "24인치 FHD 모니터", spec: "20대", qty: 20, unit: 240000 },
      ],
    },
    {
      id: "ord-12", orderNo: "o007", date: "2026-04-28", status: "SHIPPING", total: 4250000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "레이저 프린터 흑백 A4 45ppm", spec: "10대", qty: 10, unit: 425000 }],
    },
    {
      id: "ord-13", orderNo: "o008", date: "2026-05-03", status: "PAID", total: 9250000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      recipient: { org: "성남시청" },
      items: [{ name: "48포트 L3 관리형 스위치", spec: "5대", qty: 5, unit: 1850000 }],
    },
    {
      id: "ord-14", orderNo: "o009", date: "2026-05-06", status: "PENDING", total: 25800000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "업무용 PC i7/16GB/512GB", spec: "30대", qty: 30, unit: 860000, product: "demo-6" }],
    },
    {
      id: "ord-15", orderNo: "o010", date: "2026-01-02", status: "DELIVERED", total: 5400000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "IT 시스템 유지보수 서비스", spec: "12개월", qty: 12, unit: 450000 }],
    },
    {
      id: "ord-16", orderNo: "o011", date: "2026-03-01", status: "SHIPPING", total: 2280000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "홈페이지 유지보수 및 운영 대행", spec: "6개월", qty: 6, unit: 380000 }],
    },
    {
      id: "ord-17", orderNo: "o012", date: "2026-05-05", status: "PAID", total: 3200000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "전산장비 설치 및 네트워크 구성 서비스", spec: "1식", qty: 1, unit: 3200000 }],
    },
    {
      id: "ord-18", orderNo: "o013", date: "2026-05-07", status: "PENDING", total: 8500000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "사이버보안 취약점 진단 및 컨설팅", spec: "1식", qty: 1, unit: 8500000 }],
    },
    {
      id: "ord-19", orderNo: "o014", date: "2026-04-05", status: "COMPLETED", total: 2560000,
      supplierId: networkTek.id, buyerId: official.id, tax: "REQUESTED",
      items: [{ name: "무선 AP 듀얼밴드 802.11ax", spec: "8대", qty: 8, unit: 320000 }],
    },
    {
      id: "ord-20", orderNo: "o015", date: "2026-04-12", status: "COMPLETED", total: 3700000,
      supplierId: digital.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "NAS 저장장치 4베이 16TB", spec: "2대", qty: 2, unit: 1850000 }],
    },
    {
      id: "ord-21", orderNo: "o016", date: "2026-03-28", status: "DELIVERED", total: 4200000,
      supplierId: secureTek.id, buyerId: official.id, tax: "NONE",
      items: [{ name: "CCTV IP카메라 4MP 풀HD", spec: "15대", qty: 15, unit: 280000 }],
    },
  ];

  const SETTLEMENTS: Array<{ id: string; start: string; end: string; gross: number; payout: number; status: "PENDING" | "PAID"; sched: string; note?: string }> = [
    { id: "set-1", start: "2026-05-01", end: "2026-05-31", gross: 16800000, payout: 16800000, status: "PENDING", sched: "2026-05-10" },
    { id: "set-2", start: "2026-05-01", end: "2026-05-31", gross: 3490000, payout: 3490000, status: "PAID", sched: "2026-05-10" },
    { id: "set-3", start: "2026-04-01", end: "2026-04-30", gross: 3390000, payout: 3390000, status: "PAID", sched: "2026-04-10", note: "2026-04-16 송금" },
    { id: "set-4", start: "2026-04-01", end: "2026-04-30", gross: 8650000, payout: 8650000, status: "PENDING", sched: "2026-04-10" },
    { id: "set-5", start: "2026-03-01", end: "2026-03-31", gross: 2400000, payout: 2400000, status: "PAID", sched: "2026-04-10" },
    { id: "set-6", start: "2026-02-01", end: "2026-02-28", gross: 9750000, payout: 9750000, status: "PAID", sched: "2026-03-10" },
    { id: "set-7", start: "2026-01-01", end: "2026-01-31", gross: 36450000, payout: 36450000, status: "PAID", sched: "2026-02-10" },
    { id: "set-8", start: "2026-12-01", end: "2026-12-31", gross: 18500000, payout: 18500000, status: "PAID", sched: "2026-01-10" },
  ];
  for (const s of SETTLEMENTS) {
    const data = {
      supplierCompanyId: digital.id,
      periodStart: new Date(s.start),
      periodEnd: new Date(s.end),
      amount: s.payout,
      status: s.status,
      grossAmount: s.gross,
      fee: 0,
      scheduledPayoutDate: new Date(s.sched),
      settleNote: s.note ?? null,
    };
    await prisma.settlement.upsert({ where: { id: s.id }, update: data, create: { id: s.id, ...data } });
  }

  const ALL_ORDERS = [...PARTNER_ORDERS, ...MY_ORDERS];
  for (const o of ALL_ORDERS) {
    const data = {
      orderNo: o.orderNo,
      buyerId: o.buyerId,
      totalAmount: o.total,
      status: o.status,
      taxInvoiceStatus: o.tax,
      recipientName: o.recipient?.name ?? null,
      recipientPhone: o.recipient?.phone ?? null,
      recipientOrgName: o.recipient?.org ?? null,
      recipientDepartment: o.recipient?.dept ?? null,
      deliveryAddress: o.recipient?.addr ?? null,
      deliveryMemo: o.recipient?.memo ?? null,
      deliveryDeadline: o.delivery?.deadline ? new Date(o.delivery.deadline) : null,
      deliveryPlace: o.delivery?.place ?? null,
      siteContactPhone: o.delivery?.contact ?? null,
      settlementId: o.settlementId ?? null,
      createdAt: new Date(o.date),
    };
    await prisma.order.upsert({ where: { id: o.id }, update: data, create: { id: o.id, ...data } });
    for (let m = 0; m < o.items.length; m++) {
      const it = o.items[m];
      const itemData = {
        orderId: o.id,
        productId: it.product ?? null,
        supplierCompanyId: o.supplierId,
        name: it.name,
        spec: it.spec ?? null,
        quantity: it.qty,
        unitPrice: it.unit,
        amount: it.qty * it.unit,
      };
      const itemId = `ordi-${o.id.replace("ord-", "")}-${m + 1}`;
      await prisma.orderItem.upsert({ where: { id: itemId }, update: itemData, create: { id: itemId, ...itemData } });
    }
  }

  const PAYMENTS: Array<{ id: string; orderId: string; amount: number; method: string; txnId: string | null; paidAt: string }> = [
    { id: "pay-1", orderId: "ord-7", amount: 4450000, method: "가상계좌", txnId: "PG-20260415-001234", paidAt: "2026-04-15T11:20:00" },
    { id: "pay-2", orderId: "ord-6", amount: 1625000, method: "법인카드", txnId: "PG-20260401-002345", paidAt: "2026-04-01T09:30:00" },
    { id: "pay-3", orderId: "ord-8", amount: 1780000, method: "법인카드", txnId: "PG-20260420-003456", paidAt: "2026-04-20T14:15:00" },
    { id: "pay-4", orderId: "ord-11", amount: 22600000, method: "법인카드", txnId: "PG-20260310-004567", paidAt: "2026-03-10T10:00:00" },
    { id: "pay-5", orderId: "ord-10", amount: 475000, method: "법인카드", txnId: "PG-20260320-005678", paidAt: "2026-03-20T11:30:00" },
    { id: "pay-6", orderId: "ord-1", amount: 900000, method: "카드결제", txnId: null, paidAt: "2026-05-15" },
  ];
  for (const p of PAYMENTS) {
    const data = {
      orderId: p.orderId,
      provider: "MOCK" as const,
      status: "PAID" as const,
      amount: p.amount,
      method: p.method,
      transactionId: p.txnId,
      paidAt: new Date(p.paidAt),
    };
    await prisma.payment.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
  }

  const REFUNDS: Array<{ id: string; orderId: string; paymentId: string | null; requesterId: string; reason: string; date: string }> = [
    { id: "rfr-1", orderId: "ord-8", paymentId: "pay-3", requesterId: uLeeDaeri, date: "2026-04-22",
      reason: "납품 물품 규격 불일치 (발주한 3.3kg 소화기가 아닌 2.5kg 제품 배송됨)" },
    { id: "rfr-2", orderId: "ord-13", paymentId: null, requesterId: uParkGwa, date: "2026-05-04",
      reason: "예산 삭감으로 인해 구매 취소 요청" },
  ];
  for (const r of REFUNDS) {
    const data = {
      orderId: r.orderId,
      paymentId: r.paymentId,
      requesterId: r.requesterId,
      reason: r.reason,
      status: "PENDING" as const,
      createdAt: new Date(r.date),
    };
    await prisma.refundRequest.upsert({ where: { id: r.id }, update: data, create: { id: r.id, ...data } });
  }

  return `orders: 주문 ${ALL_ORDERS.length}건(파트너 5 + 공무원 ${MY_ORDERS.length}) / 품목 ${ALL_ORDERS.reduce((n, o) => n + o.items.length, 0)} / 결제 ${PAYMENTS.length} / 환불요청 ${REFUNDS.length} / 정산 ${SETTLEMENTS.length} + 신규 공급사 2(sco-*) · 기관 1(org-경기도청) · 공무원 ${newUsers.length}`;
}
