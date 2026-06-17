import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";

type NaraSeedRow = {
  id: string;
  npsCode: string;
  name: string;
  spec?: string;
  category?: string;
};

const SEARCH_MOCK: NaraSeedRow[] = [
  {
    id: "nara-1",
    npsCode: "12203515",
    name: "레미콘(혼합콘크리트) 24-40-140(중기)",
    spec: "강도 24MPa, 최대입자경 25mm",
    category: "도로교통·토목",
  },
  {
    id: "nara-2",
    npsCode: "39107101",
    name: "교통안전용품(콘) 반사원형콘 750mm",
    spec: "PVC, 750mm, 고휘도반사시트",
    category: "교통안전",
  },
  {
    id: "nara-3",
    npsCode: "45501301",
    name: "아스콘(노상용) 표준배합 15-40",
    spec: "노상용, 표준배합, 최대입자경 13mm",
    category: "도로교통·토목",
  },
];

const PRODUCT_ITEMS: NaraSeedRow[] = [
  { id: "nara-p1", npsCode: "12203515", name: "레미콘(혼합콘크리트) 24-40-140(중기)" },
  { id: "nara-p2", npsCode: "12203516", name: "레미콘(혼합콘크리트) 30-37-150(고기)" },
  { id: "nara-p3", npsCode: "45501301", name: "아스콘(노상용) 표준배합 15-40" },
  { id: "nara-p4", npsCode: "39107101", name: "교통안전용품(콘) 반사원형콘 750mm" },
  { id: "nara-p5", npsCode: "39107201", name: "도로안전시설물(난간) 강관난간 2중난간" },
  { id: "nara-p6", npsCode: "43201501", name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB" },
  { id: "nara-p7", npsCode: "43202601", name: "프린터(레이저) 흑백 A4 45ppm" },
  { id: "nara-p8", npsCode: "43401301", name: "네트워크장비(스위치) 48포트 L3 관리형" },
  { id: "nara-p9", npsCode: "32101501", name: "소방장비(소화기) 분말소화기 3.3kg" },
  { id: "nara-p10", npsCode: "32101301", name: "소방장비(소방호스) 압송용 65A 20m" },
  { id: "nara-p11", npsCode: "39108101", name: "보호복(일반작업용) 반사통풍형 XL" },
  { id: "nara-p12", npsCode: "21201401", name: "의료기기(혈압계) 자동전자혈압계 상완식" },
  { id: "nara-p13", npsCode: "25101101", name: "사무용가구(책상) 일반 사무용 책상 1400x700" },
  { id: "nara-p14", npsCode: "25103101", name: "교육기관용가구(학생책상) 1인용 600x400" },
  { id: "nara-p15", npsCode: "47102101", name: "냉난방기(에어컨) 벽걸이형 18평형" },
  { id: "nara-p16", npsCode: "61101101", name: "농산물(쌀) 경기미 특등급 20kg" },
];

export async function seedNara(prisma: PrismaClient, _ctx: SeedCtx): Promise<string> {
  for (const r of SEARCH_MOCK) {
    await prisma.naraItem.upsert({
      where: { npsCode: r.npsCode },
      update: { name: r.name, spec: r.spec ?? null, category: r.category ?? null },
      create: {
        id: r.id,
        npsCode: r.npsCode,
        name: r.name,
        spec: r.spec ?? null,
        category: r.category ?? null,
      },
    });
  }

  const mockCodes = new Set(SEARCH_MOCK.map((r) => r.npsCode));
  let productAdded = 0;
  for (const p of PRODUCT_ITEMS) {
    if (mockCodes.has(p.npsCode)) continue;
    await prisma.naraItem.upsert({
      where: { npsCode: p.npsCode },
      update: { name: p.name },
      create: { id: p.id, npsCode: p.npsCode, name: p.name },
    });
    productAdded++;
  }

  return `NaraItem ${SEARCH_MOCK.length + productAdded}건 (검색 mock 3 + 데모상품 npsCode ${productAdded} — npsCode 기준 멱등 upsert, 중복 코드 3건은 mock 우선)`;
}
