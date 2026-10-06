import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { revokeSettlementAccountVerification } from "@/lib/supplier-account-verification";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const companyId = await getSupplierCompanyId();
  if (!companyId) {
    return NextResponse.json(
      { message: "로그인이 필요해요" },
      { status: 401 },
    );
  }

  try {
    const result = await revokeSettlementAccountVerification(companyId);
    if (!result.ok) {
      return NextResponse.json(
        { code: "ACCOUNT_VERIFICATION_IN_USE" },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { code: "ACCOUNT_VERIFICATION_IN_USE" },
        { status: 409 },
      );
    }
    throw error;
  }
}
