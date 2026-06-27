"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";

const SORT_OPTIONS = [
  { value: "relevance", label: "관련도순" },
  { value: "latest", label: "최신순" },
  { value: "priceLow", label: "낮은 가격순" },
  { value: "priceHigh", label: "높은 가격순" },
] as const;
type SortKey = "relevance" | "latest" | "priceLow" | "priceHigh";

type CatNode = { id: string; name: string; children?: CatNode[] };

function findCatPath(tree: CatNode[], id: string): string[] {
  for (const t of tree) {
    if (t.id === id) return [t.id];
    for (const m of t.children ?? []) {
      if (m.id === id) return [t.id, m.id];
      for (const l of m.children ?? []) if (l.id === id) return [t.id, m.id, l.id];
    }
  }
  return [];
}

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string | null;
  npsCode: string | null;
  rating: number | null;
  reviewCount: number | null;
  badges: string[];
  categoryId: string | null;
  categoryName: string | null;
  supplierName: string;
  imageUrl: string | null;
};

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

const S_FIELD: React.CSSProperties = {
  border: "1px solid rgba(210,210,215,0.3)",
  borderRadius: "14.64px",
  backgroundColor: "#FFFFFF",
};
const S_FILTER_BTN: React.CSSProperties = {
  border: "1px solid rgba(30,58,95,0.3)",
  borderRadius: "14.64px",
  backgroundColor: "rgba(30,58,95,0.05)",
};
const DIVIDER = "1px solid rgba(210,210,215,0.2)";

const S_CHIP: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "2.44px 7.32px",
  borderRadius: "7.32px",
  backgroundColor: "rgba(29,29,31,0.05)",
  whiteSpace: "nowrap" as const,
};

function SearchInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [keyword, setKeyword] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [sort, setSort] = useState<SortKey>(
    (params.get("sort") as SortKey) ?? "relevance"
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catTree, setCatTree] = useState<CatNode[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/categories", { signal: ac.signal })
      .then((r) => r.json())
      .then((d: { categories: CatNode[] }) => setCatTree(d.categories ?? []))
      .catch(() => {  });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const q = params.get("q") ?? "";
    const cat = params.get("category") ?? "";
    const s = (params.get("sort") as SortKey) ?? "relevance";
    setKeyword(q);
    setCategory(cat);
    setSort(s);

    const ac = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (cat) qs.set("category", cat);
    if (s && s !== "relevance") qs.set("sort", s);
    fetch(`/api/products/search?${qs.toString()}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data: { results: Product[] }) => setProducts(data.results ?? []))
      .catch(() => {  })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [params]);

  function pushParams(next: { q?: string; category?: string; sort?: SortKey }) {
    const qs = new URLSearchParams();
    const q = next.q !== undefined ? next.q : keyword;
    const cat = next.category !== undefined ? next.category : category;
    const s = next.sort !== undefined ? next.sort : sort;
    if (q) qs.set("q", q);
    if (cat) qs.set("category", cat);
    if (s && s !== "relevance") qs.set("sort", s);
    router.push(`/search${qs.toString() ? `?${qs.toString()}` : ""}`);
  }

  const visible = useMemo(() => {
    const lo = minPrice ? Number(minPrice.replace(/[^\d]/g, "")) : null;
    const hi = maxPrice ? Number(maxPrice.replace(/[^\d]/g, "")) : null;
    return products.filter((p) => {
      if (lo !== null && p.price < lo) return false;
      if (hi !== null && p.price > hi) return false;
      return true;
    });
  }, [products, minPrice, maxPrice]);

  const count = visible.length;

  const [topId, midId, leafId] = useMemo(() => {
    const p = findCatPath(catTree, category);
    return [p[0] ?? "", p[1] ?? "", p[2] ?? ""];
  }, [catTree, category]);
  const topNode = catTree.find((t) => t.id === topId);
  const midNode = topNode?.children?.find((m) => m.id === midId);

  function selectCategory(id: string) {
    setCategory(id);
    pushParams({ category: id });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />

      <div style={{ borderBottom: DIVIDER, backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto w-full max-w-[1440px] px-[95.36px]">
          <div className="flex items-center px-[48.8px] py-[24.4px]" style={{ gap: "14.64px" }}>

            <form
              onSubmit={(e) => { e.preventDefault(); pushParams({ q: keyword }); }}
              className="flex flex-1 items-center"
              style={S_FIELD}
            >
              <button
                type="submit"
                aria-label="검색"
                className="flex h-[54px] w-[54px] shrink-0 items-center justify-center"
              >
                <img src="/icons/srch-search.svg" alt="" width={18} height={19} aria-hidden="true" />
              </button>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="물품식별번호, 품명, 키워드를 입력하세요"
                aria-label="검색어"
                className="search-input flex-1 bg-transparent outline-none"
                style={{
                  padding: "12.19px 20.52px 12.19px 0",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "24.5px",
                  letterSpacing: "-0.29px",
                  color: "#1D1D1F",
                }}
              />
            </form>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="flex shrink-0 items-center transition-opacity hover:opacity-80"
              style={{
                ...S_FILTER_BTN,
                gap: "7.32px",
                padding: "13.2px 20.52px",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "22.75px",
                letterSpacing: "-0.29px",
                color: "#1E3A5F",
              }}
            >
              <img src="/icons/srch-filter.svg" alt="" width={11} height={11} aria-hidden="true" />
              필터
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
      <div style={{ borderBottom: DIVIDER, backgroundColor: "#FFFFFF" }}>
        <div className="mx-auto w-full max-w-[1440px] px-[95.36px]">
          <div className="flex flex-wrap items-center px-[48.8px] py-[24.4px]" style={{ gap: "14.64px" }}>

            <div className="relative" style={{ width: "219px", height: "49px" }}>
              <select
                value={topId}
                onChange={(e) => selectCategory(e.target.value)}
                aria-label="대분류"
                className="h-full w-full cursor-pointer appearance-none outline-none"
                style={{ ...S_FIELD, padding: "13.2px 34px 13.2px 15.64px", fontSize: "13px", fontWeight: 400, lineHeight: "19px", letterSpacing: "-0.29px", color: "#1D1D1F" }}
              >
                <option value="">전체 대분류</option>
                {catTree.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <img src="/icons/srch-chevron.svg" alt="" width={8} height={4} aria-hidden="true"
                className="pointer-events-none absolute right-[15.64px] top-1/2 -translate-y-1/2" />
            </div>

            <div className="relative" style={{ width: "219px", height: "49px", opacity: topNode ? 1 : 0.5 }}>
              <select
                disabled={!topNode}
                value={midId}
                onChange={(e) => selectCategory(e.target.value || topId)}
                aria-label="중분류"
                className={`h-full w-full appearance-none outline-none ${topNode ? "cursor-pointer" : "cursor-not-allowed"}`}
                style={{ ...S_FIELD, padding: "13.2px 34px 13.2px 15.64px", fontSize: "13px", fontWeight: 400, lineHeight: "19px", letterSpacing: "-0.29px", color: topNode ? "#1D1D1F" : "rgba(29,29,31,0.5)" }}
              >
                <option value="">전체 중분류</option>
                {topNode?.children?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <img src="/icons/srch-chevron.svg" alt="" width={8} height={4} aria-hidden="true"
                className="pointer-events-none absolute right-[15.64px] top-1/2 -translate-y-1/2" />
            </div>

            <div className="relative" style={{ width: "219px", height: "49px", opacity: midNode ? 1 : 0.5 }}>
              <select
                disabled={!midNode}
                value={leafId}
                onChange={(e) => selectCategory(e.target.value || midId)}
                aria-label="소분류"
                className={`h-full w-full appearance-none outline-none ${midNode ? "cursor-pointer" : "cursor-not-allowed"}`}
                style={{ ...S_FIELD, padding: "13.2px 34px 13.2px 15.64px", fontSize: "13px", fontWeight: 400, lineHeight: "19px", letterSpacing: "-0.29px", color: midNode ? "#1D1D1F" : "rgba(29,29,31,0.5)" }}
              >
                <option value="">전체 소분류</option>
                {midNode?.children?.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <img src="/icons/srch-chevron.svg" alt="" width={8} height={4} aria-hidden="true"
                className="pointer-events-none absolute right-[15.64px] top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center" style={{ gap: "9.76px" }}>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="최소가격"
                aria-label="최소가격"
                className="price-input outline-none"
                style={{ ...S_FIELD, width: "93px", height: "49px", padding: "13.2px 15.64px", fontSize: "13px", fontWeight: 400, lineHeight: "22.8px", letterSpacing: "-0.29px", color: "#1D1D1F" }}
              />
              <span style={{ fontSize: "19.52px", fontWeight: 400, lineHeight: "35.1px", letterSpacing: "-0.29px", color: "rgba(29,29,31,0.3)" }}>~</span>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                placeholder="최대가격"
                aria-label="최대가격"
                className="price-input outline-none"
                style={{ ...S_FIELD, width: "93px", height: "49px", padding: "13.2px 15.64px", fontSize: "13px", fontWeight: 400, lineHeight: "22.8px", letterSpacing: "-0.29px", color: "#1D1D1F" }}
              />
            </div>

            <div className="relative" style={{ width: "219px", height: "49px" }}>
              <select
                value={sort}
                onChange={(e) => { const s = e.target.value as SortKey; setSort(s); pushParams({ sort: s }); }}
                aria-label="정렬"
                className="h-full w-full cursor-pointer appearance-none outline-none"
                style={{ ...S_FIELD, padding: "13.2px 34px 13.2px 15.64px", fontSize: "13px", fontWeight: 400, lineHeight: "19px", letterSpacing: "-0.29px", color: "#1D1D1F" }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <img src="/icons/srch-chevron.svg" alt="" width={8} height={4} aria-hidden="true"
                className="pointer-events-none absolute right-[15.64px] top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>
      )}

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-[95.36px]">
          <div className="px-[48.8px] py-[39.04px]">

            <div className="flex items-center" style={{ marginBottom: "29.28px", fontSize: "14px", lineHeight: "25.2px", letterSpacing: "-0.21px" }}>
              <span style={{ fontWeight: 600, color: "rgba(29,29,31,1)" }}>{count}</span>
              <span style={{ fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>개의 결과</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gap: "39.04px 24.4px" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex flex-col" style={{ width: "100%", maxWidth: "211px" }}>
                    <div className="animate-pulse" style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: "19.52px", backgroundColor: "rgba(29,29,31,0.05)" }} />
                    <div className="animate-pulse" style={{ marginTop: "14.64px", height: "16px", width: "55%", borderRadius: "7.32px", backgroundColor: "rgba(29,29,31,0.05)" }} />
                    <div className="animate-pulse" style={{ marginTop: "8px", height: "38px", width: "100%", borderRadius: "7.32px", backgroundColor: "rgba(29,29,31,0.05)" }} />
                    <div className="animate-pulse" style={{ marginTop: "8px", height: "22px", width: "60%", borderRadius: "7.32px", backgroundColor: "rgba(29,29,31,0.05)" }} />
                    <div className="animate-pulse" style={{ marginTop: "8px", height: "27px", width: "70%", borderRadius: "7.32px", backgroundColor: "rgba(29,29,31,0.05)" }} />
                    <div className="animate-pulse" style={{ marginTop: "7.32px", height: "23px", width: "80%", borderRadius: "7.32px", backgroundColor: "rgba(29,29,31,0.05)" }} />
                  </div>
                ))}
              </div>
            ) : count === 0 ? (
              <div className="flex flex-col items-center justify-center py-[120px]" style={{ gap: "12px" }}>
                <img src="/icons/srch-search.svg" alt="" width={40} height={40} style={{ opacity: 0.4 }} aria-hidden="true" />
                <span style={{ fontSize: "14px", lineHeight: "25.2px", letterSpacing: "-0.21px", fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>검색 결과가 없습니다.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gap: "39.04px 24.4px" }}>
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
      <KakaoChat />
    </div>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link href={`/products/${p.id}`} className="group flex flex-col" style={{ width: "100%", maxWidth: "211px" }}>

      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "19.52px",
          backgroundColor: "rgba(29,29,31,0.05)",
          marginBottom: "14.64px",
          flexShrink: 0,
        }}
      >
        {p.imageUrl && (
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            sizes="211px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div style={{ paddingBottom: "4.88px" }}>
        <div className="flex flex-wrap" style={{ gap: "7.32px" }}>
          {p.npsCode && (
            <span style={{ ...S_CHIP }}>
              <span style={{ fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: "rgba(29,29,31,0.4)" }}>
                {p.npsCode}
              </span>
            </span>
          )}
        </div>
      </div>

      <div style={{ paddingBottom: "4.88px" }}>
        <p
          className="line-clamp-2"
          style={{
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "19.25px",
            letterSpacing: "-0.39px",
            color: "rgba(29,29,31,1)",
          }}
        >
          {p.name}
        </p>
      </div>

      {(p.rating !== null || p.reviewCount !== null) && (
        <div style={{ paddingBottom: "7.32px" }}>
          <div className="flex items-center" style={{ gap: "4.88px" }}>
            {p.rating !== null && (
              <>
                <img src="/icons/srch-star.svg" alt="" width={9} height={9} aria-hidden="true" />
                <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)" }}>
                  {p.rating.toFixed(1)}
                </span>
              </>
            )}
            {p.reviewCount !== null && (
              <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.3)" }}>
                ({p.reviewCount})
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-baseline">
        <span style={{ fontSize: "15px", fontWeight: 600, lineHeight: "27px", letterSpacing: "-0.225px", color: "rgba(29,29,31,1)" }}>
          {formatPrice(p.price)}원
        </span>
        {p.unit && (
          <span style={{ marginLeft: "5px", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}>
            /{p.unit}
          </span>
        )}
      </div>

      {p.badges.length > 0 && (
        <div style={{ paddingTop: "7.32px" }}>
          <div className="flex flex-wrap" style={{ gap: "4.88px" }}>
            {p.badges.map((badge) => (
              <span key={badge} style={{ ...S_CHIP }}>
                <span style={{ fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: "rgba(29,29,31,0.5)" }}>
                  {badge}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ paddingTop: "7.32px" }}>
        <div className="flex items-center" style={{ gap: "4.88px" }}>
          <img src="/icons/srch-building.svg" alt="" width={10} height={9} aria-hidden="true" className="shrink-0" />
          <span
            className="truncate"
            style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}
          >
            {p.supplierName}
          </span>
        </div>
      </div>

    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <SearchInner />
    </Suspense>
  );
}
