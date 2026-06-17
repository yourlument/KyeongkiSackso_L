
export const OFFICIAL_TABS = [
  { key: "info", label: "내 정보 관리" },
  { key: "purchase", label: "구매 관리" },
  { key: "quote", label: "견적 요청 관리" },
  { key: "demand", label: "수요 게시판 글" },
  { key: "infoshare", label: "정보공유 게시판 글" },
  { key: "inquiry", label: "문의/신고 내역" },
  { key: "alarm", label: "알림 설정" },
  { key: "withdraw", label: "회원 탈퇴" },
] as const;
export type OfficialTabKey = (typeof OFFICIAL_TABS)[number]["key"];

export const SUPPLIER_TABS = [
  { key: "info", label: "내 정보 관리" },
  { key: "answer", label: "수요 게시판 답변" },
  { key: "inquiry", label: "문의/신고 내역" },
  { key: "alarm", label: "알림 설정" },
  { key: "withdraw", label: "회원 탈퇴" },
] as const;
export type SupplierTabKey = (typeof SUPPLIER_TABS)[number]["key"];

export const OFFICIAL_HEADER_SUB = "경기도청 · 도로관리과 · test01@test.com";
export const SUPPLIER_HEADER_SUB = "· partner01@test.com";

export type PurchaseStatus =
  | "납품완료"
  | "구매확정"
  | "세금계산서 발행완료"
  | "결제완료"
  | "배송중"
  | "결제대기"
  | "세금계산서 발행요청";

export type PurchaseAction =
  | { kind: "detail" }
  | { kind: "refund" }
  | { kind: "tax-request" }
  | { kind: "confirm" };

export type PurchaseRow = {
  date: string;
  orderNo: string;
  name: string;
  spec: string;
  supplier: string;
  amount: string;
  statuses: PurchaseStatus[];
  actions: PurchaseAction[];
};

export const PURCHASES: PurchaseRow[] = [
  { date: "2026-04-01", orderNo: "o001", name: "레미콘 24-40-140, 아스콘 표준배합 15-40", spec: "10m³, 5톤", supplier: "경기건설(주)", amount: "1,625,000원", statuses: ["납품완료", "구매확정", "세금계산서 발행완료"], actions: [{ kind: "detail" }] },
  { date: "2026-04-15", orderNo: "o002", name: "업무용 PC i7/16GB/512GB", spec: "5대", supplier: "디지털솔루션(주)", amount: "4,450,000원", statuses: ["결제완료"], actions: [{ kind: "detail" }, { kind: "refund" }] },
  { date: "2026-04-20", orderNo: "o003", name: "분말소화기 3.3kg, 소방호스 65A 20m", spec: "20개, 10개", supplier: "안전소방(주)", amount: "1,780,000원", statuses: ["배송중"], actions: [{ kind: "detail" }, { kind: "refund" }] },
  { date: "2026-05-07", orderNo: "o004", name: "일반 사무용 책상 1400x700", spec: "10개", supplier: "오피스퍼니처(주)", amount: "1,450,000원", statuses: ["결제대기"], actions: [{ kind: "detail" }] },
  { date: "2026-03-20", orderNo: "o005", name: "자동전자혈압계 상완식", spec: "5대", supplier: "메디칼텍(주)", amount: "475,000원", statuses: ["납품완료", "구매확정", "세금계산서 발행요청"], actions: [{ kind: "detail" }] },
  { date: "2026-04-05", orderNo: "o014", name: "무선 AP 듀얼밴드 802.11ax", spec: "8대", supplier: "네트워크텍(주)", amount: "2,560,000원", statuses: ["납품완료", "구매확정", "세금계산서 발행요청"], actions: [{ kind: "detail" }] },
  { date: "2026-04-12", orderNo: "o015", name: "NAS 저장장치 4베이 16TB", spec: "2대", supplier: "디지털솔루션(주)", amount: "3,700,000원", statuses: ["납품완료", "구매확정"], actions: [{ kind: "detail" }, { kind: "tax-request" }] },
  { date: "2026-03-28", orderNo: "o016", name: "CCTV IP카메라 4MP 풀HD", spec: "15대", supplier: "시큐어텍(주)", amount: "4,200,000원", statuses: ["납품완료"], actions: [{ kind: "detail" }, { kind: "confirm" }] },
];

export type OrderItem = { name: string; qtyUnit: string; amount: string };
export type TaxInfo = { org: string; bizNo: string; ceo: string; email: string; address: string };
export type OrderDetail = {
  orderNo: string;
  payDate: string;
  payMethod: string;
  status: PurchaseStatus;
  items: OrderItem[];
  total: string;
  tax: TaxInfo;
  taxIssued: boolean;
};

