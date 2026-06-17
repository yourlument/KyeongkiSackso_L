import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { CategoryPanel } from "@/components/category-panel";

export const dynamic = "force-dynamic";

async function getPopularProducts() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    take: 12,
    select: {
      id: true,
      name: true,
      price: true,
      supplierCompany: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    companyName: p.supplierCompany.name,
    imageUrl: p.images[0]?.url ?? null,
  }));
}

const KRW = new Intl.NumberFormat("ko-KR");

const NOTICES = [
  { tag: "공지", text: "시스템 정기 점검 안내 (5월 15일)" },
  { tag: "이벤트", text: "신규 입점 업체 수수료 면제 이벤트" },
];
const NOTICE_LIST = [
  { date: "2026-05-12", text: "클레임 처리 프로세스 개편 안내" },
  { date: "2026-05-08", text: "신규 업체 입점 가이드라인 개정 안내" },
];
const STATS = [
  { value: "12,450", unit: "개", label: "등록 상품" },
  { value: "892", unit: "개사", label: "입점 업체" },
  { value: "156", unit: "건", label: "진행 중인 견적" },
  { value: "2,340", unit: "억원", label: "누적 거래액" },
];
const FEATURES = [
  {
    title: "스마트 검색",
    desc: "물품식별번호, 키워드, 카테고리로 즉시 검색. 다중 필터로 정밀하게 찾아보세요.",
    icon: "/icons/land-feat-search.svg",
  },
  {
    title: "견적 매칭",
    desc: "공고 등록부터 선정까지 한 번에. 업체별 제안서를 그리드로 비교 분석하세요.",
    icon: "/icons/land-feat-quote.svg",
  },
  {
    title: "지급대행 결제",
    desc: "법인카드/가상계좌 결제 후 플랫폼이 입점 업체별로 자동 분배합니다.",
    icon: "/icons/land-feat-payment.svg",
  },
  {
    title: "인증 마크 확인",
    desc: "여성기업, 장애인기업, 사회적기업 등 인증 정보를 한눈에 확인하세요.",
    icon: "/icons/land-feat-cert.svg",
  },
  {
    title: "실시간 상담",
    desc: "공고별 1:1 대화와 파일 전송으로 기술 문의를 실시간 응대합니다.",
    icon: "/icons/land-feat-chat.svg",
  },
  {
    title: "통계 대시보드",
    desc: "매출, 견적 채택률, 거래 추이를 시각화 차트로 한눈에 파악하세요.",
    icon: "/icons/land-feat-chart.svg",
  },
];

