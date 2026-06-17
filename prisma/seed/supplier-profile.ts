import type { PrismaClient } from "@prisma/client";
import { encryptLookup } from "../../src/lib/crypto/pii";
import type { SeedCtx } from "./types";

async function findCompanyByBizNo(prisma: PrismaClient, bizNo: string, label: string) {
  const company = await prisma.supplierCompany.findUnique({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", bizNo) },
  });
  if (!company) throw new Error(`[supplier-profile] 기존 시드 공급사 누락: ${label} (${bizNo}) — prisma/seed.ts 먼저 실행 필요`);
  return company;
}

export async function seedSupplierProfile(prisma: PrismaClient, _ctx: SeedCtx): Promise<string> {
  const digital = await findCompanyByBizNo(prisma, "211-88-00001", "디지털솔루션(주)");
  await prisma.supplierCompany.update({
    where: { id: digital.id },
    data: {
      intro: "공공기관 맞춤형 IT 인프라 및 디지털 솔루션 전문 기업",
      description:
        "디지털솔루션(주)는 2015년 설립 이래 공공기관 및 지자체를 대상으로 IT 인프라 구축, 네트워크 장비 공급, 스마트시티 솔루션, SI 프로젝트를 수행해왔습니다. 업무용 PC, 서버, 네트워크 장비부터 클라우드 기반 행정시스템 통합까지 원스톱으로 제공합니다. ISO 27001, ISO 9001 인증 보유.",
      managerName: "박영수",
      managerPhone: "010-9876-5432",
      managerEmail: "sales@digitalsolution.kr",
      managerPosition: "영업본부 / 차장",
      bankName: "국민은행",
      bankAccountNo: "1234567890",
      bankAccountHolder: "테스트",
      bankVerifiedAt: new Date("2026-05-20T17:30:29"),
    },
  });

  const PERFORMANCES = [
    { id: "perf-1", projectName: "화성시청 전산실 리뉴얼", client: "화성시청", year: 2026, amount: "320000000" },
    { id: "perf-2", projectName: "경기도교육청 스마트교실 120실", client: "경기도교육청", year: 2023, amount: "850000000" },
    { id: "perf-3", projectName: "분당구청 행정망 보안강화", client: "성남시 분당구청", year: 2026, amount: "180000000" },
    { id: "perf-4", projectName: "판교테크노밸리 CCTV 통합관제", client: "경기도 성남시", year: 2023, amount: "410000000" },
  ];
  for (let i = 0; i < PERFORMANCES.length; i++) {
    const p = PERFORMANCES[i];
    const data = {
      supplierCompanyId: digital.id,
      projectName: p.projectName,
      client: p.client,
      year: p.year,
      amount: p.amount,
      sortOrder: i,
    };
    await prisma.supplierPerformance.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
  }

  const EQUIPMENTS = [
    { id: "equip-1", name: "HP Z8 워크스테이션 (테스트용)", quantity: 2 },
    { id: "equip-2", name: "Cisco Catalyst 9000 시리즈 데모키트", quantity: 1 },
    { id: "equip-3", name: "Fluke 네트워크 분석기", quantity: 1 },
    { id: "equip-4", name: "3D 프린터 (Prototyping용)", quantity: 1 },
  ];
  for (let i = 0; i < EQUIPMENTS.length; i++) {
    const e = EQUIPMENTS[i];
    const data = { supplierCompanyId: digital.id, name: e.name, quantity: e.quantity, sortOrder: i };
    await prisma.supplierEquipment.upsert({ where: { id: e.id }, update: data, create: { id: e.id, ...data } });
  }

  const PARTNER_CERTS = [
    {
      id: "cert-1",
      name: "우수제품인증",
      description: "조달청 우수제품 등록 인증서 (2026년 갱신)",
      fileName: "우수제품인증서_2026.pdf",
      status: "APPROVED" as const,
      submittedAt: new Date("2026-04-10"),
      reviewedAt: new Date("2026-04-12"),
      rejectReason: null,
    },
    {
      id: "cert-2",
      name: "ISO 9001 품질경영시스템",
      description: "국제 품질경영시스템 인증",
      fileName: "ISO9001_품질인증.pdf",
      status: "REVIEWING" as const,
      submittedAt: new Date("2026-05-05"),
      reviewedAt: null,
      rejectReason: null,
    },
    {
      id: "cert-3",
      name: "여성기업 확인서",
      description: "중소벤처기업부 여성기업 확인서",
      fileName: "여성기업_확인서.pdf",
      status: "REJECTED" as const,
      submittedAt: new Date("2026-04-20"),
      reviewedAt: new Date("2026-04-22"),
      rejectReason: "만료된 인증서입니다. 최신 인증서를 다시 업로드해주세요.",
    },
  ];
  for (const c of PARTNER_CERTS) {
    const data = {
      supplierCompanyId: digital.id,
      name: c.name,
      description: c.description,
      fileName: c.fileName,
      status: c.status,
      submittedAt: c.submittedAt,
      reviewedAt: c.reviewedAt,
      rejectReason: c.rejectReason,
    };
    await prisma.supplierCertification.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
  }

  const ADMIN_CERTS = [
    { id: "cert-4", bizNo: "700-01-00003", company: "포장산업(주)", kind: "여성기업", date: "2026-05-05", status: "REVIEWING" as const },
    { id: "cert-5", bizNo: "700-01-00004", company: "안전제품(주)", kind: "장애인기업", date: "2026-05-03", status: "APPROVED" as const },
    { id: "cert-6", bizNo: "700-01-00005", company: "안전난간(주)", kind: "사회적기업", date: "2026-05-01", status: "REVIEWING" as const },
    { id: "cert-7", bizNo: "700-01-00016", company: "경기농협(주)", kind: "사회적기업/여성기업", date: "2026-04-28", status: "APPROVED" as const },
    { id: "cert-8", bizNo: "700-01-00002", company: "화성레미콘(주)", kind: "창업기업", date: "2026-04-25", status: "REVIEWING" as const },
    { id: "cert-9", bizNo: "700-01-00008", company: "네트웍솔루션(주)", kind: "ISO9001", date: "2026-04-20", status: "REVIEWING" as const },
    { id: "cert-10", bizNo: "700-01-00007", company: "오피스텍(주)", kind: "우수제품", date: "2026-04-18", status: "REJECTED" as const },
    { id: "cert-11", bizNo: "700-01-00015", company: "클라이밋텍(주)", kind: "녹색기업", date: "2026-04-15", status: "REVIEWING" as const },
    { id: "cert-12", bizNo: "700-01-00014", company: "에듀퍼니처(주)", kind: "사회적기업", date: "2026-04-10", status: "APPROVED" as const },
    { id: "cert-13", bizNo: "700-01-00013", company: "메디칼텍(주)", kind: "특허보유", date: "2026-04-08", status: "REVIEWING" as const },
  ];
  for (const c of ADMIN_CERTS) {
    const company = await findCompanyByBizNo(prisma, c.bizNo, c.company);
    const data = {
      supplierCompanyId: company.id,
      name: c.kind,
      fileName: `${c.kind} 인증서`,
      status: c.status,
      submittedAt: new Date(c.date),
    };
    await prisma.supplierCertification.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
  }

  return `supplier-profile: 디지털솔루션(주) 프로필 보강(담당자/정산계좌/소개) + 실적 ${PERFORMANCES.length} + 장비 ${EQUIPMENTS.length} + 인증서 ${PARTNER_CERTS.length + ADMIN_CERTS.length}건(파트너 ${PARTNER_CERTS.length}/관리자 ${ADMIN_CERTS.length})`;
}