export const ORDER_DETAIL_O001: OrderDetail = {
  orderNo: "o001",
  payDate: "2026-04-01",
  payMethod: "법인카드",
  status: "납품완료",
  items: [
    { name: "레미콘 24-40-140", qtyUnit: "10m³ · 단가 115,000원", amount: "1,150,000원" },
    { name: "아스콘 표준배합 15-40", qtyUnit: "5톤 · 단가 95,000원", amount: "475,000원" },
  ],
  total: "1,625,000원",
  tax: { org: "경기도청", bizNo: "124-83-00001", ceo: "김동연", email: "tax@gg.go.kr", address: "경기도 수원시 팔달구 효원로 1" },
  taxIssued: true,
};

export const ORDER_DETAIL_O002: OrderDetail = {
  orderNo: "o002",
  payDate: "2026-04-15",
  payMethod: "가상계좌",
  status: "결제완료",
  items: [{ name: "업무용 PC i7/16GB/512GB", qtyUnit: "5대 · 단가 890,000원", amount: "4,450,000원" }],
  total: "4,450,000원",
  tax: { org: "화성시청", bizNo: "134-83-00001", ceo: "이민혁", email: "tax@hwaseong.go.kr", address: "경기도 화성시 향남로 45 시청본관" },
  taxIssued: false,
};

export type QuoteNoticeStatus = "공고중" | "검토중" | "선정완료" | "마감";
export type QuoteNoticeRow = {
  regDate: string;
  title: string;
  sub: string;
  budget: string;
  deadline: string;
  proposals: string;
  status: QuoteNoticeStatus;
};

export const QUOTE_NOTICES: QuoteNoticeRow[] = [
  { regDate: "2026-05-01", title: "2026년 2분기 도로보수 공사 자재 구매", sub: "레미콘 24-40-140 50㎥, 아스콘 표준배합 15-40 30톤", budget: "8,000,000원", deadline: "2026-06-15", proposals: "3건", status: "공고중" },
  { regDate: "2026-05-02", title: "2026년 화성시 도시개발 건자재 대규모 구매 (다수 업체 비교)", sub: "레미콘 24-40-140 200㎥, 아스콘 표준배합 15-40 100톤, 철근 D16 10m 500개", budget: "35,000,000원", deadline: "2026-07-31", proposals: "10건", status: "검토중" },
  { regDate: "2026-05-08", title: "수지 보강 프로젝트 발전기 및 베어링 구매", sub: "발전기 100kW급 2대, 베어링 6206-2RS 500개", budget: "15,000,000원", deadline: "2026-06-20", proposals: "1건", status: "공고중" },
  { regDate: "2026-02-15", title: "2026년 화성시 도로유지보수 포장 자재 구매 (물품 견적)", sub: "레미콘 24-40-140(중기) 80㎥, 아스콘 표준배합 15-40 40톤", budget: "12,000,000원", deadline: "2026-03-20", proposals: "4건", status: "선정완료" },
  { regDate: "2026-01-20", title: "2026년 1분기 교통안전용품 구매 (물품 견적)", sub: "반사원형콘 750mm 200개, 강관난간 2중난간 50m", budget: "5,500,000원", deadline: "2026-02-28", proposals: "6건", status: "마감" },
];

export type ProductQuoteStatus = "대기중" | "견적 도착";
export type ProductQuoteRow = {
  product: string;
  supplier: string;
  phone: string;
  reqDate: string;
  qty: string;
  status: ProductQuoteStatus;
  offer?: { amount: string; note: string };
};

