"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stepper, Field, TextInput, PasswordInput } from "@/components/signup/ui";
import { openPostcode } from "@/lib/daum-postcode";
import { uploadFile } from "@/lib/upload-client";
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@/components/icons";

type Portal = "OFFICIAL" | "SUPPLIER";
interface Term {
  id: string;
  type: string;
  title: string;
  summary: string;
  content: string;
  required: boolean;
}

const STEP_LABELS: Record<Portal, string[]> = {
  OFFICIAL: ["계정 정보", "기관/기업 정보", "약관 동의"],
  SUPPLIER: ["계정 정보", "기관/기업 정보", "약관 동의", "가입 완료"],
};

const emptyForm = {
  email: "",
  password: "",
  passwordConfirm: "",
  organizationBizNo: "",
  organizationName: "",
  departmentName: "",
  departmentPhone: "",
  name: "",
  position: "",
  orgRepresentativeName: "",
  orgTaxEmail: "",
  orgAddress: "",
  companyName: "",
  representativeName: "",
  businessRegistrationNo: "",
  corporateRegistrationNo: "",
  businessType: "",
  businessItem: "",
  address: "",
  phone: "",
  businessLicenseFileUrl: "",
};
type Form = typeof emptyForm;

const PW_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SignupPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<Portal>("OFFICIAL");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(emptyForm);
  const [terms, setTerms] = useState<Term[]>([]);
  const [agreed, setAgreed] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; passwordConfirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const clearFieldError = (k: "email" | "password" | "passwordConfirm") =>
    setFieldErrors((e) => ({ ...e, [k]: undefined }));

  useEffect(() => {
    fetch(`/api/terms?portal=${portal}`)
      .then((r) => r.json())
      .then((d) => setTerms(d.terms ?? []))
      .catch(() => setTerms([]));
  }, [portal]);

  function switchPortal(p: Portal) {
    setPortal(p);
    setStep(0);
    setAgreed(new Set());
    setError(null);
  }

  const lastFormStep = STEP_LABELS[portal].length - (portal === "SUPPLIER" ? 2 : 1);

  function validateStep(): string | null {
    if (step === 1) {
      if (portal === "OFFICIAL") {
        if (!form.organizationBizNo || !form.organizationName || !form.departmentName || !form.departmentPhone)
          return "필수 기관 정보를 모두 입력하세요";
      } else {
        if (!form.companyName || !form.representativeName || !form.businessRegistrationNo || !form.address || !form.phone)
          return "필수 기업 정보를 모두 입력하세요";
      }
    }
    return null;
  }

  function next() {
    if (step === 0) {
      const fe: typeof fieldErrors = {};
      if (!form.email) fe.email = "이메일을 입력하세요";
      if (!form.password) fe.password = "비밀번호를 입력하세요";
      else if (!PW_RE.test(form.password)) fe.password = "영문, 숫자, 특수문자 조합 8자 이상으로 입력하세요";
      if (!form.passwordConfirm) fe.passwordConfirm = "비밀번호 확인을 입력하세요";
      else if (form.password !== form.passwordConfirm) fe.passwordConfirm = "비밀번호가 일치하지 않습니다";
      setFieldErrors(fe);
      if (Object.values(fe).some(Boolean)) return;
      setError(null);
      setStep(1);
      return;
    }
    const v = validateStep();
    if (v) return setError(v);
    setError(null);
    setStep((s) => s + 1);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const saved = await uploadFile(file);
      set("businessLicenseFileUrl", saved.url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function searchAddress(target: "address" | "orgAddress") {
    try {
      const r = await openPostcode();
      set(target, r.roadAddress + (r.buildingName ? ` (${r.buildingName})` : ""));
    } catch {
      setError("주소 검색을 불러오지 못했습니다");
    }
  }

  function toggleTerm(id: string) {
    setAgreed((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  const allAgreed = terms.length > 0 && terms.every((t) => agreed.has(t.id));
  const requiredAgreed = terms.filter((t) => t.required).every((t) => agreed.has(t.id));

  async function submit() {
    if (!requiredAgreed) return setError("필수 약관에 동의해 주세요");
    setSubmitting(true);
    setError(null);
    try {
      const payload =
        portal === "OFFICIAL"
          ? {
              portal,
              email: form.email,
              password: form.password,
              organizationBizNo: form.organizationBizNo,
              organizationName: form.organizationName,
              departmentName: form.departmentName,
              departmentPhone: form.departmentPhone,
              name: form.name,
              position: form.position,
              orgRepresentativeName: form.orgRepresentativeName,
              orgTaxEmail: form.orgTaxEmail,
              orgAddress: form.orgAddress,
              termIds: [...agreed],
            }
          : {
              portal,
              email: form.email,
              password: form.password,
              companyName: form.companyName,
              representativeName: form.representativeName,
              businessRegistrationNo: form.businessRegistrationNo,
              businessLicenseFileUrl: form.businessLicenseFileUrl || undefined,
              corporateRegistrationNo: form.corporateRegistrationNo,
              businessType: form.businessType,
              businessItem: form.businessItem,
              address: form.address,
              phone: form.phone,
              termIds: [...agreed],
            };
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "가입에 실패했습니다");
        return;
      }
      setDone(true);
      if (portal === "SUPPLIER") setStep(3);
    } catch {
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card>
        <Header />
        <Stepper steps={STEP_LABELS[portal]} current={STEP_LABELS[portal].length} />
        <Completion portal={portal} form={form} />
      </Card>
    );
  }

  return (
    <Card>
      <Header />
      <PortalTabs portal={portal} onChange={switchPortal} />
      <Stepper steps={STEP_LABELS[portal]} current={step} />

      <div className="rounded-[var(--radius-card)] bg-surface p-[29.28px] shadow-sm">
        {step === 0 && (
          <AccountStep form={form} set={set} errors={fieldErrors} clearError={clearFieldError} />
        )}
        {step === 1 && portal === "OFFICIAL" && (
          <OfficialInfoStep form={form} set={set} onSearch={() => searchAddress("orgAddress")} />
        )}
        {step === 1 && portal === "SUPPLIER" && (
          <SupplierInfoStep
            form={form}
            set={set}
            onSearch={() => searchAddress("address")}
            onUpload={onUpload}
            uploading={uploading}
            fileName={fileName}
          />
        )}
        {step === lastFormStep && (
          <TermsStep
            terms={terms}
            agreed={agreed}
            toggle={toggleTerm}
            allAgreed={allAgreed}
            toggleAll={() => setAgreed(allAgreed ? new Set() : new Set(terms.map((t) => t.id)))}
          />
        )}

        {error && (
          <p className="mt-3 flex items-center gap-1 text-[12px] tracking-[-0.18px] text-danger">
            <AlertCircleIcon /> {error}
          </p>
        )}

        <div className="mt-[17.08px] flex gap-[14.64px]">
          {step > 0 && (
            <button
              onClick={() => {
                setError(null);
                setStep((s) => s - 1);
              }}
              className="flex-1 rounded-[14.64px] border border-line/50 py-[14.64px] text-[14px] font-normal tracking-[-0.2928px] text-ink/50 hover:bg-field"
            >
              이전
            </button>
          )}
          {step < lastFormStep ? (
            <button
              onClick={next}
              className="flex-1 rounded-[14.64px] bg-navy py-[14.64px] text-[14px] font-semibold tracking-[-0.2928px] text-white hover:bg-navy-hover"
            >
              다음
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || !requiredAgreed}
              className="flex-1 rounded-[14.64px] bg-navy py-[14.64px] text-[14px] font-semibold tracking-[-0.2928px] text-white hover:bg-navy-hover disabled:opacity-60"
            >
              {submitting ? "처리 중…" : "가입 완료"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] tracking-[-0.18px] text-ink/40">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-navy hover:underline">
          로그인
        </Link>
      </p>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-[624px]">{children}</div>;
}

function Header() {
  return (
    <div className="mb-6 text-center">
      <img src="/korlink-logo.svg" alt="KORLINK" className="mx-auto h-8 w-auto" />
      <h1 className="mt-5 text-[22px] font-bold tracking-[-0.55px] text-ink">KORLINK 회원가입</h1>
      <p className="mt-1 text-[13px] tracking-[-0.195px] text-ink/40">지자체 공공조달 플랫폼</p>
    </div>
  );
}

function PortalTabs({ portal, onChange }: { portal: Portal; onChange: (p: Portal) => void }) {
  return (
    <div className="mb-6 flex gap-1 rounded-[19.52px] border border-line/30 bg-surface p-px">
      {(["OFFICIAL", "SUPPLIER"] as Portal[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`flex-1 rounded-[11px] py-[14.64px] text-[13px] font-medium tracking-[-0.293px] transition-all ${
            portal === p ? "bg-navy text-white shadow-sm" : "text-ink/50"
          }`}
        >
          {p === "OFFICIAL" ? "공무원 / 구매담당자" : "공급 및 입점 업체"}
        </button>
      ))}
    </div>
  );
}

function AccountStep({
  form,
  set,
  errors,
  clearError,
}: {
  form: Form;
  set: (k: keyof Form, v: string) => void;
  errors: { email?: string; password?: string; passwordConfirm?: string };
  clearError: (k: "email" | "password" | "passwordConfirm") => void;
}) {
  const match = form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;
  return (
    <>
      <h2 className="mb-5 text-[14px] font-bold tracking-[-0.392px] text-ink">계정 정보</h2>
      <Field label="아이디 (이메일)" required>
        <TextInput
          type="email"
          value={form.email}
          onChange={(e) => {
            set("email", e.target.value);
            clearError("email");
          }}
          placeholder="일반 이메일 계정"
        />
        {errors.email && <FieldError msg={errors.email} />}
      </Field>
      <Field label="비밀번호" required hint="(영문, 숫자, 특수문자 8자 이상)">
        <PasswordInput
          value={form.password}
          onChange={(e) => {
            set("password", e.target.value);
            clearError("password");
          }}
          placeholder="영문, 숫자, 특수문자 조합 8자 이상"
        />
        {errors.password && <FieldError msg={errors.password} />}
      </Field>
      <Field label="비밀번호 확인" required>
        <PasswordInput
          value={form.passwordConfirm}
          onChange={(e) => {
            set("passwordConfirm", e.target.value);
            clearError("passwordConfirm");
          }}
          placeholder="비밀번호를 다시 입력하세요"
        />
        {errors.passwordConfirm ? (
          <FieldError msg={errors.passwordConfirm} />
        ) : (
          form.passwordConfirm.length > 0 && (
            <p
              className={`mt-[7.32px] flex items-center gap-1 text-[12px] tracking-[-0.18px] ${
                match ? "text-success" : "text-danger"
              }`}
            >
              {match ? <CheckCircleIcon /> : <AlertCircleIcon />}
              {match ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
            </p>
          )
        )}
      </Field>
    </>
  );
}

function useBizNoVerify(value: string) {
  const [result, setResult] = useState<"ok" | "fail" | null>(null);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const ready = value.replace(/\D/g, "").length === 10;
  const reset = () => { setResult(null); setMessage(""); };
  async function check() {
    if (!ready || checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/auth/verify-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bizNo: value }),
      });
      const d = (await res.json()) as { valid?: boolean; message?: string };
      setResult(d.valid ? "ok" : "fail");
      setMessage(d.message ?? "");
    } catch {
      setResult("fail");
      setMessage("진위확인 중 오류가 발생했습니다");
    } finally {
      setChecking(false);
    }
  }
  return { result, message, checking, ready, reset, check };
}

