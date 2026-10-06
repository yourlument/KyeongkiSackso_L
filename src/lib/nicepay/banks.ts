const BANK_CODES: Record<string, string> = {
  한국은행: "001",
  산업은행: "002",
  기업은행: "003",
  국민은행: "004",
  외환은행: "005",
  수협중앙회: "007",
  수출입은행: "008",
  농협은행: "011",
  NH농협은행: "011",
  농협: "011",
  농협중앙회: "011",
  농협회원조합: "012",
  우리은행: "020",
  SC은행: "023",
  SC제일은행: "023",
  한국씨티은행: "027",
  씨티은행: "027",
  대구은행: "031",
  부산은행: "032",
  광주은행: "034",
  제주은행: "035",
  전북은행: "037",
  경남은행: "039",
  새마을금고: "045",
  신협: "048",
  상호저축은행: "050",
  우체국: "071",
  하나은행: "081",
  신한은행: "088",
  케이뱅크: "089",
  카카오뱅크: "090",
  토스뱅크: "092",
};

export function nicepayBankCode(
  explicitCode: string | null | undefined,
  bankName: string | null | undefined,
): string | null {
  const code = explicitCode?.replace(/\D/g, "");
  if (code?.length === 3) return code;
  const normalized = bankName?.replace(/\s+/g, "").trim();
  if (!normalized) return null;
  return BANK_CODES[normalized] ?? null;
}
