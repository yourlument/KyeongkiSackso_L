"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NaraSearchResult } from "@/lib/nara";
import { NaraItemList } from "@/components/nara-item-list";

export function HeroSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<NaraSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const term = keyword.trim();
  const showList = open && term.length > 0;

  useEffect(() => {
    if (!open || !term) {
      setResults([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/nara?q=${encodeURIComponent(term)}`, { signal: ac.signal })
        .then((r) => r.json())
        .then((d: { results: NaraSearchResult[] }) => setResults(d.results ?? []))
        .catch(() => {})
        .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(t); ac.abort(); };
  }, [open, term]);

  useEffect(() => {
    if (!showList) return;
    function onPointerDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showList]);

  return (
    <div ref={boxRef} className="relative w-full max-w-[820px]">
      <form
        action="/search"
        className="flex h-[64px] w-full items-center rounded-[19.52px] border border-[#D2D2D7]/40 bg-white p-[1px]"
      >
        <span className="flex h-[59px] w-[59px] flex-none items-center justify-center" aria-hidden="true">
          <img src="/icons/land-hero-search.svg" alt="" width={59} height={59} />
        </span>
        <input
          type="text"
          name="q"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          placeholder="품명, 키워드를 입력하세요"
          aria-label="물품 검색"
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] font-normal leading-[28px] tracking-[-0.293px] text-ink placeholder:font-medium placeholder:text-ink/30 focus:outline-none"
        />
        <div className="flex flex-none items-center px-[9.76px]">
          <button
            type="submit"
            className="rounded-[14.64px] bg-navy px-[24.4px] py-[9.76px] text-[14px] font-semibold leading-[24.5px] tracking-[-0.293px] text-white transition-colors hover:bg-navy-hover"
          >
            검색
          </button>
        </div>
      </form>

      {showList && (
        <div className="absolute left-0 right-0 z-30 text-left" style={{ top: "calc(100% + 9.76px)" }}>
          <NaraItemList
            results={results}
            loading={loading}
            floating
            onPick={(r) => {
              setKeyword(r.name);
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(r.name)}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
