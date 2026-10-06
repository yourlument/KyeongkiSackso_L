import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  registerNicepayBillkey,
  removeNicepayBillkey,
  verifyNicepayBillkeyAuthResponse,
  type NicepayBillkeyAuthResponse,
} from "@/lib/nicepay/billing";
import { getNicepayBillingConfig, getPublicAppUrl } from "@/lib/nicepay/config";
import { activateRegisteredBillkey } from "@/lib/subscription-billing";

export const dynamic = "force-dynamic";

function field(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function redirectResult(
  req: Request,
  status: "success" | "failed",
): NextResponse {
  const url = new URL("/partner/subscription", `${getPublicAppUrl(req.url)}/`);
  url.searchParams.set("billing", status);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const auth: NicepayBillkeyAuthResponse = {
    AuthResultCode: field(form, "AuthResultCode"),
    AuthResultMsg: field(form, "AuthResultMsg"),
    AuthToken: field(form, "AuthToken"),
    Signature: field(form, "Signature"),
    PayMethod: field(form, "PayMethod"),
    MID: field(form, "MID"),
    Moid: field(form, "Moid"),
    Amt: field(form, "Amt"),
    TxTid: field(form, "TxTid"),
    ReqReserved: field(form, "ReqReserved"),
    BillAuthYN: field(form, "BillAuthYN"),
  };
  const registration = auth.Moid
    ? await prisma.subscriptionBillingRegistration.findUnique({
        where: { id: auth.Moid },
      })
    : null;
  if (!registration) return redirectResult(req, "failed");
  if (registration.status === "COMPLETED")
    return redirectResult(req, "success");
  const config = getNicepayBillingConfig();
  if (
    registration.status !== "READY" ||
    registration.expiresAt <= new Date() ||
    !verifyNicepayBillkeyAuthResponse(auth) ||
    auth.MID !== config.mid ||
    auth.Moid !== registration.id ||
    auth.ReqReserved !== registration.id ||
    Number(auth.Amt) !== Number(registration.amount)
  ) {
    await prisma.subscriptionBillingRegistration.updateMany({
      where: { id: registration.id, status: "READY" },
      data: {
        status: "FAILED",
        resultCode: auth.AuthResultCode || "INVALID_AUTH",
        resultMessage: auth.AuthResultMsg || "빌키 인증 응답 검증 실패",
      },
    });
    return redirectResult(req, "failed");
  }
  const claimed = await prisma.subscriptionBillingRegistration.updateMany({
    where: { id: registration.id, status: "READY" },
    data: { status: "PROCESSING" },
  });
  if (claimed.count !== 1) return redirectResult(req, "failed");

  let bid = "";
  try {
    const result = await registerNicepayBillkey(auth);
    bid = result.BID;
    await activateRegisteredBillkey({
      registrationId: registration.id,
      bid,
      billkeyTid: result.TID,
      billkeyResult: result,
    });
    return redirectResult(req, "success");
  } catch (error) {
    const persisted = await prisma.subscription.findFirst({
      where: { billingKeyIssuedTid: auth.TxTid },
      select: { id: true },
    });
    if (bid && !persisted) {
      try {
        await removeNicepayBillkey({
          bid,
          merchantOrderId: `SUBKEY-ROLLBACK-${registration.id}`.slice(0, 64),
          amount: Number(registration.amount),
        });
      } catch {}
    }
    await prisma.subscriptionBillingRegistration.updateMany({
      where: { id: registration.id, status: "PROCESSING" },
      data: {
        status: "FAILED",
        resultCode: "BILLING_ERROR",
        resultMessage:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "빌링 처리 실패",
      },
    });
    return redirectResult(req, "failed");
  }
}
