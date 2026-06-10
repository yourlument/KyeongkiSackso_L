"use client";

import { Fragment, useMemo, useState, type CSSProperties } from "react";

type Tab = "상품 검수" | "공고 검수";

type ProductRow = {
  itemNo: string;
  name: string;
  company: string;
  category: string;
  price: string;
  status: "정상";
};

const PRODUCTS: ProductRow[] = [
  { itemNo: "12203515", name: "레미콘(혼합콘크리트) 24-40-140(중기)", company: "경기건설(주)", category: "도로포장재(레미콘, 아스콘, 시멘트, 콘크리트)", price: "115,000원", status: "정상" },
  { itemNo: "12203516", name: "레미콘(혼합콘크리트) 30-37-150(고기)", company: "화성레미콘(주)", category: "도로포장재(레미콘, 아스콘, 시멘트, 콘크리트)", price: "125,000원", status: "정상" },
  { itemNo: "45501301", name: "아스콘(노상용) 표준배합 15-40", company: "포장산업(주)", category: "도로포장재(레미콘, 아스콘, 시멘트, 콘크리트)", price: "95,000원", status: "정상" },
  { itemNo: "39107101", name: "교통안전용품(콘) 반사원형콘 750mm", company: "안전제품(주)", category: "교통안전용품", price: "8,500원", status: "정상" },
  { itemNo: "39107201", name: "도로안전시설물(난간) 강관난간 2중난간", company: "안전난간(주)", category: "도로 분리대 및 난간", price: "180,000원", status: "정상" },
  { itemNo: "43201501", name: "컴퓨터(데스크톱) 업무용 PC i7/16GB/512GB", company: "디지털솔루션(주)", category: "컴퓨터/노트북/태블릿", price: "890,000원", status: "정상" },
  { itemNo: "43202601", name: "프린터(레이저) 흑백 A4 45ppm", company: "오피스텍(주)", category: "프린터/스캐너 및 소모품", price: "450,000원", status: "정상" },
  { itemNo: "43401301", name: "네트워크장비(스위치) 48포트 L3 관리형", company: "네트웍솔루션(주)", category: "네트워크 장비", price: "1,200,000원", status: "정상" },
  { itemNo: "32101501", name: "소방장비(소화기) 분말소화기 3.3kg", company: "안전소방(주)", category: "소방장비", price: "35,000원", status: "정상" },
  { itemNo: "32101301", name: "소방장비(소방호스) 압송용 65A 20m", company: "안전소방(주)", category: "소방장비", price: "78,000원", status: "정상" },
  { itemNo: "39108101", name: "보호복(일반작업용) 반사통풍형 XL", company: "안전복지(주)", category: "보호용 피복 및 장비", price: "25,000원", status: "정상" },
  { itemNo: "21201401", name: "의료기기(혈압계) 자동전자혈압계 상완식", company: "메디칼텍(주)", category: "의료기기 및 용품", price: "95,000원", status: "정상" },
  { itemNo: "25101101", name: "사무용가구(책상) 일반 사무용 책상 1400x700", company: "오피스퍼니처(주)", category: "사무용 가구", price: "145,000원", status: "정상" },
  { itemNo: "25103101", name: "교육기관용가구(학생책상) 1인용 600x400", company: "에듀퍼니처(주)", category: "교육기관용 가구", price: "68,000원", status: "정상" },
  { itemNo: "47102101", name: "냉난방기(에어컨) 벽걸이형 18평형", company: "클라이밋텍(주)", category: "냉난방기 및 보일러", price: "680,000원", status: "정상" },
  { itemNo: "61101101", name: "농산물(쌀) 경기미 특등급 20kg", company: "경기농협(주)", category: "농산물", price: "58,000원", status: "정상" },
];

const GRID = "105px 316px 127px 232px 115px 95px 97px";

type BidStatus = "공고중" | "검토중" | "선정완료" | "마감";

type BidRow = {
  status: BidStatus;
  name: string;
  org: string;
  phone: string;
  budget: string;
  due: string;
  bids: string;
};

