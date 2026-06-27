import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { ReportView } from "./report-view";
import { loadInfoDetail } from "@/lib/info";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialKind = type === "신고" || type === "report" ? "신고" : type === "문의" || type === "inquiry" ? "문의" : null;
  const latest = await prisma.post.findFirst({
    where: { boardType: "INFO", isPublished: true },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const post = latest ? await loadInfoDetail(latest.id) : null;
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <ReportView initialKind={initialKind} data={post ?? undefined} />
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
