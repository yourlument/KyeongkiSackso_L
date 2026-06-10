import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { ProductsView } from "./products-view";

export default async function PartnerProductsPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  return <ProductsView />;
}
