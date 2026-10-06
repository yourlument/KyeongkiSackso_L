import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { InfoPostForm } from "../info-post-form";

export default function InfoNewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pt-[58.56px] pb-[78.08px]">
          <InfoPostForm />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
