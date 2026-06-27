"use client";

import { useState, useRef, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PartnerProfileData } from "@/lib/partner-profile";
import { uploadFile } from "@/lib/upload-client";
import {
  AlertTriangleIcon,
  TabProfileIcon,
  TabCardIcon,
  BuildingIcon,
  UserIcon,
  PlusIcon,
  RemoveIcon,
  UploadIcon,
  CloseIcon,
  ModalUploadIcon,
  InfoCircleIcon,
  ShieldCheckIcon,
  GreenCheckIcon,
  CardNavyIcon,
  ClockIcon,
  SmallCheckIcon,
  StepOneIcon,
  StepTwoIcon,
  StepThreeIcon,
  SelectChevronIcon,
} from "./profile-icons";
import { REMITTANCE_ACCOUNT, type Performance, type Equipment } from "./profile-data";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

type Tab = "profile" | "account";
type ModalStep = 0 | 1 | 2;

const CARD: CSSProperties = {
  borderRadius: "19.52px",
  background: "#FFFFFF",
  border: "1px solid rgba(210,210,215,0.2)",
};

const LABEL: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "-0.18px",
  lineHeight: "21.6px",
  color: "rgba(29,29,31,0.5)",
};

const INPUT_BOX: CSSProperties = {
  width: "100%",
  borderRadius: "14.64px",
  background: "#FFFFFF",
  border: "1px solid rgba(210,210,215,0.3)",
  fontSize: "13px",
  fontWeight: 400,
  letterSpacing: "-0.2928px",
  lineHeight: "22.75px",
  color: INK,
  outline: "none",
};

const PLACEHOLDER_STYLE = `
  .profile-input::placeholder { color: #9CA3AF; font-weight: 500; }
  .profile-input { font-weight: 400; }
  .profile-code::placeholder { color: #9CA3AF; font-weight: 500; }
`;