export const PRODUCT_QUOTES: ProductQuoteRow[] = [
  { product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", supplier: "디지털솔루션(주)", phone: "031-780-4500", reqDate: "2026-05-10", qty: "20대", status: "대기중" },
  { product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", supplier: "디지털솔루션(주)", phone: "031-780-4500", reqDate: "2026-05-08", qty: "10대", status: "견적 도착", offer: { amount: "8,800,000원", note: "24인치 FHD 모니터 포함 세트" } },
  { product: "네트워크장비(스위치) 48포트 L3 관리형", supplier: "네트웍솔루션(주)", phone: "031-555-1234", reqDate: "2026-05-14", qty: "3대", status: "대기중" },
];

export type QuoteAttachment = { name: string };
export const QUOTE_REQUEST_DETAIL = {
  product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
  supplier: "디지털솔루션(주)",
  org: "경기도 화성시청",
  dept: "도로관리과",
  email: "official@ggseso.go.kr",
  phone: "031-369-1234",
  qty: "20대",
  wishDate: "2026-05-25",
  address: "[18289] 경기도 화성시 시청로 159 화성시청 도로관리과",
  reqDate: "2026-05-10",
  status: "대기중" as const,
  content:
    "화성시청 정보통신과에서 도로관리과로 업무용 PC 20대를 긴급 요청합니다. CPU는 i7-13세대 이상, 메모리는 DDR5 16GB, 저장장치는 NVMe 512GB 이상이 필요합니다. 기존에 사용 중인 노후 PC(6년 이상)를 교체하는 것으로, Windows 11 Pro 정품 라이선스 포함 설치가 필요합니다. 납품 시 기존 데이터 이전 지원도 요청드립니다.",
  attachments: [
    { name: "견적요청서_도로관리과_2026.pdf" },
    { name: "사양비교표.xlsx" },
  ] as QuoteAttachment[],
};

export type DemandPostRow = { title: string; meta: string; status: "진행중" };
export const DEMAND_POSTS: DemandPostRow[] = [
  { title: "태양광 발전 설비 유지보수 서비스", meta: "전기 및 에너지 설비 · 2026-05-05 · 답변 3개 · 조회 156", status: "진행중" },
  { title: "스마트 급식 시스템 도입 견적 요청", meta: "4차 산업 및 구독 서비스 · 2026-05-02 · 답변 3개 · 조회 167", status: "진행중" },
  { title: "도서관 도서관리 시스템 RFID 교체 견적 요청", meta: "정보통신 및 디지털/4차산업 분야 · 2026-04-30 · 답변 5개 · 조회 234", status: "진행중" },
  { title: "청사 주변 조경 공사 및 유지보수 업체 정보", meta: "유지보수 서비스 분야 · 2026-05-09 · 답변 3개 · 조회 134", status: "진행중" },
];

export type InfoPostRow = { title: string; meta: string };
export const INFO_POSTS: InfoPostRow[] = [
  { title: "IT장비 구매검수 시 주의사항 (정보통신과)", meta: "정보공유 · 2026-04-20 · 조회 876" },
  { title: "수원시 주요 조달 업체 납품 평판 공유", meta: "정보공유 · 2026-05-12 · 조회 345" },
];

export type InquiryKind = "문의" | "신고";
export type InquiryStatus = "접수" | "처리중" | "완료";
export type InquiryRow = {
  kind: InquiryKind;
  category: string;
  title: string;
  date: string;
  status: InquiryStatus;
  thread?: { question: string; answer: { meta: string; body: string } };
};

export const INQUIRIES: InquiryRow[] = [
  { kind: "문의", category: "견적문의", title: "견적 공고 마감일 연장 가능한가요?", date: "2026-05-18", status: "접수" },
  { kind: "신고", category: "허위상품", title: "등록된 상품의 사양이 실제와 상이함", date: "2026-05-16", status: "처리중" },
  { kind: "문의", category: "시스템오류", title: "마이페이지 구매 내역 조회 시 로딩이 너무 느립니다", date: "2026-05-15", status: "처리중" },
  { kind: "문의", category: "견적문의", title: "견적 공고 등록 후 입찰 업체 목록을 다운로드할 수 있나요?", date: "2026-05-12", status: "접수" },
  { kind: "신고", category: "허위상품", title: "업무용 PC 사양과 실제 납품 사양 불일치", date: "2026-05-08", status: "처리중" },
  {
    kind: "문의",
    category: "결제문의",
    title: "가상계좌 입금 후 결제 완료 처리가 안 됩니다",
    date: "2026-05-06",
    status: "완료",
    thread: {
      question: "어제 오후 3시에 가상계좌로 162만 5천원을 입금했으나 결제 완료 처리가 되지 않았습니다. 입금 내역 확인 및 수동 처리 부탁드립니다.",
      answer: { meta: "관리자 · 2026-05-07", body: "확인 결과 입금 내역이 확인되었습니다. 시스템 오류로 결제 완료 처리가 지연되었으며, 현재 정상 처리 완료되었습니다. 불편을 드려 죄송합니다." },
    },
  },
  { kind: "문의", category: "결제문의", title: "법인카드로 결제 시 할부 설정이 가능한가요?", date: "2026-05-05", status: "완료" },
];

export const SUPPLIER_INQUIRIES: InquiryRow[] = [
  { kind: "문의", category: "입점신청", title: "입점 심사 결과 문의", date: "2026-05-17", status: "처리중" },
  { kind: "문의", category: "시스템오류", title: "상품 등록 시 이미지 업로드 오류", date: "2026-05-14", status: "접수" },
  {
    kind: "문의",
    category: "결제문의",
    title: "판매 대금 정산 주기 문의",
    date: "2026-05-10",
    status: "완료",
    thread: {
      question: "이번 달 납품 완료된 2건의 판매 대금 정산 일정을 확인하고 싶습니다. 플랫폼 내 정산 예정 내역 페이지에서 확인 가능한가요? 또한 세금계산서 발행 후 정산까지 소요되는 기간이 궁금합니다.",
      answer: { meta: "관리자 · 2026-05-11", body: "판매 대금 정산은 세금계산서 발행 확인 후 익월 15일에 일괄 지급됩니다. 파트너 포털 > 매출 관리 > 정산 예정 내역에서 확인 가능하며, 이번 달 납품 건은 6월 15일 정산 예정입니다." },
    },
  },
  { kind: "신고", category: "부정거래", title: "동일 업체의 반복적인 저가 낙찰 후 품질 불량", date: "2026-05-08", status: "접수" },
  { kind: "문의", category: "구독문의", title: "프리미엄 플랜 이용 중 상품 노출 순위 문의", date: "2026-05-05", status: "완료" },
];

export type AlarmSetting = { title: string; desc: string; on: boolean };
export const ALARM_SETTINGS: AlarmSetting[] = [
  { title: "주문/결제 알림", desc: "주문 접수, 결제 완료, 배송 시작 등", on: true },
  { title: "견적 공고 알림", desc: "내 공고 입찰, 마감 임박, 선정 결과 등", on: true },
  { title: "배송 알림", desc: "출고, 배송중, 납품 완료 등", on: true },
  { title: "마케팅 및 프로모션", desc: "신규 상품, 이벤트, 할인 정보 등", on: false },
];

export const BASIC_INFO = {
  email: "test01@test.com",
  org: "경기도청",
  dept: "도로관리과",
  deptPhone: "-",
};
export type SupplierBasicField = { label: string; value: string };
export const SUPPLIER_BASIC_INFO: SupplierBasicField[] = [
  { label: "상호(회사명)", value: "-" },
  { label: "사업자등록번호", value: "1234567890" },
  { label: "대표자", value: "partner01" },
  { label: "사업장 주소", value: "partner01" },
  { label: "업태", value: "-" },
  { label: "업종", value: "-" },
  { label: "회사 전화", value: "-" },
  { label: "담당자명", value: "사용자" },
];

export type TermTag = { label: string; tone: "required" | "ai" | "pay" | "civil" };
export type Term = {
  title: string;
  tag: TermTag;
  desc: string;
  required: boolean;
  on?: boolean;
};

export const TERMS_REQUIRED: Term[] = [
  { title: "서비스 이용약관", tag: { label: "필수", tone: "required" }, required: true, desc: "공무원(구매자)과 입점 업체(공급자)의 자격을 구분하고, 거래 성립 기준 및 플랫폼의 중개 면책 범위를 정의하는 기본 규칙입니다." },
  { title: "개인정보 처리방침", tag: { label: "필수", tone: "required" }, required: true, desc: "소속 기관, 부서, 연락처, 사업자번호 등 수집하는 정보를 명시하고, 공공조달 증빙 법정 보관 기간(5년)에 따른 관리 방침을 고지합니다." },
];

export const TERMS_OPTIONAL: Term[] = [
  { title: "AI 생성 서비스 이용 특약", tag: { label: "AI 생성", tone: "ai" }, required: false, on: true, desc: "AI가 만든 문구나 스펙의 오류(허위 정보)에 대해 플랫폼은 책임을 지지 않으며, 모든 최종 검수와 법적 책임은 '입점 업체'에게 있음을 명시하는 안전장치입니다." },
  { title: "개인정보 제3자 제공 동의", tag: { label: "결제", tone: "pay" }, required: false, on: true, desc: "공무원이 구매를 진행할 수 있도록, 세금계산서 발행 및 배송에 필요한 기관 데이터를 판매 업체에게 적법하게 전달하기 위한 동의 절차입니다." },
  { title: "전자금융거래 이용약관 및 환불 규정", tag: { label: "결제", tone: "pay" }, required: false, on: false, desc: "법인카드 결제 및 가상계좌 입금 과정의 안전성을 규정하고, 조달 거래 취소 시의 환불 기준을 확인받는 구간입니다." },
  { title: "민원 처리를 위한 개인정보 추가 수집 동의", tag: { label: "민원", tone: "civil" }, required: false, on: false, desc: "행정 문의나 납품 분쟁 해결을 위해 담당자 직통 연락처, 첨부 서류 등의 데이터를 수집하고 감사 대응을 위해 상담 이력을 보관하는 동의입니다." },
];

export const WITHDRAW_NOTES = [
  "• 탈퇴 후 모든 개인 정보 및 구매 이력은 삭제됩니다.",
  "• 진행 중인 구매/공급 요청은 자동 취소 처리됩니다.",
  "• 탈퇴 후 동일 이메일로 30일간 재가입이 불가합니다.",
];

export type DemandAnswerRow = {
  title: string;
  meta: string;
  supplier: string;
  answerDate: string;
  answer: string;
  status: "진행중";
};
export const DEMAND_ANSWERS: DemandAnswerRow[] = [
  { title: "용인시청 네트워크 인프라 유지보수 서비스 업체 추천", meta: "정보통신 및 디지털/4차산업 분야 · 2026-05-05 · 답변 4개 · 조회 234", supplier: "디지털솔루션(주)", answerDate: "2026-05-07", answer: "Cisco/Juniper L3 스위치 전문 유지보수. VLAN 설정, ACL 정책 검토, 펌웨어 업데이트 포함. 연간 420만원이며 원격 모니터링 대시보드 무료 제공합니다.", status: "진행중" },
  { title: "업무용 PC 대량 구매 시 최적 사양 및 업체 추천", meta: "정보통신 및 디지털/4차산업 분야 · 2026-04-28 · 답변 6개 · 조회 345", supplier: "디지털솔루션(주)", answerDate: "2026-04-29", answer: "i7-14700 기반 업무용 PC 납품 전문. 30대 이상 구매 시 5% 추가 할인, 3년 무상 AS 제공. 납품 후 현장 설치 서비스 포함.", status: "진행중" },
  { title: "고양시 LED 가로등 교체 공사 서비스 업체 추천", meta: "건축시설 및 전기/설비 분야 · 2026-05-09 · 답변 5개 · 조회 198", supplier: "디지털솔루션(주)", answerDate: "2026-05-10", answer: "LED 가로등 및 스마트 관제 시스템 통합 설치 전문. KS C 7613 인증 제품 보유, 시공 후 1년 무상 유지보수 포함. 200개 기준 총 3,600만원입니다.", status: "진행중" },
  { title: "무인 주차관제 시스템 견적 요청", meta: "교통 안전 및 관제 · 2026-05-03 · 답변 5개 · 조회 234", supplier: "디지털솔루션(주)", answerDate: "2026-05-04", answer: "무인 주차관제 시스템 견적 제안드립니다. 차량 번호 인식률 99% 이상, 정산기 연동, CCTV 4대 포함. 총 4,800만원입니다.", status: "진행중" },
  { title: "스마트 급식 시스템 도입 견적 요청", meta: "4차 산업 및 구독 서비스 · 2026-05-02 · 답변 3개 · 조회 167", supplier: "디지털솔루션(주)", answerDate: "2026-05-03", answer: "스마트 급식 시스템(태블릿 주문 + 결제 + 식사 현황 조회) 구축 경험 다수. Android 기반 태블릿 50대 + 백오피스 시스템 + 주방 디스플레이 포함.", status: "진행중" },
  { title: "행정복지 시스템 통합 연동 개발 업체 모집", meta: "정보통신 및 디지털/4차산업 분야 · 2026-04-25 · 답변 7개 · 조회 312", supplier: "디지털솔루션(주)", answerDate: "2026-04-26", answer: "Java/Spring Boot 기반 행정복지 시스템 통합연동 20건 이상 수행. API 게이트웨이 구축, 데이터 표준화, 레거시 시스템 마이그레이션 가능.", status: "진행중" },
  { title: "도서관 도서관리 시스템 RFID 교체 견적 요청", meta: "정보통신 및 디지털/4차산업 분야 · 2026-04-30 · 답변 5개 · 조회 234", supplier: "디지털솔루션(주)", answerDate: "2026-05-01", answer: "도서관 RFID 도서관리 시스템 10개소 이상 구축. UHF RFID 태그, 셀프 반납기, 예약 도서 대출함 구성. 4개소 총 1,800만원이며 설치 교육 포함.", status: "진행중" },
  { title: "관공서 협업툴 도입 견적 (실시간 코멘트 기능)", meta: "정보통신 및 디지털/4차산업 분야 · 2026-04-27 · 답변 6개 · 조회 278", supplier: "디지털솔루션(주)", answerDate: "2026-04-28", answer: "Microsoft 365 / Google Workspace 연동 협업툴 구축 전문. 보안 인증(ISO 27001) 완료, 문서 공동편집 + 실시간 코멘트 기능 제공.", status: "진행중" },
];
