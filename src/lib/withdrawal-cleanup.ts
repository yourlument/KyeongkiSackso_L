import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { encField } from "@/lib/crypto/pii";

export const WITHDRAWAL_REJOIN_DAYS = 30;
const WITHDRAWAL_PURGE_BATCH_SIZE = 50;

export function withdrawalPurgeCutoff(now = new Date()): Date {
  return new Date(now.getTime() - WITHDRAWAL_REJOIN_DAYS * 24 * 60 * 60 * 1000);
}

export function isWithdrawalPurgeDue(
  deletedAt: Date | null | undefined,
  now = new Date(),
): boolean {
  return !!deletedAt && deletedAt.getTime() <= withdrawalPurgeCutoff(now).getTime();
}

export function withdrawnTombstoneEmail(userId: string): string {
  return `withdrawn-${userId}@deleted.korlink.invalid`;
}

async function purgeWithdrawnUser(userId: string, now: Date): Promise<boolean> {
  const cutoff = withdrawalPurgeCutoff(now);
  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.user.updateMany({
      where: {
        id: userId,
        status: "WITHDRAWN",
        deletedAt: { lte: cutoff },
      },
      data: {
        email: withdrawnTombstoneEmail(userId),
        passwordHash,
        name: encField("User", "name", "탈퇴회원")!,
        phone: null,
        organizationId: null,
        departmentName: null,
        position: null,
        supplierCompanyId: null,
        mustChangePassword: false,
                                                                                        
        deletedAt: null,
      },
    });
    if (claimed.count === 0) return false;

    await tx.refreshToken.deleteMany({ where: { userId } });
    await tx.userTermAgreement.deleteMany({ where: { userId } });
    await tx.userNotificationSetting.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.cart.deleteMany({ where: { userId } });
    await tx.postReaction.deleteMany({ where: { userId } });
    await tx.commentReaction.deleteMany({ where: { userId } });

    await tx.postAttachment.deleteMany({ where: { post: { authorId: userId } } });
    await tx.post.updateMany({
      where: { authorId: userId },
      data: { title: "삭제된 게시글", content: "", isPublished: false },
    });
    await tx.comment.updateMany({ where: { authorId: userId }, data: { content: "" } });
    await tx.chatMessage.updateMany({
      where: { senderId: userId },
      data: { senderId: null, body: null, fileUrl: null, fileName: null },
    });
    await tx.review.updateMany({ where: { userId }, data: { content: null } });
    await tx.inquiry.updateMany({
      where: { userId },
      data: {
        title: "탈퇴 회원 문의",
        content: "",
        contactName: null,
        contactOrg: null,
        contactPhone: null,
        contactEmail: null,
      },
    });
    await tx.report.updateMany({
      where: { reporterId: userId },
      data: {
        title: null,
        contactName: null,
        contactOrg: null,
        contactPhone: null,
        contactEmail: null,
      },
    });
    await tx.quoteRequest.updateMany({
      where: { officialId: userId },
      data: {
        contactOrgName: null,
        contactDepartment: null,
        contactEmail: null,
        contactPhone: null,
        deliveryAddress: null,
        deliveryAddressDetail: null,
      },
    });
    await tx.order.updateMany({
      where: { buyerId: userId },
      data: {
        recipientName: null,
        recipientPhone: null,
        recipientOrgName: null,
        recipientDepartment: null,
        deliveryAddress: null,
        deliveryAddressDetail: null,
        deliveryMemo: null,
        siteContactPhone: null,
      },
    });

    return true;
  });
}

export async function purgeExpiredWithdrawnUsers(input: {
  now?: Date;
  userId?: string;
} = {}): Promise<{ purged: number }> {
  const now = input.now ?? new Date();
  const users = await prisma.user.findMany({
    where: {
      status: "WITHDRAWN",
      deletedAt: { lte: withdrawalPurgeCutoff(now) },
      ...(input.userId ? { id: input.userId } : {}),
    },
    select: { id: true },
    take: input.userId ? 1 : WITHDRAWAL_PURGE_BATCH_SIZE,
    orderBy: { deletedAt: "asc" },
  });

  let purged = 0;
  for (const user of users) {
    if (await purgeWithdrawnUser(user.id, now)) purged += 1;
  }
  return { purged };
}
