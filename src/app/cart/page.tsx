import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { CartView } from "./cart-view";

export default async function CartPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1146px] px-[48.8px] pb-[78.08px] pt-[58.56px]">

          <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: 0 }}>Cart</p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, lineHeight: "36px", letterSpacing: "-0.7px", color: "#1D1D1F", margin: "4px 0 0" }}>
            장바구니
          </h1>
          <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "9.76px 0 0" }}>
            다중 수량 조절 및 법인카드/가상계좌 결제 지원
          </p>
          <div style={{ marginTop: "29.28px", borderTop: "1px solid rgba(210,210,215,0.4)" }} />

          <CartView />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
