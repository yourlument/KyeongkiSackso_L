import {
  NICEPAY_CANCEL_URL,
  NICEPAY_PAYMENT_SCRIPT,
  NICEPAY_RECEIPT_URL,
  NICEPAY_STATUS_URL,
  assertNicepayCallbackUrl,
  getNicepayPaymentConfig,
  type NicepayPaymentConfig,
} from "./config";
import {
  kstTimestamp,
  nicepayText,
  secureHexEqual,
  sha256,
} from "./crypto";

export type NicepayMethod = "CARD" | "BANK" | "VBANK";

const NICEPAY_APPROVAL_SUCCESS_CODES: Record<NicepayMethod, string> = {
  CARD: "3001",
  BANK: "4000",
  VBANK: "4100",
};

const NICEPAY_TID_PATTERN = /^[A-Za-z0-9]{30}$/;

export function createNicepayReceiptUrl(tid: string): URL {
  const normalized = tid.trim();
  if (!NICEPAY_TID_PATTERN.test(normalized)) {
    throw new Error("NICEPAY 거래 TID가 올바르지 않습니다.");
  }
  const url = new URL(NICEPAY_RECEIPT_URL);
  url.searchParams.set("type", "0");
  url.searchParams.set("TID", normalized);
  return url;
}

export type NicepayCheckoutFields = Record<string, string> & {
  PayMethod: NicepayMethod;
  GoodsName: string;
  Amt: string;
  MID: string;
  EdiDate: string;
  Moid: string;
  SignData: string;
  ReturnURL: string;
};

export type NicepayCheckoutPayload = {
  scriptUrl: string;
  fields: NicepayCheckoutFields;
  testMode: boolean;
};

export function createNicepayCheckout(input: {
  paymentId: string;
  method: NicepayMethod;
  amount: number;
  goodsName: string;
  buyerName: string;
  buyerTel?: string | null;
  buyerEmail?: string | null;
  returnUrl: string;
  now?: Date;
}): NicepayCheckoutPayload {
  const config = getNicepayPaymentConfig();
  if (!config.enabled) throw new Error("NICEPAY 결제가 비활성화되어 있습니다.");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error("결제 금액이 올바르지 않습니다.");
  }
  const returnUrl = new URL(input.returnUrl);
  if (config.mode === "production" && returnUrl.protocol !== "https:") {
    throw new Error("운영 NICEPAY ReturnURL은 HTTPS여야 합니다.");
  }

  const ediDate = kstTimestamp(input.now);
  const amount = String(input.amount);
  const expiration = new Date((input.now ?? new Date()).getTime() + 3 * 86400000);
  const vbankExpiration = kstTimestamp(expiration).slice(0, 12);

  return {
    scriptUrl: NICEPAY_PAYMENT_SCRIPT,
    testMode: config.mode === "test",
    fields: {
      PayMethod: input.method,
      GoodsName: nicepayText(input.goodsName, 40) || "KORLINK 주문",
      Amt: amount,
      MID: config.mid,
      EdiDate: ediDate,
      Moid: input.paymentId,
      SignData: sha256(
        `${ediDate}${config.mid}${amount}${config.merchantKey}`,
      ),
      ReturnURL: returnUrl.toString(),
      BuyerName: nicepayText(input.buyerName, 30),
      BuyerTel: (input.buyerTel ?? "").replace(/\D/g, "").slice(0, 20),
      BuyerEmail: (input.buyerEmail ?? "").slice(0, 60),
      ReqReserved: input.paymentId,
      CharSet: "utf-8",
      GoodsCl: "1",
      TransType: "0",
      NpLang: "KO",
      ...(input.method === "VBANK"
        ? { VbankExpDate: vbankExpiration }
        : {}),
    },
  };
}

export type NicepayAuthResponse = {
  AuthResultCode: string;
  AuthResultMsg: string;
  AuthToken: string;
  Signature: string;
  PayMethod: string;
  MID: string;
  Moid: string;
  Amt: string;
  TxTid: string;
  NextAppURL: string;
  NetCancelURL: string;
};

