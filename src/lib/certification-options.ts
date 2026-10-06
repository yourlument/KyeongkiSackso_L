export const STANDARD_CERTIFICATION_MARKS = [
  "사회적기업",
  "여성기업",
  "우수제품",
  "우수제품인증",
  "인증서",
  "장애인기업",
  "중증장애인생산품",
  "창업기업",
  "테스트 인증서",
  "ISO",
  "ISO 9001 품질경영시스템",
] as const;

export type StandardCertificationMark = (typeof STANDARD_CERTIFICATION_MARKS)[number];

const canonicalByCompactName = new Map(
  STANDARD_CERTIFICATION_MARKS.map((mark) => [mark.replace(/\s+/g, ""), mark]),
);

const standardCertificationMarkSet = new Set<string>(STANDARD_CERTIFICATION_MARKS);

const searchNamesByCanonicalMark: Partial<Record<StandardCertificationMark, readonly string[]>> = {
  중증장애인생산품: ["중증장애인생산품", "중증 장애인 생산품"],
};

export function normalizeCertificationMark(value: string): string {
  const trimmed = value.trim();
  return canonicalByCompactName.get(trimmed.replace(/\s+/g, "")) ?? trimmed;
}

function expandCertificationMark(value: string): string[] {
  const normalized = normalizeCertificationMark(value);
  const parts = normalized.split("/").map(normalizeCertificationMark).filter(Boolean);

  if (parts.length > 1 && parts.every((part) => standardCertificationMarkSet.has(part))) {
    return parts;
  }

  return normalized ? [normalized] : [];
}

export function uniqueCertificationMarks(names: readonly string[]): string[] {
  const seen = new Set<string>();
  const marks: string[] = [];

  for (const value of names) {
    for (const mark of expandCertificationMark(value)) {
      const key = mark.toLocaleUpperCase("ko-KR");
      if (seen.has(key)) continue;
      seen.add(key);
      marks.push(mark);
    }
  }

  return marks;
}

export function certificationMarkOptions(names: readonly string[]): string[] {
  return uniqueCertificationMarks([...STANDARD_CERTIFICATION_MARKS, ...names]);
}

function compactCertificationName(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleUpperCase("ko-KR")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function relatedCertificationNameOptions(
  options: readonly string[],
  query: string,
): string[] {
  const compactQuery = compactCertificationName(query);
  if (!compactQuery) return [...options];

  return options
    .map((option, index) => {
      const compactOption = compactCertificationName(option);
      let rank = Number.POSITIVE_INFINITY;

      if (compactOption === compactQuery) rank = 0;
      else if (compactOption.startsWith(compactQuery)) rank = 1;
      else if (compactOption.includes(compactQuery)) rank = 2;
      else if (compactQuery.startsWith(compactOption)) rank = 3;
      else if (compactQuery.includes(compactOption)) rank = 4;

      return { option, index, rank };
    })
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map(({ option }) => option);
}

export function certificationMarkSearchNames(marks: readonly string[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const value of marks) {
    for (const canonical of expandCertificationMark(value)) {
      const candidates = searchNamesByCanonicalMark[canonical as StandardCertificationMark] ?? [canonical];
      for (const name of candidates) {
        if (!name) continue;
        const key = name.toLocaleUpperCase("ko-KR");
        if (seen.has(key)) continue;
        seen.add(key);
        names.push(name);
      }
    }
  }

  return names;
}
