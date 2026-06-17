import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";
import { encField, encryptLookup } from "../../src/lib/crypto/pii";

export async function seedCommunity(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  const official = await prisma.user.findUnique({ where: { email: "official@korlink.co.kr" } });
  if (!official) throw new Error("[seedCommunity] 기본 시드 미실행: official@korlink.co.kr 없음");
  const dsUser = await prisma.user.findUnique({ where: { email: "supplier@korlink.co.kr" } });
  if (!dsUser) throw new Error("[seedCommunity] 기본 시드 미실행: supplier@korlink.co.kr 없음");
  const officetek = await prisma.supplierCompany.findUnique({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "700-01-00007") },
  });
  if (!officetek) throw new Error("[seedCommunity] 기본 시드 미실행: 오피스텍(주)(700-01-00007) 없음");

  const ORGS = [
    { id: "org-성남시청", name: "성남시청", bizNo: "999-00-10001" },
    { id: "org-용인시청", name: "용인시청", bizNo: "999-00-10002" },
    { id: "org-고양시청", name: "고양시청", bizNo: "999-00-10003" },
    { id: "org-수원시청", name: "수원시청", bizNo: "999-00-10004" },
  ];
  for (const o of ORGS) {
    await prisma.organization.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        name: o.name,
        businessRegistrationNo: encField("Organization", "businessRegistrationNo", o.bizNo)!,
      },
    });
  }

  const OFFICIALS = [
    { email: "seed-보건위생과_성남시청@korlink.demo", name: "보건위생과_성남시청", dept: "보건위생과", orgId: "org-성남시청" },
    { email: "seed-디지털정보과_최주임@korlink.demo", name: "디지털정보과_최주임", dept: "디지털정보과", orgId: "org-용인시청" },
    { email: "seed-시설관리과_고양시청@korlink.demo", name: "시설관리과_고양시청", dept: "시설관리과", orgId: "org-고양시청" },
    { email: "seed-환경과_수원시청@korlink.demo", name: "환경과_수원시청", dept: "환경과", orgId: "org-수원시청" },
  ];
  const officialIds: Record<string, string> = {};
  for (const u of OFFICIALS) {
    const row = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        name: encField("User", "name", u.name)!,
        organizationId: u.orgId,
        departmentName: u.dept,
      },
    });
    officialIds[u.name] = row.id;
  }

  const NEW_COMPANIES = [
    { id: "sco-아이티솔루션(주)", name: "아이티솔루션(주)", bizNo: "999-00-10005" },
    { id: "sco-한국IT자재(주)", name: "한국IT자재(주)", bizNo: "999-00-10006" },
    { id: "sco-컴퓨전코리아(주)", name: "컴퓨전코리아(주)", bizNo: "999-00-10007" },
    { id: "sco-테크파트너스(주)", name: "테크파트너스(주)", bizNo: "999-00-10008" },
  ];
  const companyIds: Record<string, string> = { "오피스텍(주)": officetek.id };
  for (const c of NEW_COMPANIES) {
    const row = await prisma.supplierCompany.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        representativeName: encField("SupplierCompany", "representativeName", c.name)!,
        businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", c.bizNo)!,
        approvalStatus: "APPROVED",
      },
    });
    companyIds[c.name] = row.id;
  }

  const SUPPLIER_USERS = ["오피스텍(주)", "아이티솔루션(주)", "한국IT자재(주)", "컴퓨전코리아(주)", "테크파트너스(주)"];
  const supplierUserIds: Record<string, string> = { "디지털솔루션(주)": dsUser.id };
  for (const companyName of SUPPLIER_USERS) {
    const email = `seed-${companyName}@korlink.demo`;
    const row = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: ctx.pwHash,
        role: "SUPPLIER",
        name: encField("User", "name", companyName)!,
        supplierCompanyId: companyIds[companyName],
      },
    });
    supplierUserIds[companyName] = row.id;
  }

  type DemandSeedPost = {
    n: number;
    status: "OPEN" | "CLOSED";
    date: string;
    title: string;
    content: string;
    category: string;
    views: number;
    authorId: string;
    videoUrl?: string;
  };
  const POSTS: DemandSeedPost[] = [
    {
      n: 1, status: "OPEN", date: "2026-05-07", views: 156,
      title: "도로 보수용 레미콘 납품 업체 추천 요청",
      content: "화성시 1분기 도로보수공사에 사용할 레미콘 24-40-140(중기) 납품 업체를 추천해주세요. 납기일 준수와 성적서 발급이 필수입니다.",
      category: "도로교통 및 토목 분야",
      authorId: official.id,
    },
    {
      n: 2, status: "CLOSED", date: "2026-04-20", views: 89,
      title: "아스콘 도로 포장재 품질 비교 정보 요청",
      content: "노상용 아스콘 표준배합 제품 품질 비교 정보가 필요합니다. KS 인증, 배합비 등 기술적 정보를 공유해주세요.",
      category: "도로교통 및 토목 분야",
      authorId: official.id,
    },
    {
      n: 3, status: "OPEN", date: "2026-05-10", views: 112,
      title: "성남시 보건소 의료기기 유지보수 서비스 업체 정보",
      content: "자동전자혈압계, 체온계 등 보건소 의료기기 정기 유지보수 서비스 업체 추천 부탁드립니다. 기기병력부 관리 포함 필요합니다.",
      category: "재난안전 및 소방/보건 분야",
      authorId: officialIds["보건위생과_성남시청"],
    },
    {
      n: 4, status: "OPEN", date: "2026-05-05", views: 234,
      title: "용인시청 네트워크 인프라 유지보수 서비스 업체 추천",
      content: "L3 스위치, 방화벽 등 네트워크 장비 유지보수 서비스 업체 추천 요청합니다. 연간 계약 형태 선호합니다.",
      category: "정보통신 및 디지털/4차산업 분야",
      authorId: officialIds["디지털정보과_최주임"],
    },
    {
      n: 5, status: "OPEN", date: "2026-04-28", views: 345,
      title: "업무용 PC 대량 구매 시 최적 사양 및 업체 추천",
      content: "30대 이상 업무용 PC 구매 시 Intel i7 기준 최적 사양과 납품 실적 좋은 업체 추천 부탁드립니다.",
      category: "정보통신 및 디지털/4차산업 분야",
      authorId: officialIds["디지털정보과_최주임"],
      videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    },
    {
      n: 6, status: "CLOSED", date: "2026-04-10", views: 178,
      title: "소방 설비 정기점검 서비스 업체 문의",
      content: "소화기, 소방호스, 경보설비 정기점검 서비스 업체를 찾습니다. 소방청 등록 업체 필수, 보고서 제출 가능한 곳으로 추천해주세요.",
      category: "재난안전 및 소방/보건 분야",
      authorId: officialIds["디지털정보과_최주임"],
    },
    {
      n: 7, status: "OPEN", date: "2026-05-09", views: 198,
      title: "고양시 LED 가로등 교체 공사 서비스 업체 추천",
      content: "KS C 7613 기준 LED 가로등 교체 공사 업체 추천 요청합니다. 시공 후 1년 유지보수 포함 조건입니다.",
      category: "건축시설 및 전기/설비 분야",
      authorId: officialIds["시설관리과_고양시청"],
    },
    {
      n: 8, status: "OPEN", date: "2026-05-11", views: 145,
      title: "청사 냉난방 설비 유지보수 서비스 정보 요청",
      content: "고양시청 청사 내 냉난방 설비 정기 점검 및 유지보수 서비스 업체 정보를 요청합니다. 연간 계약 형태로 진행 예정입니다.",
      category: "건축시설 및 전기/설비 분야",
      authorId: officialIds["시설관리과_고양시청"],
    },
    {
      n: 9, status: "OPEN", date: "2026-05-03", views: 234,
      title: "무인 주차관제 시스템 견적 요청",
      content: "화성시청 주차장에 도입할 무인 주차관제 시스템 견적 요청합니다. 차량 번호 인식, 정산 기능, CCTV 연동 필수입니다. 예산은 5천만원 내외입니다.",
      category: "교통 안전 및 관제",
      authorId: official.id,
    },
    {
      n: 10, status: "OPEN", date: "2026-05-05", views: 156,
      title: "태양광 발전 설비 유지보수 서비스",
      content: "화성시청 옥상 태양광 발전 설비의 정기 유지보수 서비스가 필요합니다. 패널 청소, 인버터 점검, 발전량 모니터링 등을 포함합니다.",
      category: "전기 및 에너지 설비",
      authorId: officialIds["환경과_수원시청"],
    },
  ];
  for (const p of POSTS) {
    const data = {
      boardType: "DEMAND" as const,
      authorId: p.authorId,
      category: p.category,
      title: p.title,
      content: p.content,
      status: p.status,
      views: p.views,
      videoUrl: p.videoUrl ?? null,
      createdAt: new Date(p.date),
    };
    await prisma.post.upsert({
      where: { id: `post-d-${p.n}` },
      update: data,
      create: { id: `post-d-${p.n}`, ...data },
    });
  }

  const ATTACHMENTS = [
    { id: "patt-d-5-1", fileName: "PC_구매_사양서_i7_16GB.pdf", fileSize: 1782579 },
    { id: "patt-d-5-2", fileName: "업무용PC_설치_환경_점검표.xlsx", fileSize: 949965 },
  ];
  for (const a of ATTACHMENTS) {
    const data = { postId: "post-d-5", fileUrl: a.fileName, fileName: a.fileName, fileSize: a.fileSize };
    await prisma.postAttachment.upsert({
      where: { id: a.id },
      update: data,
      create: { id: a.id, ...data },
    });
  }

  type DemandSeedComment = { id: string; authorId: string; date: string; body: string; parentId?: string };
  const COMMENTS: DemandSeedComment[] = [
    {
      id: "cmt-d-5-1", authorId: supplierUserIds["디지털솔루션(주)"], date: "2026-04-29",
      body: "i7-14700 기반 업무용 PC 납품 전문. 30대 이상 구매 시 5% 추가 할인, 3년 무상 AS 제공. 납품 후 현장 설치 서비스 포함.",
    },
    {
      id: "cmt-d-5-2", authorId: supplierUserIds["오피스텍(주)"], date: "2026-04-30",
      body: "PC 30대 이상 대량 구매 시 모니터 세트 구성 가능. 윈도우 라이선스, 엑셀/워드 포함 설정 납품.",
    },
    {
      id: "cmt-d-5-3", authorId: supplierUserIds["아이티솔루션(주)"], date: "2026-05-01",
      body: "삼성, LG, ASUS 브랜드 3종 비교 견적 제공 가능. 3년 제조사 AS 계약 동시 체결 가능.",
    },
    {
      id: "cmt-d-5-4", authorId: supplierUserIds["한국IT자재(주)"], date: "2026-05-02",
      body: "국산 저소음 스탠드형 케이스 기반 맞춤형 조립 PC 가능. 성능 테스트 보고서 납품 전 제공.",
    },
    {
      id: "cmt-d-5-5", authorId: supplierUserIds["컴퓨전코리아(주)"], date: "2026-05-03",
      body: "DDR5 기반 최신 사양. 납기 1주 이내 가능. 대기업 전산실 납품 실적 다수 보유.",
    },
    {
      id: "cmt-d-5-6", authorId: supplierUserIds["테크파트너스(주)"], date: "2026-05-04",
      body: "공공기관 납품 전문 업체. 나라장터 등록 완료, 조달우수제품 인증 보유. 무상 AS 3년 + 방문 서비스 포함.",
    },
    {
      id: "cmt-d-5-7", authorId: officialIds["디지털정보과_최주임"], date: "2026-04-30", parentId: "cmt-d-5-1",
      body: "모니터 포함 세트 구성도 가능한지 문의드립니다. 24인치 FHD 기준으로 견적 부탁드립니다.",
    },
  ];
  for (const c of COMMENTS) {
    const data = {
      postId: "post-d-5",
      authorId: c.authorId,
      content: c.body,
      parentId: c.parentId ?? null,
      createdAt: new Date(c.date),
    };
    await prisma.comment.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }

  return "community(수요게시판): Post 10(OPEN 8/CLOSED 2) · Comment 7(대댓글 1) · 첨부 2 · 신규 Organization 4 / SupplierCompany 4 / User 9";
}
