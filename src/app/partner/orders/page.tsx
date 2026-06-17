import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerOrders } from "@/lib/partner-orders";
import { OrdersListView } from "./orders-list-view";

export const dynamic = "force-dynamic";

export default async function PartnerOrdersPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  const data = user?.supplierCompanyId
    ? await loadPartnerOrders(user.supplierCompanyId)
    : { rows: [], stats: { total: 0, paid: 0, shipping: 0, delivered: 0 } };

  return <OrdersListView rows={data.rows} stats={data.stats} />;
}
