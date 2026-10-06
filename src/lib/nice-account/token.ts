export class NiceAccountApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message || `NICEPAY 계좌인증 오류 (${code})`);
    this.name = "NiceAccountApiError";
    this.code = code;
  }
}
