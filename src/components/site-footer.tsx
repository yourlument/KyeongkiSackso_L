"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FooterLogo } from "@/components/footer-logo";
import { TermContent } from "@/components/term-content";
import { ReportModal, type ReportKind } from "@/components/report-modal";

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
const SUPPORT = ["고객센터 : 010-4875-2022", "이메일 : korlink2026@gmail.com"];

type Term = {
  id: string;
  type: string;
  title: string;
  summary: string;
  content: string;
  contentHtml?: string | null;
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
          <TermContent content={term.content} contentHtml={term.contentHtml} />
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
  const [role, setRole] = useState<string | null>(null);
  const [reportKind, setReportKind] = useState<ReportKind | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { role?: string | null }) => { if (alive) setRole(d?.role ?? null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const officialLinks = role === "SUPPLIER" ? PORTAL_OFFICIAL.filter((l) => l.href !== "/info") : PORTAL_OFFICIAL;

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
            <LinkList items={officialLinks} />
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
                <button
                  type="button"
                  onClick={() => setReportKind("신고")}
                  className="inline-flex cursor-pointer items-center gap-[4.88px] whitespace-nowrap text-[13px] font-normal leading-[23.4px] tracking-[-0.293px] text-[#0071e3]"
                >
                  <img src="/icons/land-footer-report.svg" alt="" aria-hidden="true" width={18} height={18} />
                  신고 / 문의하기
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[58.56px] border-t border-line pt-[40.04px]">
          <div className="flex flex-col gap-[14.64px]">
            <div className="flex flex-col text-[12px] font-normal leading-[21.6px] tracking-[-0.18px] text-ink/40">
              <p>
                <span className="font-medium text-ink/60">대정켐</span>
                <span className="mx-[10px] text-line">|</span>
                <span>대표자 : 김상현</span>
              </p>
              <p>본사 : 부산광역시 사하구 을숙도대로 526</p>
              <p>사업장 주소 : 부산시 해운대구 해운대로38번길 60, 103-3005</p>
              <p>사업자등록번호 : 690-43-00794</p>
              <p>통신판매업신고번호 : 제 2026-부산해운대-1058 호</p>
              <p>고객센터 : 010-4875-2022 | 이메일 : korlink2026@gmail.com</p>
              <p>호스팅 서비스 제공자 : 주식회사 아마존웹서비스(AWS)</p>
              <p className="pt-[14.64px]">
                고객님은 안전거래를 위해 현금 등으로 결제 시 저희 쇼핑몰에서 가입한 NICE정보통신의 구매안전(에스크로) 서비스를 이용하실 수 있습니다.
              </p>
              <p className="pt-[7.32px]">Copyright @ 2026 KORLINK CO., LTD All Rights Reserved.</p>
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
      {reportKind && <ReportModal kind={reportKind} onKind={setReportKind} onClose={() => setReportKind(null)} />}
    </footer>
  );
}
