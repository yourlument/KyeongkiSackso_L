"use client";

import { useState } from "react";

export function QuoteRegisterButton({ disabled = false }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  if (disabled) {
    return (
      <span
        className="flex items-center"
        aria-disabled="true"
        style={{ gap: "6px", padding: "12.2px 19.52px", borderRadius: "14.64px", background: "#F5F5F7", color: "rgba(29,29,31,0.3)", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", whiteSpace: "nowrap", cursor: "not-allowed" }}
      >
        <span style={{ fontSize: "15px", lineHeight: 1 }}>+</span> 공고 등록
      </span>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center"
        style={{ gap: "6px", padding: "12.2px 19.52px", borderRadius: "14.64px", background: "#1E3A5F", color: "#fff", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", whiteSpace: "nowrap", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: "15px", lineHeight: 1 }}>+</span> 공고 등록
      </button>
      {open && <QuoteRegisterModal onClose={() => setOpen(false)} />}
    </>
  );
}

type ItemRow = { name: string; qty: string; unit: string; spec: string };
const emptyItem = (): ItemRow => ({ name: "", qty: "", unit: "EA(개)", spec: "" });

const UNIT_OPTIONS = ["EA(개)", "SET(세트)", "BOX(박스)", "㎥", "㎡", "m", "kg", "ton", "L"];

type SubCat = { name: string; subs: string[] };
type TopCat = { name: string; subs: SubCat[] };
const CATEGORY_TREE: TopCat[] = [
  {
    name: "도로교통 및 토목 분야",
    subs: [
      {
        name: "도로 건설 및 유지보수",
        subs: [
          "도로포장재(레미콘, 아스콘, 시멘트, 콘크리트)",
          "도로용 도료(차선도색용 페인트)",
          "그레이팅",
          "맨홀",
          "토목용보강재",
          "석재",
          "토목자재",
          "도로 보수 공사 서비스",
          "유지보수 대행 서비스",
        ],
      },
      { name: "교통 안전 및 관제", subs: [] },
      { name: "운송 및 특수 차량", subs: [] },
    ],
  },
  { name: "건축시설 및 전기/설비 분야", subs: [] },
  { name: "일반행정 및 교육/지원 분야", subs: [] },
  { name: "재난안전 및 소방/보건 분야", subs: [] },
  { name: "정보통신 및 디지털/4차산업 분야", subs: [] },
  { name: "환경/산림 및 조경/청소 분야", subs: [] },
  { name: "복지/식품 및 문화/관광 분야", subs: [] },
];

export function QuoteRegisterModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  const [type, setType] = useState<"물품 견적" | "용역 견적">("물품 견적");
  const [cat1, setCat1] = useState("");
  const [cat2, setCat2] = useState("");
  const [cat3, setCat3] = useState("");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budgetTbd, setBudgetTbd] = useState(false);
  const [budget, setBudget] = useState("");

  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);
  const [dueDate, setDueDate] = useState("");
  const [delivery, setDelivery] = useState<"상차도" | "하차도">("상차도");
  const [place, setPlace] = useState("");
  const [placeDetail, setPlaceDetail] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const isGoods = type === "물품 견적";

  const [tried1, setTried1] = useState(false);
  const _top = CATEGORY_TREE.find((c) => c.name === cat1);
  const _mid = _top?.subs.find((s) => s.name === cat2);

  const catOk = !!cat1 && (!_top?.subs.length || !!cat2) && (!_mid?.subs.length || !!cat3);
  const errTitle = !title.trim();
  const errDeadline = !deadline;
  const errBudget = !budgetTbd && !budget.trim();
  const errCat = !catOk;

  const step1Errors = [
    errTitle && "공고 제목을 입력하세요.",
    errDeadline && "마감 일시를 선택하세요.",
    errBudget && "예산을 입력하세요.",
    errCat && "카테고리를 선택하세요.",
  ].filter(Boolean) as string[];
  function goStep2() {
    setTried1(true);
    if (step1Errors.length === 0) setStep(2);
  }

  const npsCode = (() => {
    if (!catOk || !cat1) return "";
    const i1 = CATEGORY_TREE.findIndex((c) => c.name === cat1);
    const i2 = _top?.subs.findIndex((s) => s.name === cat2) ?? -1;
    const i3 = _mid?.subs.findIndex((s) => s === cat3) ?? -1;
    const pad = (n: number) => String(Math.max(0, n) + 1).padStart(2, "0");
    return `${pad(i1)}${pad(i2)}${pad(i3)}000000`;
  })();

  function setItem(i: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {

      await new Promise((r) => setTimeout(r, 300));
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "624.6px", maxWidth: "100%", maxHeight: "calc(100vh - 32px)", borderRadius: "19.52px", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >

        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "19.52px 29.28px 20.52px", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, lineHeight: "20px", letterSpacing: "-0.448px", color: "#1D1D1F", margin: 0 }}>견적 공고 등록</h2>
          <button type="button" aria-label="닫기" onClick={onClose}
            style={{ width: "39px", height: "39px", borderRadius: "9999px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <XIcon />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "29.28px", display: "flex", flexDirection: "column" }}>

          {step === 1 && tried1 && step1Errors.length > 0 && (
            <div style={{ marginBottom: "19.52px", borderRadius: "14.64px", background: "#FEF2F2", border: "1px solid #FEE2E2", padding: "15.64px", display: "flex", flexDirection: "column", gap: "4.88px" }}>
              {step1Errors.map((msg) => (
                <div key={msg} className="flex items-center" style={{ gap: "7.32px" }}>
                  <AlertCircleIcon />
                  <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "#EF4444" }}>{msg}</span>
                </div>
              ))}
            </div>
          )}
          <Stepper step={step} />

          {step === 1 && (
            <Step1
              type={type} setType={setType}
              isGoods={isGoods}
              cat1={cat1} setCat1={setCat1}
              cat2={cat2} setCat2={setCat2}
              cat3={cat3} setCat3={setCat3}
              title={title} setTitle={setTitle}
              deadline={deadline} setDeadline={setDeadline}
              budgetTbd={budgetTbd} setBudgetTbd={setBudgetTbd}
              budget={budget} setBudget={setBudget}
              npsCode={npsCode} budgetErr={tried1 && errBudget}
              onNext={goStep2}
            />
          )}
          {step === 2 && (
            <Step2
              isGoods={isGoods}
              items={items} setItem={setItem}
              addItem={() => setItems((p) => [...p, emptyItem()])}
              dueDate={dueDate} setDueDate={setDueDate}
              delivery={delivery} setDelivery={setDelivery}
              place={place} setPlace={setPlace}
              placeDetail={placeDetail} setPlaceDetail={setPlaceDetail}
              onPrev={() => setStep(1)} onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              isGoods={isGoods}
              type={type} title={title} deadline={deadline}
              budgetTbd={budgetTbd} budget={budget}
              cat1={cat1} cat2={cat2} cat3={cat3}
              dueDate={dueDate} place={place} placeDetail={placeDetail} delivery={delivery}
              onPrev={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.5)", display: "block" };
const captionStyle: React.CSSProperties = { fontSize: "11px", fontWeight: 400, lineHeight: "19.8px", letterSpacing: "-0.165px", color: "rgba(29,29,31,0.4)", display: "block" };
const reqStar = <span style={{ color: "#F87171" }}>*</span>;

const reqStar1 = <span style={{ color: "rgba(29,29,31,0.5)" }}>*</span>;
const inputClass = "w-full box-border outline-none placeholder:text-[#1d1d1f]/30 placeholder:font-medium";
const inputStyle: React.CSSProperties = {
  borderRadius: "14.64px",
  border: "1px solid rgba(210,210,215,0.4)",
  background: "#fff",
  padding: "13.1875px 20.52px",
  fontSize: "13px",
  fontWeight: 400,
  letterSpacing: "-0.293px",
  color: "#1D1D1F",
};
const blockStyle: React.CSSProperties = { paddingTop: "19.52px" };

function Stepper({ step }: { step: number }) {
  const names = ["기본 정보", "물품 상세", "최종 검토"];
  const dot = (n: number) => {
    const done = step >= n;
    return (
      <div style={{ width: "34.2px", height: "34.2px", borderRadius: "9999px", background: done ? "#1E3A5F" : "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: "12px", fontWeight: 700, lineHeight: "21px", letterSpacing: "-0.18px", color: done ? "#FFFFFF" : "rgba(29,29,31,0.3)" }}>{n}</span>
      </div>
    );
  };

  const bar = (n: number) => (
    <div style={{ width: "39px", height: "2.44px", background: step > n ? "#1E3A5F" : "rgba(210,210,215,0.3)", flexShrink: 0 }} />
  );
  return (
    <div className="flex items-center" style={{ gap: "9.76px", height: "34.2px" }}>
      {dot(1)}
      {bar(1)}
      {dot(2)}
      {bar(2)}
      {dot(3)}
      <span style={{ marginLeft: "9.76px", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)" }}>{names[step - 1]}</span>
    </div>
  );
}

function Step1(p: {
  type: "물품 견적" | "용역 견적"; setType: (v: "물품 견적" | "용역 견적") => void;
  isGoods: boolean;
  cat1: string; setCat1: (v: string) => void;
  cat2: string; setCat2: (v: string) => void;
  cat3: string; setCat3: (v: string) => void;
  title: string; setTitle: (v: string) => void;
  deadline: string; setDeadline: (v: string) => void;
  budgetTbd: boolean; setBudgetTbd: (v: boolean) => void;
  budget: string; setBudget: (v: string) => void;
  npsCode: string; budgetErr: boolean;
  onNext: () => void;
}) {
  const top = CATEGORY_TREE.find((c) => c.name === p.cat1);
  const mid = top?.subs.find((s) => s.name === p.cat2);

  return (
    <>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>공고 유형 {reqStar1}</label>
        <SegToggle
          options={["물품 견적", "용역 견적"]}
          value={p.type}
          onChange={(v) => p.setType(v as "물품 견적" | "용역 견적")}
        />
      </div>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>
          카테고리 {reqStar1}{" "}
          <span style={{ fontWeight: 400, color: "rgba(29,29,31,0.3)" }}>{p.isGoods ? "(물품만 표시)" : "(용역/서비스만 표시)"}</span>
        </label>
        <div className="flex" style={{ gap: "9.76px" }}>
          <CatSelect
            value={p.cat1}
            placeholder="대분류"
            options={CATEGORY_TREE.map((c) => c.name)}
            onChange={(v) => { p.setCat1(v); p.setCat2(""); p.setCat3(""); }}
          />
          <CatSelect
            value={p.cat2}
            placeholder="중분류"
            disabled={!top}
            options={(top?.subs ?? []).map((s) => s.name)}
            onChange={(v) => { p.setCat2(v); p.setCat3(""); }}
          />
          <CatSelect
            value={p.cat3}
            placeholder="소분류"
            disabled={!mid}
            options={mid?.subs ?? []}
            onChange={p.setCat3}
          />
        </div>
      </div>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>공고 제목 {reqStar1}</label>
        <input type="text" className={inputClass} value={p.title} onChange={(e) => p.setTitle(e.target.value)} placeholder="공고 제목을 입력하세요" style={inputStyle} />
      </div>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>
          물품식별번호{" "}
          <span style={{ fontWeight: 400, color: "rgba(29,29,31,0.3)" }}>(카테고리 선택 시 자동 입력)</span>
        </label>
        <div className="flex items-center" style={{ height: "51px", boxSizing: "border-box", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", background: "#FAFAFA", padding: "0 20.52px", gap: "9.76px" }}>
          <BarcodeIcon />
          <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "0.65px", color: "rgba(29,29,31,0.6)" }}>{p.npsCode}</span>
        </div>
      </div>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>마감 일시 {reqStar1}</label>
        <DateField mode="datetime" value={p.deadline} onChange={p.setDeadline} />
      </div>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>예산 {reqStar1}</label>
        <label className="flex items-center" style={{ gap: "9.76px", marginBottom: "9.76px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={p.budgetTbd}
            onChange={(e) => p.setBudgetTbd(e.target.checked)}
            style={{ width: "20px", height: "20px", accentColor: "#1E3A5F", margin: 0, cursor: "pointer" }}
          />
          <span style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.6)" }}>예산 미확정</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            inputMode="numeric"
            className={inputClass}
            value={p.budget}
            onChange={(e) => p.setBudget(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="예산 금액 입력"
            disabled={p.budgetTbd}
            style={{ ...inputStyle, paddingRight: "40.04px", background: p.budgetTbd ? "#F5F5F7" : "#fff", cursor: p.budgetTbd ? "not-allowed" : "text" }}
          />
          <span style={{ position: "absolute", right: "20.52px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.4)", pointerEvents: "none" }}>원</span>
        </div>

        {p.budgetErr && (
          <p style={{ margin: "4.88px 0 0", fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "#F87171" }}>예산을 입력해주세요.</p>
        )}
      </div>

      <Footer right={<PrimaryBtn onClick={p.onNext}>다음</PrimaryBtn>} />
    </>
  );
}

function Step2(p: {
  isGoods: boolean;
  items: ItemRow[]; setItem: (i: number, patch: Partial<ItemRow>) => void; addItem: () => void;
  dueDate: string; setDueDate: (v: string) => void;
  delivery: "상차도" | "하차도"; setDelivery: (v: "상차도" | "하차도") => void;
  place: string; setPlace: (v: string) => void;
  placeDetail: string; setPlaceDetail: (v: string) => void;
  onPrev: () => void; onNext: () => void;
}) {

  return (
    <>

      <div style={{ ...blockStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={labelStyle}>{p.isGoods ? <>물품 상세 사양 {reqStar}</> : "용역 세부 품목 (선택)"}</label>
        <button type="button" onClick={p.addItem} className="flex items-center" style={{ gap: "4.88px", border: "none", background: "none", cursor: "pointer", padding: 0 }}>
          <PlusIcon />
          <span style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21px", letterSpacing: "-0.293px", color: "#0071E3" }}>품목 추가</span>
        </button>
      </div>

      {p.items.map((it, i) => (
        <div key={i} style={{ marginTop: i === 0 ? "19.52px" : "9.76px", borderRadius: "14.64px", background: "#F5F5F7", padding: "19.52px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.6)", margin: 0 }}>품목 {i + 1}</p>

          <div style={{ marginTop: "9.76px" }}>
            <label style={{ ...captionStyle, marginBottom: "4.88px" }}>세부 품명{p.isGoods && <> {reqStar}</>}</label>
            <input type="text" className={inputClass} value={it.name} onChange={(e) => p.setItem(i, { name: e.target.value })} placeholder="세부 품명 입력 (ex. A4 복사지)" style={inputStyle} />
          </div>

          <div className="flex" style={{ marginTop: "9.76px", gap: "9.76px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ ...captionStyle, marginBottom: "4.88px" }}>수량{p.isGoods && <> {reqStar}</>}</label>
              <input type="text" inputMode="numeric" className={inputClass} value={it.qty} onChange={(e) => p.setItem(i, { qty: e.target.value.replace(/[^0-9]/g, "") })} placeholder="수량" style={inputStyle} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ ...captionStyle, marginBottom: "4.88px" }}>단위</label>
              <div style={{ position: "relative" }}>
                <select value={it.unit} onChange={(e) => p.setItem(i, { unit: e.target.value })}
                  className="w-full box-border outline-none appearance-none"
                  style={{ ...inputStyle, padding: "13.2px 20.52px", background: "#EFEFEF", paddingRight: "40px", cursor: "pointer" }}>
                  {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevronDown /></span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "9.76px" }}>
            <label style={{ ...captionStyle, marginBottom: "4.88px" }}>색상, 재질 규격 등 세부 요구사항{p.isGoods && <> {reqStar}</>}</label>
            <input type="text" className={inputClass} value={it.spec} onChange={(e) => p.setItem(i, { spec: e.target.value })} placeholder="색상, 재질, 규격 등 상세 요구사항 입력" style={inputStyle} />
          </div>
        </div>
      ))}

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>납기 기한 {reqStar}</label>
        <DateField mode="date" value={p.dueDate} onChange={p.setDueDate} />
      </div>

      {p.isGoods && (
        <div style={blockStyle}>
          <label style={{ ...labelStyle, marginBottom: "7.32px" }}>인도 조건</label>
          <SegToggle options={["상차도", "하차도"]} value={p.delivery} onChange={(v) => p.setDelivery(v as "상차도" | "하차도")} />
        </div>
      )}

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>{p.isGoods ? "납품 장소" : "장소"} {reqStar}</label>
        <div className="flex items-center" style={{ gap: "9.76px" }}>
          <input type="text" className={inputClass} value={p.place} onChange={(e) => p.setPlace(e.target.value)} placeholder="주소 검색 버튼을 눌러 주소를 선택하세요"
            style={{ ...inputStyle, background: "#FAFAFA", flex: 1, minWidth: 0 }} />
          <button type="button" onClick={() => openAddressSearch((addr) => p.setPlace(addr))} className="flex items-center" style={{ flexShrink: 0, gap: "7.32px", borderRadius: "14.64px", background: "#1E3A5F", border: "none", cursor: "pointer", padding: "12.2px 19.52px" }}>
            <SearchWhiteIcon />
            <span style={{ fontSize: "12px", fontWeight: 600, lineHeight: "21px", letterSpacing: "-0.293px", color: "#fff", whiteSpace: "nowrap" }}>주소 검색</span>
          </button>
        </div>

        {!p.isGoods && (
          <input type="text" className={inputClass} value={p.placeDetail} onChange={(e) => p.setPlaceDetail(e.target.value)}
            placeholder="상세 주소 (동/호수, 층수, 부서명 등)" style={{ ...inputStyle, marginTop: "9.76px" }} />
        )}
      </div>

      <Footer left={<PrevBtn onClick={p.onPrev} />} right={<PrimaryBtn onClick={p.onNext}>다음</PrimaryBtn>} />
    </>
  );
}

function Step3(p: {
  isGoods: boolean;
  type: string; title: string; deadline: string;
  budgetTbd: boolean; budget: string;
  cat1: string; cat2: string; cat3: string;
  dueDate: string; place: string; placeDetail: string; delivery: string;
  onPrev: () => void; onSubmit: () => void; submitting: boolean;
}) {
  const fmtBudget = p.budgetTbd
    ? "예산 미확정"
    : p.budget
      ? `${Number(p.budget.replace(/[^0-9]/g, "")).toLocaleString("ko-KR")}원`
      : "-";
  const catPath = [p.cat1, p.cat2, p.cat3].filter(Boolean).join(" > ") || "-";
  const placeFull = [p.place, p.placeDetail].filter(Boolean).join(" ") || "-";
  const reviewRows: Array<[string, string]> = [
    ["유형", p.type],
    ["공고명", p.title || "-"],
    ["카테고리", catPath],
    ["예산", fmtBudget],
    ["마감일", p.deadline || "-"],
    ["납기 기한", p.dueDate || "-"],
    [p.isGoods ? "납품 장소" : "장소", placeFull],
    ...(p.isGoods ? [["인도 조건", p.delivery] as [string, string]] : []),
    ["첨부파일", "없음"],
  ];

  return (
    <>

      <div style={blockStyle}>
        <label style={{ ...labelStyle, marginBottom: "7.32px" }}>첨부파일</label>
        <div style={{ borderRadius: "14.64px", border: "2px dashed rgba(210,210,215,0.3)", padding: "31.28px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "48.8px", height: "48.8px", borderRadius: "9999px", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UploadIcon />
          </div>
          <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.4)", margin: "9.76px 0 0" }}>물품 규격서, 참고 사진, 현장 도면</p>
          <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "21.6px", letterSpacing: "-0.18px", color: "rgba(29,29,31,0.3)", margin: "2.44px 0 0" }}>PDF, JPG, PNG 파일 가능</p>
        </div>
      </div>

      <div style={blockStyle}>
        <div style={{ borderRadius: "14.64px", background: "#F5F5F7", padding: "19.52px" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, lineHeight: "25.2px", letterSpacing: "-0.21px", color: "#1D1D1F", margin: "0 0 9.76px" }}>공고 내용 확인</p>
          {reviewRows.map(([k, v], idx) => (
            <p key={k} style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", margin: idx === 0 ? 0 : "7.32px 0 0" }}>
              <span style={{ color: "rgba(29,29,31,0.4)" }}>{k}:</span>
              <span style={{ color: "rgba(29,29,31,0.6)" }}> {v}</span>
            </p>
          ))}
        </div>
      </div>

      <div style={blockStyle}>
        <div style={{ borderRadius: "14.64px", background: "#F5F5F7", border: "1px solid rgba(210,210,215,0.2)", padding: "20.52px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: "23.4px", letterSpacing: "-0.195px", color: "rgba(29,29,31,0.8)", margin: "0 0 7.32px" }}>공무원 정보</p>
          {([
            ["소속 기관/부서", "경기도 화성시청 도로과"],
            ["직책", "주무관"],
            ["부서 전화", "031-369-1234"],
          ] as Array<[string, string]>).map(([k, v], idx) => (
            <p key={k} style={{ fontSize: "13px", fontWeight: 400, lineHeight: "23.4px", letterSpacing: "-0.195px", margin: idx === 0 ? 0 : "4.88px 0 0" }}>
              <span style={{ color: "rgba(29,29,31,0.4)" }}>{k}:</span>
              <span style={{ color: "rgba(29,29,31,0.6)" }}> {v}</span>
            </p>
          ))}
        </div>
      </div>

      <Footer left={<PrevBtn onClick={p.onPrev} />} right={<PrimaryBtn onClick={p.onSubmit} disabled={p.submitting}>공고 등록</PrimaryBtn>} />
    </>
  );
}

function SegToggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex" style={{ borderRadius: "14.64px", background: "#F5F5F7", padding: "4.88px", gap: "9.76px" }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} className="flex-1"
            style={{ borderRadius: "9.76px", padding: "9.76px 0", border: "none", cursor: "pointer", background: active ? "#fff" : "transparent", fontSize: "13px", fontWeight: 500, lineHeight: "22.75px", letterSpacing: "-0.293px", color: active ? "#1D1D1F" : "rgba(29,29,31,0.5)" }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function CatSelect({ value, placeholder, options, onChange, disabled }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div className="flex flex-1" style={{ minWidth: 0, position: "relative", opacity: disabled ? 0.5 : 1 }}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full box-border outline-none appearance-none"
        style={{
          borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#EFEFEF",
          padding: "13.2px 20.52px", paddingRight: "40px",
          fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px",
          color: disabled ? "rgba(29,29,31,0.5)" : "#1D1D1F",
          cursor: disabled ? "default" : "pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevronDown /></span>
    </div>
  );
}

function Footer({ left, right }: { left?: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ marginTop: "19.52px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.2)" }}>
      <div>{left}</div>
      {right}
    </div>
  );
}

function PrevBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ borderRadius: "14.64px", border: "none", background: "none", cursor: "pointer", padding: "9.76px 19.52px", fontSize: "13px", fontWeight: 400, lineHeight: "22.75px", letterSpacing: "-0.293px", color: "rgba(29,29,31,0.6)" }}>
      이전
    </button>
  );
}

function PrimaryBtn({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ borderRadius: "14.64px", background: "#1E3A5F", border: "none", cursor: disabled ? "default" : "pointer", padding: "12.2px 29.28px", fontSize: "13px", fontWeight: 600, lineHeight: "22.75px", letterSpacing: "-0.293px", color: "#fff", opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap" }}>
      {children}
    </button>
  );
}

function DateField({ mode, value, onChange }: { mode: "datetime" | "date"; value: string; onChange: (v: string) => void }) {
  const placeholder = mode === "datetime" ? "연도/월/일 00:00" : "-/-/-";
  let display = "";
  if (value) {
    const [d, t] = value.split("T");
    const [y, mo, da] = d.split("-");
    display = mode === "datetime" ? `${y}/${mo}/${da} ${t || "00:00"}` : `${y}/${mo}/${da}`;
  }
  return (
    <div className="flex items-center" style={{ position: "relative", height: "51px", boxSizing: "border-box", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.4)", background: "#fff", padding: "0 20.52px" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: "13px", fontWeight: 400, letterSpacing: "-0.293px", color: "#1D1D1F" }}>
        {display || placeholder}
      </span>
      <CalendarIcon />
      <input
        type={mode === "datetime" ? "datetime-local" : "date"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => {
          const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
          if (typeof el.showPicker === "function") { try { el.showPicker(); } catch {  } }
        }}
        aria-label={mode === "datetime" ? "마감 일시 선택" : "날짜 선택"}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, border: "none", margin: 0, padding: 0, cursor: "pointer" }}
      />
    </div>
  );
}

function openAddressSearch(onComplete: (addr: string) => void) {
  type DaumPostcode = { open: () => void };
  type DaumNS = { Postcode: new (opts: { oncomplete: (d: { address: string; roadAddress: string }) => void }) => DaumPostcode };
  const w = window as unknown as { daum?: DaumNS };
  const run = () => {
    if (!w.daum) return;
    new w.daum.Postcode({ oncomplete: (d) => onComplete(d.roadAddress || d.address) }).open();
  };
  if (w.daum?.Postcode) { run(); return; }
  const s = document.createElement("script");
  s.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  s.onload = run;
  document.body.appendChild(s);
}

function CalendarIcon() {
  return (
    <svg width={16} height={15} viewBox="0 0 16 15" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#cal0)">
        <path d="M13 1.875H12.375V0.625H11.125V1.875H4.875V0.625H3.625V1.875H3C2.3125 1.875 1.75 2.4375 1.75 3.125V13.125C1.75 13.8125 2.3125 14.375 3 14.375H13C13.6875 14.375 14.25 13.8125 14.25 13.125V3.125C14.25 2.4375 13.6875 1.875 13 1.875ZM13 13.125H3V5H13V13.125Z" fill="#1D1D1F" />
      </g>
      <defs><clipPath id="cal0"><rect width="16" height="15" fill="white" /></clipPath></defs>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M5.91574 4.66044L10.5107 0.000100324L11.8315 1.33971L7.23655 6.00005L11.8315 10.6604L10.5107 12L5.91574 7.33966L1.32081 12L0 10.6604L4.59493 6.00005L0 1.33971L1.32081 0.000100324L5.91574 4.66044Z" fill="#1D1D1F" fillOpacity="0.4" />
    </svg>
  );
}
function AlertCircleIcon() {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M4.93125 10C4.2606 10 3.61954 9.87 3.00806 9.61C2.42289 9.35667 1.90182 8.99833 1.44486 8.535C0.987894 8.07167 0.634488 7.54333 0.384638 6.95C0.128212 6.33 0 5.68 0 5C0 4.32 0.128212 3.67 0.384638 3.05C0.634488 2.45667 0.987894 1.92833 1.44486 1.465C1.90182 1.00167 2.42289 0.643333 3.00806 0.39C3.61954 0.13 4.2606 0 4.93125 0C5.6019 0 6.24296 0.13 6.85444 0.39C7.43961 0.643333 7.96068 1.00167 8.41764 1.465C8.87461 1.92833 9.22801 2.45667 9.47786 3.05C9.73429 3.67 9.8625 4.32 9.8625 5C9.8625 5.68 9.73429 6.33 9.47786 6.95C9.22801 7.54333 8.87461 8.07167 8.41764 8.535C7.96068 8.99833 7.43961 9.35667 6.85444 9.61C6.24296 9.87 5.6019 10 4.93125 10ZM4.93125 9C5.64792 9 6.312 8.81667 6.92348 8.45C7.51523 8.09667 7.98534 7.62 8.33381 7.02C8.69544 6.4 8.87625 5.72667 8.87625 5C8.87625 4.27333 8.69544 3.6 8.33381 2.98C7.98534 2.38 7.51523 1.90333 6.92348 1.55C6.312 1.18333 5.64792 1 4.93125 1C4.21458 1 3.5505 1.18333 2.93903 1.55C2.34728 1.90333 1.87716 2.38 1.52869 2.98C1.16706 3.6 0.98625 4.27333 0.98625 5C0.98625 5.72667 1.16706 6.4 1.52869 7.02C1.87716 7.62 2.34728 8.09667 2.93903 8.45C3.5505 8.81667 4.21458 9 4.93125 9ZM4.43813 6.5H5.42438V7.5H4.43813V6.5ZM4.43813 2.5H5.42438V5.5H4.43813V2.5Z" fill="#EF4444" />
    </svg>
  );
}
function BarcodeIcon() {
  return (
    <svg width={15} height={12} viewBox="0 0 15 12" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0.000342748H1.47948V12H0V0.000342748ZM2.95896 0.000342748H3.6987V12H2.95896V0.000342748ZM4.43845 0.000342748H5.91793V12H4.43845V0.000342748ZM6.65767 0.000342748H8.13715V12H6.65767V0.000342748ZM8.87689 0.000342748H10.3564V12H8.87689V0.000342748ZM11.0961 0.000342748H11.8359V12H11.0961V0.000342748ZM12.5756 0.000342748H14.7948V12H12.5756V0.000342748Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width={8} height={4} viewBox="0 0 8 4" fill="none" aria-hidden>
      <path d="M0 0L4 4L8 0H0Z" fill="black" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width={7} height={7} viewBox="0 0 7 7" fill="none" aria-hidden>
      <path d="M2.95875 3V0H3.945V3H6.90375V4H3.945V7H2.95875V4H0V3H2.95875Z" fill="#0071E3" />
    </svg>
  );
}
function SearchWhiteIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M11.6785 10.7925L14.7947 13.9518L13.7609 15L10.6446 11.8407C10.0719 12.3032 9.44573 12.6576 8.76618 12.9036C8.0478 13.1595 7.31 13.2875 6.55279 13.2875C5.36844 13.2875 4.2666 12.9873 3.24727 12.3869C2.25707 11.7964 1.47559 10.9991 0.902829 9.99525C0.300943 8.96182 0 7.84473 0 6.64398C0 5.44323 0.300943 4.32614 0.902829 3.29271C1.47559 2.28881 2.25707 1.49651 3.24727 0.915824C4.2666 0.305607 5.36844 0.000499592 6.55279 0.000499592C7.73715 0.000499592 8.83899 0.305607 9.85831 0.915824C10.8485 1.49651 11.6348 2.28881 12.2173 3.29271C12.8095 4.32614 13.1056 5.44323 13.1056 6.64398C13.1056 7.41167 12.9794 8.15968 12.727 8.888C12.4843 9.57695 12.1348 10.2118 11.6785 10.7925ZM10.2078 10.2462C10.6641 9.7738 11.0184 9.23248 11.2708 8.62226C11.5232 7.99236 11.6494 7.33293 11.6494 6.64398C11.6494 5.70897 11.4164 4.83794 10.9504 4.03088C10.5039 3.25334 9.89714 2.63821 9.13022 2.18547C8.33418 1.71304 7.47504 1.47683 6.55279 1.47683C5.63055 1.47683 4.7714 1.71304 3.97536 2.18547C3.20844 2.63821 2.6017 3.25334 2.15514 4.03088C1.68916 4.83794 1.45618 5.70897 1.45618 6.64398C1.45618 7.57899 1.68916 8.45002 2.15514 9.25708C2.6017 10.0346 3.20844 10.6498 3.97536 11.1025C4.7714 11.5749 5.63055 11.8111 6.55279 11.8111C7.23234 11.8111 7.88277 11.6832 8.50407 11.4273C9.10596 11.1714 9.63989 10.8121 10.1059 10.3496L10.2078 10.2462Z" fill="white" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width={20} height={19} viewBox="0 0 20 19" fill="none" aria-hidden>
      <path d="M9.99972 9.7545L13.8542 13.6638L12.5633 14.9731L10.9088 13.295V18.4398H9.09066V13.295L7.43616 14.9731L6.14529 13.6638L9.99972 9.7545ZM9.99972 -0.000328757C11.0664 -0.000328757 12.0724 0.257834 13.0178 0.774158C13.9148 1.26589 14.6602 1.94818 15.2541 2.82101C15.848 3.69385 16.2056 4.65888 16.3268 5.71611C17.0298 5.91281 17.6601 6.2478 18.2177 6.7211C18.7752 7.1944 19.2116 7.76912 19.5267 8.44525C19.8419 9.12139 19.9994 9.84056 19.9994 10.6027C19.9994 11.4756 19.7995 12.2808 19.3995 13.0184C18.9995 13.756 18.451 14.3615 17.7541 14.8348C17.0571 15.3081 16.2905 15.5816 15.4541 15.6553V13.7929C15.9632 13.7191 16.4268 13.5317 16.845 13.2305C17.2632 12.9293 17.5904 12.5482 17.8268 12.0872C18.0631 11.6262 18.1813 11.1314 18.1813 10.6027C18.1813 10.0127 18.0389 9.47175 17.7541 8.98002C17.4692 8.48828 17.0844 8.09796 16.5995 7.80907C16.1147 7.52017 15.5814 7.37573 14.9996 7.37573C14.8057 7.37573 14.6178 7.39417 14.436 7.43105C14.5087 7.11142 14.5451 6.78564 14.5451 6.45372C14.5451 5.61777 14.342 4.84635 13.936 4.13948C13.5299 3.43261 12.9784 2.87326 12.2815 2.46143C11.5845 2.0496 10.8239 1.84369 9.99972 1.84369C9.1755 1.84369 8.41492 2.0496 7.71797 2.46143C7.02102 2.87326 6.46952 3.43261 6.06347 4.13948C5.65742 4.84635 5.4544 5.61777 5.4544 6.45372C5.4544 6.78564 5.49076 7.11142 5.56348 7.43105C5.36955 7.39417 5.18168 7.37573 4.99986 7.37573C4.41806 7.37573 3.88474 7.52017 3.39991 7.80907C2.91507 8.09796 2.53023 8.48828 2.24539 8.98002C1.96055 9.47175 1.81813 10.0127 1.81813 10.6027C1.81813 11.1191 1.93025 11.6016 2.15449 12.0503C2.37872 12.499 2.68477 12.874 3.07264 13.1751C3.46051 13.4763 3.89686 13.6761 4.3817 13.7745L4.54533 13.7929V15.6553C3.70899 15.5816 2.94234 15.3081 2.24539 14.8348C1.54844 14.3615 0.999972 13.756 0.599983 13.0184C0.199994 12.2808 0 11.4756 0 10.6027C0 9.84056 0.157571 9.12139 0.472714 8.44525C0.787857 7.76912 1.22421 7.1944 1.78177 6.7211C2.33933 6.2478 2.96962 5.91281 3.67263 5.71611C3.79383 4.65888 4.1514 3.69385 4.74532 2.82101C5.33925 1.94818 6.08468 1.26589 6.98163 0.774158C7.92705 0.257834 8.93309 -0.000328757 9.99972 -0.000328757Z" fill="#1D1D1F" fillOpacity="0.3" />
    </svg>
  );
}
