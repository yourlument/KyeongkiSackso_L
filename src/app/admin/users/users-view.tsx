"use client";

import { useMemo, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow, AdminUserStatus } from "@/lib/admin-users";

type RoleLabel = "공급업체" | "공무원";

const ROLE_FILTERS: Array<"전체" | RoleLabel> = ["전체", "공무원", "공급업체"];
const PAGE_SIZE = 18;
const GRID = "194px 157px 294px 177px 128px 137px";
const CELL_PAD = "17.08px 24.4px";

export function UsersView({ rows }: { rows: AdminUserRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [roleF, setRoleF] = useState<"전체" | RoleLabel>("전체");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminUserRow | null>(null);

  const filtered = useMemo(() => {
    return rows
      .filter((u) => (roleF === "전체" ? true : u.role === roleF))
      .filter((u) => (q.trim() ? (u.name + u.field).includes(q.trim()) : true));
  }, [rows, roleF, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleBlock(row: AdminUserRow) {
    const res = await fetch("/api/admin/users/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: row.kind, id: row.id }),
    });
    if (res.ok) {
      setDetail(null);
      startTransition(() => router.refresh());
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ paddingBottom: "34.16px" }}>
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
          유저 관리
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
          활동 트래킹 및 악성 유저 블랙리스트 관리
        </p>
      </div>

      <div
        className="flex items-center"
        style={{
          gap: "14.64px",
          background: "#fff",
          borderRadius: "19.52px",
          border: "1px solid rgba(210,210,215,0.2)",
          padding: "20.52px",
          marginBottom: "19.52px",
        }}
      >
        <div className="flex items-center" style={{ gap: "9.76px" }}>
          {ROLE_FILTERS.map((r) => {
            const active = roleF === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRoleF(r);
                  setPage(1);
                }}
                className="inline-flex items-center justify-center"
                style={{
                  borderRadius: "9999px",
                  height: "39.4px",
                  padding: "0 20.52px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "-0.293px",
                  lineHeight: "22.75px",
                  border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
                  cursor: "pointer",
                  background: active ? "#1E3A5F" : "#fff",
                  color: active ? "#fff" : "rgba(29,29,31,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1" style={{ height: "49.13px" }}>
          <span
            className="absolute flex items-center"
            style={{ left: "14.62px", top: 0, bottom: 0, pointerEvents: "none" }}
            aria-hidden
          >
            <SearchIcon />
          </span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="이름 또는 부서 검색"
            className="h-full w-full"
            style={{
              borderRadius: "14.64px",
              border: "1px solid rgba(210,210,215,0.3)",
              background: "#fff",
              padding: "0 15.64px 0 44.92px",
              outline: "none",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "-0.293px",
              lineHeight: "22.75px",
              color: "#1D1D1F",
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "19.52px",
          border: "1px solid rgba(210,210,215,0.2)",
          padding: "1px",
          overflow: "hidden",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: GRID,
            height: "56px",
            alignItems: "center",
            background: "rgba(29,29,31,0.02)",
            borderBottom: "1px solid rgba(210,210,215,0.1)",
          }}
        >
          {["이름/업체명", "구분", "부서/분야", "지역", "상태", ""].map((h, i) => (
            <div key={i} style={{ padding: CELL_PAD }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "-0.18px",
                  lineHeight: "21.6px",
                  color: "rgba(29,29,31,0.4)",
                }}
              >
                {h}
              </span>
            </div>
          ))}
        </div>

        {pageRows.map((u, i) => (
          <div
            key={u.id}
            className="grid items-center"
            style={{
              gridTemplateColumns: GRID,
              height: "75px",
              borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)",
            }}
          >
            <div style={{ padding: CELL_PAD }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "-0.21px",
                  lineHeight: "25.2px",
                  color: "#1D1D1F",
                }}
              >
                {u.name}
              </span>
            </div>
            <div style={{ padding: CELL_PAD }}>
              <span
                className="inline-flex items-center justify-center"
                style={{
                  borderRadius: "9999px",
                  height: "26px",
                  padding: "0 13.2px",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "-0.18px",
                  lineHeight: "21.6px",
                  background: "rgba(29,29,31,0.05)",
                  border: "1px solid rgba(210,210,215,0.2)",
                  color: "rgba(29,29,31,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {u.role}
              </span>
            </div>
            <div style={{ padding: CELL_PAD }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  letterSpacing: "-0.195px",
                  lineHeight: "23.4px",
                  color: "rgba(29,29,31,0.6)",
                }}
              >
                {u.field}
              </span>
            </div>
            <div style={{ padding: CELL_PAD }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  letterSpacing: "-0.195px",
                  lineHeight: "23.4px",
                  color: "rgba(29,29,31,0.4)",
                }}
              >
                {u.region}
              </span>
            </div>
            <div style={{ padding: CELL_PAD }}>
              <StatusBadge status={u.status} />
            </div>
            <div style={{ padding: CELL_PAD }}>
              <button
                type="button"
                onClick={() => setDetail(u)}
                className="inline-flex items-center justify-center"
                style={{
                  borderRadius: "14.64px",
                  height: "40px",
                  border: "1px solid rgba(210,210,215,0.2)",
                  background: "#fff",
                  padding: "0 15.64px",
                  fontSize: "13px",
                  fontWeight: 400,
                  letterSpacing: "-0.24px",
                  lineHeight: "23.4px",
                  color: "rgba(29,29,31,0.5)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                상세
              </button>
            </div>
          </div>
        ))}

        <div
          className="flex items-center justify-center"
          style={{ gap: "4.88px", padding: "19.52px 0" }}
        >
          <PageArrow
            dir="prev"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => {
            const active = n === safePage;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className="flex items-center justify-center"
                style={{
                  width: "39px",
                  height: "39px",
                  borderRadius: "7.32px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "17.08px",
                  fontWeight: 500,
                  letterSpacing: "-0.293px",
                  lineHeight: "24.4px",
                  background: active ? "#1F2937" : "transparent",
                  color: active ? "#fff" : "#4B5563",
                }}
              >
                {n}
              </button>
            );
          })}
          <PageArrow
            dir="next"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>

      {detail &&
        (detail.kind === "supplier" ? (
          <SupplierDetailModal row={detail} onClose={() => setDetail(null)} onBlock={() => handleBlock(detail)} />
        ) : (
          <OfficialDetailModal row={detail} onClose={() => setDetail(null)} onBlock={() => handleBlock(detail)} />
        ))}
    </div>
  );
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  const blocked = status === "차단";
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        borderRadius: "9999px",
        height: "26px",
        padding: "0 13.2px",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "-0.18px",
        lineHeight: "21.6px",
        background: blocked ? "#FEF2F2" : "#ECFDF5",
        border: blocked ? "1px solid #FECACA" : "1px solid #A7F3D0",
        color: blocked ? "#DC2626" : "#047857",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function ModalShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", padding: "24px" }}
      onClick={onClose}
    >
      <div
        className="flex w-full flex-col overflow-y-auto"
        style={{
          maxWidth: "624.62px",
          maxHeight: "90vh",
          background: "#FFFFFF",
          borderRadius: "19.52px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, sub, onClose }: { title: string; sub: string; onClose: () => void }) {
  return (
    <div
      className="flex items-start justify-between"
      style={{
        padding: "19.52px 29.28px 20.52px",
        borderBottom: "1px solid rgba(210,210,215,0.1)",
        flexShrink: 0,
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "-0.448px",
            lineHeight: "20px",
            color: "#1D1D1F",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "2.44px 0 0",
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "-0.18px",
            lineHeight: "21.6px",
            color: "rgba(29,29,31,0.4)",
          }}
        >
          {sub}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center"
        style={{
          width: "39.03px",
          height: "39.03px",
          borderRadius: "9.76px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          marginTop: "2.5px",
          flexShrink: 0,
        }}
        aria-label="닫기"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function ProfileRow({
  initial,
  name,
  sub,
  status,
}: {
  initial: string;
  name: string;
  sub: string;
  status: AdminUserStatus;
}) {
  return (
    <div className="flex items-center" style={{ gap: "14.64px" }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: "58.55px",
          height: "58.55px",
          borderRadius: "19.52px",
          background: "rgba(30,58,95,0.1)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "-0.24px",
            lineHeight: "28px",
            color: "#1E3A5F",
          }}
        >
          {initial}
        </span>
      </div>
      <div className="flex-1">
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "-0.225px",
            lineHeight: "27px",
            color: "#1D1D1F",
          }}
        >
          {name}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "-0.18px",
            lineHeight: "21.6px",
            color: "rgba(29,29,31,0.4)",
          }}
        >
          {sub}
        </p>
      </div>
      <span
        className="inline-flex items-center justify-center"
        style={{
          borderRadius: "9999px",
          padding: "5.88px 13.2px",
          background: status === "차단" ? "#FEF2F2" : "#ECFDF5",
          border: status === "차단" ? "1px solid #FECACA" : "1px solid #A7F3D0",
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "-0.18px",
          lineHeight: "21.6px",
          color: status === "차단" ? "#DC2626" : "#047857",
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 9.76px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.55px",
        lineHeight: "19.8px",
        color: "rgba(29,29,31,0.3)",
      }}
    >
      {children}
    </p>
  );
}

