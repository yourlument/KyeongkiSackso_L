import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { buildQuoteSealPreviewSvg } from "@/lib/quote-seal-preview";

export const dynamic = "force-dynamic";

export async function GET() {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const company = await prisma.supplierCompany.findUnique({
    where: { id: companyId },
    select: { name: true, quoteSealCompanyName: true },
  });
  if (!company) return NextResponse.json({ message: "업체 정보를 찾을 수 없어요" }, { status: 404 });

  const companyName = company.name.trim() || company.quoteSealCompanyName?.trim() || "업체";
  return new NextResponse(buildQuoteSealPreviewSvg(companyName), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
    },
  });
}
