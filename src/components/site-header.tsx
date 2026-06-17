"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BellIcon, BagIcon } from "@/components/icons";
import { NotificationPopup } from "@/components/notification-popup";

const NAV_BASE = [
  { label: "검색", href: "/search" },
  { label: "견적요청", href: "/quotes" },
  { label: "수요게시판", href: "/community" },
];
const NAV_INFO = { label: "정보공유", href: "/info" };
const NAV_NEWS = { label: "소식", href: "/news" };

type Auth = { authenticated: boolean; role: string | null };

const NAV_SUPPLIER = [
  { label: "검색", href: "/search" },
  { label: "견적요청", href: "/partner/quotes" },
  { label: "수요게시판", href: "/community" },
  NAV_NEWS,
];

export function SiteHeader({ variant = "official" }: { variant?: "official" | "supplier" } = {}) {
  const [notiOpen, setNotiOpen] = useState(false);
  const [auth, setAuth] = useState<Auth | null>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Auth) => { if (alive) setAuth(d); })
      .catch(() => { if (alive) setAuth({ authenticated: false, role: null }); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!notiOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") setNotiOpen(false); }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notiOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  }

  const supplier = variant === "supplier";
  const loggedIn = auth?.authenticated === true;
  const nav = supplier
    ? NAV_SUPPLIER
    : loggedIn
      ? [...NAV_BASE, NAV_INFO, NAV_NEWS]
      : [...NAV_BASE, NAV_NEWS];

  return (
    <header className="sticky top-0 z-40 h-[61px] border-b border-line bg-surface">
      <div className="flex h-[60px] items-center justify-between px-[48.8px]">
        <Link href="/" aria-label="KORLINK 홈" className="flex items-center">
          <img src="/korlink-logo.svg" alt="KORLINK" className="h-[36px] w-auto" />
        </Link>

        <nav className="hidden items-center gap-[4.88px] md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-[14.64px] py-[7.32px] text-[14px] font-medium tracking-[-0.21px] text-ink/70 transition-colors hover:bg-field"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-[9.76px]">
          {supplier ? (
            <span className="text-[14px] font-normal tracking-[-0.21px] text-ink/60">공급업체</span>
          ) : (
            <Link
              href="/cart"
              aria-label="장바구니"
              className="flex h-[39px] w-[39px] items-center justify-center rounded-full text-ink/60 hover:bg-field"
            >
              <BagIcon width={23} height={23} />
            </Link>
          )}
          <div ref={notiRef} className="relative">
            <button
              type="button"
              aria-label="알림"
              aria-haspopup="dialog"
              aria-expanded={notiOpen}
              onClick={() => setNotiOpen((v) => !v)}
              className="relative flex h-[39px] w-[39px] items-center justify-center rounded-full text-[#6B7280] hover:bg-field"
            >
              <BellIcon width={23} height={23} />
              <span className="absolute right-0 top-0 flex h-[19.52px] min-w-[19.52px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                3
              </span>
            </button>
            {notiOpen && <NotificationPopup />}
          </div>

          {supplier || loggedIn ? (
            <>
              <Link
                href="/mypage"
                aria-label="내 정보"
                className="flex h-[39px] w-[39px] items-center justify-center rounded-full text-ink/60 hover:bg-field"
              >
                <UserIcon />
              </Link>
              <button
                type="button"
                aria-label="로그아웃"
                onClick={handleLogout}
                className="flex h-[39px] w-[39px] items-center justify-center rounded-full text-ink/60 hover:bg-field"
              >
                <LogoutIcon />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-navy px-[19.52px] py-[7.32px] text-[14px] font-medium tracking-[-0.21px] text-white transition-colors hover:bg-navy-hover"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function UserIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 10 14" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 13.3122C0 12.3909 0.229181 11.5372 0.687544 10.7512C1.12924 9.99049 1.72511 9.38616 2.47516 8.93819C3.25021 8.47332 4.09193 8.24089 5.00032 8.24089C5.90871 8.24089 6.75043 8.47332 7.52548 8.93819C8.27552 9.38616 8.8714 9.99049 9.31309 10.7512C9.77145 11.5372 10.0006 12.3909 10.0006 13.3122H8.75055C8.75055 12.6276 8.57971 11.9894 8.23802 11.3978C7.90467 10.823 7.45464 10.3666 6.88794 10.0285C6.30457 9.68199 5.67536 9.50872 5.00032 9.50872C4.32527 9.50872 3.69607 9.68199 3.1127 10.0285C2.54599 10.3666 2.09597 10.823 1.76261 11.3978C1.42092 11.9894 1.25008 12.6276 1.25008 13.3122H0ZM5.00032 7.60697C4.31694 7.60697 3.68773 7.4337 3.1127 7.08716C2.54599 6.74908 2.09597 6.29266 1.76261 5.71791C1.42092 5.13471 1.25008 4.49657 1.25008 3.80349C1.25008 3.11041 1.42092 2.47227 1.76261 1.88907C2.09597 1.31432 2.54599 0.857897 3.1127 0.51981C3.68773 0.17327 4.31694 0 5.00032 0C5.68369 0 6.3129 0.17327 6.88794 0.51981C7.45464 0.857897 7.90467 1.31432 8.23802 1.88907C8.57971 2.47227 8.75055 3.11041 8.75055 3.80349C8.75055 4.49657 8.57971 5.13471 8.23802 5.71791C7.90467 6.29266 7.45464 6.74908 6.88794 7.08716C6.3129 7.4337 5.68369 7.60697 5.00032 7.60697ZM5.00032 6.33914C5.45035 6.33914 5.86704 6.22504 6.2504 5.99683C6.63375 5.76862 6.93794 5.46012 7.16295 5.07132C7.38797 4.68251 7.50048 4.2599 7.50048 3.80349C7.50048 3.34707 7.38797 2.92446 7.16295 2.53566C6.93794 2.14686 6.63375 1.83835 6.2504 1.61014C5.86704 1.38193 5.45035 1.26783 5.00032 1.26783C4.55029 1.26783 4.1336 1.38193 3.75024 1.61014C3.36688 1.83835 3.06269 2.14686 2.83768 2.53566C2.61267 2.92446 2.50016 3.34707 2.50016 3.80349C2.50016 4.2599 2.61267 4.68251 2.83768 5.07132C3.06269 5.46012 3.36688 5.76862 3.75024 5.99683C4.1336 6.22504 4.55029 6.33914 5.00032 6.33914Z"
        fill="#1D1D1F"
        fillOpacity="0.6"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 12 13" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.631566 12.8107C0.454728 12.8107 0.305257 12.7488 0.183154 12.6249C0.0610514 12.5011 0 12.3495 0 12.1701V0.640534C0 0.461184 0.0610514 0.309591 0.183154 0.185754C0.305257 0.0619178 0.454728 0 0.631566 0H9.47349C9.65033 0 9.7998 0.0619178 9.92191 0.185754C10.044 0.309591 10.1051 0.461184 10.1051 0.640534V2.56214H8.84193V1.28107H1.26313V11.5296H8.84193V10.2485H10.1051V12.1701C10.1051 12.3495 10.044 12.5011 9.92191 12.6249C9.7998 12.7488 9.65033 12.8107 9.47349 12.8107H0.631566ZM8.84193 8.96747V7.04587H4.42096V5.7648H8.84193V3.8432L11.9998 6.40534L8.84193 8.96747Z"
        fill="#1D1D1F"
        fillOpacity="0.6"
      />
    </svg>
  );
}
