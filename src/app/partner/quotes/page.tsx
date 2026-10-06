import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerQuotes } from "@/lib/partner-quotes";
import { QuotesMonitorView } from "./quotes-monitor-view";
import { getSettlementAccountVerificationStatus } from "@/lib/supplier-account-verification";

export const dynamic = "force-dynamic";

export default async function PartnerQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sub?: string; request?: string }>;
}) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const { tab, sub, request } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      supplierCompanyId: true,
      supplierCompany: {
        select: {
          bankVerifiedAt: true,
          bankOtpRequestedAt: true,
          pendingBankName: true,
          pendingBankCode: true,
          pendingBankAccountNo: true,
          pendingBankAccountHolder: true,
        },
      },
    },
  });
  const data = user?.supplierCompanyId
    ? await loadPartnerQuotes(user.supplierCompanyId)
    : { stats: { total: 0, waiting: 0, submitted: 0 }, productRequests: [], announcements: [], proposals: [] };
  const accountVerificationStatus = getSettlementAccountVerificationStatus(
    user?.supplierCompany ?? {
      bankVerifiedAt: null,
      bankOtpRequestedAt: null,
      pendingBankName: null,
      pendingBankCode: null,
      pendingBankAccountNo: null,
      pendingBankAccountHolder: null,
    },
  );

  return (
    <QuotesMonitorView
      {...data}
      canTrade={accountVerificationStatus === "VERIFIED"}
      accountVerificationStatus={accountVerificationStatus}
      initialMainTab={tab ?? null}
      initialSubTab={sub ?? null}
      initialRequestId={request ?? null}
    />
  );
}
