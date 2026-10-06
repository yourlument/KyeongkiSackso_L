import { createCipheriv, randomBytes } from "node:crypto";
import iconv from "iconv-lite";
import { kstTimestamp, sha256 } from "@/lib/nicepay/crypto";
import { getNiceAccountConfig, NiceAccountDisabledError } from "./config";
import { NiceAccountApiError } from "./token";

export type NicepayAccountResponse = {
  ResultCode: string;
  ResultMsg: string;
  Moid: string;
  TID: string;
  Signature: string;
};

function stringValue(value: unknown): string {
  return value == null ? "" : String(value);
}

function encodeFormComponentEucKr(value: string): string {
  const bytes = iconv.encode(value, "euc-kr");
  let encoded = "";
  for (const byte of bytes) {
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

export function encryptNicepayAccountData(input: {
  accountNo: string;
  accountName: string;
  merchantKey: string;
}): string {
  const accountNo = input.accountNo.replace(/\D/g, "").slice(0, 20);
  const rawAccountName = input.accountName.trim();
  const accountNameBytes = iconv.encode(rawAccountName, "euc-kr");
  if (!rawAccountName || accountNameBytes.length > 16) {
    throw new NiceAccountApiError(
      "INVALID_ACCOUNT_NAME",
      "예금주명을 확인해 주세요.",
    );
  }
  const accountName = encodeFormComponentEucKr(rawAccountName);
  const plaintext = `AccountNo=${accountNo}&AccountNm=${accountName}`;
  const key = Buffer.from(input.merchantKey.slice(0, 16), "utf8");
  if (key.length !== 16) {
    throw new NiceAccountApiError(
      "INVALID_MERCHANT_KEY",
      "NICEPAY 계좌인증 MerchantKey 앞 16바이트를 확인해 주세요.",
    );
  }
  const cipher = createCipheriv("aes-128-ecb", key, null);
  cipher.setAutoPadding(true);
  return Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]).toString("hex");
}

export function nicepayAccountSignData(input: {
  mid: string;
  ediDate: string;
  moid: string;
  merchantKey: string;
}): string {
  return sha256(
    `${input.mid}${input.moid}${input.ediDate}${input.merchantKey}`,
  );
}

export function createNicepayAccountMoid(
  seed: string,
  nowMs = Date.now(),
  nonce = randomBytes(4).toString("hex"),
): string {
  return `acct${nowMs}${sha256(`${seed}:${nonce}`).slice(0, 16)}`;
}

async function postNicepayAccountForm(
  url: string,
  fields: Record<string, string>,
): Promise<NicepayAccountResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=euc-kr",
    },
    body: new URLSearchParams(fields),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new NiceAccountApiError(
      `HTTP_${response.status}`,
      `NICEPAY 계좌인증 API HTTP ${response.status}`,
    );
  }
  const text = await response.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new NiceAccountApiError(
      "INVALID_RESPONSE",
      "NICEPAY 계좌인증 응답이 올바르지 않습니다.",
    );
  }
  return {
    ResultCode: stringValue(payload.ResultCode),
    ResultMsg: stringValue(payload.ResultMsg),
    Moid: stringValue(payload.Moid),
    TID: stringValue(payload.TID),
    Signature: stringValue(payload.Signature),
  };
}

export async function requestAccountOwnership(input: {
  bankCd: string;
  accountNo: string;
  accountName: string;
  moid?: string;
  now?: Date;
}): Promise<NicepayAccountResponse> {
  const config = getNiceAccountConfig();
  if (!config.enabled) throw new NiceAccountDisabledError();
  const moid = (input.moid || createNicepayAccountMoid(input.accountNo)).slice(
    0,
    64,
  );
  const ediDate = kstTimestamp(input.now);
  const result = await postNicepayAccountForm(config.requestUrl, {
    MID: config.mid,
    Moid: moid,
    EdiDate: ediDate,
    BankCd: input.bankCd.replace(/\D/g, "").slice(0, 3),
    EncData: encryptNicepayAccountData({
      accountNo: input.accountNo,
      accountName: input.accountName,
      merchantKey: config.merchantKey,
    }),
    SignData: nicepayAccountSignData({
      mid: config.mid,
      ediDate,
      moid,
      merchantKey: config.merchantKey,
    }),
    CharSet: "utf-8",
    EdiType: "JSON",
  });
  if (result.Moid && result.Moid !== moid) {
    throw new NiceAccountApiError(
      "RESPONSE_MISMATCH",
      "NICEPAY 계좌인증 요청번호가 일치하지 않습니다.",
    );
  }
  if (result.ResultCode === "0000" && !result.TID) {
    throw new NiceAccountApiError(
      "MISSING_TID",
      "NICEPAY 계좌인증 거래번호가 누락되었습니다.",
    );
  }
  return result;
}

export async function confirmAccountOwnership(input: {
  tid: string;
  certKey: string;
  expectedMoid?: string;
}): Promise<NicepayAccountResponse> {
  const config = getNiceAccountConfig();
  if (!config.enabled) throw new NiceAccountDisabledError();
  const certKey = input.certKey.replace(/\D/g, "");
  if (!/^\d{4}$/.test(certKey)) {
    throw new NiceAccountApiError(
      "INVALID_CERT_KEY",
      "인증 번호 4자리를 입력해 주세요.",
    );
  }
  const result = await postNicepayAccountForm(config.confirmUrl, {
    TID: input.tid.slice(0, 30),
    CertKey: certKey,
    EdiType: "JSON",
    CharSet: "utf-8",
  });
  if (result.TID && result.TID !== input.tid) {
    throw new NiceAccountApiError(
      "RESPONSE_MISMATCH",
      "NICEPAY 계좌인증 거래번호가 일치하지 않습니다.",
    );
  }
  if (input.expectedMoid && result.Moid && result.Moid !== input.expectedMoid) {
    throw new NiceAccountApiError(
      "RESPONSE_MISMATCH",
      "NICEPAY 계좌인증 요청번호가 일치하지 않습니다.",
    );
  }
  return result;
}
