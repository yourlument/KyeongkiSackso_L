import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { PencilIcon, ChevronLeftIcon, ChevronRightIcon } from "./info-icons";
import { InfoListView } from "./info-list-view";
import { loadInfo } from "@/lib/info";

export const dynamic = "force-dynamic";

export default async function InfoPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const claims = await getSessionClaims();
  if (!claims) redirect("/login");
  const { page: pageParam } = await searchParams;
  const requested = Number.parseInt(pageParam ?? "1", 10);
  const { posts, hotPosts, page, pageCount } = await loadInfo(claims.sub, Number.isFinite(requested) ? requested : 1);

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
            <Link
              href="/info/new"
              className="inline-flex shrink-0 items-center"
              style={{ gap: "7.32px", background: "#1E3A5F", borderRadius: "14.64px", padding: "12.2px 24.4px", color: "#fff", textDecoration: "none" }}
            >
              <PencilIcon />
              <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.293px", lineHeight: "22.8px" }}>글쓰기</span>
            </Link>
          </div>
          <div style={{ marginTop: "29.28px" }} />
          <InfoListView posts={posts} hotPosts={hotPosts} />

          {pageCount > 1 && (
            <div className="flex items-center justify-center" style={{ gap: "4.88px", padding: "19.52px 0" }}>
              <PagerLink page={page - 1} disabled={page <= 1} ariaLabel="이전">
                <span style={{ color: page <= 1 ? "#D1D5DB" : "#4B5563" }}><ChevronLeftIcon /></span>
              </PagerLink>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
                const active = n === page;
                return (
                  <Link
                    key={n}
                    href={`/info?page=${n}`}
                    className="flex items-center justify-center"
                    style={{ width: "39px", height: "39px", borderRadius: "7.32px", background: active ? "#1F2937" : "transparent", color: active ? "#fff" : "#4B5563", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.293px", textDecoration: "none" }}
                  >
                    {n}
                  </Link>
                );
              })}
              <PagerLink page={page + 1} disabled={page >= pageCount} ariaLabel="다음">
                <span style={{ color: page >= pageCount ? "#D1D5DB" : "#4B5563" }}><ChevronRightIcon /></span>
              </PagerLink>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}

function PagerLink({ page, disabled, ariaLabel, children }: { page: number; disabled: boolean; ariaLabel: string; children: React.ReactNode }) {
  const style: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", width: "39px", height: "39px", borderRadius: "7.32px", textDecoration: "none" };
  if (disabled) {
    return <span aria-label={ariaLabel} style={{ ...style, opacity: 0.5, pointerEvents: "none" }}>{children}</span>;
  }
  return <Link href={`/info?page=${page}`} aria-label={ariaLabel} style={style}>{children}</Link>;
}
