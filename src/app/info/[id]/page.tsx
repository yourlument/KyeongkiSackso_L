import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { ReportView } from "@/app/report/report-view";

export default async function InfoDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
  const { id } = await params;
  if (id === "new") notFound();
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