function BizNoVerifyButton({ label, biz }: { label: string; biz: ReturnType<typeof useBizNoVerify> }) {
  return (
    <button
      type="button"
      disabled={!biz.ready || biz.checking}
      onClick={biz.check}
      className={`shrink-0 rounded-[14.64px] px-4 text-[13px] font-medium transition-colors disabled:cursor-not-allowed ${biz.ready ? "bg-navy text-white hover:bg-navy-hover" : "bg-navy/[0.04] text-navy/20"}`}
    >
      {biz.checking ? "확인 중…" : label}
    </button>
  );
}

function BizNoResult({ result, message }: { result: "ok" | "fail" | null; message: string }) {
  if (!result) return null;
  const ok = result === "ok";
  return (
    <p className={`mt-[4.88px] flex items-center gap-[4.88px] text-[11px] leading-[19.8px] tracking-[-0.165px] ${ok ? "text-success" : "text-danger"}`}>
      {ok ? <CheckCircleIcon width={11} height={11} className="shrink-0" /> : <AlertCircleIcon width={11} height={11} className="shrink-0" />}
      {message || (ok ? "확인되었습니다" : "사업자등록번호를 다시 확인해 주세요")}
    </p>
  );
}

function OfficialInfoStep({
  form,
  set,
  onSearch,
}: {
  form: Form;
  set: (k: keyof Form, v: string) => void;
  onSearch: () => void;
}) {
  const biz = useBizNoVerify(form.organizationBizNo);

  return (
    <>
      <h2 className="mb-5 text-[14px] font-bold tracking-[-0.392px] text-ink">기관 및 부서 정보</h2>
      <Field label="관공서 사업자 등록번호" required>
        <div className="flex gap-2">
          <TextInput
            value={form.organizationBizNo}
            onChange={(e) => {
              set("organizationBizNo", e.target.value);
              biz.reset();
            }}
            placeholder="고유번호증 또는 사업자등록번호"
          />
          <BizNoVerifyButton label="인증" biz={biz} />
        </div>
        <BizNoResult result={biz.result} message={biz.message} />
      </Field>
      <Field label="소속 지자체/기관명" required>
        <TextInput
          value={form.organizationName}
          onChange={(e) => set("organizationName", e.target.value)}
          placeholder="예: 경기도청, 수원시청"
        />
      </Field>
      <Field label="소속 부서명" required>
        <TextInput
          value={form.departmentName}
          onChange={(e) => set("departmentName", e.target.value)}
          placeholder="예: 도로관리과, 안전총괄과"
        />
      </Field>
      <Field label="부서 대표 전화번호" required>
        <TextInput
          value={form.departmentPhone}
          onChange={(e) => set("departmentPhone", e.target.value)}
          placeholder="031-XXX-XXXX (유선 번호)"
        />
      </Field>

      <p className="mb-2 mt-6 text-[12px] tracking-[-0.18px] text-ink/30">선택 입력 항목</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="성명 (선택)">
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="실명 입력" />
        </Field>
        <Field label="직책 (선택)">
          <TextInput value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="예: 주무관, 대리" />
        </Field>
      </div>

      <div className="mt-4 border-t border-line/20 pt-[20.52px]">
        <p className="text-[14px] font-semibold tracking-[-0.21px] text-ink/60">세금계산서 발행 정보</p>
        <p className="mb-3 text-[12px] tracking-[-0.18px] text-ink/30">구매 확정 후 세금계산서 발행을 위해 필요한 정보입니다. (선택 입력)</p>
        <Field label="대표자(기관장) 성함">
          <TextInput
            value={form.orgRepresentativeName}
            onChange={(e) => set("orgRepresentativeName", e.target.value)}
            placeholder="기관장 성함 (세금계산서 대표자명)"
          />
        </Field>
        <Field label="세금계산서 수신용 이메일">
          <TextInput
            value={form.orgTaxEmail}
            onChange={(e) => set("orgTaxEmail", e.target.value)}
            placeholder="세금계산서 전자발송 받을 이메일"
          />
        </Field>
        <Field label="사업장 주소">
          <div className="flex gap-2">
            <TextInput value={form.orgAddress} onChange={(e) => set("orgAddress", e.target.value)} placeholder="기관 소재지 도로명 주소" readOnly />
            <button type="button" onClick={onSearch} className="shrink-0 rounded-[14.64px] bg-field px-[19.52px] py-[14.6px] text-[12px] font-medium text-navy hover:bg-line/40">
              주소 검색
            </button>
          </div>
        </Field>
      </div>
    </>
  );
}

