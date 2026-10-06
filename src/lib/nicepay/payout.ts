import { getNicepayPayoutConfig } from "./config";
import { kstTimestamp, nicepayText, sha256 } from "./crypto";

type PayoutSid = "0101001" | "0105001" | "0102001" | "0103001" | "0101002";

type PayoutHeader = {
  sid: PayoutSid | "9999999";
  trDtm: string;
  gubun: "S" | "R";
  resCode: string;
  resMsg: string;
};

export type PayoutResponse<T> = {
  header: PayoutHeader;
  body: T;
};

export class NicepayPayoutDisabledError extends Error {
  constructor() {
    super("NICEPAY 지급대행이 비활성화되어 있습니다.");
    this.name = "NicepayPayoutDisabledError";
  }
}

export class NicepayPayoutApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message || `NICEPAY 지급대행 오류 (${code})`);
    this.name = "NicepayPayoutApiError";
    this.code = code;
  }
}

function decodeJson(bytes: Uint8Array): unknown {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  try {
    return JSON.parse(utf8);
  } catch {
    const eucKr = new TextDecoder("euc-kr").decode(bytes);
    return JSON.parse(eucKr);
  }
}

function sanitizeResponse<T>(response: PayoutResponse<T>): PayoutResponse<T> {
  if (
    response.body &&
    typeof response.body === "object" &&
    "reqInfo" in response.body
  ) {
    const { reqInfo: _reqInfo, ...body } = response.body as Record<
      string,
      unknown
    >;
    return { ...response, body: body as T };
  }
  return response;
}

async function callPayout<T>(
  sid: PayoutSid,
  body: Record<string, string>,
): Promise<PayoutResponse<T>> {
  const config = getNicepayPayoutConfig();
  if (!config.enabled) throw new NicepayPayoutDisabledError();

  const trDtm = kstTimestamp();
  const request = {
    header: {
      sid,
      trDtm,
      gubun: "S",
      resCode: "",
      resMsg: "",
    },
    body: {
      mid: config.mid,
      encKey: sha256(`${sid}${config.mid}${trDtm}${config.authKey}`),
      ...body,
    },
  };

  const apiResponse = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(request),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const bytes = new Uint8Array(await apiResponse.arrayBuffer());
  if (!apiResponse.ok) {
    throw new NicepayPayoutApiError(
      `HTTP_${apiResponse.status}`,
      `NICEPAY 지급대행 API HTTP ${apiResponse.status}`,
    );
  }

  const response = sanitizeResponse(
    decodeJson(bytes) as PayoutResponse<T>,
  );
  if (!response.header || response.header.resCode !== "0000") {
    throw new NicepayPayoutApiError(
      response.header?.resCode || "INVALID_RESPONSE",
      response.header?.resMsg || "NICEPAY 지급대행 응답이 올바르지 않습니다.",
    );
  }
  return response;
}

export type NicepayBalance = {
  mid: string;
  remainAmt: number;
  last?: {
    lastCl: "00" | "01" | "10";
    lastAmt: number;
    lastDt: string;
  };
};

export async function getNicepayPayoutBalance(): Promise<NicepayBalance> {
  const response = await callPayout<NicepayBalance>("0101001", {});
  return response.body;
}

export type NicepaySubmallInput = {
  subId: string;
  subNm: string;
  subCoNo: string;
  bankCd: string;
  accntNo: string;
  accntNm: string;
  memo?: string;
  reqType: "0" | "1";
};

export async function upsertNicepaySubmall(
  input: NicepaySubmallInput,
): Promise<{ mid: string; subId: string; reqType: "0" | "1" }> {
  const response = await callPayout<{
    mid: string;
    subId: string;
    reqType: "0" | "1";
  }>("0105001", {
    subId: input.subId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50),
    subNm: nicepayText(input.subNm, 30),
    subCoNo: input.subCoNo.replace(/\D/g, "").slice(0, 10),
    bankCd: input.bankCd.replace(/\D/g, "").slice(0, 3),
    accntNo: input.accntNo.replace(/\D/g, "").slice(0, 30),
    accntNm: nicepayText(input.accntNm, 30),
    memo: nicepayText(input.memo ?? "", 100),
    reqType: input.reqType,
  });
  return response.body;
}

export type NicepayPayoutRequest = {
  settlmntDt: string;
  subId: string;
  settlmntAmt: number;
  dupChkYn?: "Y" | "N";
  accountDesc: string;
};

export type NicepayPayoutRequestResult = {
  mid: string;
  subId: string;
  settlmntDt: string;
  settlmntAmt: number;
  dupChkYn?: "Y" | "N";
  dupYn?: "Y" | "N";
  seq: string;
};

export async function requestNicepayPayout(
  input: NicepayPayoutRequest,
): Promise<NicepayPayoutRequestResult> {
  if (!Number.isSafeInteger(input.settlmntAmt) || input.settlmntAmt <= 0) {
    throw new Error("지급 요청 금액이 올바르지 않습니다.");
  }
  const response = await callPayout<NicepayPayoutRequestResult>("0102001", {
    settlmntDt: input.settlmntDt.replace(/\D/g, "").slice(0, 8),
    subId: input.subId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50),
    settlmntAmt: String(input.settlmntAmt),
    dupChkYn: input.dupChkYn ?? "Y",
    accountDesc: nicepayText(input.accountDesc, 30),
  });
  return response.body;
}

export async function cancelNicepayPayout(input: {
  settlmntDt: string;
  subId: string;
  seq: string;
}): Promise<{
  mid: string;
  subId: string;
  settlmntDt: string;
  settlmntAmt: number;
  seq: string;
}> {
  const response = await callPayout<{
    mid: string;
    subId: string;
    settlmntDt: string;
    settlmntAmt: number;
    seq: string;
  }>("0103001", {
    settlmntDt: input.settlmntDt.replace(/\D/g, "").slice(0, 8),
    subId: input.subId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 50),
    seq: input.seq.replace(/\D/g, "").slice(0, 20),
  });
  return response.body;
}

export type NicepayPayoutDetail = {
  rowNo: number | string;
  seq: string;
  settlmntDt: string;
  subCoNo: string;
  subCoNm: string;
  subId: string;
  statusNm: "요청" | "성공" | "실패" | "재요청 진행중" | "삭제" | string;
  settlmntAmt: number;
  bankCd: string;
  accntNm: string;
  accntNo: string;
  errReason: string;
};

export type NicepayPayoutResult = {
  mid: string;
  totCnt: number;
  succCnt: number;
  failCnt: number;
  remainAmt: number;
  detail: NicepayPayoutDetail[];
};

export async function getNicepayPayoutResult(input: {
  settlmntDt: string;
  subId?: string;
}): Promise<NicepayPayoutResult> {
  const response = await callPayout<NicepayPayoutResult>("0101002", {
    settlmntDt: input.settlmntDt.replace(/\D/g, "").slice(0, 8),
    subId: (input.subId ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 50),
  });
  return response.body;
}
