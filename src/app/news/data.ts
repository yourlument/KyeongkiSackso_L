export type NewsCategory = "공지" | "이벤트";

export type NewsItem = {
  id: number;
  category: NewsCategory;
  title: string;
  date: string;
  pinned?: boolean;
  hasMedia?: boolean;
  hasAttachment?: boolean;
};

export const NEWS: NewsItem[] = [
  { id: 1, category: "공지", title: "시스템 정기 점검 안내 (5월 15일)", date: "2026-05-10", pinned: true, hasAttachment: true },
  { id: 2, category: "공지", title: "신규 업체 입점 가이드라인 개정 안내", date: "2026-05-08", hasMedia: true, hasAttachment: true },
  { id: 3, category: "공지", title: "견적 공고 등록 시 주의사항", date: "2026-05-05" },
  { id: 4, category: "이벤트", title: "신규 입점 업체 수수료 면제 이벤트", date: "2026-05-01", pinned: true, hasMedia: true, hasAttachment: true },
  { id: 5, category: "이벤트", title: "화성시청 단체 구매 특별 프로모션", date: "2026-05-03" },
  { id: 6, category: "공지", title: "클레임 처리 프로세스 개편 안내", date: "2026-05-12" },
  { id: 7, category: "공지", title: "KORLINK 서비스 이용 약관 개정 안내 (2026.06.01 시행)", date: "2026-05-07" },
  { id: 8, category: "공지", title: "모바일 앱 출시 안내 (iOS/Android)", date: "2026-05-06" },
  { id: 9, category: "공지", title: "2026 상반기 고질 납품 업체 인증 발표", date: "2026-05-03" },
  { id: 10, category: "공지", title: "업체 승인 프로세스 간소화 안내", date: "2026-05-02" },
];

export const NEWS_TAB_COUNTS = { 전체: 16, 공지: 11, 이벤트: 5 } as const;

export type Attachment = { name: string; size: string };

export type NewsDetail = {
  author: string;
  views: number;
  body: string;
  attachments: Attachment[];
};

export const NEWS_DETAILS: Record<number, NewsDetail> = {
  2: {
    author: "KORLINK 관리자",
    views: 856,
    body:
      "2026년 6월 1일부터 신규 공급업체 입점 심사 기준이 개정됩니다.\n\n" +
      "[주요 변경사항]\n" +
      "1. 사업자등록증 유효기간 확인 강화\n" +
      "2. 보유 인증서의 최신성 확인 (발급 3년 이내)\n" +
      "3. 정산 계좌 인증 필수화\n" +
      "4. 대표자 실명 확인 절차 추가\n\n" +
      "기존 입점 업체는 해당 변경사항의 적용을 받지 않으나, 인증서 갱신 시에는 새로운 기준이 적용됩니다.",
    attachments: [
      { name: "신규_업체_입점_심사_가이드라인_v3.pdf", size: "5.0 MB" },
      { name: "입점_신청_구비서류_체크리스트.xlsx", size: "439.5 KB" },
      { name: "정산계좌_인증_절차_안내.pdf", size: "2.0 MB" },
    ],
  },
};

export function prevNext(id: number): { prev?: NewsItem; next?: NewsItem } {
  const i = NEWS.findIndex((n) => n.id === id);
  if (i < 0) return {};
  return { prev: NEWS[i - 1], next: NEWS[i + 1] };
}
