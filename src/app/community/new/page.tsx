import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { getDemandPost } from "../data";
import { DemandForm } from "./demand-form";

export default async function DemandNewPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const claims = await getSessionClaims();
  if (claims?.role !== "OFFICIAL") redirect("/community");

  const { edit } = await searchParams;
  const post = edit ? getDemandPost(edit) : null;
  const initial = post
    ? { title: post.title, content: post.summary, videoUrl: post.videoUrl ?? "" }
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pt-[58.56px] pb-[78.08px]">
          <DemandForm initial={initial} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
