import { redirect } from "next/navigation";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { PencilIcon } from "./info-icons";
import { InfoListView } from "./info-list-view";

export default async function InfoPage() {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pb-[78.08px] pt-[48.8px]">
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "1.2px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: 0 }}>Community</p>
              <h1 style={{ fontSize: "32px", fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.8px", color: "#1D1D1F", margin: "9.76px 0 0" }}>
                정보 공유 라운지
              </h1>
              <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "9.76px 0 0" }}>
                익명 기반 조달 업무 노하우, 업체 납품 평판 공유
              </p>
            </div>

            <span
              className="inline-flex shrink-0 items-center"
              style={{ gap: "7.32px", background: "#1E3A5F", borderRadius: "14.64px", padding: "12.2px 24.4px", color: "#fff" }}
            >
              <PencilIcon />
              <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.293px", lineHeight: "22.8px" }}>글쓰기</span>
            </span>
          </div>
          <div style={{ marginTop: "29.28px" }} />
          <InfoListView />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