export function PartnerProfileView({ data }: { data: PartnerProfileData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [verified, setVerified] = useState(data.account.verified);
  const [modalStep, setModalStep] = useState<ModalStep>(0);

  return (
    <div>
      <style>{PLACEHOLDER_STYLE}</style>

      <div style={{ marginBottom: "29.28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.56px", lineHeight: "25px", color: INK, margin: 0 }}>
          프로필 설정
        </h1>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
          기업 소개 및 정산 계좌 정보 관리
        </p>
      </div>

      {verified ? <VerifiedBanner /> : <UnverifiedBanner onVerify={() => { setTab("account"); setModalStep(1); }} />}

      <TabBar tab={tab} verified={verified} onChange={setTab} />

      {tab === "profile" ? (
        <ProfileTab data={data} onSaved={() => router.refresh()} />
      ) : verified ? (
        <VerifiedAccountTab account={data.account} onChange={() => { setVerified(false); setModalStep(1); }} />
      ) : (
        <UnverifiedAccountTab onVerify={() => setModalStep(1)} />
      )}

      {modalStep === 1 && (
        <AccountStep1Modal onClose={() => setModalStep(0)} onNext={() => setModalStep(2)} />
      )}
      {modalStep === 2 && (
        <AccountStep2Modal
          onClose={() => setModalStep(0)}
          onBack={() => setModalStep(1)}
          onConfirm={async (code) => {
            await fetch("/api/partner/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ verifyAccount: true, verifyCode: code }),
            });
            setVerified(true);
            setModalStep(0);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function UnverifiedBanner({ onVerify }: { onVerify: () => void }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "20.52px", borderRadius: "19.52px", background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: "24.4px" }}
    >
      <div className="flex items-center" style={{ gap: "14.64px" }}>
        <div className="flex items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "14.64px", background: "#FEE2E2" }}>
          <AlertTriangleIcon />
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#B91C1C", margin: 0 }}>
            정산 계좌 인증이 필요합니다
          </p>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#EF4444", margin: "2.44px 0 0" }}>
            계좌 인증 완료 후 상품 등록 및 견적 대응이 가능합니다.
          </p>
        </div>
      </div>
      <button
        onClick={onVerify}
        style={{ padding: "9.76px 19.52px", borderRadius: "14.64px", background: NAVY, color: "#FFFFFF", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "21px", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
      >
        계좌 인증하기
      </button>
    </div>
  );
}

function VerifiedBanner() {
  return (
    <div
      className="flex items-center"
      style={{ gap: "14.64px", padding: "20.52px", borderRadius: "19.52px", background: "#ECFDF5", border: "1px solid #A7F3D0", marginBottom: "24.4px" }}
    >
      <div className="flex items-center justify-center" style={{ width: "44px", height: "44px", borderRadius: "14.64px", background: "#D1FAE5" }}>
        <GreenCheckIcon />
      </div>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#047857", margin: 0 }}>
          정산 계좌 인증 완료
        </p>
        <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#059669", margin: "2.44px 0 0" }}>
          계좌가 인증되어 상품 등록 및 견적 대응이 가능합니다.
        </p>
      </div>
    </div>
  );
}

function TabBar({ tab, verified, onChange }: { tab: Tab; verified: boolean; onChange: (t: Tab) => void }) {
  return (
    <div className="flex" style={{ gap: "2.44px", borderBottom: "1px solid rgba(210,210,215,0.2)", marginBottom: "29.28px" }}>
      <button
        onClick={() => onChange("profile")}
        className="flex items-center justify-center"
        style={{ gap: "7.32px", padding: "12.2px 24.4px 14.2px", borderBottom: tab === "profile" ? `2px solid ${NAVY}` : "2px solid transparent", background: "none", border: "none", cursor: "pointer", marginBottom: "-1px" }}
      >
        <TabProfileIcon active={tab === "profile"} />
        <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: tab === "profile" ? NAVY : "rgba(29,29,31,0.4)" }}>
          기업 프로필 관리
        </span>
      </button>
      <button
        onClick={() => onChange("account")}
        className="flex items-center justify-center"
        style={{ gap: "7.32px", padding: "12.2px 24.4px 14.2px", borderBottom: tab === "account" ? `2px solid ${NAVY}` : "2px solid transparent", background: "none", border: "none", cursor: "pointer", marginBottom: "-1px" }}
      >
        <TabCardIcon active={tab === "account"} />
        <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: tab === "account" ? NAVY : "rgba(29,29,31,0.4)" }}>
          정산 계좌 관리
        </span>
        {!verified && <span style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#EF4444" }} />}
      </button>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center" style={{ gap: "9.76px" }}>
      <span className="flex items-center justify-center" style={{ width: "24px", height: "24px" }}>{icon}</span>
      <h2 style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK, margin: 0 }}>{children}</h2>
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label style={{ ...LABEL, display: "block", marginBottom: "7.32px" }}>{children}</label>;
}

function ProfileTab({ data, onSaved }: { data: PartnerProfileData; onSaved: () => void }) {
  const [intro, setIntro] = useState(data.intro);
  const [description, setDescription] = useState(data.description);
  const [manager, setManager] = useState(data.manager);
  const [performances, setPerformances] = useState<Performance[]>(data.performances);
  const [equipments, setEquipments] = useState<Equipment[]>(data.equipments);
  const [saving, setSaving] = useState(false);
  const [portfolioFileName, setPortfolioFileName] = useState<string | null>(null);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const portfolioRef = useRef<HTMLInputElement>(null);

  const setPerf = (i: number, patch: Partial<Performance>) => setPerformances(performances.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addPerf = () => setPerformances([...performances, { label: `실적 ${performances.length + 1}`, project: "", client: "", year: "", amount: "" }]);
  const removePerf = (i: number) => setPerformances(performances.filter((_, idx) => idx !== i));
  const setEquip = (i: number, patch: Partial<Equipment>) => setEquipments(equipments.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const addEquip = () => setEquipments([...equipments, { name: "", quantity: "" }]);
  const removeEquip = (i: number) => setEquipments(equipments.filter((_, idx) => idx !== i));

  async function onPortfolioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPortfolioUploading(true);
    try {
      const result = await uploadFile(file);
      setPortfolioFileName(result.name);
      await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioFileName: result.name }),
      });
    } finally {
      setPortfolioUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intro,
          description,
          manager,
          performances: performances.map((p) => ({ project: p.project, client: p.client, year: p.year, amount: p.amount })),
          equipments: equipments.map((e) => ({ name: e.name, quantity: e.quantity })),
        }),
      });
      if (res.ok) onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "820px" }}>
      <div style={{ ...CARD, padding: "30.28px" }}>
        <SectionTitle icon={<BuildingIcon />}>기업 프로필 관리</SectionTitle>

        <div style={{ marginTop: "24.4px" }}>
          <FieldLabel>한 줄 소개</FieldLabel>
          <input
            className="profile-input"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="업체의 강점을 나타내는 슬로건"
            style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }}
          />
        </div>

        <div style={{ marginTop: "24.4px" }}>
          <FieldLabel>기업 상세 소개</FieldLabel>
          <textarea
            className="profile-input"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder="전문 분야 및 기술력 설명"
            rows={4}
            style={{ ...INPUT_BOX, padding: "13.2px 15.64px", height: "117px", resize: "none" }}
          />
          <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)", textAlign: "right", margin: "4.88px 0 0" }}>
            {description.length}/500
          </p>
        </div>

        <div style={{ marginTop: "24.4px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
            <label style={LABEL}>주요 실적 리스트</label>
            <AddButton onClick={addPerf} />
          </div>
          {performances.map((p, i) => (
            <div key={i} style={{ ...CARD, background: "rgba(29,29,31,0.01)", borderRadius: "14.64px", padding: "15.64px", marginTop: "14.64px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{`실적 ${i + 1}`}</span>
                <button type="button" onClick={() => removePerf(i)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }} aria-label="삭제"><RemoveIcon /></button>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "9.76px" }}>
                <input className="profile-input" value={p.project} onChange={(e) => setPerf(i, { project: e.target.value })} placeholder="프로젝트명" style={{ ...INPUT_BOX, borderRadius: "9.76px", padding: "10.75px 15.64px" }} />
                <input className="profile-input" value={p.client} onChange={(e) => setPerf(i, { client: e.target.value })} placeholder="발주처" style={{ ...INPUT_BOX, borderRadius: "9.76px", padding: "10.75px 15.64px" }} />
                <input className="profile-input" value={p.year} onChange={(e) => setPerf(i, { year: e.target.value })} placeholder="수행 연도" style={{ ...INPUT_BOX, borderRadius: "9.76px", padding: "10.75px 15.64px" }} />
                <input className="profile-input" value={p.amount} onChange={(e) => setPerf(i, { amount: e.target.value })} placeholder="계약 금액" style={{ ...INPUT_BOX, borderRadius: "9.76px", padding: "10.75px 15.64px" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24.4px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
            <label style={LABEL}>보유 자재/장비 리스트</label>
            <AddButton onClick={addEquip} />
          </div>
          {equipments.map((e, i) => (
            <div key={i} className="flex items-center" style={{ gap: "9.76px", marginTop: i === 0 ? 0 : "9.76px" }}>
              <input className="profile-input" value={e.name} onChange={(ev) => setEquip(i, { name: ev.target.value })} placeholder="장비명" style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }} />
              <input className="profile-input" value={e.quantity} onChange={(ev) => setEquip(i, { quantity: ev.target.value })} placeholder="수량" style={{ ...INPUT_BOX, padding: "13.1875px 15.64px", width: "117px", flex: "0 0 117px" }} />
              <button type="button" onClick={() => removeEquip(i)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flex: "0 0 auto" }} aria-label="삭제"><RemoveIcon /></button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24.4px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
            <label style={LABEL}>포트폴리오 업로드</label>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>총 {portfolioFileName ? 1 : 0}개</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => portfolioRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && portfolioRef.current?.click()}
            className="flex flex-col items-center justify-center"
            style={{ padding: "26.4px", borderRadius: "14.64px", border: "2px dashed rgba(210,210,215,0.3)", cursor: "pointer" }}
          >
            <div className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "14.64px", background: "rgba(30,58,95,0.05)", marginBottom: "9.76px" }}>
              <UploadIcon />
            </div>
            <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.5)", margin: 0 }}>
              {portfolioUploading ? "업로드 중…" : portfolioFileName ? portfolioFileName : "클릭하여 파일 추가"}
            </p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)", margin: "2.44px 0 0" }}>PDF, 이미지 파일</p>
          </div>
          <input ref={portfolioRef} type="file" accept=".pdf,image/*" onChange={onPortfolioFile} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ ...CARD, padding: "30.28px", marginTop: "29.28px" }}>
        <SectionTitle icon={<UserIcon />}>담당자 정보</SectionTitle>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14.64px", marginTop: "19.52px" }}>
          <div>
            <FieldLabel>담당자 성함</FieldLabel>
            <input className="profile-input" value={manager.name} onChange={(e) => setManager({ ...manager, name: e.target.value })} placeholder="실무자 실명" style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }} />
          </div>
          <div>
            <FieldLabel>담당자 연락처</FieldLabel>
            <input className="profile-input" value={manager.phone} onChange={(e) => setManager({ ...manager, phone: e.target.value })} placeholder="휴대폰 번호" style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }} />
          </div>
          <div>
            <FieldLabel>담당자 이메일</FieldLabel>
            <input className="profile-input" value={manager.email} onChange={(e) => setManager({ ...manager, email: e.target.value })} placeholder="업무 이메일" style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }} />
          </div>
          <div>
            <FieldLabel>직책</FieldLabel>
            <input className="profile-input" value={manager.position} onChange={(e) => setManager({ ...manager, position: e.target.value })} placeholder="담당 부서 및 직책" style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        style={{ width: "100%", padding: "14.64px 0", borderRadius: "14.64px", background: NAVY, color: "#FFFFFF", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "24.5px", border: "none", cursor: saving ? "default" : "pointer", marginTop: "29.28px", opacity: saving ? 0.6 : 1 }}
      >
        저장
      </button>
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center" style={{ gap: "4.88px", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <PlusIcon />
      <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "21px", color: "rgba(29,29,31,0.4)" }}>추가</span>
    </button>
  );
}

