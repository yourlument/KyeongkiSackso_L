import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { decrypt } from "@/lib/crypto/pii";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import {
  buildPurchaseConfirmPdf,
  buildSalesSlipPdf,
  buildTaxInvoicePdf,
  type ConfirmItemLine,
} from "@/lib/pdf/documents";

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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type") ?? "purchase";
  if (type !== "purchase" && type !== "sales" && type !== "tax") {
    return NextResponse.json({ error: "유효하지 않은 문서 유형입니다" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNo: id }] },
    include: {
      buyer: {
        select: {
          organization: {
            select: { name: true, businessRegistrationNo: true, representativeName: true, taxEmail: true, address: true },
          },
        },
      },
      items: {
        include: {
          product: { select: { unit: true, supplierCompanyId: true } },
          supplierCompany: { select: { name: true, businessRegistrationNo: true, representativeName: true } },
        },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });

  let allowed = claims.role === "ADMIN" || order.buyerId === claims.sub;
  if (!allowed && claims.role === "SUPPLIER") {
    const companyId = await getSupplierCompanyId();
    allowed = !!companyId && order.items.some((it) => it.supplierCompanyId === companyId || it.product?.supplierCompanyId === companyId);
  }
  if (!allowed) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const items: ConfirmItemLine[] = order.items.map((it, i) => ({
    no: i + 1,
    name: it.name,
    spec: it.spec ?? "-",
    quantity: `${it.quantity}${it.product?.unit ?? ""}`,
    unitPrice: won(it.unitPrice),
    amount: won(it.amount),
  }));

  const supplier = order.items.find((it) => it.supplierCompany)?.supplierCompany ?? null;
  const supplierName = supplier?.name ?? "-";
  const pay = order.payments[0];
  const payMethod = pay?.method ?? "-";
  const paidAt = ymd(pay?.paidAt ?? order.createdAt);
  const issuedAt = ymd(new Date());

  let pdf: Buffer;
  let fileName: string;

  if (type === "purchase") {
    pdf = await buildPurchaseConfirmPdf({
      orderNo: order.orderNo,
      issuedAt,
      buyerOrgName: order.recipientOrgName ?? "-",
      buyerName: order.recipientName ?? "-",
      buyerDepartment: order.recipientDepartment ?? "-",
      supplierName,
      payMethod,
      paidAt,
      items,
      totalAmount: won(order.totalAmount),
      deliveryPlace:
        [order.deliveryAddress, order.deliveryAddressDetail].filter(Boolean).join(" ") ||
        order.deliveryPlace ||
        "-",
      deliveryDeadline: ymd(order.deliveryDeadline),
    });
    fileName = `구매확인서_${order.orderNo}.pdf`;
  } else if (type === "sales") {
    const total = new Prisma.Decimal(order.totalAmount);
    const supply = total.div(new Prisma.Decimal(1.1)).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
    const vat = total.sub(supply);
    pdf = await buildSalesSlipPdf({
      orderNo: order.orderNo,
      issuedAt,
      supplierName,
      supplierBusinessNo: decrypt(supplier?.businessRegistrationNo) ?? "-",
      buyerOrgName: order.recipientOrgName ?? "-",
      buyerName: order.recipientName ?? "-",
      items,
      supplyAmount: won(supply),
      vatAmount: won(vat),
      totalAmount: won(total),
      payMethod,
      paidAt,
    });
    fileName = `매출전표_${order.orderNo}.pdf`;
  } else {
    if (order.taxInvoiceStatus !== "ISSUED") {
      return NextResponse.json({ error: "세금계산서가 아직 발행되지 않았습니다" }, { status: 409 });
    }
    const org = order.buyer?.organization ?? null;
    const total = new Prisma.Decimal(order.totalAmount);
    const supply = total.div(new Prisma.Decimal(1.1)).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP);
    const vat = total.sub(supply);
    const summary = items.map((it) => it.name).join(", ") || "-";
    pdf = await buildTaxInvoicePdf({
      invoiceNo: order.orderNo,
      issuedAt,
      supplierName,
      supplierBusinessNo: decrypt(supplier?.businessRegistrationNo) ?? "-",
      supplierRepresentative: decrypt(supplier?.representativeName) ?? "-",
      buyerOrgName: order.recipientOrgName ?? org?.name ?? "-",
      buyerBusinessNo: decrypt(org?.businessRegistrationNo) ?? "-",
      buyerRepresentative: decrypt(org?.representativeName) ?? "-",
      buyerAddress: decrypt(org?.address) ?? "-",
      buyerEmail: decrypt(org?.taxEmail) ?? "-",
      items,
      supplyAmount: won(supply),
      vatAmount: won(vat),
      totalAmount: won(total),
      remark: summary,
    });
    fileName = `세금계산서_${order.orderNo}.pdf`;
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Length": String(pdf.length),
    },
  });
}
