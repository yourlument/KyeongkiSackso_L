import type { PrismaClient } from "@prisma/client";
import { encField, encryptLookup } from "../../src/lib/crypto/pii";
import type { SeedCtx } from "./types";

const FIELD_TO_CAT: Record<string, string> = {
  "도로교통 및 토목 분야": "cat-1",
  "건축시설 및 전기/설비 분야": "cat-2",
  "일반행정 및 교육/지원 분야": "cat-3",
  "재난안전 및 소방/보건 분야": "cat-4",
  "정보통신 및 디지털/4차산업 분야": "cat-5",
  "환경/산림 및 조경/청소 분야": "cat-6",
  "복지/식품 및 문화/관광 분야": "cat-7",
};

export async function seedMembers(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  const SUPPLIER_ROWS: { name: string; bizNos: string[]; field: string; region: string }[] = [
    { name: "경기건설(주)", bizNos: ["123-45-67890"], field: "도로교통 및 토목 분야", region: "경기도 화성시" },
    { name: "화성레미콘(주)", bizNos: ["700-01-00002"], field: "도로교통 및 토목 분야", region: "경기도 화성시" },
    { name: "포장산업(주)", bizNos: ["700-01-00003"], field: "도로교통 및 토목 분야", region: "경기도 이천시" },
    { name: "안전제품(주)", bizNos: ["700-01-00004"], field: "도로교통 및 토목 분야", region: "경기도 안산시" },
    { name: "안전난간(주)", bizNos: ["700-01-00005"], field: "도로교통 및 토목 분야", region: "경기도 용인시" },
    { name: "디지털솔루션(주)", bizNos: ["211-88-00001", "700-01-00006"], field: "정보통신 및 디지털/4차산업 분야", region: "경기도 성남시" },
    { name: "오피스텍(주)", bizNos: ["700-01-00007"], field: "정보통신 및 디지털/4차산업 분야", region: "경기도 수원시" },
    { name: "네트웍솔루션(주)", bizNos: ["700-01-00008"], field: "정보통신 및 디지털/4차산업 분야", region: "경기도 판교" },
    { name: "안전소방(주)", bizNos: ["700-01-00009", "700-01-00010"], field: "재난안전 및 소방/보건 분야", region: "경기도 평택시" },
    { name: "안전복지(주)", bizNos: ["700-01-00011"], field: "재난안전 및 소방/보건 분야", region: "경기도 광주시" },
    { name: "메디칼텍(주)", bizNos: ["700-01-00012"], field: "재난안전 및 소방/보건 분야", region: "경기도 의정부시" },
    { name: "오피스퍼니처(주)", bizNos: ["700-01-00013"], field: "일반행정 및 교육/지원 분야", region: "경기도 김포시" },
    { name: "에듀퍼니처(주)", bizNos: ["700-01-00014"], field: "일반행정 및 교육/지원 분야", region: "경기도 안성시" },
    { name: "클라이밋텍(주)", bizNos: ["700-01-00015"], field: "건축시설 및 전기/설비 분야", region: "경기도 오산시" },
    { name: "경기농협(주)", bizNos: ["700-01-00016"], field: "복지/식품 및 문화/관광 분야", region: "경기도 이천시" },
  ];

  let updatedCompanies = 0;
  for (const row of SUPPLIER_ROWS) {
    const res = await prisma.supplierCompany.updateMany({
      where: {
        businessRegistrationNo: {
          in: row.bizNos.map((b) => encryptLookup("SupplierCompany", "businessRegistrationNo", b)),
        },
      },
      data: { region: row.region, categoryId: FIELD_TO_CAT[row.field] },
    });
    updatedCompanies += res.count;
  }

  await prisma.supplierCompany.updateMany({
    where: {
      businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "123-45-67890"),
    },
    data: {
      createdAt: new Date("2010-01-01"),
      taxEmail: "tax@.com",
      address: encField("SupplierCompany", "address", "경기도 화성시 산업단지로 123"),
      businessLicenseFileUrl: "사업자등록증_경기건설(주).pdf",
      bankName: "국민은행",
      bankAccountNo: "123456-78-901234",
      bankAccountHolder: "김철수",
      bankVerifiedAt: new Date("2010-01-01"),
    },
  });

  const org = await prisma.organization.upsert({
    where: {
      businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", "123-45-67890"),
    },
    update: {
      region: "경기도 화성시",
      representativeName: encField("Organization", "representativeName", "화성시장 정명근"),
      taxEmail: encField("Organization", "taxEmail", "finance@hwaseong.go.kr"),
      address: encField("Organization", "address", "경기도 화성시 시청로 159"),
    },
    create: {
      id: "org-화성시청",
      name: "화성시청",
      businessRegistrationNo: encField("Organization", "businessRegistrationNo", "123-45-67890")!,
      region: "경기도 화성시",
      representativeName: encField("Organization", "representativeName", "화성시장 정명근"),
      taxEmail: encField("Organization", "taxEmail", "finance@hwaseong.go.kr"),
      address: encField("Organization", "address", "경기도 화성시 시청로 159"),
    },
  });

  const OFFICIAL_ROWS: { name: string; dept: string; joinDate?: string }[] = [
    { name: "김주임", dept: "화성시 도로과" },
    { name: "박주임", dept: "화성시 정보통신과", joinDate: "2022-08-20" },
    { name: "이대리", dept: "화성시 안전총괄과" },
  ];
  const newUserEmails: string[] = [];
  for (const o of OFFICIAL_ROWS) {
    const email = `seed-${o.name}@korlink.demo`;
    await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        status: "ACTIVE",
        organizationId: org.id,
        departmentName: o.dept,
      },
      create: {
        email,
        passwordHash: ctx.pwHash,
        role: "OFFICIAL",
        status: "ACTIVE",
        name: encField("User", "name", o.name)!,
        organizationId: org.id,
        departmentName: o.dept,
        ...(o.joinDate ? { createdAt: new Date(o.joinDate) } : {}),
      },
    });
    newUserEmails.push(email);
  }

  const newConst = await prisma.supplierCompany.upsert({
    where: { id: "sco-새로운건설(주)" },
    update: {
      approvalStatus: "PENDING",
      region: "경기도 화성시",
      categoryId: FIELD_TO_CAT["도로교통 및 토목 분야"],
    },
    create: {
      id: "sco-새로운건설(주)",
      name: "새로운건설(주)",
      representativeName: encField("SupplierCompany", "representativeName", "김새로")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "111-22-33344")!,
      corporateRegistrationNo: encField("SupplierCompany", "corporateRegistrationNo", "110111-1234567"),
      businessType: "건설업",
      businessItem: "토목건설업",
      address: encField("SupplierCompany", "address", "경기도 화성시"),
      phone: encField("SupplierCompany", "phone", "031-123-4567"),
      approvalStatus: "PENDING",
      region: "경기도 화성시",
      categoryId: FIELD_TO_CAT["도로교통 및 토목 분야"],
      managerName: "김담당",
      managerPhone: "010-1234-5678",
      bankName: "국민은행",
      bankAccountNo: "123456-78-901234",
      bankAccountHolder: "김새로",
      bankVerifiedAt: null,
      businessLicenseFileUrl: "사업자등록증",
      createdAt: new Date("2026-05-01"),
    },
  });
  await prisma.user.upsert({
    where: { email: "새로운건설@email.com" },
    update: {
      passwordHash: ctx.pwHash,
      role: "SUPPLIER",
      supplierCompanyId: newConst.id,
    },
    create: {
      email: "새로운건설@email.com",
      passwordHash: ctx.pwHash,
      role: "SUPPLIER",
      name: encField("User", "name", "김담당")!,
      phone: encField("User", "phone", "010-1234-5678"),
      supplierCompanyId: newConst.id,
      createdAt: new Date("2026-05-01"),
    },
  });
  newUserEmails.push("새로운건설@email.com");

  await prisma.supplierCompany.upsert({
    where: { id: "sco-디지털월드(주)" },
    update: {
      approvalStatus: "PENDING",
      region: "경기도 판교",
      categoryId: FIELD_TO_CAT["정보통신 및 디지털/4차산업 분야"],
    },
    create: {
      id: "sco-디지털월드(주)",
      name: "디지털월드(주)",
      representativeName: encField("SupplierCompany", "representativeName", "이디지털")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "222-33-44455")!,
      approvalStatus: "PENDING",
      region: "경기도 판교",
      categoryId: FIELD_TO_CAT["정보통신 및 디지털/4차산업 분야"],
      businessLicenseFileUrl: "사업자등록증",
      createdAt: new Date("2026-05-03"),
    },
  });

  await prisma.supplierCompany.upsert({
    where: { id: "sco-그린에너지(주)" },
    update: { approvalStatus: "APPROVED" },
    create: {
      id: "sco-그린에너지(주)",
      name: "그린에너지(주)",
      representativeName: encField("SupplierCompany", "representativeName", "그린에너지(주)")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "333-44-55566")!,
      approvalStatus: "APPROVED",
      createdAt: new Date("2026-04-20"),
    },
  });

  await prisma.supplierCompany.upsert({
    where: { id: "sco-푸드솔루션(주)" },
    update: { approvalStatus: "REJECTED" },
    create: {
      id: "sco-푸드솔루션(주)",
      name: "푸드솔루션(주)",
      representativeName: encField("SupplierCompany", "representativeName", "푸드솔루션(주)")!,
      businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", "444-55-66677")!,
      approvalStatus: "REJECTED",
      createdAt: new Date("2026-04-15"),
    },
  });

  return `members: 기존 공급사 ${updatedCompanies}건 갱신(지역/분야) + 입점신청 4사(sco-*) + 공무원 3명 + 새로운건설 계정 1 + 화성시청 org 보강`;
}
