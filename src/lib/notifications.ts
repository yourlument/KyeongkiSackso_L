import { prisma } from "@/lib/db";
import type { NotificationType, PrismaClient } from "@prisma/client";

export type NotificationCategory = "orderPayment" | "quoteNotice" | "delivery" | "marketing";

export type NotificationInput = {
                                                                                
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  category?: NotificationCategory | null;
};

type NotificationClient = Pick<
  PrismaClient,
  "notification" | "userNotificationSetting"
>;

type CategoryFlags = {
  orderPayment: boolean;
  quoteNotice: boolean;
  delivery: boolean;
  marketing: boolean;
};

const CATEGORY_DEFAULT: CategoryFlags = {
  orderPayment: true,
  quoteNotice: true,
  delivery: true,
  marketing: false,
};

function categoryEnabled(setting: CategoryFlags | undefined, category: NotificationCategory): boolean {
  if (!setting) return CATEGORY_DEFAULT[category];
  return setting[category];
}

export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  date: string;
  unread: boolean;
  link: string | null;
};

const kstFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatKst(d: Date): string {
  return kstFormatter.format(d).replace(",", "");
}

export async function createNotification(
  input: NotificationInput,
  db: NotificationClient = prisma,
): Promise<void> {
  if (input.category) {
    const setting = (await db.userNotificationSetting.findUnique({
      where: { userId: input.userId },
    })) ?? undefined;
    if (!categoryEnabled(setting, input.category)) return;
  }
  await db.notification.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  });
}

export async function createNotifications(
  inputs: NotificationInput[],
  db: NotificationClient = prisma,
): Promise<void> {
  if (inputs.length === 0) return;
  let allow = inputs;
  const gated = inputs.filter((i) => i.category);
  if (gated.length > 0) {
    const ids = Array.from(new Set(gated.map((i) => i.userId)));
    const rows = await db.userNotificationSetting.findMany({ where: { userId: { in: ids } } });
    const map = new Map(rows.map((r) => [r.userId, r as CategoryFlags]));
    allow = inputs.filter((i) => !i.category || categoryEnabled(map.get(i.userId), i.category));
  }
  if (allow.length === 0) return;
  await db.notification.createMany({
    data: allow.map((i) => ({
      ...(i.id ? { id: i.id } : {}),
      userId: i.userId,
      type: i.type,
      title: i.title,
      body: i.body ?? null,
      link: i.link ?? null,
    })),
                                                                             
                                                                           
                                        
    skipDuplicates: true,
  });
}

export async function getNotificationsFor(
  userId: string,
): Promise<{ items: NotificationView[]; unreadCount: number }> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  const items: NotificationView[] = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body ?? "",
    date: formatKst(n.createdAt),
    unread: !n.isRead,
    link: n.link,
  }));
  return { items, unreadCount };
}

export async function markNotificationsRead(userId: string, id?: string): Promise<void> {
  await prisma.notification.updateMany({
    where: id ? { userId, id } : { userId, isRead: false },
    data: { isRead: true },
  });
}
