import { NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import {
  NicepayPayoutApiError,
  NicepayPayoutDisabledError,
  getNicepayPayoutBalance,
} from "@/lib/nicepay/payout";

export const dynamic = "force-dynamic";

export async function GET() {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }
  if (claims.role !== "ADMIN") {
    return NextResponse.json({ message: "권한이 없습니다" }, { status: 403 });
  }

  try {
    const balance = await getNicepayPayoutBalance();
    return NextResponse.json(balance);
  } catch (error) {
    const status = error instanceof NicepayPayoutDisabledError ? 503 : 502;
    const message =
      error instanceof NicepayPayoutApiError ||
      error instanceof NicepayPayoutDisabledError
        ? error.message
        : "NICEPAY 잔액 조회에 실패했습니다.";
    return NextResponse.json({ message }, { status });
  }
}
