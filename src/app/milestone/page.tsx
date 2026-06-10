import Link from "next/link";

export const metadata = {
  title: "KORLINK — 개발 일정 (마일스톤)",
};

type Status = "done" | "active" | "todo";

interface Day {
  date: string;
  dow: string;
  group: string;
  title: string;
  status: Status;
}

const TODAY = "6/9";

const SCHEDULE: Day[] = [
  { date: "6/4", dow: "목", group: "A 인증", title: "로그인·회원가입(공무원/공급사)·계정찾기 1차 구현 + 배포", status: "done" },
  { date: "6/5", dow: "금", group: "A·B", title: "인증 디테일(Figma 픽셀) 마감 + 랜딩 + 물품검색", status: "done" },
  { date: "6/6", dow: "토", group: "B 공무원", title: "상품 상세·장바구니·구매", status: "done" },
  { date: "6/7", dow: "일", group: "B 공무원", title: "견적요청(작성·상세·응답·비교) + 수요게시판 + 최초 배포(라이브)", status: "done" },
  { date: "6/8", dow: "월", group: "B 공무원", title: "견적 비교·응답확인 디테일 + 전 화면 Figma 픽셀 마감", status: "done" },
  { date: "6/9", dow: "화", group: "C 공급", title: "공급업체 포털 전체(대시보드·상품관리·견적대응·주문·이용권·매출·정산·인증·프로필) Figma 픽셀 구현 + 배포", status: "active" },
  { date: "6/10", dow: "수", group: "B 공무원", title: "정보공유 게시판", status: "done" },
  { date: "6/11", dow: "목", group: "E 공통", title: "마이페이지 ①", status: "done" },
  { date: "6/12", dow: "금", group: "E 공통", title: "마이페이지 ② + 소식·신고", status: "done" },
  { date: "6/13", dow: "토", group: "C 공급", title: "대시보드 + 상품관리 ①(등록/이미지)", status: "done" },
  { date: "6/14", dow: "일", group: "C 공급", title: "상품관리 ②(목록/재고) + 인증서류", status: "done" },
  { date: "6/15", dow: "월", group: "C 공급", title: "견적 대응", status: "done" },
  { date: "6/16", dow: "화", group: "C 공급", title: "주문 + 판매통계", status: "done" },
  { date: "6/17", dow: "수", group: "C 공급", title: "정산 + 프로필", status: "done" },
  { date: "6/18", dow: "목", group: "D 관리자", title: "회원/입점심사", status: "todo" },
  { date: "6/19", dow: "금", group: "D 관리자", title: "회원관리 + 콘텐츠/배너", status: "todo" },
  { date: "6/20", dow: "토", group: "D 관리자", title: "거래·결제·정산 관리", status: "todo" },
  { date: "6/21", dow: "일", group: "D 관리자", title: "수익 + 신고/문의 + 공지 → 관리자 마감", status: "todo" },
  { date: "6/22", dow: "월", group: "연동", title: "결제·파일 업로드(사업자등록증 등)·인앱 알림", status: "todo" },
  { date: "6/23", dow: "화", group: "연동", title: "세션(자동로그인/로그아웃)·역할별 권한 보강", status: "todo" },
  { date: "6/24~7/3", dow: "수~금", group: "마무리", title: "통합 테스트 · 버그픽스 · 지연 흡수 버퍼 · 최초 배포(고객 서버) · 검수 대응/인수인계", status: "todo" },
];

const GROUPS = [
  { key: "A", name: "인증", status: "done" as Status, span: "6/4~6/5", desc: "로그인·회원가입·계정찾기" },
  { key: "B", name: "공무원 포털", status: "active" as Status, span: "6/6~6/10", desc: "물품검색·상품상세·견적요청·구매·수요게시판·정보공유" },
  { key: "C", name: "공급업체 포털", status: "done" as Status, span: "6/13~6/17", desc: "대시보드·상품관리·견적대응·주문·이용권·매출·정산·인증·프로필" },
  { key: "D", name: "관리자", status: "active" as Status, span: "6/18~6/21", desc: "회원·입점심사·상품·거래·정산·공지" },
  { key: "E", name: "공통", status: "done" as Status, span: "6/11~6/12", desc: "마이페이지·소식·신고" },
];

const STATUS_STYLE: Record<Status, { label: string; cls: string; dot: string }> = {
  done: { label: "완료", cls: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]", dot: "bg-[#10B981]" },
  active: { label: "진행중", cls: "bg-[#EFF6FF] text-navy border-navy/30", dot: "bg-navy" },
  todo: { label: "예정", cls: "bg-field text-ink/50 border-line", dot: "bg-line" },
};

export default function MilestonePage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-[60px] max-w-[960px] items-center justify-between px-6">
          <Link href="/" className="flex items-center">

            <img src="/korlink-logo.svg" alt="KORLINK" className="h-6 w-auto" />
          </Link>
          <span className="text-[13px] font-medium tracking-[-0.2px] text-ink/60">개발 일정 (마일스톤)</span>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-6 py-10">

        <section className="rounded-[16px] border border-line bg-surface p-7">
          <h1 className="text-[22px] font-bold tracking-[-0.5px] text-ink">KORLINK 개발 일정</h1>
          <p className="mt-1 text-[14px] tracking-[-0.2px] text-ink/50">
            지자체 B2G 공공조달 플랫폼 · 계약 기간 2026-06-04 ~ 07-03 (30일)
          </p>

          <div className="mt-5 flex items-center gap-2 rounded-[12px] border border-navy/20 bg-[#EFF6FF] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-navy" />
            <span className="text-[14px] font-medium tracking-[-0.2px] text-ink">
              현재 단계: <span className="font-bold text-navy">C. 공급업체 포털</span> Figma 픽셀 구현 완료(일정 선행) — <span className="font-bold text-navy">D. 관리자 포털</span> 착수. 공무원·공통(마이페이지·소식·신고) 영역 마감 완료
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {GROUPS.map((g) => {
              const s = STATUS_STYLE[g.status];
              return (
                <div key={g.key} className="rounded-[12px] border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-ink">{g.key}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium tracking-[-0.2px] text-ink">{g.name}</p>
                  <p className="mt-1 text-[11px] leading-[16px] text-ink/40">{g.desc}</p>
                  <p className="mt-1 text-[11px] font-medium text-ink/50">{g.span}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold tracking-[-0.3px] text-ink">일자별 일정</h2>
          <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
            {SCHEDULE.map((d, i) => {
              const s = STATUS_STYLE[d.status];
              const today = d.date === TODAY;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 border-b border-line/60 px-5 py-3.5 last:border-b-0 ${
                    today ? "bg-[#EFF6FF]" : ""
                  }`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                  <div className="w-[92px] shrink-0">
                    <span className="text-[13px] font-semibold text-ink">{d.date}</span>
                    <span className="ml-1 text-[12px] text-ink/40">{d.dow}</span>
                  </div>
                  <span className="w-[78px] shrink-0 text-[12px] font-medium text-ink/50">{d.group}</span>
                  <span className="flex-1 text-[13px] tracking-[-0.2px] text-ink">{d.title}</span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
