import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerProfile } from "@/lib/partner-profile";
import { PartnerProfileView } from "./profile-view";

export const dynamic = "force-dynamic";

export default async function PartnerProfilePage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  const data = user?.supplierCompanyId
    ? await loadPartnerProfile(user.supplierCompanyId)
    : {
        intro: "", description: "",
        manager: { name: "", phone: "", email: "", position: "" },
        performances: [], equipments: [],
        account: { verified: false, bank: "", number: "", holder: "", summary: "", verifiedAt: "" },
      };

  return <PartnerProfileView data={data} />;
}