function SupplierInfoStep({
  form,
  set,
  onSearch,
  onUpload,
  uploading,
  fileName,
}: {
  form: Form;
  set: (k: keyof Form, v: string) => void;
  onSearch: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  fileName: string;
}) {
  const biz = useBizNoVerify(form.businessRegistrationNo);

  return (
    <>
      <h2 className="mb-5 text-[14px] font-bold tracking-[-0.392px] text-ink">기업 기본 정보</h2>
      <Field label="업체명" required>
        <TextInput value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="사업자등록증상 상호명" />
      </Field>
      <Field label="대표자 성함" required>
        <TextInput value={form.representativeName} onChange={(e) => set("representativeName", e.target.value)} placeholder="사업자등록증상 대표자 실명" />
      </Field>
      <Field label="사업자 등록번호" required>
        <div className="flex gap-2">
          <TextInput
            value={form.businessRegistrationNo}
            onChange={(e) => {
              set("businessRegistrationNo", e.target.value);
              biz.reset();
            }}
            placeholder="XXX-XX-XXXXX"
          />
          <BizNoVerifyButton label="진위 확인" biz={biz} />
        </div>
        <BizNoResult result={biz.result} message={biz.message} />
      </Field>
      <Field label="사업자등록증 업로드">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[14.64px] border-2 border-dashed border-line/50 py-8 text-center hover:bg-field">
          <span className="text-ink/30">⬆</span>
          <span className="mt-1 text-[14px] tracking-[-0.21px] text-ink/50">{uploading ? "업로드 중…" : fileName || "클릭하여 파일 선택"}</span>
          <span className="mt-0.5 text-[12px] tracking-[-0.18px] text-ink/30">PDF, JPG, PNG 지원</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onUpload} className="hidden" />
        </label>
      </Field>
      <Field label="법인 등록번호">
        <TextInput value={form.corporateRegistrationNo} onChange={(e) => set("corporateRegistrationNo", e.target.value)} placeholder="법인 사업자의 경우 필수 (개인 사업자 제외)" />
      </Field>
      <div className="grid grid-cols-2 gap-[14.64px]">
        <Field label="업태">
          <TextInput value={form.businessType} onChange={(e) => set("businessType", e.target.value)} placeholder="사업자등록증 업태" />
        </Field>
        <Field label="종목">
          <TextInput value={form.businessItem} onChange={(e) => set("businessItem", e.target.value)} placeholder="사업자등록증 종목" />
        </Field>
      </div>
      <Field label="사업장 소재지" required>
        <div className="flex gap-2">
          <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="도로명 주소 검색" readOnly />
          <button type="button" onClick={onSearch} className="shrink-0 rounded-[14.64px] bg-navy/10 px-4 text-sm font-medium text-navy hover:bg-navy/[0.15]">
            주소 검색
          </button>
        </div>
      </Field>
      <Field label="업체 대표 전화번호" required>
        <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="사무실 유선 번호 (지역번호 포함)" />
      </Field>
      <div className="rounded-[14.64px] border border-line/20 bg-field p-[20.52px]">
        <p className="text-[13px] font-semibold tracking-[-0.195px] text-ink/70">기업 프로필 및 정산 정보</p>
        <p className="mt-1 text-[12px] tracking-[-0.18px] text-ink/50">
          한 줄 소개, 기업 상세 소개, 포트폴리오 업로드, 담당자 및 정산 정보는 승인 후{" "}
          <span className="font-medium text-navy">공급업체 관리 &gt; 프로필 설정</span>에서 입력해 주세요.
        </p>
      </div>
    </>
  );
}

