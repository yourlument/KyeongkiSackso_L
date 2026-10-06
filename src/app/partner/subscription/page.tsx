import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerSubscription } from "@/lib/partner-subscription";
import { SubscriptionView } from "./subscription-view";

export const dynamic = "force-dynamic";

export default async function PartnerSubscriptionPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { supplierCompanyId: true },
  });
  if (!user?.supplierCompanyId) redirect("/partner");
  const data = await loadPartnerSubscription(user.supplierCompanyId);
  return <SubscriptionView data={data} />;
}
