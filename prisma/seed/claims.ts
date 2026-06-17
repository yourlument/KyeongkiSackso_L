import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";
import { encField, encryptLookup } from "../../src/lib/crypto/pii";

export async function seedClaims(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  const officialDemo = await prisma.user.findUnique({ where: { email: "official@korlink.co.kr" } });
  const supplierDemo = await prisma.user.findUnique({ where: { email: "supplier@korlink.co.kr" } });
  if (!officialDemo || !supplierDemo) {
    throw new Error("claims: 데모 계정 없음 — 기본 시드(prisma/seed.ts) 선행 필요");
  }

  const hwaseong = await prisma.organization.findUnique({
    where: { businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", "123-45-67890") },
  });
  if (!hwaseong) throw new Error("claims: 화성시청 Organization 없음 — 기본 시드 선행 필요");

  async function findCompany(bizNo: string, name: string) {
    const c = await prisma.supplierCompany.findUnique({
      where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", bizNo) },
    });
    if (!c) throw new Error(`claims: 공급사 ${name}(${bizNo}) 없음 — 기본 시드 선행 필요`);
    return c;
  }
  const pojang = await findCompany("700-01-00003", "포장산업(주)");
  const officetek = await findCompany("700-01-00007", "오피스텍(주)");
  const ggBuild = await findCompany("123-45-67890", "경기건설(주)");

  async function upsertOfficialUser(email: string, name: string, dept: string) {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        name: encField("User", "name", name)!,
        organizationId: hwaseong!.id,
        departmentName: dept,
      },
    });
  }
  async function upsertSupplierUser(email: string, name: string, companyId: string) {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: ctx.pwHash,
        role: "SUPPLIER",
        name: encField("User", "name", name)!,
        supplierCompanyId: companyId,
      },
    });
  }

  const kim = await upsertOfficialUser("official@ggseso.go.kr", "김주무관", "도로관리과");
  const choiJuim = await upsertOfficialUser("seed-최주임@korlink.demo", "최주임", "정보통신과");
  const parkDaeri = await upsertOfficialUser("seed-박대리@korlink.demo", "박대리", "안전총괄과");
  const leeJuim = await upsertOfficialUser("seed-이주임@korlink.demo", "이주임", "안전총괄과");
  const kimGwajang = await upsertOfficialUser("seed-김과장@korlink.demo", "김과장", "정보통신과");
  const leeSajang = await upsertSupplierUser("lee@pojang.co.kr", "이사장", pojang.id);
  const ohSiljang = await upsertSupplierUser("seed-오실장@korlink.demo", "오실장", officetek.id);
  const choiSiljang = await upsertSupplierUser("seed-최실장@korlink.demo", "최실장", ggBuild.id);

  type RepRow = {
    id: string;
    reporterId: string;
    title: string;
    category: string;
    reason: string;
    status: "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";
    priority?: "URGENT" | "HIGH" | "NORMAL" | "LOW";
    contactName?: string;
    contactOrg?: string;
    createdAt: Date;
  };
  const REPORTS: RepRow[] = [
    {
      id: "rep-1",
      reporterId: kim.id,
      title: "등록된 상품의 사양이 실제와 상이함",
      category: "허위상품",
      reason: "등록된 상품의 사양이 실제와 상이함",
      status: "REVIEWING",
      priority: "HIGH",
      contactName: "김주무관",
      contactOrg: "화성시청 정보통신과",
      createdAt: new Date("2026-05-09"),
    },
    {
      id: "rep-2",
      reporterId: choiJuim.id,
      title: "견적 제출 업체 간 담합 의심",
      category: "부정거래",
      reason: "견적 제출 업체 간 담합 의심",
      status: "REVIEWING",
      priority: "URGENT",
      contactName: "최주임",
      contactOrg: "화성시청 정보통신과",
      createdAt: new Date("2026-05-07"),
    },
    {
      id: "rep-3",
      reporterId: parkDaeri.id,
      title: "특정 업체의 반복적인 저가 견적 제출",
      category: "악성유저",
      reason: "특정 업체의 반복적인 저가 견적 제출",
      status: "OPEN",
      priority: "HIGH",
      contactName: "박대리",
      contactOrg: "화성시청 안전총괄과",
      createdAt: new Date("2026-05-05"),
    },
    {
      id: "rep-4",
      reporterId: leeJuim.id,
      title: "인증서 위조 의심",
      category: "허위상품",
      reason: "인증서 위조 의심",
      status: "DISMISSED",
      priority: "URGENT",
      contactName: "이주임",
      contactOrg: "화성시청 안전총괄과",
      createdAt: new Date("2026-05-03"),
    },
    {
      id: "rep-5",
      reporterId: kimGwajang.id,
      title: "공고 직후 특정 업체에게만 내부 정보 유출 의심",
      category: "부정거래",
      reason: "공고 직후 특정 업체에게만 내부 정보 유출 의심",
      status: "OPEN",
      priority: "URGENT",
      contactName: "김과장",
      contactOrg: "화성시청 정보통신과",
      createdAt: new Date("2026-05-01"),
    },
    {
      id: "rep-6",
      reporterId: officialDemo.id,
      title: "등록된 상품의 사양이 실제와 상이함",
      category: "허위상품",
      reason: "등록된 상품의 사양이 실제와 상이함",
      status: "REVIEWING",
      createdAt: new Date("2026-05-16"),
    },
    {
      id: "rep-7",
      reporterId: officialDemo.id,
      title: "업무용 PC 사양과 실제 납품 사양 불일치",
      category: "허위상품",
      reason: "업무용 PC 사양과 실제 납품 사양 불일치",
      status: "REVIEWING",
      createdAt: new Date("2026-05-08"),
    },
    {
      id: "rep-8",
      reporterId: supplierDemo.id,
      title: "동일 업체의 반복적인 저가 낙찰 후 품질 불량",
      category: "부정거래",
      reason: "동일 업체의 반복적인 저가 낙찰 후 품질 불량",
      status: "OPEN",
      createdAt: new Date("2026-05-08"),
    },
  ];
  for (const r of REPORTS) {
    const { id, ...rest } = r;
    const data = { ...rest, targetType: "GENERAL", targetId: null };
    await prisma.report.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  type InqRow = {
    id: string;
    userId: string;
    title: string;
    content: string;
    category: string;
    status: "OPEN" | "IN_PROGRESS" | "ANSWERED" | "REJECTED";
    priority?: "URGENT" | "HIGH" | "NORMAL" | "LOW";
    answer?: string;
    answeredAt?: Date;
    answeredBy?: string;
    contactName?: string;
    contactOrg?: string;
    contactPhone?: string;
    contactEmail?: string;
    createdAt: Date;
  };
  const INQUIRIES: InqRow[] = [
    {
      id: "inq-1",
      userId: kim.id,
      title: "견적 공고 마감일 연장 가능한가요?",
      content:
        "화성시청 도로과에서 공고한 안전난간 설치 견적 공고의 마감일을 3일 연장하고 싶습니다. 내부 검토가 지연되어 참여 업체들에게 충분한 시간을 드리기 위함입니다.",
      category: "견적문의",
      status: "OPEN",
      priority: "NORMAL",
      contactName: "김주무관",
      contactOrg: "화성시청 도로관리과",
      contactPhone: "031-123-4567",
      contactEmail: "official@ggseso.go.kr",
      createdAt: new Date("2026-05-10"),
    },
    {
      id: "inq-2",
      userId: leeSajang.id,
      title: "입점 신청 심사 기간이 얼마나 걸리나요?",
      content:
        "저희 회사가 5월 1일에 입점 신청을 제출했는데 아직 결과를 받지 못했습니다. 보통 심사에 얼마나 걸리는지, 추가 서류가 필요한지 확인 부탁드립니다.",
      category: "입점신청",
      status: "ANSWERED",
      priority: "NORMAL",
      answer:
        "안녕하세요. 입점 신청 심사는 통상 3~5 영업일이 소요됩니다. 현재 제출하신 서류는 검토 중이며, 추가 서류가 필요할 경우 별도로 연락드리겠습니다. 감사합니다.",
      answeredAt: new Date("2026-05-09"),
      answeredBy: "관리자",
      contactName: "이사장",
      contactOrg: "포장산업(주)",
      contactPhone: "031-567-8901",
      contactEmail: "lee@pojang.co.kr",
      createdAt: new Date("2026-05-08"),
    },
    {
      id: "inq-3",
      userId: officialDemo.id,
      title: "가상계좌 입금 후 결제 완료 처리가 안 됩니다",
      content:
        "어제 오후 3시에 가상계좌로 162만 5천원을 입금했으나 결제 완료 처리가 되지 않았습니다. 입금 내역 확인 및 수동 처리 부탁드립니다.",
      category: "결제문의",
      status: "ANSWERED",
      priority: "HIGH",
      answer:
        "확인 결과 입금 내역이 확인되었습니다. 시스템 오류로 결제 완료 처리가 지연되었으며, 현재 정상 처리 완료되었습니다. 불편을 드려 죄송합니다.",
      answeredAt: new Date("2026-05-07"),
      answeredBy: "관리자",
      contactName: "김주무관",
      contactOrg: "화성시청 도로관리과",
      createdAt: new Date("2026-05-06"),
    },
    {
      id: "inq-4",
      userId: ohSiljang.id,
      title: "상품 등록 시 이미지 업로드가 실패합니다",
      content: "상품 등록 시 이미지 업로드가 실패합니다",
      category: "시스템오류",
      status: "ANSWERED",
      priority: "NORMAL",
      contactName: "오실장",
      contactOrg: "오피스텍(주)",
      createdAt: new Date("2026-05-04"),
    },
    {
      id: "inq-5",
      userId: choiSiljang.id,
      title: "구독 플랜 변경 방법",
      content: "구독 플랜 변경 방법",
      category: "구독문의",
      status: "ANSWERED",
      priority: "LOW",
      contactName: "최실장",
      contactOrg: "경기건설(주)",
      createdAt: new Date("2026-05-02"),
    },
    {
      id: "inq-6",
      userId: officialDemo.id,
      title: "견적 공고 마감일 연장 가능한가요?",
      content: "견적 공고 마감일 연장 가능한가요?",
      category: "견적문의",
      status: "OPEN",
      createdAt: new Date("2026-05-18"),
    },
    {
      id: "inq-7",
      userId: officialDemo.id,
      title: "마이페이지 구매 내역 조회 시 로딩이 너무 느립니다",
      content: "마이페이지 구매 내역 조회 시 로딩이 너무 느립니다",
      category: "시스템오류",
      status: "IN_PROGRESS",
      createdAt: new Date("2026-05-15"),
    },
    {
      id: "inq-8",
      userId: officialDemo.id,
      title: "견적 공고 등록 후 입찰 업체 목록을 다운로드할 수 있나요?",
      content: "견적 공고 등록 후 입찰 업체 목록을 다운로드할 수 있나요?",
      category: "견적문의",
      status: "OPEN",
      createdAt: new Date("2026-05-12"),
    },
    {
      id: "inq-9",
      userId: officialDemo.id,
      title: "법인카드로 결제 시 할부 설정이 가능한가요?",
      content: "법인카드로 결제 시 할부 설정이 가능한가요?",
      category: "결제문의",
      status: "ANSWERED",
      createdAt: new Date("2026-05-05"),
    },
    {
      id: "inq-10",
      userId: supplierDemo.id,
      title: "입점 심사 결과 문의",
      content: "입점 심사 결과 문의",
      category: "입점신청",
      status: "IN_PROGRESS",
      createdAt: new Date("2026-05-17"),
    },
    {
      id: "inq-11",
      userId: supplierDemo.id,
      title: "상품 등록 시 이미지 업로드 오류",
      content: "상품 등록 시 이미지 업로드 오류",
      category: "시스템오류",
      status: "OPEN",
      createdAt: new Date("2026-05-14"),
    },
    {
      id: "inq-12",
      userId: supplierDemo.id,
      title: "판매 대금 정산 주기 문의",
      content:
        "이번 달 납품 완료된 2건의 판매 대금 정산 일정을 확인하고 싶습니다. 플랫폼 내 정산 예정 내역 페이지에서 확인 가능한가요? 또한 세금계산서 발행 후 정산까지 소요되는 기간이 궁금합니다.",
      category: "결제문의",
      status: "ANSWERED",
      answer:
        "판매 대금 정산은 세금계산서 발행 확인 후 익월 15일에 일괄 지급됩니다. 파트너 포털 > 매출 관리 > 정산 예정 내역에서 확인 가능하며, 이번 달 납품 건은 6월 15일 정산 예정입니다.",
      answeredAt: new Date("2026-05-11"),
      answeredBy: "관리자",
      createdAt: new Date("2026-05-10"),
    },
    {
      id: "inq-13",
      userId: supplierDemo.id,
      title: "프리미엄 플랜 이용 중 상품 노출 순위 문의",
      content: "프리미엄 플랜 이용 중 상품 노출 순위 문의",
      category: "구독문의",
      status: "ANSWERED",
      createdAt: new Date("2026-05-05"),
    },
  ];
  for (const q of INQUIRIES) {
    const { id, ...data } = q;
    await prisma.inquiry.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  return `claims: Report ${REPORTS.length} (rep-1~${REPORTS.length}) + Inquiry ${INQUIRIES.length} (inq-1~${INQUIRIES.length}) + 작성자 User 8 (admin 클레임 표 + mypage 내역, admin#5=mypage 병합)`;
}