function TermsStep({
  terms,
  agreed,
  toggle,
  allAgreed,
  toggleAll,
}: {
  terms: Term[];
  agreed: Set<string>;
  toggle: (id: string) => void;
  allAgreed: boolean;
  toggleAll: () => void;
}) {
  const [detail, setDetail] = useState<Term | null>(null);
  return (
    <>
      <h2 className="mb-1 text-[14px] font-bold tracking-[-0.392px] text-ink">약관 동의</h2>
      <p className="mb-4 text-[12px] leading-[21.6px] tracking-[-0.18px] text-ink/40">
        원활한 서비스 이용을 위해 아래 약관에 동의해 주세요. 각 약관 제목 옆 &quot;전체보기&quot; 버튼을 눌러 상세 내용을 확인하실 수 있습니다.
      </p>
      <div className="space-y-3">
        {terms.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-[14.64px] border p-[20.52px] ${
              agreed.has(t.id) ? "border-navy/30 bg-navy/[0.02]" : "border-line/30 bg-surface"
            }`}
          >
            <Checkbox checked={agreed.has(t.id)} onChange={() => toggle(t.id)} />
            <label className="flex-1 cursor-pointer" onClick={() => toggle(t.id)}>
              <span className="text-[13px] font-semibold tracking-[-0.21px] text-ink">
                {t.title}
                <span
                  className={`ml-[7.32px] inline-block rounded-full px-[7.32px] py-[2.44px] text-[10px] font-bold ${
                    t.required ? "bg-[#FEF2F2] text-danger" : "bg-field text-ink/40"
                  }`}
                >
                  {t.required ? "필수" : "선택"}
                </span>
              </span>
              <span className="mt-1 block text-[12px] leading-[18px] tracking-[-0.18px] text-ink/50">{t.summary}</span>
            </label>
            <button
              type="button"
              onClick={() => setDetail(t)}
              className="shrink-0 rounded-[9.76px] border border-line/30 px-[15.6px] py-[8.3px] text-[11px] tracking-[-0.2928px] text-ink/50"
            >
              전체보기
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Checkbox checked={allAgreed} onChange={toggleAll} />
        <span
          onClick={toggleAll}
          className="cursor-pointer text-[13px] font-medium tracking-[-0.195px] text-ink/70"
        >
          전체 동의하기
        </span>
      </div>
      {detail && <TermDetailModal term={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

const APPROVAL_STEPS = [
  { title: "서류 검토", desc: "제출하신 사업자등록증 및 기업 정보를 검토합니다" },
  { title: "승인 완료", desc: "제출하신 기업 정보를 기반으로 관리자가 1~3일 이내 승인 처리합니다." },
  { title: "서비스 이용 시작", desc: "승인 후 로그인하여 공급업체 서비스를 이용할 수 있습니다" },
];

function Completion({ portal, form }: { portal: Portal; form: Form }) {
  const router = useRouter();
  const isOfficial = portal === "OFFICIAL";
  return (
    <div className="rounded-[19.52px] bg-surface p-[29.28px] text-center shadow-[0px_2px_20px_rgba(0,0,0,0.06)]">
      {isOfficial ? (
        <div className="mx-auto flex h-[97.59px] w-[97.59px] items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981]">
          <ShieldCheckIcon width={45} height={45} />
        </div>
      ) : (
        <div className="relative mx-auto flex h-[97.59px] w-[97.59px] items-center justify-center rounded-full bg-[#FFFBEB] text-[#F59E0B]">
          <ClockIcon width={45} height={45} />
          <span className="absolute bottom-0 right-0 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#FBBF24] text-white">
            <ClockIcon width={17} height={17} strokeWidth={2.4} />
          </span>
        </div>
      )}

      <h2 className="mt-[24.4px] text-[18px] font-bold tracking-[-0.504px] text-ink">
        {isOfficial ? "회원가입 완료!" : "신청이 접수되었습니다!"}
      </h2>
      <p className="mt-[4.88px] text-[13px] tracking-[-0.195px] text-ink/50">
        {isOfficial ? "관공서 인증이 확인되어 즉시 이용 가능합니다" : "관리자 검토 후 승인 알림을 보내드립니다"}
      </p>

      <span
        className={`mt-[24.4px] inline-flex items-center gap-[9.76px] rounded-full border px-[20.52px] py-[10.76px] text-[12px] font-semibold tracking-[-0.18px] ${
          isOfficial ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" : "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
        }`}
      >
        <span className={`h-[9.75px] w-[9.75px] rounded-full ${isOfficial ? "bg-[#10B981]" : "bg-[#FBBF24]"}`} />
        {isOfficial ? "자동 승인 완료" : "관리자 승인 대기 중"}
      </span>

      <div className="mt-[24.4px] rounded-[19.52px] border border-line/20 bg-[#F8F9FB] p-[25.4px] text-left">
        <p className="mb-[14.64px] text-[12px] font-bold tracking-[0.3px] text-ink/60">가입 정보 요약</p>
        <Row k="가입 이메일" v={form.email} />
        {isOfficial ? (
          <>
            <Row k="소속 기관" v={form.organizationName} />
            <Row k="소속 부서" v={form.departmentName} />
          </>
        ) : (
          <>
            <Row k="업체명" v={form.companyName} />
            <Row k="대표자" v={form.representativeName} />
          </>
        )}
        <Row
          k="계정 유형"
          v={isOfficial ? "공무원 / 구매담당자" : "공급 및 입점 업체"}
          color={isOfficial ? "#059669" : "#D97706"}
        />
      </div>

      {!isOfficial && (
        <div className="mt-[24.4px] rounded-[19.52px] border border-line/20 bg-[#F8F9FB] p-[25.4px] text-left">
          <p className="mb-[14.64px] text-[12px] font-bold tracking-[-0.18px] text-ink/60">승인 절차 안내</p>
          {APPROVAL_STEPS.map((s, i) => (
            <div key={i} className="mt-[14.64px] flex gap-[14.64px] first:mt-0">
              <span className="mt-[2.44px] flex h-[29.27px] w-[29.27px] shrink-0 items-center justify-center rounded-full bg-navy/10 text-[10px] font-bold text-navy">
                {i + 1}
              </span>
              <div>
                <p className="text-[12px] font-medium tracking-[-0.18px] text-ink">{s.title}</p>
                <p className="mt-0.5 text-[11px] leading-[20px] tracking-[-0.165px] text-ink/40">{s.desc}</p>
              </div>
            </div>
          ))}
          <div className="mt-[19.52px] flex items-center gap-[9.76px] border-t border-line/20 pt-[15.64px]">
            <ClockIcon width={12} height={12} className="shrink-0 text-ink/30" />
            <span className="text-[11px] tracking-[-0.165px] text-ink/40">
              평균 검토 소요 시간: <span className="font-medium text-ink/60">영업일 기준 1~3일</span>
            </span>
          </div>
        </div>
      )}

      <button
        onClick={() => router.push(isOfficial ? "/login" : "/")}
        className="mt-[24.4px] w-full rounded-[14.64px] bg-navy py-[14.64px] text-[14px] font-semibold tracking-[-0.2928px] text-white hover:bg-navy-hover"
      >
        {isOfficial ? "로그인 하러 가기" : "홈으로 돌아가기"}
      </button>
      <Link
        href={isOfficial ? "/" : "/login"}
        className="mt-[9.76px] block text-[13px] tracking-[-0.2928px] text-ink/40 hover:text-navy"
      >
        {isOfficial ? "홈으로 돌아가기" : "로그인 페이지로 이동"}
      </Link>
    </div>
  );
}

function TermDetailModal({ term, onClose }: { term: Term; onClose: () => void }) {
  const lines = term.content.split("\n");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-[19.52px] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-[820px] max-w-full flex-col rounded-[19.52px] bg-surface shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line/20 bg-white/95 px-[29.28px] py-[19.52px]">
          <div className="flex items-center gap-[14.64px]">
            <span className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[9.76px] bg-navy/10 text-navy">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5M9 13h6M9 17h6" />
              </svg>
            </span>
            <h3 className="text-[15px] font-bold tracking-[-0.42px] text-ink">{term.title}</h3>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-field"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[29.28px] py-[24.4px]">
          {lines.map((ln, i) =>
            /^제\d+조/.test(ln) ? (
              <p key={i} className="mb-1 mt-4 text-[16px] font-bold tracking-[-0.448px] text-ink first:mt-0">
                {ln}
              </p>
            ) : (
              <p key={i} className="mb-1 text-[14px] leading-[25.2px] tracking-[-0.195px] text-ink/70">
                {ln}
              </p>
            ),
          )}
        </div>
        <div className="border-t border-line/20 bg-[#FAFAFA] px-[29.28px] pb-[19.52px] pt-[20.52px]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[14.64px] bg-navy py-[14.64px] text-[13px] font-semibold tracking-[-0.2928px] text-white hover:bg-navy-hover"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-[4.88px] flex items-center gap-[4.88px] text-[11px] leading-[19.8px] tracking-[-0.165px] text-danger">
      <AlertCircleIcon width={11} height={11} className="shrink-0" />
      {msg}
    </p>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[7.32px] border-2 transition-colors ${
        checked ? "border-navy bg-navy text-white" : "border-line/50 bg-surface"
      }`}
    >
      {checked && (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5 9-10" />
        </svg>
      )}
    </button>
  );
}

function Row({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-[4.88px] text-[12px] tracking-[-0.18px]">
      <span className="text-ink/40">{k}</span>
      <span className="font-medium" style={color ? { color } : { color: "#1D1D1F" }}>
        {v || "-"}
      </span>
    </div>
  );
}
