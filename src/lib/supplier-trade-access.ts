import { prisma } from "@/lib/db";

export const SUPPLIER_ACCOUNT_VERIFICATION_MESSAGE =
  "계좌 인증 완료 후 상품 등록 및 견적 대응이 가능합니다.";

export function hasVerifiedSettlementAccount(
  bankVerifiedAt: Date | string | null | undefined,
): boolean {
  return bankVerifiedAt != null;
}

export async function supplierCanTrade(supplierCompanyId: string): Promise<boolean> {
  const company = await prisma.supplierCompany.findUnique({
    where: { id: supplierCompanyId },
    select: { bankVerifiedAt: true },
  });
  return hasVerifiedSettlementAccount(company?.bankVerifiedAt);
}
