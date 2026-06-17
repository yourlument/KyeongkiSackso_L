import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ProductsView, type ProductListItem } from "./products-view";
import { CERT_MARKS } from "./products-data";

export const dynamic = "force-dynamic";

export default async function PartnerProductsPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  if (claims.role !== "SUPPLIER") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { supplierCompanyId: true },
  });
  const companyId = user?.supplierCompanyId ?? null;

  const approvedCerts = companyId
    ? await prisma.supplierCertification.findMany({
        where: { supplierCompanyId: companyId, status: "APPROVED" },
        select: { name: true },
      })
    : [];
  const availableMarks = CERT_MARKS.filter((m) => approvedCerts.some((c) => c.name.includes(m)));

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

  return <ProductsView initial={rows} availableMarks={availableMarks} />;
}
