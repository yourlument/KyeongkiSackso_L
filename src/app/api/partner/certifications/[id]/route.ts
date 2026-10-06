import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { syncSupplierCertificationMarks } from "@/lib/certification-marks";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });
  const { id } = await ctx.params;

  const owned = await prisma.supplierCertification.findFirst({
    where: { id, supplierCompanyId: companyId },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ message: "인증서를 찾을 수 없습니다" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.supplierCertification.delete({ where: { id } });
    await syncSupplierCertificationMarks(tx, companyId);
  });
  revalidatePath("/admin/users");
  revalidatePath("/search");
  revalidatePath("/products/[id]", "page");
  return NextResponse.json({ ok: true });
}
