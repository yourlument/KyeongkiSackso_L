import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { savePartnerProfile } from "@/lib/partner-profile";

export const dynamic = "force-dynamic";

const input = z.object({
  intro: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  manager: z
    .object({
      name: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      position: z.string().nullable().optional(),
    })
    .optional(),
  performances: z
    .array(z.object({ project: z.string(), client: z.string().optional(), year: z.string().optional(), amount: z.string().optional() }))
    .optional(),
  equipments: z.array(z.object({ name: z.string(), quantity: z.string().optional() })).optional(),
  portfolioFileName: z.string().nullable().optional(),
  bankName: z.string().nullable().optional(),
  bankAccountNo: z.string().nullable().optional(),
  bankAccountHolder: z.string().nullable().optional(),
  bankbookFileUrl: z.string().nullable().optional(),
});

export async function PATCH(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  return NextResponse.json(await savePartnerProfile(companyId, parsed.data));
}
