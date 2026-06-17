import type { PrismaClient } from "@prisma/client";
import type { NotificationType } from "@prisma/client";
import type { SeedCtx } from "./types";

const NOTIFICATIONS: {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: Date;
  isRead: boolean;
}[] = [
  {
    id: "notif-1",
    type: "QUOTE_RESPONSE",
    title: "견적요청 답변",
    body: "'화성시청 IT장비 신규 구축'에 디지털솔루션(주)가 견적을 제출했습니다.",
    createdAt: new Date("2026-05-07T14:30:00+09:00"),
    isRead: false,
  },
  {
    id: "notif-2",
    type: "BOARD_REPLY",
    title: "수요 게시판 답변",
    body: "'무인 냉장고 임대' 수요 게시에 경기냉동이 답변을 달았습니다.",
    createdAt: new Date("2026-05-07T11:20:00+09:00"),
    isRead: false,
  },
  {
    id: "notif-3",
    type: "INFO_COMMENT",
    title: "정보 공유 답글",
    body: "'나라장터 물품식별번호 조회 팁'에 박주임이 댓글을 달았습니다.",
    createdAt: new Date("2026-05-06T16:45:00+09:00"),
    isRead: false,
  },
  {
    id: "notif-4",
    type: "QUOTE_AWARDED",
    title: "견적 선정 결과",
    body: "'화성시 소방서 장비 보강' 견적에 안전소방(주)이 선정되었습니다.",
    createdAt: new Date("2026-05-05T09:00:00+09:00"),
    isRead: true,
  },
  {
    id: "notif-5",
    type: "ORDER_STATUS",
    title: "주문 상태 변경",
    body: "'업무용 PC 5대' 주문이 배송완료 처리되었습니다.",
    createdAt: new Date("2026-05-04T18:00:00+09:00"),
    isRead: true,
  },
  {
    id: "notif-6",
    type: "SYSTEM",
    title: "시스템 알림",
    body: "KORLINK 플랫폼 서비스 이용약관이 5월 15일부터 변경됩니다.",
    createdAt: new Date("2026-05-03T10:00:00+09:00"),
    isRead: true,
  },
  {
    id: "notif-7",
    type: "QUOTE_RESPONSE",
    title: "견적요청 답변",
    body: "'도로보수 자재'에 경기건설(주)가 견적을 제출했습니다.",
    createdAt: new Date("2026-05-02T13:15:00+09:00"),
    isRead: true,
  },
];

const DEFAULT_ALARM = {
  orderPayment: true,
  quoteNotice: true,
  delivery: true,
  marketing: false,
};

export async function seedNotifications(prisma: PrismaClient, _ctx: SeedCtx): Promise<string> {
  const official = await prisma.user.findUnique({ where: { email: "official@korlink.co.kr" } });
  if (!official) throw new Error("seedNotifications: official@korlink.co.kr 사용자가 없습니다 (seed.ts 선행 필요)");

  const supplier = await prisma.user.findUnique({ where: { email: "supplier@korlink.co.kr" } });
  if (!supplier) throw new Error("seedNotifications: supplier@korlink.co.kr 사용자가 없습니다 (seed.ts 선행 필요)");

  for (const n of NOTIFICATIONS) {
    const data = {
      userId: official.id,
      type: n.type,
      title: n.title,
      body: n.body,
      link: null,
      isRead: n.isRead,
      createdAt: n.createdAt,
    };
    await prisma.notification.upsert({
      where: { id: n.id },
      update: data,
      create: { id: n.id, ...data },
    });
  }

  for (const userId of [official.id, supplier.id]) {
    await prisma.userNotificationSetting.upsert({
      where: { userId },
      update: DEFAULT_ALARM,
      create: { userId, ...DEFAULT_ALARM },
    });
  }

  return `notifications: 알림 ${NOTIFICATIONS.length}건(official, 미읽음 ${NOTIFICATIONS.filter((n) => !n.isRead).length}) + 알림설정 2명(official/supplier)`;
}
