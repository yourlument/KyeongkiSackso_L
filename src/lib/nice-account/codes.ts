export const RESULT_OK = "0000";

const RESULT_MESSAGES: Record<string, string> = {
  A101: "SIGN DATA 검증에 실패하였습니다.",
  A109: "요청한 MID의 설정 정보가 없습니다.",
  A114: "상점 MID가 유효하지 않습니다.",
  A115: "TID가 유효하지 않습니다.",
  A117: "필수입력항목이 누락되었습니다.",
  A127: "주문번호 중복 오류입니다.",
  A147: "필드 길이가 초과되었습니다.",
  A224: "허용되지 않은 IP입니다.",
  A245: "인증 시간이 초과되었습니다.",
  "9000": "필수입력항목이 누락되었습니다.",
  "9001": "필드 길이가 잘못되었습니다.",
};

export function isAccountOtpSuccess(resultCode: string): boolean {
  return resultCode === RESULT_OK;
}

export function accountOtpMessage(input: {
  resultCode: string;
  resultMsg?: string;
}): string {
  if (input.resultCode === RESULT_OK) return "인증 성공";
  return (
    input.resultMsg ||
    RESULT_MESSAGES[input.resultCode] ||
    `계좌 인증 실패 (${input.resultCode || "코드 없음"})`
  );
}