function UnverifiedAccountTab({ onVerify }: { onVerify: () => void }) {
  const steps = [
    { icon: <StepOneIcon />, text: '"계좌 인증하기" 버튼을 클릭해 정산 은행, 계좌번호, 예금주, 통장 사본을 입력합니다.' },
    { icon: <StepTwoIcon />, text: "입력한 계좌로 1원이 송금됩니다. 입금자명에 표시된 6자리 인증 번호를 확인하세요." },
    { icon: <StepThreeIcon />, text: "인증 번호 입력 후 계좌 인증이 완료됩니다. 인증 완료 후 상품 등록 및 견적 대응이 가능합니다." },
  ];
  return (
    <div style={{ maxWidth: "820px" }}>
      <div className="flex items-center justify-between" style={{ padding: "25.4px", borderRadius: "19.52px", background: "#FEF2F2", border: "1px solid #FECACA" }}>
        <div className="flex items-center" style={{ gap: "14.64px" }}>
          <div className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "14.64px", background: "#FEE2E2" }}>
            <AlertTriangleIcon />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#B91C1C", margin: 0 }}>정산 계좌 인증 미완료</p>
            <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#EF4444", margin: "2.44px 0 0" }}>계좌 인증 후 상품 등록 및 견적 대응이 가능합니다.</p>
          </div>
        </div>
        <button onClick={onVerify} style={{ padding: "9.76px 19.52px", borderRadius: "14.64px", background: NAVY, color: "#FFFFFF", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "21px", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
          계좌 인증하기
        </button>
      </div>

      <div style={{ ...CARD, padding: "30.28px", marginTop: "29.28px" }}>
        <div style={{ marginBottom: "19.52px" }}>
          <SectionTitle icon={<InfoCircleIcon />}>계좌 인증 안내</SectionTitle>
        </div>
        {steps.map((s, i) => (
          <div key={i} className="flex" style={{ gap: "14.64px", marginTop: i === 0 ? 0 : "14.64px" }}>
            <div className="flex items-center justify-center" style={{ width: "29px", height: "29px", flex: "0 0 29px", borderRadius: "9999px", background: "rgba(30,58,95,0.1)", marginTop: "2.44px" }}>
              {s.icon}
            </div>
            <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "21.125px", color: "rgba(29,29,31,0.6)", margin: 0, alignSelf: "center" }}>{s.text}</p>
          </div>
        ))}
        <button onClick={onVerify} style={{ width: "100%", padding: "14.64px 0", borderRadius: "14.64px", background: NAVY, color: "#FFFFFF", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "24.5px", border: "none", cursor: "pointer", marginTop: "24.4px" }}>
          지금 계좌 인증하기
        </button>
      </div>
    </div>
  );
}

