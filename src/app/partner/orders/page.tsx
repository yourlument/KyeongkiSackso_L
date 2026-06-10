import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { OrdersListView } from "./orders-list-view";

export default async function PartnerOrdersPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  return <OrdersListView />;
}
