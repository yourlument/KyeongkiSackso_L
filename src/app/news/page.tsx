import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { NewsView } from "./news-view";

export default function NewsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">

        <div style={{ borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
          <div className="mx-auto w-full max-w-[1249px] px-[48.8px] py-[48.8px]">

            <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "1.2px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: 0 }}>
              News
            </p>

            <h1 style={{ fontSize: "32px", fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.8px", color: "#1D1D1F", margin: "9.76px 0 0" }}>
              소식
            </h1>

            <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "9.76px 0 0" }}>
              KORLINK의 공지사항과 이벤트 소식을 확인하세요
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1249px] px-[48.8px] py-[39.04px]">
          <NewsView />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
