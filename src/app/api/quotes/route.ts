import { NextRequest, NextResponse } from "next/server";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "OFFICIAL") {
    return NextResponse.json({ error: "공무원 계정만 등록할 수 있습니다" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const {
    title,
    quoteType,
    categoryPath,
    npsCode,
    budget,
    budgetTbd,
    deadline,
    dueDate,
    deliveryCondition,
    deliveryAddress,
    deliveryAddressDetail,
    desiredDeliveryDate,
    contactOrgName,
    contactDepartment,
    contactEmail,
    contactPhone,
    description,
    items,
    kind,
    targetSupplierCompanyId,
    productId,
  } = body as {
    title?: string;
    quoteType?: string;
    categoryPath?: string[];
    npsCode?: string;
    budget?: string;
    budgetTbd?: boolean;
    deadline?: string;
    dueDate?: string;
    deliveryCondition?: string;
    deliveryAddress?: string;
    deliveryAddressDetail?: string;
    desiredDeliveryDate?: string;
    contactOrgName?: string;
    contactDepartment?: string;
    contactEmail?: string;
    contactPhone?: string;
    description?: string;
    items?: { name: string; qty: string; unit: string; spec: string }[];
    kind?: string;
    targetSupplierCompanyId?: string;
    productId?: string;
  };

  const isDirect = kind === "DIRECT";

  if (!title?.trim()) return NextResponse.json({ error: "공고 제목을 입력하세요" }, { status: 400 });
  if (!isDirect && !deadline) return NextResponse.json({ error: "마감 일시를 선택하세요" }, { status: 400 });
  if (!isDirect && !budgetTbd && !budget?.trim()) return NextResponse.json({ error: "예산을 입력하세요" }, { status: 400 });
  if (!items?.length) return NextResponse.json({ error: "품목을 1개 이상 입력하세요" }, { status: 400 });

  let categoryId: string | null = null;
  if (categoryPath?.length) {
    const leafName = categoryPath[categoryPath.length - 1];
    const cat = await prisma.category.findFirst({ where: { name: leafName } });
    categoryId = cat?.id ?? null;
  }

  const quoteRequest = await prisma.quoteRequest.create({
    data: {
      officialId: claims.sub,
      title: title.trim(),
      status: "OPEN",
      kind: isDirect ? "DIRECT" : "OPEN_BID",
      targetSupplierCompanyId: isDirect ? (targetSupplierCompanyId || null) : null,
      quoteType: quoteType === "용역 견적" ? "SERVICE" : "GOODS",
      categoryId,
      npsCode: npsCode || null,
      budget: !budgetTbd && budget ? parseFloat(budget.replace(/,/g, "")) : null,
      budgetTbd: !!budgetTbd,
      deadline: deadline ? new Date(deadline) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      deliveryCondition: deliveryCondition || null,
      deliveryAddress: deliveryAddress || null,
      deliveryAddressDetail: deliveryAddressDetail || null,
      desiredDeliveryDate: desiredDeliveryDate ? new Date(desiredDeliveryDate) : null,
      contactOrgName: contactOrgName?.trim() || null,
      contactDepartment: contactDepartment?.trim() || null,
      contactEmail: contactEmail?.trim() || null,
      contactPhone: contactPhone?.trim() || null,
      description: description?.trim() || null,
      items: {
        create: items
          .filter((it) => it.name.trim())
          .map((it, i) => ({
            productId: isDirect && i === 0 && productId ? productId : null,
            name: it.name.trim(),
            quantity: parseInt(it.qty) || 1,
            unit: it.unit || null,
            spec: it.spec.trim() || null,
          })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: quoteRequest.id });
}
