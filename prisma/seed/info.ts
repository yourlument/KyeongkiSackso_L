import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";
import { encField } from "../../src/lib/crypto/pii";

type InfoPostSeed = {
  id: string;
  category: string | null;
  title: string;
  content: string;
  date: string;
  views: number;
  likes: number;
  dislikes: number;
  isPublished: boolean;
  videoUrl?: string;
  author?: "official";
};

const INFO_POSTS: InfoPostSeed[] = [
  {
    id: "post-i-1",
    category: "서식/자료 공유",
    title: "경기도 조달 업무 공통 서식 모음 공유",
    content:
      "경기도 조달 업무에서 공통으로 사용하는 서식들을 정리했습니다. 구매 요청서, 납품 검수조서, 지출결의서 표준 양식 링크 공유드립니다.",
    date: "2026-04-10",
    views: 3241,
    likes: 235,
    dislikes: 0,
    isPublished: true,
    videoUrl: "동영상 미디어 플레이어",
  },
  {
    id: "post-i-2",
    category: null,
    title: "청사 에너지 효율화 공사 후기 (태양광 패널)",
    content: "",
    date: "2026-04-05",
    views: 2890,
    likes: 198,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-3",
    category: null,
    title: "2026년 조달 담당자 교육 일정 안내",
    content: "",
    date: "2026-04-08",
    views: 2456,
    likes: 178,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-4",
    category: "서식/자료 공유",
    title: "견적요청 시 가격 비교 노하우",
    content:
      "여러 업체의 견적을 비교할 때 단순 가격만 보지 마세요. 납기, AS 조건, 인증 보유 여부, 지역 거리 등을 종합적으로 평가하는 것이 중요합니다.가격 외 평가 항목:1. 납기일 준수 능력 (이전 납품 실적 확인)2. A/S 조건 (무상 A/S 기간, 출장 수리 가능 여부)3. 인증 보유 여부 (우수제품, 조달청 인증 등)4. 지역 거리 (긴급 대응 가능성)5. 업체 재무 안정성 (폐업 리스크)",
    date: "2026-04-28",
    views: 2341,
    likes: 156,
    dislikes: 0,
    isPublished: false,
  },
  {
    id: "post-i-5",
    category: null,
    title: "공공기관 청사 보안 카메라 교체 시 유의사항",
    content: "",
    date: "2026-04-22",
    views: 2134,
    likes: 145,
    dislikes: 0,
    isPublished: true,
  },

  {
    id: "post-i-6",
    category: "감사 대응/사례",
    title: "낙찰 재품질 요청 트리블맵 및 대응방법",
    content:
      "낙찰 업체의 재품질/구성품목 편닥 케이스 모음과 대응 방법 공유. 나라장터 리뷰 등록 대비 로직도 소개합니다.",
    date: "2026-05-17",
    views: 2,
    likes: 53,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-7",
    category: "서식/자료 공유",
    title: "낙찰 업체 신용 확인 방법 실무 노하우",
    content:
      "업체 신용제도 조회 방법과 재무 안정성 확인에 있어 활용하는 방법을 공유합니다. 신용평가스, 나이스평가정보, 국세완납증명서 요청 좋습니다.",
    date: "2026-05-16",
    views: 1,
    likes: 42,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-8",
    category: "업체후기",
    title: "2026년 상반기 고양시 주요 조달 납품 추요 업체 정리",
    content:
      "납품 실적 기준 추창하는 업체 목록입니다. 배송/납품일 준수가 중요하며 한번 난제 생기면 나라장터 무실적 등록 대상 되니 주의하세요.",
    date: "2026-05-16",
    views: 3,
    likes: 64,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-9",
    category: "업체후기",
    title: "용인시 IT 입찰업체 AS 경험담",
    content:
      "PC 구매 이후 꼬나 두 달만에 겪은 AS 문제와 방문 AS 신청 경험을 공유합니다. 컨트레프트 시 조건을 반드시 선확인하세요.",
    date: "2026-05-15",
    views: 2,
    likes: 58,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-10",
    category: "업체후기",
    title: "고양시청 내부 권장 미화 공사 업체 평판 공유",
    content:
      "내부 쿨스쿤 및 권장 미화 공사 납품이 좋았던 업체들 정보입니다. 마감재 대리서 나올 때 다시 평가해보세요.",
    date: "2026-05-15",
    views: 1,
    likes: 33,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-11",
    category: "업체후기",
    title: "지자체 헬스케어 용품 납품 업체 평판",
    content:
      "사무용 위생마스크, 소독제 등 보건소 공용 의료/위생 용품 납품 실적이 좋은 업체 정보 공유합니다.",
    date: "2026-05-14",
    views: 289,
    likes: 22,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-12",
    category: "구매/용역 정보",
    title: "고양시 LED 조명 납품 체크리스트 및 주의사항",
    content:
      "LED조명기구 납품 시 반드시 확인해야 할 항목들 공유합니다.주요 체크 항목:1. KS C 7613 국내 규격 적합 확인2. 조도 측정값 (lux 기준)3. 주광색도 수치 (Ra 기준)4. 에너지효율 등급 (예: 1등급, 2등급)5. 수명 확인 (30,000시간 이상)6. 전기 안전 인증서 (KC 마크)",
    date: "2026-05-14",
    views: 2,
    likes: 41,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-13",
    category: "구매/용역 정보",
    title: "보건소 의료기기 납품 검수 체크리스트",
    content:
      "상완식 혈압계, 체온계, 찬수스쿤 등 보건소 의료기기 검수 체크리스트 공유합니다.검수 항목:1. 제조사 정품 천안 유무 (한국어 설명서)2. 의료기기 허가당당 인증 서류3. 캘리브레이션 맞음 확인4. 보증대 개수 및 항목 비시5. 기기병력부 목록 등록 여부",
    date: "2026-05-13",
    views: 456,
    likes: 38,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-14",
    category: "업체후기",
    title: "수원시 주요 조달 업체 납품 평판 공유",
    content:
      "글쓰기는 어렵고 다들 있으실테지만 왜와 납품 까지 잘해주는 업체들 정보를 공유합니다.수원시 기준 독자성 주요 납품업체 평판:- IT 장비 : 디지털솔루션(주), 오피스텍(주) → 납기 준수율 95%- 소방장비 : 안전소방(주) → 품질 먹임- 사무가구: 에듀퍼니처(주) → 인도 조건 독독펜 확인 필요",
    date: "2026-05-12",
    views: 345,
    likes: 28,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-15",
    category: "구매/용역 정보",
    title: "IT 장비 납품 후 AS 기간 표준 안내",
    content:
      "PC, 프린터 등 IT장비 납품 후 무상 AS 요청 가능 기간 기준을 공유합니다.정신적 영역 안내:- PC/노트북: 납품일부터 36개월 이내 무상- 프린터: 24개월 이내 제조사 A/S, 드럼 부품 제외- 네트워크 장비: 12개월, 트래픽 미러링/설정 변경 별도 청구방문 A/S는 납품 3일 이내 무료 단 1회 조건, 이후는 유상 도요일/일요일 제외 콘트록 조항 활용.",
    date: "2026-05-10",
    views: 890,
    likes: 72,
    dislikes: 0,
    isPublished: true,
    author: "official",
  },

  {
    id: "post-i-16",
    category: "구매/용역 정보",
    title: "레미콘 구매 시 납품 검수 체크리스트 공유",
    content:
      "레미콘 납품 시 반드시 확인해야 할 검수 항목들을 정리했습니다. 강도 시험 성적서, 배합비 확인, 운반 시간 체크가 핵심입니다.1. 강도 시험 성적서 - 설계강도 이상 여부 반드시 확인2. 배합비 확인 - 물/시멘트비(W/C) 55% 이하인지 체크3. 운반 시간 - 비빔 후 1.5시간 이내 타설 원칙4. 슬럼프 측정 - 현장 도착 후 즉시 품질 검사 실시5. 납품서와 실제 수량 대조 확인",
    date: "2026-04-15",
    views: 1243,
    likes: 89,
    dislikes: 0,
    isPublished: false,
  },
  {
    id: "post-i-17",
    category: "구매/용역 정보",
    title: "IT장비 구매검수 시 주의사항 (정보통신과)",
    content:
      "PC/프린터 등 IT장비 납품 시 정품 인증서, 보증서, 성능 테스트 결과 확인이 필수입니다. 특히 SSD 용량과 메모리 규격을 꼭 체크하세요.체크리스트:- 정품 인증서 및 제조사 보증서 원본- 성능 테스트 결과지 (벤치마크)- SSD 실제 용량 vs 표기 용량 확인- 메모리 클럭 및 채널 확인- 윈도우 정품 키 확인",
    date: "2026-04-20",
    views: 876,
    likes: 67,
    dislikes: 0,
    isPublished: false,
  },
  {
    id: "post-i-18",
    category: "업체후기",
    title: "소방장비 정기점검 주기 및 업체 평가",
    content:
      "소화기, 소방호스 등 소방장비는 연 1회 이상 정기점검이 의무입니다. 신뢰할 수 있는 업체를 선정하는 기준도 함께 공유드립니다.점검 주기:- 소화기: 월 1회 외관점검, 연 1회 정밀검사- 소방호스: 연 2회 가압시험- 경보설비: 분기 1회 작동점검업체 선정 기준:1. 소방청 등록업체 여부 확인2. 점검 후 보고서 제출 여부3. 이전 납품 기관 레퍼런스",
    date: "2026-04-25",
    views: 1567,
    likes: 112,
    dislikes: 0,
    isPublished: false,
  },
  {
    id: "post-i-19",
    category: "서식/자료 공유",
    title: "법인카드 결제 증빙 자료 정리 방법",
    content:
      "구매 확인서, 세금계산서, 납품서 3종 세트를 하나의 PDF로 묶어 보관하는 방법을 공유합니다. 나라장터 연동 시 필수입니다.",
    date: "2026-05-01",
    views: 1890,
    likes: 134,
    dislikes: 0,
    isPublished: true,
  },
  {
    id: "post-i-20",
    category: "서식/자료 공유",
    title: "견적 비교 표준 양식 공유 (도로과 담당자 필독)",
    content:
      "도로 보수 자재 구매 시 사용하는 견적 비교 표준양식입니다. 레미콘, 아스콘, 랜덤 등 도로자재 구매 시 본 양식을 활용하세요.[평가 항목]1. 단가 적정성 - 30점2. 납기일 준수 가능여부 - 20점3. 제품 품질 인증서 (성적서, KS 등) - 20점4. A/S 기간 및 대응 속도 - 15점5. 업체 신용도/납품 실적 - 15점콘크리트 강도 시험 성적서는 주변 검사기관 성적서만 인정하도록 행정처 내부 규정 변경 중입니다.",
    date: "2026-05-08",
    views: 567,
    likes: 45,
    dislikes: 0,
    isPublished: true,
  },
];

