import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";

export const dynamic = "force-dynamic";

const input = z.object({
  totalAmount: z.number().nonnegative(),
  specSummary: z.string().min(1),
  memo: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await ctx.params;

  const reqRow = await prisma.quoteRequest.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!reqRow) return NextResponse.json({ message: "견적 요청을 찾을 수 없습니다" }, { status: 404 });
  if (["CLOSED", "AWARDED", "CANCELLED"].includes(reqRow.status)) {
    return NextResponse.json({ message: "마감된 견적 요청입니다" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "필수 항목을 확인해 주세요" }, { status: 400 });
  const d = parsed.data;

  try {
    const resp = await prisma.quoteResponse.create({
      data: {
        quoteRequestId: id,
        supplierCompanyId: companyId,
        totalAmount: d.totalAmount,
        specSummary: d.specSummary,
        memo: d.memo ?? null,
        deliveryDate: d.deliveryDate ? new Date(d.deliveryDate) : null,
        status: "SUBMITTED",
      },
      select: { id: true },
    });
    return NextResponse.json({ id: resp.id }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ message: "이미 제출한 견적이 있습니다" }, { status: 409 });
    }
    throw e;
  }
}
