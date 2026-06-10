import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { QuoteDetailView } from "./quote-detail-view";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pb-[78.08px] pt-[58.56px]">
          <QuoteDetailView id={id} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
