import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { getNiceAccountConfig } from "@/lib/nice-account/config";
import { confirmAccountOwnership } from "@/lib/nice-account/client";
import { accountOtpMessage, isAccountOtpSuccess } from "@/lib/nice-account/codes";
import {
  activatePendingSettlementAccount,
  SETTLEMENT_ACCOUNT_OTP_TTL_MS,
} from "@/lib/supplier-account-verification";

export const dynamic = "force-dynamic";

const input = z.object({ otp: z.string().trim().min(1) });

export async function POST(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }
  const otp = parsed.data.otp.replace(/\s/g, "");

  if (!getNiceAccountConfig().enabled) {
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
    }
    if (!(await activatePendingSettlementAccount(companyId))) {
      return NextResponse.json(
        { message: "인증 번호를 먼저 발송해 주세요" },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, live: false });
  }

  const company = await prisma.supplierCompany.findUnique({
    where: { id: companyId },
    select: {
      bankOtpRefId: true,
      bankOtpRequestNo: true,
      bankOtpRequestedAt: true,
      pendingBankAccountNo: true,
    },
  });
  if (
    !company?.bankOtpRefId ||
    !company.bankOtpRequestedAt ||
    !company.pendingBankAccountNo
  ) {
    return NextResponse.json(
      { message: "인증 번호를 먼저 발송해 주세요" },
      { status: 409 },
    );
  }
  if (Date.now() - company.bankOtpRequestedAt.getTime() > SETTLEMENT_ACCOUNT_OTP_TTL_MS) {
    return NextResponse.json(
      { message: "인증 유효 시간이 지났습니다. 다시 요청해 주세요" },
      { status: 409 },
    );
  }

  let res;
  try {
    res = await confirmAccountOwnership({
      tid: company.bankOtpRefId,
      certKey: otp,
      ...(company.bankOtpRequestNo
        ? { expectedMoid: company.bankOtpRequestNo }
        : {}),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "NICEPAY 계좌인증 확인에 실패했습니다.",
      },
      { status: 502 },
    );
  }

  if (!isAccountOtpSuccess(res.ResultCode)) {
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

  if (!(await activatePendingSettlementAccount(companyId))) {
    return NextResponse.json(
      { message: "인증 번호를 먼저 발송해 주세요" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, live: true });
}
