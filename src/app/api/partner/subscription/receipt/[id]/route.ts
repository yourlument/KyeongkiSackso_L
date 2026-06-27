import { NextResponse } from "next/server";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { prisma } from "@/lib/db";
import { buildSubscriptionReceiptPdf } from "@/lib/pdf/documents";

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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const { id } = await params;
  const payment = await prisma.subscriptionPayment.findUnique({
    where: { id },
    include: {
      subscription: {
        select: { supplierCompanyId: true, planName: true, payMethod: true, supplierCompany: { select: { name: true } } },
      },
    },
  });
  if (!payment || payment.subscription.supplierCompanyId !== companyId) {
    return NextResponse.json({ message: "영수증을 찾을 수 없어요" }, { status: 404 });
  }

  const paid = payment.paidAt;
  const end = paid ? new Date(paid.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const pdf = await buildSubscriptionReceiptPdf({
    receiptNo: payment.id,
    issuedAt: ymd(new Date()),
    supplierName: payment.subscription.supplierCompany.name,
    planName: payment.subscription.planName,
    payMethod: payment.subscription.payMethod ?? "-",
    paidAt: ymd(paid),
    billingPeriod: paid && end ? `${ymd(paid)} ~ ${ymd(end)}` : "-",
    amount: won(payment.amount),
  });

  const fileName = `이용권영수증_${payment.billingMonth ?? payment.id}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Content-Length": String(pdf.length),
    },
  });
}
