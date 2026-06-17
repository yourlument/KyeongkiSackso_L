import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";
import { decrypt } from "@/lib/crypto/pii";
import { hasPurchasedProduct } from "@/lib/reviews";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { ProductPurchasePanel } from "./purchase-panel";

type Spec = { label: string; value: string };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      supplierCompany: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      inventory: true,
    },
  });

  if (!product || product.status === "DRAFT" || product.status === "HIDDEN") {
    notFound();
  }

  const breadcrumb: string[] = [];
  let cat = product.category;
  while (cat) {
    breadcrumb.unshift(cat.name);
    if (!cat.parentId) break;
    cat = await prisma.category.findUnique({ where: { id: cat.parentId } });
  }

  const claims = await getSessionClaims();
  const unit = product.unit ?? "개";

  const hasPurchaseRecord = claims ? await hasPurchasedProduct(claims.sub, product.id) : false;

  const company = product.supplierCompany;
  const registeredCount = await prisma.product.count({
    where: { supplierCompanyId: company.id, status: "ACTIVE" },
  });
  const companyInfo = {
    name: company.name,
    category: product.category?.name ?? undefined,
    intro: company.intro ?? undefined,
    representativeName: decrypt(company.representativeName) ?? undefined,
    businessRegistrationNo: decrypt(company.businessRegistrationNo) ?? undefined,
    region: company.region ?? undefined,
    establishedYear: company.establishedYear ?? undefined,
    registeredCount,
    dealCount: company.dealCount ?? undefined,
    phone: decrypt(company.phone) ?? undefined,
    certifications: company.certifications,
    description: company.description ?? undefined,
    portfolioFileName: company.portfolioFileName ?? undefined,
  };

  const specs = (product.specs as Spec[] | null) ?? [];

  const thumbnail = product.images.find((i) => i.type === "THUMBNAIL") ?? product.images[0];
  const detailImages = product.images.filter((i) => i.type === "DETAIL").map((i) => i.url);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#f9fafb" }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1152px] flex-1 px-[32px] py-[24px]">
        <nav
          aria-label="카테고리 경로"
          className="mb-[16px] flex flex-wrap items-center gap-[8px]"
          style={{ fontSize: "12px", lineHeight: "21.6px" }}
        >
          <span style={{ color: "rgba(29,29,31,0.4)" }}>검색</span>
          {breadcrumb.map((name, i) => (
            <span key={i} className="flex items-center gap-[8px]">
              <BreadcrumbChevron />
              <span
                style={{
                  color: i === breadcrumb.length - 1 ? "#1D1D1F" : "rgba(29,29,31,0.6)",
                }}
              >
                {name}
              </span>
            </span>
          ))}
        </nav>

        <div className="mb-[24px] flex flex-col gap-[24px] lg:flex-row lg:flex-wrap lg:items-start">
          <div
            className="w-full lg:flex-[420_1_0%]"
            style={{
              borderRadius: "19.52px",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ background: "rgba(29,29,31,0.05)", borderRadius: "19.52px", height: "398px" }}
            >
              {thumbnail ? (
                <img
                  src={thumbnail.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>이미지 없음</span>
              )}
            </div>
          </div>

          <ProductPurchasePanel
            productId={product.id}
            npsCode={product.npsCode ?? undefined}
            name={product.name}
            price={Number(product.price)}
            unit={unit}
            supplierCompanyName={company.name}
            rating={product.rating ?? undefined}
            reviewCount={product.reviewCount ?? undefined}
            badges={product.badges}
            minOrderQty={product.minOrderQty ?? undefined}
            deliveryDays={product.deliveryDays ?? undefined}
            deliveryCondition={product.deliveryCondition ?? undefined}
            specs={specs}
            company={companyInfo}
            detailImages={detailImages}
            isLoggedIn={!!claims}
            isSupplier={claims?.role === "SUPPLIER"}
            hasPurchaseRecord={hasPurchaseRecord}
            supplierCompanyId={company.id}
          />
        </div>
      </main>

      <SiteFooter />
      <KakaoChat />
    </div>
  );
}

function BreadcrumbChevron() {
  return (
    <svg width={6} height={10} viewBox="0 0 6 10" fill="none" aria-hidden>
      <path
        d="M1 1l4 4-4 4"
        stroke="#9ca3af"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
