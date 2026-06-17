import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const PURCHASED_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.CONTRACTED,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      buyerId: userId,
      status: { in: PURCHASED_STATUSES },
      items: { some: { productId } },
    },
    select: { id: true },
  });
  return !!order;
}
