import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createNotifications } from "@/lib/notifications";

type QuoteNotificationClient = Pick<
  PrismaClient,
  | "category"
  | "notification"
  | "product"
  | "quoteRequest"
  | "user"
  | "userNotificationSetting"
>;

const ELIGIBLE_SUPPLIER = {
  approvalStatus: "APPROVED" as const,
  isRestricted: false,
                                                                             
                                                                           
  bankVerifiedAt: { not: null },
};

   
                                                                             
                                                                            
                                              
   
export function quoteRequestNotificationId(
  quoteRequestId: string,
  userId: string,
): string {
  return `quote-request-published:${quoteRequestId}:${userId}`;
}

async function descendantCategoryIds(
  categoryId: string,
  db: Pick<PrismaClient, "category">,
): Promise<string[]> {
  const categories = await db.category.findMany({
    select: { id: true, parentId: true },
  });
  const ids = new Set([categoryId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        changed = true;
      }
    }
  }

  return [...ids];
}

   
                                                                      
  
                                                                             
                                                                           
                                                                              
                                                        
   
export async function notifyQuoteRequestPublished(
  quoteRequestId: string,
  db: QuoteNotificationClient = prisma,
): Promise<void> {
  const quote = await db.quoteRequest.findUnique({
    where: { id: quoteRequestId },
    select: {
      id: true,
      title: true,
      status: true,
      kind: true,
      targetSupplierCompanyId: true,
      categoryId: true,
      npsCode: true,
    },
  });
  if (!quote || quote.status !== "OPEN") return;

  let companyIds: string[];
  if (quote.kind === "DIRECT") {
    companyIds = quote.targetSupplierCompanyId ? [quote.targetSupplierCompanyId] : [];
  } else {
    const categoryIds = quote.categoryId
      ? await descendantCategoryIds(quote.categoryId, db)
      : [];
                                                                        
                                                                            
    if (categoryIds.length === 0 && !quote.npsCode) return;

    const products = await db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
        ...(quote.npsCode ? { npsCode: quote.npsCode } : {}),
        supplierCompany: ELIGIBLE_SUPPLIER,
      },
      select: { supplierCompanyId: true },
    });
    companyIds = [...new Set(products.map((product) => product.supplierCompanyId))];
  }
  if (companyIds.length === 0) return;

  const users = await db.user.findMany({
    where: {
      role: "SUPPLIER",
      status: "ACTIVE",
      deletedAt: null,
      supplierCompanyId: { in: companyIds },
      supplierCompany: ELIGIBLE_SUPPLIER,
    },
    select: { id: true },
  });
  if (users.length === 0) return;

  const isDirect = quote.kind === "DIRECT";
  const link = isDirect
    ? `/partner/quotes?tab=product&request=${encodeURIComponent(quote.id)}`
    : `/quotes/${encodeURIComponent(quote.id)}`;

  await createNotifications(
    users.map((user) => ({
      id: quoteRequestNotificationId(quote.id, user.id),
      userId: user.id,
      type: "SYSTEM" as const,
      title: isDirect ? "새 견적 요청" : "새 견적 공고",
      body: `'${quote.title}'${isDirect ? " 견적 요청이 도착했습니다." : " 공고가 등록되었습니다."}`,
      link,
      category: "quoteNotice" as const,
    })),
    db,
  );
}
