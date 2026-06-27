"use client";

import { useState } from "react";
import Link from "next/link";
import { FooterLogo } from "@/components/footer-logo";

const PORTAL_OFFICIAL = [
  { label: "물품 검색", href: "/search" },
  { label: "견적요청", href: "/quotes" },
  { label: "장바구니", href: "/cart" },
  { label: "정보공유", href: "/info" },
];
const PORTAL_SUPPLIER = [
  { label: "대시보드", href: "/partner" },
  { label: "상품관리", href: "/partner/products" },
  { label: "견적대응", href: "/partner/quotes" },
  { label: "판매통계", href: "/partner/sales" },
];
const SUPPORT = ["Tel: 051-291-0265~7", "Fax: 051-203-0178", "서울: 031-421-1081~3", "평일 09:00 ~ 18:00"];

type Term = {
  id: string;
  type: string;
  title: string;
  summary: string;
  content: string;
  required: boolean;
};

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-[19.52px] text-[13px] font-semibold leading-[16.25px] tracking-[-0.364px] text-ink">
      {children}
    </h3>
  );
}

function LinkList({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-[12.2px]">
      {items.map((it) => (
        <li key={it.label}>
          <Link
            href={it.href}
            className="text-[13px] font-normal leading-[23.4px] tracking-[-0.195px] text-ink/50 transition-colors hover:text-ink"
          >
            {it.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TermDetailModal({ term, onClose }: { term: Term; onClose: () => void }) {
  const lines = term.content.split("\n");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-[19.52px] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-[820px] max-w-full flex-col rounded-[19.52px] bg-surface shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line/20 bg-white/95 px-[29.28px] py-[19.52px]">
          <div className="flex items-center gap-[14.64px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[9.76px] bg-navy/10 text-navy">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5M9 13h6M9 17h6" />
              </svg>
            </span>
            <h3 className="text-[15px] font-bold tracking-[-0.42px] text-ink">{term.title}</h3>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-field"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[29.28px] py-[24.4px]">
          {lines.map((ln, i) =>
            /^제\d+조/.test(ln) ? (
              <p key={i} className="mb-1 mt-4 text-[16px] font-bold tracking-[-0.448px] text-ink first:mt-0">
                {ln}
              </p>
            ) : (
              <p key={i} className="mb-1 text-[14px] leading-[25.2px] tracking-[-0.195px] text-ink/70">
                {ln}
              </p>
            ),
          )}
        </div>
        <div className="border-t border-line/20 bg-[#FAFAFA] px-[29.28px] pb-[19.52px] pt-[20.52px]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[14.64px] bg-navy py-[14.64px] text-[13px] font-semibold tracking-[-0.2928px] text-white hover:bg-navy-hover"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);

  async function openTerm(type: "SERVICE" | "PRIVACY") {
    let loaded = terms;
    if (loaded.length === 0) {
      try {
        const res = await fetch("/api/terms?portal=OFFICIAL", { cache: "no-store" });
        const data = await res.json();
        loaded = data.terms ?? [];
        setTerms(loaded);
      } catch {
        return;
      }
    }
    const found = loaded.find((t) => t.type === type);
    if (found) setActiveTerm(found);
  }

  return (
    <footer className="bg-field">
      <div className="px-[24px] py-[78.08px] md:px-[48.8px]">
        <div className="flex flex-col gap-y-[32px] md:flex-row md:gap-x-[48.8px] md:gap-y-0">
          <div className="w-full md:w-[299px]">
            <FooterLogo />
            <div className="flex w-full flex-wrap text-[13px] font-normal leading-[21.125px] tracking-[-0.195px] text-ink/50">
              <span className="w-full">지자체 공공조달의 새로운 표준.</span>
              <span>공무원과 공급업체를 연결하는</span>
              <span>스마트 B2G 플랫폼입니다.</span>
            </div>
          </div>

          <div className="w-full md:w-[299px]">
            <ColumnHeading>공무원 포털</ColumnHeading>
            <LinkList items={PORTAL_OFFICIAL} />
          </div>

          <div className="w-full md:w-[299px]">
            <ColumnHeading>공급업체 포털</ColumnHeading>
            <LinkList items={PORTAL_SUPPLIER} />
          </div>

          <div className="w-full md:w-[299px]">
            <ColumnHeading>고객지원</ColumnHeading>
            <ul className="flex flex-col gap-[12.2px]">
              {SUPPORT.map((label) => (
                <li key={label}>
                  <span className="whitespace-nowrap text-[13px] font-normal leading-[23.4px] tracking-[-0.195px] text-ink/50">
                    {label}
                  </span>
                </li>
              ))}
              <li>
                <Link
                  href="/report?type=신고"
                  className="inline-flex items-center gap-[4.88px] whitespace-nowrap text-[13px] font-normal leading-[23.4px] tracking-[-0.293px] text-[#0071e3]"
                >
                  <img src="/icons/land-footer-report.svg" alt="" aria-hidden="true" width={18} height={18} />
                  신고 / 문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[58.56px] border-t border-line pt-[40.04px]">
          <div className="flex flex-col gap-[14.64px]">
            <div className="flex flex-col">
              <p className="flex items-center text-[12px] leading-[21.6px] tracking-[-0.18px]">
                <span className="whitespace-nowrap font-medium text-ink/60">(주) KORLINK</span>
                <span className="mx-[10px] font-normal text-line">|</span>
                <span className="font-normal text-ink/40">
                  Copyright © 2013 KYUNG KEE COLOR CO., LTD All Rights Reserved.
                </span>
              </p>
              <p className="pt-[7.32px] text-[12px] font-normal leading-[21.6px] tracking-[-0.18px] text-ink/40">
                본사 및 공장: 부산광역시 사하구 을숙도대로 526(신평동) / Tel: 051-291-0265~7 / Fax:
                051-203-0178
              </p>
              <p className="pt-[7.32px] text-[12px] font-normal leading-[21.6px] tracking-[-0.18px] text-ink/40">
                서울사무소: 경기도 수원시 팔달구 효원로 308번길 58-9 112호(인계동, 트윈파크A동) / Tel:
                031-421-1081~3
              </p>
            </div>
            <nav className="flex items-center gap-[19.52px]">
              <button
                type="button"
                onClick={() => openTerm("SERVICE")}
                className="text-[12px] font-normal leading-[21px] tracking-[-0.18px] text-ink/40 hover:text-ink/70"
              >
                이용약관
              </button>
              <button
                type="button"
                onClick={() => openTerm("PRIVACY")}
                className="text-[12px] font-normal leading-[21px] tracking-[-0.18px] text-ink/40 hover:text-ink/70"
              >
                개인정보처리방침
              </button>
            </nav>
          </div>
        </div>
      </div>
      {activeTerm && <TermDetailModal term={activeTerm} onClose={() => setActiveTerm(null)} />}
    </footer>
  );
}
