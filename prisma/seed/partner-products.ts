import type { PrismaClient } from "@prisma/client";
import { encryptLookup } from "../../src/lib/crypto/pii";
import type { SeedCtx } from "./types";

type SampleProduct = {
  id: string;
  npsCode: string;
  name: string;
  categoryLeaf: string;
  price: number;
  unit: string;
  minOrderQty: number;
  rating: number;
  reviewCount: number;
  image: string;
};

const SAMPLES: SampleProduct[] = [
  { id: "pp-43201502", npsCode: "43201502", name: "업무용 노트북 i5/8GB/256GB 15.6인치", categoryLeaf: "노트북", price: 650000, unit: "대", minOrderQty: 1, rating: 4.7, reviewCount: 234, image: "/products/p-43201502.png" },
  { id: "pp-43211501", npsCode: "43211501", name: "모니터 27인치 QHD IPS 광시야각 75Hz", categoryLeaf: "컴퓨터 주변기기", price: 320000, unit: "대", minOrderQty: 1, rating: 4.6, reviewCount: 312, image: "/products/p-43211501.png" },
];

export async function seedPartnerProducts(prisma: PrismaClient, _ctx: SeedCtx): Promise<string> {
  const company = await prisma.supplierCompany.findUnique({
    where: { businessRegistrationNo: encryptLookup("SupplierCompany", "businessRegistrationNo", "211-88-00001") },
  });
  if (!company) throw new Error("[partner-products] 디지털솔루션(주) 211-88-00001 누락 — prisma/seed.ts 먼저 실행 필요");

  const leaves = await prisma.category.findMany({ where: { level: 3 }, select: { id: true, name: true } });
  const leafId = (name: string): string => {
    const hit = leaves.find((l) => l.name === name);
    if (!hit) throw new Error(`[partner-products] 리프 카테고리 누락: ${name}`);
    return hit.id;
  };

  let reassigned = 0;
  const demo6 = await prisma.product.findUnique({ where: { id: "demo-6" }, select: { supplierCompanyId: true } });
  if (demo6 && demo6.supplierCompanyId !== company.id) {
    await prisma.product.update({ where: { id: "demo-6" }, data: { supplierCompanyId: company.id } });
    reassigned = 1;
  }

  let n = 0;
  for (const s of SAMPLES) {
    const categoryId = leafId(s.categoryLeaf);
    const data = {
      supplierCompanyId: company.id,
      categoryId,
      name: s.name,
      price: s.price,
      unit: s.unit,
      status: "ACTIVE" as const,
      npsCode: s.npsCode,
      rating: s.rating,
      reviewCount: s.reviewCount,
      badges: [] as string[],
      minOrderQty: s.minOrderQty,
    };
    await prisma.product.upsert({ where: { id: s.id }, update: data, create: { id: s.id, ...data } });
    const imgId = `${s.id}-img`;
    await prisma.productImage.upsert({
      where: { id: imgId },
      update: { url: s.image, type: "THUMBNAIL", sortOrder: 0 },
      create: { id: imgId, productId: s.id, url: s.image, type: "THUMBNAIL", sortOrder: 0 },
    });
    n++;
  }

  return `partner-products: demo-6 귀속 ${reassigned} + 신규 ${n} → 디지털솔루션(주)`;
}
