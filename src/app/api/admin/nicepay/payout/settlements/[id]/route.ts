import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  NicepayPayoutApiError,
  NicepayPayoutDisabledError,
  getNicepayPayoutResult,
} from "@/lib/nicepay/payout";
import {
  SettlementPayoutStateError,
  cancelSettlementPayout,
  payoutSettlementDate,
  submitSettlementPayout,
} from "@/lib/nicepay/payout-service";

export const dynamic = "force-dynamic";

async function authorizeAdmin(): Promise<NextResponse | null> {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role !== "ADMIN") {
    return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
  }
  return null;
}

function payoutError(error: unknown): NextResponse {
  if (error instanceof SettlementPayoutStateError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }
  const message =
    error instanceof NicepayPayoutApiError ||
    error instanceof NicepayPayoutDisabledError
      ? error.message
      : "NICEPAY 지급대행 처리에 실패했습니다.";
  return NextResponse.json(
    { message },
    { status: error instanceof NicepayPayoutDisabledError ? 503 : 502 },
  );
}

async function loadSettlement(id: string) {
  return prisma.settlement.findUnique({
    where: { id },
    include: {
      supplierCompany: {
        select: {
          nicepaySubId: true,
          nicepaySubmallSyncedAt: true,
        },
      },
    },
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await authorizeAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    return NextResponse.json({ ok: true, ...(await submitSettlementPayout(id)) });
  } catch (error) {
    return payoutError(error);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await authorizeAdmin();
  if (denied) return denied;
  const { id } = await params;
  const settlement = await loadSettlement(id);
  if (!settlement) {
    return NextResponse.json(
      { message: "정산 내역을 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  const subId = settlement.supplierCompany.nicepaySubId;
  if (!subId || !settlement.nicepayPayoutSeq) {
    return NextResponse.json(
      { message: "지급 요청 이력이 없습니다." },
      { status: 409 },
    );
  }

  try {
    const result = await getNicepayPayoutResult({
      settlmntDt: payoutSettlementDate(settlement.scheduledPayoutDate),
      subId,
    });
    const detail = result.detail.find(
      (row) => String(row.seq) === settlement.nicepayPayoutSeq,
    );
    if (!detail) {
      return NextResponse.json(
        { message: "NICEPAY 지급 결과에서 요청 건을 찾지 못했습니다." },
        { status: 404 },
      );
    }
    await prisma.settlement.update({
      where: { id: settlement.id },
      data: {
        nicepayPayoutStatus: detail.statusNm,
        nicepayPayoutError: detail.errReason || null,
        ...(detail.statusNm === "성공"
          ? { status: "PAID", paidAt: new Date() }
          : detail.statusNm === "삭제"
            ? { status: "CANCELLED" }
            : {}),
      },
    });
    return NextResponse.json({
      status: detail.statusNm,
      error: detail.errReason || null,
      amount: detail.settlmntAmt,
      seq: String(detail.seq),
    });
  } catch (error) {
    return payoutError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await authorizeAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    const result = await cancelSettlementPayout(id);
    return NextResponse.json({ ok: true, seq: result.seq, status: "삭제" });
  } catch (error) {
    return payoutError(error);
  }
}
