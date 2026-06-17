import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { CommunityView } from "./community-view";
import { loadDemand } from "@/lib/community";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const claims = await getSessionClaims();
  const role = claims?.role ?? null;
  const supplier = role === "SUPPLIER";
  const { posts } = await loadDemand(claims?.sub);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader variant={supplier ? "supplier" : "official"} />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pb-[78.08px] pt-[58.56px]">
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "1.2px", color: "rgba(29,29,31,0.4)", margin: 0 }}>Request Board</p>
              <h1 style={{ fontSize: "32px", fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.8px", color: "#1D1D1F", margin: "9.76px 0 0" }}>
                미등록 수요 게시판
              </h1>
              <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "9.76px 0 0" }}>
                조달 목록에 없는 품목을 자유롭게 등록하고, 공급 업체로부터 직접 제안을 받아보세요.
              </p>
            </div>
            {role === "OFFICIAL" && (
              <a href="/community/new" style={{ display: "flex", alignItems: "center", gap: "7.32px", padding: "12.2px 24.4px", borderRadius: "14.64px", background: "#1E3A5F", color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden><path d="M6.5 1.5v10M1.5 6.5h10" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" /></svg> 수요 등록
              </a>
            )}
          </div>
          <div style={{ marginTop: "29.28px", borderTop: "1px solid rgba(210,210,215,0.2)" }} />
          <CommunityView role={role} initialPosts={posts} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