export default async function HomePage() {
  const products = await getPopularProducts();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />

      <main className="flex-1">
        <section className="flex flex-col items-center bg-surface px-[29.28px] pb-[136.64px] pt-[114.68px] text-center">
          <span className="mb-[24.4px] inline-flex items-center gap-[7.32px] rounded-full bg-field px-[14.64px] py-[4.88px] text-[13px] font-medium leading-[23.4px] tracking-[-0.195px] text-ink/60">
            <img src="/icons/land-hero-badge.svg" alt="" aria-hidden="true" width={11} height={11} />
            지자체 공공조달 플랫폼
          </span>

          <img src="/korlink-logo.svg" alt="KORLINK" className="mb-[19.52px] h-[60px] w-auto" />

          <p className="mb-[48.8px] text-[20px] font-normal leading-[36px] tracking-[-0.3px] text-ink/50">
            공공조달 상품을 더 쉽고 투명하게.
          </p>

          <form
            action="/search"
            className="flex h-[64px] w-full max-w-[820px] items-center rounded-[19.52px] border border-[#D2D2D7]/40 bg-white p-[1px]"
          >
            <span className="flex h-[59px] w-[59px] flex-none items-center justify-center" aria-hidden="true">
              <img src="/icons/land-hero-search.svg" alt="" width={59} height={59} />
            </span>
            <input
              type="text"
              name="q"
              placeholder="물품식별번호, 품명, 키워드를 입력하세요"
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

          <div className="mt-[29.28px] flex items-center gap-[14.64px]">
            <Link
              href="/search"
              className="rounded-[14.64px] bg-field px-[24.4px] py-[9.76px] text-[14px] font-medium leading-[24.5px] tracking-[-0.293px] text-ink/70 transition-colors hover:bg-line/60"
            >
              상품 검색
            </Link>
            <Link
              href="/quote/notices"
              className="rounded-[14.64px] bg-field px-[24.4px] py-[9.76px] text-[14px] font-medium leading-[24.5px] tracking-[-0.293px] text-ink/70 transition-colors hover:bg-line/60"
            >
              견적 공고 보기
            </Link>
          </div>
        </section>

        <section className="bg-surface px-[48.8px] pb-[39.04px]">
          <div className="mx-auto max-w-[1249px]">
            <div className="flex flex-wrap gap-[9.76px]">
              {NOTICES.map((n) => (
                <div
                  key={n.tag}
                  className="flex items-center gap-[9.76px] rounded-[4.88px] border border-[#E5E7EB] bg-white px-[15.64px] py-[8.32px]"
                >
                  <span className="rounded-[4.88px] bg-[#1f2937] px-[7.32px] py-[2.44px] text-[10px] font-medium leading-[18px] tracking-[-0.15px] text-white">
                    {n.tag}
                  </span>
                  <span className="text-[14.64px] font-normal leading-[19.52px] tracking-[-0.2196px] text-[#4b5563]">
                    {n.text}
                  </span>
                  <img src="/icons/land-notice-chevron.svg" alt="" aria-hidden="true" width={15} height={15} />
                </div>
              ))}
            </div>

            <div className="mt-[9.76px] flex items-center gap-[9.76px] rounded-[4.88px] border border-[#E5E7EB] bg-white px-[15.64px] py-[10.76px]">
              <span className="flex-none" aria-hidden="true">
                <img src="/icons/land-cat-empty.svg" alt="" width={15} height={12} className="opacity-60" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-[9.76px]">
                {NOTICE_LIST.map((n) => (
                  <div key={n.date} className="flex items-center gap-[9.76px]">
                    <span className="flex-none text-[10px] font-normal leading-[18px] tracking-[-0.15px] text-[#9ca3af]">
                      {n.date}
                    </span>
                    <span className="truncate text-[14.64px] font-normal leading-[19.52px] tracking-[-0.2196px] text-[#4b5563]">
                      {n.text}
                    </span>
                  </div>
                ))}
              </div>
              <span className="flex-none text-[10px] font-normal leading-[17.5px] tracking-[-0.15px] text-[#9ca3af]">
                전체보기
              </span>
            </div>
          </div>
        </section>

        <section className="bg-navy px-[48.8px] py-[78.08px]">
          <div className="mx-auto flex max-w-[1296px] flex-wrap justify-between gap-y-10">
            {STATS.map((s) => (
              <div key={s.label} className="min-w-[140px] flex-1">
                <div className="flex items-end">
                  <span className="text-[43.92px] font-bold leading-[48.8px] tracking-[-1.098px] text-white">
                    {s.value}
                  </span>
                  <span className="ml-[5px] pb-[2px] text-[21.96px] font-medium leading-[34.16px] tracking-[-0.329px] text-white/50">
                    {s.unit}
                  </span>
                </div>
                <p className="pt-[4.88px] text-[14px] font-normal leading-[25.2px] tracking-[-0.21px] text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface px-[48.8px] py-[97.6px]">
          <div className="mx-auto max-w-[1249px]">
            <div className="mb-[48.8px] flex items-end justify-between">
              <div>
                <p className="mb-[9.76px] text-[12px] font-medium leading-[21.6px] tracking-[1.2px] text-ink/40">
                  Products
                </p>
                <h2 className="text-[32px] font-bold leading-[40px] tracking-[-0.8px] text-ink">
                  인기 상품
                </h2>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-[4px] text-[13px] font-medium leading-[22.75px] tracking-[-0.293px] text-brand"
              >
                전체보기
                <img src="/icons/land-products-arrow.svg" alt="" aria-hidden="true" width={14} height={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-[19.52px] sm:grid-cols-3 lg:grid-cols-6">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group flex flex-col">
                  <div className="mb-[9.76px] aspect-square overflow-hidden rounded-[14.64px] bg-field">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col px-[2.44px]">
                    <p className="mb-[2.44px] truncate text-[11px] font-normal leading-[19.8px] tracking-[-0.165px] text-ink/40">
                      {p.companyName}
                    </p>
                    <p className="line-clamp-2 text-[13px] font-medium leading-[17.875px] tracking-[-0.364px] text-ink">
                      {p.name}
                    </p>
                    <p className="pt-[4.88px] text-[14px] font-semibold leading-[25.2px] tracking-[-0.21px] text-ink">
                      {KRW.format(p.price)}원
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-[48.8px] pb-[97.6px]">
          <div className="mx-auto max-w-[1249px]">
            <div className="mb-[48.8px]">
              <p className="mb-[9.76px] text-[12px] font-medium leading-[21.6px] tracking-[1.2px] text-ink/40">
                Categories
              </p>
              <h2 className="text-[32px] font-bold leading-[40px] tracking-[-0.8px] text-ink">
                카테고리
              </h2>
              <p className="pt-[9.76px] text-[14px] font-normal leading-[25.2px] tracking-[-0.21px] text-ink/50">
                7대분류 · 18중분류 · 112소분류
              </p>
            </div>

            <CategoryPanel />
          </div>
        </section>

        <section className="bg-surface px-[48.8px] py-[97.6px]">
          <div className="mx-auto max-w-[1296px]">
            <div className="mb-[58.56px] text-center">
              <p className="mb-[9.76px] text-[12px] font-medium leading-[21.6px] tracking-[1.2px] text-navy/60">
                Features
              </p>
              <h2 className="text-[32px] font-bold leading-[40px] tracking-[-0.8px] text-ink">
                KORLINK 주요 기능
              </h2>
              <p className="pt-[14.64px] text-[16px] font-normal leading-[28.8px] tracking-[-0.24px] text-ink/50">
                공공조달 업무를 더 쉽고 투명하게
              </p>
            </div>

            <div className="grid grid-cols-1 gap-[19.52px] md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-[19.52px] border border-[#D2D2D7]/10 bg-white p-[30.28px]"
                >
                  <div className="mb-[19.52px] h-[54px] w-[54px] overflow-hidden">
                    <img
                      src={f.icon}
                      alt=""
                      aria-hidden="true"
                      width={54}
                      height={54}
                      className="block"
                      style={{ objectFit: "none", objectPosition: "top", height: 54 }}
                    />
                  </div>
                  <h3 className="mb-[9.76px] text-[16px] font-semibold leading-[20px] tracking-[-0.448px] text-ink">
                    {f.title}
                  </h3>
                  <p className="text-[14px] font-normal leading-[22.75px] tracking-[-0.21px] text-ink/55">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy px-[48.8px] py-[136.64px] text-center">
          <div className="mx-auto flex max-w-[820px] flex-col items-center">
            <h2 className="mb-[19.52px] text-[36px] font-bold leading-[45px] tracking-[-0.9px] text-white">
              지금 바로 입점하세요
            </h2>
            <div className="mb-[48.8px] flex flex-col text-[16px] font-normal leading-[26px] tracking-[-0.24px] text-white/60">
              <span>892개 업체가 함께하는 KORLINK 공공조달 플랫폼.</span>
              <span>간단한 등록으로 수요 기관과 바로 연결됩니다.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-[14.64px]">
              <Link
                href="/signup"
                className="rounded-[14.64px] bg-white px-[39.04px] py-[14.64px] text-[14px] font-semibold leading-[24.5px] tracking-[-0.293px] text-navy transition-opacity hover:opacity-90"
              >
                입점 신청하기
              </Link>
              <Link
                href="/quote/notices"
                className="rounded-[14.64px] border border-white/30 px-[40.04px] py-[15.64px] text-[14px] font-medium leading-[24.5px] tracking-[-0.293px] text-white transition-colors hover:bg-white/10"
              >
                견적 공고 보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <KakaoChat />
    </div>
  );
}

