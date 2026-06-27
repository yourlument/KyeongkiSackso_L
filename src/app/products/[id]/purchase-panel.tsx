"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/upload-client";

const TABS = ["제품 상세", "상세 스펙", "업체 정보", "평점 등록"] as const;
type Tab = (typeof TABS)[number];

type Spec = { label: string; value: string };
type Company = {
  name: string;
  category?: string;
  intro?: string;
  representativeName?: string;
  businessRegistrationNo?: string;
  region?: string;
  establishedYear?: number;
  registeredCount: number;
  dealCount?: number;
  phone?: string;
  certifications: string[];
  description?: string;
  portfolioFileName?: string;
};

export function ProductPurchasePanel({
  productId,
  npsCode,
  name,
  price,
  unit,
  supplierCompanyName,
  rating,
  reviewCount,
  badges,
  minOrderQty,
  deliveryDays,
  deliveryCondition,
  specs,
  company,
  detailImages,
  isLoggedIn,
  isSupplier,
  hasPurchaseRecord,
  supplierCompanyId,
}: {
  productId: string;
  npsCode?: string;
  name: string;
  price: number;
  unit: string;
  supplierCompanyName: string;
  rating?: number;
  reviewCount?: number;
  badges: string[];
  minOrderQty?: number;
  deliveryDays?: number;
  deliveryCondition?: string;
  specs: Spec[];
  company: Company;
  detailImages: string[];
  isLoggedIn: boolean;
  isSupplier: boolean;
  hasPurchaseRecord: boolean;
  supplierCompanyId: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("제품 상세");
  const [showLogin, setShowLogin] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const blocked = isSupplier;

  async function handleCart(goCart: boolean) {
    if (!isLoggedIn) { setShowLogin(true); return; }
    if (blocked) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      if (res.status === 401) { setShowLogin(true); return; }
      if (!res.ok) return;
      if (typeof window !== "undefined") window.dispatchEvent(new Event("cart:changed"));
      if (goCart) { router.push("/cart"); return; }
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } finally { setAdding(false); }
  }

  function handleQuote() {
    if (!isLoggedIn) { setShowLogin(true); return; }
    if (blocked) return;
    setShowQuote(true);
  }

  const HERO_SPECS: Spec[] = [
    ...(minOrderQty != null ? [{ label: "최소 주문수량", value: `${minOrderQty}${unit}` }] : []),
    ...(deliveryDays != null ? [{ label: "납기일", value: `${deliveryDays}영업일` }] : []),
    ...(deliveryCondition != null ? [{ label: "인도 조건", value: deliveryCondition }] : []),
    { label: "공급업체", value: supplierCompanyName },
  ];

  return (
    <>
      <div className="flex w-full flex-col lg:flex-[859_1_0%]">

        <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "14.64px" }}>
          {npsCode && (
            <span
              className="inline-flex items-center"
              style={{ borderRadius: "9.76px", background: "rgba(29,29,31,0.05)", padding: "4.88px 12.2px", fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.5)" }}
            >
              {npsCode}
            </span>
          )}
          {badges[0] && (
            <span
              className="inline-flex items-center"
              style={{ borderRadius: "9999px", padding: "2.44px 9.76px", fontSize: "10px", fontWeight: 500, lineHeight: "18px", letterSpacing: "-0.15px", color: "#1E3A5F" }}
            >
              {badges[0]}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: "30.25px", letterSpacing: "-0.55px", color: "#1D1D1F", margin: 0 }}>
          {name}
        </h1>

        {rating != null && (
          <div className="mt-[4px] flex items-center gap-[6px]">
            <span className="flex items-center gap-[2px]" aria-label={`평점 ${rating}점`}>
              {[0, 1, 2, 3, 4].map(i => (
                <StarIcon key={i} filled={i < Math.round(rating)} size={11} color="#9ca3af" empty="#d1d5db" />
              ))}
            </span>
            <span style={{ fontSize: "12px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}>
              {rating}{reviewCount != null ? ` (${reviewCount}건)` : ""}
            </span>
          </div>
        )}

        <div className="mt-[20px] flex items-baseline gap-[8px]">
          <span style={{ fontSize: "26px", fontWeight: 700, lineHeight: "46.8px", letterSpacing: "-0.39px", color: "#1D1D1F" }}>
            {price.toLocaleString("ko-KR")}원
          </span>
          <span style={{ fontSize: "14px", color: "rgba(29,29,31,0.4)" }}>/{unit}</span>
        </div>

        <dl className="mt-[20px] grid grid-cols-2" style={{ gap: "14.64px" }}>
          {HERO_SPECS.map(s => (
            <div key={s.label} style={{ borderRadius: "14.64px", background: "transparent", border: "1px solid rgba(210,210,215,0.2)", padding: "15.64px" }}>
              <dt style={{ fontSize: "11px", lineHeight: "16px", color: "rgba(29,29,31,0.4)", marginBottom: "4px" }}>{s.label}</dt>
              <dd style={{ fontSize: "13px", fontWeight: 500, lineHeight: "20px", color: "#1D1D1F", margin: 0 }}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-[20px] flex items-center" style={{ gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "rgba(29,29,31,0.6)" }}>수량</span>
          <div className="flex items-center" style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff" }}>
            <button
              type="button"
              aria-label="수량 감소"
              disabled={qty <= 1}
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="flex items-center justify-center"
              style={{ width: "44px", height: "44px", background: "none", border: "none", cursor: qty <= 1 ? "default" : "pointer", opacity: qty <= 1 ? 0.4 : 1 }}
            >
              <MinusIcon color="#6b7280" />
            </button>
            <span style={{ width: "59px", textAlign: "center", fontSize: "13px", fontWeight: 500, color: "#1D1D1F" }}>{qty}</span>
            <button
              type="button"
              aria-label="수량 증가"
              onClick={() => setQty(q => q + 1)}
              className="flex items-center justify-center"
              style={{ width: "44px", height: "44px", background: "none", border: "none", cursor: "pointer" }}
            >
              <PlusIcon color="#6b7280" />
            </button>
          </div>
          <span style={{ fontSize: "13px", color: "rgba(29,29,31,0.4)" }}>{unit}</span>
        </div>

        <div className="mt-[20px] flex" style={{ gap: "9.76px" }}>
          <button
            type="button"
            disabled={blocked || adding}
            onClick={() => handleCart(false)}
            className="flex flex-1 flex-col items-center justify-center"
            style={{ height: "77px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", gap: "4px", cursor: blocked ? "not-allowed" : "pointer", opacity: blocked ? 0.4 : 1 }}
          >
            <CartIcon color="rgba(29,29,31,0.7)" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(29,29,31,0.7)" }}>{added ? "담김" : "장바구니"}</span>
          </button>

          <button
            type="button"
            disabled={blocked || adding}
            onClick={() => handleCart(true)}
            className="flex flex-1 flex-col items-center justify-center"
            style={{ height: "77px", borderRadius: "14.64px", background: blocked ? "rgba(30,58,95,0.4)" : "#1E3A5F", border: "none", gap: "4px", cursor: blocked ? "not-allowed" : "pointer" }}
          >
            <BagIcon color="#fff" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>구매하기</span>
          </button>

          <button
            type="button"
            disabled={blocked}
            onClick={handleQuote}
            className="flex flex-1 flex-col items-center justify-center"
            style={{ height: "77px", borderRadius: "14.64px", border: "1px solid rgba(30,58,95,0.3)", background: "#fff", gap: "4px", cursor: blocked ? "not-allowed" : "pointer", opacity: blocked ? 0.4 : 1 }}
          >
            <FileIcon color="#1E3A5F" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1E3A5F" }}>견적 요청</span>
          </button>
        </div>

        {blocked && (
          <p className="mt-[12px] text-center" style={{ fontSize: "11px", lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)" }}>
            공급업체 계정은 구매 및 견적 요청 기능을 이용할 수 없습니다
          </p>
        )}
      </div>

      <div
        className="w-full lg:order-last lg:basis-full"
        style={{ borderRadius: "19.52px", border: "1px solid #e5e7eb", background: "#fff", overflow: "hidden" }}
      >
        <div className="flex" style={{ borderBottom: "1px solid rgba(210,210,215,0.15)" }}>
          {TABS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                paddingTop: "19.52px",
                paddingBottom: "19.52px",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "22.75px",
                letterSpacing: "-0.2928px",
                color: t === tab ? "#1E3A5F" : "rgba(29,29,31,0.4)",
                background: "none",
                border: "none",
                borderBottom: t === tab ? "2px solid #1E3A5F" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: "24px" }}>
          {tab === "제품 상세" && <ProductDetailTab detailImages={detailImages} />}
          {tab === "상세 스펙" && <SpecTab specs={specs} />}
          {tab === "업체 정보" && <CompanyTab company={company} />}
          {tab === "평점 등록" && (
            <ReviewTab
              productId={productId}
              isLoggedIn={isLoggedIn}
              hasPurchaseRecord={hasPurchaseRecord}
              onRequireLogin={() => setShowLogin(true)}
            />
          )}
        </div>
      </div>

      {showQuote && (
        <QuoteModal
          productId={productId}
          supplierCompanyId={supplierCompanyId}
          productName={name}
          supplierName={supplierCompanyName}
          price={price}
          unit={unit}
          onClose={() => setShowQuote(false)}
        />
      )}

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onSignup={() => router.push("/signup")} />
      )}
    </>
  );
}

function ProductDetailTab({ detailImages }: { detailImages: string[] }) {
  if (detailImages.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "360px", background: "#FAFAFA", borderRadius: "8px", border: "1px dashed rgba(210,210,215,0.4)" }}
      >
        <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.3)" }}>상세 이미지 삽입 영역</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col" style={{ gap: "8px" }}>
      {detailImages.map((url, i) => (
        <img key={i} src={url} alt={`상세 이미지 ${i + 1}`} style={{ width: "100%", borderRadius: "8px", display: "block" }} />
      ))}
    </div>
  );
}

