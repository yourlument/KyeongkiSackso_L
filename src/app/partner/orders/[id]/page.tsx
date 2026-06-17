import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerOrders, loadPartnerOrderDetail } from "@/lib/partner-orders";
import { OrdersListView } from "../orders-list-view";
import { OrderDetailModal } from "../order-detail-modal";

export const dynamic = "force-dynamic";

export default async function PartnerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  const companyId = user?.supplierCompanyId ?? null;

  const data = companyId
    ? await loadPartnerOrders(companyId)
    : { rows: [], stats: { total: 0, paid: 0, shipping: 0, delivered: 0 } };
  const detail = companyId ? await loadPartnerOrderDetail(companyId, id) : null;
  if (!detail) redirect("/partner/orders");

  return (
    <>
      <OrdersListView rows={data.rows} stats={data.stats} />
      <OrderDetailModal order={detail} />
    </>
  );
}
