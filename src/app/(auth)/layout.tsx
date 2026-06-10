import { SiteHeader } from "@/components/site-header";
import { KakaoChat } from "@/components/kakao-chat";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-4 py-12">{children}</main>
      <KakaoChat />
    </div>
  );
}
