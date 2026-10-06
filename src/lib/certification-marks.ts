import type { Prisma } from "@prisma/client";
import { uniqueCertificationMarks } from "@/lib/certification-options";

export {
  STANDARD_CERTIFICATION_MARKS,
  certificationMarkOptions,
  certificationMarkSearchNames,
  normalizeCertificationMark,
} from "@/lib/certification-options";

export function certificationMarksFromNames(names: readonly string[]): string[] {
  return uniqueCertificationMarks(names);
}

export async function syncSupplierCertificationMarks(
  tx: Prisma.TransactionClient,
  supplierCompanyId: string,
): Promise<string[]> {
  const approved = await tx.supplierCertification.findMany({
    where: { supplierCompanyId, status: "APPROVED" },
    orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
    select: { name: true },
  });
  const marks = certificationMarksFromNames(approved.map((cert) => cert.name));

  await tx.supplierCompany.update({
    where: { id: supplierCompanyId },
    data: { certifications: marks },
  });

  await tx.product.updateMany({
    where: { supplierCompanyId },
    data: { badges: marks },
  });

  return marks;
}
