import { randomInt } from "node:crypto";
import iconv from "iconv-lite";
import {
  NICEPAY_BILLING_APPROVE_URL,
  NICEPAY_BILLKEY_REGISTER_URL,
  NICEPAY_BILLKEY_REMOVE_URL,
  NICEPAY_PAYMENT_SCRIPT,
  getNicepayBillingConfig,
} from "./config";
import { kstTimestamp, nicepayText, secureHexEqual, sha256 } from "./crypto";

const TID_PATTERN = /^[A-Za-z0-9]{30}$/;
const BID_PATTERN = /^[A-Za-z0-9]{30}$/;

export type NicepayBillkeyCheckoutPayload = {
  scriptUrl: string;
  testMode: boolean;
  fields: Record<string, string> & { ReturnURL: string };
};

export type NicepayBillkeyAuthResponse = {
  AuthResultCode: string;
  AuthResultMsg: string;
  AuthToken: string;
  Signature: string;
  PayMethod: string;
  MID: string;
  Moid: string;
  Amt: string;
  TxTid: string;
  ReqReserved: string;
  BillAuthYN: string;
};

export type NicepayBillingResponse = Record<string, unknown> & {
  ResultCode?: string;
  ResultMsg?: string;
  TID?: string;
  BID?: string;
  MID?: string;
  Moid?: string;
  Amt?: string | number;
  AuthDate?: string;
  CardCode?: string;
  CardName?: string;
  CardNo?: string;
};

export class NicepayBillingApiError extends Error {
  constructor(
    public readonly resultCode: string,
    message: string,
  ) {
    super(message || "NICEPAY 빌링 요청에 실패했습니다.");
    this.name = "NicepayBillingApiError";
  }
}

function value(input: unknown): string {
  return input == null ? "" : String(input);
}

function encodeFormComponentEucKr(input: string): string {
  let encoded = "";
  for (const byte of iconv.encode(input, "euc-kr")) {
    if (
      (byte >= 0x41 && byte <= 0x5a) ||
      (byte >= 0x61 && byte <= 0x7a) ||
      (byte >= 0x30 && byte <= 0x39) ||
      byte === 0x2d ||
      byte === 0x2e ||
      byte === 0x5f ||
      byte === 0x2a
    ) {
      encoded += String.fromCharCode(byte);
    } else if (byte === 0x20) {
      encoded += "+";
    } else {
      encoded += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return encoded;
}

function encodeBillingForm(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(
      ([key, item]) =>
        `${encodeFormComponentEucKr(key)}=${encodeFormComponentEucKr(item)}`,
    )
    .join("&");
}

async function postBillingForm(
  url: string,
  fields: Record<string, string>,
): Promise<NicepayBillingResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=euc-kr",
    },
    body: encodeBillingForm(fields),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new NicepayBillingApiError(
      `HTTP_${response.status}`,
      `NICEPAY 빌링 API HTTP ${response.status}`,
    );
  }
  try {
    return JSON.parse(text) as NicepayBillingResponse;
  } catch {
    throw new NicepayBillingApiError(
      "INVALID_RESPONSE",
      "NICEPAY 빌링 응답을 해석하지 못했습니다.",
    );
  }
}

function enabledBillingConfig() {
  const config = getNicepayBillingConfig();
  if (!config.enabled) {
    throw new Error("NICEPAY 빌링이 비활성화되어 있습니다.");
  }
  return config;
}

