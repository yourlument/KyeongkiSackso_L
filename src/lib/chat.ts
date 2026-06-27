import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";
import { getSessionClaims } from "@/lib/auth/session";
import { createNotification, createNotifications } from "@/lib/notifications";

export type ChatThreadView = {
  id: string;
  title: string;
  unread: number;
  preview: string;
  org: string;
  time: string;
  buyerName: string;
  buyerDept: string;
  buyerPhone: string;
  quoteRequestId: string;
};

export type ChatMessageView = {
  id: string;
  mine: boolean;
  text: string;
  time: string;
  isSystem: boolean;
  fileUrl: string | null;
  fileName: string | null;
};

export type BuyerChatThread = {
  supplierCompanyId: string;
  threadId: string;
};

export type Viewer = {
  userId: string;
  role: "OFFICIAL" | "SUPPLIER" | "ADMIN";
  supplierCompanyId: string | null;
};

const stampFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function stamp(d: Date): string {
  return stampFormatter.format(d).replace(",", "").replace("T", " ");
}

function plain(v: string | null | undefined): string {
  if (!v) return "";
  return decrypt(v) ?? "";
}

export async function getViewer(): Promise<Viewer | null> {
  const claims = await getSessionClaims();
  if (!claims) return null;
  if (claims.role === "SUPPLIER") {
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { supplierCompanyId: true },
    });
    return { userId: claims.sub, role: "SUPPLIER", supplierCompanyId: user?.supplierCompanyId ?? null };
  }
  return { userId: claims.sub, role: claims.role as Viewer["role"], supplierCompanyId: null };
}

function isBuyerSender(senderId: string | null, officialId: string): boolean {
  return senderId != null && senderId === officialId;
}

export async function loadSupplierThreads(companyId: string): Promise<ChatThreadView[]> {
  const threads = await prisma.chatThread.findMany({
    where: { supplierCompanyId: companyId },
    include: {
      quoteRequest: {
        select: {
          title: true,
          officialId: true,
          contactOrgName: true,
          contactDepartment: true,
          contactPhone: true,
          official: {
            select: {
              name: true,
              phone: true,
              departmentName: true,
              organization: { select: { name: true } },
            },
          },
        },
      },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });

  const views = threads.map((t) => {
    const qr = t.quoteRequest;
    const buyerName = qr.contactOrgName ?? qr.official.organization?.name ?? plain(qr.official.name) ?? "구매기관";
    const buyerDept = qr.contactDepartment ?? qr.official.departmentName ?? "";
    const buyerPhone = qr.contactPhone ?? plain(qr.official.phone);
    const last = t.messages[0] ?? null;
    const unread = t.messages.filter((m) => isBuyerSender(m.senderId, qr.officialId) && !m.isRead).length;
    return {
      id: t.id,
      title: qr.title,
      unread,
      preview: last ? (last.body ?? (last.fileName ? `파일: ${last.fileName}` : "")) : "메시지를 시작하세요",
      org: buyerDept ? `${buyerName} · ${buyerDept}` : buyerName,
      time: stamp(last ? last.createdAt : t.createdAt),
      buyerName,
      buyerDept,
      buyerPhone,
      quoteRequestId: t.quoteRequestId,
      sortAt: (last ? last.createdAt : t.createdAt).getTime(),
    };
  });

  views.sort((a, b) => b.sortAt - a.sortAt);
  return views.map(({ sortAt: _sortAt, ...v }) => v);
}

async function loadThread(threadId: string) {
  return prisma.chatThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      supplierCompanyId: true,
      quoteRequestId: true,
      quoteRequest: { select: { officialId: true } },
    },
  });
}

function canAccess(thread: { supplierCompanyId: string; quoteRequest: { officialId: string } }, viewer: Viewer): boolean {
  if (viewer.role === "SUPPLIER") return viewer.supplierCompanyId != null && viewer.supplierCompanyId === thread.supplierCompanyId;
  if (viewer.role === "OFFICIAL") return viewer.userId === thread.quoteRequest.officialId;
  return false;
}

