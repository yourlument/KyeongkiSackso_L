import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

type Search = Promise<{ payment?: string; status?: string }>;

function metadataString(
  metadata: unknown,
  key: string,
): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return "";
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  const query = await searchParams;
  const payment = query.payment
    ? await prisma.payment.findUnique({
        where: { id: query.payment },
        include: { order: { select: { buyerId: true, orderNo: true } } },
      })
    : null;
  if (!payment || payment.order.buyerId !== claims.sub) redirect("/mypage");

  const isPaid = payment.status === "PAID";
  const isVirtual =
    query.status === "virtual-issued" &&
    payment.status === "READY" &&
    payment.method === "가상계좌";
  const title = isPaid
    ? "결제가 완료되었습니다"
    : isVirtual
      ? "가상계좌가 발급되었습니다"
      : "결제를 완료하지 못했습니다";
  const description = isPaid
    ? "주문 내역에서 결제 및 배송 상태를 확인할 수 있습니다."
    : isVirtual
      ? "아래 계좌로 입금이 확인되면 주문이 자동으로 결제 완료 처리됩니다."
      : metadataString(payment.metadata, "ResultMsg") ||
        "결제 정보를 확인한 뒤 다시 시도해 주세요.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6">
      <section className="w-full max-w-[520px] rounded-[20px] border border-black/5 bg-white p-10 text-center shadow-sm">
        <p className="m-0 text-xs font-semibold tracking-wide text-[#1E3A5F]/50">
          NICEPAY {query.status === "failed" ? "PAYMENT ERROR" : "PAYMENT"}
        </p>
        <h1 className="mb-0 mt-3 text-2xl font-bold text-[#1D1D1F]">
          {title}
        </h1>
        <p className="mb-0 mt-4 text-sm leading-6 text-[#1D1D1F]/55">
          {description}
        </p>
        <div className="mt-7 rounded-2xl bg-[#F7F8FA] px-5 py-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#1D1D1F]/45">주문번호</span>
            <strong className="text-[#1D1D1F]">{payment.order.orderNo}</strong>
          </div>
          {isVirtual && (
            <>
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-[#1D1D1F]/45">입금은행</span>
                <strong className="text-[#1D1D1F]">
                  {metadataString(payment.metadata, "VbankBankName") || "-"}
                </strong>
              </div>
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-[#1D1D1F]/45">가상계좌</span>
                <strong className="text-[#1D1D1F]">
                  {metadataString(payment.metadata, "VbankNum") || "-"}
                </strong>
              </div>
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-[#1D1D1F]/45">입금기한</span>
                <strong className="text-[#1D1D1F]">
                  {metadataString(payment.metadata, "VbankExpDate") || "-"}
                </strong>
              </div>
            </>
          )}
        </div>
        <div className="mt-7 flex gap-3">
          {!isPaid && !isVirtual && (
            <Link
              href="/checkout"
              className="flex h-12 flex-1 items-center justify-center rounded-xl border border-[#1E3A5F]/20 text-sm font-semibold text-[#1E3A5F]"
            >
              다시 결제
            </Link>
          )}
          <Link
            href="/mypage"
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#1E3A5F] text-sm font-semibold text-white"
          >
            주문 내역
          </Link>
        </div>
      </section>
    </main>
  );
}