export function createNicepayBillkeyCheckout(input: {
  registrationId: string;
  amount: number;
  goodsName: string;
  buyerName: string;
  buyerTel?: string | null;
  buyerEmail?: string | null;
  returnUrl: string;
  now?: Date;
}): NicepayBillkeyCheckoutPayload {
  const config = enabledBillingConfig();
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw new Error("빌링 금액이 올바르지 않습니다.");
  }
  const returnUrl = new URL(input.returnUrl);
  if (config.mode === "production" && returnUrl.protocol !== "https:") {
    throw new Error("운영 NICEPAY 빌링 ReturnURL은 HTTPS여야 합니다.");
  }
  const ediDate = kstTimestamp(input.now);
  const amount = String(input.amount);
  return {
    scriptUrl: NICEPAY_PAYMENT_SCRIPT,
    testMode: config.mode === "test",
    fields: {
      GoodsName: nicepayText(input.goodsName, 40) || "KORLINK 이용권",
      Amt: amount,
      MID: config.mid,
      EdiDate: ediDate,
      Moid: input.registrationId,
      PayMethod: "CARD",
      BillAuthYN: "Y",
      SignData: sha256(`${ediDate}${config.mid}${amount}${config.merchantKey}`),
      BuyerEmail: (input.buyerEmail ?? "").slice(0, 60),
      BuyerTel: (input.buyerTel ?? "").replace(/\D/g, "").slice(0, 20),
      BuyerName: nicepayText(input.buyerName, 30),
      CharSet: "utf-8",
      ReqReserved: input.registrationId,
      ReturnURL: returnUrl.toString(),
    },
  };
}

export function verifyNicepayBillkeyAuthResponse(
  auth: NicepayBillkeyAuthResponse,
): boolean {
  const config = enabledBillingConfig();
  if (
    auth.AuthResultCode !== "0000" ||
    auth.PayMethod !== "CARD" ||
    auth.BillAuthYN !== "Y" ||
    auth.MID !== config.mid ||
    !auth.AuthToken ||
    !auth.Signature ||
    !TID_PATTERN.test(auth.TxTid)
  ) {
    return false;
  }
  return secureHexEqual(
    auth.Signature,
    sha256(`${auth.AuthToken}${auth.MID}${auth.Amt}${config.merchantKey}`),
  );
}

export async function registerNicepayBillkey(
  auth: NicepayBillkeyAuthResponse,
): Promise<NicepayBillingResponse & { BID: string; TID: string }> {
  const config = enabledBillingConfig();
  const ediDate = kstTimestamp();
  const result = await postBillingForm(NICEPAY_BILLKEY_REGISTER_URL, {
    TID: auth.TxTid,
    AuthToken: auth.AuthToken,
    MID: config.mid,
    EdiDate: ediDate,
    SignData: sha256(
      `${auth.TxTid}${config.mid}${ediDate}${config.merchantKey}`,
    ),
    CharSet: "utf-8",
    EdiType: "JSON",
  });
  const tid = value(result.TID);
  const bid = value(result.BID);
  if (
    value(result.ResultCode) !== "F100" ||
    tid !== auth.TxTid ||
    !BID_PATTERN.test(bid)
  ) {
    throw new NicepayBillingApiError(
      value(result.ResultCode) || "BILLKEY_REGISTER_FAILED",
      value(result.ResultMsg) || "NICEPAY 빌키 발급에 실패했습니다.",
    );
  }
  return { ...result, TID: tid, BID: bid };
}

const TID_SUFFIX_ATTEMPTS = 64;
const TID_HISTORY_LIMIT = 512;
const issuedBillingTids = new Set<string>();

function rememberBillingTid(tid: string): void {
  issuedBillingTids.add(tid);
  if (issuedBillingTids.size > TID_HISTORY_LIMIT) {
    const oldest = issuedBillingTids.values().next();
    if (!oldest.done) issuedBillingTids.delete(oldest.value);
  }
}

export function createNicepayBillingTid(mid: string, now = new Date()): string {
  if (mid.length !== 10) throw new Error("NICEPAY MID는 10자리여야 합니다.");
  const prefix = `${mid}0116${kstTimestamp(now).slice(2)}`;
  for (let attempt = 0; attempt < TID_SUFFIX_ATTEMPTS; attempt++) {
    const tid = `${prefix}${String(randomInt(0, 10000)).padStart(4, "0")}`;
    if (issuedBillingTids.has(tid)) continue;
    rememberBillingTid(tid);
    return tid;
  }
  throw new Error("NICEPAY 빌링 TID 생성에 실패했습니다.");
}

