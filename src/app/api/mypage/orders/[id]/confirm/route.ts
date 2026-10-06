import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";
import { submitSettlementPayout } from "@/lib/nicepay/payout-service";
import { createPurchaseConfirmationSettlements } from "@/lib/settlements";

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
    select: {
      id: true,
      buyerId: true,
      status: true,
      items: {
        select: {
          supplierCompanyId: true,
          amount: true,
        },
      },
    },
  });

  if (!order || order.buyerId !== claims.sub) {
    return NextResponse.json({ message: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  if (order.status !== "DELIVERED") {
    return NextResponse.json({ message: "구매 확정이 가능한 상태가 아닙니다" }, { status: 400 });
  }

  const completedAt = new Date();
  const settlementIds = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, status: "DELIVERED" },
      data: { status: "COMPLETED" },
    });
    if (updated.count !== 1) {
      throw new Error("구매 확정이 가능한 상태가 아닙니다");
    }
    return createPurchaseConfirmationSettlements(tx, {
      orderId: order.id,
      completedAt,
      items: order.items,
    });
  });

  const payouts = await Promise.all(
    settlementIds.map(async (settlementId) => {
      try {
        const result = await submitSettlementPayout(settlementId, {
          dupChkYn: "N",
        });
        return { settlementId, requested: true, seq: result.seq };
      } catch (error) {
        return {
          settlementId,
          requested: false,
          message:
            error instanceof Error
              ? error.message
              : "NICEPAY 지급 요청 실패",
        };
      }
    }),
  );

  return NextResponse.json({ ok: true, settlements: payouts });
}
