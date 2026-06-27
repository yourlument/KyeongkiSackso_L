import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { sendMail } from "@/lib/mail";

function tempPasswordEmail(tempPassword: string): { subject: string; html: string } {
  return {
    subject: "[KORINK] 임시 비밀번호가 발급되었습니다",
    html: `<div style="max-width:480px;margin:0 auto;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1D1D1F">
  <h2 style="font-size:18px;font-weight:700;color:#1E3A5F;margin:0 0 16px">임시 비밀번호 안내</h2>
  <p style="font-size:14px;line-height:24px;color:#1D1D1F;margin:0 0 16px">요청하신 임시 비밀번호가 발급되었습니다. 아래 비밀번호로 로그인하신 후 반드시 비밀번호를 변경해 주세요.</p>
  <div style="background:#1E3A5F0D;border:1px solid #1E3A5F33;border-radius:12px;padding:20px;text-align:center;margin:0 0 16px">
    <p style="font-size:12px;color:#1D1D1F80;margin:0 0 8px">임시 비밀번호</p>
    <p style="font-size:22px;font-weight:700;letter-spacing:1px;color:#1E3A5F;margin:0">${tempPassword}</p>
  </div>
  <p style="font-size:12px;line-height:20px;color:#1D1D1F66;margin:0">본 메일은 발신 전용입니다. 비밀번호 재설정을 요청하지 않으셨다면 즉시 고객센터로 문의해 주세요.</p>
</div>`,
  };
}

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

  const mail = tempPasswordEmail(tempPassword);
  const sent = await sendMail({ to: user.email, subject: mail.subject, html: mail.html });

  return NextResponse.json({ tempPassword, emailSent: sent.ok });
}
