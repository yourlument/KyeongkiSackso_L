import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";

export const dynamic = "force-dynamic";

const input = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "필수 항목을 확인해 주세요" }, { status: 400 });
  const d = parsed.data;

  const cert = await prisma.supplierCertification.create({
    data: {
      supplierCompanyId: companyId,
      name: d.name,
      description: d.description ?? null,
      fileUrl: d.fileUrl ?? null,
      fileName: d.fileName ?? null,
      status: "REVIEWING",
    },
    select: { id: true },
  });
  return NextResponse.json({ id: cert.id }, { status: 201 });
}
