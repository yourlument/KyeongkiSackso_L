import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerCertifications } from "@/lib/partner-certifications";
import { CertificationsView } from "./certifications-view";

export const dynamic = "force-dynamic";

export default async function PartnerCertificationsPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  const data = user?.supplierCompanyId
    ? await loadPartnerCertifications(user.supplierCompanyId)
    : { rows: [], stats: { approved: 0, reviewing: 0, total: 0 } };

  return <CertificationsView rows={data.rows} stats={data.stats} />;
}
