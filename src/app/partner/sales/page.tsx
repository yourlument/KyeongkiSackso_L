import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerSales } from "@/lib/partner-sales";
import { SalesView } from "./sales-view";

export const dynamic = "force-dynamic";

export default async function PartnerSalesPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  if (!user?.supplierCompanyId) redirect("/");
  const data = await loadPartnerSales(user.supplierCompanyId);

  return <SalesView data={data} />;
}
