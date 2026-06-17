"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { embedPostcode, type DaumPostcodeResult } from "@/lib/daum-postcode";

type CartItem = {
  id: string; productId: string; npsCode: string | null; name: string;
  price: number; unit: string; quantity: number; image: string | null; supplierCompanyName: string;
};
type PayMethod = "card" | "virtual";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const CARD: React.CSSProperties = { borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.15)", padding: "25.4px" };
const INPUT: React.CSSProperties = { width: "100%", boxSizing: "border-box", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", padding: "15.625px 20.52px", height: "54px", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.293px", color: "#1D1D1F", outline: "none" };
const LABEL: React.CSSProperties = { fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.6)", display: "block", marginBottom: "7.32px" };
const IN_CLS = "placeholder:text-[#1d1d1f]/30";

export function CheckoutView() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [pay, setPay] = useState<PayMethod>("card");
  const [f, setF] = useState({ name: "", phone: "", org: "", dept: "", addr: "", memo: "" });
  const [submitting, setSubmitting] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  const productTotal = (items ?? []).reduce((s, it) => s + it.price * it.quantity, 0);
  const canPay = f.name.trim() && f.phone.trim() && f.org.trim() && f.dept.trim() && f.addr.trim() && (items?.length ?? 0) > 0 && !submitting;

  function onAddrSelect(data: DaumPostcodeResult) {
    setF((p) => ({ ...p, addr: data.roadAddress + (data.buildingName ? ` (${data.buildingName})` : "") }));
    setAddrOpen(false);
  }

  async function submit() {
    if (!canPay) return;
    setSubmitting(true);
    try {
      const order = {
        id: `MOCK-${Date.now()}`,
        date: new Date().toISOString(),
        items: (items ?? []).map((it) => ({ name: it.name, supplier: it.supplierCompanyName, qty: it.quantity, price: it.price })),
        total: productTotal,
        pay,
        receiver: f.name,
        addr: f.addr,
        status: "결제완료",
      };
      try {
        const prev = JSON.parse(localStorage.getItem("korink_mock_orders") ?? "[]");
        localStorage.setItem("korink_mock_orders", JSON.stringify([order, ...prev]));
      } catch {  }
      await Promise.all((items ?? []).map((it) => fetch(`/api/cart/${it.id}`, { method: "DELETE" }).catch(() => {})));
      router.push("/orders?paid=1");
    } finally {
      setSubmitting(false);
    }
  }

  if (items === null) return <div style={{ padding: "80px 0", textAlign: "center", color: "rgba(29,29,31,0.4)", fontSize: "14px" }}>불러오는 중…</div>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: "100px 0", gap: "12px" }}>
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#1D1D1F", margin: 0 }}>결제할 상품이 없습니다</p>
        <button type="button" onClick={() => router.push("/cart")} style={{ marginTop: "8px", padding: "12.2px 29.28px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>장바구니로 가기</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24.4px] lg:flex-row" style={{ marginTop: "29.28px" }}>
      <div className="flex flex-1 flex-col gap-[24.4px]">
        <div style={CARD}>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", color: "#1D1D1F", margin: "0 0 19.52px" }}>주문 상품</p>
          <div className="flex flex-col gap-[19.52px]">
            {items.map((it) => (
              <div key={it.id} className="flex items-center" style={{ gap: "14.64px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "rgba(29,29,31,0.05)", flexShrink: 0, overflow: "hidden" }}>
                  {it.image &&  <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  {it.npsCode && <p style={{ fontSize: "11px", fontWeight: 400, color: "rgba(29,29,31,0.4)", margin: 0 }}>{it.npsCode}</p>}
                  <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", color: "#1D1D1F", margin: "1px 0 0" }}>{it.name}</p>
                  <p style={{ fontSize: "12px", fontWeight: 400, color: "rgba(29,29,31,0.4)", margin: "1px 0 0" }}>{it.supplierCompanyName}</p>
                  <p style={{ fontSize: "12px", fontWeight: 400, color: "rgba(29,29,31,0.5)", margin: "3px 0 0" }}>수량: {it.quantity}{it.unit}</p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", color: "#1D1D1F" }}>{won(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={CARD}>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", color: "#1D1D1F", margin: "0 0 19.52px" }}>배송 및 수령 정보</p>
          <div className="grid grid-cols-2" style={{ gap: "14.64px" }}>
            <div><label style={LABEL}>수령인/담당자 <Req /></label><input className={IN_CLS} style={INPUT} value={f.name} onChange={set("name")} placeholder="실명 입력" /></div>
            <div><label style={LABEL}>연락처 <Req /></label><input className={IN_CLS} style={INPUT} value={f.phone} onChange={set("phone")} placeholder="010-0000-0000" /></div>
          </div>
          <div className="grid grid-cols-2" style={{ gap: "14.64px", marginTop: "19.52px" }}>
            <div><label style={LABEL}>소속 기관 <Req /></label><input className={IN_CLS} style={INPUT} value={f.org} onChange={set("org")} placeholder="예: 화성시청" /></div>
            <div><label style={LABEL}>소속 부서 <Req /></label><input className={IN_CLS} style={INPUT} value={f.dept} onChange={set("dept")} placeholder="예: 도로관리과" /></div>
          </div>
          <div style={{ marginTop: "19.52px" }}>
            <label style={LABEL}>배송지 주소 <Req /></label>
            <div className="flex" style={{ gap: "9.76px" }}>
              <input className={IN_CLS} style={{ ...INPUT, flex: 1, minWidth: 0 }} value={f.addr} onChange={set("addr")} placeholder="주소 검색 버튼을 눌러 주소를 검색하세요" />
              <button type="button" onClick={() => setAddrOpen(true)} className="flex items-center justify-center" style={{ flexShrink: 0, padding: "0 20.52px", height: "54px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>주소 검색</button>
            </div>
          </div>
          <div style={{ marginTop: "19.52px" }}>
            <label style={LABEL}>배송 메모 <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(29,29,31,0.3)" }}>(선택)</span></label>
            <input className={IN_CLS} style={INPUT} value={f.memo} onChange={set("memo")} placeholder="배송 시 요청사항" />
          </div>
        </div>

        <div style={CARD}>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", color: "#1D1D1F", margin: "0 0 14.64px" }}>결제 수단</p>
          <button type="button" onClick={() => setPay("card")} className="flex w-full items-center" style={payOpt(pay === "card")}>
            <span style={{ fontSize: "13px", fontWeight: pay === "card" ? 500 : 400, color: pay === "card" ? "#1E3A5F" : "rgba(29,29,31,0.6)" }}>법인/신용카드</span>
          </button>
          <div style={{ height: "9.76px" }} />
          <button type="button" onClick={() => setPay("virtual")} className="flex w-full items-center" style={payOpt(pay === "virtual")}>
            <span style={{ fontSize: "13px", fontWeight: pay === "virtual" ? 500 : 400, color: pay === "virtual" ? "#1E3A5F" : "rgba(29,29,31,0.6)" }}>가상계좌</span>
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col lg:w-[364px]" style={{ flexShrink: 0 }}>
        <div style={{ ...CARD, position: "sticky", top: "80px" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.225px", color: "#1D1D1F", margin: "0 0 19.52px" }}>결제 요약</p>
          <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>상품 금액</span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>{won(productTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>배송비</span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1D1D1F" }}>무료</span>
          </div>
          <div style={{ margin: "15.64px 0", borderTop: "1px solid rgba(210,210,215,0.2)" }} />
          <div className="flex items-center justify-between" style={{ marginBottom: "19.52px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1D1D1F" }}>총 결제 금액</span>
            <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.55px", color: "#1D1D1F" }}>{won(productTotal)}</span>
          </div>
          <button type="button" onClick={submit} disabled={!canPay} className="flex w-full items-center justify-center" style={{ height: "56px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.21px", cursor: canPay ? "pointer" : "not-allowed", opacity: canPay ? 1 : 0.4 }}>
            {submitting ? "결제 중…" : "결제하기"}
          </button>
          <button type="button" onClick={() => router.push("/cart")} className="flex w-full items-center justify-center" style={{ marginTop: "12px", height: "44px", background: "none", border: "none", color: "rgba(29,29,31,0.6)", fontSize: "13px", fontWeight: 400, cursor: "pointer" }}>장바구니로 돌아가기</button>
          <p style={{ fontSize: "11px", fontWeight: 400, color: "rgba(29,29,31,0.3)", textAlign: "center", margin: "8px 0 0" }}>주문 정보는 암호화되어 안전하게 전송됩니다</p>
        </div>
      </div>

      {addrOpen && <AddressSearchModal onClose={() => setAddrOpen(false)} onSelect={onAddrSelect} />}
    </div>
  );
}

function AddressSearchModal({ onClose, onSelect }: { onClose: () => void; onSelect: (d: DaumPostcodeResult) => void }) {
  const embedRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (mounted.current || !embedRef.current) return;
    mounted.current = true;
    embedPostcode(embedRef.current, onSelect)
      .then(() => setLoaded(true))
      .catch(() => {});
  }, []);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "625px", maxWidth: "100%", maxHeight: "calc(100vh - 32px)", borderRadius: "19.52px", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, lineHeight: "20px", letterSpacing: "-0.448px", color: "#1D1D1F", margin: 0 }}>주소 검색</h2>
          <button type="button" aria-label="닫기" onClick={onClose}
            style={{ width: "39px", height: "39px", borderRadius: "9999px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <AddrXIcon />
          </button>
        </div>

        <div style={{ position: "relative", padding: "24.4px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div ref={embedRef} style={{ width: "100%", height: "400px", borderRadius: "14.64px", overflow: "hidden" }} />
          {!loaded && (
            <div style={{ position: "absolute", top: "24.4px", left: "24.4px", right: "24.4px", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", paddingBottom: "14.64px" }}>
                <span style={{ position: "absolute", left: "20.52px", top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}><AddrSearchIcon /></span>
                <div style={{ display: "flex", alignItems: "center", height: "54px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", paddingLeft: "44.92px", paddingRight: "20.52px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "22.75px", letterSpacing: "-0.293px", color: "rgba(29,29,31,0.3)" }}>도로명, 지번, 건물명, 우편번호로 검색</span>
                </div>
              </div>
              <div style={{ padding: "39.04px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", textAlign: "center" }}>기관명, 도로명, 지번을 입력하세요</span>
                <span style={{ marginTop: "4.88px", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.3)", textAlign: "center" }}>예: 화성시청, 테헤란로, 서초동</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddrXIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.91598 4.66013L10.5111 -0.000403281L11.832 1.33927L7.23685 5.9998L11.832 10.6603L10.5111 12L5.91598 7.33947L1.32086 12L0 10.6603L4.59512 5.9998L0 1.33927L1.32086 -0.000403281L5.91598 4.66013Z" fill="#1D1D1F" fillOpacity="0.4" />
    </svg>
  );
}

function AddrSearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6785 10.7925L14.7947 13.9518L13.7609 15L10.6446 11.8407C10.0719 12.3032 9.44573 12.6576 8.76618 12.9036C8.0478 13.1595 7.31 13.2875 6.55279 13.2875C5.36844 13.2875 4.2666 12.9873 3.24727 12.3869C2.25707 11.7964 1.47559 10.9991 0.902829 9.99525C0.300943 8.96182 0 7.84473 0 6.64398C0 5.44323 0.300943 4.32614 0.902829 3.29271C1.47559 2.28881 2.25707 1.49651 3.24727 0.915824C4.2666 0.305607 5.36844 0.000499592 6.55279 0.000499592C7.73715 0.000499592 8.83899 0.305607 9.85831 0.915824C10.8485 1.49651 11.6348 2.28881 12.2173 3.29271C12.8095 4.32614 13.1056 5.44323 13.1056 6.64398C13.1056 7.41167 12.9794 8.15968 12.727 8.888C12.4843 9.57695 12.1348 10.2118 11.6785 10.7925ZM10.2078 10.2462C10.6641 9.7738 11.0184 9.23248 11.2708 8.62226C11.5232 7.99236 11.6494 7.33293 11.6494 6.64398C11.6494 5.70897 11.4164 4.83794 10.9504 4.03088C10.5039 3.25334 9.89714 2.63821 9.13022 2.18547C8.33418 1.71304 7.47504 1.47683 6.55279 1.47683C5.63055 1.47683 4.7714 1.71304 3.97536 2.18547C3.20844 2.63821 2.6017 3.25334 2.15514 4.03088C1.68916 4.83794 1.45618 5.70897 1.45618 6.64398C1.45618 7.57899 1.68916 8.45002 2.15514 9.25708C2.6017 10.0346 3.20844 10.6498 3.97536 11.1025C4.7714 11.5749 5.63055 11.8111 6.55279 11.8111C7.23234 11.8111 7.88277 11.6832 8.50407 11.4273C9.10596 11.1714 9.63989 10.8121 10.1059 10.3496L10.2078 10.2462Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}

function Req() { return <span style={{ color: "#F87171" }}>*</span>; }
function payOpt(active: boolean): React.CSSProperties {
  return { borderRadius: "14.64px", padding: "15.6px 20.52px", background: active ? "rgba(30,58,95,0.05)" : "#fff", border: active ? "1px solid #1E3A5F" : "1px solid rgba(210,210,215,0.3)", cursor: "pointer" };
}