function VerifiedAccountTab({ account, onChange }: { account: PartnerProfileData["account"]; onChange: () => void }) {
  return (
    <div style={{ maxWidth: "820px" }}>
      <div className="flex items-center justify-between" style={{ padding: "25.4px", borderRadius: "19.52px", background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
        <div className="flex items-center" style={{ gap: "14.64px" }}>
          <div className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "14.64px", background: "#D1FAE5" }}>
            <GreenCheckIcon />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#047857", margin: 0 }}>정산 계좌 인증 완료</p>
            <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#059669", margin: "2.44px 0 0" }}>{account.summary}</p>
          </div>
        </div>
        <button onClick={onChange} style={{ padding: "10.76px 20.52px", borderRadius: "14.64px", background: "#D1FAE5", border: "1px solid #A7F3D0", color: "#047857", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "21px", cursor: "pointer", whiteSpace: "nowrap" }}>
          계좌 변경
        </button>
      </div>

      <div style={{ ...CARD, padding: "30.28px", marginTop: "29.28px" }}>
        <SectionTitle icon={<CardNavyIcon />}>등록된 정산 계좌</SectionTitle>
        <div className="flex" style={{ gap: "19.52px", marginTop: "19.52px" }}>
          <AccountField label="은행" value={account.bank} />
          <AccountField label="계좌번호" value={account.number} />
          <AccountField label="예금주" value={account.holder} />
        </div>
        <div className="flex items-center" style={{ gap: "7.32px", marginTop: "19.52px" }}>
          <ClockIcon />
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{account.verifiedAt}</span>
        </div>
        <div className="flex items-center" style={{ gap: "7.32px", padding: "15.64px", borderRadius: "14.64px", background: "#ECFDF5", border: "1px solid #A7F3D0", marginTop: "19.52px" }}>
          <SmallCheckIcon />
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#047857" }}>본인 명의 계좌 인증이 완료되었습니다. 정산 계좌 변경 시 재인증이 필요합니다.</span>
        </div>
      </div>
    </div>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ width: "240px" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.275px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: "0 0 4.88px" }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: INK, margin: 0 }}>{value}</p>
    </div>
  );
}

