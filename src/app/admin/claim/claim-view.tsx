"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminClaimData, Claim, ClaimType, ClaimStatus, ClaimPriority as Priority } from "@/lib/admin-claim";

const STATUS_BADGE: Record<ClaimStatus, { bg: string; border: string; color: string }> = {
  접수: { bg: "#F3F4F6", border: "#D1D5DB", color: "#374151" },
  처리중: { bg: "#E5E7EB", border: "#D1D5DB", color: "#1F2937" },
  완료: { bg: "#111827", border: "#E5E7EB", color: "#FFFFFF" },
  반려: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
};

const PRIORITY_BADGE: Record<Priority, { bg: string; border: string; color: string }> = {
  긴급: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626" },
  높음: { bg: "#FFFBEB", border: "#FDE68A", color: "#B45309" },
  보통: { bg: "#F3F4F6", border: "#D1D5DB", color: "#374151" },
  낮음: { bg: "#F9FAFB", border: "#E5E7EB", color: "#6B7280" },
};

const PAGE_SIZE = 15;

const TYPE_FILTERS = ["전체 유형", "신고", "문의"] as const;
const STATUS_FILTERS = ["전체 상태", "접수", "처리중", "완료", "반려"] as const;
const CATEGORY_FILTERS = [
  "전체",
  "견적문의",
  "결제문의",
  "입점신청",
  "구독문의",
  "시스템오류",
  "허위상품",
  "부정거래",
  "악성유저",
] as const;

const KPI_META = [
  { icon: "kpi1" as const, accent: false },
  { icon: "kpi2" as const, accent: false },
  { icon: "kpi3" as const, accent: false },
];