const DETAIL_ATTACHMENTS = [
  { id: "patt-i-1-1", name: "경기도_조달_공통서식_모음집_2026.pdf", mb: 7.8 },
  { id: "patt-i-1-2", name: "구매요청서_표준양식_v4.hwp", mb: 1.1 },
  { id: "patt-i-1-3", name: "납품검수조서_작성_예시.pdf", mb: 3.3 },
  { id: "patt-i-1-4", name: "지출결의서_전자결재_연동_가이드.pptx", mb: 5.3 },
];

const DETAIL_COMMENTS: { id: string; date: string; text: string; likes: number; parentId?: string }[] = [
  { id: "cmt-i-1-1", date: "2026-04-11", text: "이런 자료 찾고 있었어요. 감사합니다!", likes: 36 },
  { id: "cmt-i-1-2", date: "2026-04-12", text: "지출결의서 양식이 기관마다 달라서 표준화가 필요하죠.", likes: 23 },
  { id: "cmt-i-1-3", date: "2026-04-13", text: "검수조서 서명란 전자서명도 인정되나요?", likes: 18 },
  { id: "cmt-i-1-4", date: "2026-04-14", text: "기관별로 다릅니다. 내부 규정 확인하세요.", likes: 0, parentId: "cmt-i-1-3" },
  { id: "cmt-i-1-5", date: "2026-04-14", text: "2026년 개정판 서식도 있나요?", likes: 12 },
  { id: "cmt-i-1-6", date: "2026-04-15", text: "나라장터 > 자료실에서 최신 서식 다운로드 가능합니다.", likes: 21 },
  { id: "cmt-i-1-7", date: "2026-04-16", text: "유익한 자료 공유 감사합니다.", likes: 7 },
];

