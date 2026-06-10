import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { encryptLookup } from "@/lib/crypto/pii";

const officialSchema = z.object({
  portal: z.literal("OFFICIAL"),
  organizationBizNo: z.string().min(1),
  organizationName: z.string().min(1),
  departmentName: z.string().min(1),
});
const supplierSchema = z.object({
  portal: z.literal("SUPPLIER"),
  businessRegistrationNo: z.string().min(1),
  companyName: z.string().min(1),
  representativeName: z.string().min(1),
});
const findIdSchema = z.discriminatedUnion("portal", [officialSchema, supplierSchema]);

const NOT_FOUND = "일치하는 회원 정보를 찾을 수 없습니다.";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}******@${domain}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = findIdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: NOT_FOUND }, { status: 400 });
  }

  const data = parsed.data;
  let user = null;

  if (data.portal === "OFFICIAL") {
    const org = await prisma.organization.findFirst({
      where: {
        businessRegistrationNo: encryptLookup("Organization", "businessRegistrationNo", data.organizationBizNo),
        name: data.organizationName,
      },
    });
    if (org) {
      user = await prisma.user.findFirst({
        where: {
          role: "OFFICIAL",
          organizationId: org.id,
          departmentName: data.departmentName,
        },
      });
    }
  } else {
    const company = await prisma.supplierCompany.findFirst({
      where: {
        businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", data.businessRegistrationNo),
        name: data.companyName,
        representativeName: encryptLookup("SupplierCompany", "representativeName", data.representativeName),
      },
    });
    if (company) {
      user = await prisma.user.findFirst({
        where: { role: "SUPPLIER", supplierCompanyId: company.id },
      });
    }
  }

  if (!user) {
    return NextResponse.json({ message: NOT_FOUND }, { status: 404 });
  }

  return NextResponse.json({ email: maskEmail(user.email) });
}
