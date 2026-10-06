import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";
import { encryptModel } from "@/lib/crypto/pii";
import { officialTaxInvoiceSchema } from "@/lib/validators/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role !== "OFFICIAL") return NextResponse.json({ message: "공무원 계정만 수정할 수 있습니다" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = officialTaxInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  if (d.orgRepresentativeName === undefined && d.orgTaxEmail === undefined && d.orgAddress === undefined) {
    return NextResponse.json({ message: "수정할 세금계산서 정보가 없습니다" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { organizationId: true },
  });
  if (!user?.organizationId) {
    return NextResponse.json({ message: "소속 기관 정보를 찾을 수 없습니다" }, { status: 404 });
  }

  await prisma.organization.update({
    where: { id: user.organizationId },
    data: encryptModel("Organization", {
      ...(d.orgRepresentativeName !== undefined
        ? { representativeName: d.orgRepresentativeName || null }
        : {}),
      ...(d.orgTaxEmail !== undefined ? { taxEmail: d.orgTaxEmail || null } : {}),
      ...(d.orgAddress !== undefined ? { address: d.orgAddress || null } : {}),
    }),
  });

  return NextResponse.json({ ok: true });
}