function KpiIcon({ kind }: { kind: "kpi1" | "kpi2" | "kpi3" | "kpi4" }) {
  const fill = kind === "kpi4" ? "#EF4444" : "#1D1D1F";
  const op = kind === "kpi4" ? 1 : 0.4;
  const paths: Record<string, string> = {
    kpi1: "M15.4792 2.1919C15.6808 2.1919 15.8512 2.26246 15.9904 2.40359C16.1296 2.54471 16.1992 2.71747 16.1992 2.92186V14.6013C16.1992 14.8057 16.1296 14.9784 15.9904 15.1196C15.8512 15.2607 15.6808 15.3313 15.4792 15.3313H2.5192C2.3176 15.3313 2.1472 15.2607 2.008 15.1196C1.8688 14.9784 1.7992 14.8057 1.7992 14.6013V2.92186C1.7992 2.71747 1.8688 2.54471 2.008 2.40359C2.1472 2.26246 2.3176 2.1919 2.5192 2.1919H15.4792ZM5.7016 10.2215H3.2392V13.8713H14.7592V10.2215H12.2968C12.0184 10.8736 11.5816 11.4016 10.9864 11.8055C10.3912 12.2094 9.7288 12.4114 8.9992 12.4114C8.2696 12.4114 7.6072 12.2094 7.012 11.8055C6.4168 11.4016 5.98 10.8736 5.7016 10.2215ZM14.7592 3.65183H3.2392V8.76158H6.8392C6.8392 9.16062 6.9352 9.52804 7.1272 9.86382C7.3192 10.1996 7.5808 10.4648 7.912 10.6595C8.2432 10.8541 8.6056 10.9515 8.9992 10.9515C9.3928 10.9515 9.7552 10.8541 10.0864 10.6595C10.4176 10.4648 10.6792 10.1996 10.8712 9.86382C11.0632 9.52804 11.1592 9.16062 11.1592 8.76158H14.7592V3.65183Z",
    kpi2: "M13.5797 4.119L12.5573 5.15555C12.0965 4.67864 11.5637 4.31366 10.9589 4.06061C10.3349 3.78808 9.68208 3.65183 9.00048 3.65183C8.08848 3.65183 7.23888 3.88541 6.45168 4.35259C5.69328 4.8003 5.09328 5.40861 4.65168 6.1775C4.19088 6.9756 3.96048 7.83695 3.96048 8.76158C3.96048 9.6862 4.19088 10.5476 4.65168 11.3457C5.09328 12.1145 5.69328 12.7228 6.45168 13.1706C7.23888 13.6377 8.08848 13.8713 9.00048 13.8713C9.91248 13.8713 10.7621 13.6377 11.5493 13.1706C12.3077 12.7228 12.9077 12.1145 13.3493 11.3457C13.8101 10.5476 14.0405 9.6862 14.0405 8.76158H15.4805C15.4805 9.94898 15.1877 11.0537 14.6021 12.0756C14.0261 13.0684 13.2485 13.8567 12.2693 14.4407C11.2613 15.0344 10.1717 15.3313 9.00048 15.3313C7.82928 15.3313 6.73968 15.0344 5.73168 14.4407C4.75248 13.8567 3.97488 13.0684 3.39888 12.0756C2.81328 11.0537 2.52048 9.94898 2.52048 8.76158C2.52048 7.57417 2.81328 6.46949 3.39888 5.44754C3.97488 4.45479 4.75248 3.66642 5.73168 3.08245C6.73968 2.48875 7.82928 2.1919 9.00048 2.1919C9.88368 2.1919 10.7237 2.36222 11.5205 2.70287C12.2981 3.04352 12.9845 3.51557 13.5797 4.119Z",
    kpi3: "M8.756 10.0603L9.764 11.0823L15.8696 4.90679L16.8776 5.94334L9.764 13.1554L5.1848 8.49821L6.2072 7.47626L8.756 10.0603ZM8.756 7.98724L12.3128 4.36662L13.3352 5.40317L9.764 9.02379L8.756 7.98724ZM6.7256 12.1188L5.7032 13.1554L1.124 8.49821L2.132 7.47626L3.1544 8.49821L6.7256 12.1188Z",
    kpi4: "M9.0004 16.6012C9.9796 16.611 10.8868 16.3628 11.722 15.8567C12.538 15.3798 13.186 14.7277 13.666 13.9004C14.1556 13.0439 14.4004 12.1193 14.4004 11.1265C14.4004 10.6301 14.2804 10.0316 14.0404 9.33079C12.8404 10.5279 11.9284 11.1314 11.3044 11.1411C12.0148 9.87583 12.466 8.76142 12.658 7.79787C12.8404 6.85378 12.7828 5.98756 12.4852 5.19919C12.2164 4.46923 11.7124 3.74413 10.9732 3.0239C10.3492 2.41073 9.4516 1.7051 8.2804 0.907003C8.3764 1.90949 8.2756 2.83411 7.978 3.68087C7.7476 4.35244 7.3828 4.98994 6.8836 5.59338C6.6052 5.93402 6.1924 6.34767 5.6452 6.83431L5.2996 7.1409C4.762 7.65674 4.3492 8.25045 4.0612 8.92201C3.754 9.62278 3.6004 10.3576 3.6004 11.1265C3.6004 12.1193 3.8452 13.0439 4.3348 13.9004C4.8148 14.7277 5.4628 15.3798 6.2788 15.8567C7.114 16.3531 8.0212 16.6012 9.0004 16.6012ZM9.5044 3.63707C10.2916 4.31837 10.8196 4.96804 11.0884 5.58608C11.3572 6.20411 11.4052 6.90244 11.2324 7.68107C11.0692 8.4013 10.6756 9.31133 10.0516 10.4111C9.8788 10.7226 9.8236 11.0511 9.886 11.3966C9.9484 11.7421 10.1116 12.0292 10.3756 12.258C10.6396 12.4867 10.9492 12.601 11.3044 12.601C11.7844 12.5913 12.2932 12.4453 12.8308 12.1631C12.6868 12.7276 12.4276 13.2385 12.0532 13.696C11.6788 14.1534 11.2276 14.5087 10.6996 14.7617C10.1716 15.0148 9.6052 15.1413 9.0004 15.1413C8.2804 15.1413 7.618 14.9637 7.0132 14.6084C6.4084 14.2532 5.9284 13.7665 5.5732 13.1485C5.218 12.5305 5.0404 11.8565 5.0404 11.1265C5.0404 10.5717 5.1484 10.0413 5.3644 9.53518C5.5804 9.02907 5.89 8.58623 6.2932 8.20665L6.8548 7.69567C7.1716 7.41342 7.4404 7.14577 7.6612 6.89271C8.5828 5.89996 9.1972 4.81475 9.5044 3.63707Z",
  };
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={paths[kind]} fill={fill} fillOpacity={op} />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.2338 12.016L16.3154 15.1402L15.293 16.1768L12.2114 13.0525C11.645 13.51 11.0258 13.8603 10.3538 14.1037C9.6434 14.3567 8.9138 14.4832 8.165 14.4832C6.9938 14.4832 5.9042 14.1864 4.8962 13.5927C3.917 13.0087 3.1442 12.2204 2.5778 11.2276C1.9826 10.2056 1.685 9.10097 1.685 7.91356C1.685 6.72615 1.9826 5.62147 2.5778 4.59952C3.1442 3.60677 3.917 2.82328 4.8962 2.24904C5.9042 1.6456 6.9938 1.34388 8.165 1.34388C9.3362 1.34388 10.4258 1.6456 11.4338 2.24904C12.413 2.82328 13.1906 3.60677 13.7666 4.59952C14.3522 5.62147 14.645 6.72615 14.645 7.91356C14.645 8.67272 14.5202 9.41242 14.2706 10.1327C14.0306 10.814 13.685 11.4417 13.2338 12.016ZM11.7794 11.4758C12.2306 11.0086 12.581 10.4733 12.8306 9.86987C13.0802 9.24696 13.205 8.59486 13.205 7.91356C13.205 6.98894 12.9746 6.12758 12.5138 5.32949C12.0722 4.56059 11.4722 3.95229 10.7138 3.50458C9.9266 3.0374 9.077 2.80381 8.165 2.80381C7.253 2.80381 6.4034 3.0374 5.6162 3.50458C4.8578 3.95229 4.2578 4.56059 3.8162 5.32949C3.3554 6.12758 3.125 6.98894 3.125 7.91356C3.125 8.83818 3.3554 9.69954 3.8162 10.4976C4.2578 11.2665 4.8578 11.8748 5.6162 12.3225C6.4034 12.7897 7.253 13.0233 8.165 13.0233C8.837 13.0233 9.4802 12.8968 10.0946 12.6437C10.6898 12.3907 11.2178 12.0354 11.6786 11.578L11.7794 11.4758Z"
        fill="#1D1D1F"
        fillOpacity="0.3"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.16362 6.53141L8.59966 4.06141L9.29989 4.76141L6.16362 7.94141L3.02734 4.76141L3.72758 4.06141L6.16362 6.53141Z"
        fill="#1D1D1F"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.2725 8.81691L14.3321 4.70024L15.499 5.88357L11.4395 10.0002L15.499 14.1169L14.3321 15.3002L10.2725 11.1836L6.21296 15.3002L5.04604 14.1169L9.10562 10.0002L5.04604 5.88357L6.21296 4.70024L10.2725 8.81691Z"
        fill="#1D1D1F"
        fillOpacity="0.3"
      />
    </svg>
  );
}

function EmptyAnswerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.7992 6.57168C1.7992 5.77359 1.996 5.03389 2.3896 4.35259C2.7736 3.70049 3.2872 3.17978 3.9304 2.79047C4.6024 2.39142 5.332 2.1919 6.1192 2.1919H11.8792C12.6568 2.1919 13.3816 2.39142 14.0536 2.79047C14.7064 3.17978 15.2248 3.70536 15.6088 4.36719C16.0024 5.04849 16.1992 5.78332 16.1992 6.57168V15.3313H6.1192C5.3416 15.3313 4.6168 15.1317 3.9448 14.7327C3.292 14.3434 2.7736 13.8178 2.3896 13.156C1.996 12.4747 1.7992 11.7398 1.7992 10.9515V6.57168ZM14.7592 13.8713V6.57168C14.7592 6.04611 14.6296 5.55947 14.3704 5.11175C14.1112 4.66404 13.7608 4.30879 13.3192 4.04601C12.8776 3.78322 12.3976 3.65183 11.8792 3.65183H6.1192C5.6008 3.65183 5.1208 3.78322 4.6792 4.04601C4.2376 4.30879 3.8872 4.66161 3.628 5.10445C3.3688 5.5473 3.2392 6.03638 3.2392 6.57168V10.9515C3.2392 11.477 3.3688 11.9637 3.628 12.4114C3.8872 12.8591 4.2376 13.2144 4.6792 13.4771C5.1208 13.7399 5.6008 13.8713 6.1192 13.8713H14.7592ZM10.4392 8.03161H11.8792V9.49154H10.4392V8.03161ZM6.1192 8.03161H7.5592V9.49154H6.1192V8.03161Z"
        fill="#9CA3AF"
      />
    </svg>
  );
}

