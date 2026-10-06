import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupplierCompanyId } from "@/lib/auth/partner";
import { parseQuoteSealImage, QUOTE_SEAL_IMAGE_MAX_BYTES } from "@/lib/quote-seal-image";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg"]);

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

export async function POST(req: Request) {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "직인 이미지를 선택해 주세요" }, { status: 400 });
  }
  if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
    return NextResponse.json({ message: "PNG 또는 JPG 이미지만 업로드할 수 있어요" }, { status: 400 });
  }
  if (file.size > QUOTE_SEAL_IMAGE_MAX_BYTES) {
    return NextResponse.json({ message: "직인 이미지는 5MB 이하여야 해요" }, { status: 400 });
  }

  const parsed = parseQuoteSealImage(Buffer.from(await file.arrayBuffer()));
  if (!parsed) {
    return NextResponse.json({ message: "올바른 PNG 또는 JPG 이미지를 선택해 주세요" }, { status: 400 });
  }

  const saved = await storage.save({
    bytes: parsed.bytes,
    filename: file.name,
    contentType: parsed.contentType,
  });
  await prisma.supplierCompany.update({
    where: { id: companyId },
    data: { quoteSealImageKey: saved.key },
  });

  return NextResponse.json({ ok: true, url: saved.url });
}

export async function DELETE() {
  const companyId = await getSupplierCompanyId();
  if (!companyId) return NextResponse.json({ message: "로그인이 필요해요" }, { status: 401 });

  await prisma.supplierCompany.update({
    where: { id: companyId },
    data: { quoteSealImageKey: null },
  });
  return NextResponse.json({ ok: true });
}
