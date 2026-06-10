import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

async function getCartItems(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        include: {
          supplierCompany: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });
  return items.map((it) => ({
    id: it.id,
    productId: it.productId,
    npsCode: it.product.npsCode ?? null,
    name: it.product.name,
    price: Number(it.product.price),
    unit: it.product.unit,
    quantity: it.quantity,
    image: it.product.images[0]?.url ?? null,
    supplierCompanyName: it.product.supplierCompany.name,
  }));
}

export async function GET() {
  const claims = await getSessionClaims();
  if (!claims) {
    return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({ where: { userId: claims.sub } });
  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({ items: await getCartItems(cart.id) });
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

  const body = (await req.json().catch(() => null)) as
    | { productId?: string; quantity?: number }
    | null;
  const productId = body?.productId;
  const quantity = Math.max(1, Math.floor(Number(body?.quantity ?? 1)) || 1);

  if (!productId) {
    return NextResponse.json({ message: "상품을 찾을 수 없습니다" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ message: "상품을 찾을 수 없습니다" }, { status: 404 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId: claims.sub },
    update: {},
    create: { userId: claims.sub },
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });

  return NextResponse.json({ items: await getCartItems(cart.id) }, { status: 201 });
}
