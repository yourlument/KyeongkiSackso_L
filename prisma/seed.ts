import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encField, encryptLookup } from "../src/lib/crypto/pii";
import { CATEGORY_TAXONOMY, topCode, midCode, leafCode } from "../src/lib/categories";

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("Test1234!", 10);

  const SERVICE_FULL = [
    "제1조 (목적)",
    '본 약관은 (주)KORLINK(이하 "회사")가 제공하는 공공조달 플랫폼 KORLINK(이하 "서비스")의 이용조건 및 절차, 회원과 회사 간의 권리·의무·책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.',
    "제2조 (용어의 정의)",
    '① "서비스"란 회사가 제공하는 지자체 공공조달 중계 플랫폼 및 관련 제반 서비스를 의미합니다.',
    '② "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 말하며, 공무원/구매담당자 회원과 공급업체 회원으로 구분됩니다.',
    '③ "공무원/구매담당자 회원"이란 지방자치단체 소속 공무원 또는 구매 업무 담당자로서 물품·용역 구매, 견적요청, 수요게시 등의 기능을 이용하는 회원을 말합니다.',
    '④ "공급업체 회원"이란 KORLINK 플랫폼에 입점하여 상품을 등록하고 견적을 제출하는 기업 회원을 말합니다.',
    "제3조 (회원 자격 및 구분)",
    "① 회사는 회원의 자격을 공무원/구매담당자와 공급업체로 구분하여 운영하며, 각 자격에 따라 이용 가능한 서비스가 상이합니다.",
    "② 공무원/구매담당자 회원은 소속 기관 정보 및 사업자등록번호(고유번호증)를 정확히 등록하여야 하며, 허위 정보 기재 시 서비스 이용이 제한될 수 있습니다.",
    "③ 공급업체 회원은 사업자등록증 제출 및 관리자 승인 절차를 거쳐야 정식 이용이 가능하며, 승인 전까지 일부 기능이 제한됩니다.",
    "④ 회원은 타인의 정보를 도용하거나 이중 가입할 수 없으며, 적발 시 즉시 이용이 제한됩니다.",
    "제4조 (거래 성립 및 플랫폼의 역할)",
    "① 본 서비스에서의 모든 거래는 회원 간 직접 체결되는 것을 원칙으로 하며, 회사는 거래 당사자가 아닌 중개 플랫폼 제공자입니다.",
    "② 거래의 성립은 구매자가 발주(또는 결제)를 완료하고 공급자가 이를 수락한 시점을 기준으로 합니다.",
    "③ 회사는 등록된 상품의 품질, 규격, 납품 시기 등에 대해 보증하지 않으며, 이에 대한 책임은 해당 상품을 등록한 공급업체 회원에게 있습니다.",
    "제5조 (플랫폼의 면책)",
    "① 회사는 회원 간 거래에서 발생하는 분쟁(대금 미지급, 납품 지연, 하자 등)에 대해 개입 의무가 없으며, 이에 대한 법적 책임을 지지 않습니다.",
    "② 회사는 천재지변, 통신 장애, 정부 규제 등 불가항력으로 인한 서비스 일시 중단에 대해 책임을 지지 않습니다.",
    "③ 회원이 게시한 콘텐츠(상품 정보, 견적 내용 등)의 정확성과 적법성은 게시자 본인에게 책임이 있습니다.",
    "제6조 (금지행위)",
    "회원은 다음 각 호의 행위를 하여서는 안 됩니다.",
    "1. 허위 정보 등록 또는 타인 정보 도용",
    "2. 공공조달 관련 법령 위반 행위",
    "3. 담합, 입찰 방해 등 공정 경쟁을 해치는 행위",
    "4. 서비스의 정상적 운영을 방해하는 행위",
    "5. 회사 또는 제3자의 지식재산권 침해",
    "제7조 (분쟁 해결)",
    "① 서비스 이용과 관련한 분쟁은 상호 협의를 원칙으로 합니다.",
    "② 협의가 이루어지지 않을 경우, 대한민국 법령을 준거법으로 하여 회사 소재지 관할 법원에 소를 제기합니다.",
  ].join("\n");

  const SERVICE_SUMMARY =
    "공무원(구매자)과 입점 업체(공급자)의 자격을 구분하고, 거래 성립 기준 및 플랫폼의 중개 면책 범위를 정의하는 기본 규칙입니다.";
  const PRIVACY_SUMMARY =
    "소속 기관, 부서, 연락처, 사업자번호 등 수집하는 정보를 명시하고, 공공조달 증빙 법정 보관 기간(5년)에 따른 관리 방침을 고지합니다.";
  const SUPPLIER_SUMMARY =
    "공급 업체의 대금 정산 주기, 플랫폼 이용 수수료율, 납품 지연 시 패널티 및 반품/교환 배송비 책임 소재를 명시하는 입점 계약입니다.";

  const TERMS = [
    { type: "SERVICE" as const, title: "서비스 이용약관", summary: SERVICE_SUMMARY, content: SERVICE_FULL, required: true },
    { type: "PRIVACY" as const, title: "개인정보 처리방침", summary: PRIVACY_SUMMARY, content: PRIVACY_SUMMARY, required: true },
    { type: "SUPPLIER" as const, title: "판매자 특별 약관 및 정산 약정", summary: SUPPLIER_SUMMARY, content: SUPPLIER_SUMMARY, required: true },
    { type: "MARKETING" as const, title: "마케팅 정보 수신", summary: "혜택 및 이벤트 정보 수신에 동의합니다.", content: "혜택 및 이벤트 정보 수신에 동의합니다.", required: false },
  ];
  for (const t of TERMS) {
    const data = { title: t.title, summary: t.summary, content: t.content, required: t.required };
    await prisma.term.upsert({
      where: { type_version: { type: t.type, version: "1.0" } },
      update: data,
      create: { type: t.type, version: "1.0", ...data },
    });
  }

  const org = await prisma.organization.upsert({
    where: { businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", "123-45-67890") },
    update: {},
    create: {
      name: "화성시청",
      businessRegistrationNo: encField("Organization", "businessRegistrationNo", "123-45-67890")!,
      region: "경기",
    },
  });
  await prisma.user.upsert({
    where: { email: "official@test.com" },
    update: {},
    create: {
      email: "official@test.com",
      passwordHash: pw,
      role: "OFFICIAL",
      name: encField("User", "name", "공무원01")!,
      organizationId: org.id,
      departmentName: "도로관리과",
    },
  });

  const company = await prisma.supplierCompany.upsert({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "211-88-00001") },
    update: { approvalStatus: "APPROVED", name: "디지털솔루션(주)", region: "경기도 성남시" },
    create: {
      name: "디지털솔루션(주)",
      region: "경기도 성남시",
      representativeName: encField("SupplierCompany", "representativeName", "공급01")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "211-88-00001")!,
      address: encField("SupplierCompany", "address", "경기도 화성시"),
      phone: encField("SupplierCompany", "phone", "031-000-0000"),
      approvalStatus: "APPROVED",
    },
  });
  await prisma.user.upsert({
    where: { email: "supplier@test.com" },
    update: {},
    create: {
      email: "supplier@test.com",
      passwordHash: pw,
      role: "SUPPLIER",
      name: encField("User", "name", "공급01 담당자")!,
      supplierCompanyId: company.id,
    },
  });

  const pending = await prisma.supplierCompany.upsert({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "211-88-00002") },
    update: {},
    create: {
      name: "대기업체",
      representativeName: encField("SupplierCompany", "representativeName", "대기")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "211-88-00002")!,
      address: encField("SupplierCompany", "address", "경기도 수원시"),
      phone: encField("SupplierCompany", "phone", "031-111-1111"),
      approvalStatus: "PENDING",
    },
  });
  await prisma.user.upsert({
    where: { email: "pending@test.com" },
    update: {},
    create: {
      email: "pending@test.com",
      passwordHash: pw,
      role: "SUPPLIER",
      name: encField("User", "name", "대기 담당자")!,
      supplierCompanyId: pending.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "official@korlink.co.kr" },
    update: { passwordHash: pw, role: "OFFICIAL", status: "ACTIVE", organizationId: org.id },
    create: {
      email: "official@korlink.co.kr",
      passwordHash: pw,
      role: "OFFICIAL",
      name: encField("User", "name", "공무원 데모")!,
      organizationId: org.id,
      departmentName: "도로관리과",
    },
  });
  await prisma.user.upsert({
    where: { email: "supplier@korlink.co.kr" },
    update: { passwordHash: pw, role: "SUPPLIER", status: "ACTIVE", supplierCompanyId: company.id },
    create: {
      email: "supplier@korlink.co.kr",
      passwordHash: pw,
      role: "SUPPLIER",
      name: encField("User", "name", "공급사 데모")!,
      supplierCompanyId: company.id,
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@korlink.co.kr" },
    update: { passwordHash: pw, role: "ADMIN", status: "ACTIVE" },
    create: {
      email: "admin@korlink.co.kr",
      passwordHash: pw,
      role: "ADMIN",
      name: encField("User", "name", "관리자")!,
    },
  });

  const catIds: string[] = [];
  let topCount = 0;
  let midCount = 0;
  let leafCount = 0;

  for (let ti = 0; ti < CATEGORY_TAXONOMY.length; ti++) {
    const top = CATEGORY_TAXONOMY[ti];
    const topId = `cat-${ti + 1}`;
    const topData = { code: topCode(ti), name: top.name, level: 1, parentId: null, sortOrder: ti };
    await prisma.category.upsert({
      where: { id: topId },
      update: topData,
      create: { id: topId, ...topData },
    });
    catIds.push(topId);
    topCount++;

    for (let mi = 0; mi < top.mids.length; mi++) {
      const mid = top.mids[mi];
      const mCode = midCode(ti, mi);
      const midData = { name: mid.name, level: 2, parentId: topId, sortOrder: mi };
      const midRow = await prisma.category.upsert({
        where: { code: mCode },
        update: midData,
        create: { code: mCode, ...midData },
      });
      midCount++;

      const leaves: { name: string; itemType: "GOODS" | "SERVICE"; code: string }[] = [
        ...mid.goods.map((name, li) => ({
          name,
          itemType: "GOODS" as const,
          code: leafCode(ti, mi, "GOODS", li),
        })),
        ...mid.service.map((name, li) => ({
          name,
          itemType: "SERVICE" as const,
          code: leafCode(ti, mi, "SERVICE", li),
        })),
      ];
      for (let li = 0; li < leaves.length; li++) {
        const leaf = leaves[li];
        const leafData = {
          name: leaf.name,
          level: 3,
          parentId: midRow.id,
          itemType: leaf.itemType,
          sortOrder: li,
        };
        await prisma.category.upsert({
          where: { code: leaf.code },
          update: leafData,
          create: { code: leaf.code, ...leafData },
        });
        leafCount++;
      }
    }
  }

  const REMICON_SPECS = [
    { label: "강도등급", value: "24-40-140(중기)" },
    { label: "최대입자경", value: "25mm 이하" },
    { label: "탈형재", value: "액상형" },
    { label: "콘크리트양", value: "1㎥" },
    { label: "중기노출재", value: "미혼입" },
    { label: "시멘트 종류", value: "보통포틀랜드시멘트" },
    { label: "혼합재비율", value: "중기(S)" },
    { label: "제조방식", value: "미생성" },
    { label: "보유마크", value: "우수제품" },
  ];
  const REMICON_COMPANY = {
    rep: "김철수",
    bizNo: "123-45-67890",
    region: "경기도 화성시",
    phone: "031-123-4567",
    establishedYear: 2010,
    dealCount: 128,
    intro: "경기도 도로교통 분야 15년 이상 경력의 공공조달 전문 기업입니다.",
    certifications: ["우수제품"],
    portfolioFileName: "경기건설_주요납품실적_2024.pdf",
    description:
      "경기건설(주)는 2010년 설립 이래 경기도 내 주요 도로공사 및 토목공사에 참여해온 전문 건설자재 공급 업체입니다.\n\n도로포장재, 레미콘, 아스팔트 등 토목 자재를 중심으로 45종 이상의 상품을 보유하고 있으며, 화성시청, 수원시청 등 경기도 내 28개 지자체와 지속적인 거래 관계를 유지하고 있습니다.\n\n우수조달제품 인증을 보유하고 있으며, ISO 9001 품질경영시스템 인증을 취득하여 제품 품질의 일관성을 보장합니다.",
  };

  const DEMO = [
    { biz: "123-45-67890", company: "경기건설(주)", name: "레미콘(혼합콘크리트) 24-40-140(중기)", price: 115000, cat: 0, img: "/products/p01.png", nps: "12203515", rating: 4.7, reviews: 128, unit: "㎥", badges: ["우수제품"], min: 5, dd: 2, dc: "상차도", specs: REMICON_SPECS, comp: REMICON_COMPANY },
    { biz: "700-01-00002", company: "화성레미콘(주)", name: "레미콘(혼합콘크리트) 30-37-150(고기)", price: 125000, cat: 0, img: "/products/p02.png", nps: "12203516", rating: 4.5, reviews: 86, unit: "㎥", badges: ["우수제품", "창업기업"] },
    { biz: "700-01-00003", company: "포장산업(주)", name: "아스콘(노상용) 표준배합 15-40", price: 95000, cat: 0, img: "/products/p03.png", nps: "45501301", rating: 4.8, reviews: 203, unit: "톤", badges: ["우수제품", "여성기업"] },
    { biz: "700-01-00004", company: "안전제품(주)", name: "교통안전용품(콘) 반사원형콘 750mm", price: 8500, cat: 3, img: "/products/p04.png", nps: "39107101", rating: 4.6, reviews: 312, unit: "개", badges: ["장애인기업"] },
    { biz: "700-01-00005", company: "안전난간(주)", name: "도로안전시설물(난간) 강관난간 2중난간", price: 180000, cat: 0, img: "/products/p05.png", nps: "39107201", rating: 4.4, reviews: 67, unit: "m", badges: ["우수제품", "사회적기업"] },
    { biz: "700-01-00006", company: "디지털솔루션(주)", name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", price: 890000, cat: 4, img: "/products/p06.png", nps: "43201501", rating: 4.9, reviews: 456, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00007", company: "오피스텍(주)", name: "프린터(레이저) 흑백 A4 45ppm", price: 450000, cat: 4, img: "/products/p07.png", nps: "43202601", rating: 4.5, reviews: 234, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00008", company: "네트웍솔루션(주)", name: "네트워크장비(스위치) 48포트 L3 관리형", price: 1200000, cat: 4, img: "/products/p08.png", nps: "43401301", rating: 4.7, reviews: 89, unit: "대", badges: ["우수제품", "창업기업"] },
    { biz: "700-01-00009", company: "안전소방(주)", name: "소방장비(소화기) 분말소화기 3.3kg", price: 35000, cat: 3, img: "/products/p09.png", nps: "32101501", rating: 4.8, reviews: 567, unit: "개", badges: ["우수제품", "장애인기업"] },
    { biz: "700-01-00010", company: "안전소방(주)", name: "소방장비(소방호스) 압송용 65A 20m", price: 78000, cat: 3, img: "/products/p10.png", nps: "32101301", rating: 4.6, reviews: 145, unit: "개", badges: ["우수제품"] },
    { biz: "700-01-00011", company: "안전복지(주)", name: "보호복(일반작업용) 반사통풍형 XL", price: 25000, cat: 3, img: "/products/p11.png", nps: "39108101", rating: 4.3, reviews: 89, unit: "벌", badges: ["여성기업", "사회적기업"] },
    { biz: "700-01-00012", company: "메디칼텍(주)", name: "의료기기(혈압계) 자동전자혈압계 상완식", price: 95000, cat: 6, img: "/products/p12.png", nps: "21201401", rating: 4.9, reviews: 234, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00013", company: "오피스퍼니처(주)", name: "사무용가구(책상) 일반 사무용 책상 1400x700", price: 145000, cat: 2, img: "/products/p13.png", nps: "25101101", rating: 4.4, reviews: 178, unit: "개", badges: ["우수제품"] },
    { biz: "700-01-00014", company: "에듀퍼니처(주)", name: "교육기관용가구(학생책상) 1인용 600x400", price: 68000, cat: 2, img: "/products/p14.png", nps: "25103101", rating: 4.5, reviews: 234, unit: "개", badges: ["우수제품", "사회적기업"] },
    { biz: "700-01-00015", company: "클라이밋텍(주)", name: "냉난방기(에어컨) 벽걸이형 18평형", price: 680000, cat: 1, img: "/products/p15.png", nps: "47102101", rating: 4.7, reviews: 345, unit: "대", badges: ["우수제품"] },
    { biz: "700-01-00016", company: "경기농협(주)", name: "농산물(쌀) 경기미 특등급 20kg", price: 58000, cat: 6, img: "/products/p16.png", nps: "61101101", rating: 4.8, reviews: 890, unit: "포", badges: ["사회적기업", "여성기업"] },
  ];
  for (let i = 0; i < DEMO.length; i++) {
    const p = DEMO[i];
    const comp = "comp" in p ? p.comp : undefined;

    const companyFields = comp
      ? {
          representativeName: encField("SupplierCompany", "representativeName", comp.rep)!,
          phone: encField("SupplierCompany", "phone", comp.phone),
          region: comp.region,
          establishedYear: comp.establishedYear,
          dealCount: comp.dealCount,
          intro: comp.intro,
          description: comp.description,
          certifications: comp.certifications,
          portfolioFileName: comp.portfolioFileName,
        }
      : { representativeName: encField("SupplierCompany", "representativeName", p.company)! };
    const company = await prisma.supplierCompany.upsert({
      where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", p.biz) },
      update: { approvalStatus: "APPROVED", ...companyFields },
      create: {
        name: p.company,
        businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", p.biz)!,
        approvalStatus: "APPROVED",
        ...companyFields,
      },
    });
    const data = {
      supplierCompanyId: company.id,
      categoryId: catIds[p.cat],
      name: p.name,
      price: p.price,
      unit: p.unit,
      status: "ACTIVE" as const,
      npsCode: p.nps,
      rating: p.rating,
      reviewCount: p.reviews,
      badges: p.badges,
      minOrderQty: p.min ?? null,
      deliveryDays: p.dd ?? null,
      deliveryCondition: p.dc ?? null,
      specs: "specs" in p ? p.specs : undefined,
    };
    const prod = await prisma.product.upsert({
      where: { id: `demo-${i + 1}` },
      update: data,
      create: { id: `demo-${i + 1}`, ...data },
    });
    await prisma.productImage.upsert({
      where: { id: `demo-img-${i + 1}` },
      update: { url: p.img },
      create: { id: `demo-img-${i + 1}`, productId: prod.id, url: p.img, sortOrder: 0 },
    });
    await prisma.inventory.upsert({
      where: { productId: prod.id },
      update: {},
      create: { productId: prod.id, quantity: 100 },
    });
  }

  console.log(`seed done: [korink.co.kr] official@korlink.co.kr / supplier@korlink.co.kr / admin@korlink.co.kr  [test] official@test.com / supplier@test.com / pending@test.com  (pw: Test1234!) + ${DEMO.length} products | categories: ${topCount} top / ${midCount} mid / ${leafCount} leaf`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
