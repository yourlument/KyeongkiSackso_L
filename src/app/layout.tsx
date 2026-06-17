import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KORLINK — 지자체 공공조달 플랫폼",
  description: "공무원·구매담당자와 공급업체를 연결하는 B2G 공공조달 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