export function verifyNicepayAuthResponse(
  auth: NicepayAuthResponse,
): boolean {
  const config = getNicepayPaymentConfig();
  if (!auth.AuthToken || !auth.Signature) return false;
  return secureHexEqual(
    auth.Signature,
    sha256(`${auth.AuthToken}${auth.MID}${auth.Amt}${config.merchantKey}`),
  );
}

export type NicepayApiResponse = Record<string, unknown> & {
  ResultCode?: string;
  ResultMsg?: string;
  Amt?: string | number;
  MID?: string;
  Moid?: string;
  TID?: string;
  Signature?: string;
  PayMethod?: string;
};

export function isNicepayApprovalSuccess(
  result: NicepayApiResponse,
  method: NicepayMethod,
): boolean {
  return String(result.ResultCode ?? "") === NICEPAY_APPROVAL_SUCCESS_CODES[method];
}

export function isNicepayVirtualDepositNotification(input: {
  mid: string;
  expectedMid: string;
  paymentId: string;
  tid: string;
  payMethod: string;
  resultCode: string;
  state: string;
}): boolean {
  return (
    input.mid === input.expectedMid &&
    input.payMethod === "VBANK" &&
    input.resultCode === "4110" &&
    input.state === "0" &&
    Boolean(input.paymentId) &&
    NICEPAY_TID_PATTERN.test(input.tid)
  );
}

export function isNicepayCancellationNotification(input: {
  mid: string;
  expectedMid: string;
  paymentId: string;
  tid: string;
  payMethod: string;
  state: string;
}): boolean {
  return (
    input.mid === input.expectedMid &&
    (input.payMethod === "CARD" || input.payMethod === "BANK") &&
    (input.state === "1" || input.state === "2") &&
    Boolean(input.paymentId) &&
    NICEPAY_TID_PATTERN.test(input.tid)
  );
}

export function isNicepayImmediateApprovalNotification(input: {
  mid: string;
  expectedMid: string;
  paymentId: string;
  tid: string;
  payMethod: string;
  resultCode: string;
  state: string;
}): boolean {
  const method =
    input.payMethod === "CARD" || input.payMethod === "BANK"
      ? input.payMethod
      : null;
  return (
    input.mid === input.expectedMid &&
    method !== null &&
    input.resultCode === NICEPAY_APPROVAL_SUCCESS_CODES[method] &&
    input.state === "0" &&
    Boolean(input.paymentId) &&
    NICEPAY_TID_PATTERN.test(input.tid)
  );
}

export function isNicepayApprovedPaymentStatus(
  result: NicepayApiResponse,
  expectedTid: string,
): boolean {
  return (
    String(result.ResultCode ?? "") === "0000" &&
    String(result.Status ?? "") === "0" &&
    String(result.TID ?? "") === expectedTid
  );
}

export function isNicepayCancelledPaymentStatus(
  result: NicepayApiResponse,
  expectedTid: string,
): boolean {
  return (
    String(result.ResultCode ?? "") === "0000" &&
    String(result.Status ?? "") === "1" &&
    String(result.TID ?? "") === expectedTid
  );
}

function stringValue(value: unknown): string {
  return value == null ? "" : String(value);
}

async function postForm(
  url: URL | string,
  values: Record<string, string>,
): Promise<NicepayApiResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=euc-kr",
    },
    body: new URLSearchParams(values),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`NICEPAY API HTTP ${response.status}`);
  }
  try {
    return JSON.parse(text) as NicepayApiResponse;
  } catch {
    throw new Error("NICEPAY API 응답을 해석하지 못했습니다.");
  }
}

function verifyPaymentResponse(
  result: NicepayApiResponse,
  expectedAmount: string,
): void {
  const config = getNicepayPaymentConfig();
  const tid = stringValue(result.TID);
  const mid = stringValue(result.MID);
  const rawAmount = stringValue(result.Amt);
  const amount = String(Number(rawAmount));
  const signature = stringValue(result.Signature);
  const expected = sha256(`${tid}${mid}${rawAmount}${config.merchantKey}`);

  if (
    !tid ||
    mid !== config.mid ||
    amount !== String(Number(expectedAmount)) ||
    !secureHexEqual(signature, expected)
  ) {
    throw new Error("NICEPAY 승인 응답의 무결성 검증에 실패했습니다.");
  }
}

