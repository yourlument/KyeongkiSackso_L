const TEST_MID = "nicepay00m";
const TEST_MERCHANT_KEY =
  "EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg==";

export const NICEPAY_PAYMENT_SCRIPT =
  "https://pg-web.nicepay.co.kr/v3/common/js/nicepay-pgweb.js";
export const NICEPAY_CANCEL_URL =
  "https://pg-api.nicepay.co.kr/webapi/cancel_process.jsp";
export const NICEPAY_STATUS_URL =
  "https://webapi.nicepay.co.kr/webapi/inquery/trans_status.jsp";
export const NICEPAY_RECEIPT_URL =
  "https://npg.nicepay.co.kr/issue/IssueLoader.do";
export const NICEPAY_PAYOUT_URL = "https://data.nicepay.co.kr/om/api";
export const NICEPAY_BILLKEY_REGISTER_URL =
  "https://webapi.nicepay.co.kr/webapi/billing/cardbill_regist.jsp";
export const NICEPAY_BILLING_APPROVE_URL =
  "https://webapi.nicepay.co.kr/webapi/billing/billing_approve.jsp";
export const NICEPAY_BILLKEY_REMOVE_URL =
  "https://webapi.nicepay.co.kr/webapi/billing/billkey_remove.jsp";

export type NicepayMode = "test" | "production";

export class NicepayConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NicepayConfigurationError";
  }
}

function envFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value.trim() === "") return defaultValue;
  return value === "1" || value.toLowerCase() === "true";
}

export type NicepayPaymentConfig = {
  mode: NicepayMode;
  mid: string;
  merchantKey: string;
  enabled: boolean;
};

export function getNicepayPaymentConfig(): NicepayPaymentConfig {
  const configuredMode = process.env.NICEPAY_MODE?.trim();
  if (
    configuredMode &&
    configuredMode !== "test" &&
    configuredMode !== "production"
  ) {
    throw new NicepayConfigurationError(
      "NICEPAY_MODE는 test 또는 production이어야 합니다.",
    );
  }
  const mode: NicepayMode =
    configuredMode === "test" || configuredMode === "production"
      ? configuredMode
      : process.env.NODE_ENV === "production"
        ? "production"
        : "test";
  const mid =
    process.env.NICEPAY_MID?.trim() || (mode === "test" ? TEST_MID : "");
  const merchantKey =
    process.env.NICEPAY_MERCHANT_KEY?.trim() ||
    (mode === "test" ? TEST_MERCHANT_KEY : "");
  const enabled = envFlag(process.env.NICEPAY_PAYMENT_ENABLED, true);

  if (enabled && (!mid || !merchantKey)) {
    throw new NicepayConfigurationError(
      "NICEPAY_MID와 NICEPAY_MERCHANT_KEY를 설정해 주세요.",
    );
  }
  if (mid && mid.length !== 10) {
    throw new NicepayConfigurationError("NICEPAY_MID는 10자리여야 합니다.");
  }

  return { mode, mid, merchantKey, enabled };
}

export type NicepayBillingConfig = NicepayPaymentConfig;

export function getNicepayBillingConfig(): NicepayBillingConfig {
  const payment = getNicepayPaymentConfig();
  const enabled = envFlag(process.env.NICEPAY_BILLING_ENABLED, false);
  if (enabled && !payment.enabled) {
    throw new NicepayConfigurationError(
      "NICEPAY 결제를 활성화한 뒤 빌링을 사용할 수 있습니다.",
    );
  }
  const mid = process.env.NICEPAY_BILLING_MID?.trim() || payment.mid;
  const merchantKey =
    process.env.NICEPAY_BILLING_MERCHANT_KEY?.trim() || payment.merchantKey;

  if (enabled && (!mid || !merchantKey)) {
    throw new NicepayConfigurationError(
      "NICEPAY_BILLING_MID와 NICEPAY_BILLING_MERCHANT_KEY를 설정해 주세요.",
    );
  }
  if (mid && mid.length !== 10) {
    throw new NicepayConfigurationError(
      "NICEPAY_BILLING_MID는 10자리여야 합니다.",
    );
  }

  return { ...payment, mid, merchantKey, enabled };
}

export type NicepayPayoutConfig = {
  mid: string;
  authKey: string;
  enabled: boolean;
  endpoint: string;
};

export function getNicepayPayoutConfig(): NicepayPayoutConfig {
  const enabled = envFlag(process.env.NICEPAY_PAYOUT_ENABLED, false);
  const mid =
    process.env.NICEPAY_PAYOUT_MID?.trim() ||
    process.env.NICEPAY_MID?.trim() ||
    "";
  const authKey = process.env.NICEPAY_PAYOUT_AUTH_KEY?.trim() || "";
  const endpoint = process.env.NICEPAY_PAYOUT_URL?.trim() || NICEPAY_PAYOUT_URL;

  if (enabled && (!mid || !authKey)) {
    throw new NicepayConfigurationError(
      "NICEPAY_PAYOUT_MID와 NICEPAY_PAYOUT_AUTH_KEY를 설정해 주세요.",
    );
  }
  if (mid && mid.length !== 10) {
    throw new NicepayConfigurationError(
      "NICEPAY_PAYOUT_MID는 10자리여야 합니다.",
    );
  }

  return { mid, authKey, enabled, endpoint };
}

export function getPublicAppUrl(requestUrl: string): string {
  const configured =
    process.env.NICEPAY_RETURN_BASE_URL?.trim() || process.env.APP_URL?.trim();
  const base = configured || new URL(requestUrl).origin;
  return base.replace(/\/+$/, "");
}

export function assertNicepayCallbackUrl(
  value: string,
  kind: "approve" | "network-cancel",
): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NICEPAY 응답 URL이 올바르지 않습니다.");
  }

  const hosts = new Set(["dc1-api.nicepay.co.kr", "dc2-api.nicepay.co.kr"]);
  const expectedPath =
    kind === "approve"
      ? "/webapi/pay_process.jsp"
      : "/webapi/cancel_process.jsp";
  if (
    url.protocol !== "https:" ||
    !hosts.has(url.hostname) ||
    url.pathname !== expectedPath
  ) {
    throw new Error("허용되지 않은 NICEPAY 응답 URL입니다.");
  }
  return url;
}
