import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";
import { encField, encryptLookup } from "../../src/lib/crypto/pii";

const UPLOAD_DIR = "/uploads/quotes";

export async function seedQuotes(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  const official = await prisma.user.findUnique({
    where: { email: "official@korlink.co.kr" },
    select: { id: true },
  });
  const hwaseongOrg = await prisma.organization.findUnique({
    where: { businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", "123-45-67890") },
    select: { id: true },
  });
  const findCompany = (bizNo: string) =>
    prisma.supplierCompany.findUnique({
      where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", bizNo) },
      select: { id: true },
    });
  const digital = await findCompany("211-88-00001");
  const ggBuild = await findCompany("123-45-67890");
  const hsRemicon = await findCompany("700-01-00002");
  const pojang = await findCompany("700-01-00003");
  const netsol = await findCompany("700-01-00008");
  if (!official || !hwaseongOrg || !digital || !ggBuild || !hsRemicon || !pojang || !netsol) {
    throw new Error("seedQuotes: 기본 시드(prisma/seed.ts) 엔티티 누락 — seed.ts 선실행 필요");
  }

  const machinery = await prisma.supplierCompany.upsert({
    where: { id: "sco-기계공업(주)" },
    update: { approvalStatus: "APPROVED" },
    create: {
      id: "sco-기계공업(주)",
      name: "기계공업(주)",
      representativeName: encField("SupplierCompany", "representativeName", "기계공업(주)")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "999-00-10001")!,
      phone: encField("SupplierCompany", "phone", "031-123-4567"),
      approvalStatus: "APPROVED",
    },
  });

  await prisma.supplierCompany.update({
    where: { id: hsRemicon.id },
    data: { phone: encField("SupplierCompany", "phone", "031-234-5678") },
  });
  await prisma.supplierCompany.update({
    where: { id: pojang.id },
    data: { phone: encField("SupplierCompany", "phone", "031-345-6789") },
  });
  await prisma.supplierCompany.update({
    where: { id: netsol.id },
    data: { phone: encField("SupplierCompany", "phone", "031-555-1234") },
  });

  const ORGS = ["수원시청", "성남시청", "용인시청", "평택시청", "안양시청", "용인시 교육지원청"];
  const orgIds = new Map<string, string>();
  for (const name of ORGS) {
    const o = await prisma.organization.upsert({
      where: { id: `org-${name}` },
      update: {},
      create: { id: `org-${name}`, name },
    });
    orgIds.set(name, o.id);
  }
  orgIds.set("화성시청", hwaseongOrg.id);

  const newUsers: string[] = [];
  async function upsertOfficial(args: { email: string; name: string; orgName: string; dept?: string; phone?: string }) {
    const u = await prisma.user.upsert({
      where: { email: args.email },
      update: {},
      create: {
        email: args.email,
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        name: encField("User", "name", args.name)!,
        phone: args.phone ? encField("User", "phone", args.phone) : null,
        organizationId: orgIds.get(args.orgName) ?? null,
        departmentName: args.dept ?? null,
      },
    });
    newUsers.push(args.email);
    return u.id;
  }

  const uIt = await upsertOfficial({ email: "seed-화성시청정보통신과@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "정보통신과" });
  const uSafety = await upsertOfficial({ email: "seed-화성시청안전총괄과@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "안전총괄과" });
  const uEdu = await upsertOfficial({ email: "seed-화성시청교육지원청@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "교육지원청" });
  const uHealth = await upsertOfficial({ email: "seed-화성시청보건소@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "보건소" });
  const uEnv = await upsertOfficial({ email: "seed-화성시청환경과@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "환경과" });
  const uFacility = await upsertOfficial({ email: "seed-화성시청시설관리과@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "시설관리과" });
  const uCulture = await upsertOfficial({ email: "seed-화성시청문화스포과@korlink.demo", name: "화성시청", orgName: "화성시청", dept: "문화스포과" });

  const uYonginEdu = await upsertOfficial({ email: "seed-용인시교육지원청@korlink.demo", name: "용인시 교육지원청", orgName: "용인시 교육지원청" });
  const uSeongnam = await upsertOfficial({ email: "seed-성남시청@korlink.demo", name: "성남시청", orgName: "성남시청" });
  const uHwaseong = await upsertOfficial({ email: "seed-화성시청@korlink.demo", name: "화성시청", orgName: "화성시청" });
  const uAnyang = await upsertOfficial({ email: "seed-안양시청@korlink.demo", name: "안양시청", orgName: "안양시청" });
  const uSuwon = await upsertOfficial({ email: "seed-수원시청@korlink.demo", name: "수원시청", orgName: "수원시청" });

  const uSnBudget = await upsertOfficial({ email: "seed-성남시청기획예산실@korlink.demo", name: "성남시청", orgName: "성남시청", dept: "기획예산실", phone: "031-5189-3456" });
  const uYiDigital = await upsertOfficial({ email: "seed-용인시청디지털정보과@korlink.demo", name: "용인시청", orgName: "용인시청", dept: "디지털정보과", phone: "031-5189-3456" });
  const uPtMinwon = await upsertOfficial({ email: "seed-평택시청민원지원과@korlink.demo", name: "평택시청", orgName: "평택시청", dept: "민원지원과", phone: "031-5189-3456" });

  type ItemDef = { name: string; qty?: number; unit?: string; spec?: string; productId?: string };
  type QrDef = {
    id: string;
    officialId: string;
    title: string;
    status: "OPEN" | "REVIEWING" | "AWARDED" | "CLOSED";
    kind?: "DIRECT";
    targetSupplierCompanyId?: string;
    quoteType?: "GOODS";
    budget?: number;
    deadline?: string;
    dueDate?: string;
    deliveryCondition?: string;
    deliveryPlace?: string;
    deliveryAddress?: string;
    desiredDeliveryDate?: string;
    description?: string;
    contactOrgName?: string;
    contactDepartment?: string;
    contactEmail?: string;
    contactPhone?: string;
    createdAt?: string;
    items?: ItemDef[];
    attachments?: string[];
  };

  const QUOTES: QrDef[] = [
    {
      id: "qr-1",
      officialId: official.id,
      title: "수지 보강 프로젝트 발전기 및 베어링 구매",
      status: "OPEN",
      quoteType: "GOODS",
      budget: 15000000,
      deadline: "2026-06-20",
      dueDate: "2026-07-15",
      deliveryCondition: "상차도",
      deliveryPlace: "[18289] 경기도 화성시 시청로 159 화성시청",
      contactOrgName: "경기도 화성시 화폐과",
      contactPhone: "031-369-2345",
      createdAt: "2026-05-08",
      items: [
        { name: "발전기 100kW급", qty: 2, unit: "대", spec: "3상 4선식, 60Hz, 연속운전 가능" },
        { name: "베어링 6206-2RS", qty: 500, unit: "개", spec: "내경 30mm, 외경 62mm" },
      ],
    },
    {
      id: "qr-2",
      officialId: official.id,
      title: "2026년 화성시 도시개발 건자재 대규모 구매 (다수 업체 비교)",
      status: "REVIEWING",
      budget: 35000000,
      deadline: "2026-07-31",
      contactOrgName: "경기도 화성시 도시건설과",
      contactPhone: "031-369-2222",
      createdAt: "2026-05-02",
      items: [
        { name: "레미콘 24-40-140", qty: 200, unit: "㎥" },
        { name: "아스콘 표준배합 15-40", qty: 100, unit: "톤" },
        { name: "철근 D16 10m", qty: 500, unit: "개" },
      ],
    },
    {
      id: "qr-3",
      officialId: official.id,
      title: "2026년 2분기 도로보수 공사 자재 구매",
      status: "OPEN",
      budget: 8000000,
      deadline: "2026-06-15",
      contactOrgName: "경기도 화성시 도로과",
      contactPhone: "031-369-1234",
      createdAt: "2026-05-01",
      items: [
        { name: "레미콘 24-40-140", qty: 50, unit: "㎥" },
        { name: "아스콘 표준배합 15-40", qty: 30, unit: "톤" },
      ],
    },
    {
      id: "qr-4",
      officialId: official.id,
      title: "2026년 화성시 도로유지보수 포장 자재 구매 (물품 견적)",
      status: "AWARDED",
      quoteType: "GOODS",
      budget: 12000000,
      deadline: "2026-03-20",
      contactOrgName: "경기도 화성시 도로관리과",
      createdAt: "2026-02-15",
      items: [
        { name: "레미콘 24-40-140(중기)", qty: 80, unit: "㎥" },
        { name: "아스콘 표준배합 15-40", qty: 40, unit: "톤" },
      ],
    },
    {
      id: "qr-5",
      officialId: official.id,
      title: "2026년 1분기 교통안전용품 구매 (물품 견적)",
      status: "CLOSED",
      quoteType: "GOODS",
      budget: 5500000,
      deadline: "2026-02-28",
      contactOrgName: "경기도 화성시 교통시설관리과",
      createdAt: "2026-01-20",
      items: [
        { name: "반사원형콘 750mm", qty: 200, unit: "개" },
        { name: "강관난간 2중난간", qty: 50, unit: "m" },
      ],
    },

    {
      id: "qr-6",
      officialId: uIt,
      title: "화성시청 IT장비 신규 구축 프로젝트",
      status: "REVIEWING",
      budget: 42000000,
      deadline: "2026-05-30",
      contactOrgName: "경기도 화성시 정보통신과",
      contactPhone: "031-369-5678",
      items: [
        { name: "업무용 PC i7/16GB/512GB" },
        { name: "프린터 레이저 흑백 45ppm" },
        { name: "네트워크스위치 48포트 L3" },
      ],
    },
    {
      id: "qr-7",
      officialId: uSafety,
      title: "화성시 소방서 장비 보강 구매",
      status: "AWARDED",
      budget: 7500000,
      deadline: "2026-05-10",
      contactOrgName: "경기도 화성시 안전총괄과",
      contactPhone: "031-369-9012",
      items: [{ name: "분말소화기 3.3kg" }, { name: "소방호스 65A 20m" }],
    },
    {
      id: "qr-8",
      officialId: uEdu,
      title: "2026학년도 교육기관 가구 구매",
      status: "OPEN",
      budget: 35000000,
      deadline: "2026-07-01",
      contactOrgName: "경기도 화성시 교육지원청",
      contactPhone: "031-369-3456",
      items: [{ name: "학생책상 1인용 600x400" }, { name: "학생의자" }],
    },
    {
      id: "qr-9",
      officialId: uHealth,
      title: "화성시 보건소 의료기기 교체",
      status: "CLOSED",
      budget: 1200000,
      deadline: "2026-04-01",
      contactOrgName: "경기도 화성시 보건소",
      contactPhone: "031-369-7890",
    },
    {
      id: "qr-10",
      officialId: uEnv,
      title: "2026년 환경미관리용차 구매",
      status: "REVIEWING",
      budget: 28000000,
      deadline: "2026-06-10",
      contactOrgName: "경기도 화성시 환경과",
      contactPhone: "031-369-6789",
      items: [{ name: "소형수거차 1톤" }, { name: "대형수거차 5톤" }],
    },
    {
      id: "qr-11",
      officialId: uFacility,
      title: "시설관리용 실내조명 및 전기 자재 구매",
      status: "OPEN",
      budget: 4500000,
      deadline: "2026-07-15",
      contactOrgName: "경기도 화성시 시설관리과",
      contactPhone: "031-369-0123",
      items: [{ name: "LED조명 1200x600 50W" }, { name: "전기코드 3m" }],
    },
    {
      id: "qr-12",
      officialId: uCulture,
      title: "화성시 문화강승재단 물품 발주대 구매",
      status: "AWARDED",
      budget: 3000000,
      deadline: "2026-05-05",
      contactOrgName: "경기도 화성시 문화스포과",
      contactPhone: "031-369-4567",
      items: [{ name: "대형발주대 밀리상 200x100" }],
    },

    {
      id: "qr-13",
      officialId: uYonginEdu,
      title: "용인시 교육청 디지털 교실 구축",
      status: "OPEN",
      deadline: "2026-08-31",
      contactOrgName: "용인시 교육지원청",
    },
    {
      id: "qr-14",
      officialId: uSeongnam,
      title: "성남시 행정망 보안 장비 도입",
      status: "OPEN",
      deadline: "2026-07-15",
      contactOrgName: "성남시청",
    },
    {
      id: "qr-15",
      officialId: uHwaseong,
      title: "화성시 스마트시티 IoT 인프라 구축",
      status: "REVIEWING",
      deadline: "2026-06-30",
      contactOrgName: "화성시청",
    },
    {
      id: "qr-16",
      officialId: uAnyang,
      title: "안양시 무인민원발급기 유지보수",
      status: "CLOSED",
      deadline: "2026-06-15",
      contactOrgName: "안양시청",
    },
    {
      id: "qr-17",
      officialId: uSuwon,
      title: "수원시 공공와이파이 확장 사업",
      status: "AWARDED",
      deadline: "2026-05-20",
      contactOrgName: "수원시청",
    },

    {
      id: "qr-18",
      officialId: official.id,
      title: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
      status: "OPEN",
      kind: "DIRECT",
      targetSupplierCompanyId: digital.id,
      desiredDeliveryDate: "2026-05-25",
      deliveryAddress: "[18289] 경기도 화성시 시청로 159 화성시청 도로관리과",
      description:
        "화성시청 정보통신과에서 도로관리과로 업무용 PC 20대를 긴급 요청합니다. CPU는 i7-13세대 이상, 메모리는 DDR5 16GB, 저장장치는 NVMe 512GB 이상이 필요합니다. 기존에 사용 중인 노후 PC(6년 이상)를 교체하는 것으로, Windows 11 Pro 정품 라이선스 포함 설치가 필요합니다. 납품 시 기존 데이터 이전 지원도 요청드립니다.",
      contactOrgName: "경기도 화성시청",
      contactDepartment: "도로관리과",
      contactEmail: "official@ggseso.go.kr",
      contactPhone: "031-369-1234",
      createdAt: "2026-05-10",
      items: [{ name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", qty: 20, unit: "대", productId: "demo-6" }],
      attachments: ["견적요청서_도로관리과_2026.pdf", "사양비교표.xlsx"],
    },
    {
      id: "qr-19",
      officialId: official.id,
      title: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
      status: "OPEN",
      kind: "DIRECT",
      targetSupplierCompanyId: digital.id,
      desiredDeliveryDate: "2026-06-15",
      deliveryAddress: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      contactOrgName: "수원시청",
      contactDepartment: "총무과",
      contactEmail: "it.hwaseong@ggseso.go.kr",
      contactPhone: "031-5189-3456",
      createdAt: "2026-05-08",
      items: [{ name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", qty: 10, unit: "대", productId: "demo-6" }],
      attachments: ["RFQ_PC_화성시청_20260510.pdf"],
    },
    {
      id: "qr-20",
      officialId: uSnBudget,
      title: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
      status: "OPEN",
      kind: "DIRECT",
      targetSupplierCompanyId: digital.id,
      desiredDeliveryDate: "2026-05-20",
      deliveryAddress: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      contactOrgName: "성남시청",
      contactDepartment: "기획예산실",
      contactEmail: "it.hwaseong@ggseso.go.kr",
      contactPhone: "031-5189-3456",
      items: [{ name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", qty: 5, unit: "대", productId: "demo-6" }],
      attachments: ["RFQ_PC_화성시청_20260510.pdf"],
    },
    {
      id: "qr-21",
      officialId: uYiDigital,
      title: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
      status: "OPEN",
      kind: "DIRECT",
      targetSupplierCompanyId: digital.id,
      desiredDeliveryDate: "2026-06-30",
      deliveryAddress: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      contactOrgName: "용인시청",
      contactDepartment: "디지털정보과",
      contactEmail: "it.hwaseong@ggseso.go.kr",
      contactPhone: "031-5189-3456",
      items: [{ name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", qty: 30, unit: "대", productId: "demo-6" }],
      attachments: ["RFQ_PC_화성시청_20260510.pdf"],
    },
    {
      id: "qr-22",
      officialId: uPtMinwon,
      title: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
      status: "OPEN",
      kind: "DIRECT",
      targetSupplierCompanyId: digital.id,
      desiredDeliveryDate: "2026-06-10",
      deliveryAddress: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      contactOrgName: "평택시청",
      contactDepartment: "민원지원과",
      contactEmail: "it.hwaseong@ggseso.go.kr",
      contactPhone: "031-5189-3456",
      items: [{ name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", qty: 8, unit: "대", productId: "demo-6" }],
      attachments: ["RFQ_PC_화성시청_20260510.pdf"],
    },
    {
      id: "qr-23",
      officialId: official.id,
      title: "네트워크장비(스위치) 48포트 L3 관리형",
      status: "OPEN",
      kind: "DIRECT",
      targetSupplierCompanyId: netsol.id,
      createdAt: "2026-05-14",
      items: [{ name: "네트워크장비(스위치) 48포트 L3 관리형", qty: 3, unit: "대", productId: "demo-8" }],
    },
  ];

  let qrCount = 0;
  let itemCount = 0;
  let attCount = 0;
  for (const q of QUOTES) {
    const data = {
      officialId: q.officialId,
      title: q.title,
      description: q.description ?? null,
      status: q.status,
      kind: q.kind ?? "OPEN_BID",
      targetSupplierCompanyId: q.targetSupplierCompanyId ?? null,
      quoteType: q.quoteType ?? null,
      budget: q.budget ?? null,
      deadline: q.deadline ? new Date(q.deadline) : null,
      dueDate: q.dueDate ? new Date(q.dueDate) : null,
      deliveryCondition: q.deliveryCondition ?? null,
      deliveryPlace: q.deliveryPlace ?? null,
      deliveryAddress: q.deliveryAddress ?? null,
      desiredDeliveryDate: q.desiredDeliveryDate ? new Date(q.desiredDeliveryDate) : null,
      contactOrgName: q.contactOrgName ?? null,
      contactDepartment: q.contactDepartment ?? null,
      contactEmail: q.contactEmail ?? null,
      contactPhone: q.contactPhone ?? null,
      ...(q.createdAt ? { createdAt: new Date(q.createdAt) } : {}),
    } as const;
    await prisma.quoteRequest.upsert({
      where: { id: q.id },
      update: data,
      create: { id: q.id, ...data },
    });
    qrCount++;

    for (let i = 0; i < (q.items?.length ?? 0); i++) {
      const it = q.items![i];
      const itemData = {
        quoteRequestId: q.id,
        productId: it.productId ?? null,
        name: it.name,
        spec: it.spec ?? null,
        quantity: it.qty ?? 1,
        unit: it.unit ?? null,
      };
      await prisma.quoteRequestItem.upsert({
        where: { id: `qri-${q.id.replace("qr-", "")}-${i + 1}` },
        update: itemData,
        create: { id: `qri-${q.id.replace("qr-", "")}-${i + 1}`, ...itemData },
      });
      itemCount++;
    }

    for (let i = 0; i < (q.attachments?.length ?? 0); i++) {
      const fileName = q.attachments![i];
      const attData = { quoteRequestId: q.id, fileUrl: `${UPLOAD_DIR}/${fileName}`, fileName };
      await prisma.quoteRequestAttachment.upsert({
        where: { id: `qra-${q.id.replace("qr-", "")}-${i + 1}` },
        update: attData,
        create: { id: `qra-${q.id.replace("qr-", "")}-${i + 1}`, ...attData },
      });
      attCount++;
    }
  }

  const yonginTitle = "용인시청 정보통신과 IT 장비 보강 (물품 견적)";
  const existingYongin = await prisma.quoteRequest.findFirst({ where: { title: yonginTitle }, select: { id: true } });
  if (!existingYongin || existingYongin.id === "qr-24") {
    await prisma.quoteRequest.upsert({
      where: { id: "qr-24" },
      update: {},
      create: {
        id: "qr-24",
        officialId: uYiDigital,
        title: yonginTitle,
        status: "OPEN",
        quoteType: "GOODS",
        contactOrgName: "용인시청",
        contactDepartment: "디지털정보과",
      },
    });
    qrCount++;
  }

  type ResDef = {
    id: string;
    quoteRequestId: string;
    supplierCompanyId: string;
    totalAmount: number;
    status: "SUBMITTED" | "UNDER_REVIEW" | "AWARDED" | "REJECTED";
    specSummary?: string;
    memo?: string;
    quoteNo?: string;
    createdAt: string;
  };

  const RESPONSES: ResDef[] = [
    { id: "qres-1", quoteRequestId: "qr-1", supplierCompanyId: machinery.id, totalAmount: 14800000, status: "SUBMITTED", specSummary: "발전기 100kW 2대, 베어링 500개, 설치 포함", createdAt: "2026-05-09" },
    { id: "qres-2", quoteRequestId: "qr-3", supplierCompanyId: ggBuild.id, totalAmount: 7800000, status: "SUBMITTED", specSummary: "레미콘 50㎥, 아스콘 30톤 포함 운송비", quoteNo: "qb001", createdAt: "2026-05-03" },
    { id: "qres-3", quoteRequestId: "qr-3", supplierCompanyId: hsRemicon.id, totalAmount: 8200000, status: "SUBMITTED", specSummary: "레미콘 50㎥, 아스콘 30톤, 2일 내 납품 가능", createdAt: "2026-05-04" },
    { id: "qres-4", quoteRequestId: "qr-3", supplierCompanyId: pojang.id, totalAmount: 7900000, status: "SUBMITTED", specSummary: "레미콘 50㎥, 아스콘 30톤, 여성기업 할인 적용", createdAt: "2026-05-05" },
    { id: "qres-5", quoteRequestId: "qr-13", supplierCompanyId: digital.id, totalAmount: 33800000, status: "SUBMITTED", specSummary: "스마트패널 30대, 노트북 60대, 충전카트 3대", createdAt: "2026-05-12" },
    { id: "qres-6", quoteRequestId: "qr-14", supplierCompanyId: digital.id, totalAmount: 7800000, status: "SUBMITTED", specSummary: "차세대방화벽 2대, IDS 1대, VPN 장비 2대", createdAt: "2026-05-10" },
    { id: "qres-7", quoteRequestId: "qr-15", supplierCompanyId: digital.id, totalAmount: 47500000, status: "UNDER_REVIEW", specSummary: "LoRaWAN 게이트웨이 50대, 센서 500개, 클라우드 대시보드", createdAt: "2026-05-01" },
    { id: "qres-8", quoteRequestId: "qr-16", supplierCompanyId: digital.id, totalAmount: 4600000, status: "REJECTED", specSummary: "기존 10대 정기점검, 소모품 교체, 원격모니터링", createdAt: "2026-04-20" },
    { id: "qres-9", quoteRequestId: "qr-17", supplierCompanyId: digital.id, totalAmount: 11500000, status: "AWARDED", specSummary: "WiFi6 AP 200대, 컨트롤러 2대, 3년 유지보수 포함", createdAt: "2026-04-15" },
    { id: "qres-10", quoteRequestId: "qr-19", supplierCompanyId: digital.id, totalAmount: 8800000, status: "SUBMITTED", memo: "24인치 FHD 모니터 포함 세트", createdAt: "2026-05-09" },
    { id: "qres-11", quoteRequestId: "qr-21", supplierCompanyId: digital.id, totalAmount: 26100000, status: "SUBMITTED", createdAt: "2026-05-08" },
  ];

  let resCount = 0;
  for (const r of RESPONSES) {
    const data = {
      quoteRequestId: r.quoteRequestId,
      supplierCompanyId: r.supplierCompanyId,
      totalAmount: r.totalAmount,
      status: r.status,
      specSummary: r.specSummary ?? null,
      memo: r.memo ?? null,
      quoteNo: r.quoteNo ?? null,
      createdAt: new Date(r.createdAt),
    };
    await prisma.quoteResponse.upsert({
      where: { id: r.id },
      update: data,
      create: { id: r.id, ...data },
    });
    resCount++;
  }

  await prisma.quoteRequest.update({
    where: { id: "qr-17" },
    data: { awardedResponseId: "qres-9" },
  });

  return `quotes: 공고 ${qrCount}건(공개 ${qrCount - 6} · 1:1 직접요청 6) / 품목 ${itemCount} / 요청첨부 ${attCount} / 응답 ${resCount}건(qb001 포함) / 신규 기관 ${ORGS.length} / 신규 공무원 ${newUsers.length} / 신규 공급사 1(기계공업) + 기존 3사 전화 보강`;
}
