export type Performance = {
  label: string;
  project: string;
  client: string;
  year: string;
  amount: string;
};

export type Equipment = {
  name: string;
  quantity: string;
};

export const PROFILE_TAGLINE = "공공기관 맞춤형 IT 인프라 및 디지털 솔루션 전문 기업";

export const PROFILE_DESCRIPTION =
  "디지털솔루션(주)는 2015년 설립 이래 공공기관 및 지자체를 대상으로 IT 인프라 구축, 네트워크 장비 공급, 스마트시티 솔루션, SI 프로젝트를 수행해왔습니다. 업무용 PC, 서버, 네트워크 장비부터 클라우드 기반 행정시스템 통합까지 원스톱으로 제공합니다. ISO 27001, ISO 9001 인증 보유.";

export const PROFILE_DESCRIPTION_COUNT = "172/500";

export const PERFORMANCES: Performance[] = [
  { label: "실적 1", project: "화성시청 전산실 리뉴얼", client: "화성시청", year: "2026", amount: "3.2억" },
  { label: "실적 2", project: "경기도교육청 스마트교실 120실", client: "경기도교육청", year: "2023", amount: "8.5억" },
  { label: "실적 3", project: "분당구청 행정망 보안강화", client: "성남시 분당구청", year: "2026", amount: "1.8억" },
  { label: "실적 4", project: "판교테크노밸리 CCTV 통합관제", client: "경기도 성남시", year: "2023", amount: "4.1억" },
];

export const EQUIPMENTS: Equipment[] = [
  { name: "HP Z8 워크스테이션 (테스트용)", quantity: "2대" },
  { name: "Cisco Catalyst 9000 시리즈 데모키트", quantity: "1세트" },
  { name: "Fluke 네트워크 분석기", quantity: "1대" },
  { name: "3D 프린터 (Prototyping용)", quantity: "1대" },
];

export const MANAGER = {
  name: "박영수",
  phone: "010-9876-5432",
  email: "sales@digitalsolution.kr",
  position: "영업본부 / 차장",
};

export const VERIFIED_ACCOUNT = {
  bank: "국민은행",
  number: "1234567890",
  holder: "테스트",
  summary: "국민은행 1234567890 (테스트)",
  verifiedAt: "인증일시: 2026. 5. 20. 오후 5:30:29",
};

export const REMITTANCE_ACCOUNT = "국민은행 1234567890";
