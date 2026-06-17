import type { PrismaClient } from "@prisma/client";
import type { SeedCtx } from "./types";

type NewsRow = {
  id: string;
  type: "NOTICE" | "EVENT";
  title: string;
  date: string;
  status: "PUBLISHED" | "DRAFT";
  isPinned: boolean;
  authorName: string | null;
  views: number;
  videoUrl: string | null;
  content: string;
};

const NEWS_2_BODY =
  "2026년 6월 1일부터 신규 공급업체 입점 심사 기준이 개정됩니다.\n\n" +
  "[주요 변경사항]\n" +
  "1. 사업자등록증 유효기간 확인 강화\n" +
  "2. 보유 인증서의 최신성 확인 (발급 3년 이내)\n" +
  "3. 정산 계좌 인증 필수화\n" +
  "4. 대표자 실명 확인 절차 추가\n\n" +
  "기존 입점 업체는 해당 변경사항의 적용을 받지 않으나, 인증서 갱신 시에는 새로운 기준이 적용됩니다.";

const NEWS_ROWS: NewsRow[] = [
  { id: "news-1", type: "NOTICE", title: "시스템 정기 점검 안내 (5월 15일)", date: "2026-05-10", status: "PUBLISHED", isPinned: true, authorName: "KORLINK 관리자", views: 1240, videoUrl: null, content: "" },
  { id: "news-2", type: "NOTICE", title: "신규 업체 입점 가이드라인 개정 안내", date: "2026-05-08", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 관리자", views: 856, videoUrl: "/media/news/news-2", content: NEWS_2_BODY },
  { id: "news-3", type: "NOTICE", title: "견적 공고 등록 시 주의사항", date: "2026-05-05", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 관리자", views: 632, videoUrl: null, content: "" },
  { id: "news-4", type: "EVENT", title: "신규 입점 업체 수수료 면제 이벤트", date: "2026-05-01", status: "PUBLISHED", isPinned: true, authorName: "KORLINK 마케팅팀", views: 2105, videoUrl: "/media/news/news-4", content: "" },
  { id: "news-5", type: "EVENT", title: "화성시청 단체 구매 특별 프로모션", date: "2026-05-03", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 마케팅팀", views: 1432, videoUrl: null, content: "" },
  { id: "news-6", type: "NOTICE", title: "클레임 처리 프로세스 개편 안내", date: "2026-05-12", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 관리자", views: 567, videoUrl: null, content: "" },
  { id: "news-7", type: "NOTICE", title: "KORLINK 서비스 이용 약관 개정 안내 (2026.06.01 시행)", date: "2026-05-07", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 법무팀", views: 1023, videoUrl: null, content: "" },
  { id: "news-8", type: "NOTICE", title: "모바일 앱 출시 안내 (iOS/Android)", date: "2026-05-06", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 개발팀", views: 2341, videoUrl: null, content: "" },
  { id: "news-9", type: "NOTICE", title: "2026 상반기 고질 납품 업체 인증 발표", date: "2026-05-03", status: "PUBLISHED", isPinned: false, authorName: "KORLINK 운영팀", views: 876, videoUrl: null, content: "" },
  { id: "news-10", type: "NOTICE", title: "업체 승인 프로세스 간소화 안내", date: "2026-05-02", status: "PUBLISHED", isPinned: false, authorName: null, views: 0, videoUrl: null, content: "" },
  { id: "news-11", type: "NOTICE", title: "정산 시스템 업그레이드 안내", date: "2026-05-11", status: "DRAFT", isPinned: false, authorName: "KORLINK 관리자", views: 0, videoUrl: null, content: "" },
];

const NEWS_ATTACHMENTS: { id: string; newsId: string; fileName: string; fileSize: number }[] = [
  { id: "natt-2-1", newsId: "news-2", fileName: "신규_업체_입점_심사_가이드라인_v3.pdf", fileSize: 5242880 },
  { id: "natt-2-2", newsId: "news-2", fileName: "입점_신청_구비서류_체크리스트.xlsx", fileSize: 450048 },
  { id: "natt-2-3", newsId: "news-2", fileName: "정산계좌_인증_절차_안내.pdf", fileSize: 2097152 },
];

export async function seedNews(prisma: PrismaClient, _ctx: SeedCtx): Promise<string> {
  for (const n of NEWS_ROWS) {
    const data = {
      type: n.type,
      title: n.title,
      content: n.content,
      status: n.status,
      isPinned: n.isPinned,
      authorName: n.authorName,
      views: n.views,
      videoUrl: n.videoUrl,
      link: null as string | null,
      createdAt: new Date(n.date),
    };
    await prisma.news.upsert({
      where: { id: n.id },
      update: data,
      create: { id: n.id, ...data },
    });
  }

  for (const a of NEWS_ATTACHMENTS) {
    const data = {
      newsId: a.newsId,
      fileUrl: `/files/news/${a.fileName}`,
      fileName: a.fileName,
      fileSize: a.fileSize,
    };
    await prisma.newsAttachment.upsert({
      where: { id: a.id },
      update: data,
      create: { id: a.id, ...data },
    });
  }

  return `소식 ${NEWS_ROWS.length}건(공지 9·이벤트 2 / 게시중 10·임시저장 1·상단고정 2) + 첨부 ${NEWS_ATTACHMENTS.length}건`;
}
