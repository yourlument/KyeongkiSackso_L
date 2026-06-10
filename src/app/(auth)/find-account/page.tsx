"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircleIcon } from "@/components/icons";

type Tab = "FIND_ID" | "RESET_PW";
type Portal = "OFFICIAL" | "SUPPLIER";

const inputCls =
  "w-full rounded-[14.64px] border border-line/50 bg-surface px-[20.52px] py-[15.6px] text-[14px] leading-[24px] tracking-[-0.2928px] text-ink outline-none placeholder:font-medium placeholder:text-ink/30 focus:border-navy";
const labelCls =
  "mb-[7.32px] block text-[12px] font-medium leading-[22px] tracking-[-0.18px] text-ink/50";
const primaryBtnCls =
  "w-full rounded-[14.64px] bg-navy py-[14.64px] text-[14px] font-semibold leading-[24px] tracking-[-0.2928px] text-white transition-colors hover:bg-navy-hover disabled:opacity-60";

export default function FindAccountPage() {
  const [tab, setTab] = useState<Tab>("FIND_ID");

  return (
    <div className="w-full max-w-[460px]">
      <div className="mb-[39.04px] text-center">
        <h1 className="text-[24px] font-bold leading-[30px] tracking-[-0.6px] text-ink">
          계정 찾기
        </h1>
        <p className="mt-[7.32px] text-[13px] font-normal leading-[23.4px] tracking-[-0.195px] text-ink/40">
          아이디 확인 또는 비밀번호 재설정
        </p>
      </div>

      <div className="mb-[29.28px] flex rounded-[19.52px] bg-field p-[4.88px]">
        {(["FIND_ID", "RESET_PW"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-[14.64px] py-[12.2px] text-[13px] font-medium tracking-[-0.2928px] transition-all ${
              tab === t
                ? "bg-surface text-ink shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                : "text-ink/50"
            }`}
          >
            {t === "FIND_ID" ? "아이디 찾기" : "비밀번호 재설정"}
          </button>
        ))}
      </div>

      <div className="rounded-[19.52px] border border-line/30 bg-surface p-[30.28px]">
        {tab === "FIND_ID" ? <FindIdForm /> : <ResetPwForm />}
      </div>

      <div className="mt-[29.28px] flex items-center justify-center gap-[19.52px] text-[13px] leading-[22px] tracking-[-0.195px]">
        <Link href="/login" className="text-ink/40 hover:text-navy">
          로그인
        </Link>
        <span className="text-ink/20">|</span>
        <Link href="/signup" className="text-ink/40 hover:text-navy">
          회원가입
        </Link>
      </div>
    </div>
  );
}

function PortalToggle({ portal, onChange }: { portal: Portal; onChange: (p: Portal) => void }) {
  return (
    <div className="mb-[24.4px] flex gap-[9.76px]">
      {(["OFFICIAL", "SUPPLIER"] as Portal[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-full px-[20.52px] py-[8.32px] text-[12px] font-medium leading-[21px] tracking-[-0.2928px] transition-colors ${
            portal === p
              ? "bg-navy text-white"
              : "border border-line/50 text-ink/50 hover:bg-field"
          }`}
        >
          {p === "OFFICIAL" ? "공무원 / 구매담당자" : "공급 및 입점 업체"}
        </button>
      ))}
    </div>
  );
}

function FieldLabelInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-[14.64px] flex items-center justify-center gap-[7.32px] rounded-[14.64px] border border-[#FEE2E2] bg-[#FEF2F2] px-[20.52px] py-[20.52px] text-center">
      <AlertCircleIcon width={13} height={13} className="shrink-0 text-[#DC2626]" />
      <span className="text-[13px] font-normal leading-[23.4px] tracking-[-0.195px] text-[#DC2626]">
        {message}
      </span>
    </div>
  );
}

