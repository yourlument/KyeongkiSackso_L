import { prisma } from "@/lib/db";
import { getSessionClaims } from "@/lib/auth/session";

export async function getSupplierCompanyId(): Promise<string | null> {
  const claims = await getSessionClaims();
  if (!claims || claims.role !== "SUPPLIER") return null;
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { supplierCompanyId: true },
  });
  return user?.supplierCompanyId ?? null;
}
