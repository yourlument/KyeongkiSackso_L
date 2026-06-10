"use client";

import { useState } from "react";
import {
  PRODUCTS,
  COLUMNS,
  CATEGORY_LEVELS,
  CERT_MARKS,
  DELIVERY_TERMS,
  SPEC_FIELDS,
  NARA_RESULTS,
  type ProductRow,
} from "./products-data";
import {
  PlusIcon,
  CloseIcon,
  ChevronDownIcon,
  StarIcon,
  CheckboxIcon,
  FieldPlusIcon,
  RemoveIcon,
  EditImageIcon,
  ImageIcon,
  UploadImageIcon,
  SparkleIcon,
  EyeIcon,
  CheckIcon,
} from "./products-icons";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

const GRID = "98px minmax(0,1fr) 158px 87px 116px 85px 129px 99px";

type Step = 1 | 2 | 3;
type RegType = "물품 등록" | "용역(서비스) 등록";
type DetailMode = "none" | "직접 등록" | "AI 상세 페이지 제작";

export function ProductsView() {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <div>

      <div className="flex items-center justify-between" style={{ paddingBottom: "29.28px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.56px", lineHeight: "25px", color: INK, margin: 0 }}>상품 관리</h1>
          <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.4)", margin: "4.88px 0 0" }}>
            등록된 상품을 관리하고 새 상품을 등록하세요
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          className="inline-flex items-center"
          style={{ gap: "7.32px", borderRadius: "14.64px", background: NAVY, padding: "12.2px 19.52px", border: "none", cursor: "pointer" }}
        >
          <PlusIcon />
          <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff" }}>상품 등록</span>
        </button>
      </div>

      <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden" }}>

        <div className="grid" style={{ gridTemplateColumns: GRID, background: "rgba(29,29,31,0.02)" }}>
          {COLUMNS.map((h, i) => (
            <div key={i} style={{ padding: "14.64px 19.52px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)" }}>{h}</span>
            </div>
          ))}
        </div>

        {PRODUCTS.map((p, i) => (
          <Row key={p.code} row={p} first={i === 0} />
        ))}
      </div>

      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} />}
    </div>
  );
}