const BIDS: BidRow[] = [
  { status: "공고중", name: "2026년 2분기 도로보수 공사 자재 구매", org: "경기도 화성시 도로과", phone: "031-369-1234", budget: "8,000,000원", due: "2026-06-15", bids: "3건" },
  { status: "검토중", name: "2026년 화성시 도시개발 건자재 대규모 구매 (다수 업체 비교)", org: "경기도 화성시 도시건설과", phone: "031-369-2222", budget: "35,000,000원", due: "2026-07-31", bids: "10건" },
  { status: "검토중", name: "화성시청 IT장비 신규 구축 프로젝트", org: "경기도 화성시 정보통신과", phone: "031-369-5678", budget: "42,000,000원", due: "2026-05-30", bids: "5건" },
  { status: "선정완료", name: "화성시 소방서 장비 보강 구매", org: "경기도 화성시 안전총괄과", phone: "031-369-9012", budget: "7,500,000원", due: "2026-05-10", bids: "4건" },
  { status: "공고중", name: "2026학년도 교육기관 가구 구매", org: "경기도 화성시 교육지원청", phone: "031-369-3456", budget: "35,000,000원", due: "2026-07-01", bids: "2건" },
  { status: "마감", name: "화성시 보건소 의료기기 교체", org: "경기도 화성시 보건소", phone: "031-369-7890", budget: "1,200,000원", due: "2026-04-01", bids: "6건" },
  { status: "공고중", name: "수지 보강 프로젝트 발전기 및 베어링 구매", org: "경기도 화성시 화폐과", phone: "031-369-2345", budget: "15,000,000원", due: "2026-06-20", bids: "1건" },
  { status: "검토중", name: "2026년 환경미관리용차 구매", org: "경기도 화성시 환경과", phone: "031-369-6789", budget: "28,000,000원", due: "2026-06-10", bids: "3건" },
  { status: "공고중", name: "시설관리용 실내조명 및 전기 자재 구매", org: "경기도 화성시 시설관리과", phone: "031-369-0123", budget: "4,500,000원", due: "2026-07-15", bids: "4건" },
  { status: "선정완료", name: "화성시 문화강승재단 물품 발주대 구매", org: "경기도 화성시 문화스포과", phone: "031-369-4567", budget: "3,000,000원", due: "2026-05-05", bids: "2건" },
];

type QuoteItem = {
  no: string;
  name: string;
  qty: string;
};

type BidEntry = {
  company: string;
  phone: string;
  amount: string;
  state: "접수";
  spec: string;
  date: string;

  quoteNo?: string;
  vendorId?: string;
  budgetRatio?: string;
  items?: QuoteItem[];
};

const BID_ENTRIES: BidEntry[] = [
  {
    company: "경기건설(주)",
    phone: "031-123-4567",
    amount: "7,800,000원",
    state: "접수",
    spec: "레미콘 50㎥, 아스콘 30톤 포함 운송비",
    date: "2026-05-03",
    quoteNo: "qb001",
    vendorId: "v001",
    budgetRatio: "97.5%",
    items: [
      { no: "1", name: "레미콘 24-40-140", qty: "50㎥" },
      { no: "2", name: "아스콘 표준배합 15-40", qty: "30톤" },
    ],
  },
  { company: "화성레미콘(주)", phone: "031-234-5678", amount: "8,200,000원", state: "접수", spec: "레미콘 50㎥, 아스콘 30톤, 2일 내 납품 가능", date: "2026-05-04" },
  { company: "포장산업(주)", phone: "031-345-6789", amount: "7,900,000원", state: "접수", spec: "레미콘 50㎥, 아스콘 30톤, 여성기업 할인 적용", date: "2026-05-05" },
];

const BID_FILTERS: { label: "전체" | BidStatus; count: string }[] = [
  { label: "전체", count: "32" },
  { label: "공고중", count: "13" },
  { label: "검토중", count: "8" },
  { label: "선정완료", count: "6" },
  { label: "마감", count: "5" },
];

const BID_GRID = "101.61px 253.22px 191.44px 126.59px 124.34px 110.61px 68.27px 110.59px";

const ENTRY_GRID = "163.17px 160.88px 146.52px 94.83px 247.89px 107.7px 105.16px";

