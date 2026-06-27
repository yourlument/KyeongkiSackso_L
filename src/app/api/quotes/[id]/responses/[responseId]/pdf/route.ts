import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import { buildQuotePdf, type QuoteItemLine } from "@/lib/pdf/documents";

export const dynamic = "force-dynamic";

function ymd(d: Date | null | undefined): string {
  if (!d) return "-";
  const k = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 10).replace(/-/g, ". ");
}

function won(v: { toString(): string } | number | null | undefined): string {
  if (v == null) return "-";
  return `${Number(v).toLocaleString("ko-KR")}원`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { id, responseId } = await params;

  const response = await prisma.quoteResponse.findFirst({
    where: { id: responseId, quoteRequestId: id },
    include: {
      quoteRequest: {
        select: {
          title: true,
          officialId: true,
          contactOrgName: true,
          official: { select: { departmentName: true, organization: { select: { name: true } } } },
        },
      },
      supplierCompany: {
        select: { id: true, name: true, representativeName: true, businessRegistrationNo: true, phone: true },
      },
      items: {
        include: { quoteRequestItem: { select: { name: true, spec: true, quantity: true, unit: true } } },
      },
    },
  });

  if (!response) return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });

  const isOwner = claims.role === "OFFICIAL" && response.quoteRequest.officialId === claims.sub;
  let isSupplier = false;
  if (claims.role === "SUPPLIER") {
    const companyId = await getSupplierCompanyId();
    isSupplier = !!companyId && companyId === response.supplierCompanyId;
  }
  const isAdmin = claims.role === "ADMIN";
  if (!isOwner && !isSupplier && !isAdmin) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  let requestItems: { name: string; spec: string | null; quantity: number; unit: string | null }[] = [];
  if (response.items.length === 0) {
    requestItems = await prisma.quoteRequestItem.findMany({
      where: { quoteRequestId: id },
      orderBy: { id: "asc" },
      select: { name: true, spec: true, quantity: true, unit: true },
    });
  }

  let items: QuoteItemLine[];
  if (response.items.length > 0) {
    items = response.items.map((it, i) => ({
      no: i + 1,
      name: it.quoteRequestItem.name,
      spec: it.quoteRequestItem.spec ?? "-",
      quantity: `${it.quoteRequestItem.quantity}${it.quoteRequestItem.unit ?? ""}`,
      unitPrice: won(it.unitPrice),
      amount: won(it.amount),
    }));
  } else {
    items = requestItems.map((it, i) => ({
      no: i + 1,
      name: it.name,
      spec: it.spec ?? "-",
      quantity: `${it.quantity}${it.unit ?? ""}`,
      unitPrice: "-",
      amount: "-",
    }));
  }

  const orgName =
    response.quoteRequest.contactOrgName ??
    response.quoteRequest.official?.organization?.name ??
    "-";
  const dept = response.quoteRequest.official?.departmentName ?? "";
  const orgLabel = dept ? `${orgName} ${dept}` : orgName;

  const phone = response.supplierCompany.phone
    ? decrypt(response.supplierCompany.phone) ?? "-"
    : "-";

  const pdf = await buildQuotePdf({
    quoteNo: response.quoteNo ?? response.id,
    issuedAt: ymd(response.createdAt),
    requestTitle: response.quoteRequest.title,
    orgName: orgLabel,
    supplierName: response.supplierCompany.name,
    supplierRepresentative: decrypt(response.supplierCompany.representativeName) ?? "-",
    supplierBusinessNo: decrypt(response.supplierCompany.businessRegistrationNo) ?? "-",
    supplierPhone: phone,
    items,
    totalAmount: won(response.totalAmount),
    deliveryDate: ymd(response.deliveryDate),
    validUntil: ymd(response.validUntil),
    memo: response.specSummary ?? response.memo ?? "-",
  });

  const fileName = `견적서_${response.quoteNo ?? response.id}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Length": String(pdf.length),
    },
  });
}
