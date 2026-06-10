import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { ReportView } from "./report-view";

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialKind = type === "신고" || type === "report" ? "신고" : type === "문의" || type === "inquiry" ? "문의" : null;
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <ReportView initialKind={initialKind} />
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