function InfoBox({ children, variant }: { children: ReactNode; variant?: "navy" }) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "1fr 1fr",
        gap: "14.64px",
        borderRadius: "14.64px",
        ...(variant === "navy"
          ? {
              background: "rgba(30,58,95,0.024)",
              border: "1px solid rgba(30,58,95,0.1)",
              padding: "20.52px",
            }
          : { background: "rgba(29,29,31,0.016)", padding: "19.52px" }),
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  full,
  valueStyle,
}: {
  label: string;
  value: string;
  full?: boolean;
  valueStyle?: CSSProperties;
}) {
  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <p
        style={{
          margin: 0,
          paddingBottom: "4.88px",
          fontSize: "11px",
          fontWeight: 400,
          letterSpacing: "-0.165px",
          lineHeight: "19.8px",
          color: "rgba(29,29,31,0.4)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "-0.195px",
          lineHeight: "23.4px",
          color: "#1D1D1F",
          ...valueStyle,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ModalFooter({ onClose, onBlock }: { onClose: () => void; onBlock?: () => void }) {
  return (
    <div style={{ paddingTop: "24.4px" }}>
      <div
        className="flex"
        style={{
          gap: "14.64px",
          borderTop: "1px solid rgba(210,210,215,0.1)",
          paddingTop: "10.76px",
        }}
      >
        {onBlock && (
          <button
            type="button"
            onClick={onBlock}
            className="flex-1 items-center justify-center"
            style={{
              height: "55.75px",
              borderRadius: "14.64px",
              background: "#EF4444",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "-0.2928px",
              lineHeight: "24.5px",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            차단/해제
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="flex-1 items-center justify-center"
          style={{
            height: "55.75px",
            borderRadius: "14.64px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "-0.2928px",
            lineHeight: "24.5px",
            color: "rgba(29,29,31,0.5)",
            cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function SupplierDetailModal({
  row,
  onClose,
  onBlock,
}: {
  row: AdminUserRow;
  onClose: () => void;
  onBlock: () => void;
}) {
  const s = row.supplier!;
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="공급업체 상세 정보" sub={s.fieldLabel} onClose={onClose} />
      <div style={{ padding: "29.28px" }}>
        <ProfileRow
          initial={row.name.slice(0, 1)}
          name={row.name}
          sub={s.fieldLabel ? `공급업체 · ${s.fieldLabel}` : "공급업체"}
          status={row.status}
        />

        <div style={{ paddingTop: "24.4px" }}>
          <SectionLabel>기본 정보</SectionLabel>
          <InfoBox>
            <Field label="가입일" value={s.joinDate} />
            <Field label="지역" value={s.region} />
            <Field label="사업자등록번호" value={s.bizNo} />
            <Field label="대표자" value={s.repName} />
          </InfoBox>
        </div>

        <div style={{ paddingTop: "24.4px" }}>
          <SectionLabel>세금계산서 발행 정보</SectionLabel>
          <InfoBox variant="navy">
            <Field label="사업자등록번호" value={s.bizNo} />
            <Field label="기관(상호)명" value={s.taxOrgName} />
            <Field label="대표자 성함" value={s.repName} />
            <Field label="수신용 이메일" value={s.taxEmail} />
            <Field label="사업장 주소" value={s.taxAddress} full />
          </InfoBox>
        </div>

        <div style={{ paddingTop: "24.4px" }}>
          <SectionLabel>사업자등록증</SectionLabel>
          <div
            className="flex items-center"
            style={{
              gap: "14.64px",
              borderRadius: "14.64px",
              background: "rgba(29,29,31,0.016)",
              border: "1px solid rgba(210,210,215,0.15)",
              padding: "15.64px 20.52px",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "43.91px",
                height: "43.91px",
                borderRadius: "14.64px",
                background: "#FEF2F2",
                flexShrink: 0,
              }}
            >
              <PdfIcon />
            </div>
            <span
              className="flex-1"
              style={{
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "-0.195px",
                lineHeight: "23.4px",
                color: "rgba(29,29,31,0.7)",
              }}
            >
              {s.licenseFileName}
            </span>
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "-0.2928px",
                lineHeight: "21px",
                color: "#1E3A5F",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              파일 보기
            </button>
          </div>
        </div>

        {s.certifications.length > 0 && (
          <div style={{ paddingTop: "24.4px" }}>
            <SectionLabel>보유 인증</SectionLabel>
            <div className="flex flex-wrap" style={{ gap: "9.76px" }}>
              {s.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center justify-center"
                  style={{
                    borderRadius: "9999px",
                    padding: "5.88px 15.64px",
                    background: "rgba(30,58,95,0.05)",
                    border: "1px solid rgba(30,58,95,0.15)",
                    fontSize: "12px",
                    fontWeight: 400,
                    letterSpacing: "-0.18px",
                    lineHeight: "21.6px",
                    color: "rgba(30,58,95,0.7)",
                  }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ paddingTop: "24.4px" }}>
          <SectionLabel>정산 계좌 정보</SectionLabel>
          <InfoBox>
            <Field
              label="인증 상태"
              value={s.bankVerified ? "계좌 인증 완료" : "미인증"}
              valueStyle={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.165px",
                lineHeight: "19.8px",
                color: s.bankVerified ? "#047857" : "rgba(29,29,31,0.4)",
              }}
            />
            <Field label="은행" value={s.bankName} />
            <Field label="계좌번호" value={s.bankAccountNo} />
            <Field label="예금주" value={s.bankAccountHolder} />
          </InfoBox>
        </div>

        <ModalFooter onClose={onClose} onBlock={onBlock} />
      </div>
    </ModalShell>
  );
}

function OfficialDetailModal({
  row,
  onClose,
  onBlock,
}: {
  row: AdminUserRow;
  onClose: () => void;
  onBlock: () => void;
}) {
  const o = row.official!;
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="공무원 상세 정보" sub={o.dept} onClose={onClose} />
      <div style={{ padding: "29.28px" }}>
        <ProfileRow
          initial={row.name.slice(0, 1)}
          name={row.name}
          sub={o.dept ? `공무원 · ${o.dept}` : "공무원"}
          status={row.status}
        />

        <div style={{ paddingTop: "24.4px" }}>
          <SectionLabel>기본 정보</SectionLabel>
          <InfoBox>
            <Field label="가입일" value={o.joinDate} />
            <Field label="지역" value={o.region} />
            <Field label="기관 고유번호" value={o.orgBizNo} />
          </InfoBox>
        </div>

        <div style={{ paddingTop: "24.4px" }}>
          <SectionLabel>세금계산서 발행 정보</SectionLabel>
          <InfoBox variant="navy">
            <Field label="기관 고유번호(사업자번호)" value={o.orgBizNo} />
            <Field label="기관(상호)명" value={o.orgName} />
            <Field label="대표자 성함" value={o.orgRepName} />
            <Field label="수신용 이메일" value={o.orgTaxEmail} />
            <Field label="사업장 주소" value={o.orgAddress} full />
          </InfoBox>
        </div>

        <ModalFooter onClose={onClose} onBlock={onBlock} />
      </div>
    </ModalShell>
  );
}

function CloseIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M5.91598 4.66013L10.5111 -0.000403281L11.832 1.33927L7.23685 5.9998L11.832 10.6603L10.5111 12L5.91598 7.33947L1.32086 12L0 10.6603L4.59512 5.9998L0 1.33927L1.32086 -0.000403281L5.91598 4.66013Z"
        fill="#1D1D1F"
        fillOpacity={0.3}
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width={15} height={17} viewBox="0 0 15 17" fill="none" aria-hidden>
      <path
        d="M7.50008 11.8315H4.16671V5.07104H7.50008C8.10009 5.07104 8.65565 5.22315 9.16677 5.52737C9.67788 5.8316 10.0834 6.24286 10.3834 6.76116C10.6834 7.27947 10.8335 7.84284 10.8335 8.45129C10.8335 9.05973 10.6834 9.6231 10.3834 10.1414C10.0834 10.6597 9.67788 11.071 9.16677 11.3752C8.65565 11.6794 8.10009 11.8315 7.50008 11.8315ZM5.8334 6.76116V10.1414H7.50008C7.80008 10.1414 8.07787 10.0654 8.33342 9.91324C8.58898 9.76113 8.79176 9.5555 8.94176 9.29635C9.09176 9.03719 9.16677 8.75551 9.16677 8.45129C9.16677 8.14706 9.09176 7.86538 8.94176 7.60622C8.79176 7.34707 8.58898 7.14144 8.33342 6.98933C8.07787 6.83722 7.80008 6.76116 7.50008 6.76116H5.8334ZM10.0001 1.6908H1.66668V15.2118H13.3335V5.07104H10.0001V1.6908ZM0 0.845737C0 0.60912 0.0805564 0.409123 0.241669 0.245745C0.402782 0.0823662 0.600006 0.000675929 0.833342 0.000675929H10.8335L15.0002 4.22598V16.0568C15.0002 16.2822 14.9196 16.4794 14.7585 16.6484C14.5974 16.8174 14.4002 16.9019 14.1668 16.9019H0.833342C0.600006 16.9019 0.402782 16.8202 0.241669 16.6568C0.0805564 16.4934 0 16.2935 0 16.0568V0.845737Z"
        fill="#F87171"
      />
    </svg>
  );
}

function PageArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center"
      style={{
        width: "39px",
        height: "39px",
        borderRadius: "7.32px",
        border: "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
      }}
      aria-label={dir === "prev" ? "이전" : "다음"}
    >
      <svg width={18} height={18} viewBox="0 0 40 40" fill="none" aria-hidden>
        {dir === "prev" ? (
          <path
            d="M19.1181 19.9997L22.6714 23.6022L21.6644 24.6377L17.0897 19.9997L21.6644 15.3616L22.6714 16.3972L19.1181 19.9997Z"
            fill="#D1D5DB"
          />
        ) : (
          <path
            d="M20.643 19.9997L17.0897 16.3972L18.0967 15.3616L22.6714 19.9997L18.0967 24.6377L17.0897 23.6022L20.643 19.9997Z"
            fill="#4B5563"
          />
        )}
      </svg>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M13.2338 12.016L16.3154 15.1402L15.293 16.1768L12.2114 13.0525C11.645 13.51 11.0258 13.8603 10.3538 14.1037C9.6434 14.3567 8.9138 14.4832 8.165 14.4832C6.9938 14.4832 5.9042 14.1864 4.8962 13.5927C3.917 13.0087 3.1442 12.2204 2.5778 11.2276C1.9826 10.2056 1.685 9.10097 1.685 7.91356C1.685 6.72615 1.9826 5.62147 2.5778 4.59952C3.1442 3.60677 3.917 2.82328 4.8962 2.24904C5.9042 1.6456 6.9938 1.34388 8.165 1.34388C9.3362 1.34388 10.4258 1.6456 11.4338 2.24904C12.413 2.82328 13.1906 3.60677 13.7666 4.59952C14.3522 5.62147 14.645 6.72615 14.645 7.91356C14.645 8.67272 14.5202 9.41242 14.2706 10.1327C14.0306 10.814 13.685 11.4417 13.2338 12.016ZM11.7794 11.4758C12.2306 11.0086 12.581 10.4733 12.8306 9.86987C13.0802 9.24696 13.205 8.59486 13.205 7.91356C13.205 6.98894 12.9746 6.12758 12.5138 5.32949C12.0722 4.56059 11.4722 3.95229 10.7138 3.50458C9.9266 3.0374 9.077 2.80381 8.165 2.80381C7.253 2.80381 6.4034 3.0374 5.6162 3.50458C4.8578 3.95229 4.2578 4.56059 3.8162 5.32949C3.3554 6.12758 3.125 6.98894 3.125 7.91356C3.125 8.83818 3.3554 9.69954 3.8162 10.4976C4.2578 11.2665 4.8578 11.8748 5.6162 12.3225C6.4034 12.7897 7.253 13.0233 8.165 13.0233C8.837 13.0233 9.4802 12.8968 10.0946 12.6437C10.6898 12.3907 11.2178 12.0354 11.6786 11.578L11.7794 11.4758Z"
        fill="#1D1D1F"
        fillOpacity={0.3}
      />
    </svg>
  );
}
