import { prisma } from "@/lib/db";
import { TermsView } from "./terms-view";

export const dynamic = "force-dynamic";

const ORDER: Record<string, number> = { SERVICE: 0, CONSENT: 1, PRIVACY: 2, SUPPLIER: 3, MARKETING: 4 };

export default async function AdminTermsPage() {
  const rows = await prisma.term.findMany({
    where: { isActive: true },
    select: { id: true, type: true, title: true },
  });
  rows.sort((a, b) => (ORDER[a.type] ?? 99) - (ORDER[b.type] ?? 99));
  return <TermsView terms={rows.map((r) => ({ id: r.id, title: r.title }))} />;
}
