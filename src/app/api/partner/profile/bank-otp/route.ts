import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { nicepayBankCode } from "@/lib/nicepay/banks";
import { getNiceAccountConfig } from "@/lib/nice-account/config";
import {
  createNicepayAccountMoid,
  requestAccountOwnership,
} from "@/lib/nice-account/client";
import {
  accountOtpMessage,
  isAccountOtpSuccess,
} from "@/lib/nice-account/codes";

export const dynamic = "force-dynamic";

const input = z.object({
  bankName: z.string().trim().min(1),
  bankAccountNo: z.string().trim().min(1),
  bankAccountHolder: z.string().trim().min(1),
  bankbookFileUrl: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }
  const d = parsed.data;
  const accountNo = d.bankAccountNo.replace(/\D/g, "");
  const bankCd = nicepayBankCode(null, d.bankName);
  if (!bankCd) {
    return NextResponse.json({ message: "지원하지 않는 은행입니다" }, { status: 400 });
  }
  if (!accountNo) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }

  const company = await prisma.supplierCompany.findUnique({
    where: { id: companyId },
    select: { bankbookFileUrl: true },
  });
  if (!company) {
    return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  }

  await prisma.supplierCompany.update({
    where: { id: companyId },
    data: {
      pendingBankName: d.bankName,
      pendingBankCode: bankCd,
      pendingBankAccountNo: accountNo,
      pendingBankAccountHolder: d.bankAccountHolder,
      pendingBankbookFileUrl:
        d.bankbookFileUrl !== undefined
          ? d.bankbookFileUrl
          : company.bankbookFileUrl,
      bankOtpRefId: null,
      bankOtpRequestNo: null,
      bankOtpRequestedAt: null,
    },
  });

  if (!getNiceAccountConfig().enabled) {
                                                                              
                                                                          
    await prisma.supplierCompany.update({
      where: { id: companyId },
      data: { bankOtpRequestedAt: new Date() },
    });
    return NextResponse.json({ ok: true, live: false });
  }

  const moid = createNicepayAccountMoid(companyId);
  let res;
  try {
    res = await requestAccountOwnership({
      bankCd,
      accountNo,
      accountName: d.bankAccountHolder,
      moid,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "NICEPAY 계좌인증 요청에 실패했습니다.",
      },
      { status: 502 },
    );
  }

  if (!isAccountOtpSuccess(res.ResultCode) || !res.TID) {
    return NextResponse.json(
      {
        message: accountOtpMessage({
          resultCode: res.ResultCode,
          resultMsg: res.ResultMsg,
        }),
      },
      { status: 400 },
    );
  }

  await prisma.supplierCompany.update({
    where: { id: companyId },
    data: {
      bankOtpRefId: res.TID,
      bankOtpRequestNo: res.Moid || moid,
      bankOtpRequestedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, live: true });
}