function Badge({
  text,
  bg,
  border,
  color,
}: {
  text: string;
  bg: string;
  border: string;
  color: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "9999px",
        height: "25px",
        padding: "0 13.2px",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "-0.165px",
        lineHeight: "19.8px",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function TypeBadge({ type }: { type: ClaimType }) {
  if (type === "신고") {
    return <Badge text="신고" bg="#FEF2F2" border="#FECACA" color="#DC2626" />;
  }
  return <Badge text="문의" bg="rgba(29,29,31,0.05)" border="rgba(210,210,215,0.2)" color="rgba(29,29,31,0.5)" />;
}

function Chip({
  label,
  active,
  size,
  onClick,
}: {
  label: string;
  active: boolean;
  size: "lg" | "md" | "sm";
  onClick: () => void;
}) {
  const pad = "0 15.64px";
  const fs = size === "sm" ? "11px" : "12px";
  const lh = size === "sm" ? "19.2px" : "21px";
  const height = size === "lg" ? "49px" : size === "md" ? "37.6px" : "31px";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        height,
        padding: pad,
        fontSize: fs,
        fontWeight: 500,
        letterSpacing: "-0.293px",
        lineHeight: lh,
        cursor: "pointer",
        whiteSpace: "nowrap",
        background: active ? "#1E3A5F" : "#FFFFFF",
        border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
        color: active ? "#FFFFFF" : "rgba(29,29,31,0.5)",
      }}
    >
      {label}
    </button>
  );
}