function FindIdForm() {
  const [portal, setPortal] = useState<Portal>("OFFICIAL");

  const [orgBizNo, setOrgBizNo] = useState("");
  const [orgName, setOrgName] = useState("");
  const [deptName, setDeptName] = useState("");

  const [bizNo, setBizNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [repName, setRepName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultEmail, setResultEmail] = useState<string | null>(null);

  function reset() {
    setErrorMsg(null);
    setResultEmail(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const payload =
        portal === "OFFICIAL"
          ? {
              portal,
              organizationBizNo: orgBizNo,
              organizationName: orgName,
              departmentName: deptName,
            }
          : {
              portal,
              businessRegistrationNo: bizNo,
              companyName,
              representativeName: repName,
            };
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message ?? "일치하는 회원 정보를 찾을 수 없습니다.");
        return;
      }
      setResultEmail(data.email);
    } catch {
      setErrorMsg("일치하는 회원 정보를 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PortalToggle
        portal={portal}
        onChange={(p) => {
          setPortal(p);
          reset();
        }}
      />

      {portal === "OFFICIAL" ? (
        <>
          <FieldLabelInput
            label="관공서 사업자 등록번호"
            value={orgBizNo}
            onChange={(v) => {
              setOrgBizNo(v);
              reset();
            }}
            placeholder="예: 123-45-67890"
          />
          <FieldLabelInput
            label="소속 지자체/기관명"
            value={orgName}
            onChange={(v) => {
              setOrgName(v);
              reset();
            }}
            placeholder="예: 화성시청"
            className="mt-[14.64px]"
          />
          <FieldLabelInput
            label="소속 부서명"
            value={deptName}
            onChange={(v) => {
              setDeptName(v);
              reset();
            }}
            placeholder="예: 도로관리과"
            className="mt-[14.64px]"
          />
        </>
      ) : (
        <>
          <FieldLabelInput
            label="사업자 등록번호"
            value={bizNo}
            onChange={(v) => {
              setBizNo(v);
              reset();
            }}
            placeholder="예: 123-45-67890"
          />
          <FieldLabelInput
            label="업체명"
            value={companyName}
            onChange={(v) => {
              setCompanyName(v);
              reset();
            }}
            placeholder="예: 한국색소"
            className="mt-[14.64px]"
          />
          <FieldLabelInput
            label="대표자 성함"
            value={repName}
            onChange={(v) => {
              setRepName(v);
              reset();
            }}
            placeholder="예: 홍길동"
            className="mt-[14.64px]"
          />
        </>
      )}

      <button type="submit" disabled={loading} className={`mt-[14.64px] ${primaryBtnCls}`}>
        아이디 찾기
      </button>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      {resultEmail && (
        <div className="mt-[14.64px] rounded-[14.64px] border border-[#1E3A5F33] bg-[#1E3A5F0D] p-[20.52px] text-center">
          <p className="text-[12px] font-normal leading-[22px] tracking-[-0.18px] text-ink/50">
            가입된 이메일 (아이디)
          </p>
          <p className="mt-[9.76px] text-[16px] font-semibold leading-[28.8px] tracking-[-0.24px] text-navy">
            {resultEmail}
          </p>
          <Link
            href="/login"
            className="mt-[14.64px] inline-block text-[13px] font-normal leading-[22px] tracking-[-0.195px] text-ink/50 underline hover:text-navy"
          >
            로그인 하러 가기
          </Link>
        </div>
      )}
    </form>
  );
}

function ResetPwForm() {
  const router = useRouter();
  const [portal, setPortal] = useState<Portal>("OFFICIAL");

  const [orgName, setOrgName] = useState("");
  const [deptName, setDeptName] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [repName, setRepName] = useState("");

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function reset() {
    setErrorMsg(null);
    setTempPassword(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const payload =
        portal === "OFFICIAL"
          ? { portal, organizationName: orgName, departmentName: deptName, email }
          : { portal, companyName, representativeName: repName, email };
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message ?? "입력한 정보가 일치하지 않습니다.");
        return;
      }
      setTempPassword(data.tempPassword);
    } catch {
      setErrorMsg("입력한 정보가 일치하지 않습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PortalToggle
        portal={portal}
        onChange={(p) => {
          setPortal(p);
          reset();
        }}
      />

      {portal === "OFFICIAL" ? (
        <>
          <FieldLabelInput
            label="소속 지자체/기관명"
            value={orgName}
            onChange={(v) => {
              setOrgName(v);
              reset();
            }}
            placeholder="예: 화성시청"
          />
          <FieldLabelInput
            label="소속 부서명"
            value={deptName}
            onChange={(v) => {
              setDeptName(v);
              reset();
            }}
            placeholder="예: 도로관리과"
            className="mt-[14.64px]"
          />
        </>
      ) : (
        <>
          <FieldLabelInput
            label="업체명"
            value={companyName}
            onChange={(v) => {
              setCompanyName(v);
              reset();
            }}
            placeholder="예: 한국색소"
          />
          <FieldLabelInput
            label="대표자 성함"
            value={repName}
            onChange={(v) => {
              setRepName(v);
              reset();
            }}
            placeholder="예: 홍길동"
            className="mt-[14.64px]"
          />
        </>
      )}

      <FieldLabelInput
        label="가입 이메일"
        type="email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          reset();
        }}
        placeholder="가입 시 등록한 이메일"
        className="mt-[14.64px]"
      />

      <button type="submit" disabled={loading} className={`mt-[14.64px] ${primaryBtnCls}`}>
        임시 비밀번호 발급
      </button>

      {errorMsg && <ErrorBanner message={errorMsg} />}

      {tempPassword && (
        <div className="mt-[14.64px] rounded-[14.64px] border border-[#1E3A5F33] bg-[#1E3A5F0D] p-[20.52px] text-center">
          <p className="text-[12px] font-normal leading-[22px] tracking-[-0.18px] text-ink/50">
            임시 비밀번호가 발급되었습니다
          </p>
          <p className="mt-[9.76px] text-[20px] font-bold leading-[36px] tracking-[1px] text-navy">
            {tempPassword}
          </p>
          <p className="mt-[9.76px] text-[11px] font-normal leading-[20px] tracking-[-0.165px] text-ink/40">
            로그인 후 반드시 비밀번호를 변경해주세요.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-[14.64px] rounded-[9.76px] bg-navy px-[19.52px] py-[9.76px] text-[12px] font-medium leading-[22px] tracking-[-0.18px] text-white transition-colors hover:bg-navy-hover"
          >
            로그인 하러 가기
          </button>
        </div>
      )}
    </form>
  );
}
