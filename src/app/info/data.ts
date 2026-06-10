export type Category =
  | "실무자 놀이터"
  | "업체후기"
  | "구매/용역 정보"
  | "서식/자료 공유"
  | "감사 대응/사례"
  | "민원 대응/사례"
  | "긴급 공유";

export const CATEGORIES: Category[] = [
  "실무자 놀이터",
  "업체후기",
  "구매/용역 정보",
  "서식/자료 공유",
  "감사 대응/사례",
  "민원 대응/사례",
  "긴급 공유",
];

export const CATEGORY_DESC: Record<Category, string> = {
  "실무자 놀이터": "행복하고 재미있고 힘들고, 화나고, 피곤하고, 지겨울때 무엇이든 말하고 소통해요",
  "업체후기": "업체정보, 추천, 거래사례 공유해요",
  "구매/용역 정보": "물품구매, 용역관련 정보공유해요",
  "서식/자료 공유": "업무관련 서류/자료 정보 무엇이든 공유해요",
  "감사 대응/사례": "이거 감사 걸릴까요? 지적사례, 예방/대응법 공유해요",
  "민원 대응/사례": "각종민원 대응 노하우, 애로사항 공유해요",
  "긴급 공유": "정부정책, 시스템장애, 천재지변, 각종 비상사태 등 실시간 이슈를 공유해요",
};

export type Post = {
  id: number;
  category: Category;
  date: string;
  title: string;
  excerpt: string;
  author: string;
  comments: number;
  views: number;
  likes: number;
  dislikes: number;
  mine?: boolean;
};

export type HotPost = {
  rank: number;
  title: string;
  comments: number;
  attachments: number;
  author: string;
  date: string;
  likes: number;
  views: number;
};

export const HOT_POSTS: HotPost[] = [
  { rank: 1, title: "경기도 조달 업무 공통 서식 모음 공유", comments: 234, attachments: 6, author: "익명", date: "2026-04-10", likes: 234, views: 3241 },
  { rank: 2, title: "청사 에너지 효율화 공사 후기 (태양광 패널)", comments: 198, attachments: 7, author: "익명", date: "2026-04-05", likes: 198, views: 2890 },
  { rank: 3, title: "2026년 조달 담당자 교육 일정 안내", comments: 178, attachments: 5, author: "익명", date: "2026-04-08", likes: 178, views: 2456 },
  { rank: 4, title: "견적요청 시 가격 비교 노하우", comments: 156, attachments: 5, author: "익명", date: "2026-04-28", likes: 156, views: 2341 },
  { rank: 5, title: "공공기관 청사 보안 카메라 교체 시 유의사항", comments: 145, attachments: 4, author: "익명", date: "2026-04-22", likes: 145, views: 2134 },
];