export async function seedInfo(prisma: PrismaClient, ctx: SeedCtx): Promise<string> {
  const anon = await prisma.user.upsert({
    where: { email: "seed-익명@korlink.demo" },
    update: {},
    create: {
      email: "seed-익명@korlink.demo",
      passwordHash: ctx.pwHash,
      role: "OFFICIAL",
      name: encField("User", "name", "익명")!,
    },
  });

  const official = await prisma.user.findUnique({ where: { email: "official@korlink.co.kr" } });
  if (!official) throw new Error("seedInfo: official@korlink.co.kr 미존재 — prisma/seed.ts를 먼저 실행하세요");

  for (const p of INFO_POSTS) {
    const data = {
      boardType: "INFO" as const,
      authorId: p.author === "official" ? official.id : anon.id,
      category: p.category,
      title: p.title,
      content: p.content,
      status: "OPEN" as const,
      views: p.views,
      likes: p.likes,
      dislikes: p.dislikes,
      isPublished: p.isPublished,
      videoUrl: p.videoUrl ?? null,
      createdAt: new Date(p.date),
    };
    await prisma.post.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
  }

  for (const f of DETAIL_ATTACHMENTS) {
    const data = {
      postId: "post-i-1",
      fileUrl: `/uploads/info/${f.name}`,
      fileName: f.name,
      fileSize: Math.round(f.mb * 1024 * 1024),
    };
    await prisma.postAttachment.upsert({
      where: { id: f.id },
      update: data,
      create: { id: f.id, ...data },
    });
  }

  for (const c of DETAIL_COMMENTS) {
    const data = {
      postId: "post-i-1",
      authorId: anon.id,
      content: c.text,
      parentId: c.parentId ?? null,
      likes: c.likes,
      createdAt: new Date(c.date),
    };
    await prisma.comment.upsert({
      where: { id: c.id },
      update: data,
      create: { id: c.id, ...data },
    });
  }

  await prisma.postReaction.upsert({
    where: { id: "preact-i-1-1" },
    update: { postId: "post-i-1", userId: official.id, type: "LIKE" },
    create: { id: "preact-i-1-1", postId: "post-i-1", userId: official.id, type: "LIKE" },
  });
  await prisma.commentReaction.upsert({
    where: { id: "creact-i-1-1" },
    update: { commentId: "cmt-i-1-1", userId: official.id, type: "LIKE" },
    create: { id: "creact-i-1-1", commentId: "cmt-i-1-1", userId: official.id, type: "LIKE" },
  });

  return `info: Post ${INFO_POSTS.length}건(INFO, 게시중단 4건) / Comment ${DETAIL_COMMENTS.length}건 / 첨부 ${DETAIL_ATTACHMENTS.length}건 / 반응 2건 / 익명 유저 1명`;
}
