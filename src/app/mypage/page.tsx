import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { MyPageView } from "./mypage-view";

export default async function MyPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  const isSupplier = claims.role === "SUPPLIER";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader variant={isSupplier ? "supplier" : "official"} />
      <main className="flex-1">
        <MyPageView role={isSupplier ? "supplier" : "official"} />
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