export function ClaimView({ data }: { data: AdminClaimData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>("전체 유형");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("전체 상태");
  const [categoryFilter, setCategoryFilter] = useState<(typeof CATEGORY_FILTERS)[number]>("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(data.claims[0]?.id ?? null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);

  const STATUS_OPTIONS: ClaimStatus[] = ["접수", "처리중", "완료", "반려"];

  async function changeStatus(claim: Claim, next: ClaimStatus) {
    setStatusMenuId(null);
    if (claim.status === next) return;
    const res = await fetch("/api/admin/claim/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: claim.id, type: claim.type, status: next }),
    });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  const rows = useMemo(() => {
    return data.claims.filter((c) => {
      if (typeFilter !== "전체 유형" && c.type !== typeFilter) return false;
      if (statusFilter !== "전체 상태" && c.status !== statusFilter) return false;
      if (categoryFilter !== "전체" && c.category !== categoryFilter) return false;
      if (query) {
        const q = query.trim();
        const hit =
          c.title.includes(q) || c.author.includes(q) || c.affiliation.includes(q) || (c.content ?? "").includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [data.claims, typeFilter, statusFilter, categoryFilter, query]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selected = useMemo(() => data.claims.find((c) => c.id === selectedId) ?? null, [data.claims, selectedId]);

  async function submitAnswer() {
    if (!selected || !answerDraft.trim()) return;
    const res = await fetch("/api/admin/claim/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, type: selected.type, answer: answerDraft.trim() }),
    });
    if (res.ok) {
      setAnswerDraft("");
      startTransition(() => router.refresh());
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "-0.504px",
            lineHeight: "22.5px",
            color: "#1D1D1F",
          }}
        >
          클레임 처리
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: "12px",
            fontWeight: 400,
            letterSpacing: "-0.18px",
            lineHeight: "21.6px",
            color: "rgba(29,29,31,0.4)",
          }}
        >
          신고/문의 접수 확인 및 답변 작성
        </p>
      </div>

      <div style={{ display: "flex", gap: "14.64px", marginBottom: "30px" }}>
        {data.kpis.map((k, i) => (
          <div
            key={k.label}
            style={{
              width: "261px",
              flexShrink: 0,
              background: "#FFFFFF",
              border: "1px solid rgba(210,210,215,0.2)",
              borderRadius: "14.64px",
              padding: "20.52px",
            }}
          >
            <div
              style={{
                width: "39px",
                height: "39px",
                borderRadius: "9.76px",
                background: KPI_META[i].accent ? "#FEF2F2" : "rgba(29,29,31,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <KpiIcon kind={KPI_META[i].icon} />
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "-0.33px",
                lineHeight: "22px",
                color: "#1D1D1F",
              }}
            >
              {k.value}
            </div>
            <div
              style={{
                marginTop: "7.32px",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "-0.165px",
                lineHeight: "19.8px",
                color: "rgba(29,29,31,0.4)",
              }}
            >
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(210,210,215,0.2)",
          borderRadius: "14.64px",
          padding: "20.52px",
          marginBottom: "19px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14.64px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: "15.64px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
              }}
            >
              <SearchIcon />
            </span>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="제목, 작성자, 소속, 내용 검색"
              style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid rgba(210,210,215,0.3)",
                borderRadius: "14.64px",
                padding: "13.19px 15.64px 13.19px 44.92px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "-0.293px",
                lineHeight: "22.8px",
                color: "#1D1D1F",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "9.76px" }}>
            {TYPE_FILTERS.map((t) => (
              <Chip key={t} label={t} active={typeFilter === t} size="lg" onClick={() => { setTypeFilter(t); setPage(1); }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "9.76px", marginTop: "14.64px" }}>
          {STATUS_FILTERS.map((s) => (
            <Chip key={s} label={s} active={statusFilter === s} size="md" onClick={() => { setStatusFilter(s); setPage(1); }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "9.76px", marginTop: "14.64px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "-0.18px",
              lineHeight: "21.6px",
              color: "rgba(29,29,31,0.4)",
              marginRight: "0",
            }}
          >
            카테고리:
          </span>
          {CATEGORY_FILTERS.map((c) => (
            <Chip key={c} label={c} active={categoryFilter === c} size="sm" onClick={() => { setCategoryFilter(c); setPage(1); }} />
          ))}
        </div>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "14.64px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "9.7%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "14.4%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "10.7%" }} />
            <col style={{ width: "9.7%" }} />
            <col style={{ width: "14.2%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
              {["유형", "제목", "작성자", "접수일", "상태", "우선순위", ""].map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "14.64px 24.4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0",
                    lineHeight: "19.8px",
                    color: "rgba(29,29,31,0.4)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((c) => {
              const isSel = c.id === selectedId;
              const sb = STATUS_BADGE[c.status];
              const pb = PRIORITY_BADGE[c.priority];
              return (
                <tr
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    setAnswerDraft("");
                  }}
                  style={{
                    background: isSel ? "rgba(30,58,95,0.02)" : "transparent",
                    borderTop: isSel ? "none" : "1px solid rgba(210,210,215,0.1)",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle" }}>
                    <TypeBadge type={c.type} />
                  </td>
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "-0.293px",
                        lineHeight: "23.4px",
                        color: "#1D1D1F",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.title}
                    </div>
                    <div
                      style={{
                        marginTop: "1px",
                        fontSize: "11px",
                        fontWeight: 400,
                        letterSpacing: "-0.165px",
                        lineHeight: "19.8px",
                        color: "rgba(29,29,31,0.4)",
                      }}
                    >
                      {c.category}
                    </div>
                  </td>
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "-0.293px",
                        lineHeight: "23.4px",
                        color: "#1D1D1F",
                      }}
                    >
                      {c.author}
                    </div>
                    <div
                      style={{
                        marginTop: "1px",
                        fontSize: "11px",
                        fontWeight: 400,
                        letterSpacing: "-0.165px",
                        lineHeight: "19.8px",
                        color: "rgba(29,29,31,0.4)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.affiliation}
                    </div>
                  </td>
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        letterSpacing: "0",
                        lineHeight: "21.6px",
                        color: "rgba(29,29,31,0.5)",
                      }}
                    >
                      {c.date}
                    </span>
                  </td>
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle" }}>
                    <Badge text={c.status} bg={sb.bg} border={sb.border} color={sb.color} />
                  </td>
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle" }}>
                    <Badge text={c.priority} bg={pb.bg} border={pb.border} color={pb.color} />
                  </td>
                  <td style={{ padding: "14.64px 24.4px", verticalAlign: "middle", position: "relative" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(c.id);
                        setStatusMenuId((prev) => (prev === c.id ? null : c.id));
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2.44px",
                        background: "#FFFFFF",
                        border: "1px solid rgba(210,210,215,0.2)",
                        borderRadius: "9.76px",
                        padding: "8.32px 13.2px",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          letterSpacing: "0",
                          lineHeight: "21.6px",
                          color: "rgba(29,29,31,0.5)",
                        }}
                      >
                        상태 변경
                      </span>
                      <ChevronDownIcon />
                    </button>
                    {statusMenuId === c.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "calc(100% - 4px)",
                          right: "24.4px",
                          zIndex: 10,
                          minWidth: "120px",
                          background: "#FFFFFF",
                          border: "1px solid rgba(210,210,215,0.3)",
                          borderRadius: "9.76px",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          padding: "4.88px",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              changeStatus(c, s);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              background: c.status === s ? "rgba(30,58,95,0.06)" : "transparent",
                              border: "none",
                              borderRadius: "7.32px",
                              padding: "8.32px 11.2px",
                              fontSize: "12px",
                              fontWeight: 500,
                              letterSpacing: "-0.18px",
                              lineHeight: "21.6px",
                              color: "#1D1D1F",
                              cursor: "pointer",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9.76px",
            padding: "19.52px 0",
          }}
        >
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => {
            const active = n === safePage;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                style={{
                  width: "39px",
                  height: "39px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9.76px",
                  border: active ? "none" : "1px solid rgba(210,210,215,0.3)",
                  background: active ? "#1E3A5F" : "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "17.08px",
                  fontWeight: 500,
                  letterSpacing: "0",
                  lineHeight: "24.4px",
                  color: active ? "#FFFFFF" : "#4B5563",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div
          style={{
            marginTop: "24.4px",
            background: "#FFFFFF",
            border: "1px solid rgba(210,210,215,0.2)",
            borderRadius: "14.64px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(210,210,215,0.1)",
              padding: "17.08px 24.4px 18.08px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14.64px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "-0.392px",
                  lineHeight: "17.5px",
                  color: "#1D1D1F",
                }}
              >
                {selected.title}
              </h2>
              <TypeBadge type={selected.type} />
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "9.76px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <CloseIcon />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "29.28px", padding: "24.4px" }}>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14.64px" }}>
                <Field label="작성자" value={selected.author} sub={selected.affiliation} />
                <Field label="연락처" value={selected.contact ?? "-"} sub={selected.email ?? ""} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14.64px", marginTop: "19.52px" }}>
                <Field label="카테고리" value={selected.category} />
                <Field label="접수일" value={selected.date} />
              </div>
              <div style={{ marginTop: "19.52px" }}>
                <FieldLabel style={{ letterSpacing: "0.5px", marginBottom: "9.76px" }}>내용</FieldLabel>
                <div
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "9.76px",
                    padding: "19.52px",
                    fontSize: "17.08px",
                    fontWeight: 400,
                    letterSpacing: "-0.256px",
                    lineHeight: "27.8px",
                    color: "#374151",
                  }}
                >
                  {selected.content ?? selected.title}
                </div>
              </div>
            </div>

            <div>
              {selected.answer ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 400,
                        letterSpacing: "0.5px",
                        lineHeight: "18px",
                        color: "#9CA3AF",
                      }}
                    >
                      답변
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 400,
                        letterSpacing: "-0.15px",
                        lineHeight: "18px",
                        color: "#9CA3AF",
                      }}
                    >
                      {selected.answer.author} · {selected.answer.date}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "14.64px",
                      background: "#ECFDF5",
                      border: "1px solid #D1FAE5",
                      borderRadius: "9.76px",
                      padding: "19.52px",
                      fontSize: "17.08px",
                      fontWeight: 400,
                      letterSpacing: "-0.256px",
                      lineHeight: "27.8px",
                      color: "#374151",
                    }}
                  >
                    {selected.answer.body}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px dashed #E5E7EB",
                    borderRadius: "9.76px",
                    padding: "40.04px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "9999px",
                      background: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "9.76px",
                    }}
                  >
                    <EmptyAnswerIcon />
                  </div>
                  <p
                    style={{
                      margin: "0 0 14.64px",
                      fontSize: "14.64px",
                      fontWeight: 400,
                      letterSpacing: "-0.22px",
                      lineHeight: "19.5px",
                      color: "#9CA3AF",
                    }}
                  >
                    아직 답변이 작성되지 않았습니다
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      answerRef.current?.focus();
                      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    style={{
                      background: "#111827",
                      borderRadius: "9.76px",
                      border: "none",
                      padding: "9.76px 19.52px",
                      fontSize: "14.64px",
                      fontWeight: 600,
                      letterSpacing: "-0.293px",
                      lineHeight: "19.5px",
                      color: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    답변 작성
                  </button>
                </div>
              )}

              {!selected.answer && (
                <div style={{ marginTop: "19.52px", paddingTop: "9.76px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14.64px",
                      fontWeight: 600,
                      letterSpacing: "-0.22px",
                      lineHeight: "19.5px",
                      color: "#374151",
                    }}
                  >
                    답변 내용
                  </label>
                  <textarea
                    ref={answerRef}
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    placeholder="답변 내용을 입력하세요..."
                    style={{
                      width: "100%",
                      height: "148px",
                      marginTop: "14.64px",
                      resize: "none",
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "9.76px",
                      padding: "13.2px 15.64px",
                      fontSize: "17.08px",
                      fontWeight: 400,
                      letterSpacing: "-0.293px",
                      lineHeight: "24.4px",
                      color: "#111827",
                      outline: "none",
                    }}
                  />
                  <div style={{ display: "flex", gap: "9.76px", marginTop: "14.64px" }}>
                    <button
                      type="button"
                      onClick={() => setAnswerDraft("")}
                      style={{
                        flex: 1,
                        height: "50px",
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "9.76px",
                        fontSize: "17.08px",
                        fontWeight: 400,
                        letterSpacing: "-0.293px",
                        lineHeight: "24.4px",
                        color: "#4B5563",
                        cursor: "pointer",
                      }}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={!answerDraft.trim()}
                      onClick={submitAnswer}
                      style={{
                        flex: 1,
                        height: "50px",
                        background: answerDraft.trim() ? "#111827" : "#A0A3A9",
                        border: "none",
                        borderRadius: "9.76px",
                        fontSize: "17.08px",
                        fontWeight: 600,
                        letterSpacing: "-0.293px",
                        lineHeight: "24.4px",
                        color: answerDraft.trim() ? "#FFFFFF" : "rgba(255,255,255,0.16)",
                        cursor: answerDraft.trim() ? "pointer" : "default",
                      }}
                    >
                      답변 등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: "10px",
        fontWeight: 400,
        letterSpacing: "-0.15px",
        lineHeight: "18px",
        color: "#9CA3AF",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <FieldLabel style={{ marginBottom: "4.88px" }}>{label}</FieldLabel>
      <p
        style={{
          margin: 0,
          fontSize: "14.64px",
          fontWeight: 400,
          letterSpacing: "-0.22px",
          lineHeight: "19.5px",
          color: "#111827",
        }}
      >
        {value}
      </p>
      {sub ? (
        <p
          style={{
            margin: 0,
            fontSize: "10px",
            fontWeight: 400,
            letterSpacing: "-0.15px",
            lineHeight: "18px",
            color: "#9CA3AF",
          }}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}
