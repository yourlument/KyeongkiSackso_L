export type ProductRequestStatus = "대기중" | "견적 제출됨";

export type ProductRequest = {
  id: string;
  product: string;
  status: ProductRequestStatus;
  org: string;
  qty: string;
  deadline: string;

  amount?: string;
  submittedAt?: string;

  detail: {
    orgName: string;
    department: string;
    email: string;
    phone: string;
    reqQty: string;
    desiredDate: string;
    address: string;
    note: string;
    attachment: string;
  };
};

export const PRODUCT_REQUESTS: ProductRequest[] = [
  {
    id: "pr-1",
    product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
    status: "대기중",
    org: "화성시청 정보통신과",
    qty: "20대",
    deadline: "2026-05-30",
    detail: {
      orgName: "화성시청",
      department: "정보통신과",
      email: "it.hwaseong@ggseso.go.kr",
      phone: "031-5189-3456",
      reqQty: "20대",
      desiredDate: "2026-05-30",
      address: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      note: "-",
      attachment: "RFQ_PC_화성시청_20260510.pdf",
    },
  },
  {
    id: "pr-2",
    product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
    status: "견적 제출됨",
    org: "수원시청 총무과",
    qty: "10대",
    deadline: "2026-06-15",
    amount: "8,800,000원",
    submittedAt: "2026-05-09 제출",
    detail: {
      orgName: "수원시청",
      department: "총무과",
      email: "it.hwaseong@ggseso.go.kr",
      phone: "031-5189-3456",
      reqQty: "10대",
      desiredDate: "2026-06-15",
      address: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      note: "-",
      attachment: "RFQ_PC_화성시청_20260510.pdf",
    },
  },
  {
    id: "pr-3",
    product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
    status: "대기중",
    org: "성남시청 기획예산실",
    qty: "5대",
    deadline: "2026-05-20",
    detail: {
      orgName: "성남시청",
      department: "기획예산실",
      email: "it.hwaseong@ggseso.go.kr",
      phone: "031-5189-3456",
      reqQty: "5대",
      desiredDate: "2026-05-20",
      address: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      note: "-",
      attachment: "RFQ_PC_화성시청_20260510.pdf",
    },
  },
  {
    id: "pr-4",
    product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
    status: "견적 제출됨",
    org: "용인시청 디지털정보과",
    qty: "30대",
    deadline: "2026-06-30",
    amount: "26,100,000원",
    submittedAt: "2026-05-08 제출",
    detail: {
      orgName: "용인시청",
      department: "디지털정보과",
      email: "it.hwaseong@ggseso.go.kr",
      phone: "031-5189-3456",
      reqQty: "30대",
      desiredDate: "2026-06-30",
      address: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      note: "-",
      attachment: "RFQ_PC_화성시청_20260510.pdf",
    },
  },
  {
    id: "pr-5",
    product: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB",
    status: "대기중",
    org: "평택시청 민원지원과",
    qty: "8대",
    deadline: "2026-06-10",
    detail: {
      orgName: "평택시청",
      department: "민원지원과",
      email: "it.hwaseong@ggseso.go.kr",
      phone: "031-5189-3456",
      reqQty: "8대",
      desiredDate: "2026-06-10",
      address: "경기도 화성시 시청로 159 정보통신과 (우 18289)",
      note: "-",
      attachment: "RFQ_PC_화성시청_20260510.pdf",
    },
  },
];

export const REQUEST_STATS = [
  { key: "total", value: "5", label: "전체 요청" },
  { key: "waiting", value: "3", label: "대기중" },
  { key: "submitted", value: "2", label: "견적 제출" },
] as const;

export type AnnouncementRow = {
  id: string;
  title: string;
  items: string;
  org: string;
  budget: string;
  deadline: string;
  proposals: string;
};

