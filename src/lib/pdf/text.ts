const HANGUL_COMPATIBILITY_JAMO = /([\u3131-\u318e]+)/;

export function normalizePdfText(value: string): string {
  return value
    .split(HANGUL_COMPATIBILITY_JAMO)
    .map((part) =>
      HANGUL_COMPATIBILITY_JAMO.test(part) ? part : part.normalize("NFKC"),
    )
    .join("");
}
