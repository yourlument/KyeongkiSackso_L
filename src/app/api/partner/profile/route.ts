import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { eokToWon } from "@/lib/partner-profile";

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
});

export async function PATCH(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "입력값을 확인해 주세요" }, { status: 400 });
  const d = parsed.data;

  await prisma.supplierCompany.update({
    where: { id: companyId },
    data: {
      ...(d.intro !== undefined ? { intro: d.intro } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.manager
        ? {
            managerName: d.manager.name ?? null,
            managerPhone: d.manager.phone ?? null,
            managerEmail: d.manager.email ?? null,
            managerPosition: d.manager.position ?? null,
          }
        : {}),
    },
  });

  if (d.performances !== undefined) {
    await prisma.supplierPerformance.deleteMany({ where: { supplierCompanyId: companyId } });
    const rows = d.performances
      .filter((p) => p.project.trim())
      .map((p, i) => ({
        supplierCompanyId: companyId,
        projectName: p.project.trim(),
        client: p.client?.trim() || null,
        year: p.year && /\d/.test(p.year) ? Number(p.year.replace(/[^\d]/g, "")) : null,
        amount: eokToWon(p.amount),
        sortOrder: i,
      }));
    if (rows.length) await prisma.supplierPerformance.createMany({ data: rows });
  }

  if (d.equipments !== undefined) {
    await prisma.supplierEquipment.deleteMany({ where: { supplierCompanyId: companyId } });
    const rows = d.equipments
      .filter((e) => e.name.trim())
      .map((e, i) => ({
        supplierCompanyId: companyId,
        name: e.name.trim(),
        quantity: e.quantity && /\d/.test(e.quantity) ? Number(e.quantity.replace(/[^\d]/g, "")) : 1,
        sortOrder: i,
      }));
    if (rows.length) await prisma.supplierEquipment.createMany({ data: rows });
  }

  return NextResponse.json({ ok: true });
}
