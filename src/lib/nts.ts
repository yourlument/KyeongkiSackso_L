export const TEST_BIZ_NO = "9999999999";

export const NTS_OUTAGE_MESSAGE =
  "국세청 진위확인 서버 장애로 확인하지 못했습니다. 잠시 후 다시 시도해 주세요";

export type NtsResult = {
  valid: boolean;
  status: string;
  message: string;
};

const ATTEMPTS = 3;
const RETRY_DELAY_MS = 700;
const TIMEOUT_MS = 8000;

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function lookup(url: string, key: string, b: string): Promise<NtsResult | null> {
  const res = await fetch(`${url}?serviceKey=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ b_no: [b] }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.data?.[0];
  if (!item || !item.b_stt_cd) {
    return { valid: false, status: "미등록", message: "국세청에 등록되지 않은 사업자등록번호입니다" };
  }
  return { valid: true, status: item.b_stt || "확인", message: `${item.b_stt} 확인되었습니다` };
}

export async function verifyBusinessNo(raw: string): Promise<NtsResult> {
  const b = digitsOnly(raw);
  if (b.length !== 10) {
    return { valid: false, status: "형식오류", message: "사업자등록번호 10자리를 입력해 주세요" };
  }
  if (b === TEST_BIZ_NO) {
    return { valid: true, status: "테스트", message: "테스트용 번호로 확인되었습니다" };
  }
  const url = process.env.NTS_API_URL;
  const key = process.env.NTS_API_KEY;
  if (!url || !key) {
    return { valid: false, status: "미설정", message: "진위확인 서비스가 설정되지 않았습니다" };
  }

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const result = await lookup(url, key, b);
      if (result) return result;
    } catch {
      void attempt;
    }
    if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
  }

  return { valid: false, status: "오류", message: NTS_OUTAGE_MESSAGE };
}
