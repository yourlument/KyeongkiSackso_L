import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { PartnerSidebar } from "./partner-sidebar";
import { PartnerMain } from "./partner-main";

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { supplierCompany: { select: { name: true, region: true } } },
  });

  const companyName = user?.supplierCompany?.name ?? "디지털솔루션(주)";
  const location = user?.supplierCompany?.region ?? "경기도 성남시";

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F5F9" }}>
      <PartnerSidebar companyName={companyName} location={location} />
      <PartnerMain>{children}</PartnerMain>
    </div>
  );
}
