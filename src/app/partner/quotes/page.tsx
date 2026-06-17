import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerQuotes } from "@/lib/partner-quotes";
import { QuotesMonitorView } from "./quotes-monitor-view";

export const dynamic = "force-dynamic";

export default async function PartnerQuotesPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { supplierCompanyId: true },
  });
  const data = user?.supplierCompanyId
    ? await loadPartnerQuotes(user.supplierCompanyId)
    : { stats: { total: 0, waiting: 0, submitted: 0 }, productRequests: [], announcements: [], proposals: [] };

  return <QuotesMonitorView {...data} />;
}
