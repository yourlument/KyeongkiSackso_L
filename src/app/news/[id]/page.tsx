import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { NEWS, NEWS_DETAILS, prevNext } from "../data";
import { NewsDetailView } from "./news-detail-view";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const nid = Number(id);
  const item = NEWS.find((n) => n.id === nid);
  const detail = NEWS_DETAILS[nid];
  if (!item || !detail) notFound();

  const { prev, next } = prevNext(nid);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <NewsDetailView item={item} detail={detail} prev={prev} next={next} />
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