export const ANNOUNCEMENTS: AnnouncementRow[] = [
  { id: "an-1", title: "2026년 2분기 도로보수 공사 자재 구매", items: "레미콘 24-40-140, 아스콘 표준배합 15-40", org: "경기도 화성시 도로과", budget: "8,000,000원", deadline: "2026-06-15", proposals: "3건" },
  { id: "an-2", title: "2026년 화성시 도시개발 건자재 대규모 구매 (다수 업체 비교)", items: "레미콘 24-40-140, 아스콘 표준배합 15-40, 철근 D16 10m", org: "경기도 화성시 도시건설과", budget: "35,000,000원", deadline: "2026-07-31", proposals: "10건" },
  { id: "an-3", title: "화성시청 IT장비 신규 구축 프로젝트", items: "업무용 PC i7/16GB/512GB, 프린터 레이저 흑백 45ppm, 네트워크스위치 48포트 L3", org: "경기도 화성시 정보통신과", budget: "42,000,000원", deadline: "2026-05-30", proposals: "5건" },
  { id: "an-4", title: "화성시 소방서 장비 보강 구매", items: "분말소화기 3.3kg, 소방호스 65A 20m", org: "경기도 화성시 안전총괄과", budget: "7,500,000원", deadline: "2026-05-10", proposals: "4건" },
  { id: "an-5", title: "2026학년도 교육기관 가구 구매", items: "학생책상 1인용 600x400, 학생의자", org: "경기도 화성시 교육지원청", budget: "35,000,000원", deadline: "2026-07-01", proposals: "2건" },
  { id: "an-6", title: "수지 보강 프로젝트 발전기 및 베어링 구매", items: "발전기 100kW급, 베어링 6206-2RS", org: "경기도 화성시 화폐과", budget: "15,000,000원", deadline: "2026-06-20", proposals: "1건" },
  { id: "an-7", title: "2026년 환경미관리용차 구매", items: "소형수거차 1톤, 대형수거차 5톤", org: "경기도 화성시 환경과", budget: "28,000,000원", deadline: "2026-06-10", proposals: "3건" },
  { id: "an-8", title: "시설관리용 실내조명 및 전기 자재 구매", items: "LED조명 1200x600 50W, 전기코드 3m", org: "경기도 화성시 시설관리과", budget: "4,500,000원", deadline: "2026-07-15", proposals: "4건" },
  { id: "an-9", title: "화성시 문화강승재단 물품 발주대 구매", items: "대형발주대 밀리상 200x100", org: "경기도 화성시 문화스포과", budget: "3,000,000원", deadline: "2026-05-05", proposals: "2건" },
];

export type ProposalStatusKind = "접수" | "검토중" | "탈락" | "선정";

export type Proposal = {
  id: string;
  title: string;
  statusKind: ProposalStatusKind;
  org: string;
  deadline: string;
  submittedAt: string;
  amount: string;
  spec: string;
  attachment: string;
};

export const PROPOSALS: Proposal[] = [
  { id: "pp-1", title: "용인시 교육청 디지털 교실 구축", statusKind: "접수", org: "용인시 교육지원청", deadline: "2026-08-31", submittedAt: "2026-05-12", amount: "33,800,000원", spec: "스마트패널 30대, 노트북 60대, 충전카트 3대", attachment: "첨부 파일 없음" },
  { id: "pp-2", title: "성남시 행정망 보안 장비 도입", statusKind: "접수", org: "성남시청", deadline: "2026-07-15", submittedAt: "2026-05-10", amount: "7,800,000원", spec: "차세대방화벽 2대, IDS 1대, VPN 장비 2대", attachment: "첨부 파일 없음" },
  { id: "pp-3", title: "화성시 스마트시티 IoT 인프라 구축", statusKind: "검토중", org: "화성시청", deadline: "2026-06-30", submittedAt: "2026-05-01", amount: "47,500,000원", spec: "LoRaWAN 게이트웨이 50대, 센서 500개, 클라우드 대시보드", attachment: "첨부 파일 없음" },
  { id: "pp-4", title: "안양시 무인민원발급기 유지보수", statusKind: "탈락", org: "안양시청", deadline: "2026-06-15", submittedAt: "2026-04-20", amount: "4,600,000원", spec: "기존 10대 정기점검, 소모품 교체, 원격모니터링", attachment: "첨부 파일 없음" },
  { id: "pp-5", title: "수원시 공공와이파이 확장 사업", statusKind: "선정", org: "수원시청", deadline: "2026-05-20", submittedAt: "2026-04-15", amount: "11,500,000원", spec: "WiFi6 AP 200대, 컨트롤러 2대, 3년 유지보수 포함", attachment: "첨부 파일 없음" },
];

