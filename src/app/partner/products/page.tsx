import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ProductsView, type ProductListItem } from "./products-view";
import { certificationMarksFromNames } from "@/lib/certification-marks";
import { getSettlementAccountVerificationStatus } from "@/lib/supplier-account-verification";

export const dynamic = "force-dynamic";

export default async function PartnerProductsPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      supplierCompanyId: true,
      supplierCompany: {
        select: {
          bankVerifiedAt: true,
          bankOtpRequestedAt: true,
          pendingBankName: true,
          pendingBankCode: true,
          pendingBankAccountNo: true,
          pendingBankAccountHolder: true,
        },
      },
    },
  });
  const companyId = user?.supplierCompanyId ?? null;
  const accountVerificationStatus = getSettlementAccountVerificationStatus(
    user?.supplierCompany ?? {
      bankVerifiedAt: null,
      bankOtpRequestedAt: null,
      pendingBankName: null,
      pendingBankCode: null,
      pendingBankAccountNo: null,
      pendingBankAccountHolder: null,
    },
  );
  const canTrade = accountVerificationStatus === "VERIFIED";

  const approvedCerts = companyId
    ? await prisma.supplierCertification.findMany({
        where: { supplierCompanyId: companyId, status: "APPROVED" },
        orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
        select: { name: true },
      })
    : [];
  const availableMarks = certificationMarksFromNames(approvedCerts.map((c) => c.name));

  const products = companyId
    ? await prisma.product.findMany({
        where: { supplierCompanyId: companyId },
        orderBy: { createdAt: "asc" },
        include: {
          category: { select: { name: true, itemType: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      })
    : [];

  const rows: ProductListItem[] = products.map((p) => ({
    id: p.id,
    code: p.npsCode ?? "-",
    name: p.name,
    category: p.category?.name ?? "-",
    type: p.category?.itemType === "SERVICE" ? "용역" : "물품",
    price: `${Number(p.price).toLocaleString("ko-KR")}원`,
    minQty: p.minOrderQty != null ? `${p.minOrderQty}${p.unit ?? "개"}` : "-",
    rating: p.rating != null ? String(p.rating) : "-",
    reviews: p.reviewCount != null ? `(${p.reviewCount}건)` : "",
    image: p.images[0]?.url ?? "",
  }));

  return (
    <ProductsView
      initial={rows}
      availableMarks={availableMarks}
      canTrade={canTrade}
      accountVerificationStatus={accountVerificationStatus}
    />
  );
}
