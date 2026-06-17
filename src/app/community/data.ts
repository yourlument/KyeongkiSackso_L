
export type DemandStatus = "진행중" | "마감";

export type DemandComment = {
  company: string;
  date: string;
  body: string;
  reply?: { name: string; date: string; body: string };
};

export type DemandPost = {
  id: string;
  status: DemandStatus;
  date: string;
  title: string;
  summary: string;
  org: string;
  category: string;
  views: number;
  answers: number;
  mine?: boolean;
  videoUrl?: string;
  attachments?: { name: string; size: string }[];
  comments?: DemandComment[];
};

export const DEMAND_POSTS: DemandPost[] = [
  {
    id: "1",
    status: "진행중",
    date: "2026-05-07",
    title: "도로 보수용 레미콘 납품 업체 추천 요청",
    summary:
      "화성시 1분기 도로보수공사에 사용할 레미콘 24-40-140(중기) 납품 업체를 추천해주세요. 납기일 준수와 성적서 발급이 필수입니다.",
    org: "도로관리과_화성시청",
    category: "도로교통 및 토목 분야",
    views: 156,
    answers: 3,
    mine: true,
  },
  {
    id: "2",
    status: "마감",
    date: "2026-04-20",
    title: "아스콘 도로 포장재 품질 비교 정보 요청",
    summary:
      "노상용 아스콘 표준배합 제품 품질 비교 정보가 필요합니다. KS 인증, 배합비 등 기술적 정보를 공유해주세요.",
    org: "도로관리과_화성시청",
    category: "도로교통 및 토목 분야",
    views: 89,
    answers: 2,
    mine: true,
  },
  {
    id: "3",
    status: "진행중",
    date: "2026-05-10",
    title: "성남시 보건소 의료기기 유지보수 서비스 업체 정보",
    summary:
      "자동전자혈압계, 체온계 등 보건소 의료기기 정기 유지보수 서비스 업체 추천 부탁드립니다. 기기병력부 관리 포함 필요합니다.",
    org: "보건위생과_성남시청",
    category: "재난안전 및 소방/보건 분야",
    views: 112,
    answers: 2,
  },
  {
    id: "4",
    status: "진행중",
    date: "2026-05-05",
    title: "용인시청 네트워크 인프라 유지보수 서비스 업체 추천",
    summary:
      "L3 스위치, 방화벽 등 네트워크 장비 유지보수 서비스 업체 추천 요청합니다. 연간 계약 형태 선호합니다.",
    org: "디지털정보과_용인시청",
    category: "정보통신 및 디지털/4차산업 분야",
    views: 234,
    answers: 4,
  },
  {
    id: "5",
    status: "진행중",
    date: "2026-04-28",
    title: "업무용 PC 대량 구매 시 최적 사양 및 업체 추천",
    summary:
      "30대 이상 업무용 PC 구매 시 Intel i7 기준 최적 사양과 납품 실적 좋은 업체 추천 부탁드립니다.",
    org: "디지털정보과_용인시청",
    category: "정보통신 및 디지털/4차산업 분야",
    views: 345,
    answers: 6,
    videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    attachments: [
      { name: "PC_구매_사양서_i7_16GB.pdf", size: "1.7 MB" },
      { name: "업무용PC_설치_환경_점검표.xlsx", size: "927.7 KB" },
    ],
    comments: [
      {
        company: "디지털솔루션(주)",
        date: "2026-04-29",
        body:
          "i7-14700 기반 업무용 PC 납품 전문. 30대 이상 구매 시 5% 추가 할인, 3년 무상 AS 제공. 납품 후 현장 설치 서비스 포함.",
        reply: {
          name: "디지털정보과_최주임",
          date: "2026-04-30",
          body: "모니터 포함 세트 구성도 가능한지 문의드립니다. 24인치 FHD 기준으로 견적 부탁드립니다.",
        },
      },
      {
        company: "오피스텍(주)",
        date: "2026-04-30",
        body: "PC 30대 이상 대량 구매 시 모니터 세트 구성 가능. 윈도우 라이선스, 엑셀/워드 포함 설정 납품.",
      },
      {
        company: "아이티솔루션(주)",
        date: "2026-05-01",
        body: "삼성, LG, ASUS 브랜드 3종 비교 견적 제공 가능. 3년 제조사 AS 계약 동시 체결 가능.",
      },
      {
        company: "한국IT자재(주)",
        date: "2026-05-02",
        body: "국산 저소음 스탠드형 케이스 기반 맞춤형 조립 PC 가능. 성능 테스트 보고서 납품 전 제공.",
      },
      {
        company: "컴퓨전코리아(주)",
        date: "2026-05-03",
        body: "DDR5 기반 최신 사양. 납기 1주 이내 가능. 대기업 전산실 납품 실적 다수 보유.",
      },
      {
        company: "테크파트너스(주)",
        date: "2026-05-04",
        body: "공공기관 납품 전문 업체. 나라장터 등록 완료, 조달우수제품 인증 보유. 무상 AS 3년 + 방문 서비스 포함.",
      },
    ],
  },
  {
    id: "6",
    status: "마감",
    date: "2026-04-10",
    title: "소방 설비 정기점검 서비스 업체 문의",
    summary:
      "소화기, 소방호스, 경보설비 정기점검 서비스 업체를 찾습니다. 소방청 등록 업체 필수, 보고서 제출 가능한 곳으로 추천해주세요.",
    org: "디지털정보과_용인시청",
    category: "재난안전 및 소방/보건 분야",
    views: 178,
    answers: 3,
  },
  {
    id: "7",
    status: "진행중",
    date: "2026-05-09",
    title: "고양시 LED 가로등 교체 공사 서비스 업체 추천",
    summary:
      "KS C 7613 기준 LED 가로등 교체 공사 업체 추천 요청합니다. 시공 후 1년 유지보수 포함 조건입니다.",
    org: "시설관리과_고양시청",
    category: "건축시설 및 전기/설비 분야",
    views: 198,
    answers: 5,
  },
  {
    id: "8",
    status: "진행중",
    date: "2026-05-11",
    title: "청사 냉난방 설비 유지보수 서비스 정보 요청",
    summary:
      "고양시청 청사 내 냉난방 설비 정기 점검 및 유지보수 서비스 업체 정보를 요청합니다. 연간 계약 형태로 진행 예정입니다.",
    org: "시설관리과_고양시청",
    category: "건축시설 및 전기/설비 분야",
    views: 145,
    answers: 2,
  },
  {
    id: "9",
    status: "진행중",
    date: "2026-05-03",
    title: "무인 주차관제 시스템 견적 요청",
    summary:
      "화성시청 주차장에 도입할 무인 주차관제 시스템 견적 요청합니다. 차량 번호 인식, 정산 기능, CCTV 연동 필수입니다. 예산은 5천만원 내외입니다.",
    org: "도로과_화성시청",
    category: "교통 안전 및 관제",
    views: 234,
    answers: 3,
    mine: true,
  },
  {
    id: "10",
    status: "진행중",
    date: "2026-05-05",
    title: "태양광 발전 설비 유지보수 서비스",
    summary:
      "화성시청 옥상 태양광 발전 설비의 정기 유지보수 서비스가 필요합니다. 패널 청소, 인버터 점검, 발전량 모니터링 등을 포함합니다.",
    org: "환경과_수원시청",
    category: "전기 및 에너지 설비",
    views: 156,
    answers: 2,
  },
];

export function getDemandPost(id: string): DemandPost | undefined {
  return DEMAND_POSTS.find((p) => p.id === id);
}
