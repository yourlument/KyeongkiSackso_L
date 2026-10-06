import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loadPartnerProfile } from "@/lib/partner-profile";
import { PartnerProfileView } from "./profile-view";

export const dynamic = "force-dynamic";

export default async function PartnerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; verify?: string }>;
}) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const { tab, verify } = await searchParams;
  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { supplierCompanyId: true } });
  const data = user?.supplierCompanyId
    ? await loadPartnerProfile(user.supplierCompanyId)
    : {
        intro: "", description: "", portfolioFileName: null,
        manager: { name: "", phone: "", email: "", position: "" },
        performances: [], equipments: [],
        seal: { companyName: "업체", customImageUrl: null },
        account: {
          verified: false,
          verificationStatus: "UNVERIFIED" as const,
          pending: null,
          canRevoke: false,
          bank: "",
          number: "",
          holder: "",
          summary: "",
          verifiedAt: "",
        },
      };

  return (
    <PartnerProfileView
      data={data}
      initialTab={tab === "account" ? "account" : "profile"}
      initialVerificationAction={verify === "pending" ? "pending" : verify === "start" ? "start" : null}
    />
  );
}