function ModalShell({ width, height, onClose, children }: { width: number; height?: number; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 50, padding: "19.52px" }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: `${width}px`, height: height ? `${height}px` : undefined, borderRadius: "19.52px", background: "#FFFFFF", overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: INK, margin: 0 }}>정산 계좌 인증</h2>
          <button onClick={onClose} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "none", border: "none", cursor: "pointer" }} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const BANK_OPTIONS = ["국민은행", "신한은행", "우리은행", "하나은행", "농협은행", "기업은행", "카카오뱅크", "케이뱅크", "토스뱅크", "부산은행", "대구은행", "경남은행", "광주은행", "전북은행", "제주은행", "새마을금고", "우체국"];

function AccountStep1Modal({ onClose, onNext }: { onClose: () => void; onNext: () => void }) {
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [bankbookFileName, setBankbookFileName] = useState<string | null>(null);
  const [bankbookFileUrl, setBankbookFileUrl] = useState<string | null>(null);
  const [bankbookUploading, setBankbookUploading] = useState(false);
  const copyRef = useRef<HTMLInputElement>(null);

  const canSubmit = bankName && bankAccountNo.trim() && bankAccountHolder.trim() && !saving;

  async function onBankbookFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBankbookUploading(true);
    try {
      const result = await uploadFile(file);
      setBankbookFileName(result.name);
      setBankbookFileUrl(result.url);
    } finally {
      setBankbookUploading(false);
      e.target.value = "";
    }
  }

  async function handleNext() {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName,
          bankAccountNo: bankAccountNo.trim(),
          bankAccountHolder: bankAccountHolder.trim(),
          ...(bankbookFileUrl ? { bankbookFileUrl } : {}),
        }),
      });
      onNext();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell width={547} onClose={onClose}>
      <div style={{ padding: "29.28px" }}>
        <p style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "21.125px", color: "rgba(29,29,31,0.6)", margin: 0 }}>
          정산 은행, 계좌번호, 예금주, 통장 사본을 입력합니다.
        </p>

        <div style={{ marginTop: "19.52px" }}>
          <FieldLabel>정산 은행 *</FieldLabel>
          <div style={{ position: "relative" }}>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="profile-input"
              style={{ ...INPUT_BOX, padding: "13.2px 15.64px", paddingRight: "40px", appearance: "none", cursor: "pointer" }}
            >
              <option value="">은행 선택</option>
              {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <span style={{ position: "absolute", right: "15.64px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><SelectChevronIcon /></span>
          </div>
        </div>

        <div style={{ marginTop: "19.52px" }}>
          <FieldLabel>정산 계좌번호 *</FieldLabel>
          <input
            className="profile-input"
            value={bankAccountNo}
            onChange={(e) => setBankAccountNo(e.target.value.replace(/\D/g, ""))}
            placeholder="숫자만 입력"
            inputMode="numeric"
            style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }}
          />
        </div>

        <div style={{ marginTop: "19.52px" }}>
          <FieldLabel>예금주 성함 *</FieldLabel>
          <input
            className="profile-input"
            value={bankAccountHolder}
            onChange={(e) => setBankAccountHolder(e.target.value)}
            placeholder="계좌 명의인 실명"
            style={{ ...INPUT_BOX, padding: "13.1875px 15.64px" }}
          />
        </div>

        <div style={{ marginTop: "19.52px" }}>
          <FieldLabel>통장 사본 첨부</FieldLabel>
          <div
            role="button"
            tabIndex={0}
            onClick={() => copyRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && copyRef.current?.click()}
            className="flex flex-col items-center justify-center"
            style={{ padding: "21.52px", borderRadius: "14.64px", border: "2px dashed rgba(210,210,215,0.3)", cursor: "pointer" }}
          >
            <div className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "rgba(30,58,95,0.05)", marginBottom: "7.32px" }}>
              <ModalUploadIcon />
            </div>
            <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{bankbookUploading ? "업로드 중…" : bankbookFileName ? bankbookFileName : "클릭하여 통장 사본 첨부"}</p>
            <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.25)", margin: "2.44px 0 0" }}>PDF, JPG, PNG 지원</p>
          </div>
          <input ref={copyRef} type="file" accept=".pdf,.jpg,.jpeg,.png,image/*" onChange={onBankbookFile} style={{ display: "none" }} />
        </div>

        <button
          onClick={handleNext}
          disabled={!canSubmit}
          style={{ width: "100%", padding: "14.64px 0", borderRadius: "14.64px", background: canSubmit ? NAVY : "rgba(30,58,95,0.4)", color: "#FFFFFF", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", border: "none", cursor: canSubmit ? "pointer" : "default", marginTop: "19.52px" }}
        >
          인증 번호 발송 (1원 송금)
        </button>
      </div>
    </ModalShell>
  );
}