export type ChatThread = {
  id: string;
  title: string;
  unread: number;
  preview: string;
  org: string;
  time: string;
  buyerName: string;
  buyerDept: string;
  buyerPhone: string;
};

export const CHAT_THREADS: ChatThread[] = [
  { id: "ct-1", title: "2026년 2분기 도로보수 공사 자재 구매", unread: 2, preview: "배송 시간대를 오전 9시~12시로 지정 가능한가요?", org: "화성시청 · 도로과", time: "2026-05-07 10:30", buyerName: "화성시청", buyerDept: "도로과", buyerPhone: "031-369-1234" },
  { id: "ct-2", title: "2026년 2분기 도로보수 공사 자재 구매", unread: 1, preview: "자재 품질 확인서 첨부했습니다.", org: "화성시청 · 도로과", time: "2026-05-06 14:20", buyerName: "화성시청", buyerDept: "도로과", buyerPhone: "031-369-1234" },
  { id: "ct-3", title: "화성시청 IT장비 신규 구축 프로젝트", unread: 1, preview: "견적서 PDF 첨부했습니다. 검토 부탁드립니다.", org: "화성시청 · 정보통신과", time: "2026-05-07 09:31", buyerName: "화성시청", buyerDept: "정보통신과", buyerPhone: "031-369-1234" },
  { id: "ct-4", title: "화성시청 IT장비 신규 구축 프로젝트", unread: 0, preview: "AS 3년 보증 조건으로 견적 제출했습니다.", org: "화성시청 · 정보통신과", time: "2026-05-06 16:00", buyerName: "화성시청", buyerDept: "정보통신과", buyerPhone: "031-369-1234" },
  { id: "ct-5", title: "용인시청 정보통신과 IT 장비 보강 (물품 견적)", unread: 3, preview: "업무용 PC 15대 사양서 첨부드립니다.", org: "용인시청 · 디지털정보과", time: "2026-05-14 10:00", buyerName: "용인시청", buyerDept: "디지털정보과", buyerPhone: "031-369-1234" },
  { id: "ct-6", title: "용인시청 정보통신과 IT 장비 보강 (물품 견적)", unread: 1, preview: "설치 인력 2명 동행 가능합니다.", org: "용인시청 · 디지털정보과", time: "2026-05-13 15:30", buyerName: "용인시청", buyerDept: "디지털정보과", buyerPhone: "031-369-1234" },
];

export type ChatMessage = { mine: boolean; text: string; time: string };

export const CHAT_SYSTEM_NOTE = "견적 문의 채팅방이 개설되었습니다. 기술 문의 및 추가 자료 전송이 가능합니다.";

export const CHAT_MESSAGES: ChatMessage[] = [
  { mine: true, text: "안녕하세요. 레미콘 50㎥, 아스콘 30톤 납품 관련 문의주셔서 감사합니다. 화성시청 직접 배송 가능합니다.", time: "2026-05-03 10:15" },
  { mine: false, text: "사양서 확인했습니다. 배송 시간대를 오전 9시~12시로 지정 가능한가요?", time: "2026-05-07 10:30" },
  { mine: true, text: "네, 가능합니다. 해당 시간대 배송 예정으로 처리하겠습니다. 아래 배송 일정표 첨부드립니다.", time: "2026-05-07 10:45" },
  { mine: false, text: "일정표 잘 받았습니다. 계약 진행 방향으로 검토하겠습니다.", time: "2026-05-07 11:00" },
];
