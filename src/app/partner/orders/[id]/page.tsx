import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { OrdersListView } from "../orders-list-view";
import { OrderDetailModal } from "../order-detail-modal";

export default async function PartnerOrderDetailPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  return (
    <>
      <OrdersListView />
      <OrderDetailModal />
    </>
  );
}