export function ContentsView() {
  const [tab, setTab] = useState<Tab>("상품 검수");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<ProductRow[]>(PRODUCTS);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [bidQ, setBidQ] = useState("");
  const [bidFilter, setBidFilter] = useState<"전체" | BidStatus>("전체");
  const [bidExpanded, setBidExpanded] = useState(true);
  const [bids, setBids] = useState<BidRow[]>(BIDS);
  const [bidDeleteTarget, setBidDeleteTarget] = useState<BidRow | null>(null);
  const [quoteEntry, setQuoteEntry] = useState<BidEntry | null>(null);

  const filtered = useMemo(() => {
    const k = q.trim();
    if (!k) return products;
    return products.filter((p) => (p.name + p.company + p.itemNo).includes(k));
  }, [q, products]);

  const bidFiltered = useMemo(() => {
    const k = bidQ.trim();
    return bids.filter((b) => (bidFilter === "전체" || b.status === bidFilter) && (!k || (b.name + b.org).includes(k)));
  }, [bidQ, bidFilter, bids]);

  return (
    <div style={{ width: "100%" }}>

      <div style={{ marginBottom: "34.16px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, letterSpacing: "-0.56px", lineHeight: "25px", color: "#1D1D1F" }}>콘텐츠 검수</h1>
        <p style={{ margin: "2.44px 0 0", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.4)" }}>부적격 상품/공고 모니터링 및 강제 삭제 관리</p>
      </div>

      <div className="flex items-end" style={{ gap: "2.44px", borderBottom: "1px solid rgba(210,210,215,0.2)", marginBottom: "29.28px" }}>
        {(["상품 검수", "공고 검수"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #1E3A5F" : "2px solid transparent",
                padding: "14.64px 24.4px 16.64px",
                marginBottom: "-1px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "-0.293px",
                lineHeight: "24.5px",
                color: active ? "#1E3A5F" : "rgba(29,29,31,0.4)",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "상품 검수" ? (
        <>

          <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "19.52px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#9CA3AF", whiteSpace: "nowrap" }}>업체 검색:</span>
            <div className="flex items-center" style={{ width: "468px", flexShrink: 0, height: "46px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 1px" }}>
              <span className="flex items-center justify-center" style={{ width: "44px", height: "44px", flexShrink: 0 }}>
                <SearchIcon />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="업체명, 품명, 물품번호로 검색"
                className="min-w-0 flex-1"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "9.75px 0",
                  fontSize: "17.08px",
                  fontWeight: 400,
                  letterSpacing: "-0.2928px",
                  lineHeight: "24.4px",
                  color: "#111827",
                }}
              />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "19.52px", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>

            <div className="grid" style={{ gridTemplateColumns: GRID, background: "rgba(29,29,31,0.02)", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
              {["물품번호", "품명", "업체", "카테고리", "가격", "상태", ""].map((h, i) => (
                <div key={i} className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{h}</span>
                </div>
              ))}
            </div>

            {filtered.map((p) => (
              <div key={p.itemNo} className="grid" style={{ gridTemplateColumns: GRID, borderTop: "1px solid rgba(210,210,215,0.1)" }}>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{p.itemNo}</span>
                </div>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px", gap: "12.2px" }}>
                  <div className="overflow-hidden" style={{ width: "39px", height: "39px", borderRadius: "14.64px", background: "rgba(29,29,31,0.03)", flexShrink: 0 }}>

                    <img
                      src={`/admin/products/${p.itemNo}.png`}
                      alt=""
                      width={39}
                      height={39}
                      style={{ width: "39px", height: "39px", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F" }}>{p.name}</span>
                </div>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)" }}>{p.company}</span>
                </div>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{p.category}</span>
                </div>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F" }}>{p.price}</span>
                </div>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <span className="inline-flex items-center justify-center" style={{ borderRadius: "9999px", height: "25px", padding: "0 13.18px", background: "#ECFDF5", border: "1px solid #A7F3D0", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "#047857", whiteSpace: "nowrap", flexShrink: 0 }}>{p.status}</span>
                </div>

                <div className="flex items-center" style={{ padding: "17.13px 24.4px" }}>
                  <button type="button" onClick={() => setDeleteTarget(p)} className="inline-flex items-center justify-center" style={{ borderRadius: "9.76px", border: "1px solid rgba(210,210,215,0.2)", background: "#fff", padding: "8.3px 13.18px", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.2401px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>삭제</button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-center" style={{ gap: "4.88px", padding: "19.52px 0", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
              <button type="button" disabled className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "default" }} aria-label="이전">
                <PrevChevron />
              </button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", background: "#1F2937", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#FFFFFF" }}>1</button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#4B5563" }}>2</button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "pointer" }} aria-label="다음">
                <NextChevron />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>

          <div className="flex items-center" style={{ gap: "9.76px", marginBottom: "24.4px" }}>
            {BID_FILTERS.map((f) => {
              const active = bidFilter === f.label;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setBidFilter(f.label)}
                  className="flex items-center"
                  style={{
                    height: "41.5px",
                    borderRadius: "9.76px",
                    padding: "0 24.4px 0 17.08px",
                    background: active ? "#111827" : "#FFFFFF",
                    border: active ? "none" : "1px solid #E5E7EB",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: active ? "#FFFFFF" : "#4B5563", whiteSpace: "nowrap" }}>{f.label}</span>
                  <span style={{ marginLeft: "14.64px", fontSize: "10px", fontWeight: 600, letterSpacing: "-0.15px", lineHeight: "18px", color: active ? "#FFFFFF" : "#6B7280" }}>{f.count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center" style={{ gap: "14.64px", marginBottom: "24.4px" }}>
            <div className="relative min-w-0 flex-1">
              <span className="absolute flex items-center justify-center" style={{ left: "14.64px", top: "50%", transform: "translateY(-50%)" }}>
                <BidSearchIcon />
              </span>
              <input
                value={bidQ}
                onChange={(e) => setBidQ(e.target.value)}
                placeholder="공고명 또는 요청 기관으로 검색"
                className="w-full placeholder:font-medium placeholder:text-[#9CA3AF]"
                style={{
                  height: "50.77px",
                  borderRadius: "9.76px",
                  border: "1px solid #E5E7EB",
                  background: "#fff",
                  padding: "13.18px 20.52px 13.18px 44.92px",
                  outline: "none",
                  fontSize: "17.08px",
                  fontWeight: 400,
                  letterSpacing: "-0.2928px",
                  lineHeight: "24.4px",
                  color: "#111827",
                }}
              />
            </div>
            <div className="flex items-center" style={{ gap: "9.76px", flexShrink: 0 }}>
              <FilterIcon />
              <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "#9CA3AF", whiteSpace: "nowrap" }}>전체 상태</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "9.76px", border: "1px solid #E5E7EB", overflow: "hidden" }}>

            <div className="grid" style={{ gridTemplateColumns: BID_GRID, background: "#F9FAFB" }}>
              {["상태", "공고명", "요청 기관", "전화번호", "예산", "마감일", "입찰수", ""].map((h, i) => (
                <div key={i} className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{h}</span>
                </div>
              ))}
            </div>

            {bidFiltered.map((b, i) => {
              const isFirst = b === BIDS[0];
              return (
                <Fragment key={b.name}>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: BID_GRID,
                      minHeight: "60.63px",
                      ...(i > 0 ? { borderTop: "1px solid #F3F4F6" } : {}),
                      ...(isFirst ? { background: "rgba(249,250,251,0.5)" } : {}),
                    }}
                  >

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span className="inline-flex items-center" style={{ borderRadius: "9999px", padding: "5.88px 13.2px", background: "#F3F4F6", border: "1px solid #D1D5DB", fontSize: "10px", fontWeight: 500, letterSpacing: "-0.15px", lineHeight: "18px", color: b.status === "마감" ? "#9CA3AF" : "#374151", whiteSpace: "nowrap", flexShrink: 0 }}>{b.status}</span>
                    </div>

                    <div className="flex min-w-0 items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span className="overflow-hidden" style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827", whiteSpace: "nowrap" }}>{b.name}</span>
                    </div>

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280", whiteSpace: "nowrap" }}>{b.org}</span>
                    </div>

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>{b.phone}</span>
                    </div>

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span style={{ fontSize: "14.64px", fontWeight: 700, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827", whiteSpace: "nowrap" }}>{b.budget}</span>
                    </div>

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#9CA3AF" }}>{b.due}</span>
                    </div>

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px" }}>
                      <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#4B5563" }}>{b.bids}</span>
                    </div>

                    <div className="flex items-center" style={{ padding: "14.64px 19.52px", gap: "9.76px" }}>
                      <button type="button" onClick={() => setBidDeleteTarget(b)} style={{ borderRadius: "4.88px", border: "none", background: "transparent", padding: "4.88px 9.76px", fontSize: "10px", fontWeight: 400, letterSpacing: "-0.2401px", lineHeight: "18px", color: "#9CA3AF", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>삭제</button>
                      <button
                        type="button"
                        onClick={isFirst ? () => setBidExpanded((v) => !v) : undefined}
                        className="flex items-center justify-center"
                        style={{ width: "24.39px", height: "24.39px", border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                        aria-label={isFirst && bidExpanded ? "접기" : "펼치기"}
                      >
                        {isFirst && bidExpanded ? <ChevUpIcon /> : <ChevDownIcon />}
                      </button>
                    </div>
                  </div>

                  {isFirst && bidExpanded && (
                    <div style={{ borderTop: "1px solid #F3F4F6", background: "#F9FAFB", padding: "20.52px 29.28px 19.52px" }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: "14.64px" }}>
                        <span style={{ fontSize: "14.64px", fontWeight: 700, letterSpacing: "-0.4099px", lineHeight: "19.52px", color: "#111827" }}>참여 업체 정보</span>
                        <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>총 3건 참여</span>
                      </div>
                      <div style={{ background: "#fff", borderRadius: "9.76px", border: "1px solid #E5E7EB", overflow: "hidden" }}>

                        <div className="grid" style={{ gridTemplateColumns: ENTRY_GRID, background: "#F9FAFB" }}>
                          {["업체명", "전화번호", "제안 금액", "상태", "규격 요약", "제출일", ""].map((h, hi) => (
                            <div key={hi} className="flex items-center" style={{ padding: "9.76px 14.64px" }}>
                              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{h}</span>
                            </div>
                          ))}
                        </div>
                        {BID_ENTRIES.map((en, ei) => (
                          <div key={en.company} className="grid" style={{ gridTemplateColumns: ENTRY_GRID, ...(ei > 0 ? { borderTop: "1px solid #F3F4F6" } : {}) }}>
                            <div className="flex items-center" style={{ padding: "12.2px 14.64px" }}>
                              <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827", whiteSpace: "nowrap" }}>{en.company}</span>
                            </div>
                            <div className="flex items-center" style={{ padding: "12.2px 14.64px" }}>
                              <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>{en.phone}</span>
                            </div>
                            <div className="flex items-center" style={{ padding: "12.2px 14.64px" }}>
                              <span style={{ fontSize: "14.64px", fontWeight: 700, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827", whiteSpace: "nowrap" }}>{en.amount}</span>
                            </div>
                            <div className="flex items-center" style={{ padding: "12.2px 14.64px" }}>
                              <span className="inline-flex items-center" style={{ borderRadius: "9999px", padding: "3.44px 10.76px", background: "#F3F4F6", border: "1px solid #E5E7EB", fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#4B5563", whiteSpace: "nowrap", flexShrink: 0 }}>{en.state}</span>
                            </div>
                            <div className="flex min-w-0 items-center" style={{ padding: "12.2px 14.64px" }}>
                              <span className="overflow-hidden" style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#4B5563", whiteSpace: "nowrap" }}>{en.spec}</span>
                            </div>
                            <div className="flex items-center" style={{ padding: "12.2px 14.64px" }}>
                              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{en.date}</span>
                            </div>
                            <div className="flex items-center" style={{ padding: "12.2px 14.64px" }}>
                              <button type="button" onClick={() => setQuoteEntry(en)} style={{ border: "none", background: "transparent", padding: 0, fontSize: "10px", fontWeight: 500, letterSpacing: "-0.2401px", lineHeight: "18px", color: "#6B7280", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>견적서 열람</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          <div style={{ paddingTop: "19.52px" }}>
            <div className="flex items-center justify-center" style={{ gap: "4.88px", padding: "19.52px 0" }}>
              <button type="button" disabled className="flex items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "default" }} aria-label="이전">
                <PrevChevron />
              </button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "7.32px", background: "#1F2937", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#FFFFFF" }}>1</button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#4B5563" }}>2</button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#4B5563" }}>3</button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "pointer", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", color: "#4B5563" }}>4</button>
              <button type="button" className="flex items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "7.32px", background: "transparent", border: "none", cursor: "pointer" }} aria-label="다음">
                <NextChevron />
              </button>
            </div>

            <div className="flex items-center justify-between" style={{ paddingTop: "19.52px" }}>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>1 / 4 페이지</span>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>총 32건</span>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <DeleteModal
          title="상품 삭제"
          message={`"${deleteTarget.name}" 상품을 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            setProducts((prev) => prev.filter((x) => x.itemNo !== deleteTarget.itemNo));
            setDeleteTarget(null);
          }}
        />
      )}

      {bidDeleteTarget && (
        <DeleteModal
          title="공고 삭제"
          message={`"${bidDeleteTarget.name}" 공고를 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`}
          onCancel={() => setBidDeleteTarget(null)}
          onConfirm={() => {
            setBids((prev) => prev.filter((x) => x.name !== bidDeleteTarget.name));
            setBidDeleteTarget(null);
          }}
        />
      )}

      {quoteEntry && <QuoteDetailModal bid={BIDS[0]} entry={quoteEntry} onClose={() => setQuoteEntry(null)} />}
    </div>
  );
}

function DeleteModal({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
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
            className="flex flex-1 items-center justify-center"
            style={{ height: "43.89px", borderRadius: "9.76px", border: "none", background: "#DC2626", cursor: "pointer", fontSize: "14.64px", fontWeight: 700, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#FFFFFF" }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteDetailModal({ bid, entry, onClose }: { bid: BidRow; entry: BidEntry; onClose: () => void }) {
  const label: CSSProperties = { margin: 0, fontSize: "11px", fontWeight: 600, letterSpacing: "0.55px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "19.52px" }} onClick={onClose}>
      <div
        className="flex w-full flex-col overflow-y-auto"
        style={{ maxWidth: "624.62px", maxHeight: "90vh", background: "#FFFFFF", borderRadius: "19.52px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex shrink-0 items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", background: "#FFFFFF", borderBottom: "1px solid rgba(210,210,215,0.1)" }}>
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: "#1D1D1F" }}>견적서 상세</p>
            {entry.quoteNo && <p style={{ margin: "2.44px 0 0", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{`견적서 번호: ${entry.quoteNo}`}</p>}
          </div>
          <button type="button" onClick={onClose} className="flex shrink-0 items-center justify-center" style={{ width: "39.03px", height: "39.03px", borderRadius: "9.76px", background: "transparent", border: "none", cursor: "pointer" }} aria-label="닫기">
            <ModalCloseIcon />
          </button>
        </div>

        <div className="flex flex-col" style={{ padding: "29.28px" }}>

          <div className="flex items-center" style={{ gap: "9.76px" }}>
            <span className="inline-flex items-center justify-center" style={{ height: "33.34px", borderRadius: "9999px", padding: "0 15.64px", background: "#F3F4F6", border: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "#4B5563", whiteSpace: "nowrap", flexShrink: 0 }}>{entry.state}</span>
            <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{`제출일 ${entry.date}`}</span>
          </div>

          <div style={{ paddingTop: "24.4px" }}>
            <div style={{ background: "rgba(29,29,31,0.016)", border: "1px solid rgba(210,210,215,0.15)", borderRadius: "14.64px", padding: "20.52px" }}>
              <p style={label}>공고 정보</p>
              <p style={{ margin: 0, paddingTop: "9.76px", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "27px", color: "#1D1D1F" }}>{bid.name}</p>
              <div className="flex items-center" style={{ paddingTop: "9.76px", gap: "24.4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)", whiteSpace: "nowrap" }}>{`요청: ${bid.org}`}</span>
                <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)", whiteSpace: "nowrap" }}>{`전화: ${bid.phone}`}</span>
              </div>
              <div className="flex items-center" style={{ paddingTop: "9.76px", gap: "24.4px" }}>
                <span className="flex items-center" style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)" }}>{"예산: \u200b"}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F" }}>{bid.budget}</span>
                </span>
                <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)", whiteSpace: "nowrap" }}>{`마감: ${bid.due}`}</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: "24.4px" }}>
            <p style={{ ...label, paddingBottom: "14.64px" }}>제안 업체</p>
            <div className="flex items-center" style={{ gap: "14.64px" }}>
              <span className="flex items-center justify-center" style={{ width: "58.55px", height: "58.55px", borderRadius: "19.52px", background: "#1E3A5F", flexShrink: 0, fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", lineHeight: "26.25px", color: "#FFFFFF" }}>{entry.company.charAt(0)}</span>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, letterSpacing: "-0.21px", lineHeight: "25.2px", color: "#1D1D1F" }}>{entry.company}</p>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{entry.vendorId ? `업체ID: ${entry.vendorId} · ${entry.phone}` : entry.phone}</p>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: "24.4px" }}>
            <div style={{ background: "rgba(30,58,95,0.04)", border: "1px solid rgba(30,58,95,0.1)", borderRadius: "14.64px", padding: "25.4px" }}>
              <p style={{ ...label, paddingBottom: "9.76px" }}>제안 금액</p>
              <div className="flex items-center">
                <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.42px", lineHeight: "50.4px", color: "#1D1D1F" }}>{entry.amount.replace(/원$/, "")}</span>
                <span style={{ width: "4.88px", flexShrink: 0 }} />
                <span style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "-0.24px", lineHeight: "28.8px", color: "#1D1D1F" }}>원</span>
              </div>
              {entry.budgetRatio && <p style={{ margin: 0, paddingTop: "4.88px", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)" }}>{`예산 대비 ${entry.budgetRatio}`}</p>}
            </div>
          </div>

          <div style={{ paddingTop: "24.4px" }}>
            <p style={{ ...label, paddingBottom: "9.76px" }}>규격 요약</p>
            <div className="flex items-center" style={{ background: "rgba(29,29,31,0.016)", border: "1px solid rgba(210,210,215,0.15)", borderRadius: "14.64px", padding: "20.52px" }}>
              <span style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "21.125px", color: "rgba(29,29,31,0.7)" }}>{entry.spec}</span>
            </div>
          </div>

          {entry.items && (
            <div style={{ paddingTop: "24.4px" }}>
              <p style={{ ...label, paddingBottom: "14.64px" }}>요청 품목</p>
              {entry.items.map((it, i) => (
                <div key={it.no} style={i > 0 ? { paddingTop: "9.76px" } : undefined}>
                  <div className="flex items-center" style={{ background: "rgba(29,29,31,0.016)", border: "1px solid rgba(210,210,215,0.15)", borderRadius: "14.64px", padding: "13.2px 20.52px", gap: "14.64px" }}>
                    <span style={{ width: "24.39px", flexShrink: 0, fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.3)" }}>{it.no}</span>
                    <span className="min-w-0 flex-1" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "#1D1D1F" }}>{it.name}</span>
                    <span style={{ flexShrink: 0, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: "rgba(29,29,31,0.6)", whiteSpace: "nowrap" }}>{it.qty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ paddingTop: "24.4px" }}>
            <div className="flex" style={{ paddingTop: "9.76px", gap: "14.64px" }}>
              <button type="button" className="flex flex-1 items-center justify-center" style={{ height: "54px", borderRadius: "14.64px", border: "none", background: "#1E3A5F", cursor: "pointer", gap: "7.32px" }}>
                <DownloadIcon />
                <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#FFFFFF", whiteSpace: "nowrap" }}>견적서 다운로드</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex flex-1 items-center justify-center"
                style={{ height: "54px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "rgba(29,29,31,0.5)", whiteSpace: "nowrap" }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M13.2338 12.016L16.3154 15.1402L15.293 16.1768L12.2114 13.0525C11.645 13.51 11.0258 13.8603 10.3538 14.1037C9.6434 14.3567 8.9138 14.4832 8.165 14.4832C6.9938 14.4832 5.9042 14.1864 4.8962 13.5927C3.917 13.0087 3.1442 12.2204 2.5778 11.2276C1.9826 10.2056 1.685 9.10097 1.685 7.91356C1.685 6.72615 1.9826 5.62147 2.5778 4.59952C3.1442 3.60677 3.917 2.82328 4.8962 2.24904C5.9042 1.6456 6.9938 1.34388 8.165 1.34388C9.3362 1.34388 10.4258 1.6456 11.4338 2.24904C12.413 2.82328 13.1906 3.60677 13.7666 4.59952C14.3522 5.62147 14.645 6.72615 14.645 7.91356C14.645 8.67272 14.5202 9.41242 14.2706 10.1327C14.0306 10.814 13.685 11.4417 13.2338 12.016ZM11.7794 11.4758C12.2306 11.0086 12.581 10.4733 12.8306 9.86987C13.0802 9.24696 13.205 8.59486 13.205 7.91356C13.205 6.98894 12.9746 6.12758 12.5138 5.32949C12.0722 4.56059 11.4722 3.95229 10.7138 3.50458C9.9266 3.0374 9.077 2.80381 8.165 2.80381C7.253 2.80381 6.4034 3.0374 5.6162 3.50458C4.8578 3.95229 4.2578 4.56059 3.8162 5.32949C3.3554 6.12758 3.125 6.98894 3.125 7.91356C3.125 8.83818 3.3554 9.69954 3.8162 10.4976C4.2578 11.2665 4.8578 11.8748 5.6162 12.3225C6.4034 12.7897 7.253 13.0233 8.165 13.0233C8.837 13.0233 9.4802 12.8968 10.0946 12.6437C10.6898 12.3907 11.2178 12.0354 11.6786 11.578L11.7794 11.4758Z" fill="#9CA3AF" />
    </svg>
  );
}

function BidSearchIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M11.6793 10.7922L14.7957 13.9517L13.7618 15L10.6454 11.8404C10.0726 12.3031 9.44637 12.6574 8.76677 12.9035C8.04834 13.1594 7.3105 13.2873 6.55324 13.2873C5.3688 13.2873 4.26688 12.9871 3.24749 12.3867C2.25723 11.7962 1.47569 10.9989 0.90289 9.99491C0.300963 8.96141 0 7.84424 0 6.64341C0 5.44259 0.300963 4.32542 0.90289 3.29192C1.47569 2.28795 2.25723 1.4956 3.24749 0.914872C4.26688 0.304614 5.3688 -0.000513477 6.55324 -0.000513477C7.73767 -0.000513477 8.83959 0.304614 9.85898 0.914872C10.8492 1.4956 11.6356 2.28795 12.2181 3.29192C12.8104 4.32542 13.1065 5.44259 13.1065 6.64341C13.1065 7.41116 12.9803 8.15921 12.7278 8.88759C12.4851 9.57659 12.1356 10.2115 11.6793 10.7922ZM10.2085 10.2459C10.6648 9.77344 11.0191 9.23209 11.2716 8.62183C11.524 7.99189 11.6502 7.33241 11.6502 6.64341C11.6502 5.70834 11.4172 4.83725 10.9512 4.03014C10.5046 3.25255 9.89781 2.63737 9.13084 2.1846C8.33474 1.71214 7.47554 1.47591 6.55324 1.47591C5.63093 1.47591 4.77173 1.71214 3.97563 2.1846C3.20866 2.63737 2.60188 3.25255 2.15529 4.03014C1.68928 4.83725 1.45627 5.70834 1.45627 6.64341C1.45627 7.57849 1.68928 8.44958 2.15529 9.25669C2.60188 10.0343 3.20866 10.6495 3.97563 11.1022C4.77173 11.5747 5.63093 11.8109 6.55324 11.8109C7.23283 11.8109 7.8833 11.683 8.50464 11.427C9.10657 11.1711 9.64054 10.8119 10.1065 10.3493L10.2085 10.2459Z" fill="#9CA3AF" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width={11} height={8} viewBox="0 0 11 8" fill="none" aria-hidden>
      <path d="M4.27806 7.44065H6.72266V6.20054H4.27806V7.44065ZM0 4.85194e-07V1.24011H11.0007V4.85194e-07H0ZM1.83345 4.34038H9.16726V3.10027H1.83345V4.34038Z" fill="#9CA3AF" />
    </svg>
  );
}

function ChevDownIcon() {
  return (
    <svg width={9} height={6} viewBox="0 0 9 6" fill="none" aria-hidden>
      <path d="M4.50006 3.5446L7.9954 0.000532639L9.00013 1.00492L4.50006 5.56773L0 1.00492L1.00473 0.000532639L4.50006 3.5446Z" fill="#9CA3AF" />
    </svg>
  );
}

function ChevUpIcon() {
  return (
    <svg width={9} height={6} viewBox="0 0 9 6" fill="none" aria-hidden>
      <path d="M4.49994 2.02313L1.0046 5.56719L-0.000128285 4.5628L4.49994 0L9 4.5628L7.99527 5.56719L4.49994 2.02313Z" fill="#9CA3AF" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 19 19" fill="none" aria-hidden>
      <path d="M14.0495 3.80054H18.7327V5.70047H16.8594V18.05C16.8594 18.316 16.7688 18.5408 16.5878 18.7245C16.4067 18.9082 16.185 19 15.9228 19H2.8099C2.54764 19 2.32597 18.9082 2.14489 18.7245C1.96381 18.5408 1.87327 18.316 1.87327 18.05V5.70047H0V3.80054H4.68316V0.950643C4.68316 0.684652 4.77371 0.459826 4.95479 0.276165C5.13587 0.092506 5.35754 0.000675472 5.6198 0.000675472H13.1129C13.3751 0.000675472 13.5968 0.092506 13.7779 0.276165C13.959 0.459826 14.0495 0.684652 14.0495 0.950643V3.80054ZM14.9861 5.70047H3.74653V17.1001H14.9861V5.70047ZM6.55643 8.55037H8.4297V14.2502H6.55643V8.55037ZM10.303 8.55037H12.1762V14.2502H10.303V8.55037ZM6.55643 1.90061V3.80054H12.1762V1.90061H6.55643Z" fill="#EF4444" />
    </svg>
  );
}

function ModalCloseIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M5.91598 4.66013L10.5111 -0.000403281L11.832 1.33927L7.23685 5.9998L11.832 10.6603L10.5111 12L5.91598 7.33947L1.32086 12L0 10.6603L4.59512 5.9998L0 1.33927L1.32086 -0.000403281L5.91598 4.66013Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width={10} height={11} viewBox="0 0 10 11" fill="none" aria-hidden>
      <path d="M0 9.57225H9.99959V10.6985H0V9.57225ZM5.55533 6.29493L8.93297 2.8712L9.71072 3.67082L4.9998 8.44602L0.288877 3.67082L1.06662 2.8712L4.44426 6.29493V-0.000677149H5.55533V6.29493Z" fill="white" />
    </svg>
  );
}

function PrevChevron() {
  return (
    <svg width={6} height={10} viewBox="0 0 6 10" fill="none" aria-hidden>
      <path d="M2.18013 4.98424L5.99921 8.85618L4.91688 9.96916L0 4.98424L4.91688 -0.000688041L5.99921 1.1123L2.18013 4.98424Z" fill="#D1D5DB" />
    </svg>
  );
}

function NextChevron() {
  return (
    <svg width={6} height={10} viewBox="0 0 6 10" fill="none" aria-hidden>
      <path d="M3.81987 4.98424L0.00079 8.85618L1.08312 9.96916L6 4.98424L1.08312 -0.000688041L0.00079 1.1123L3.81987 4.98424Z" fill="#4B5563" />
    </svg>
  );
}
