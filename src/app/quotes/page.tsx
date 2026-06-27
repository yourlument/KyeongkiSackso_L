import { getSessionClaims } from "@/lib/auth/session";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { KakaoChat } from "@/components/kakao-chat";
import { QuotesView } from "./quotes-view";
import { QuoteRegisterButton } from "./quote-register-modal";
import { loadQuotes } from "@/lib/quotes";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/crypto/pii";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const claims = await getSessionClaims();
  const isSupplier = claims?.role === "SUPPLIER";
  const isGuest = !claims;
  const { rows } = await loadQuotes(claims?.sub);

  const official = claims?.sub
    ? await prisma.user.findUnique({
        where: { id: claims.sub },
        select: {
          phone: true,
          departmentName: true,
          position: true,
          organization: { select: { name: true } },
        },
      })
    : null;
  const officialInfo = {
    organizationName: official?.organization?.name ?? null,
    departmentName: official?.departmentName ?? null,
    position: decrypt(official?.position) ?? null,
    contactPhone: decrypt(official?.phone) ?? null,
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1342px] px-[48.8px] pb-[78.08px] pt-[58.56px]">
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "1.2px", color: "rgba(29,29,31,0.4)", margin: 0 }}>Quotes</p>
              <h1 style={{ fontSize: "32px", fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.8px", color: "#1D1D1F", margin: "9.76px 0 0" }}>
                견적요청 관리
              </h1>
              <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "9.76px 0 0" }}>
                공고 등록부터 선정까지 전체 프로세스를 관리합니다
              </p>
            </div>
            {!isSupplier && <QuoteRegisterButton disabled={isGuest} official={officialInfo} />}
          </div>
          <div style={{ marginTop: "48.8px", borderTop: "1px solid rgba(210,210,215,0.2)" }} />
          <QuotesView quotes={rows} isGuest={isGuest} browseOnly={isSupplier} />
        </div>
      </main>
      <SiteFooter />
      <KakaoChat />
    </div>
  );
}
