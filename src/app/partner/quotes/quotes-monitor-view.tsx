"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ProductRequest,
  type AnnouncementRow,
  type Proposal,
  type ProposalStatusKind,
} from "./quotes-data";
import { ProposalDetailModal } from "./proposal-detail-modal";
import {
  BoxIcon,
  DocIcon,
  StatBoxIcon,
  PinIcon,
  ChevronDownIcon,
  SearchIcon,
  PageArrowIcon,
} from "./quotes-icons";
import { QuoteSubmitModal } from "./quote-submit-modal";
import { SettlementAccountVerificationBanner } from "@/components/settlement-account-verification-banner";
import type { SettlementAccountVerificationStatus } from "@/lib/supplier-account-verification";

const NAVY = "#1E3A5F";

type MainTab = "product" | "announcement";
type SubTab = "list" | "proposals";

export function QuotesMonitorView({
  stats,
  productRequests,
  announcements,
  proposals,
  canTrade,
  accountVerificationStatus,
  initialMainTab = null,
  initialSubTab = null,
  initialRequestId = null,
}: {
  stats: { total: number; waiting: number; submitted: number };
  productRequests: ProductRequest[];
  announcements: AnnouncementRow[];
  proposals: Proposal[];
  canTrade: boolean;
  accountVerificationStatus: SettlementAccountVerificationStatus;
  initialMainTab?: string | null;
  initialSubTab?: string | null;
  initialRequestId?: string | null;
}) {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>(initialMainTab === "announcement" ? "announcement" : "product");
  const [subTab, setSubTab] = useState<SubTab>(initialSubTab === "proposals" ? "proposals" : "list");
  const [openReq, setOpenReq] = useState<string | null>(
    initialMainTab === "product" && initialRequestId
      ? initialRequestId
      : null,
  );
  const [submitAnnouncement, setSubmitAnnouncement] = useState<AnnouncementRow | null>(
    canTrade && initialMainTab === "announcement" && initialRequestId
      ? announcements.find((row) => row.id === initialRequestId) ?? null
      : null,
  );
  const [submitProduct, setSubmitProduct] = useState<ProductRequest | null>(
    canTrade && initialMainTab === "product" && initialRequestId
      ? productRequests.find((row) => row.id === initialRequestId) ?? null
      : null,
  );
  const [submissionComplete, setSubmissionComplete] = useState(false);

  function handleSubmitted() {
    setSubmitAnnouncement(null);
    setSubmitProduct(null);
    setSubmissionComplete(true);
  }

  function handleSubmissionCompleteClose() {
    setSubmissionComplete(false);
    router.refresh();
  }

  return (
    <>
      {!canTrade && accountVerificationStatus !== "VERIFIED" && (
        <SettlementAccountVerificationBanner status={accountVerificationStatus} />
      )}

      <div style={{ paddingBottom: "29.28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.56px", lineHeight: "25px", color: "#1D1D1F", margin: 0 }}>
          견적 요청 모니터링
        </h1>
        <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
          상품 견적 요청 대응 및 공고 기반 견적 제출을 관리하세요
        </p>
      </div>

      <div style={{ paddingBottom: "29.28px" }}>
        <div
          className="inline-flex items-center"
          style={{ gap: "4.88px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "5.88px" }}
        >
          <button
            type="button"
            onClick={() => setMainTab("product")}
            className="inline-flex items-center justify-center"
            style={{
              width: "164px",
              borderRadius: "7.32px",
              padding: "9.76px 19.52px",
              border: "none",
              cursor: "pointer",
              background: mainTab === "product" ? NAVY : "transparent",
            }}
          >
            <span style={{ paddingRight: "7.32px", display: "inline-flex" }}>
              <BoxIcon color={mainTab === "product" ? "#FFFFFF" : "#4B5563"} />
            </span>
            <span style={{ fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: mainTab === "product" ? "#FFFFFF" : "#4B5563" }}>
              상품 견적 대응
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab("announcement")}
            className="inline-flex items-center justify-center"
            style={{
              width: "164px",
              borderRadius: "7.32px",
              padding: "9.76px 19.52px",
              border: "none",
              cursor: "pointer",
              background: mainTab === "announcement" ? NAVY : "transparent",
            }}
          >
            <span style={{ paddingRight: "7.32px", display: "inline-flex" }}>
              <DocIcon color={mainTab === "announcement" ? "#FFFFFF" : "#4B5563"} />
            </span>
            <span style={{ fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: mainTab === "announcement" ? "#FFFFFF" : "#4B5563" }}>
              공고 견적 대응
            </span>
          </button>
        </div>
      </div>

      {mainTab === "product" ? (
        <ProductTab stats={stats} requests={productRequests} openReq={openReq} setOpenReq={setOpenReq} onSubmit={setSubmitProduct} canTrade={canTrade} />
      ) : (
        <AnnouncementTab announcements={announcements} proposals={proposals} subTab={subTab} setSubTab={setSubTab} onSubmit={setSubmitAnnouncement} canTrade={canTrade} />
      )}

      {submitAnnouncement && (
        <QuoteSubmitModal target={{ kind: "announcement", row: submitAnnouncement }} onClose={() => setSubmitAnnouncement(null)} onSubmitted={handleSubmitted} />
      )}
      {submitProduct && (
        <QuoteSubmitModal target={{ kind: "product", row: submitProduct }} onClose={() => setSubmitProduct(null)} onSubmitted={handleSubmitted} />
      )}
      {submissionComplete && <QuoteSubmissionCompleteModal onClose={handleSubmissionCompleteClose} />}
    </>
  );
}

export function QuoteSubmissionCompleteModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-quote-submission-complete-title"
      className="fixed inset-0 flex items-center justify-center"
      onClick={onClose}
      style={{ zIndex: 60, background: "rgba(0,0,0,0.4)", padding: "19.52px" }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ width: "390px", maxWidth: "100%", borderRadius: "19.52px", background: "#fff", padding: "29.28px", textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center justify-center" style={{ width: "68px", height: "68px", borderRadius: "9999px", background: "#ECFDF5", color: "#10B981", margin: "0 auto" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M8 16.5 13.2 22 24 10.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 id="partner-quote-submission-complete-title" style={{ fontSize: "18px", fontWeight: 700, lineHeight: "25.2px", letterSpacing: "-0.504px", color: "#1D1D1F", margin: "19.52px 0 0" }}>
          견적 제출 완료
        </h2>
        <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)", margin: "4.88px 0 0" }}>
          견적이 성공적으로 제출되었습니다.
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{ width: "100%", marginTop: "24.4px", borderRadius: "14.64px", border: "none", background: NAVY, padding: "12.2px 19.52px", cursor: "pointer", fontSize: "13px", fontWeight: 600, lineHeight: "22.75px", letterSpacing: "-0.293px", color: "#fff" }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

function ProductTab({ stats, requests, openReq, setOpenReq, onSubmit, canTrade }: { stats: { total: number; waiting: number; submitted: number }; requests: ProductRequest[]; openReq: string | null; setOpenReq: (v: string | null) => void; onSubmit: (r: ProductRequest) => void; canTrade: boolean }) {
  const statCards = [
    { key: "total", value: String(stats.total), label: "전체 요청" },
    { key: "waiting", value: String(stats.waiting), label: "대기중" },
    { key: "submitted", value: String(stats.submitted), label: "견적 제출" },
  ];
  return (
    <>
      <div className="flex" style={{ gap: "19.52px", paddingBottom: "29.28px" }}>
        {statCards.map((s) => (
          <div key={s.key} style={{ width: "363px", borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", padding: "20.52px" }}>
            <span className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "rgba(30,58,95,0.1)", marginBottom: "9.76px" }}>
              <StatBoxIcon />
            </span>
            <p style={{ fontSize: "24.4px", fontWeight: 700, letterSpacing: "-0.366px", lineHeight: "34.16px", color: "#111827", margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#9CA3AF", margin: "2.44px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
        <div style={{ padding: "14.64px 24.4px 15.64px", borderBottom: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#374151", margin: 0 }}>
            내 상품에 들어온 견적 요청
          </p>
          <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", margin: "2.44px 0 0" }}>
            구매담당자가 직접 요청한 견적을 확인하고 대응하세요.
          </p>
        </div>
        {requests.map((r, i) => (
          <ProductRow
            key={r.id}
            row={r}
            last={i === requests.length - 1}
            open={openReq === r.id}
            onToggle={() => setOpenReq(openReq === r.id ? null : r.id)}
            onSubmit={() => onSubmit(r)}
            canTrade={canTrade}
          />
        ))}
      </div>
    </>
  );
}

function ProductRow({ row, last, open, onToggle, onSubmit, canTrade }: { row: ProductRequest; last: boolean; open: boolean; onToggle: () => void; onSubmit: () => void; canTrade: boolean }) {
  const submitted = row.status === "견적 제출됨";
  return (
    <div style={{ borderBottom: last && !open ? "none" : "1px solid #F3F4F6" }}>
      <div className="flex items-center" style={{ gap: "19.52px", padding: "19.52px 24.4px" }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center" style={{ gap: "9.76px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827" }}>{row.product}</span>
            {submitted ? (
              <span style={{ borderRadius: "9999px", border: "1px solid #374151", background: "#F9FAFB", padding: "3.44px 10.76px", fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: "#1F2937" }}>견적 제출됨</span>
            ) : (
              <span style={{ borderRadius: "9999px", border: "1px solid #E5E7EB", padding: "3.44px 10.76px", fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: "#6B7280" }}>대기중</span>
            )}
          </div>
          <div className="flex items-center" style={{ gap: "14.64px", marginTop: "4.88px" }}>
            <span className="inline-flex items-center" style={{ gap: "2.44px" }}>
              <PinIcon />
              <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#9CA3AF" }}>{row.org}</span>
            </span>
            <span>
              <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#9CA3AF" }}>수량: </span>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#374151" }}>{row.qty}</span>
            </span>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#9CA3AF" }}>마감: {row.deadline}</span>
          </div>
        </div>

        {submitted ? (
          <div className="flex items-center" style={{ gap: "14.64px" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#1F2937", margin: 0 }}>{row.amount}</p>
              <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", margin: 0 }}>{row.submittedAt}</p>
            </div>
            <button type="button" onClick={onToggle} aria-label="펼치기" className="inline-flex items-center justify-center" style={{ width: "24px", height: "24px", border: "none", background: "none", cursor: "pointer", transform: open ? "rotate(180deg)" : "none" }}>
              <ChevronDownIcon />
            </button>
          </div>
        ) : (
          <div className="flex items-center" style={{ gap: "14.64px" }}>
            <button
              type="button"
              disabled={!canTrade}
              onClick={() => { if (canTrade) onSubmit(); }}
              style={{ borderRadius: "9.76px", background: NAVY, padding: "7.32px 14.64px", border: "none", cursor: canTrade ? "pointer" : "not-allowed", opacity: canTrade ? 1 : 0.4, fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#fff" }}
            >
              견적 제출
            </button>
            <button type="button" onClick={onToggle} aria-label="펼치기" className="inline-flex items-center justify-center" style={{ width: "24px", height: "24px", border: "none", background: "none", cursor: "pointer", transform: open ? "rotate(180deg)" : "none" }}>
              <ChevronDownIcon />
            </button>
          </div>
        )}
      </div>

      {open && <ProductRequestDetail row={row} />}
    </div>
  );
}

function ProductRequestDetail({ row }: { row: ProductRequest }) {
  const rows: Array<[string, string]> = [
    ["소속 기관명", row.detail.orgName],
    ["소속 부서", row.detail.department],
    ["이메일", row.detail.email],
    ["연락처", row.detail.phone],
    ["요청 수량", row.detail.reqQty],
    ["납품 희망일", row.detail.desiredDate],
    ["납품 주소", row.detail.address],
    ["요청사항", row.detail.note],
  ];
  return (
    <div style={{ background: "#F9FAFB", borderTop: "1px solid #F3F4F6", padding: "19.52px 24.4px 24.4px" }}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex" style={{ paddingTop: label === "소속 기관명" ? 0 : "9.76px" }}>
          <span style={{ width: "98px", flexShrink: 0, fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", paddingTop: "2.44px" }}>{label}</span>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#1F2937" }}>{value}</span>
        </div>
      ))}
      <div style={{ paddingTop: "9.76px" }}>
        <p style={{ width: "98px", fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", margin: "2.44px 0 9.76px" }}>첨부파일</p>
        {row.detail.attachmentUrl ? (
          <a href={row.detail.attachmentUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center justify-between" style={{ gap: "9.76px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "10.76px 15.64px", textDecoration: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#374151" }}>{row.detail.attachment}</span>
            <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#1E3A5F", whiteSpace: "nowrap" }}>다운로드</span>
          </a>
        ) : (
          <div className="flex items-center" style={{ gap: "9.76px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "10.76px 15.64px" }}>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#374151" }}>{row.detail.attachment}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementTab({ announcements, proposals, subTab, setSubTab, onSubmit, canTrade }: { announcements: AnnouncementRow[]; proposals: Proposal[]; subTab: SubTab; setSubTab: (v: SubTab) => void; onSubmit: (r: AnnouncementRow) => void; canTrade: boolean }) {
  const [page, setPage] = useState(1);

  return (
    <>
      <div className="flex" style={{ borderBottom: "1px solid rgba(210,210,215,0.2)", marginBottom: "24.4px" }}>
        <button
          type="button"
          onClick={() => setSubTab("list")}
          className="inline-flex items-center justify-center"
          style={{ gap: "7.32px", padding: "12.2px 19.52px 14.2px", border: "none", background: "none", cursor: "pointer", borderBottom: subTab === "list" ? `2px solid ${NAVY}` : "2px solid transparent", marginBottom: "-1px" }}
        >
          <SearchIcon color={subTab === "list" ? NAVY : "rgba(29,29,31,0.4)"} />
          <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: subTab === "list" ? NAVY : "rgba(29,29,31,0.4)" }}>공고 목록</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab("proposals")}
          className="inline-flex items-center justify-center"
          style={{ gap: "7.32px", padding: "12.2px 19.52px 14.2px", border: "none", background: "none", cursor: "pointer", borderBottom: subTab === "proposals" ? `2px solid ${NAVY}` : "2px solid transparent", marginBottom: "-1px" }}
        >
          <SearchIcon color={subTab === "proposals" ? NAVY : "rgba(29,29,31,0.4)"} />
          <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: subTab === "proposals" ? NAVY : "rgba(29,29,31,0.4)" }}>내 제안 현황</span>
          <span className="inline-flex items-center justify-center" style={{ borderRadius: "9999px", background: "rgba(29,29,31,0.1)", padding: "2.44px 7.32px", fontSize: "10px", fontWeight: 600, lineHeight: "18px", letterSpacing: "-0.15px", color: "rgba(29,29,31,0.5)" }}>{proposals.length}</span>
        </button>
      </div>

      {subTab === "list" ? (
        <AnnouncementList rows={announcements} page={page} setPage={setPage} onSubmit={onSubmit} canTrade={canTrade} />
      ) : (
        <ProposalStatus proposals={proposals} />
      )}
    </>
  );
}

const AN_GRID = "465px 185px 157px 105px 74px 141px";

const PAGE_SIZE = 10;

function AnnouncementList({ rows, page, setPage, onSubmit, canTrade }: { rows: AnnouncementRow[]; page: number; setPage: (n: number) => void; onSubmit: (r: AnnouncementRow) => void; canTrade: boolean }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  return (
    <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>
      <div style={{ padding: "14.64px 24.4px 15.64px", borderBottom: "1px solid #F3F4F6" }}>
        <p style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#374151", margin: 0 }}>카테고리 매칭 공고 목록</p>
      </div>
      <div className="grid" style={{ gridTemplateColumns: AN_GRID, background: "rgba(29,29,31,0.02)" }}>
        {["공고명", "요청 기관", "예산", "마감일", "제안", ""].map((h, i) => (
          <div key={i} style={{ padding: "14.64px 19.52px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "rgba(29,29,31,0.5)" }}>{h}</span>
          </div>
        ))}
      </div>
      {pageRows.map((r) => (
        <div key={r.id} className="grid items-center" style={{ gridTemplateColumns: AN_GRID, borderTop: "1px solid #F3F4F6" }}>
          <div style={{ padding: "14.64px 19.52px", minWidth: 0 }}>
            <p style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</p>
            <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#9CA3AF", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.items}</p>
          </div>
          <div style={{ padding: "14.64px 19.52px" }}>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#4B5563" }}>{r.org}</span>
          </div>
          <div style={{ padding: "14.64px 19.52px" }}>
            <span style={{ fontSize: "17.08px", fontWeight: 700, letterSpacing: "-0.2562px", lineHeight: "24.4px", color: "#111827" }}>{r.budget}</span>
          </div>
          <div style={{ padding: "14.64px 19.52px" }}>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#6B7280" }}>{r.deadline}</span>
          </div>
          <div style={{ padding: "14.64px 19.52px" }}>
            <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#6B7280" }}>{r.proposals}</span>
          </div>
          <div style={{ padding: "14.64px 19.52px" }}>
            <button
              type="button"
              disabled={!canTrade}
              onClick={() => { if (canTrade) onSubmit(r); }}
              style={{ borderRadius: "9.76px", background: NAVY, padding: "7.32px 14.64px", border: "none", cursor: canTrade ? "pointer" : "not-allowed", opacity: canTrade ? 1 : 0.4, fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2401px", lineHeight: "19.52px", color: "#fff" }}
            >
              견적 제출
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center" style={{ gap: "4.88px", padding: "19.52px 0", borderTop: "1px solid #F3F4F6" }}>
        <button type="button" aria-label="이전" onClick={() => setPage(Math.max(1, safePage - 1))} className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", background: "none", cursor: "pointer" }}>
          <PageArrowIcon dir="left" />
        </button>
        {pageNumbers.map((n) => (
          <button key={n} type="button" onClick={() => setPage(n)} className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", cursor: "pointer", background: safePage === n ? "#1F2937" : "transparent", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: safePage === n ? "#fff" : "#4B5563" }}>
            {n}
          </button>
        ))}
        <button type="button" aria-label="다음" onClick={() => setPage(Math.min(totalPages, safePage + 1))} className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", background: "none", cursor: "pointer" }}>
          <PageArrowIcon dir="right" />
        </button>
      </div>
    </div>
  );
}

const PROPOSAL_PILL: Record<ProposalStatusKind, { bg: string; border: string; color: string }> = {
  접수: { bg: "transparent", border: "#E5E7EB", color: "#6B7280" },
  검토중: { bg: "transparent", border: "#9CA3AF", color: "#374151" },
  탈락: { bg: "transparent", border: "#FECACA", color: "#EF4444" },
  선정: { bg: "rgba(30,58,95,0.05)", border: NAVY, color: NAVY },
};

function ProposalStatus({ proposals }: { proposals: Proposal[] }) {
  const router = useRouter();
  const [detailFor, setDetailFor] = useState<Proposal | null>(null);
  return (
    <>
      <div className="flex flex-col" style={{ gap: "14.64px" }}>
        {proposals.map((p) => (
          <ProposalCard key={p.id} p={p} onView={() => setDetailFor(p)} onChat={() => router.push(`/partner/quotes/chat?request=${p.quoteRequestId}`)} />
        ))}
      </div>
      {detailFor && <ProposalDetailModal proposal={detailFor} onClose={() => setDetailFor(null)} onChat={() => router.push(`/partner/quotes/chat?request=${detailFor.quoteRequestId}`)} />}
    </>
  );
}

function ProposalCard({ p, onView, onChat }: { p: Proposal; onView: () => void; onChat: () => void }) {
  const pill = PROPOSAL_PILL[p.statusKind];
  return (
    <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", padding: "25.4px" }}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center" style={{ gap: "9.76px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F" }}>{p.title}</span>
            <span style={{ borderRadius: "9999px", border: `1px solid ${pill.border}`, background: pill.bg, padding: "3.44px 10.76px", fontSize: "10px", fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.15px", color: pill.color }}>{p.statusKind}</span>
          </div>
          <div className="flex items-center" style={{ gap: "19.52px", marginTop: "2.44px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>{p.org}</span>
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>마감: {p.deadline}</span>
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>제출일: {p.submittedAt}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.24px", lineHeight: "28.8px", color: "#1D1D1F", margin: 0 }}>{p.amount}</p>
          <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>제안 금액</p>
        </div>
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: "20.52px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
        <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>규격: {p.spec}</span>
        <div className="flex items-center" style={{ gap: "9.76px", flexShrink: 0 }}>
          <button type="button" onClick={onView} style={{ borderRadius: "9.76px", border: "1px solid rgba(210,210,215,0.3)", background: "none", padding: "8.32px 15.64px", cursor: "pointer", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "21px", color: "rgba(29,29,31,0.6)" }}>제출 견적서 확인</button>
          <button type="button" onClick={onChat} style={{ borderRadius: "9.76px", background: NAVY, border: "none", padding: "7.32px 14.64px", cursor: "pointer", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "21px", color: "#fff" }}>대화하기</button>
        </div>
      </div>
    </div>
  );
}
