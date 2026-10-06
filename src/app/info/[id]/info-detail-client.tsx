"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReportView } from "@/app/report/report-view";
import type { ReportKind } from "@/components/report-modal";
import type { InfoDetailData } from "@/lib/info";

const NAVY = "#1E3A5F";

const actionTextStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "-0.18px",
  lineHeight: "21.6px",
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textDecoration: "none",
};

export function InfoDetailClient({ initialKind, data }: { initialKind: ReportKind | null; data: InfoDetailData }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/info");
  }

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/info/${data.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        alert(d.error ?? "삭제 중 오류가 발생했습니다");
        return;
      }
      setConfirming(false);
      router.push("/info");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ReportView
        initialKind={initialKind}
        data={data}
        onBack={goBack}
        ownerActions={
          data.mine ? (
            <>
              <Link href={`/info/${data.id}/edit`} style={{ ...actionTextStyle, color: NAVY }}>
                수정
              </Link>
              <button type="button" onClick={() => setConfirming(true)} style={{ ...actionTextStyle, color: "#EF4444" }}>
                삭제
              </button>
            </>
          ) : null
        }
      />
      {confirming && (
        <DeleteModal
          title="게시글 삭제"
          message={`"${data.title}" 게시글을 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`}
          busy={deleting}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void remove()}
        />
      )}
    </>
  );
}

function DeleteModal({ title, message, busy, onCancel, onConfirm }: { title: string; message: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", padding: "19.52px" }} onClick={onCancel}>
      <div
        className="flex w-full flex-col"
        style={{ maxWidth: "468.47px", background: "#FFFFFF", borderRadius: "14.64px", border: "1px solid #E5E7EB", padding: "30.28px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center" style={{ gap: "14.64px", paddingBottom: "19.52px" }}>
          <span className="flex items-center justify-center" style={{ width: "48.8px", height: "48.8px", borderRadius: "9999px", background: "#FEF2F2", flexShrink: 0 }}>
            <TrashIcon />
          </span>
          <span style={{ fontSize: "17.08px", fontWeight: 700, letterSpacing: "-0.4782px", lineHeight: "24.4px", color: "#111827" }}>{title}</span>
        </div>
        <p style={{ margin: 0, paddingBottom: "29.28px", fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "23.79px", color: "#6B7280" }}>{message}</p>
        <div className="flex" style={{ gap: "9.76px" }}>
          <button
            type="button"
            onClick={onCancel}
            className="flex flex-1 items-center justify-center"
            style={{ height: "43.89px", borderRadius: "9.76px", border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "14.64px", fontWeight: 700, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#111827" }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center"
            style={{ height: "43.89px", borderRadius: "9.76px", border: "none", background: "#DC2626", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontSize: "14.64px", fontWeight: 700, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#FFFFFF" }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 19 19" fill="none" aria-hidden>
      <path d="M14.0495 3.80054H18.7327V5.70047H16.8594V18.05C16.8594 18.316 16.7688 18.5408 16.5878 18.7245C16.4067 18.9082 16.185 19 15.9228 19H2.8099C2.54764 19 2.32597 18.9082 2.14489 18.7245C1.96381 18.5408 1.87327 18.316 1.87327 18.05V5.70047H0V3.80054H4.68316V0.950643C4.68316 0.684652 4.77371 0.459826 4.95479 0.276165C5.13587 0.092506 5.35754 0.000675472 5.6198 0.000675472H13.1129C13.3751 0.000675472 13.5968 0.092506 13.7779 0.276165C13.959 0.459826 14.0495 0.684652 14.0495 0.950643V3.80054ZM14.9861 5.70047H3.74653V17.1001H14.9861V5.70047ZM6.55643 8.55037H8.4297V14.2502H6.55643V8.55037ZM10.303 8.55037H12.1762V14.2502H10.303V8.55037ZM6.55643 1.90061V3.80054H12.1762V1.90061H6.55643Z" fill="#EF4444" />
    </svg>
  );
}