function AccountStep2Modal({ onClose, onBack, onConfirm }: { onClose: () => void; onBack: () => void; onConfirm: (code: string) => Promise<void> | void }) {
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const enabled = code.length === 6 && !saving;

  async function handleConfirm() {
    if (!enabled) return;
    setSaving(true);
    try {
      await onConfirm(code);
    } finally {
      setSaving(false);
    }
  }
  return (
    <ModalShell width={547} onClose={onClose}>
      <div style={{ padding: "29.28px" }}>
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center" style={{ width: "59px", height: "59px", borderRadius: "9999px", background: "rgba(30,58,95,0.1)", marginBottom: "14.64px" }}>
            <ShieldCheckIcon />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "25.2px", color: INK, margin: "0 0 4.88px", textAlign: "center" }}>{REMITTANCE_ACCOUNT} 계좌로 1원을 송금했습니다</p>
          <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)", margin: 0, textAlign: "center" }}>입금자명에 표시된 숫자 6자리를 입력하세요.</p>
        </div>

        <div style={{ marginTop: "19.52px" }}>
          <FieldLabel>인증 번호 (6자리)</FieldLabel>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            style={{ width: "100%", padding: "15.625px 15.64px", borderRadius: "14.64px", background: "#FFFFFF", border: "1px solid rgba(210,210,215,0.3)", fontSize: "18px", fontWeight: 400, letterSpacing: "9px", lineHeight: "31.5px", color: INK, textAlign: "center", outline: "none" }}
            className="profile-code"
          />
        </div>

        <div className="flex" style={{ gap: "14.64px", marginTop: "19.52px" }}>
          <button onClick={onBack} style={{ flex: "1 1 0", padding: "13.2px 1px", borderRadius: "14.64px", background: "none", border: "1px solid rgba(210,210,215,0.3)", color: "rgba(29,29,31,0.6)", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", cursor: "pointer" }}>
            이전
          </button>
          <button
            onClick={handleConfirm}
            disabled={!enabled}
            style={{ flex: "1 1 0", padding: "12.2px 0", borderRadius: "14.64px", background: enabled ? NAVY : "rgba(30,58,95,0.4)", border: "none", color: enabled ? "#FFFFFF" : "rgba(255,255,255,0.16)", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", cursor: enabled ? "pointer" : "not-allowed" }}
          >
            확인
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
