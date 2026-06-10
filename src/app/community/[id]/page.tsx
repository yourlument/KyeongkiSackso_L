import { notFound } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { getDemandPost } from "../data";
import { CommunityDetailView } from "./community-detail-view";

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const claims = await getSessionClaims();
  const supplier = claims?.role === "SUPPLIER";
  const viewer: "guest" | "official" | "supplier" = !claims ? "guest" : supplier ? "supplier" : "official";
  const { id } = await params;
  const post = getDemandPost(id);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader variant={supplier ? "supplier" : "official"} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pb-[78.08px] pt-[58.56px]">
          <CommunityDetailView post={post} viewer={viewer} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
