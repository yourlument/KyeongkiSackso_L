import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role === "SUPPLIER") {
    return NextResponse.json(
      { message: "공급업체 계정은 구매 및 견적 요청 기능을 이용할 수 없습니다" },
      { status: 403 },
    );
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNo: id },
    select: { id: true, buyerId: true, taxInvoiceStatus: true },
  });

  if (!order || order.buyerId !== claims.sub) {
    return NextResponse.json({ message: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  if (order.taxInvoiceStatus !== "NONE") {
    return NextResponse.json({ message: "이미 세금계산서 발행이 요청되었습니다" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { taxInvoiceStatus: "REQUESTED" },
  });

  return NextResponse.json({ ok: true });
}