export async function approveNicepayPayment(
  auth: NicepayAuthResponse,
): Promise<NicepayApiResponse> {
  const config = getNicepayPaymentConfig();
  const url = assertNicepayCallbackUrl(auth.NextAppURL, "approve");
  const ediDate = kstTimestamp();
  const values = {
    TID: auth.TxTid,
    AuthToken: auth.AuthToken,
    MID: config.mid,
    Amt: auth.Amt,
    EdiDate: ediDate,
    SignData: sha256(
      `${auth.AuthToken}${config.mid}${auth.Amt}${ediDate}${config.merchantKey}`,
    ),
    CharSet: "utf-8",
    EdiType: "JSON",
  };
  const result = await postForm(url, values);
  verifyPaymentResponse(result, auth.Amt);
  return result;
}

export async function networkCancelNicepayPayment(
  auth: NicepayAuthResponse,
): Promise<void> {
  const config = getNicepayPaymentConfig();
  const url = assertNicepayCallbackUrl(auth.NetCancelURL, "network-cancel");
  const ediDate = kstTimestamp();
  await postForm(url, {
    TID: auth.TxTid,
    AuthToken: auth.AuthToken,
    MID: config.mid,
    Amt: auth.Amt,
    EdiDate: ediDate,
    NetCancel: "1",
    SignData: sha256(
      `${auth.AuthToken}${config.mid}${auth.Amt}${ediDate}${config.merchantKey}`,
    ),
    CharSet: "utf-8",
    EdiType: "JSON",
  });
}

export async function cancelNicepayPayment(input: {
  tid: string;
  orderNo: string;
  amount: number;
  reason: string;
}): Promise<NicepayApiResponse> {
  const config = getNicepayPaymentConfig();
  const ediDate = kstTimestamp();
  const amount = String(input.amount);
  const cancelMessage =
    input.reason
      .replace(/[^\x20-\x7e]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || "KORLINK refund";
  const result = await postForm(NICEPAY_CANCEL_URL, {
    TID: input.tid,
    MID: config.mid,
    Moid: input.orderNo,
    CancelAmt: amount,
    CancelMsg: cancelMessage,
    PartialCancelCode: "0",
    EdiDate: ediDate,
    SignData: sha256(`${config.mid}${amount}${ediDate}${config.merchantKey}`),
    CharSet: "utf-8",
    EdiType: "JSON",
  });

  const resultAmount = stringValue(result.CancelAmt);
  const tid = stringValue(result.TID);
  const mid = stringValue(result.MID);
  const signature = stringValue(result.Signature);
  const expected = sha256(
    `${tid}${mid}${resultAmount}${config.merchantKey}`,
  );
  if (
    stringValue(result.ResultCode) !== "2001" ||
    tid !== input.tid ||
    mid !== config.mid ||
    Number(resultAmount) !== input.amount ||
    !secureHexEqual(signature, expected)
  ) {
    throw new Error(
      stringValue(result.ResultMsg) || "NICEPAY 결제 취소에 실패했습니다.",
    );
  }
  return result;
}

export async function queryNicepayPayment(
  tid: string,
  config: NicepayPaymentConfig = getNicepayPaymentConfig(),
): Promise<NicepayApiResponse> {
  const ediDate = kstTimestamp();
  return postForm(NICEPAY_STATUS_URL, {
    TID: tid,
    MID: config.mid,
    EdiDate: ediDate,
    SignData: sha256(`${tid}${config.mid}${ediDate}${config.merchantKey}`),
    CharSet: "utf-8",
    EdiType: "JSON",
  });
}

export function nicepayResultMetadata(
  result: NicepayApiResponse,
): Record<string, string> {
  const allowed = [
    "ResultCode",
    "ResultMsg",
    "PayMethod",
    "TID",
    "AuthCode",
    "AuthDate",
    "CardCode",
    "CardName",
    "CardQuota",
    "CardType",
    "VbankBankCode",
    "VbankBankName",
    "VbankNum",
    "VbankExpDate",
    "VbankExpTime",
  ];
  return Object.fromEntries(
    allowed
      .filter((key) => result[key] != null)
      .map((key) => [key, stringValue(result[key])]),
  );
}
