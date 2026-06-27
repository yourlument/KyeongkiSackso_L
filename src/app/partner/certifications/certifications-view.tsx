"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CertRow, CertStatus } from "@/lib/partner-certifications";
import { uploadFile } from "@/lib/upload-client";
import {
  AwardIcon,
  PlusIcon,
  DocIcon,
  PaperclipIcon,
  TrashLineIcon,
  CloseIcon,
  UploadIcon,
  TrashCanIcon,
} from "./certifications-icons";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

type BadgeT = { bg: string; border: string; color: string };
const STATUS_BADGE: Record<CertStatus, BadgeT> = {
  "등록 완료": { bg: "#ECFDF5", border: "#A7F3D0", color: "#047857" },
  "심사 진행중": { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
  반려: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};

function Pill({ status }: { status: CertStatus }) {
  const t = STATUS_BADGE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        padding: "3.44px 10.76px",
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        fontSize: "10px",
        fontWeight: 400,
        letterSpacing: "-0.15px",
        lineHeight: "18px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function StatCard({ value, color, label }: { value: string; color: string; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "20.52px",
        borderRadius: "19.52px",
        background: "#fff",
        border: "1px solid rgba(210,210,215,0.2)",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.33px", lineHeight: "39.6px", color }}>{value}</p>
      <p style={{ margin: "4.88px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{label}</p>
    </div>
  );
}

export function CertificationsView({
  rows,
  stats,
}: {
  rows: CertRow[];
  stats: { approved: number; reviewing: number; total: number };
}) {
  const router = useRouter();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CertRow | null>(null);

  return (
    <div>
      <div style={{ marginBottom: "29.28px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, letterSpacing: "-0.56px", lineHeight: "25px", color: INK }}>보유 인증 관리</h1>
        <p style={{ margin: "4.88px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
          인증서를 제출하면 상품 상세 및 투찰 데이터에 자동 연동됩니다
        </p>
      </div>

      <div style={{ width: "937px", maxWidth: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "19.52px",
            padding: "25.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
          }}
        >
          <div
            style={{
              width: "59px",
              height: "59px",
              flexShrink: 0,
              borderRadius: "19.52px",
              background: "rgba(30,58,95,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AwardIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>보유 인증서 제출</h3>
            <p style={{ margin: "2.44px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>
              인증서명, 설명과 함께 PDF/이미지 파일을 제출하세요
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7.32px",
              padding: "12.2px 24.4px",
              borderRadius: "14.64px",
              border: "none",
              background: NAVY,
              color: "#fff",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <PlusIcon />
            <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", whiteSpace: "nowrap" }}>인증서 제출</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: "19.52px", marginTop: "24.4px" }}>
          <StatCard value={String(stats.approved)} color="#059669" label="등록 완료" />
          <StatCard value={String(stats.reviewing)} color="#D97706" label="심사 진행중" />
          <StatCard value={String(stats.total)} color={INK} label="전체 제출" />
        </div>

        <div
          style={{
            marginTop: "24.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "9.76px", padding: "19.52px 24.4px 20.52px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, letterSpacing: "-0.392px", lineHeight: "17.5px", color: INK }}>제출한 인증서 목록</h3>
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>총 {stats.total}건</span>
          </div>

          <div>
            {rows.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  gap: "14.64px",
                  padding: "19.52px 24.4px",
                  borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    flexShrink: 0,
                    borderRadius: "14.64px",
                    background: "rgba(29,29,31,0.03)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DocIcon />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9.76px" }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{c.name}</p>
                    <Pill status={c.status} />
                  </div>
                  <p style={{ margin: "2.44px 0 0", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)" }}>{c.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "14.64px", marginTop: "4.88px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "2.44px" }}>
                      <PaperclipIcon />
                      <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{c.file}</span>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{c.uploaded}</span>
                    {c.reviewed && (
                      <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{c.reviewed}</span>
                    )}
                  </div>
                  {c.reason && (
                    <div style={{ marginTop: "7.32px" }}>
                      <p
                        style={{
                          margin: 0,
                          padding: "7.32px 12.2px",
                          borderRadius: "9.76px",
                          background: "#FEF2F2",
                          fontSize: "11px",
                          fontWeight: 400,
                          letterSpacing: "-0.165px",
                          lineHeight: "19.8px",
                          color: "#EF4444",
                        }}
                      >
                        {c.reason}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  aria-label="삭제"
                  style={{
                    width: "34px",
                    height: "34px",
                    flexShrink: 0,
                    borderRadius: "9.76px",
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <TrashLineIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} onSubmitted={() => { setSubmitOpen(false); router.refresh(); }} />}
      {deleteTarget && <DeleteModal cert={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); router.refresh(); }} />}
    </div>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "19.52px",
        zIndex: 50,
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function SubmitModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const canSubmit = name.trim() !== "" && !!fileUrl && !submitting;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    setFileError(null);
    setUploading(true);
    try {
      const saved = await uploadFile(f);
      setFileUrl(saved.url);
      setFileName(f.name);
    } catch {
      setFileError("파일 업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  }

  function clearFile() {
    setFileUrl(null);
    setFileName("");
    setFileError(null);
  }

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/partner/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || null, fileUrl, fileName }),
      });
      if (res.ok) onSubmitted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: "547px", maxWidth: "100%", borderRadius: "19.52px", background: "#fff", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "19.52px 29.28px 20.52px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: INK }}>인증서 제출</h2>
            <p style={{ margin: "2.44px 0 0", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" }}>
              인증서 정보를 입력하고 파일을 첨부하세요
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: "39px",
              height: "39px",
              flexShrink: 0,
              borderRadius: "9.76px",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div style={{ padding: "29.28px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "7.32px", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>
              인증서명 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: ISO 9001 품질경영시스템 인증"
              style={{
                width: "100%",
                padding: "13.19px 15.64px",
                borderRadius: "14.64px",
                background: "#fff",
                border: "1px solid rgba(210,210,215,0.3)",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: INK,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginTop: "19.52px" }}>
            <label style={{ display: "block", marginBottom: "7.32px", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>
              설명
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value.slice(0, 300))}
              placeholder="인증 기관, 유효 기간, 인증 범위 등 간략한 설명을 입력하세요"
              maxLength={300}
              rows={3}
              style={{
                width: "100%",
                height: "95px",
                padding: "13.2px 15.64px",
                borderRadius: "14.64px",
                background: "#fff",
                border: "1px solid rgba(210,210,215,0.3)",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: INK,
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
            <p style={{ margin: "2.44px 0 0", textAlign: "right", fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)" }}>{desc.length}/300</p>
          </div>

          <div style={{ marginTop: "19.52px" }}>
            <label style={{ display: "block", marginBottom: "7.32px", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>
              인증서 파일 *
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                padding: "26.4px",
                borderRadius: "14.64px",
                border: "2px dashed rgba(210,210,215,0.3)",
                background: "transparent",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "9.76px" }}>
                <div
                  style={{
                    width: "49px",
                    height: "49px",
                    borderRadius: "14.64px",
                    background: "rgba(30,58,95,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UploadIcon />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)" }}>{uploading ? "업로드 중…" : fileName ? "변경" : "클릭하여 파일 선택"}</p>
              <p style={{ margin: "2.44px 0 0", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>PDF, JPG, PNG 지원</p>
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,image/*" onChange={onFile} style={{ display: "none" }} />
            {fileName && fileUrl && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "9.76px", marginTop: "7.32px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "rgba(29,29,31,0.02)", padding: "9.76px 15.64px" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
                <button type="button" aria-label="파일 삭제" onClick={clearFile} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "inline-flex", flexShrink: 0 }}>
                  <CloseIcon />
                </button>
              </div>
            )}
            {fileError && (
              <p style={{ margin: "4.88px 0 0", fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#EF4444" }}>{fileError}</p>
            )}
          </div>

          <div style={{ display: "flex", gap: "14.64px", marginTop: "24.4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "13.2px 1px",
                borderRadius: "14.64px",
                background: "#fff",
                border: "1px solid rgba(210,210,215,0.3)",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: "rgba(29,29,31,0.6)",
                cursor: "pointer",
              }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              style={{
                flex: 1,
                padding: "12.2px 0",
                borderRadius: "14.64px",
                background: NAVY,
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "-0.2928px",
                lineHeight: "22.75px",
                color: "#fff",
                cursor: canSubmit ? "pointer" : "default",
                opacity: canSubmit ? 1 : 0.4,
              }}
            >
              제출하기
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function DeleteModal({ cert, onClose, onDeleted }: { cert: CertRow; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  async function remove() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/partner/certifications/${cert.id}`, { method: "DELETE" });
      if (res.ok) onDeleted();
    } finally {
      setDeleting(false);
    }
  }
  return (
    <Overlay onClose={onClose}>
      <div style={{ width: "547px", maxWidth: "100%", padding: "29.28px", borderRadius: "19.52px", background: "#fff", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "19.52px" }}>
          <div
            style={{
              width: "59px",
              height: "59px",
              borderRadius: "9999px",
              background: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrashCanIcon />
          </div>
        </div>
        <h2 style={{ margin: "0 0 9.76px", fontSize: "17px", fontWeight: 700, letterSpacing: "-0.476px", lineHeight: "21.25px", color: INK }}>인증서 삭제</h2>
        <p style={{ margin: "0 0 4.88px", fontSize: "14px", fontWeight: 400, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "rgba(29,29,31,0.6)" }}>인증서를 삭제하시겠습니까?</p>
        <p style={{ margin: "0 0 29.28px", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#EF4444" }}>재등록 시 심사가 필요합니다.</p>
        <div style={{ display: "flex", gap: "14.64px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13.2px 1px",
              borderRadius: "14.64px",
              background: "#fff",
              border: "1px solid rgba(210,210,215,0.3)",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "-0.2928px",
              lineHeight: "22.75px",
              color: "rgba(29,29,31,0.6)",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            style={{
              flex: 1,
              padding: "12.2px 0",
              borderRadius: "14.64px",
              background: "#EF4444",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "-0.2928px",
              lineHeight: "22.75px",
              color: "#fff",
              cursor: deleting ? "default" : "pointer",
              opacity: deleting ? 0.6 : 1,
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </Overlay>
  );
}
