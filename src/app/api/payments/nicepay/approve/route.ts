import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getNicepayPaymentConfig,
  getPublicAppUrl,
} from "@/lib/nicepay/config";
import {
  approveNicepayPayment,
  isNicepayApprovalSuccess,
  networkCancelNicepayPayment,
  nicepayResultMetadata,
  verifyNicepayAuthResponse,
  type NicepayAuthResponse,
  type NicepayMethod,
} from "@/lib/nicepay/payment";
import { finalizeNicepayPayment } from "@/lib/nicepay/payment-service";

export const dynamic = "force-dynamic";

function formString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function resultRedirect(
  req: Request,
  paymentId: string,
  status: "paid" | "virtual-issued" | "failed",
): NextResponse {
  const url = new URL(
    "/checkout/result",
    `${getPublicAppUrl(req.url)}/`,
  );
  url.searchParams.set("payment", paymentId);
  url.searchParams.set("status", status);
  return NextResponse.redirect(url, 303);
}

function mergeMetadata(
  current: Prisma.JsonValue | null,
  next: Record<string, string>,
): Prisma.InputJsonObject {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? (current as Prisma.JsonObject)
      : {};
  return { ...base, ...next };
}

function paymentMethodFromLabel(method: string | null): NicepayMethod {
  if (method === "계좌이체") return "BANK";
  if (method === "가상계좌") return "VBANK";
  return "CARD";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const auth: NicepayAuthResponse = {
    AuthResultCode: formString(form, "AuthResultCode"),
    AuthResultMsg: formString(form, "AuthResultMsg"),
    AuthToken: formString(form, "AuthToken"),
    Signature: formString(form, "Signature"),
    PayMethod: formString(form, "PayMethod"),
    MID: formString(form, "MID"),
    Moid: formString(form, "Moid"),
    Amt: formString(form, "Amt"),
    TxTid: formString(form, "TxTid"),
    NextAppURL: formString(form, "NextAppURL"),
    NetCancelURL: formString(form, "NetCancelURL"),
  };

  const payment = auth.Moid
    ? await prisma.payment.findUnique({
        where: { id: auth.Moid },
        include: { order: { select: { orderNo: true } } },
      })
    : null;
  if (!payment || payment.provider !== "NICEPAY") {
    return NextResponse.json(
      { message: "결제 정보를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (payment.status === "PAID") {
    return resultRedirect(req, payment.id, "paid");
  }

  const config = getNicepayPaymentConfig();
  const expectedAmount = Number(payment.amount);
  if (
    payment.status !== "READY" ||
    auth.AuthResultCode !== "0000" ||
    !verifyNicepayAuthResponse(auth) ||
    auth.MID !== config.mid ||
    auth.PayMethod !== paymentMethodFromLabel(payment.method) ||
    !Number.isSafeInteger(expectedAmount) ||
    Number(auth.Amt) !== expectedAmount ||
    auth.Moid !== payment.id
  ) {
    return resultRedirect(req, payment.id, "failed");
  }

  let approvalStarted = false;
  try {
    approvalStarted = true;
    const result = await approveNicepayPayment(auth);
    const expectedMethod = paymentMethodFromLabel(payment.method);
    if (!isNicepayApprovalSuccess(result, expectedMethod)) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: "READY" },
        data: {
          status: "FAILED",
          metadata: mergeMetadata(
            payment.metadata,
            nicepayResultMetadata(result),
          ),
        },
      });
      return resultRedirect(req, payment.id, "failed");
    }

    const transactionId = String(result.TID ?? "");
    if (auth.PayMethod === "VBANK") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transactionId,
          metadata: mergeMetadata(
            payment.metadata,
            nicepayResultMetadata(result),
          ),
        },
      });
      return resultRedirect(req, payment.id, "virtual-issued");
    }

    await finalizeNicepayPayment({
      paymentId: payment.id,
      transactionId,
      metadata: nicepayResultMetadata(result),
    });
    return resultRedirect(req, payment.id, "paid");
  } catch {
    const current = await prisma.payment.findUnique({
      where: { id: payment.id },
      select: { status: true },
    });
    if (current?.status === "PAID") {
      return resultRedirect(req, payment.id, "paid");
    }
    if (approvalStarted) {
      try {
        await networkCancelNicepayPayment(auth);
      } catch {}
    }
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "READY" },
      data: {
        status: "FAILED",
        metadata: mergeMetadata(payment.metadata, {
          ResultCode: "APPROVAL_ERROR",
          ResultMsg: "승인 처리 또는 망취소 확인 필요",
        }),
      },
    });
    return resultRedirect(req, payment.id, "failed");
  }
}
