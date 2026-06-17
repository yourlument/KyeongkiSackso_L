"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function FooterLogo() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated: boolean; role: string | null }) => {
        if (alive) setIsAdmin(d.authenticated && d.role === "ADMIN");
      })
      .catch(() => {
      });
    return () => {
      alive = false;
    };
  }, []);

  const logo = (
    <img src="/korlink-logo.svg" alt="KORLINK" className="mb-[19.52px] h-9 w-auto" />
  );

  if (!isAdmin) return logo;
  return <Link href="/admin">{logo}</Link>;
}
