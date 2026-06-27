"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  productId: string;
  npsCode: string | null;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string | null;
  supplierCompanyName: string;
};

type PayMethod = "card" | "virtual";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export function CartView() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [pay, setPay] = useState<PayMethod>("card");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  async function changeQty(id: string, next: number) {
    if (next < 1 || busy) return;
    setItems((prev) => prev?.map((it) => (it.id === id ? { ...it, quantity: next } : it)) ?? prev);
    setBusy(id);
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: next }),
    }).catch(() => {});
    setBusy(null);
  }

  async function remove(id: string) {
    if (busy) return;
    setBusy(id);
    await fetch(`/api/cart/${id}`, { method: "DELETE" }).catch(() => {});
    setItems((prev) => prev?.filter((it) => it.id !== id) ?? prev);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:changed"));
    setBusy(null);
  }

  if (items === null) {
    return <div style={{ padding: "80px 0", textAlign: "center", color: "rgba(29,29,31,0.4)", fontSize: "14px" }}>불러오는 중…</div>;
  }

  const productTotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const shipping = 0;
  const total = productTotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: "100px 0", gap: "12px" }}>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#1D1D1F", margin: 0 }}>장바구니가 비어 있습니다</p>
        <p style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.5)", margin: 0 }}>물품을 검색해 장바구니에 담아보세요.</p>
        <button
          type="button"
          onClick={() => router.push("/search")}
          style={{ marginTop: "8px", padding: "12.2px 29.28px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
        >
          물품 검색하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24.4px] lg:flex-row" style={{ marginTop: "29.28px" }}>
      <div className="flex flex-1 flex-col gap-[19.52px]">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex"
            style={{ gap: "19.52px", borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.15)", padding: "25.4px" }}
          >
            <div style={{ width: "117px", height: "117px", borderRadius: "14.64px", background: "rgba(29,29,31,0.05)", flexShrink: 0, overflow: "hidden" }}>
              {it.image && (
                <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div className="flex flex-1 flex-col" style={{ minWidth: 0 }}>
              <div className="flex items-start justify-between" style={{ gap: "12px" }}>
                <div style={{ minWidth: 0 }}>
                  {it.npsCode && (
                    <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0 }}>{it.npsCode}</p>
                  )}
                  <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: "22px", letterSpacing: "-0.21px", color: "#1D1D1F", margin: "2px 0 0" }}>{it.name}</p>
                  <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", margin: "2px 0 0" }}>{it.supplierCompanyName}</p>
                </div>
                <button type="button" aria-label="삭제" onClick={() => remove(it.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0, lineHeight: 0 }}>
                  <XIcon />
                </button>
              </div>
              <div className="mt-auto flex items-end justify-between" style={{ paddingTop: "16px" }}>
                <div className="flex items-center" style={{ width: "129px", height: "41px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)" }}>
                  <button type="button" aria-label="수량 감소" onClick={() => changeQty(it.id, it.quantity - 1)} className="flex flex-1 items-center justify-center" style={{ height: "100%", background: "none", border: "none", cursor: "pointer" }}>
                    <MinusIcon />
                  </button>
                  <span style={{ minWidth: "40px", textAlign: "center", fontSize: "13px", fontWeight: 500, color: "#1D1D1F" }}>{it.quantity}</span>
                  <button type="button" aria-label="수량 증가" onClick={() => changeQty(it.id, it.quantity + 1)} className="flex flex-1 items-center justify-center" style={{ height: "100%", background: "none", border: "none", cursor: "pointer" }}>
                    <PlusIcon />
                  </button>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", color: "#1D1D1F" }}>{won(it.price * it.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col gap-[19.52px] lg:w-[364px]" style={{ flexShrink: 0 }}>
        <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.15)", padding: "25.4px" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", color: "#1D1D1F", margin: "0 0 19.52px" }}>결제 정보</p>
          <SummaryRow label="상품 금액" value={won(productTotal)} />
          <SummaryRow label="배송비" value={won(shipping)} />
          <div style={{ margin: "15.64px 0", borderTop: "1px solid rgba(210,210,215,0.2)" }} />
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", color: "#1D1D1F" }}>총 결제 금액</span>
            <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", color: "#1D1D1F" }}>{won(total)}</span>
          </div>
        </div>

        <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.15)", padding: "25.4px" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", color: "#1D1D1F", margin: "0 0 14.64px" }}>결제 수단</p>
          <button type="button" onClick={() => setPay("card")} className="flex w-full items-center" style={payOption(pay === "card")}>
            <CardIcon active={pay === "card"} />
            <span style={{ marginLeft: "9.76px", fontSize: "13px", fontWeight: pay === "card" ? 500 : 400, color: pay === "card" ? "#1E3A5F" : "rgba(29,29,31,0.6)" }}>법인/신용카드</span>
          </button>
          <div style={{ height: "9.76px" }} />
          <button type="button" onClick={() => setPay("virtual")} className="flex w-full items-center" style={payOption(pay === "virtual")}>
            <BankIcon active={pay === "virtual"} />
            <span style={{ marginLeft: "9.76px", fontSize: "13px", fontWeight: pay === "virtual" ? 500 : 400, color: pay === "virtual" ? "#1E3A5F" : "rgba(29,29,31,0.6)" }}>가상계좌</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/checkout?pay=${pay}`)}
          className="flex items-center justify-center"
          style={{ height: "59px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", cursor: "pointer" }}
        >
          다음 단계 →
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
      <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)" }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", color: "#1D1D1F" }}>{value}</span>
    </div>
  );
}

function payOption(active: boolean): React.CSSProperties {
  return {
    borderRadius: "14.64px",
    padding: "15.6px 20.52px",
    background: active ? "rgba(30,58,95,0.05)" : "#fff",
    border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)",
    cursor: "pointer",
  };
}

function XIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(29,29,31,0.4)" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function MinusIcon() {
  return <svg width={12} height={2} viewBox="0 0 12 2" fill="none" aria-hidden><rect width={12} height={1.6} y={0.2} rx={0.8} fill="rgba(29,29,31,0.5)" /></svg>;
}
function PlusIcon() {
  return <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden><path d="M5.2 0h1.6v5.2H12v1.6H6.8V12H5.2V6.8H0V5.2h5.2V0z" fill="rgba(29,29,31,0.5)" /></svg>;
}
function CardIcon({ active }: { active: boolean }) {
  const c = active ? "#1E3A5F" : "rgba(29,29,31,0.5)";
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function BankIcon({ active }: { active: boolean }) {
  const c = active ? "#1E3A5F" : "rgba(29,29,31,0.5)";
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M9 10v11M15 10v11" />
    </svg>
  );
}
