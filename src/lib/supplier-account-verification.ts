import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export const SETTLEMENT_ACCOUNT_OTP_TTL_MS = 10 * 60 * 1000;

export type SettlementAccountVerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "ERROR"
  | "UNVERIFIED";

export type SettlementAccountVerificationActionStatus = Exclude<
  SettlementAccountVerificationStatus,
  "VERIFIED"
>;

export function settlementAccountVerificationHref(
  status: SettlementAccountVerificationActionStatus,
): string {
  const verify = status === "PENDING" ? "pending" : "start";
  return `/partner/profile?tab=account&verify=${verify}`;
}

type SettlementAccountVerificationInput = {
  bankVerifiedAt: Date | string | null | undefined;
  bankOtpRequestedAt: Date | string | null | undefined;
  pendingBankName: string | null | undefined;
  pendingBankCode: string | null | undefined;
  pendingBankAccountNo: string | null | undefined;
  pendingBankAccountHolder: string | null | undefined;
};

   
                                                                           
                                                                            
                                                 
   
export function getSettlementAccountVerificationStatus(
  account: SettlementAccountVerificationInput,
  now = Date.now(),
): SettlementAccountVerificationStatus {
  if (account.bankVerifiedAt != null) return "VERIFIED";

  const requestedAt = account.bankOtpRequestedAt
    ? new Date(account.bankOtpRequestedAt).getTime()
    : Number.NaN;
  const hasPendingAccount = Boolean(
    account.pendingBankName &&
      account.pendingBankCode &&
      account.pendingBankAccountNo &&
      account.pendingBankAccountHolder,
  );
  if (hasPendingAccount && Number.isFinite(requestedAt)) {
    return now - requestedAt <= SETTLEMENT_ACCOUNT_OTP_TTL_MS
      ? "PENDING"
      : "ERROR";
  }
  return "UNVERIFIED";
}

type AccountActivityClient = Pick<
  PrismaClient,
  "product" | "quoteResponse" | "order" | "settlement" | "refundRequest"
>;

export type SettlementAccountActivity = {
  products: number;
  quoteResponses: number;
  orders: number;
  settlements: number;
  refunds: number;
};

export function canRevokeSettlementAccount(
  activity: SettlementAccountActivity,
): boolean {
  return Object.values(activity).every((count) => count === 0);
}

export async function getSettlementAccountActivity(
  supplierCompanyId: string,
  db: AccountActivityClient = prisma,
): Promise<SettlementAccountActivity> {
  const supplierOrder = {
    items: { some: { supplierCompanyId } },
  } as const;
  const [products, quoteResponses, orders, settlements, refunds] =
    await Promise.all([
      db.product.count({ where: { supplierCompanyId } }),
      db.quoteResponse.count({
        where: {
          supplierCompanyId,
          OR: [
            {
              status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
              quoteRequest: { status: { in: ["OPEN", "REVIEWING"] } },
            },
            { status: "AWARDED", order: null },
          ],
        },
      }),
      db.order.count({
        where: {
          ...supplierOrder,
          status: {
            in: ["PENDING", "PAID", "CONTRACTED", "SHIPPING", "DELIVERED"],
          },
        },
      }),
      db.settlement.count({
        where: { supplierCompanyId, status: "PENDING" },
      }),
      db.refundRequest.count({
        where: {
          status: "PENDING",
          order: supplierOrder,
        },
      }),
    ]);

  return { products, quoteResponses, orders, settlements, refunds };
}

export async function supplierCanRevokeSettlementAccount(
  supplierCompanyId: string,
): Promise<boolean> {
  return canRevokeSettlementAccount(
    await getSettlementAccountActivity(supplierCompanyId),
  );
}

export type RevokeSettlementAccountResult =
  | { ok: true }
  | { ok: false; reason: "BUSY"; activity: SettlementAccountActivity };

export async function revokeSettlementAccountVerification(
  supplierCompanyId: string,
): Promise<RevokeSettlementAccountResult> {
  return prisma.$transaction(
    async (tx) => {
      const activity = await getSettlementAccountActivity(
        supplierCompanyId,
        tx,
      );
      if (!canRevokeSettlementAccount(activity)) {
        return { ok: false as const, reason: "BUSY" as const, activity };
      }

      await tx.supplierCompany.update({
        where: { id: supplierCompanyId },
        data: {
          bankVerifiedAt: null,
          bankOtpRefId: null,
          bankOtpRequestNo: null,
          bankOtpRequestedAt: null,
          pendingBankName: null,
          pendingBankAccountNo: null,
          pendingBankAccountHolder: null,
          pendingBankbookFileUrl: null,
          pendingBankCode: null,
          nicepaySubmallSyncedAt: null,
          nicepaySubmallLastError: null,
        },
      });

      return { ok: true as const };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function activatePendingSettlementAccount(
  supplierCompanyId: string,
  verifiedAt = new Date(),
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const company = await tx.supplierCompany.findUnique({
      where: { id: supplierCompanyId },
      select: {
        pendingBankName: true,
        pendingBankCode: true,
        pendingBankAccountNo: true,
        pendingBankAccountHolder: true,
        pendingBankbookFileUrl: true,
        bankOtpRequestedAt: true,
      },
    });
    if (
      !company?.pendingBankName ||
      !company.pendingBankCode ||
      !company.pendingBankAccountNo ||
      !company.pendingBankAccountHolder ||
      !company.bankOtpRequestedAt ||
      Date.now() - company.bankOtpRequestedAt.getTime() >
        SETTLEMENT_ACCOUNT_OTP_TTL_MS
    ) {
      return false;
    }

    await tx.supplierCompany.update({
      where: { id: supplierCompanyId },
      data: {
        bankName: company.pendingBankName,
        bankCode: company.pendingBankCode,
        bankAccountNo: company.pendingBankAccountNo,
        bankAccountHolder: company.pendingBankAccountHolder,
        bankbookFileUrl: company.pendingBankbookFileUrl,
        bankVerifiedAt: verifiedAt,
        bankOtpRefId: null,
        bankOtpRequestNo: null,
        bankOtpRequestedAt: null,
        pendingBankName: null,
        pendingBankAccountNo: null,
        pendingBankAccountHolder: null,
        pendingBankbookFileUrl: null,
        pendingBankCode: null,
        nicepaySubmallSyncedAt: null,
        nicepaySubmallLastError: null,
      },
    });
    return true;
  });
}
