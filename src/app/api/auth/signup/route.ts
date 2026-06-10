import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { encryptModel, encryptLookup, encField } from "@/lib/crypto/pii";
import { officialSignupSchema, supplierSignupSchema } from "@/lib/validators/auth";
import type { TermType } from "@prisma/client";

const REQUIRED_TERMS: Record<"OFFICIAL" | "SUPPLIER", TermType[]> = {
  OFFICIAL: ["SERVICE", "PRIVACY"],
  SUPPLIER: ["SERVICE", "PRIVACY", "SUPPLIER"],
};

async function assertRequiredTermsAgreed(
  portal: "OFFICIAL" | "SUPPLIER",
  termIds: string[],
): Promise<boolean> {
  const required = await prisma.term.findMany({
    where: { isActive: true, required: true, type: { in: REQUIRED_TERMS[portal] } },
    select: { id: true },
  });
  return required.every((t) => termIds.includes(t.id));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const portal = body?.portal;

  if (portal !== "OFFICIAL" && portal !== "SUPPLIER") {
    return NextResponse.json({ message: "가입 유형이 올바르지 않습니다" }, { status: 400 });
  }

  const parsed =
    portal === "OFFICIAL"
      ? officialSignupSchema.safeParse(body)
      : supplierSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ message: "이미 가입된 이메일입니다" }, { status: 409 });
  }

  if (!(await assertRequiredTermsAgreed(portal, data.termIds))) {
    return NextResponse.json({ message: "필수 약관에 동의해 주세요" }, { status: 400 });
  }

  const passwordHash = await hashPassword(data.password);

  if (portal === "OFFICIAL") {
    const d = data as import("@/lib/validators/auth").OfficialSignupInput;
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.upsert({
        where: { businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", d.organizationBizNo) },
        update: encryptModel("Organization", {
          name: d.organizationName,
          representativeName: d.orgRepresentativeName || undefined,
          taxEmail: d.orgTaxEmail || undefined,
          address: d.orgAddress || undefined,
        }),
        create: encryptModel("Organization", {
          name: d.organizationName,
          businessRegistrationNo: d.organizationBizNo,
          representativeName: d.orgRepresentativeName || undefined,
          taxEmail: d.orgTaxEmail || undefined,
          address: d.orgAddress || undefined,
        }),
      });
      const user = await tx.user.create({
        data: {
          email: d.email,
          passwordHash,
          role: "OFFICIAL",
          status: "ACTIVE",
          name: encField("User", "name", d.name || d.departmentName)!,
          phone: encField("User", "phone", d.departmentPhone),
          position: encField("User", "position", d.position),
          departmentName: d.departmentName,
          organizationId: org.id,
        },
      });
      await tx.userTermAgreement.createMany({
        data: d.termIds.map((termId) => ({ userId: user.id, termId })),
        skipDuplicates: true,
      });
    });

    return NextResponse.json({ autoApproved: true });
  }

  const d = data as import("@/lib/validators/auth").SupplierSignupInput;
  await prisma.$transaction(async (tx) => {
    const company = await tx.supplierCompany.create({
      data: {
        name: d.companyName,
        representativeName: encField("SupplierCompany", "representativeName", d.representativeName)!,
        businessRegistrationNo: encField("SupplierCompany", "businessRegistrationNo", d.businessRegistrationNo)!,
        businessLicenseFileUrl: d.businessLicenseFileUrl,
        corporateRegistrationNo: encField("SupplierCompany", "corporateRegistrationNo", d.corporateRegistrationNo),
        businessType: d.businessType,
        businessItem: d.businessItem,
        address: encField("SupplierCompany", "address", d.address),
        phone: encField("SupplierCompany", "phone", d.phone),
        approvalStatus: "PENDING",
      },
    });
    const user = await tx.user.create({
      data: {
        email: d.email,
        passwordHash,
        role: "SUPPLIER",
        status: "ACTIVE",
        name: encField("User", "name", d.representativeName)!,
        phone: encField("User", "phone", d.phone),
        supplierCompanyId: company.id,
      },
    });
    await tx.userTermAgreement.createMany({
      data: d.termIds.map((termId) => ({ userId: user.id, termId })),
      skipDuplicates: true,
    });
  });

  return NextResponse.json({ autoApproved: false, status: "PENDING" });
}
