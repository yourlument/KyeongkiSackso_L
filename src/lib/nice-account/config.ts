export const NICEPAY_ACCOUNT_REQUEST_URL =
  "https://service.nicepay.co.kr/auth/bank/cert_acct.jsp";

export const NICEPAY_ACCOUNT_CONFIRM_URL =
  "https://service.nicepay.co.kr/auth/bank/cert_mark.jsp";

export type NiceAccountConfig = {
  mid: string;
  merchantKey: string;
  requestUrl: string;
  confirmUrl: string;
  enabled: boolean;
};

export class NiceAccountConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NiceAccountConfigurationError";
  }
}

export class NiceAccountDisabledError extends Error {
  constructor() {
    super("계좌 인증 서비스가 비활성화되어 있습니다.");
    this.name = "NiceAccountDisabledError";
  }
}

function envFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value.trim() === "") return defaultValue;
  return value === "1" || value.toLowerCase() === "true";
}

export function getNiceAccountConfig(): NiceAccountConfig {
  const enabled = envFlag(process.env.NICEPAY_ACCOUNT_ENABLED, false);
  const mid =
    process.env.NICEPAY_ACCOUNT_MID?.trim() ||
    process.env.NICEPAY_MID?.trim() ||
    "";
  const merchantKey =
    process.env.NICEPAY_ACCOUNT_MERCHANT_KEY?.trim() ||
    process.env.NICEPAY_MERCHANT_KEY?.trim() ||
    "";
  const requestUrl =
    process.env.NICEPAY_ACCOUNT_REQUEST_URL?.trim() ||
    NICEPAY_ACCOUNT_REQUEST_URL;
  const confirmUrl =
    process.env.NICEPAY_ACCOUNT_CONFIRM_URL?.trim() ||
    NICEPAY_ACCOUNT_CONFIRM_URL;

  if (enabled && (!mid || !merchantKey)) {
    throw new NiceAccountConfigurationError(
      "NICEPAY 계좌인증 MID와 MerchantKey를 설정해 주세요.",
    );
  }
  if (mid && mid.length !== 10) {
    throw new NiceAccountConfigurationError(
      "NICEPAY 계좌인증 MID는 10자리여야 합니다.",
    );
  }
  if (merchantKey && Buffer.byteLength(merchantKey.slice(0, 16), "utf8") !== 16) {
    throw new NiceAccountConfigurationError(
      "NICEPAY 계좌인증 MerchantKey 앞 16바이트를 확인해 주세요.",
    );
  }

  return { mid, merchantKey, requestUrl, confirmUrl, enabled };
}
