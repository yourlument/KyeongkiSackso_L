import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { loadNewsById } from "@/lib/news";
import { NewsDetailView } from "./news-detail-view";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadNewsById(id);
  if (!data) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <NewsDetailView item={data.item} detail={data.detail} prev={data.prev} next={data.next} />
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
