import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import { nicepayBankCode } from "@/lib/nicepay/banks";
import { sha256 } from "@/lib/nicepay/crypto";
import {
  NicepayPayoutApiError,
  NicepayPayoutDisabledError,
  upsertNicepaySubmall,
} from "@/lib/nicepay/payout";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role !== "ADMIN") {
    return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
  }

  const { companyId } = await params;
  const company = await prisma.supplierCompany.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      businessRegistrationNo: true,
      approvalStatus: true,
      bankName: true,
      bankCode: true,
      bankAccountNo: true,
      bankAccountHolder: true,
      bankVerifiedAt: true,
      nicepaySubId: true,
      nicepaySubmallSyncedAt: true,
    },
  });
  if (!company) {
    return NextResponse.json(
      { message: "공급업체를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (company.approvalStatus !== "APPROVED") {
    return NextResponse.json(
      { message: "승인된 공급업체만 서브몰로 등록할 수 있습니다." },
      { status: 409 },
    );
  }

  const bankCd = nicepayBankCode(company.bankCode, company.bankName);
  const businessNo = (decrypt(company.businessRegistrationNo) ?? "").replace(/\D/g, "");
  const accountNo = company.bankAccountNo?.replace(/\D/g, "") ?? "";
  if (
    businessNo.length !== 10 ||
    !bankCd ||
    !accountNo ||
    !company.bankAccountHolder ||
    !company.bankVerifiedAt
  ) {
    return NextResponse.json(
      {
        message:
          "사업자번호와 검증된 정산 계좌(은행코드·계좌번호·예금주)가 필요합니다.",
      },
      { status: 409 },
    );
  }

  const subId =
    company.nicepaySubId ??
    `KOR${sha256(company.id).slice(0, 20).toUpperCase()}`;
  try {
    const result = await upsertNicepaySubmall({
      subId,
      subNm: company.name,
      subCoNo: businessNo,
      bankCd,
      accntNo: accountNo,
      accntNm: company.bankAccountHolder,
      memo: "KORLINK 공급업체",
      reqType: company.nicepaySubId ? "1" : "0",
    });
    await prisma.supplierCompany.update({
      where: { id: company.id },
      data: {
        bankCode: bankCd,
        nicepaySubId: result.subId,
        nicepaySubmallSyncedAt: new Date(),
        nicepaySubmallLastError: null,
      },
    });
    return NextResponse.json({
      ok: true,
      subId: result.subId,
      requestType: result.reqType,
    });
  } catch (error) {
    const message =
      error instanceof NicepayPayoutApiError ||
      error instanceof NicepayPayoutDisabledError
        ? error.message
        : "NICEPAY 서브몰 등록에 실패했습니다.";
    await prisma.supplierCompany.update({
      where: { id: company.id },
      data: { nicepaySubmallLastError: message.slice(0, 255) },
    });
    return NextResponse.json(
      { message },
      { status: error instanceof NicepayPayoutDisabledError ? 503 : 502 },
    );
  }
}
