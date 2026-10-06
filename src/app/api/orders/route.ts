import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getPublicAppUrl } from "@/lib/nicepay/config";
import {
  createNicepayCheckout,
  type NicepayMethod,
} from "@/lib/nicepay/payment";
import { isValidKoreanPhone } from "@/lib/validators/phone";

export const dynamic = "force-dynamic";

const recipientSchema = z.object({
  name: z.string(),
  phone: z.string().refine(isValidKoreanPhone),
  org: z.string(),
  dept: z.string(),
  address: z.string(),
  memo: z.string().optional(),
});

const schema = z.object({
  pay: z.enum(["card", "bank", "virtual"]),
  checkoutKey: z.string().uuid(),
  quoteResponseId: z.string().optional(),
  directItem: z
    .object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(999),
    })
    .optional(),
  recipient: recipientSchema,
}).refine((value) => !(value.quoteResponseId && value.directItem));

type RecipientInput = z.infer<typeof recipientSchema>;
type CheckoutPayMethod = z.infer<typeof schema>["pay"];

function kstYear(): string {
  return new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(new Date());
}

function genOrderNo(): string {
  return `ORD-${kstYear()}-${Date.now().toString().slice(-9)}${randomInt(10, 99)}`;
}

function amountAsNumber(amount: Prisma.Decimal): number {
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("결제 금액이 올바르지 않습니다.");
  }
  return value;
}

function payMethod(pay: CheckoutPayMethod): {
  nicepay: NicepayMethod;
  label: string;
} {
  if (pay === "bank") {
    return { nicepay: "BANK", label: "계좌이체" };
  }
  if (pay === "virtual") {
    return { nicepay: "VBANK", label: "가상계좌" };
  }
  return { nicepay: "CARD", label: "법인카드" };
}

function paymentMethodFromLabel(method: string | null): NicepayMethod {
  if (method === "계좌이체") return "BANK";
  if (method === "가상계좌") return "VBANK";
  return "CARD";
}

function checkoutResponse(
  req: Request,
  input: {
    paymentId: string;
    orderNo: string;
    amount: Prisma.Decimal;
    method: NicepayMethod;
    goodsName: string;
    buyerName: string;
    buyerTel?: string | null;
    buyerEmail?: string | null;
  },
  status = 201,
): NextResponse {
  const returnUrl = `${getPublicAppUrl(req.url)}/api/payments/nicepay/approve`;
  const payment = createNicepayCheckout({
    paymentId: input.paymentId,
    method: input.method,
    amount: amountAsNumber(input.amount),
    goodsName: input.goodsName,
    buyerName: input.buyerName,
    buyerTel: input.buyerTel,
    buyerEmail: input.buyerEmail,
    returnUrl,
  });
  return NextResponse.json(
    { orderNo: input.orderNo, payment },
    { status },
  );
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
    return NextResponse.json(
      { message: "입력값을 확인해 주세요" },
      { status: 400 },
    );
  }
  const { pay, checkoutKey, recipient, quoteResponseId, directItem } = parsed.data;
  if (
    !recipient.name.trim() ||
    !recipient.phone.trim() ||
    !recipient.org.trim() ||
    !recipient.dept.trim() ||
    !recipient.address.trim()
  ) {
    return NextResponse.json(
      { message: "입력값을 확인해 주세요" },
      { status: 400 },
    );
  }

  const existing = await prisma.payment.findUnique({
    where: { requestKey: checkoutKey },
    include: {
      order: {
        include: {
          buyer: { select: { email: true } },
          items: { select: { name: true } },
        },
      },
    },
  });
  if (existing) {
    if (existing.order.buyerId !== claims.sub) {
      return NextResponse.json(
        { message: "이미 사용된 결제 요청입니다." },
        { status: 409 },
      );
    }
    if (existing.status !== "READY") {
      return NextResponse.json(
        { message: "이미 처리된 결제 요청입니다." },
        { status: 409 },
      );
    }
    return checkoutResponse(
      req,
      {
        paymentId: existing.id,
        orderNo: existing.order.orderNo,
        amount: existing.amount,
        method: paymentMethodFromLabel(existing.method),
        goodsName: existing.order.items[0]?.name ?? "KORLINK 주문",
        buyerName: existing.order.recipientName ?? recipient.name,
        buyerTel: existing.order.recipientPhone,
        buyerEmail: existing.order.buyer.email,
      },
      200,
    );
  }

  if (quoteResponseId) {
    return createQuoteOrder({
      req,
      quoteResponseId,
      buyerId: claims.sub,
      pay,
      checkoutKey,
      recipient,
    });
  }
  if (directItem) {
    return createDirectOrder({
      req,
      buyerId: claims.sub,
      pay,
      checkoutKey,
      recipient,
      directItem,
    });
  }
  return createCartOrder({
    req,
    buyerId: claims.sub,
    pay,
    checkoutKey,
    recipient,
  });
}

