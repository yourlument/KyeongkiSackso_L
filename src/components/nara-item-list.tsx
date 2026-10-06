"use client";

import type { NaraSearchResult } from "@/lib/nara";

const ROW: React.CSSProperties = {
  padding: "12.2px 14.64px 13.2px",
  border: "none",
  background: "#fff",
  gap: "12px",
};

function NaraItemRow({ item, onPick }: { item: NaraSearchResult; onPick?: (r: NaraSearchResult) => void }) {
  const body = (
    <>
      <span className="min-w-0">
        <span className="block" style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827" }}>{item.name}</span>
      </span>
      <span className="shrink-0 text-right">
        {item.classNo && <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{`분류번호 ${item.classNo}`}</span>}
      </span>
    </>
  );

  if (!onPick) {
    return (
      <div className="flex w-full items-start justify-between text-left" style={ROW}>
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPick(item)}
      className="flex w-full items-start justify-between text-left"
      style={{ ...ROW, cursor: "pointer" }}
    >
      {body}
    </button>
  );
}

export function NaraItemList({
  results,
  loading,
  onPick,
  floating = false,
}: {
  results: NaraSearchResult[];
  loading: boolean;
  onPick?: (r: NaraSearchResult) => void;
  floating?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: "9.76px",
        border: "1px solid #E5E7EB",
        background: "#fff",
        overflow: "hidden",
        ...(floating ? { boxShadow: "0 10px 30px rgba(0,0,0,0.12)" } : null),
      }}
    >
      <div style={{ padding: "9.76px 14.64px 10.76px", background: "#F9FAFB" }}>
        <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>
          {loading ? "조달청 나라장터 검색 중..." : `조달청 나라장터 검색 결과 (${results.length}건)`}
        </span>
      </div>
      <div style={floating ? { maxHeight: "280px", overflowY: "auto" } : undefined}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ gap: "8px", padding: "24px 14.64px" }}>
            <span className="animate-spin" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #E5E7EB", borderTopColor: "#6B7280", borderRadius: "9999px" }} />
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "18px", color: "#6B7280" }}>검색 중입니다 (최대 30초 소요)</span>
          </div>
        ) : (
          results.map((r) => <NaraItemRow key={r.classNo ?? r.name} item={r} onPick={onPick} />)
        )}
      </div>
    </div>
  );
}