export function createNicepayBillingApprovalFields(input: {
  bid: string;
  transactionId: string;
  merchantOrderId: string;
  amount: number;
  goodsName: string;
  buyerName?: string | null;
  buyerTel?: string | null;
  buyerEmail?: string | null;
  now?: Date;
}): Record<string, string> {
  const config = enabledBillingConfig();
  if (!BID_PATTERN.test(input.bid))
    throw new Error("NICEPAY BID가 올바르지 않습니다.");
  if (!TID_PATTERN.test(input.transactionId))
    throw new Error("NICEPAY 빌링 TID가 올바르지 않습니다.");
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0)
    throw new Error("빌링 금액이 올바르지 않습니다.");
  const ediDate = kstTimestamp(input.now);
  const amount = String(input.amount);
  return {
    BID: input.bid,
    MID: config.mid,
    TID: input.transactionId,
    EdiDate: ediDate,
    Moid: input.merchantOrderId,
    Amt: amount,
    GoodsName: nicepayText(input.goodsName, 40) || "KORLINK 이용권",
    SignData: sha256(
      `${config.mid}${ediDate}${input.merchantOrderId}${amount}${input.bid}${config.merchantKey}`,
    ),
    CardInterest: "0",
    CardQuota: "00",
    BuyerEmail: (input.buyerEmail ?? "").slice(0, 60),
    BuyerTel: (input.buyerTel ?? "").replace(/\D/g, "").slice(0, 20),
    BuyerName: nicepayText(input.buyerName ?? "", 30),
    CharSet: "utf-8",
    EdiType: "JSON",
  };
}

export async function approveNicepayBilling(input: {
  bid: string;
  transactionId: string;
  merchantOrderId: string;
  amount: number;
  goodsName: string;
  buyerName?: string | null;
  buyerTel?: string | null;
  buyerEmail?: string | null;
}): Promise<NicepayBillingResponse & { TID: string; Moid: string }> {
  const fields = createNicepayBillingApprovalFields(input);
  const result = await postBillingForm(NICEPAY_BILLING_APPROVE_URL, fields);
  const tid = value(result.TID);
  const moid = value(result.Moid);
  if (value(result.ResultCode) !== "3001") {
    throw new NicepayBillingApiError(
      value(result.ResultCode) || "BILLING_APPROVAL_FAILED",
      value(result.ResultMsg) || "NICEPAY 정기결제 승인에 실패했습니다.",
    );
  }
  if (
    tid !== input.transactionId ||
    moid !== input.merchantOrderId ||
    Number(result.Amt) !== input.amount
  ) {
    throw new Error("NICEPAY 정기결제 승인 응답의 무결성 검증에 실패했습니다.");
  }
  return { ...result, TID: tid, Moid: moid };
}

export async function removeNicepayBillkey(input: {
  bid: string;
  merchantOrderId: string;
  amount: number;
}): Promise<NicepayBillingResponse> {
  const config = enabledBillingConfig();
  if (!BID_PATTERN.test(input.bid))
    throw new Error("NICEPAY BID가 올바르지 않습니다.");
  const ediDate = kstTimestamp();
  const result = await postBillingForm(NICEPAY_BILLKEY_REMOVE_URL, {
    BID: input.bid,
    MID: config.mid,
    EdiDate: ediDate,
    Moid: input.merchantOrderId,
    Amt: String(input.amount),
    SignData: sha256(
      `${config.mid}${ediDate}${input.merchantOrderId}${input.bid}${config.merchantKey}`,
    ),
    CharSet: "utf-8",
    EdiType: "JSON",
  });
  if (
    value(result.ResultCode) !== "F101" ||
    (result.BID != null && value(result.BID) !== input.bid)
  ) {
    throw new NicepayBillingApiError(
      value(result.ResultCode) || "BILLKEY_REMOVE_FAILED",
      value(result.ResultMsg) || "NICEPAY 빌키 삭제에 실패했습니다.",
    );
  }
  return result;
}

export function nicepayBillingMetadata(
  result: NicepayBillingResponse,
): Record<string, string> {
  const allowed = [
    "ResultCode",
    "ResultMsg",
    "TID",
    "Moid",
    "Amt",
    "AuthCode",
    "AuthDate",
    "CardCode",
    "CardName",
    "CardNo",
    "CardQuota",
    "CardCl",
    "CcPartCl",
    "CardInterest",
  ];
  return Object.fromEntries(
    allowed
      .filter((key) => result[key] != null)
      .map((key) => [key, value(result[key])]),
  );
}
