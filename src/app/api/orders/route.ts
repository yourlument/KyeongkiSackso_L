import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";
import { createNotification, createNotifications } from "@/lib/notifications";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const recipientSchema = z.object({
  name: z.string(),
  phone: z.string(),
  org: z.string(),
  dept: z.string(),
  address: z.string(),
  memo: z.string().optional(),
});

const schema = z.object({
  pay: z.enum(["card", "virtual"]),
  quoteResponseId: z.string().optional(),
  recipient: recipientSchema,
});

function kstYear(): string {
  const k = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return k.toISOString().slice(0, 4);
}

function genOrderNo(): string {
  return `ORD-${kstYear()}-${Date.now().toString().slice(-9)}`;
}

export async function POST(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  }
  if (claims.role === "SUPPLIER") {
    return NextResponse.json(
      { message: "공급업체 계정은 구매 및 견적 요청 기능을 이용할 수 없습니다" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }
  const { pay, recipient, quoteResponseId } = parsed.data;
  if (
    !recipient.name.trim() ||
    !recipient.phone.trim() ||
    !recipient.org.trim() ||
    !recipient.dept.trim() ||
    !recipient.address.trim()
  ) {
    return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  }

  if (quoteResponseId) {
    return createQuoteOrder(quoteResponseId, claims.sub, pay, recipient);
  }

  const cart = await prisma.cart.findUnique({ where: { userId: claims.sub } });
  if (!cart) {
    return NextResponse.json({ message: "결제할 상품이 없습니다" }, { status: 400 });
  }

  const lines = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        select: { id: true, name: true, price: true, unit: true, supplierCompanyId: true, status: true },
      },
    },
  });
  if (lines.length === 0) {
    return NextResponse.json({ message: "결제할 상품이 없습니다" }, { status: 400 });
  }
  if (lines.some((l) => l.product.status !== "ACTIVE")) {
    return NextResponse.json({ message: "상품을 찾을 수 없습니다" }, { status: 400 });
  }

  const itemData = lines.map((l) => ({
    productId: l.productId,
    supplierCompanyId: l.product.supplierCompanyId,
    name: l.product.name,
    spec: null,
    quantity: l.quantity,
    unitPrice: new Prisma.Decimal(l.product.price),
    amount: new Prisma.Decimal(l.product.price).mul(l.quantity),
  }));
  const totalAmount = itemData.reduce(
    (s, it) => s.add(it.amount),
    new Prisma.Decimal(0),
  );

  const method = pay === "card" ? "법인카드" : "가상계좌";
  const buyerId = claims.sub;

  let created: { orderNo: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNo = genOrderNo();
    try {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNo,
            buyerId,
            totalAmount,
            status: "PAID",
            taxInvoiceStatus: "NONE",
            recipientName: recipient.name,
            recipientPhone: recipient.phone,
            recipientOrgName: recipient.org,
            recipientDepartment: recipient.dept,
            deliveryAddress: recipient.address,
            deliveryMemo: recipient.memo ?? null,
            items: { create: itemData },
          },
          select: { id: true, orderNo: true },
        });
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "MOCK",
            status: "PAID",
            amount: totalAmount,
            method,
            transactionId: null,
            metadata: { provisional: true },
            paidAt: new Date(),
          },
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return { orderNo: order.orderNo };
      });
      created = result;
      break;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        continue;
      }
      return NextResponse.json({ message: "결제 처리 중 오류가 발생했습니다" }, { status: 500 });
    }
  }

  if (!created) {
    return NextResponse.json({ message: "결제 처리 중 오류가 발생했습니다" }, { status: 500 });
  }

  try {
    const first = lines[0].product.name;
    const label = lines.length > 1 ? `${first} 외 ${lines.length - 1}건` : first;
    await createNotification({
      userId: buyerId,
      type: "ORDER_STATUS",
      title: "주문 상태 변경",
      body: `'${label}' 주문이 결제완료 처리되었습니다.`,
      link: "/mypage",
      category: "orderPayment",
    });
  } catch {}

  try {
    const byCompany = new Map<string, string[]>();
    for (const it of itemData) {
      const names = byCompany.get(it.supplierCompanyId) ?? [];
      names.push(it.name);
      byCompany.set(it.supplierCompanyId, names);
    }
    const supplierUsers = await prisma.user.findMany({
      where: { supplierCompanyId: { in: Array.from(byCompany.keys()) } },
      select: { id: true, supplierCompanyId: true },
    });
    const supplierNotis = supplierUsers.flatMap((u) => {
      const names = u.supplierCompanyId ? byCompany.get(u.supplierCompanyId) ?? [] : [];
      if (names.length === 0) return [];
      const label = names.length > 1 ? `${names[0]} 외 ${names.length - 1}건` : names[0];
      return [{
        userId: u.id,
        type: "ORDER_STATUS" as const,
        title: "새 주문 접수",
        body: `'${label}' 주문이 접수되었습니다.`,
        link: "/partner/orders",
        category: "orderPayment" as const,
      }];
    });
    await createNotifications(supplierNotis);
  } catch {}

  return NextResponse.json({ orderNo: created.orderNo }, { status: 201 });
}