async function createDirectOrder(input: {
  req: Request;
  buyerId: string;
  pay: CheckoutPayMethod;
  checkoutKey: string;
  recipient: RecipientInput;
  directItem: { productId: string; quantity: number };
}): Promise<NextResponse> {
  const [buyer, product] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.buyerId },
      select: { email: true },
    }),
    prisma.product.findUnique({
      where: { id: input.directItem.productId },
      select: {
        id: true,
        name: true,
        price: true,
        supplierCompanyId: true,
        status: true,
      },
    }),
  ]);
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "상품을 찾을 수 없습니다" },
      { status: 404 },
    );
  }

  const unitPrice = new Prisma.Decimal(product.price);
  const totalAmount = unitPrice.mul(input.directItem.quantity);
  const method = payMethod(input.pay);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNo: genOrderNo(),
          buyerId: input.buyerId,
          totalAmount,
          status: "PENDING",
          taxInvoiceStatus: "NONE",
          recipientName: input.recipient.name.trim(),
          recipientPhone: input.recipient.phone.trim(),
          recipientOrgName: input.recipient.org.trim(),
          recipientDepartment: input.recipient.dept.trim(),
          deliveryAddress: input.recipient.address.trim(),
          deliveryMemo: input.recipient.memo?.trim() || null,
          items: {
            create: {
              productId: product.id,
              supplierCompanyId: product.supplierCompanyId,
              name: product.name,
              spec: null,
              quantity: input.directItem.quantity,
              unitPrice,
              amount: totalAmount,
            },
          },
        },
        select: { id: true, orderNo: true },
      });
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "NICEPAY",
          status: "READY",
          amount: totalAmount,
          method: method.label,
          requestKey: input.checkoutKey,
          metadata: {
            integration: "nicepay-auth-v3",
            checkoutSource: "direct",
          },
        },
        select: { id: true },
      });
      return { order, payment };
    });

    return checkoutResponse(input.req, {
      paymentId: result.payment.id,
      orderNo: result.order.orderNo,
      amount: totalAmount,
      method: method.nicepay,
      goodsName: product.name,
      buyerName: input.recipient.name,
      buyerTel: input.recipient.phone,
      buyerEmail: buyer?.email,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "중복 결제 요청입니다. 다시 시도해 주세요." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "결제 준비 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}

async function createCartOrder(input: {
  req: Request;
  buyerId: string;
  pay: CheckoutPayMethod;
  checkoutKey: string;
  recipient: RecipientInput;
}): Promise<NextResponse> {
  const cart = await prisma.cart.findUnique({
    where: { userId: input.buyerId },
    select: { id: true },
  });
  if (!cart) {
    return NextResponse.json(
      { message: "결제할 상품이 없습니다" },
      { status: 400 },
    );
  }
  const [buyer, lines] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.buyerId },
      select: { email: true },
    }),
    prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            supplierCompanyId: true,
            status: true,
          },
        },
      },
    }),
  ]);
  if (lines.length === 0) {
    return NextResponse.json(
      { message: "결제할 상품이 없습니다" },
      { status: 400 },
    );
  }
  if (lines.some((line) => line.product.status !== "ACTIVE")) {
    return NextResponse.json(
      { message: "상품을 찾을 수 없습니다" },
      { status: 400 },
    );
  }

  const items = lines.map((line) => ({
    productId: line.productId,
    supplierCompanyId: line.product.supplierCompanyId,
    name: line.product.name,
    spec: null,
    quantity: line.quantity,
    unitPrice: new Prisma.Decimal(line.product.price),
    amount: new Prisma.Decimal(line.product.price).mul(line.quantity),
  }));
  const totalAmount = items.reduce(
    (sum, item) => sum.add(item.amount),
    new Prisma.Decimal(0),
  );
  const method = payMethod(input.pay);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNo: genOrderNo(),
          buyerId: input.buyerId,
          totalAmount,
          status: "PENDING",
          taxInvoiceStatus: "NONE",
          recipientName: input.recipient.name.trim(),
          recipientPhone: input.recipient.phone.trim(),
          recipientOrgName: input.recipient.org.trim(),
          recipientDepartment: input.recipient.dept.trim(),
          deliveryAddress: input.recipient.address.trim(),
          deliveryMemo: input.recipient.memo?.trim() || null,
          items: { create: items },
        },
        select: { id: true, orderNo: true },
      });
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "NICEPAY",
          status: "READY",
          amount: totalAmount,
          method: method.label,
          requestKey: input.checkoutKey,
          metadata: {
            integration: "nicepay-auth-v3",
            cartItemIds: lines.map((line) => line.id),
          },
        },
        select: { id: true },
      });
      return { order, payment };
    });

    return checkoutResponse(input.req, {
      paymentId: result.payment.id,
      orderNo: result.order.orderNo,
      amount: totalAmount,
      method: method.nicepay,
      goodsName:
        lines.length > 1
          ? `${lines[0].product.name} 외 ${lines.length - 1}건`
          : lines[0].product.name,
      buyerName: input.recipient.name,
      buyerTel: input.recipient.phone,
      buyerEmail: buyer?.email,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "중복 결제 요청입니다. 다시 시도해 주세요." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "결제 준비 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}

async function createQuoteOrder(input: {
  req: Request;
  quoteResponseId: string;
  buyerId: string;
  pay: CheckoutPayMethod;
  checkoutKey: string;
  recipient: RecipientInput;
}): Promise<NextResponse> {
  const response = await prisma.quoteResponse.findUnique({
    where: { id: input.quoteResponseId },
    include: {
      supplierCompany: { select: { name: true } },
      quoteRequest: {
        select: {
          id: true,
          officialId: true,
          awardedResponseId: true,
          order: {
            include: {
              buyer: { select: { email: true } },
              items: { select: { name: true } },
              payments: { orderBy: { createdAt: "desc" } },
            },
          },
          items: {
            select: {
              id: true,
              name: true,
              spec: true,
              quantity: true,
            },
          },
        },
      },
      items: {
        select: {
          quoteRequestItemId: true,
          unitPrice: true,
          amount: true,
        },
      },
    },
  });

  if (!response || response.quoteRequest.officialId !== input.buyerId) {
    return NextResponse.json(
      { message: "주문할 견적을 찾을 수 없습니다" },
      { status: 404 },
    );
  }
  if (
    response.quoteRequest.awardedResponseId !== input.quoteResponseId ||
    response.status !== "AWARDED"
  ) {
    return NextResponse.json(
      { message: "선정된 견적만 발주할 수 있습니다" },
      { status: 409 },
    );
  }

  const method = payMethod(input.pay);
  const currentOrder = response.quoteRequest.order;
  if (currentOrder) {
    if (currentOrder.status !== "PENDING") {
      return NextResponse.json(
        { message: "이미 발주 및 결제가 처리된 견적입니다." },
        { status: 409 },
      );
    }
    const ready = currentOrder.payments.find(
      (payment) => payment.status === "READY",
    );
    const payment =
      ready ??
      (await prisma.payment.create({
        data: {
          orderId: currentOrder.id,
          provider: "NICEPAY",
          status: "READY",
          amount: currentOrder.totalAmount,
          method: method.label,
          requestKey: input.checkoutKey,
          metadata: { integration: "nicepay-auth-v3" },
        },
      }));
    return checkoutResponse(
      input.req,
      {
        paymentId: payment.id,
        orderNo: currentOrder.orderNo,
        amount: payment.amount,
        method: paymentMethodFromLabel(payment.method),
        goodsName:
          currentOrder.items[0]?.name ?? response.supplierCompany.name,
        buyerName: currentOrder.recipientName ?? input.recipient.name,
        buyerTel: currentOrder.recipientPhone,
        buyerEmail: currentOrder.buyer.email,
      },
      200,
    );
  }

  const itemByRequest = new Map(
    response.items.map((item) => [item.quoteRequestItemId, item]),
  );
  const items = response.quoteRequest.items.map((requestItem) => {
    const offered = itemByRequest.get(requestItem.id);
    return {
      productId: null,
      supplierCompanyId: response.supplierCompanyId,
      name: requestItem.name,
      spec: requestItem.spec,
      quantity: requestItem.quantity,
      unitPrice: offered?.unitPrice ?? new Prisma.Decimal(0),
      amount: offered?.amount ?? new Prisma.Decimal(0),
    };
  });
  const totalAmount = new Prisma.Decimal(response.totalAmount);
  const buyer = await prisma.user.findUnique({
    where: { id: input.buyerId },
    select: { email: true },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNo: genOrderNo(),
          buyerId: input.buyerId,
          quoteRequestId: response.quoteRequest.id,
          quoteResponseId: input.quoteResponseId,
          totalAmount,
          status: "PENDING",
          taxInvoiceStatus: "NONE",
          recipientName: input.recipient.name.trim(),
          recipientPhone: input.recipient.phone.trim(),
          recipientOrgName: input.recipient.org.trim(),
          recipientDepartment: input.recipient.dept.trim(),
          deliveryAddress: input.recipient.address.trim(),
          deliveryMemo: input.recipient.memo?.trim() || null,
          items: { create: items },
        },
        select: { id: true, orderNo: true },
      });
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "NICEPAY",
          status: "READY",
          amount: totalAmount,
          method: method.label,
          requestKey: input.checkoutKey,
          metadata: { integration: "nicepay-auth-v3" },
        },
        select: { id: true },
      });
      return { order, payment };
    });

    return checkoutResponse(input.req, {
      paymentId: result.payment.id,
      orderNo: result.order.orderNo,
      amount: totalAmount,
      method: method.nicepay,
      goodsName:
        response.quoteRequest.items[0]?.name ?? response.supplierCompany.name,
      buyerName: input.recipient.name,
      buyerTel: input.recipient.phone,
      buyerEmail: buyer?.email,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "이미 진행 중인 발주 결제가 있습니다." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "결제 준비 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
