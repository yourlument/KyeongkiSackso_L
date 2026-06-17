import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerDashboardOverview, loadPartnerStats } from "@/lib/partner-dashboard";
import { PartnerDashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function PartnerDashboardPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  const cid = user?.supplierCompanyId ?? null;
  const overview = cid
    ? await loadPartnerDashboardOverview(cid)
    : { stats: { products: 0, inProgress: 0, thisMonthRevenue: "0", completed: 0 }, recentOrders: [], openQuotes: [] };
  const stats = cid
    ? await loadPartnerStats(cid)
    : { kpis: [], revenueBars: [], quoteBars: [], categoryShare: [], monthlyOrders: [] };

  return <PartnerDashboardView overview={overview} stats={stats} />;
}