function Row({ row, first }: { row: ProductRow; first: boolean }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: GRID, borderTop: first ? "none" : "1px solid rgba(210,210,215,0.1)" }}>
      <Cell>
        <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.5)" }}>{row.code}</span>
      </Cell>
      <Cell>
        <div className="flex items-center" style={{ gap: "9.76px", minWidth: 0 }}>
          <img
            src={row.image}
            alt=""
            style={{ width: "39px", height: "39px", flexShrink: 0, borderRadius: "9.76px", background: "rgba(29,29,31,0.03)", objectFit: "cover" }}
          />
          <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
        </div>
      </Cell>
      <Cell>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>{row.category}</span>
      </Cell>
      <Cell>
        <span style={{ display: "inline-flex", borderRadius: "9999px", padding: "3.44px 10.76px", background: "rgba(30,58,95,0.1)", border: "1px solid rgba(30,58,95,0.2)", fontSize: "11px", fontWeight: 500, letterSpacing: "-0.165px", lineHeight: "19.8px", color: NAVY }}>
          {row.type}
        </span>
      </Cell>
      <Cell>
        <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "-0.195px", lineHeight: "23.4px", color: INK }}>{row.price}</span>
      </Cell>
      <Cell>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.5)" }}>{row.minQty}</span>
      </Cell>
      <Cell>
        <span className="inline-flex items-center" style={{ gap: "7.32px" }}>
          <StarIcon />
          <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "21.6px", color: "rgba(29,29,31,0.7)" }}>{row.rating}</span>
          <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.3)" }}>{row.reviews}</span>
        </span>
      </Cell>
      <Cell>
        <button
          type="button"
          style={{ borderRadius: "9.76px", border: "1px solid rgba(210,210,215,0.3)", background: "transparent", padding: "8.32px 15.64px", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.24px", lineHeight: "21.6px", color: "rgba(29,29,31,0.6)", cursor: "pointer" }}
        >
          수정
        </button>
      </Cell>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "14.64px 19.52px", display: "flex", alignItems: "center", minWidth: 0 }}>{children}</div>;
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [regType, setRegType] = useState<RegType>("물품 등록");
  const [naraOpen, setNaraOpen] = useState(false);
  const [delivery, setDelivery] = useState<(typeof DELIVERY_TERMS)[number]>("상차도");
  const [deliveryApply, setDeliveryApply] = useState(true);
  const [detailMode, setDetailMode] = useState<DetailMode>("none");
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ padding: "19.52px" }}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)", border: "none", cursor: "default" }} />
      <div className="relative flex flex-col" style={{ width: "820px", maxHeight: "calc(100vh - 39.04px)", borderRadius: "19.52px", background: "#fff", overflow: "hidden" }}>

        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.448px", lineHeight: "20px", color: INK }}>상품 등록</span>
          <button type="button" aria-label="닫기" onClick={onClose} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", border: "none", background: "transparent", cursor: "pointer" }}>
            <CloseIcon size={10} opacity={0.4} />
          </button>
        </div>

        <div className="flex flex-col" style={{ padding: "29.28px", overflowY: "auto" }}>

          <Stepper step={step} />

          {step === 1 && (
            <StepOne
              regType={regType}
              setRegType={setRegType}
              naraOpen={naraOpen}
              setNaraOpen={setNaraOpen}
            />
          )}
          {step === 2 && <StepTwo delivery={delivery} setDelivery={setDelivery} deliveryApply={deliveryApply} setDeliveryApply={setDeliveryApply} />}
          {step === 3 && <StepThree detailMode={detailMode} setDetailMode={setDetailMode} onStartAi={() => setAiOpen(true)} />}

          <div className="flex items-center justify-between" style={{ marginTop: "29.28px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
            <button
              type="button"
              onClick={() => (step === 1 ? onClose() : setStep((s) => (s - 1) as Step))}
              style={{ borderRadius: "14.64px", padding: "9.76px 19.52px", border: "none", background: "transparent", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: step === 1 ? "rgba(29,29,31,0.2)" : "rgba(29,29,31,0.6)", cursor: "pointer" }}
            >
              이전
            </button>
            <button
              type="button"
              onClick={() => (step === 3 ? onClose() : setStep((s) => (s + 1) as Step))}
              style={{ borderRadius: "14.64px", padding: "12.2px 29.28px", border: "none", background: NAVY, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff", cursor: "pointer" }}
            >
              {step === 3 ? "등록 완료" : "다음"}
            </button>
          </div>
        </div>
      </div>

      {aiOpen && <AiModal onClose={() => setAiOpen(false)} />}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const items: Step[] = [1, 2, 3];
  return (
    <div className="flex items-center" style={{ gap: "9.76px", paddingBottom: "29.28px" }}>
      {items.map((n, i) => {
        const active = step >= n;
        return (
          <div key={n} className="flex items-center" style={{ gap: "9.76px" }}>
            <span
              className="flex items-center justify-center"
              style={{ width: "34px", height: "34px", borderRadius: "9999px", background: active ? NAVY : "rgba(29,29,31,0.05)", fontSize: "11px", fontWeight: 700, letterSpacing: "-0.165px", lineHeight: "19.25px", color: active ? "#fff" : "rgba(29,29,31,0.3)" }}
            >
              {n}
            </span>
            {i < items.length - 1 && (
              <span style={{ width: "39px", height: "2px", background: step > n ? NAVY : "rgba(210,210,215,0.3)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, hint, hintCaption }: { children: React.ReactNode; hint?: string; hintCaption?: string }) {
  return (
    <div className="flex items-baseline" style={{ marginBottom: "7.32px" }}>
      <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>{children}</span>
      {hint && <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "#9CA3AF", marginLeft: "4.88px" }}>{hint}</span>}
      {hintCaption && <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", marginLeft: "9.76px" }}>{hintCaption}</span>}
    </div>
  );
}

function FieldInput({ placeholder, value }: { placeholder: string; value?: string }) {
  return (
    <input
      defaultValue={value}
      placeholder={placeholder}
      className="w-full"
      style={{ height: "51px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: value ? 400 : 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: value ? INK : "#9CA3AF", outline: "none" }}
    />
  );
}

function StepOne({
  regType,
  setRegType,
  naraOpen,
  setNaraOpen,
}: {
  regType: RegType;
  setRegType: (v: RegType) => void;
  naraOpen: boolean;
  setNaraOpen: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col">

      <div>
        <FieldLabel>등록 유형 *</FieldLabel>
        <div className="flex" style={{ gap: "9.76px", borderRadius: "14.64px", background: "#F9FAFB", padding: "4.88px" }}>
          {(["물품 등록", "용역(서비스) 등록"] as RegType[]).map((t) => {
            const on = regType === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setRegType(t)}
                className="flex-1"
                style={{ height: "39px", borderRadius: "9.76px", border: "none", background: on ? "#fff" : "transparent", fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: on ? "#111827" : "#6B7280", cursor: "pointer" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel hint="(물품만 표시)">{"카테고리 * ​"}</FieldLabel>
        <div className="flex" style={{ gap: "9.76px" }}>
          {CATEGORY_LEVELS.map((lvl, i) => {
            const disabled = i > 0;
            return (
              <div
                key={lvl}
                className="flex flex-1 items-center justify-between"
                style={{ height: "44px", borderRadius: "9.76px", padding: "0 15.64px", border: disabled ? "1px solid rgba(229,231,235,0.7)" : "1px solid #E5E7EB", background: disabled ? "rgba(249,250,251,0.7)" : "#fff" }}
              >
                <span style={{ fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "25px", color: disabled ? "rgba(156,163,175,0.49)" : INK }}>{lvl}</span>
                <ChevronDownIcon color="#000000" opacity={disabled ? 0.7 : 1} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative" style={{ marginTop: "19.52px" }}>
        <FieldLabel hintCaption="조달청 나라장터 데이터 연동">{"물품식별번호 ​"}</FieldLabel>
        <input
          onFocus={() => setNaraOpen(true)}
          placeholder="모델명 또는 상품명 검색"
          className="w-full"
          style={{ height: "51px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: INK, outline: "none" }}
        />
        {naraOpen && <NaraDropdown onPick={() => setNaraOpen(false)} />}
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel>품명</FieldLabel>
        <FieldInput placeholder="품명을 입력하세요" />
      </div>
    </div>
  );
}

function NaraDropdown({ onPick }: { onPick: () => void }) {
  return (
    <div className="absolute left-0 right-0 z-10" style={{ top: "100%", marginTop: "9.76px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", overflow: "hidden" }}>
      <div style={{ padding: "9.76px 14.64px 10.76px", background: "#F9FAFB" }}>
        <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>조달청 나라장터 검색 결과 (3건)</span>
      </div>
      {NARA_RESULTS.map((r) => (
        <button
          key={r.code}
          type="button"
          onClick={onPick}
          className="flex w-full items-start justify-between text-left"
          style={{ padding: "12.2px 14.64px 13.2px", border: "none", background: "#fff", cursor: "pointer", gap: "12px" }}
        >
          <span className="min-w-0">
            <span className="block" style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827" }}>{r.name}</span>
            <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#6B7280", marginTop: "2.44px" }}>{r.spec}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#6B7280" }}>{r.code}</span>
            <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{r.category}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function StepTwo({
  delivery,
  setDelivery,
  deliveryApply,
  setDeliveryApply,
}: {
  delivery: (typeof DELIVERY_TERMS)[number];
  setDelivery: (v: (typeof DELIVERY_TERMS)[number]) => void;
  deliveryApply: boolean;
  setDeliveryApply: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex" style={{ gap: "14.64px" }}>
        <div className="flex-1">
          <FieldLabel>단가</FieldLabel>
          <FieldInput placeholder="원" />
        </div>
        <div className="flex-1">
          <FieldLabel>최소주문수량</FieldLabel>
          <FieldInput placeholder="수량" />
        </div>
      </div>
      <div className="flex" style={{ gap: "14.64px", marginTop: "19.52px" }}>
        <div className="flex-1">
          <FieldLabel>단위</FieldLabel>
          <FieldInput placeholder="개, 대, 톤 등" value="개" />
        </div>
        <div className="flex-1">
          <FieldLabel>납기일 (영업일)</FieldLabel>
          <FieldInput placeholder="영업일" />
        </div>
      </div>
      <div style={{ marginTop: "19.52px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
          <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>인도 조건</span>
          <button type="button" onClick={() => setDeliveryApply(!deliveryApply)} className="flex items-center" style={{ gap: "9.76px", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
            {deliveryApply ? <CheckboxIcon /> : <span style={{ width: "20px", height: "20px", borderRadius: "4px", border: "1px solid #D2D2D7", display: "inline-block" }} />}
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>인도 조건 적용 (물품인 경우 체크)</span>
          </button>
        </div>
        <div className="flex" style={{ gap: "9.76px" }}>
          {DELIVERY_TERMS.map((t) => {
            const on = delivery === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setDelivery(t)}
                className="flex-1"
                style={{ height: "46px", borderRadius: "9.76px", border: on ? "1px solid #1F2937" : "1px solid #E5E7EB", background: on ? "#F9FAFB" : "#fff", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: on ? "#111827" : "#4B5563", cursor: "pointer" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepThree({ detailMode, setDetailMode, onStartAi }: { detailMode: DetailMode; setDetailMode: (m: DetailMode) => void; onStartAi: () => void }) {
  return (
    <div className="flex flex-col">

      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
          <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>상세 스펙</span>
          <button type="button" className="inline-flex items-center" style={{ gap: "4.88px", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
            <FieldPlusIcon />
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#4B5563" }}>필드 추가</span>
          </button>
        </div>
        <div className="flex flex-col" style={{ gap: "9.76px" }}>
          {SPEC_FIELDS.map((name) => (
            <div key={name} className="flex items-center" style={{ gap: "9.76px" }}>
              <input
                defaultValue={name}
                placeholder="속성명"
                style={{ width: "137px", height: "46px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: INK, outline: "none" }}
              />
              <input
                placeholder="속성값"
                className="flex-1"
                style={{ height: "46px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: "#9CA3AF", outline: "none" }}
              />
              <button type="button" aria-label="삭제" className="flex items-center justify-center" style={{ width: "29px", height: "29px", border: "none", background: "transparent", cursor: "pointer" }}>
                <RemoveIcon />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel>인증 마크</FieldLabel>
        <div className="flex flex-wrap" style={{ gap: "9.76px" }}>
          {CERT_MARKS.map((c) => (
            <button
              key={c}
              type="button"
              style={{ boxSizing: "border-box", height: "36px", borderRadius: "9999px", border: "1px solid #E5E7EB", background: "transparent", padding: "0 15.64px", fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#4B5563", cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel>대표 이미지</FieldLabel>
        <div className="flex flex-col items-center justify-center" style={{ padding: "41.04px", borderRadius: "9.76px", border: "2px dashed #E5E7EB" }}>
          <span className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "9999px", background: "#F9FAFB", marginBottom: "9.76px" }}>
            <ImageIcon />
          </span>
          <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#9CA3AF" }}>이미지를 업로드하세요</span>
          <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#D1D5DB", marginTop: "2.44px" }}>클릭하여 이미지 선택</span>
        </div>
      </div>

      <div style={{ marginTop: "19.52px", borderRadius: "9.76px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ padding: "14.64px 19.52px 15.64px", background: "#F9FAFB" }}>
          <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#374151" }}>상품 상세 페이지 등록 방식</span>
        </div>
        <div style={{ padding: "19.52px" }}>
          <div className="flex" style={{ gap: "9.76px" }}>
            {(["직접 등록", "AI 상세 페이지 제작"] as const).map((m) => {
              const on = detailMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDetailMode(m)}
                  className="flex flex-1 items-center justify-center"
                  style={{ gap: "7.32px", height: "51px", borderRadius: "9.76px", border: on ? `1px solid ${NAVY}` : "1px solid #E5E7EB", background: on ? "rgba(30,58,95,0.05)" : "#fff", cursor: "pointer" }}
                >
                  {m === "직접 등록"
                    ? <EditImageIcon color={on ? NAVY : "#4B5563"} />
                    : <SparkleIcon color={on ? NAVY : "#4B5563"} size={14} />}
                  <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: on ? NAVY : "#4B5563" }}>{m}</span>
                </button>
              );
            })}
          </div>

          {detailMode === "직접 등록" && (
            <div className="flex flex-col" style={{ marginTop: "14.64px", padding: "15.64px", borderRadius: "9.76px", background: "#F9FAFB", border: "1px dashed #E5E7EB" }}>
              <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>상세 페이지 이미지 직접 업로드</span>
              <div className="flex items-center justify-center" style={{ marginTop: "14.64px", padding: "14.2px", borderRadius: "9.76px", border: "2px dashed #E5E7EB", gap: "9.76px" }}>
                <ImageIcon width={20} height={18} />
                <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#9CA3AF" }}>이미지 업로드 (0/10)</span>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", marginTop: "14.64px" }}>상품 상세 설명 이미지를 직접 업로드하세요. 최대 10장까지 가능합니다.</span>
            </div>
          )}

          {detailMode === "AI 상세 페이지 제작" && (
            <div className="flex flex-col items-center" style={{ marginTop: "14.64px", padding: "20.52px", borderRadius: "9.76px", background: "rgba(30,58,95,0.03)", border: "1px solid rgba(30,58,95,0.1)" }}>
              <span className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "9999px", background: "rgba(30,58,95,0.1)", marginBottom: "9.76px" }}>
                <SparkleIcon color={NAVY} size={18} />
              </span>
              <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#4B5563", textAlign: "center", marginBottom: "14.64px" }}>AI가 상품 정보를 바탕으로 상세 페이지 이미지를 생성합니다.</span>
              <button
                type="button"
                onClick={onStartAi}
                className="inline-flex items-center justify-center"
                style={{ gap: "7.32px", borderRadius: "9.76px", padding: "12.2px 24.4px", border: "none", background: NAVY, cursor: "pointer" }}
              >
                <SparkleIcon color="#fff" size={12} />
                <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#fff" }}>AI 상세 페이지 제작 시작</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AiModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const hasPrompt = prompt.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ padding: "19.52px" }}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", border: "none", cursor: "default" }} />
      <div className="relative flex flex-col" style={{ width: "625px", maxHeight: "calc(100vh - 39.04px)", borderRadius: "19.52px", background: "#fff", overflow: "hidden" }}>

        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #F3F4F6" }}>
          <div className="flex items-center" style={{ gap: "12.2px" }}>
            <span className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "rgba(30,58,95,0.1)" }}>
              <SparkleIcon size={16} />
            </span>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK, margin: 0 }}>AI 상품 상세 페이지 제작</p>
              <p style={{ fontSize: "11px", fontWeight: 400, letterSpacing: "-0.165px", lineHeight: "19.8px", color: "rgba(29,29,31,0.4)", margin: 0 }}>프롬프트와 샘플 이미지로 AI가 제작합니다</p>
            </div>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", border: "none", background: "transparent", cursor: "pointer" }}>
            <CloseIcon size={11} opacity={0.3} />
          </button>
        </div>

        <div style={{ padding: "29.28px", overflowY: "auto" }}>

          <div className="flex items-baseline" style={{ marginBottom: "9.76px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "rgba(29,29,31,0.7)" }}>{"샘플 이미지 ​"}</span>
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.3)" }}>(선택, 최대 10장)</span>
            <span className="ml-auto" style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)" }}>0/10장</span>
          </div>
          <div className="flex items-center justify-center" style={{ padding: "16.64px 2px", borderRadius: "14.64px", border: "2px dashed rgba(210,210,215,0.3)", gap: "9.76px" }}>
            <UploadImageIcon color={NAVY} opacity={0.4} />
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>샘플 이미지 업로드</span>
          </div>

          <div className="flex flex-col" style={{ marginTop: "24.4px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "rgba(29,29,31,0.7)", marginBottom: "7.32px" }}>프롬프트 입력</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder="예: 프리미엄 사무용 책상, 화이트 톤, 미니멀 디자인, 깔끔한 배경"
              rows={3}
              style={{ height: "100px", resize: "none", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "13.2px 15.64px", fontSize: "17.08px", fontWeight: prompt ? 400 : 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: prompt ? INK : "#9CA3AF", outline: "none" }}
            />
            <span className="self-end" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)", marginTop: "4.88px" }}>{prompt.length}/500</span>
          </div>

          <button
            type="button"
            disabled={!hasPrompt}
            onClick={() => setGenerated(true)}
            className="flex w-full items-center justify-center"
            style={{ gap: "9.76px", marginTop: "24.4px", height: "60px", borderRadius: "14.64px", border: "none", background: hasPrompt ? NAVY : "rgba(30,58,95,0.4)", cursor: hasPrompt ? "pointer" : "default" }}
          >
            <SparkleIcon color="#fff" opacity={hasPrompt ? 1 : 0.4} size={14} />
            <span style={{ fontSize: "17.08px", fontWeight: 600, letterSpacing: "-0.2562px", lineHeight: "30.74px", color: hasPrompt ? "#fff" : "rgba(255,255,255,0.4)" }}>AI 상세 페이지 제작</span>
          </button>

          {generated && (
            <div style={{ marginTop: "24.4px", paddingTop: "10.76px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
              <div className="flex items-center justify-center" style={{ height: "275px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)" }}>
                <span style={{ fontSize: "36px", fontWeight: 400, letterSpacing: "-0.15px", color: "#000" }}>제작된 상세 페이지</span>
              </div>
              <div className="flex" style={{ gap: "12.2px", marginTop: "14.64px" }}>
                <button type="button" onClick={() => setPreviewOpen(true)} className="flex flex-1 items-center justify-center" style={{ gap: "7.32px", height: "46px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "transparent", cursor: "pointer" }}>
                  <EyeIcon color="#1D1D1F" opacity={0.7} width={13} height={11} />
                  <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "rgba(29,29,31,0.7)" }}>미리보기</span>
                </button>
                <button type="button" onClick={onClose} className="flex flex-1 items-center justify-center" style={{ gap: "7.32px", height: "46px", borderRadius: "14.64px", border: "none", background: NAVY, cursor: "pointer" }}>
                  <CheckIcon color="#fff" width={11} height={8} />
                  <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#fff" }}>이미지 적용</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewOpen && <PreviewModal onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}

function PreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ padding: "19.52px" }}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", border: "none", cursor: "default" }} />
      <div className="relative flex flex-col" style={{ width: "937px", maxHeight: "calc(100vh - 39.04px)", borderRadius: "19.52px", background: "#fff", overflow: "hidden" }}>
        <div className="flex items-center justify-between" style={{ padding: "19.52px 29.28px 20.52px", background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #F3F4F6" }}>
          <div className="flex items-center" style={{ gap: "12.2px" }}>
            <span className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", background: "rgba(30,58,95,0.1)" }}>
              <EyeIcon color={NAVY} opacity={1} width={18} height={15} />
            </span>
            <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.42px", lineHeight: "18.75px", color: INK }}>미리보기</span>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="flex items-center justify-center" style={{ width: "39px", height: "39px", borderRadius: "9.76px", border: "none", background: "transparent", cursor: "pointer" }}>
            <CloseIcon size={11} opacity={0.3} />
          </button>
        </div>
        <div style={{ padding: "29.28px", overflowY: "auto" }}>
          <div className="flex items-center justify-center" style={{ height: "649px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)" }}>
            <span style={{ fontSize: "36px", fontWeight: 400, letterSpacing: "-0.15px", color: "#000" }}>제작된 상세 페이지</span>
          </div>
          <p className="text-center" style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "rgba(29,29,31,0.3)", margin: "14.64px 0 0" }}>AI가 생성한 상품 상세 페이지 이미지입니다.</p>
        </div>
      </div>
    </div>
  );
}
