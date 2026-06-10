import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const officialSchema = z.object({
  portal: z.literal("OFFICIAL"),
  organizationName: z.string().min(1),
  departmentName: z.string().min(1),
  email: z.string().min(1),
});
const supplierSchema = z.object({
  portal: z.literal("SUPPLIER"),
  companyName: z.string().min(1),
  representativeName: z.string().min(1),
  email: z.string().min(1),
});
const resetSchema = z.discriminatedUnion("portal", [officialSchema, supplierSchema]);

const MISMATCH = "입력한 정보가 일치하지 않습니다.";

function generateTempPassword(): string {
  const token = randomBytes(8).toString("base64").replace(/[^A-Za-z0-9]/g, "");
  return `xx#${token.slice(0, 9)}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: MISMATCH }, { status: 400 });
  }

  const data = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { organization: true, supplierCompany: true },
  });

  let matched = false;
  if (user) {
    if (data.portal === "OFFICIAL" && user.role === "OFFICIAL") {
      matched =
        user.organization?.name === data.organizationName &&
        user.departmentName === data.departmentName;
    } else if (data.portal === "SUPPLIER" && user.role === "SUPPLIER") {
      matched =
        user.supplierCompany?.name === data.companyName &&
        user.supplierCompany?.representativeName === data.representativeName;
    }
  }

  if (!user || !matched) {
    return NextResponse.json({ message: MISMATCH }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(tempPassword) },
  });

  return NextResponse.json({ tempPassword });
}
