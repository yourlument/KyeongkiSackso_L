"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminApprovalData,
  MemberRow as Member,
  MemberStatus,
  MemberDetailData,
  CertRow as Cert,
  CertStatus,
} from "@/lib/admin-approval";

const MEMBER_BADGE: Record<MemberStatus, { bg: string; border: string; color: string }> = {
  대기: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
  승인: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  반려: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};

const CERT_BADGE: Record<CertStatus, { bg: string; border: string; color: string }> = {
  검토중: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
  승인완료: { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  반려: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};

const TABS = ["회원가입 승인", "인증서 승인"] as const;
type Tab = (typeof TABS)[number];

const MEMBER_FILTERS = ["전체", "대기", "승인", "반려"] as const;
type MemberFilter = (typeof MEMBER_FILTERS)[number];

const CERT_FILTERS = ["전체", "검토중", "승인완료", "반려"] as const;
type CertFilter = (typeof CERT_FILTERS)[number];

function ShieldIcon() {
  return (
    <svg width={31} height={30} viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M15.4009 1.25067L25.5282 3.52567C25.8075 3.59233 26.0375 3.74233 26.2182 3.97567C26.3989 4.209 26.4892 4.46733 26.4892 4.75067V17.2257C26.4892 18.4923 26.1976 19.6757 25.6145 20.7757C25.0313 21.8757 24.2223 22.7757 23.1874 23.4757L15.4009 28.7507L7.61445 23.4757C6.57954 22.7757 5.77051 21.8757 5.18734 20.7757C4.60418 19.6757 4.3126 18.4923 4.3126 17.2257V4.75067C4.3126 4.46733 4.40295 4.209 4.58365 3.97567C4.76435 3.74233 4.99433 3.59233 5.27359 3.52567L15.4009 1.25067ZM15.4009 3.80067L6.77667 5.75067V17.2257C6.77667 18.0757 6.96969 18.8673 7.35572 19.6007C7.74176 20.334 8.27975 20.934 8.96969 21.4007L15.4009 25.7507L21.8321 21.4007C22.5221 20.934 23.0601 20.334 23.4461 19.6007C23.8321 18.8673 24.0251 18.0757 24.0251 17.2257V5.75067L15.4009 3.80067ZM20.8958 10.2757L22.6206 12.0507L14.7849 20.0007L9.56107 14.7007L11.3106 12.9257L14.7849 16.4757L20.8958 10.2757Z"
        fill="#1D1D1F"
        fillOpacity={0.2}
      />
    </svg>
  );
}

export function ApprovalView({ data }: { data: AdminApprovalData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("회원가입 승인");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("전체");
  const [certFilter, setCertFilter] = useState<CertFilter>("전체");
  const [selected, setSelected] = useState<string | null>(null);

  const memberRows = useMemo(
    () => data.members.filter((m) => (memberFilter === "전체" ? true : m.status === memberFilter)),
    [data.members, memberFilter],
  );
  const certRows = useMemo(
    () => data.certs.filter((c) => (certFilter === "전체" ? true : c.status === certFilter)),
    [data.certs, certFilter],
  );

  const refresh = () => startTransition(() => router.refresh());
  async function mutateMember(id: string, action: "approve" | "reject", reason?: string) {
    const res = await fetch("/api/admin/approval/member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reason }),
    });
    if (res.ok) refresh();
  }
  async function mutateCert(id: string, action: "approve" | "reject", reason?: string) {
    const res = await fetch("/api/admin/approval/cert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, reason }),
    });
    if (res.ok) refresh();
  }

  const selectedMember = data.members.find((m) => m.id === selected) ?? null;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "34.16px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "-0.56px",
            lineHeight: "25px",
            color: "#1D1D1F",
          }}
        >
          입점 검수 센터
        </h1>
        <p
          style={{
            margin: "2.44px 0 0",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "-0.195px",
            lineHeight: "23.4px",
            color: "rgba(29,29,31,0.4)",
          }}
        >
          업체 제출 서류 대조 및 수동 승인/반려 관리
        </p>
      </div>

      <div
        className="flex items-center"
        style={{ borderBottom: "1px solid rgba(210,210,215,0.2)", marginBottom: "29.28px" }}
      >
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                position: "relative",
                padding: "14.64px 24.4px 16.64px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "24.5px",
                color: active ? "#1E3A5F" : "rgba(29,29,31,0.4)",
              }}
            >
              {t}
              {active && (
                <span
                  style={{ position: "absolute", left: 0, right: 0, bottom: "-1px", height: "1px", background: "#1E3A5F" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {tab === "회원가입 승인" ? (
        <MemberTab
          rows={memberRows}
          filter={memberFilter}
          onFilter={setMemberFilter}
          selected={selected}
          onSelect={setSelected}
          selectedMember={selectedMember}
          onApprove={(id) => mutateMember(id, "approve")}
          onReject={(id, reason) => mutateMember(id, "reject", reason)}
        />
      ) : (
        <CertTab
          rows={certRows}
          filter={certFilter}
          onFilter={setCertFilter}
          onApprove={(id) => mutateCert(id, "approve")}
          onReject={(id, reason) => mutateCert(id, "reject", reason)}
        />
      )}
    </div>
  );
}

function MemberDetail({
  name,
  status,
  detail,
  onShowFull,
  onViewFile,
  onApprove,
  onReject,
}: {
  name: string;
  status: MemberStatus;
  detail: MemberDetailData;
  onShowFull: () => void;
  onViewFile: (docName: string) => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const empty = reason.trim().length === 0;
  const badge = MEMBER_BADGE[status];
  const closeReject = () => {
    setRejectOpen(false);
    setReason("");
  };
  return (
    <div className="flex flex-col" style={{ background: "#FFFFFF", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", padding: "30.28px", gap: "24.4px" }}>
      <div className="flex items-start justify-between">
        <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: "#1D1D1F" }}>{name}</p>
        <span
          className="inline-flex shrink-0 items-center justify-center"
          style={{ height: "33px", padding: "0 15.64px", borderRadius: "9999px", background: badge.bg, border: `1px solid ${badge.border}`, fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: badge.color, whiteSpace: "nowrap" }}
        >
          {status === "대기" ? "승인 대기" : status}
        </span>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: "20px", rowGap: "19.52px", background: "rgba(29,29,31,0.02)", borderRadius: "14.64px", padding: "19.52px" }}
      >
        <DetailField label="사업자번호" value={detail.bizNo} />
        <DetailField label="대표자" value={detail.ceo} />
        <DetailField label="카테고리" value={detail.category} />
        <DetailField label="지역" value={detail.region} />
      </div>
      <div>
        <p style={{ margin: "0 0 10.4px", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>제출 서류</p>
        <div className="flex" style={{ gap: "9.76px" }}>
          {detail.docs.map((doc) => (
            <DocCard key={doc} name={doc} onView={() => onViewFile(doc)} />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onShowFull}
        className="flex items-center justify-center"
        style={{ height: "54px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "transparent", cursor: "pointer", gap: "8.78px" }}
      >
        <DetailListIcon />
        <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", lineHeight: "22.8px", color: "rgba(29,29,31,0.6)" }}>가입 시 입력한 전체 정보 보기</span>
      </button>
      {rejectOpen ? (
        <div className="flex flex-col" style={{ paddingTop: "15.64px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
          <p style={{ margin: "0 0 7.32px", fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>반려 사유</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="반려 사유를 입력하세요"
            className="block w-full resize-none outline-none placeholder:font-medium placeholder:text-[#9CA3AF]"
            style={{ height: "94.625px", borderRadius: "14.64px", background: "#FFFFFF", border: "1px solid rgba(210,210,215,0.3)", padding: "13.2px 15.64px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#1D1D1F" }}
          />
          <div className="flex" style={{ gap: "14.64px", paddingTop: "14.64px" }}>
            <button
              type="button"
              onClick={closeReject}
              className="inline-flex items-center justify-center"
              style={{ flex: 1, height: "49.12px", borderRadius: "14.64px", background: "transparent", border: "1px solid rgba(210,210,215,0.2)", cursor: "pointer", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.5)", whiteSpace: "nowrap" }}
            >
              취소
            </button>
            <button
              type="button"
              disabled={empty}
              onClick={() => {
                if (!empty) {
                  onReject(reason);
                  closeReject();
                }
              }}
              className="inline-flex items-center justify-center"
              style={{ flex: 1, height: "49.12px", borderRadius: "14.64px", background: "#EF4444", border: "none", cursor: empty ? "default" : "pointer", opacity: empty ? 0.4 : 1, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#FFFFFF", whiteSpace: "nowrap" }}
            >
              반려 처리
            </button>
          </div>
        </div>
      ) : (
        <div className="flex" style={{ gap: "15px", paddingTop: "10.76px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center justify-center"
            style={{ flex: 1, height: "56px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.293px", lineHeight: "24.5px", color: "#FFFFFF" }}
          >
            회원가입 승인
          </button>
          <button
            type="button"
            onClick={() => setRejectOpen(true)}
            className="inline-flex items-center justify-center"
            style={{ flex: 1, height: "56px", borderRadius: "14.64px", background: "#FEF2F2", border: "1px solid #FECACA", cursor: "pointer", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.293px", lineHeight: "24.5px", color: "#DC2626" }}
          >
            반려
          </button>
        </div>
      )}
    </div>
  );
}

function DocCard({ name, onView }: { name: string; onView: () => void }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ width: "calc(50% - 4.88px)", borderRadius: "14.64px", background: "rgba(29,29,31,0.02)", border: "1px solid rgba(210,210,215,0.15)", padding: "13.2px 15.64px" }}
    >
      <div className="flex items-center" style={{ gap: "10.4px" }}>
        <span className="flex shrink-0 items-center justify-center" style={{ width: "29px", height: "29px" }}>
          <FileIcon />
        </span>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.7)" }}>{name}</span>
      </div>
      <button type="button" onClick={onView} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.293px", lineHeight: "19.2px", color: "#1E3A5F", whiteSpace: "nowrap" }}>보기</button>
    </div>
  );
}

function MemberFullModal({
  name,
  detail,
  onClose,
  onViewFile,
}: {
  name: string;
  detail: MemberDetailData;
  onClose: () => void;
  onViewFile: (docName: string) => void;
}) {
  const full = detail.full;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", padding: "24px" }} onClick={onClose}>
      <div className="flex w-full flex-col overflow-y-auto" style={{ maxWidth: "625px", maxHeight: "90vh", background: "#FFFFFF", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)" }} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between" style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
        <div>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: "#1D1D1F" }}>가입 정보 상세</p>
          <p style={{ margin: "2.44px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{name}</p>
        </div>
        <button type="button" onClick={onClose} className="flex shrink-0 items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "transparent", border: "none", cursor: "pointer" }} aria-label="닫기">
          <CloseIcon />
        </button>
      </div>
      {full ? (
        <div className="flex flex-col" style={{ padding: "29.28px", gap: "24.4px" }}>
          <DetailSection title="계정 정보">
            <DetailGrid>
              <DetailField label="아이디 (이메일)" value={full.email} />
              <DetailField label="가입일" value={full.joinDate} />
            </DetailGrid>
          </DetailSection>
          <DetailSection title="기업 기본 정보">
            <DetailGrid>
              <DetailField label="업체명" value={full.company} />
              <DetailField label="대표자 성함" value={detail.ceo} />
              <DetailField label="사업자 등록번호" value={detail.bizNo} />
              <DetailField label="법인 등록번호" value={full.corpNo} />
              <DetailField label="업태" value={full.bizType} />
              <DetailField label="종목" value={full.bizItem} />
              <DetailField label="사업장 소재지" value={full.address} />
              <DetailField label="대표 전화번호" value={full.phone} />
            </DetailGrid>
          </DetailSection>
          <DetailSection title="담당자 및 정산 정보">
            <DetailGrid>
              <DetailField label="담당자 성함" value={full.managerName} />
              <DetailField label="담당자 연락처" value={full.managerPhone} />
              <DetailField label="정산 은행" value={full.bank} />
              <DetailField label="정산 계좌번호" value={full.account} />
              <DetailField label="예금주 성함" value={full.accountHolder} />
              <DetailField label="계좌 인증 상태" value={full.accountVerified ? "인증" : "미인증"} danger={!full.accountVerified} />
            </DetailGrid>
          </DetailSection>
          <DetailSection title="보유 인증 및 제출 서류">
            <div className="flex flex-col" style={{ gap: "9.76px" }}>
              {detail.docs.map((doc) => (
                <DocRow key={doc} name={doc} onView={() => onViewFile(doc)} />
              ))}
            </div>
          </DetailSection>
        </div>
      ) : (
        <div style={{ padding: "29.28px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "rgba(29,29,31,0.4)", textAlign: "center" }}>
            상세 데이터가 없습니다
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ margin: "0 0 14.64px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.55px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{title}</p>
      {children}
    </div>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: "14.64px", rowGap: "14.64px", background: "rgba(29,29,31,0.02)", borderRadius: "14.64px", padding: "19.52px" }}>
      {children}
    </div>
  );
}

function DetailField({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>{label}</p>
      <p
        style={{
          margin: "5.2px 0 0",
          fontSize: danger ? "11px" : "13px",
          fontWeight: danger ? 500 : 400,
          letterSpacing: danger ? "-0.165px" : "-0.195px",
          lineHeight: danger ? "19.8px" : "23.4px",
          color: danger ? "#DC2626" : "#1D1D1F",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function DocRow({ name, onView }: { name: string; onView: () => void }) {
  return (
    <div className="flex items-center justify-between" style={{ borderRadius: "14.64px", background: "rgba(29,29,31,0.02)", border: "1px solid rgba(210,210,215,0.15)", padding: "15.64px 20.52px" }}>
      <div className="flex items-center" style={{ gap: "14.64px" }}>
        <span className="flex shrink-0 items-center justify-center" style={{ width: "18px" }}>
          <FileIcon />
        </span>
        <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.7)" }}>{name}</span>
      </div>
      <button type="button" onClick={onView} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px", fontWeight: 500, letterSpacing: "-0.293px", lineHeight: "21px", color: "#1E3A5F" }}>보기</button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M5.91598 4.66013L10.5111 -0.000403281L11.832 1.33927L7.23685 5.9998L11.832 10.6603L10.5111 12L5.91598 7.33947L1.32086 12L0 10.6603L4.59512 5.9998L0 1.33927L1.32086 -0.000403281L5.91598 4.66013Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width={13} height={15} viewBox="0 0 13 15" fill="none" aria-hidden>
      <path d="M4.33365 0.000670292H12.2787C12.4809 0.000670292 12.6519 0.0714573 12.7915 0.213029C12.9311 0.354602 13.001 0.527907 13.001 0.732942V13.9138C13.001 14.1189 12.9311 14.2922 12.7915 14.4337C12.6519 14.5753 12.4809 14.6461 12.2787 14.6461H0.722276C0.520039 14.6461 0.3491 14.5753 0.20946 14.4337C0.06982 14.2922 0 14.1189 0 13.9138V4.3943L4.33365 0.000670292ZM2.03682 4.3943H4.33365V2.08032L2.03682 4.3943ZM5.77821 1.46521V5.12657C5.77821 5.33161 5.70839 5.50491 5.56875 5.64648C5.42911 5.78806 5.25817 5.85884 5.05593 5.85884H1.44455V13.1816H11.5564V1.46521H5.77821Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}

function DetailListIcon() {
  return (
    <svg width={10} height={11} viewBox="0 0 10 11" fill="none" aria-hidden>
      <path d="M6.51076 1.10059H1.08513V9.90007H8.68102V3.30046H6.51076V1.10059ZM0 0.550628C0 0.396637 0.0524478 0.266479 0.157343 0.160152C0.262239 0.0538242 0.390646 0.000661341 0.542563 0.000661341H7.05333L9.76614 2.7505V10.45C9.76614 10.5967 9.7137 10.725 9.6088 10.835C9.5039 10.945 9.3755 11 9.22358 11H0.542563C0.390646 11 0.262239 10.9468 0.157343 10.8405C0.0524478 10.7342 0 10.604 0 10.45V0.550628ZM4.88307 5.22535C4.63711 5.22535 4.41104 5.16302 4.20487 5.03836C3.99869 4.9137 3.83412 4.74688 3.71113 4.53789C3.58815 4.3289 3.52666 4.09975 3.52666 3.85043C3.52666 3.60111 3.58815 3.37196 3.71113 3.16297C3.83412 2.95398 3.99869 2.78716 4.20487 2.6625C4.41104 2.53784 4.63711 2.47551 4.88307 2.47551C5.12903 2.47551 5.3551 2.53784 5.56128 2.6625C5.76745 2.78716 5.93203 2.95398 6.05501 3.16297C6.17799 3.37196 6.23948 3.60111 6.23948 3.85043C6.23948 4.09975 6.17799 4.3289 6.05501 4.53789C5.93203 4.74688 5.76745 4.9137 5.56128 5.03836C5.3551 5.16302 5.12903 5.22535 4.88307 5.22535ZM2.45239 8.25017C2.50303 7.83952 2.64048 7.46738 2.86474 7.13373C3.08899 6.80009 3.37836 6.5361 3.73284 6.34178C4.08731 6.14746 4.47072 6.0503 4.88307 6.0503C5.29542 6.0503 5.67883 6.14746 6.03331 6.34178C6.38778 6.5361 6.67715 6.80009 6.90141 7.13373C7.12567 7.46738 7.26312 7.83952 7.31376 8.25017H2.45239Z" fill="#1D1D1F" fillOpacity="0.6" />
    </svg>
  );
}

function MemberTab({
  rows,
  filter,
  onFilter,
  selected,
  onSelect,
  selectedMember,
  onApprove,
  onReject,
}: {
  rows: Member[];
  filter: MemberFilter;
  onFilter: (f: MemberFilter) => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
  selectedMember: Member | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [showFull, setShowFull] = useState(false);
  const [fileView, setFileView] = useState<string | null>(null);
  return (
    <>
      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "24.4px" }}>
        {MEMBER_FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                height: "39.4px",
                padding: "0 20.52px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                cursor: "pointer",
                background: active ? "#1E3A5F" : "#FFFFFF",
                border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
                color: active ? "#FFFFFF" : "rgba(29,29,31,0.5)",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "347px 1fr", gap: "24.4px", alignItems: "start" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "19.52px",
            border: "1px solid rgba(210,210,215,0.2)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "19.52px 24.4px 20.52px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "-0.392px",
                lineHeight: "17.5px",
                color: "#1D1D1F",
              }}
            >
              입점 신청 목록
            </p>
          </div>

          {rows.map((m, i) => {
            const isSel = selected === m.id;
            const badge = MEMBER_BADGE[m.status];
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onSelect(m.id);
                  setShowFull(false);
                }}
                className="w-full text-left"
                style={{
                  display: "block",
                  width: "100%",
                  padding: i === 0 ? "19.52px 24.4px" : "20.52px 24.4px 19.52px",
                  borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)",
                  borderLeft: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  background: isSel ? "rgba(30,58,95,0.04)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: "4.88px" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "-0.195px",
                      lineHeight: "23.4px",
                      color: "#1D1D1F",
                    }}
                  >
                    {m.name}
                  </span>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{
                      borderRadius: "9999px",
                      height: "27px",
                      padding: "3.44px 13.2px",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "-0.165px",
                      lineHeight: "19.8px",
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color,
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    color: "rgba(29,29,31,0.4)",
                  }}
                >
                  {m.biz} · {m.date}
                </p>
              </button>
            );
          })}
        </div>

        {selectedMember ? (
          <MemberDetail
            key={selectedMember.id}
            name={selectedMember.name}
            status={selectedMember.status}
            detail={selectedMember.detail}
            onShowFull={() => setShowFull(true)}
            onViewFile={setFileView}
            onApprove={() => onApprove(selectedMember.id)}
            onReject={(reason) => onReject(selectedMember.id, reason)}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-start"
            style={{
              background: "#FFFFFF",
              borderRadius: "19.52px",
              border: "1px solid rgba(210,210,215,0.2)",
              minHeight: "424px",
              padding: "30.28px",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "19.52px",
                background: "rgba(29,29,31,0.03)",
                marginTop: "97.6px",
                marginBottom: "19.52px",
              }}
            >
              <ShieldIcon />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 400,
                letterSpacing: "-0.21px",
                lineHeight: "25.2px",
                color: "rgba(29,29,31,0.4)",
                textAlign: "center",
              }}
            >
              {selected ? "상세 데이터가 없습니다" : "왼쪽 목록에서 신청을 선택하세요"}
            </p>
          </div>
        )}
      </div>

      {showFull && selectedMember && (
        <MemberFullModal name={selectedMember.name} detail={selectedMember.detail} onClose={() => setShowFull(false)} onViewFile={setFileView} />
      )}

      {fileView && <FileViewModal fileName={fileView} onClose={() => setFileView(null)} />}
    </>
  );
}

function CertTab({
  rows,
  filter,
  onFilter,
  onApprove,
  onReject,
}: {
  rows: Cert[];
  filter: CertFilter;
  onFilter: (f: CertFilter) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [fileView, setFileView] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<Cert | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Cert | null>(null);
  return (
    <>
      <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "24.4px" }}>
        {CERT_FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                height: "39.4px",
                padding: "0 20.52px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                cursor: "pointer",
                background: active ? "#1E3A5F" : "#FFFFFF",
                border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
                color: active ? "#FFFFFF" : "rgba(29,29,31,0.5)",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "19.52px",
          border: "1px solid rgba(210,210,215,0.2)",
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center"
          style={{
            background: "rgba(29,29,31,0.02)",
            borderBottom: "1px solid rgba(210,210,215,0.1)",
          }}
        >
          {[
            { label: "업체명", w: "197px" },
            { label: "인증 종류", w: "225px" },
            { label: "제출일", w: "151px" },
            { label: "상태", w: "162px" },
          ].map((h) => (
            <div key={h.label} style={{ width: h.w, padding: "17.08px 24.4px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "-0.18px",
                  lineHeight: "21.6px",
                  color: "rgba(29,29,31,0.4)",
                }}
              >
                {h.label}
              </span>
            </div>
          ))}
          <div style={{ flex: 1, padding: "17.08px 24.4px" }} />
        </div>

        {rows.map((c, i) => {
          const badge = CERT_BADGE[c.status];
          const isPending = c.status === "검토중";
          return (
            <div
              key={c.name}
              className="flex items-center"
              style={{ borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)" }}
            >
              <div style={{ width: "197px", padding: "17.08px 24.4px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "-0.195px",
                    lineHeight: "23.4px",
                    color: "#1D1D1F",
                  }}
                >
                  {c.name}
                </span>
              </div>
              <div style={{ width: "225px", padding: "17.08px 24.4px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    letterSpacing: "-0.195px",
                    lineHeight: "23.4px",
                    color: "rgba(29,29,31,0.7)",
                  }}
                >
                  {c.kind}
                </span>
              </div>
              <div style={{ width: "151px", padding: "17.08px 24.4px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "-0.18px",
                    lineHeight: "21.6px",
                    color: "rgba(29,29,31,0.4)",
                  }}
                >
                  {c.date}
                </span>
              </div>
              <div style={{ width: "162px", padding: "17.08px 24.4px" }}>
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    borderRadius: "9999px",
                    height: "25px",
                    padding: "0 13.2px",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "-0.165px",
                    lineHeight: "19.8px",
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    color: badge.color,
                  }}
                >
                  {c.status}
                </span>
              </div>
              <div className="flex items-center" style={{ flex: 1, padding: "17.08px 24.4px" }}>
                <div className="flex items-center" style={{ gap: "9.76px" }}>
                  <button
                    type="button"
                    onClick={() => setFileView(`${c.kind} 인증서`)}
                    className="inline-flex items-center justify-center"
                    style={{
                      height: "38px",
                      borderRadius: "9.76px",
                      padding: "8.32px 15.64px",
                      background: "#FFFFFF",
                      border: "1px solid rgba(210,210,215,0.2)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "-0.2401px",
                      lineHeight: "21.6px",
                      color: "rgba(29,29,31,0.5)",
                    }}
                  >
                    파일 보기
                  </button>
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setApproveTarget(c)}
                        className="inline-flex items-center justify-center"
                        style={{
                          height: "38px",
                          borderRadius: "9.76px",
                          padding: "7.32px 14.64px",
                          background: "#1E3A5F",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 400,
                          letterSpacing: "-0.2401px",
                          lineHeight: "21.6px",
                          color: "#FFFFFF",
                        }}
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(c)}
                        className="inline-flex items-center justify-center"
                        style={{
                          height: "38px",
                          borderRadius: "9.76px",
                          padding: "8.32px 15.64px",
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 400,
                          letterSpacing: "-0.2401px",
                          lineHeight: "21.6px",
                          color: "#DC2626",
                        }}
                      >
                        반려
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center"
                      style={{
                        height: "38px",
                        borderRadius: "9.76px",
                        padding: "8.32px 15.64px",
                        background: "#FFFFFF",
                        border: "1px solid rgba(210,210,215,0.2)",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 400,
                        letterSpacing: "-0.2401px",
                        lineHeight: "21.6px",
                        color: "rgba(29,29,31,0.5)",
                      }}
                    >
                      상세
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {fileView && <FileViewModal fileName={fileView} onClose={() => setFileView(null)} />}

      {approveTarget && (
        <CertApproveModal
          name={approveTarget.name}
          kind={approveTarget.kind}
          onCancel={() => setApproveTarget(null)}
          onConfirm={() => {
            onApprove(approveTarget.id);
            setApproveTarget(null);
          }}
        />
      )}

      {rejectTarget && (
        <CertRejectModal
          name={rejectTarget.name}
          kind={rejectTarget.kind}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => {
            onReject(rejectTarget.id, reason);
            setRejectTarget(null);
          }}
        />
      )}
    </>
  );
}

function FileViewModal({ fileName, onClose }: { fileName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", padding: "24px" }} onClick={onClose}>
      <div className="flex w-full flex-col" style={{ maxWidth: "625px", background: "#FFFFFF", borderRadius: "19.52px" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: "#1D1D1F" }}>인증서 파일 열람</p>
            <p style={{ margin: "2.44px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>파일을 미리보거나 새 탭에서 열 수 있습니다</p>
          </div>
          <button type="button" onClick={onClose} className="flex shrink-0 items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "transparent", border: "none", cursor: "pointer" }} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
        <div style={{ padding: "29.28px" }}>
          <div className="flex flex-col items-center" style={{ borderRadius: "19.52px", background: "rgba(29,29,31,0.02)", border: "1px solid rgba(210,210,215,0.15)", padding: "40.04px" }}>
            <div className="flex shrink-0 items-center justify-center" style={{ width: "78.08px", height: "78.08px", borderRadius: "19.52px", background: "#FEF2F2", marginBottom: "19.52px" }}>
              <DocPreviewIcon />
            </div>
            <p style={{ margin: "0 0 4.88px", fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", lineHeight: "27px", color: "#1D1D1F", textAlign: "center" }}>{fileName}</p>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", textAlign: "center" }}>PDF 파일 · 2.3MB</p>
            <div className="flex items-center justify-center" style={{ gap: "14.64px", marginTop: "29.28px" }}>
              <button
                type="button"
                className="inline-flex items-center justify-center"
                style={{ height: "49.12px", padding: "0 24.4px", gap: "9.76px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#FFFFFF" }}
              >
                <NewTabIcon />
                새 탭에서 열기
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center"
                style={{ height: "49.12px", padding: "0 25.4px", gap: "9.76px", borderRadius: "14.64px", background: "transparent", border: "1px solid rgba(210,210,215,0.2)", cursor: "pointer", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.6)" }}
              >
                <DownloadIcon />
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertApproveModal({
  name,
  kind,
  onCancel,
  onConfirm,
}: {
  name: string;
  kind: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", padding: "24px" }} onClick={onCancel}>
      <div className="flex w-full flex-col" style={{ maxWidth: "468px", background: "#FFFFFF", borderRadius: "19.52px", padding: "29.28px" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center" style={{ paddingBottom: "19.52px" }}>
          <div className="flex shrink-0 items-center justify-center" style={{ width: "68.31px", height: "68.31px", borderRadius: "19.52px", background: "#ECFDF5" }}>
            <CheckCircleIcon />
          </div>
        </div>
        <p style={{ margin: 0, paddingBottom: "9.76px", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.476px", lineHeight: "21.25px", color: "#1D1D1F", textAlign: "center" }}>인증서 승인</p>
        <div className="flex flex-wrap justify-center" style={{ paddingBottom: "29.28px" }}>
          <span style={{ whiteSpace: "pre", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F" }}>{name}</span>
          <span style={{ whiteSpace: "pre", fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "rgba(29,29,31,0.6)" }}>의</span>
          <span style={{ whiteSpace: "pre", fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1E3A5F" }}>{kind}</span>
          <span style={{ whiteSpace: "pre", fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "rgba(29,29,31,0.6)" }}> 인증서를 승인하시겠습니까?</span>
        </div>
        <div className="flex" style={{ gap: "14.64px" }}>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center"
            style={{ flex: 1, height: "49.12px", borderRadius: "14.64px", background: "transparent", border: "1px solid rgba(210,210,215,0.2)", cursor: "pointer", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.5)" }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center"
            style={{ flex: 1, height: "49.12px", borderRadius: "14.64px", background: "#10B981", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#FFFFFF" }}
          >
            승인 처리
          </button>
        </div>
      </div>
    </div>
  );
}

function CertRejectModal({
  name,
  kind,
  onClose,
  onConfirm,
}: {
  name: string;
  kind: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const empty = reason.trim().length === 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", padding: "24px" }} onClick={onClose}>
      <div className="flex w-full flex-col" style={{ maxWidth: "547px", background: "#FFFFFF", borderRadius: "19.52px" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: "#1D1D1F" }}>인증서 반려</p>
            <p style={{ margin: "2.44px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{name} · {kind}</p>
          </div>
          <button type="button" onClick={onClose} className="flex shrink-0 items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "transparent", border: "none", cursor: "pointer" }} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
        <div style={{ padding: "29.28px" }}>
          <div style={{ borderRadius: "14.64px", background: "#FEF2F2", border: "1px solid #FEE2E2", padding: "20.52px" }}>
            <div className="flex items-center" style={{ gap: "9.76px", paddingBottom: "9.76px" }}>
              <WarnIcon />
              <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#DC2626" }}>반려 처리 주의</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(239,68,68,0.8)" }}>반려 후 업체에게 사유가 안내됩니다. 명확한 사유를 입력해주세요.</p>
          </div>
          <p style={{ margin: "19.52px 0 9.76px", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.5)" }}>반려 사유 *</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: 인증서 유효기간 만료 / 필수 서류 누락 / 내용 불일치..."
            className="block w-full resize-none outline-none placeholder:font-medium placeholder:text-[#9CA3AF]"
            style={{ height: "122.25px", borderRadius: "14.64px", background: "#FFFFFF", border: "1px solid rgba(210,210,215,0.3)", padding: "15.64px 20.52px", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#1D1D1F" }}
          />
          <div className="flex" style={{ gap: "14.64px", paddingTop: "24.4px" }}>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center"
              style={{ flex: 1, height: "49.12px", borderRadius: "14.64px", background: "transparent", border: "1px solid rgba(210,210,215,0.2)", cursor: "pointer", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.5)" }}
            >
              취소
            </button>
            <button
              type="button"
              disabled={empty}
              onClick={() => {
                if (!empty) onConfirm(reason);
              }}
              className="inline-flex items-center justify-center"
              style={{ flex: 1, height: "49.12px", borderRadius: "14.64px", background: "#EF4444", border: "none", cursor: empty ? "default" : "pointer", opacity: empty ? 0.4 : 1, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#FFFFFF" }}
            >
              반려 처리
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocPreviewIcon() {
  return (
    <svg width={28} height={31} viewBox="0 0 28 31" fill="none" aria-hidden>
      <path d="M13.7525 21.6998H7.6403V9.29954H13.7525C14.8527 9.29954 15.8714 9.57854 16.8087 10.1366C17.7459 10.6946 18.4895 11.4489 19.0396 12.3996C19.5897 13.3503 19.8648 14.3836 19.8648 15.4997C19.8648 16.6157 19.5897 17.649 19.0396 18.5997C18.4895 19.5504 17.7459 20.3048 16.8087 20.8628C15.8714 21.4208 14.8527 21.6998 13.7525 21.6998ZM10.6964 12.3996V18.5997H13.7525C14.3026 18.5997 14.812 18.4602 15.2806 18.1812C15.7492 17.9022 16.121 17.525 16.3961 17.0497C16.6711 16.5744 16.8087 16.0577 16.8087 15.4997C16.8087 14.9417 16.6711 14.425 16.3961 13.9496C16.121 13.4743 15.7492 13.0971 15.2806 12.8181C14.812 12.5391 14.3026 12.3996 13.7525 12.3996H10.6964ZM18.3367 3.09941H3.05612V27.8999H24.449V9.29954H18.3367V3.09941ZM0 1.54937C0 1.11536 0.147712 0.748522 0.443137 0.448849C0.738562 0.149176 1.1002 -0.000661195 1.52806 -0.000661195H19.8648L27.5051 7.7495V29.45C27.5051 29.8633 27.3574 30.225 27.0619 30.535C26.7665 30.845 26.4049 31 25.977 31H1.52806C1.1002 31 0.738562 30.8502 0.443137 30.5505C0.147712 30.2508 0 29.884 0 29.45V1.54937Z" fill="#F87171" />
    </svg>
  );
}

function NewTabIcon() {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M3.83654 1.66667V2.77778H1.09615V8.88889H7.125V6.11111H8.22115V9.44444C8.22115 9.6 8.16817 9.73148 8.06221 9.83889C7.95625 9.9463 7.82654 10 7.67308 10H0.548077C0.394615 10 0.264904 9.9463 0.158942 9.83889C0.0529808 9.73148 0 9.6 0 9.44444V2.22222C0 2.06667 0.0529808 1.93519 0.158942 1.82778C0.264904 1.72037 0.394615 1.66667 0.548077 1.66667H3.83654ZM9.86538 0V4.44444H8.76923V1.9L4.49423 6.22222L3.72692 5.44444L7.99096 1.11111H5.48077V0H9.86538Z" fill="white" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width={11} height={10} viewBox="0 0 11 10" fill="none" aria-hidden>
      <path d="M6.02885 3.88889H8.76923L5.48077 7.22222L2.19231 3.88889H4.93269V0H6.02885V3.88889ZM1.09615 8.88889H9.86539V5H10.9615V9.44444C10.9615 9.6 10.9086 9.73148 10.8026 9.83889C10.6966 9.9463 10.5669 10 10.4135 10H0.548077C0.394615 10 0.264904 9.9463 0.158942 9.83889C0.0529808 9.73148 0 9.6 0 9.44444V5H1.09615V8.88889Z" fill="#1D1D1F" fillOpacity={0.6} />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width={25} height={25} viewBox="0 0 25 25" fill="none" aria-hidden>
      <path d="M12.32 25C10.6445 25 9.04289 24.675 7.51521 24.025C6.05323 23.3917 4.75142 22.4959 3.60976 21.3376C2.46811 20.1793 1.58518 18.8585 0.960961 17.3752C0.32032 15.8252 0 14.2003 0 12.5003C0 10.8004 0.32032 9.17542 0.960961 7.62546C1.58518 6.14217 2.46811 4.82137 3.60976 3.66307C4.75142 2.50477 6.05323 1.60896 7.51521 0.975642C9.04289 0.325659 10.6445 0.000666709 12.32 0.000666709C13.9955 0.000666709 15.5971 0.325659 17.1248 0.975642C18.5868 1.60896 19.8886 2.50477 21.0303 3.66307C22.1719 4.82137 23.0549 6.14217 23.6791 7.62546C24.3197 9.17542 24.64 10.8004 24.64 12.5003C24.64 14.2003 24.3197 15.8252 23.6791 17.3752C23.0549 18.8585 22.1719 20.1793 21.0303 21.3376C19.8886 22.4959 18.5868 23.3917 17.1248 24.025C15.5971 24.675 13.9955 25 12.32 25ZM12.32 22.5001C14.1105 22.5001 15.7696 22.0417 17.2973 21.1251C18.7757 20.2418 19.9502 19.0502 20.8208 17.5502C21.7243 16.0002 22.176 14.317 22.176 12.5003C22.176 10.6837 21.7243 9.00043 20.8208 7.45047C19.9502 5.95051 18.7757 4.75887 17.2973 3.87556C15.7696 2.95892 14.1105 2.5006 12.32 2.5006C10.5295 2.5006 8.87041 2.95892 7.34273 3.87556C5.86433 4.75887 4.68982 5.95051 3.8192 7.45047C2.91574 9.00043 2.464 10.6837 2.464 12.5003C2.464 14.317 2.91574 16.0002 3.8192 17.5502C4.68982 19.0502 5.86433 20.2418 7.34273 21.1251C8.87041 22.0417 10.5295 22.5001 12.32 22.5001ZM11.088 17.5002L5.86433 12.2003L7.61377 10.4254L11.088 13.9753L18.0611 6.90048L19.8106 8.65044L11.088 17.5002Z" fill="#10B981" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width={17} height={16} viewBox="0 0 17 16" fill="none" aria-hidden>
      <path d="M9.19081 0.417033L16.8956 13.9303C17.0033 14.1159 17.0275 14.3179 16.9683 14.5363C16.909 14.7547 16.7825 14.924 16.5887 15.0441C16.4702 15.1205 16.3356 15.1588 16.1849 15.1588H0.807628C0.581492 15.1588 0.390353 15.0769 0.234212 14.9131C0.0780707 14.7493 0 14.5582 0 14.3398C0 14.1869 0.0323051 14.0504 0.0969153 13.9303L7.80169 0.417033C7.90937 0.220477 8.07089 0.0921692 8.28626 0.0321101C8.50163 -0.0279491 8.70623 -0.0033791 8.90006 0.105818C9.02928 0.182257 9.12619 0.285996 9.19081 0.417033ZM2.19675 13.5208H14.7957L8.49625 2.46449L2.19675 13.5208ZM7.68862 11.0638H9.30387V12.7018H7.68862V11.0638ZM7.68862 5.33094H9.30387V9.42587H7.68862V5.33094Z" fill="#EF4444" />
    </svg>
  );
}
