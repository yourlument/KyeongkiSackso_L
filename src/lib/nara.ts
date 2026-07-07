
export type NaraResult = {
  code: string;
  name: string;
  spec: string | null;
  category: string | null;
};

type RawItem = Record<string, unknown>;

const s = (v: unknown): string => (v == null ? "" : String(v));
const sn = (v: unknown): string | null => {
  const t = s(v).trim();
  return t.length ? t : null;
};

function mapItem(it: RawItem): NaraResult {
  return {
    code: s(it.prdctIdntNo ?? it.prdctClsfcNo ?? it.dtilPrdctClsfcNo ?? ""),
    name: s(it.prdctIdntNoNm ?? it.prdctClsfcNoNm ?? it.dtilPrdctClsfcNoNm ?? it.prdctNm ?? ""),
    spec: sn(it.krnPrdctNm ?? it.prdctSpec ?? it.spec ?? it.stndrdSpec),
    category: sn(it.prdctClsfcNoNm ?? it.clsfcNm ?? it.upPrdctClsfcNoNm),
  };
}

async function fetchNara(extra: Record<string, string>, numOfRows: number): Promise<NaraResult[] | null> {
  const key = process.env.NARA_SERVICE_KEY;
  const base = process.env.NARA_API_URL;
  if (!key || !base) return null;

  try {
    const url = new URL(base);
    url.searchParams.set("serviceKey", key);
    url.searchParams.set("type", "json");
    url.searchParams.set("numOfRows", String(numOfRows));
    url.searchParams.set("pageNo", "1");
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);

    const res = await fetch(url, { signal: AbortSignal.timeout(60000), cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      response?: { body?: { items?: { item?: RawItem[] | RawItem } | RawItem[] } };
    };

    const items = data?.response?.body?.items;
    const list: RawItem[] = Array.isArray(items)
      ? items
      : items?.item
        ? Array.isArray(items.item)
          ? items.item
          : [items.item]
        : [];

    const mapped = list.map(mapItem).filter((r) => r.code && r.name);
    return mapped.length ? mapped : null;
  } catch {
    return null;
  }
}

export async function searchNaraLive(q: string): Promise<NaraResult[] | null> {
  const t = q.trim();
  if (!t) return null;
  const param = /^\d+$/.test(t) ? "prdctIdntNo" : "krnPrdctNm";
  return fetchNara({ [param]: t }, 10);
}

export async function searchNaraByDtil(dtilCode: string, numOfRows = 999): Promise<NaraResult[] | null> {
  const t = dtilCode.trim();
  if (!t) return null;
  return fetchNara({ dtilPrdctClsfcNo: t }, numOfRows);
}

export async function searchNaraByKeyword(keyword: string, numOfRows = 999): Promise<NaraResult[] | null> {
  const t = keyword.trim();
  if (!t) return null;
  return fetchNara({ krnPrdctNm: t }, numOfRows);
}