function SpecTab({ specs }: { specs: Spec[] }) {
  return (
    <div>
      <h2 style={{ fontSize: "14px", fontWeight: 700, lineHeight: "20px", color: "#111827", margin: 0, marginBottom: "16px" }}>
        상세 스펙
      </h2>
      {specs.length > 0 ? (
        <div style={{ borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {specs.map((s, i) => (
            <div
              key={s.label}
              className="flex"
              style={{ padding: "14px 20px", borderTop: i === 0 ? "none" : "1px solid #f3f4f6" }}
            >
              <span style={{ width: "144px", flexShrink: 0, fontSize: "12px", fontWeight: 500, lineHeight: "16px", color: "#6b7280" }}>
                {s.label}
              </span>
              <span style={{ fontSize: "14px", lineHeight: "20px", color: "#111827" }}>{s.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-[20px] flex items-center gap-[4px]" style={{ background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: "8px", padding: "17px" }}>
        <InfoIcon color="#6b7280" size={12} />
        <span style={{ fontSize: "12px", lineHeight: "16px", color: "#6b7280" }}>
          스펙 정보는 제조사 기준이며 실제 납품 제품과 미세한 차이가 있을 수 있습니다.
        </span>
      </div>
    </div>
  );
}

function CompanyTab({ company }: { company: Company }) {
  const [open, setOpen] = useState(true);
  const ROWS: { label: string; value?: string }[] = [
    { label: "대표자", value: company.representativeName },
    { label: "사업자번호", value: company.businessRegistrationNo },
    { label: "지역", value: company.region },
    { label: "설립연도", value: company.establishedYear != null ? `${company.establishedYear}년` : undefined },
    { label: "등록 상품", value: `${company.registeredCount}개` },
    { label: "누적 거래", value: company.dealCount != null ? `${company.dealCount}건` : undefined },
    { label: "연락처", value: company.phone },
  ].filter(r => r.value != null) as { label: string; value: string }[];

  return (
    <div>
      <div className="flex" style={{ gap: "19.52px" }}>
        <div
          className="flex items-center justify-center"
          style={{ width: "68px", height: "68px", flexShrink: 0, borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)" }}
        >
          <CompanyLogoIcon />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "4.88px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, lineHeight: "20px", letterSpacing: "-0.448px", color: "#1D1D1F", margin: 0 }}>{company.name}</h3>
            {company.category && (
              <span style={{ borderRadius: "9999px", background: "rgba(29,29,31,0.05)", padding: "2.44px 12.2px", fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.6)" }}>
                {company.category}
              </span>
            )}
          </div>
          {company.intro && (
            <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)", margin: 0 }}>{company.intro}</p>
          )}
        </div>
      </div>

      <div
        className="mt-[24.4px] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
        style={{ gap: "14.64px", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", padding: "20.52px" }}
      >
        {ROWS.map(r => (
          <div key={r.label} className="flex flex-col">
            <span style={{ fontSize: "11px", lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", marginBottom: "4.88px" }}>{r.label}</span>
            <span style={{ fontSize: "13px", fontWeight: 500, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "#1D1D1F" }}>{r.value}</span>
          </div>
        ))}
      </div>

      {company.certifications.length > 0 && (
        <div className="mt-[24.4px]">
          <p style={{ fontSize: "11px", lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0, marginBottom: "9.76px" }}>보유 인증</p>
          <div className="flex flex-wrap" style={{ gap: "9.76px" }}>
            {company.certifications.map(c => (
              <span key={c} style={{ borderRadius: "9999px", padding: "4.88px 12.2px", fontSize: "11px", fontWeight: 500, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "#1E3A5F" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {company.description && (
        <div style={{ marginTop: "24.4px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.15)" }}>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex items-center"
            style={{ gap: "7.32px", marginBottom: "9.76px", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "13px", fontWeight: 500, lineHeight: "22.75px", letterSpacing: "-0.2928px", color: "rgba(29,29,31,0.6)" }}
          >
            <CompanyCaret open={open} />
            기업 상세 소개 {open ? "접기" : "펼치기"}
          </button>
          {open && (
            <div style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.15)", padding: "20.52px" }}>
              <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "21.125px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.6)", margin: 0, whiteSpace: "pre-line" }}>
                {company.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewTab({
  productId,
  isLoggedIn,
  hasPurchaseRecord,
  onRequireLogin,
}: {
  productId: string;
  isLoggedIn: boolean;
  hasPurchaseRecord: boolean;
  onRequireLogin: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (stars === 0 || submitting || done) return;
    if (!isLoggedIn) { onRequireLogin(); return; }
    setSubmitting(true);
    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars, comment: text }),
      }).catch(() => {});
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoggedIn && !hasPurchaseRecord) {
    return (
      <div>
        <h2 style={{ fontSize: "15px", fontWeight: 600, lineHeight: "18.8px", letterSpacing: "-0.42px", color: "#1D1D1F", margin: 0, marginBottom: "24.4px" }}>
          평점 등록
        </h2>
        <div
          className="flex flex-col items-center justify-center"
          style={{ border: "1px dashed rgba(210,210,215,0.3)", borderRadius: "19.52px", padding: "59.56px 1px" }}
        >
          <div
            className="flex items-center justify-center"
            style={{ width: "68px", height: "68px", borderRadius: "9999px", background: "#FFFBEB", marginBottom: "19.52px" }}
          >
            <AmberStarIcon />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: "25.2px", letterSpacing: "-0.21px", color: "#1D1D1F", margin: 0, marginBottom: "9.76px", textAlign: "center" }}>
            구매자만 평점을 등록할 수 있습니다
          </p>
          <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.19px", color: "rgba(29,29,31,0.5)", margin: 0, textAlign: "center" }}>
            이 상품을 구매한 기록이 있는 경우에만 평점 및 한줄 평가 등록이 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  const canSubmit = stars > 0 && !submitting && !done;

  return (
    <div>
      <h2 style={{ fontSize: "15px", fontWeight: 600, lineHeight: "18.8px", letterSpacing: "-0.42px", color: "#1D1D1F", margin: 0, marginBottom: "24.4px" }}>
        평점 등록
      </h2>

      <div style={{ maxWidth: "546.55px" }}>
        <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.5)", margin: 0 }}>
          이 상품을 납품받으셨나요? 평점을 남겨주세요.
        </p>

        <div style={{ marginTop: "24.4px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", margin: 0, marginBottom: "9.76px" }}>별점</p>
          <div className="flex items-center" style={{ gap: "4.88px" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                aria-label={`${n}점`}
                onClick={() => setStars(n)}
                className="flex items-center justify-center"
                style={{ width: "48.8px", height: "48.8px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <ReviewStarIcon filled={n <= stars} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "24.4px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", margin: 0, marginBottom: "7.32px" }}>한줄 평가 (선택)</p>
          <input
            type="text"
            maxLength={100}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="납품 경험을 간략히 공유해주세요"
            style={{
              width: "100%",
              borderRadius: "14.64px",
              border: "1px solid rgba(210,210,215,0.4)",
              background: "#fff",
              padding: "15.625px 20.52px",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "-0.293px",
              color: "#1D1D1F",
              outline: "none",
            }}
          />
          <p className="text-right" style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.3)", margin: 0, marginTop: "4.88px" }}>
            {text.length}/100
          </p>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="flex items-center justify-center"
          style={{
            marginTop: "24.4px",
            padding: "12.2px 29.28px",
            borderRadius: "14.64px",
            background: "#1E3A5F",
            border: "none",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: "23px",
            letterSpacing: "-0.293px",
            color: "#fff",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.4,
          }}
        >
          {done ? "등록 완료" : "평점 등록"}
        </button>
      </div>
    </div>
  );
}

function ReviewStarIcon({ filled }: { filled: boolean }) {
  const outer = "M13.9998 21.8892L5.34494 26.7698L7.28187 16.9839L0 10.2298L9.85627 9.04661L13.9998 0.000118674L18.1434 9.04661L27.9996 10.2298L20.7178 16.9839L22.6547 26.7698L13.9998 21.8892Z";
  const inner = "M13.9998 19.0791L19.1977 22.0124L18.0453 16.1211L22.434 12.0539L16.5007 11.339L13.9998 5.89143L11.499 11.339L5.5656 12.0539L9.95434 16.1211L8.80199 22.0124L13.9998 19.0791Z";
  return (
    <svg width={30} height={29} viewBox="0 0 28 27" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      {filled ? (
        <path d={outer} fill="#FBBF24" />
      ) : (
        <path fillRule="evenodd" clipRule="evenodd" d={`${outer} ${inner}`} fill="#1D1D1F" fillOpacity={0.2} />
      )}
    </svg>
  );
}

function LoginModal({ onClose, onSignup }: { onClose: () => void; onSignup: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.30)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: "relative", borderRadius: "19.52px", background: "#fff", width: "468px", maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px" }}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", width: "32px", height: "32px", borderRadius: "9999px", border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af", fontSize: "18px" }}
        >
          ×
        </button>
        <div style={{ width: "68px", height: "68px", borderRadius: "9999px", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <LockIcon color="rgba(29,29,31,0.4)" />
        </div>
        <h2 style={{ fontSize: "17px", fontWeight: 700, lineHeight: "21.25px", color: "#1D1D1F", margin: 0, marginBottom: "8px" }}>
          로그인이 필요해요
        </h2>
        <p style={{ fontSize: "13px", lineHeight: "18px", color: "rgba(29,29,31,0.5)", textAlign: "center", margin: 0, marginBottom: "24px" }}>
          장바구니, 구매하기, 견적 요청 기능은<br />로그인 후 이용할 수 있습니다.
        </p>
        <div style={{ display: "flex", gap: "14.64px", width: "100%" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", padding: "10px 0", fontSize: "13px", color: "#6b7280", cursor: "pointer" }}
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onSignup}
            style={{ flex: 1, borderRadius: "14.64px", background: "#1E3A5F", border: "none", padding: "10px 0", fontSize: "13px", fontWeight: 600, color: "#fff", cursor: "pointer" }}
          >
            회원가입
          </button>
        </div>
        <Link href="/login" style={{ marginTop: "12px", fontSize: "12px", color: "rgba(29,29,31,0.4)", textDecoration: "none" }}>
          이미 계정이 있으시나요? 로그인
        </Link>
      </div>
    </div>
  );
}

function QuoteModal({
  productId,
  supplierCompanyId,
  productName,
  supplierName,
  price,
  unit,
  onClose,
}: {
  productId: string;
  supplierCompanyId: string;
  productName: string;
  supplierName: string;
  price: number;
  unit: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [organ, setOrgan] = useState("");
  const [dept, setDept] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQtyStr] = useState("");
  const [date, setDate] = useState("");
  const [addr, setAddr] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAttachFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map((f) => uploadFile(f)));
      setAttachments((prev) => [...prev, ...results.map((r) => ({ url: r.url, name: r.name }))]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeAttachment(i: number) {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  }

  const canSubmit = organ.trim() && dept.trim() && email.trim() && phone.trim() && qty.trim() && date.trim() && addr.trim() && !submitting && !done && !uploading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${productName} 견적 요청`,
          quoteType: "물품 견적",
          kind: "DIRECT",
          targetSupplierCompanyId: supplierCompanyId,
          productId,
          budgetTbd: true,
          desiredDeliveryDate: date,
          deliveryAddress: addr,
          contactOrgName: organ,
          contactDepartment: dept,
          contactEmail: email,
          contactPhone: phone,
          description: note || undefined,
          items: [{ name: productName, qty, unit, spec: "" }],
          attachments,
        }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        alert(d.error ?? "견적 요청 중 오류가 발생했습니다");
        return;
      }
      setDone(true);
      onClose();
      router.push("/quotes");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }
  void done;

  const inputClass = "w-full box-border outline-none placeholder:text-[#1d1d1f]/30";
  const inputStyle: React.CSSProperties = {
    borderRadius: "14.64px",
    border: "1px solid rgba(210,210,215,0.4)",
    background: "#fff",
    padding: "15.625px 20.52px",
    height: "54px",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "-0.293px",
    color: "#1D1D1F",
  };
  const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", display: "block", marginBottom: "7.32px" };
  const reqStar = <span style={{ color: "#F87171" }}>*</span>;
  const optStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.3)" };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: "relative", width: "625px", maxWidth: "100%", maxHeight: "calc(100vh - 32px)", borderRadius: "19.52px", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "19.52px 29.28px", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.48px", color: "#1D1D1F", margin: 0 }}>견적 요청</h2>
          <button type="button" aria-label="닫기" onClick={onClose}
            style={{ width: "32px", height: "32px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <XIcon color="rgba(29,29,31,0.4)" />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "29.28px", display: "flex", flexDirection: "column", gap: "19.52px" }}>
          <div style={{ borderRadius: "14.64px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", padding: "15.64px" }}>
            <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", margin: 0, marginBottom: "4.88px" }}>견적 요청 상품</p>
            <p style={{ fontSize: "14px", fontWeight: 500, lineHeight: "25px", letterSpacing: "-0.21px", color: "#1D1D1F", margin: 0 }}>{productName}</p>
            <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "22px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", margin: 0 }}>
              {supplierName} · 단가 {price.toLocaleString("ko-KR")}원/{unit}
            </p>
          </div>

          <div className="grid grid-cols-2" style={{ gap: "14.64px" }}>
            <div>
              <label style={labelStyle}>소속 기관명 {reqStar}</label>
              <input type="text" className={inputClass} value={organ} onChange={e => setOrgan(e.target.value)} placeholder="예: 화성시청" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>소속 부서 {reqStar}</label>
              <input type="text" className={inputClass} value={dept} onChange={e => setDept(e.target.value)} placeholder="예: 도로관리과" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: "14.64px" }}>
            <div>
              <label style={labelStyle}>이메일 {reqStar}</label>
              <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="업무용 이메일" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>연락처 {reqStar}</label>
              <input type="tel" className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="부서 전화번호" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: "14.64px" }}>
            <div>
              <label style={labelStyle}>요청 수량 {reqStar}</label>
              <div className="flex items-center" style={{ gap: "9.76px" }}>
                <input type="text" inputMode="numeric" min="1" className={inputClass} value={qty} onChange={e => setQtyStr(e.target.value.replace(/[^0-9]/g, ""))} placeholder="수량"
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", flexShrink: 0 }}>{unit}</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>납품 희망일 {reqStar}</label>
              <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)}
                style={{ ...inputStyle, fontWeight: 400, color: date ? "#1D1D1F" : "rgba(29,29,31,0.3)" }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>납품 주소 {reqStar}</label>
            <input type="text" className={inputClass} value={addr} onChange={e => setAddr(e.target.value)} placeholder="납품 받을 주소를 입력하세요" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>첨부 파일 <span style={optStyle}>(선택)</span></label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              style={{ borderRadius: "14.64px", border: "2px dashed rgba(210,210,215,0.3)", padding: "21.52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4.88px", cursor: "pointer" }}
            >
              <UploadIcon color="rgba(29,29,31,0.4)" />
              <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}>{uploading ? "업로드 중…" : "시성서, 규격서 등 첨부 파일 등록"}</span>
            </div>
            <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,image/*" onChange={handleAttachFiles} style={{ display: "none" }} />
            {attachments.length > 0 && (
              <div style={{ marginTop: "9.76px", display: "flex", flexDirection: "column", gap: "4.88px" }}>
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ borderRadius: "9.76px", background: "#F5F5F7", padding: "7.32px 12.2px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{a.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 0 7.32px", flexShrink: 0 }} aria-label="삭제">
                      <XIcon color="rgba(29,29,31,0.4)" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>요청 사항 <span style={optStyle}>(선택)</span></label>
            <textarea
              maxLength={500}
              className={inputClass}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="규격, 색상, 특이사항 등 추가 요구사항을 입력하세요"
              style={{ ...inputStyle, height: "99.5px", padding: "15.64px 20.52px", resize: "none", fontFamily: "inherit" }}
            />
            <p className="text-right" style={{ fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.3)", marginTop: "4.88px" }}>{note.length}/500</p>
          </div>

          <div style={{ border: "1px solid rgba(210,210,215,0.2)", borderRadius: "14.64px", padding: "15.64px", display: "flex", alignItems: "center", gap: "4.88px" }}>
            <InfoIcon color="rgba(29,29,31,0.5)" size={13} />
            <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", margin: 0 }}>
              견적 요청 내용은 해당 공급업체에 전달되며, 결과는 <strong style={{ fontWeight: 700 }}>견적 요청 모니터링</strong> 메뉴에서 확인하실 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-2" style={{ gap: "14.64px" }}>
            <button type="button" onClick={onClose}
              style={{ borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", padding: "13.2px 0", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}>
              취소
            </button>
            <button type="button" onClick={handleSubmit} disabled={!canSubmit}
              style={{ borderRadius: "14.64px", background: "#1E3A5F", border: "none", padding: "12.2px 0", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.293px", color: "#fff", cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.4 }}>
              {submitting ? "제출 중..." : "견적 요청 제출"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ filled, size, color, empty }: { filled: boolean; size: number; color: string; empty: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.95 6.5L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87L9.05 8.5 12 2z"
        fill={filled ? color : empty}
      />
    </svg>
  );
}

function MinusIcon({ color }: { color: string }) {
  return (
    <svg width={10} height={2} viewBox="0 0 10 2" fill="none" aria-hidden>
      <rect width={10} height={1.5} y={0.25} fill={color} />
    </svg>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M4.25 0h1.5v4.25H10v1.5H5.75V10h-1.5V5.75H0v-1.5h4.25V0z" fill={color} />
    </svg>
  );
}

function CartIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function BagIcon({ color }: { color: string }) {
  return (
    <svg width={13} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function FileIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size + 1} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function InfoIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function CompanyLogoIcon() {
  return (
    <svg width={26} height={24} viewBox="0 0 27 25" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M2.45453 22.1608V5.60014C2.45453 5.3345 2.52817 5.09377 2.67544 4.87794C2.82271 4.66212 3.01907 4.5127 3.26453 4.42968L15.1199 0.0467142C15.2835 -0.0196926 15.4431 -0.0155422 15.5985 0.0591674C15.754 0.133877 15.8563 0.254241 15.9054 0.420264C15.9381 0.486673 15.9545 0.553082 15.9545 0.619489V6.79549L23.7108 9.41033C23.9562 9.49334 24.1567 9.64691 24.3121 9.87104C24.4676 10.0952 24.5453 10.3401 24.5453 10.6057V22.1608H26.9998V24.6511H0V22.1608H2.45453ZM4.90906 22.1608H13.4999V3.28414L4.90906 6.47175V22.1608ZM22.0908 22.1608V11.5022L15.9545 9.41033V22.1608H22.0908Z" fill="#1D1D1F" fillOpacity={0.3} />
    </svg>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <svg width={22} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CompanyCaret({ open }: { open: boolean }) {
  return (
    <svg width={12} height={8} viewBox="0 0 7 5" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg" style={{ transform: open ? "none" : "rotate(180deg)", transition: "transform 0.15s", flexShrink: 0 }}>
      <path d="M3.50019 1.57293L0.78149 4.32874L0 3.54774L3.50019 -0.000214605L7.00039 3.54774L6.2189 4.32874L3.50019 1.57293Z" fill="#1D1D1F" fillOpacity={0.6} />
    </svg>
  );
}

function XIcon({ color }: { color: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function UploadIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function AmberStarIcon() {
  return (
    <svg width={26} height={30} viewBox="0 0 22 26" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.8812 8.66667V6.19048C4.8812 5.06794 5.15374 4.03206 5.6988 3.08286C6.24387 2.13365 6.98419 1.38254 7.91975 0.829525C8.85531 0.276508 9.8763 0 10.9827 0C12.0891 0 13.1101 0.276508 14.0457 0.829525C14.9812 1.38254 15.7215 2.13365 16.2666 3.08286C16.8117 4.03206 17.0842 5.06794 17.0842 6.19048V8.66667H20.7451C21.0868 8.66667 21.3756 8.78635 21.6115 9.02571C21.8474 9.26508 21.9654 9.5581 21.9654 9.90476V24.7619C21.9654 25.1086 21.8474 25.4016 21.6115 25.641C21.3756 25.8803 21.0868 26 20.7451 26H1.2203C0.878616 26 0.589812 25.8803 0.353887 25.641C0.117962 25.4016 0 25.1086 0 24.7619V9.90476C0 9.5581 0.117962 9.26508 0.353887 9.02571C0.589812 8.78635 0.878616 8.66667 1.2203 8.66667H4.8812ZM4.8812 11.1429H2.4406V23.5238H19.5248V11.1429H17.0842V13.619H14.6436V11.1429H7.3218V13.619H4.8812V11.1429ZM7.3218 8.66667H14.6436V6.19048C14.6436 5.51365 14.4809 4.89048 14.1555 4.32095C13.8301 3.75143 13.3867 3.30159 12.8254 2.97143C12.264 2.64127 11.6498 2.47619 10.9827 2.47619C10.3156 2.47619 9.70139 2.64127 9.14005 2.97143C8.57871 3.30159 8.13534 3.75143 7.80992 4.32095C7.48451 4.89048 7.3218 5.51365 7.3218 6.19048V8.66667Z"
        fill="#F59E0B"
      />
    </svg>
  );
}