type RecipientInput = z.infer<typeof recipientSchema>;

async function createQuoteOrder(
  quoteResponseId: string,
  buyerId: string,
  pay: "card" | "virtual",
  recipient: RecipientInput,
): Promise<NextResponse> {
  const response = await prisma.quoteResponse.findUnique({
    where: { id: quoteResponseId },
    include: {
      supplierCompany: { select: { name: true } },
      quoteRequest: {
        select: {
          id: true,
          officialId: true,
          status: true,
          awardedResponseId: true,
          order: { select: { orderNo: true } },
          items: { select: { id: true, name: true, spec: true, quantity: true, unit: true } },
        },
      },
      items: { select: { quoteRequestItemId: true, unitPrice: true, amount: true } },
    },
  });

  if (!response || response.quoteRequest.officialId !== buyerId) {
    return NextResponse.json({ message: "주문할 견적을 찾을 수 없습니다" }, { status: 404 });
  }
  if (response.quoteRequest.awardedResponseId !== quoteResponseId || response.status !== "AWARDED") {
    return NextResponse.json({ message: "선정된 견적만 발주할 수 있습니다" }, { status: 409 });
  }
  if (response.quoteRequest.order) {
    return NextResponse.json({ orderNo: response.quoteRequest.order.orderNo }, { status: 200 });
  }

  const itemByRequestItem = new Map(response.items.map((i) => [i.quoteRequestItemId, i]));
  const itemData = response.quoteRequest.items.map((reqItem) => {
    const ri = itemByRequestItem.get(reqItem.id);
    const unitPrice = ri ? ri.unitPrice : new Prisma.Decimal(0);
    const amount = ri ? ri.amount : new Prisma.Decimal(0);
    return {
      productId: null,
      supplierCompanyId: response.supplierCompanyId,
      name: reqItem.name,
      spec: reqItem.spec,
      quantity: reqItem.quantity,
      unitPrice,
      amount,
    };
  });
  const totalAmount = new Prisma.Decimal(response.totalAmount);
  const method = pay === "card" ? "법인카드" : "가상계좌";

  let created: { orderNo: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNo = genOrderNo();
    try {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNo,
            buyerId,
            quoteRequestId: response.quoteRequest.id,
            quoteResponseId,
            totalAmount,
            status: "PAID",
            taxInvoiceStatus: "NONE",
            recipientName: recipient.name,
            recipientPhone: recipient.phone,
            recipientOrgName: recipient.org,
            recipientDepartment: recipient.dept,
            deliveryAddress: recipient.address,
            deliveryMemo: recipient.memo ?? null,
            items: { create: itemData },
          },
          select: { id: true, orderNo: true },
        });
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "MOCK",
            status: "PAID",
            amount: totalAmount,
            method,
            transactionId: null,
            metadata: { provisional: true },
            paidAt: new Date(),
          },
        });
        return { orderNo: order.orderNo };
      });
      created = result;
      break;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const existing = await prisma.order.findFirst({
          where: { quoteResponseId },
          select: { orderNo: true },
        });
        if (existing) {
          return NextResponse.json({ orderNo: existing.orderNo }, { status: 200 });
        }
        continue;
      }
      return NextResponse.json({ message: "결제 처리 중 오류가 발생했습니다" }, { status: 500 });
    }
  }

  if (!created) {
    return NextResponse.json({ message: "결제 처리 중 오류가 발생했습니다" }, { status: 500 });
  }

  const label = response.quoteRequest.items[0]?.name ?? response.supplierCompany.name;
  try {
    await createNotification({
      userId: buyerId,
      type: "ORDER_STATUS",
      title: "주문 상태 변경",
      body: `'${label}' 주문이 결제완료 처리되었습니다.`,
      link: "/mypage",
      category: "orderPayment",
    });
  } catch {}

  try {
    const supplierUsers = await prisma.user.findMany({
      where: { supplierCompanyId: response.supplierCompanyId },
      select: { id: true },
    });
    await createNotifications(
      supplierUsers.map((u) => ({
        userId: u.id,
        type: "ORDER_STATUS" as const,
        title: "새 주문 접수",
        body: `'${label}' 주문이 접수되었습니다.`,
        link: "/partner/orders",
        category: "orderPayment" as const,
      })),
    );
  } catch {}

  return NextResponse.json({ orderNo: created.orderNo }, { status: 201 });
}
