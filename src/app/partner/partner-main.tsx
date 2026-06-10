"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PartnerMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/partner/quotes/chat")) {
    return (
      <main className="flex-1 min-w-0" style={{ height: "100vh", overflow: "hidden" }}>
        {children}
      </main>
    );
  }
  return (
    <main className="flex-1 min-w-0" style={{ padding: "39.04px" }}>
      <div className="w-full" style={{ maxWidth: "1128px" }}>
        {children}
      </div>
    </main>
  );
}