export async function loadThreadMessages(threadId: string, viewer: Viewer): Promise<ChatMessageView[] | null> {
  const thread = await loadThread(threadId);
  if (!thread) return null;
  if (!canAccess(thread, viewer)) return null;

  const officialId = thread.quoteRequest.officialId;
  const viewerIsBuyer = viewer.role === "OFFICIAL";

  if (viewerIsBuyer) {
    await prisma.chatMessage.updateMany({
      where: { threadId, isRead: false, senderId: { not: officialId } },
      data: { isRead: true },
    });
  } else {
    await prisma.chatMessage.updateMany({
      where: { threadId, isRead: false, senderId: officialId },
      data: { isRead: true },
    });
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: viewer.userId, type: "CHAT", isRead: false, link: { contains: `thread=${threadId}` } },
      data: { isRead: true },
    });
  } catch {}

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => {
    const senderIsBuyer = isBuyerSender(m.senderId, officialId);
    return {
      id: m.id,
      mine: m.isSystem ? false : senderIsBuyer === viewerIsBuyer,
      text: m.body ?? "",
      time: stamp(m.createdAt),
      isSystem: m.isSystem,
      fileUrl: m.fileUrl,
      fileName: m.fileName,
    };
  });
}

export async function sendMessage(
  threadId: string,
  viewer: Viewer,
  body: string,
  file?: { fileUrl: string; fileName: string } | null,
): Promise<ChatMessageView | null> {
  const text = body.trim();
  if (!text && !file) return null;
  const thread = await loadThread(threadId);
  if (!thread) return null;
  if (!canAccess(thread, viewer)) return null;

  const created = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId: viewer.userId,
      body: text || null,
      isRead: false,
      fileUrl: file?.fileUrl ?? null,
      fileName: file?.fileName ?? null,
    },
  });

  const officialId = thread.quoteRequest.officialId;
  const viewerIsBuyer = viewer.role === "OFFICIAL";
  const senderIsBuyer = isBuyerSender(created.senderId, officialId);

  try {
    const base = text || (file ? `파일: ${file.fileName}` : "");
    const preview = base.length > 50 ? `${base.slice(0, 50)}…` : base;
    if (senderIsBuyer) {
      const supplierUsers = await prisma.user.findMany({
        where: { supplierCompanyId: thread.supplierCompanyId },
        select: { id: true },
      });
      await createNotifications(
        supplierUsers.map((u) => ({
          userId: u.id,
          type: "CHAT" as const,
          title: "새 채팅 메시지",
          body: preview,
          link: `/partner/quotes/chat?thread=${threadId}`,
        })),
      );
    } else {
      await createNotification({
        userId: officialId,
        type: "CHAT",
        title: "새 채팅 메시지",
        body: preview,
        link: `/quotes/${thread.quoteRequestId}?thread=${threadId}`,
      });
    }
  } catch {}

  return {
    id: created.id,
    mine: senderIsBuyer === viewerIsBuyer,
    text: created.body ?? "",
    time: stamp(created.createdAt),
    isSystem: created.isSystem,
    fileUrl: created.fileUrl,
    fileName: created.fileName,
  };
}

export async function ensureBuyerThreads(quoteRequestId: string, buyerUserId: string): Promise<BuyerChatThread[] | null> {
  const request = await prisma.quoteRequest.findUnique({
    where: { id: quoteRequestId },
    select: {
      officialId: true,
      responses: { select: { supplierCompanyId: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!request) return null;
  if (request.officialId !== buyerUserId) return null;

  const result: BuyerChatThread[] = [];
  for (const r of request.responses) {
    const thread = await prisma.chatThread.upsert({
      where: { quoteRequestId_supplierCompanyId: { quoteRequestId, supplierCompanyId: r.supplierCompanyId } },
      update: {},
      create: { quoteRequestId, supplierCompanyId: r.supplierCompanyId },
      select: { id: true, supplierCompanyId: true },
    });
    result.push({ supplierCompanyId: thread.supplierCompanyId, threadId: thread.id });
  }
  return result;
}
