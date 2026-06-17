import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { MyPageView } from "./mypage-view";
import { loadMyPage } from "@/lib/mypage";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  const isSupplier = claims.role === "SUPPLIER";
  const data = await loadMyPage(claims.sub, isSupplier);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader variant={isSupplier ? "supplier" : "official"} />
      <main className="flex-1">
        <MyPageView role={isSupplier ? "supplier" : "official"} data={data} />
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
