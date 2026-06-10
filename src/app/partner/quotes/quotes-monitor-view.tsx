"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PRODUCT_REQUESTS,
  REQUEST_STATS,
  ANNOUNCEMENTS,
  PROPOSALS,
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

const NAVY = "#1E3A5F";

type MainTab = "product" | "announcement";
type SubTab = "list" | "proposals";

export function QuotesMonitorView() {
  const [mainTab, setMainTab] = useState<MainTab>("product");
  const [subTab, setSubTab] = useState<SubTab>("list");
  const [openReq, setOpenReq] = useState<string | null>(null);
  const [submitAnnouncement, setSubmitAnnouncement] = useState<AnnouncementRow | null>(null);
  const [submitProduct, setSubmitProduct] = useState<ProductRequest | null>(null);

  return (
    <>

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
        <ProductTab openReq={openReq} setOpenReq={setOpenReq} onSubmit={setSubmitProduct} />
      ) : (
        <AnnouncementTab subTab={subTab} setSubTab={setSubTab} onSubmit={setSubmitAnnouncement} />
      )}

      {submitAnnouncement && (
        <QuoteSubmitModal target={{ kind: "announcement", row: submitAnnouncement }} onClose={() => setSubmitAnnouncement(null)} />
      )}
      {submitProduct && (
        <QuoteSubmitModal target={{ kind: "product", row: submitProduct }} onClose={() => setSubmitProduct(null)} />
      )}
    </>
  );
}

function ProductTab({ openReq, setOpenReq, onSubmit }: { openReq: string | null; setOpenReq: (v: string | null) => void; onSubmit: (r: ProductRequest) => void }) {
  return (
    <>

      <div className="flex" style={{ gap: "19.52px", paddingBottom: "29.28px" }}>
        {REQUEST_STATS.map((s) => (
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
        {PRODUCT_REQUESTS.map((r, i) => (
          <ProductRow
            key={r.id}
            row={r}
            last={i === PRODUCT_REQUESTS.length - 1}
            open={openReq === r.id}
            onToggle={() => setOpenReq(openReq === r.id ? null : r.id)}
            onSubmit={() => onSubmit(r)}
          />
        ))}
      </div>
    </>
  );
}

function ProductRow({ row, last, open, onToggle, onSubmit }: { row: ProductRequest; last: boolean; open: boolean; onToggle: () => void; onSubmit: () => void }) {
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
            <button type="button" onClick={onSubmit} style={{ borderRadius: "9.76px", background: NAVY, padding: "7.32px 14.64px", border: "none", cursor: "pointer", fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#fff" }}>
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
        <div className="flex items-center" style={{ gap: "9.76px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "10.76px 15.64px" }}>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#374151" }}>{row.detail.attachment}</span>
        </div>
      </div>
    </div>
  );
}

function AnnouncementTab({ subTab, setSubTab, onSubmit }: { subTab: SubTab; setSubTab: (v: SubTab) => void; onSubmit: (r: AnnouncementRow) => void }) {
  const [page, setPage] = useState(1);
  const visible = useMemo(() => ANNOUNCEMENTS, []);
  void page;

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
          <span className="inline-flex items-center justify-center" style={{ borderRadius: "9999px", background: "rgba(29,29,31,0.1)", padding: "2.44px 7.32px", fontSize: "10px", fontWeight: 600, lineHeight: "18px", letterSpacing: "-0.15px", color: "rgba(29,29,31,0.5)" }}>5</span>
        </button>
      </div>

      {subTab === "list" ? (
        <AnnouncementList rows={visible} page={page} setPage={setPage} onSubmit={onSubmit} />
      ) : (
        <ProposalStatus />
      )}
    </>
  );
}

const AN_GRID = "465px 185px 157px 105px 74px 141px";

function AnnouncementList({ rows, page, setPage, onSubmit }: { rows: AnnouncementRow[]; page: number; setPage: (n: number) => void; onSubmit: (r: AnnouncementRow) => void }) {
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

      {rows.map((r, i) => (
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
            <button type="button" onClick={() => onSubmit(r)} style={{ borderRadius: "9.76px", background: NAVY, padding: "7.32px 14.64px", border: "none", cursor: "pointer", fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2401px", lineHeight: "19.52px", color: "#fff" }}>
              견적 제출
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-center" style={{ gap: "4.88px", padding: "19.52px 0", borderTop: "1px solid #F3F4F6" }}>
        <button type="button" aria-label="이전" onClick={() => setPage(Math.max(1, page - 1))} className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", background: "none", cursor: "pointer" }}>
          <PageArrowIcon dir="left" />
        </button>
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" onClick={() => setPage(n)} className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", cursor: "pointer", background: page === n ? "#1F2937" : "transparent", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: page === n ? "#fff" : "#4B5563" }}>
            {n}
          </button>
        ))}
        <button type="button" aria-label="다음" onClick={() => setPage(Math.min(3, page + 1))} className="inline-flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", border: "none", background: "none", cursor: "pointer" }}>
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

function ProposalStatus() {
  const router = useRouter();
  const [detailFor, setDetailFor] = useState<Proposal | null>(null);
  return (
    <>
      <div className="flex flex-col" style={{ gap: "14.64px" }}>
        {PROPOSALS.map((p) => (
          <ProposalCard key={p.id} p={p} onView={() => setDetailFor(p)} onChat={() => router.push("/partner/quotes/chat")} />
        ))}
      </div>
      {detailFor && <ProposalDetailModal proposal={detailFor} onClose={() => setDetailFor(null)} onChat={() => router.push("/partner/quotes/chat")} />}
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
