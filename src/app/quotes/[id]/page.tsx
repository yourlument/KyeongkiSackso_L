import { notFound, redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { QuoteDetailView } from "./quote-detail-view";
import { loadQuoteDetail } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  const { id } = await params;
  const data = await loadQuoteDetail(id, claims.sub);
  if (!data) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pb-[78.08px] pt-[58.56px]">
          <QuoteDetailView id={id} data={data} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
