import Link from "next/link";

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

export function SiteFooter() {
  return (
    <footer className="bg-field">
      <div className="px-[48.8px] py-[78.08px]">

        <div className="flex gap-x-[48.8px]">

          <div className="w-[299px]">

            <img src="/korlink-logo.svg" alt="KORLINK" className="mb-[19.52px] h-9 w-auto" />

            <div className="flex w-full flex-wrap text-[13px] font-normal leading-[21.125px] tracking-[-0.195px] text-ink/50">
              <span className="w-full">지자체 공공조달의 새로운 표준.</span>
              <span>공무원과 공급업체를 연결하는</span>
              <span>스마트 B2G 플랫폼입니다.</span>
            </div>
          </div>

          <div className="w-[299px]">
            <ColumnHeading>공무원 포털</ColumnHeading>
            <LinkList items={PORTAL_OFFICIAL} />
          </div>

          <div className="w-[299px]">
            <ColumnHeading>공급업체 포털</ColumnHeading>
            <LinkList items={PORTAL_SUPPLIER} />
          </div>

          <div className="w-[299px]">
            <ColumnHeading>고객지원</ColumnHeading>
            <ul className="flex flex-col gap-[12.2px]">
              {SUPPORT.map((label) => (
                <li key={label}>
                  <span className="text-[13px] font-normal leading-[23.4px] tracking-[-0.195px] text-ink/50">
                    {label}
                  </span>
                </li>
              ))}
              <li>

                <Link
                  href="/report?type=신고"
                  className="inline-flex items-center gap-[4.88px] text-[13px] font-normal leading-[23.4px] tracking-[-0.293px] text-[#0071e3]"
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
                <span className="font-medium text-ink/60">(주) KORLINK</span>
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

              <span className="text-[12px] font-normal leading-[21px] tracking-[-0.18px] text-ink/40">
                이용약관
              </span>
              <span className="text-[12px] font-normal leading-[21px] tracking-[-0.18px] text-ink/40">
                개인정보처리방침
              </span>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
