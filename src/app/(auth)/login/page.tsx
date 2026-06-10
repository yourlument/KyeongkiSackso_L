"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from "@/components/icons";

type Portal = "OFFICIAL" | "SUPPLIER";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<Portal>("OFFICIAL");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let bad = false;
    if (!email) {
      setEmailError("이메일을 입력하세요");
      bad = true;
    } else if (!EMAIL_RE.test(email)) {
      setEmailError("올바른 이메일 형식을 입력하세요 (예: user@example.com)");
      bad = true;
    } else setEmailError(null);
    if (!password) {
      setPwError("비밀번호를 입력하세요");
      bad = true;
    } else setPwError(null);
    if (bad) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, portal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFailMsg(data.message ?? "이메일 또는 비밀번호가 올바르지 않습니다.\n다시 확인해주세요.");
        return;
      }

      window.location.href = portal === "SUPPLIER" ? "/partner" : "/";
    } catch {
      setFailMsg("이메일 또는 비밀번호가 올바르지 않습니다.\n다시 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-[39.04px] text-center">

        <img src="/korlink-logo.svg" alt="KORLINK" className="mx-auto h-[36px] w-auto" />
        <h1 className="mt-[24.4px] text-[24px] font-bold leading-[30px] tracking-[-0.6px] text-ink">
          로그인
        </h1>
        <p className="mt-[7.32px] text-[13px] font-normal leading-[23.4px] tracking-[-0.195px] text-ink/40">
          KORLINK 지자체 공공조달 플랫폼
        </p>
      </div>

      <div className="mb-[29.28px] flex rounded-[19.52px] bg-field p-[4.88px]">
        {(["OFFICIAL", "SUPPLIER"] as Portal[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPortal(p)}
            className={`flex-1 rounded-[14.64px] py-[12.2px] text-[13px] font-medium tracking-[-0.2928px] transition-all ${
              portal === p
                ? "bg-surface text-ink shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                : "text-ink/50"
            }`}
          >
            {p === "OFFICIAL" ? "공무원 / 구매담당자" : "공급 및 입점 업체"}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-[19.52px] border border-line/30 bg-surface p-[30.28px] shadow-[0px_4px_24px_rgba(0,0,0,0.06)]"
      >
        <label className="mb-[7.32px] block text-[12px] font-medium leading-[21.6px] tracking-[-0.18px] text-ink/50">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          placeholder="email@example.com"
          autoComplete="email"
          className="w-full rounded-[14.64px] border border-line/50 bg-surface px-[20.52px] py-[15.625px] text-[14px] leading-[24px] tracking-[-0.2928px] text-ink outline-none placeholder:font-medium placeholder:text-ink/30 focus:border-navy"
        />
        {emailError && <FieldError msg={emailError} variant="email" />}

        <label className="mb-[7.32px] mt-[17.08px] block text-[12px] font-medium leading-[21.6px] tracking-[-0.18px] text-ink/50">
          비밀번호
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPwError(null);
            }}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            className="w-full rounded-[14.64px] border border-line/50 bg-surface px-[20.52px] py-[15.625px] pr-[54.68px] text-[14px] leading-[24px] tracking-[-0.2928px] text-ink outline-none placeholder:font-medium placeholder:text-ink/30 focus:border-navy"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}
            className="absolute right-[20.52px] top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60"
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {pwError && <FieldError msg={pwError} variant="password" />}

        <button
          type="submit"
          disabled={loading}
          className="mt-[17.08px] w-full rounded-[14.64px] bg-navy py-[14.64px] text-[14px] font-semibold leading-[24px] tracking-[-0.2928px] text-white transition-colors hover:bg-navy-hover disabled:opacity-60"
        >
          {loading ? "로그인 중…" : "로그인"}
        </button>

        <div className="mt-[24.4px] flex items-center justify-between border-t border-line/20 pt-[20.52px] text-[12px] leading-[21.6px] tracking-[-0.18px]">
          <span className="text-ink/40">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium text-navy hover:underline">
              회원가입
            </Link>
          </span>
          <Link href="/find-account" className="text-ink/40 hover:text-navy">
            아이디/비밀번호 찾기
          </Link>
        </div>
      </form>

      {failMsg && (
        <LoginFailModal
          message={failMsg}
          onRetry={() => setFailMsg(null)}
          onSignup={() => router.push("/signup")}
        />
      )}
    </div>
  );
}

function FieldError({ msg, variant }: { msg: string; variant: "email" | "password" }) {
  const email = variant === "email";
  return (
    <p
      className={`flex items-center gap-[4.88px] font-normal text-danger ${
        email
          ? "mt-[4.88px] text-[11px] leading-[19.8px] tracking-[-0.165px]"
          : "mt-[17.08px] text-[12px] leading-[21.6px] tracking-[-0.18px]"
      }`}
    >
      <AlertCircleIcon
        width={email ? 11 : 12}
        height={email ? 11 : 12}
        className="shrink-0"
      />
      {msg}
    </p>
  );
}

function LoginFailModal({
  message,
  onRetry,
  onSignup,
}: {
  message: string;
  onRetry: () => void;
  onSignup: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-[19.52px] backdrop-blur-[2px]"
      onClick={onRetry}
    >
      <div
        className="relative flex w-[468px] max-w-full flex-col items-center rounded-[19.52px] bg-surface p-[29.28px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onRetry}
          aria-label="닫기"
          className="absolute right-[19.52px] top-[19.52px] flex h-[39px] w-[39px] items-center justify-center rounded-full text-ink/30 hover:bg-field"
        >
          <svg width="23" height="22" viewBox="0 0 23 22" fill="none" aria-hidden="true">
            <path
              d="M11.2976 9.69814L15.7624 5.1698L17.0458 6.47147L12.581 10.9998L17.0458 15.5281L15.7624 16.8298L11.2976 12.3015L6.83282 16.8298L5.54942 15.5281L10.0142 10.9998L5.54942 6.47147L6.83282 5.1698L11.2976 9.69814Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="mb-[19.52px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#FEF2F2]">

          <img src="/icon-login-fail.svg" alt="" className="h-[26px] w-auto" />
        </div>

        <h2 className="mb-[9.76px] text-[17px] font-bold leading-[21px] tracking-[-0.476px] text-ink">
          로그인 실패
        </h2>
        <p className="mb-[29.28px] whitespace-pre-line text-center text-[13px] font-normal leading-[21px] tracking-[-0.195px] text-ink/55">
          {message}
        </p>

        <div className="flex w-full gap-[14.64px]">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-[14.64px] border border-line/40 py-[13.2px] text-[13px] font-medium tracking-[-0.2928px] text-ink/60 hover:bg-field"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={onSignup}
            className="flex-1 rounded-[14.64px] bg-navy py-[12.2px] text-[13px] font-semibold tracking-[-0.195px] text-white hover:bg-navy-hover"
          >
            회원가입
          </button>
        </div>

        <Link
          href="/find-account"
          className="mt-[14.64px] text-[12px] font-normal tracking-[-0.18px] text-ink/40 hover:text-navy"
        >
          아이디/비밀번호를 잊으셨나요?
        </Link>
      </div>
    </div>
  );
}
