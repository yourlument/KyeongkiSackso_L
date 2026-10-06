const KOREAN_PHONE_PATTERN =
  /^0(?:2|1[016789]|[3-6][1-5]|70)-?\d{3,4}-?\d{4}$/;

export function isValidKoreanPhone(value: string): boolean {
  return KOREAN_PHONE_PATTERN.test(value.trim());
}