export const POSTS: Post[] = [
  { id: 1, category: "감사 대응/사례", date: "2026-05-17", title: "낙찰 재품질 요청 트리블맵 및 대응방법", excerpt: "낙찰 업체의 재품질/구성품목 편닥 케이스 모음과 대응 방법 공유. 나라장터 리뷰 등록 대비 로직도 소개합니다.", author: "익명", comments: 678, views: 2, likes: 53, dislikes: 0 },
  { id: 2, category: "서식/자료 공유", date: "2026-05-16", title: "낙찰 업체 신용 확인 방법 실무 노하우", excerpt: "업체 신용제도 조회 방법과 재무 안정성 확인에 있어 활용하는 방법을 공유합니다. 신용평가스, 나이스평가정보, 국세완납증명서 요청 좋습니다.", author: "익명", comments: 534, views: 1, likes: 42, dislikes: 0 },
  { id: 3, category: "업체후기", date: "2026-05-16", title: "2026년 상반기 고양시 주요 조달 납품 추요 업체 정리", excerpt: "납품 실적 기준 추창하는 업체 목록입니다. 배송/납품일 준수가 중요하며 한번 난제 생기면 나라장터 무실적 등록 대상 되니 주의하세요.", author: "익명", comments: 789, views: 3, likes: 64, dislikes: 0 },
  { id: 4, category: "업체후기", date: "2026-05-15", title: "용인시 IT 입찰업체 AS 경험담", excerpt: "PC 구매 이후 꼬나 두 달만에 겪은 AS 문제와 방문 AS 신청 경험을 공유합니다. 컨트레프트 시 조건을 반드시 선확인하세요.", author: "익명", comments: 712, views: 2, likes: 58, dislikes: 0 },
  { id: 5, category: "업체후기", date: "2026-05-15", title: "고양시청 내부 권장 미화 공사 업체 평판 공유", excerpt: "내부 쿨스쿤 및 권장 미화 공사 납품이 좋았던 업체들 정보입니다. 마감재 대리서 나올 때 다시 평가해보세요.", author: "익명", comments: 412, views: 1, likes: 33, dislikes: 0 },
  { id: 6, category: "업체후기", date: "2026-05-14", title: "지자체 헬스케어 용품 납품 업체 평판", excerpt: "사무용 위생마스크, 소독제 등 보건소 공용 의료/위생 용품 납품 실적이 좋은 업체 정보 공유합니다.", author: "익명", comments: 289, views: 0, likes: 22, dislikes: 0 },
  { id: 7, category: "구매/용역 정보", date: "2026-05-14", title: "고양시 LED 조명 납품 체크리스트 및 주의사항", excerpt: "LED조명기구 납품 시 반드시 확인해야 할 항목들 공유합니다.주요 체크 항목:1. KS C 7613 국내 규격 적합 확인2. 조도 측정값 (lux 기준)3. 주광색도 수치 (Ra 기준)4. 에너지효율 등급 (예: 1등급, 2등급)5. 수명 확인 (30,000시간 이상)6. 전기 안전 인증서 (KC 마크)", author: "익명", comments: 534, views: 2, likes: 41, dislikes: 0 },
  { id: 8, category: "구매/용역 정보", date: "2026-05-13", title: "보건소 의료기기 납품 검수 체크리스트", excerpt: "상완식 혈압계, 체온계, 찬수스쿤 등 보건소 의료기기 검수 체크리스트 공유합니다.검수 항목:1. 제조사 정품 천안 유무 (한국어 설명서)2. 의료기기 허가당당 인증 서류3. 캘리브레이션 맞음 확인4. 보증대 개수 및 항목 비시5. 기기병력부 목록 등록 여부", author: "익명", comments: 456, views: 2, likes: 38, dislikes: 0 },
  { id: 9, category: "업체후기", date: "2026-05-12", title: "수원시 주요 조달 업체 납품 평판 공유", excerpt: "글쓰기는 어렵고 다들 있으실테지만 왜와 납품 까지 잘해주는 업체들 정보를 공유합니다.수원시 기준 독자성 주요 납품업체 평판:- IT 장비 : 디지털솔루션(주), 오피스텍(주) → 납기 준수율 95%- 소방장비 : 안전소방(주) → 품질 먹임- 사무가구: 에듀퍼니처(주) → 인도 조건 독독펜 확인 필요", author: "익명", comments: 345, views: 1, likes: 28, dislikes: 0 },
  { id: 10, category: "구매/용역 정보", date: "2026-05-10", title: "IT 장비 납품 후 AS 기간 표준 안내", excerpt: "PC, 프린터 등 IT장비 납품 후 무상 AS 요청 가능 기간 기준을 공유합니다.정신적 영역 안내:- PC/노트북: 납품일부터 36개월 이내 무상- 프린터: 24개월 이내 제조사 A/S, 드럼 부품 제외- 네트워크 장비: 12개월, 트래픽 미러링/설정 변경 별도 청구방문 A/S는 납품 3일 이내 무료 단 1회 조건, 이후는 유상 도요일/일요일 제외 콘트록 조항 활용.", author: "익명", comments: 890, views: 1, likes: 72, dislikes: 0, mine: true },
];
