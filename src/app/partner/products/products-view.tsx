"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  COLUMNS,
  CATEGORY_LEVELS,
  DELIVERY_TERMS,
  SPEC_FIELDS,
} from "./products-data";
import type { NaraResult } from "@/lib/nara";
import { uploadFile } from "@/lib/upload-client";
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

export type ProductListItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  type: "물품" | "용역";
  price: string;
  minQty: string;
  rating: string;
  reviews: string;
  image: string;
};

type Step = 1 | 2 | 3;
type RegType = "물품 등록" | "용역(서비스) 등록";
type DetailMode = "none" | "직접 등록" | "AI 상세 페이지 제작";
type Spec = { label: string; value: string };
type CatNode = { id: string; name: string; children?: CatNode[] };

function findCatPath(tree: CatNode[], id: string): string[] {
  for (const t of tree) {
    if (t.id === id) return [t.id];
    for (const m of t.children ?? []) {
      if (m.id === id) return [t.id, m.id];
      for (const l of m.children ?? []) if (l.id === id) return [t.id, m.id, l.id];
    }
  }
  return [];
}

export function ProductsView({ initial, availableMarks }: { initial: ProductListItem[]; availableMarks: string[] }) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function close() {
    setRegisterOpen(false);
    setEditId(null);
  }
  function saved() {
    close();
    router.refresh();
  }

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
        {initial.map((p, i) => (
          <Row key={p.id} row={p} first={i === 0} onEdit={() => setEditId(p.id)} />
        ))}
      </div>

      {(registerOpen || editId) && (
        <RegisterModal mode={editId ? "edit" : "create"} productId={editId} availableMarks={availableMarks} onClose={close} onSaved={saved} />
      )}
    </div>
  );
}

function Row({ row, first, onEdit }: { row: ProductListItem; first: boolean; onEdit: () => void }) {
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
          onClick={onEdit}
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

function RegisterModal({
  mode,
  productId,
  availableMarks,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  productId: string | null;
  availableMarks: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [regType, setRegType] = useState<RegType>("물품 등록");
  const [naraOpen, setNaraOpen] = useState(false);
  const [naraResults, setNaraResults] = useState<NaraResult[]>([]);
  const [delivery, setDelivery] = useState<(typeof DELIVERY_TERMS)[number]>("상차도");
  const [deliveryApply, setDeliveryApply] = useState(true);
  const [detailMode, setDetailMode] = useState<DetailMode>("none");
  const [aiOpen, setAiOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [npsCode, setNpsCode] = useState("");
  const [price, setPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [unit, setUnit] = useState("개");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [specs, setSpecs] = useState<Spec[]>(SPEC_FIELDS.map((l) => ({ label: l, value: "" })));
  const [badges, setBadges] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [detailImages, setDetailImages] = useState<string[]>([]);

  const [catTree, setCatTree] = useState<CatNode[]>([]);
  const [topId, setTopId] = useState("");
  const [midId, setMidId] = useState("");
  const [leafId, setLeafId] = useState("");
  const pendingCatId = useRef<string | null>(null);

  useEffect(() => {
    const type = regType === "물품 등록" ? "goods" : "service";
    const ac = new AbortController();
    fetch(`/api/categories?type=${type}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d: { categories: CatNode[] }) => setCatTree(d.categories ?? []))
      .catch(() => {});
    return () => ac.abort();
  }, [regType]);

  useEffect(() => {
    if (!naraOpen) return;
    const ac = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/nara?q=${encodeURIComponent(npsCode)}`, { signal: ac.signal })
        .then((r) => r.json())
        .then((d: { results: NaraResult[] }) => setNaraResults(d.results ?? []))
        .catch(() => {});
    }, 200);
    return () => { clearTimeout(t); ac.abort(); };
  }, [naraOpen, npsCode]);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    fetch(`/api/partner/products/${productId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.message) return;
        setRegType(d.itemType === "SERVICE" ? "용역(서비스) 등록" : "물품 등록");
        setName(d.name ?? "");
        setNpsCode(d.npsCode ?? "");
        setPrice(d.price != null ? String(d.price) : "");
        setMinQty(d.minOrderQty != null ? String(d.minOrderQty) : "");
        setUnit(d.unit ?? "개");
        setDeliveryDays(d.deliveryDays != null ? String(d.deliveryDays) : "");
        if (d.deliveryCondition) { setDelivery(d.deliveryCondition); setDeliveryApply(true); } else setDeliveryApply(false);
        if (Array.isArray(d.specs) && d.specs.length) setSpecs(d.specs);
        setBadges(Array.isArray(d.badges) ? d.badges : []);
        setImageUrl(d.imageUrl ?? null);
        const details: string[] = Array.isArray(d.detailImageUrls) ? d.detailImageUrls : [];
        setDetailImages(details);
        if (details.length) setDetailMode("직접 등록");
        pendingCatId.current = d.categoryId ?? null;
      })
      .catch(() => {});
  }, [mode, productId]);

  useEffect(() => {
    if (!pendingCatId.current || catTree.length === 0) return;
    const [t, m, l] = findCatPath(catTree, pendingCatId.current);
    setTopId(t ?? ""); setMidId(m ?? ""); setLeafId(l ?? "");
    pendingCatId.current = null;
  }, [catTree]);

  function changeRegType(t: RegType) {
    if (t === regType) return;
    setRegType(t);
    setTopId(""); setMidId(""); setLeafId("");
  }

  async function submit() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const categoryId = leafId || midId || topId || null;
      const payload = {
        categoryId,
        name: name.trim(),
        npsCode: npsCode.trim() || null,
        price: price ? Number(price.replace(/[^\d]/g, "")) : null,
        unit: unit.trim() || null,
        minOrderQty: minQty ? Number(minQty.replace(/[^\d]/g, "")) : null,
        deliveryDays: deliveryDays ? Number(deliveryDays.replace(/[^\d]/g, "")) : null,
        deliveryCondition: deliveryApply ? delivery : null,
        specs: specs.filter((s) => s.label.trim() || s.value.trim()),
        badges,
        imageUrl: imageUrl || null,
        detailImageUrls: detailImages,
      };
      const res = await fetch(
        mode === "edit" ? `/api/partner/products/${productId}` : "/api/partner/products",
        { method: mode === "edit" ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (res.ok) onSaved();
    } finally {
      setSubmitting(false);
    }
  }

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
              setRegType={changeRegType}
              naraOpen={naraOpen}
              setNaraOpen={setNaraOpen}
              naraResults={naraResults}
              catTree={catTree}
              topId={topId}
              midId={midId}
              leafId={leafId}
              setTopId={(v) => { setTopId(v); setMidId(""); setLeafId(""); }}
              setMidId={(v) => { setMidId(v); setLeafId(""); }}
              setLeafId={setLeafId}
              npsCode={npsCode}
              setNpsCode={setNpsCode}
              name={name}
              setName={setName}
              onPickNara={(r) => { setNpsCode(r.code); if (!name) setName(r.name); setNaraOpen(false); }}
            />
          )}
          {step === 2 && (
            <StepTwo
              delivery={delivery}
              setDelivery={setDelivery}
              deliveryApply={deliveryApply}
              setDeliveryApply={setDeliveryApply}
              price={price}
              setPrice={setPrice}
              minQty={minQty}
              setMinQty={setMinQty}
              unit={unit}
              setUnit={setUnit}
              deliveryDays={deliveryDays}
              setDeliveryDays={setDeliveryDays}
            />
          )}
          {step === 3 && (
            <StepThree
              detailMode={detailMode}
              setDetailMode={setDetailMode}
              onStartAi={() => setAiOpen(true)}
              specs={specs}
              setSpecs={setSpecs}
              badges={badges}
              setBadges={setBadges}
              availableMarks={availableMarks}
              imageUrl={imageUrl}
              imageName={imageName}
              onImage={(url, fname) => { setImageUrl(url); setImageName(fname); }}
              detailImages={detailImages}
              setDetailImages={setDetailImages}
            />
          )}

          <div className="flex items-center justify-between" style={{ marginTop: "29.28px", paddingTop: "20.52px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
            <button
              type="button"
              onClick={() => (step === 1 ? onClose() : setStep((s) => (s - 1) as Step))}
              style={{ borderRadius: "14.64px", padding: "9.76px 19.52px", border: "none", background: "transparent", fontSize: "13px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: step === 1 ? "rgba(29,29,31,0.2)" : "rgba(29,29,31,0.6)", cursor: "pointer" }}
            >
              이전
            </button>
            {(() => {
              const step1Ok = !!(leafId || midId || topId) && !!name.trim();
              const disabled = submitting || (step === 1 && !step1Ok);
              return (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => (step === 3 ? submit() : setStep((s) => (s + 1) as Step))}
                  style={{ borderRadius: "14.64px", padding: "12.2px 29.28px", border: "none", background: NAVY, fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "22.75px", color: "#fff", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1 }}
                >
                  {step === 3 ? "등록 완료" : "다음"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {aiOpen && (
        <AiModal
          onClose={() => setAiOpen(false)}
          onApply={(url) => {
            setDetailImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
            setDetailMode("직접 등록");
          }}
        />
      )}
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

function FieldInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  const filled = value.length > 0;
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
      style={{ height: "51px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: filled ? 400 : 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: filled ? INK : "#9CA3AF", outline: "none" }}
    />
  );
}

function CategorySelect({
  levelLabel,
  options,
  value,
  onChange,
  disabled,
}: {
  levelLabel: string;
  options: { id: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div
      className="relative flex flex-1 items-center"
      style={{ height: "44px", borderRadius: "9.76px", border: disabled ? "1px solid rgba(229,231,235,0.7)" : "1px solid #E5E7EB", background: disabled ? "rgba(249,250,251,0.7)" : "#fff" }}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full appearance-none bg-transparent outline-none"
        style={{ padding: "0 34px 0 15.64px", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "25px", color: disabled ? "rgba(156,163,175,0.49)" : value ? INK : "rgba(156,163,175,0.49)", cursor: disabled ? "default" : "pointer" }}
      >
        <option value="">{levelLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute" style={{ right: "15.64px" }}>
        <ChevronDownIcon color="#000000" opacity={disabled ? 0.7 : 1} />
      </span>
    </div>
  );
}

function StepOne({
  regType,
  setRegType,
  naraOpen,
  setNaraOpen,
  naraResults,
  catTree,
  topId,
  midId,
  leafId,
  setTopId,
  setMidId,
  setLeafId,
  npsCode,
  setNpsCode,
  name,
  setName,
  onPickNara,
}: {
  regType: RegType;
  setRegType: (v: RegType) => void;
  naraOpen: boolean;
  setNaraOpen: (v: boolean) => void;
  naraResults: NaraResult[];
  catTree: CatNode[];
  topId: string;
  midId: string;
  leafId: string;
  setTopId: (v: string) => void;
  setMidId: (v: string) => void;
  setLeafId: (v: string) => void;
  npsCode: string;
  setNpsCode: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  onPickNara: (r: NaraResult) => void;
}) {
  const npsInputRef = useRef<HTMLInputElement>(null);
  const [naraRect, setNaraRect] = useState<{ top: number; left: number; width: number } | null>(null);
  useEffect(() => {
    if (!naraOpen) return;
    function place() {
      const el = npsInputRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setNaraRect({ top: r.bottom + 9.76, left: r.left, width: r.width });
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNaraOpen(false);
    }
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
    };
  }, [naraOpen, setNaraOpen]);

  const topNode = catTree.find((t) => t.id === topId);
  const midNode = topNode?.children?.find((m) => m.id === midId);
  const levels: { label: string; options: { id: string; name: string }[]; value: string; onChange: (v: string) => void; disabled: boolean }[] = [
    { label: CATEGORY_LEVELS[0], options: catTree.map((t) => ({ id: t.id, name: t.name })), value: topId, onChange: setTopId, disabled: false },
    { label: CATEGORY_LEVELS[1], options: (topNode?.children ?? []).map((m) => ({ id: m.id, name: m.name })), value: midId, onChange: setMidId, disabled: !topNode },
    { label: CATEGORY_LEVELS[2], options: (midNode?.children ?? []).map((l) => ({ id: l.id, name: l.name })), value: leafId, onChange: setLeafId, disabled: !midNode },
  ];

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
          {levels.map((lv) => (
            <CategorySelect key={lv.label} levelLabel={lv.label} options={lv.options} value={lv.value} onChange={lv.onChange} disabled={lv.disabled} />
          ))}
        </div>
      </div>

      <div className="relative" style={{ marginTop: "19.52px" }}>
        <FieldLabel hintCaption="조달청 나라장터 데이터 연동">{"물품식별번호 ​"}</FieldLabel>
        <input
          ref={npsInputRef}
          value={npsCode}
          onChange={(e) => setNpsCode(e.target.value)}
          onFocus={() => setNaraOpen(true)}
          placeholder="모델명 또는 상품명 검색"
          className="w-full"
          style={{ height: "51px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: npsCode ? 400 : 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: npsCode ? INK : "#9CA3AF", outline: "none" }}
        />
        {naraOpen && naraRect && createPortal(
          <>
            <button
              type="button"
              aria-label="검색 닫기"
              tabIndex={-1}
              onClick={() => setNaraOpen(false)}
              className="fixed inset-0"
              style={{ zIndex: 55, background: "transparent", border: "none", cursor: "default" }}
            />
            <div style={{ position: "fixed", top: naraRect.top, left: naraRect.left, width: naraRect.width, zIndex: 56 }}>
              <NaraDropdown onPick={onPickNara} results={naraResults} />
            </div>
          </>,
          document.body
        )}
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel>품명</FieldLabel>
        <FieldInput placeholder="품명을 입력하세요" value={name} onChange={setName} />
      </div>
    </div>
  );
}

function NaraDropdown({ onPick, results }: { onPick: (r: NaraResult) => void; results: NaraResult[] }) {
  return (
    <div style={{ borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "9.76px 14.64px 10.76px", background: "#F9FAFB" }}>
        <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{`조달청 나라장터 검색 결과 (${results.length}건)`}</span>
      </div>
      <div style={{ maxHeight: "280px", overflowY: "auto" }}>
        {results.map((r) => (
          <button
            key={r.code}
            type="button"
            onClick={() => onPick(r)}
            className="flex w-full items-start justify-between text-left"
            style={{ padding: "12.2px 14.64px 13.2px", border: "none", background: "#fff", cursor: "pointer", gap: "12px" }}
          >
            <span className="min-w-0">
              <span className="block" style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#111827" }}>{r.name}</span>
              {r.spec && <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#6B7280", marginTop: "2.44px" }}>{r.spec}</span>}
            </span>
            <span className="shrink-0 text-right">
              <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#6B7280" }}>{r.code}</span>
              {r.category && <span className="block" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF" }}>{r.category}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTwo({
  delivery,
  setDelivery,
  deliveryApply,
  setDeliveryApply,
  price,
  setPrice,
  minQty,
  setMinQty,
  unit,
  setUnit,
  deliveryDays,
  setDeliveryDays,
}: {
  delivery: (typeof DELIVERY_TERMS)[number];
  setDelivery: (v: (typeof DELIVERY_TERMS)[number]) => void;
  deliveryApply: boolean;
  setDeliveryApply: (v: boolean) => void;
  price: string;
  setPrice: (v: string) => void;
  minQty: string;
  setMinQty: (v: string) => void;
  unit: string;
  setUnit: (v: string) => void;
  deliveryDays: string;
  setDeliveryDays: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex" style={{ gap: "14.64px" }}>
        <div className="flex-1">
          <FieldLabel>단가</FieldLabel>
          <FieldInput placeholder="원" value={price} onChange={(v) => setPrice(v.replace(/[^\d]/g, ""))} />
        </div>
        <div className="flex-1">
          <FieldLabel>최소주문수량</FieldLabel>
          <FieldInput placeholder="수량" value={minQty} onChange={(v) => setMinQty(v.replace(/[^\d]/g, ""))} />
        </div>
      </div>
      <div className="flex" style={{ gap: "14.64px", marginTop: "19.52px" }}>
        <div className="flex-1">
          <FieldLabel>단위</FieldLabel>
          <FieldInput placeholder="개, 대, 톤 등" value={unit} onChange={setUnit} />
        </div>
        <div className="flex-1">
          <FieldLabel>납기일 (영업일)</FieldLabel>
          <FieldInput placeholder="영업일" value={deliveryDays} onChange={(v) => setDeliveryDays(v.replace(/[^\d]/g, ""))} />
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

function StepThree({
  detailMode,
  setDetailMode,
  onStartAi,
  specs,
  setSpecs,
  badges,
  setBadges,
  availableMarks,
  imageUrl,
  imageName,
  onImage,
  detailImages,
  setDetailImages,
}: {
  detailMode: DetailMode;
  setDetailMode: (m: DetailMode) => void;
  onStartAi: () => void;
  specs: Spec[];
  setSpecs: (s: Spec[]) => void;
  badges: string[];
  availableMarks: string[];
  setBadges: (b: string[]) => void;
  imageUrl: string | null;
  imageName: string;
  onImage: (url: string, fname: string) => void;
  detailImages: string[];
  setDetailImages: (v: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detailUploading, setDetailUploading] = useState(false);

  async function onDetailFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = 10 - detailImages.length;
    const picked = files.slice(0, Math.max(0, room));
    setDetailUploading(true);
    try {
      const urls: string[] = [];
      for (const file of picked) {
        try {
          const saved = await uploadFile(file);
          urls.push(saved.url);
        } catch {
        }
      }
      if (urls.length) setDetailImages([...detailImages, ...urls]);
    } finally {
      setDetailUploading(false);
      if (detailRef.current) detailRef.current.value = "";
    }
  }
  function removeDetail(i: number) {
    setDetailImages(detailImages.filter((_, idx) => idx !== i));
  }

  function setSpec(i: number, patch: Partial<Spec>) {
    setSpecs(specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function addSpec() {
    setSpecs([...specs, { label: "", value: "" }]);
  }
  function removeSpec(i: number) {
    setSpecs(specs.filter((_, idx) => idx !== i));
  }
  function toggleBadge(c: string) {
    setBadges(badges.includes(c) ? badges.filter((b) => b !== c) : [...badges, c]);
  }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const saved = await uploadFile(file);
      onImage(saved.url, file.name);
    } catch {
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: "9.76px" }}>
          <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#6B7280" }}>상세 스펙</span>
          <button type="button" onClick={addSpec} className="inline-flex items-center" style={{ gap: "4.88px", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
            <FieldPlusIcon />
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#4B5563" }}>필드 추가</span>
          </button>
        </div>
        <div className="flex flex-col" style={{ gap: "9.76px" }}>
          {specs.map((s, i) => (
            <div key={i} className="flex items-center" style={{ gap: "9.76px" }}>
              <input
                value={s.label}
                onChange={(e) => setSpec(i, { label: e.target.value })}
                placeholder="속성명"
                style={{ width: "137px", height: "46px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: INK, outline: "none" }}
              />
              <input
                value={s.value}
                onChange={(e) => setSpec(i, { value: e.target.value })}
                placeholder="속성값"
                className="flex-1"
                style={{ height: "46px", borderRadius: "9.76px", border: "1px solid #E5E7EB", background: "#fff", padding: "0 15.64px", fontSize: "17.08px", fontWeight: s.value ? 400 : 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: s.value ? INK : "#9CA3AF", outline: "none" }}
              />
              <button type="button" aria-label="삭제" onClick={() => removeSpec(i)} className="flex items-center justify-center" style={{ width: "29px", height: "29px", border: "none", background: "transparent", cursor: "pointer" }}>
                <RemoveIcon />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel>인증 마크</FieldLabel>
        <div className="flex flex-wrap" style={{ gap: "9.76px" }}>
          {Array.from(new Set([...availableMarks, ...badges])).map((c) => {
            const on = badges.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleBadge(c)}
                style={{ boxSizing: "border-box", height: "36px", borderRadius: "9999px", border: on ? `1px solid ${NAVY}` : "1px solid #E5E7EB", background: on ? "rgba(30,58,95,0.05)" : "transparent", padding: "0 15.64px", fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: on ? NAVY : "#4B5563", cursor: "pointer" }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "19.52px" }}>
        <FieldLabel>대표 이미지</FieldLabel>
        <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center" style={{ padding: imageUrl ? "15.64px" : "41.04px", borderRadius: "9.76px", border: "2px dashed #E5E7EB", background: "transparent", cursor: "pointer" }}>
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="대표 이미지" style={{ maxHeight: "160px", maxWidth: "100%", borderRadius: "9.76px", objectFit: "contain" }} />
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#9CA3AF", marginTop: "9.76px" }}>{uploading ? "업로드 중…" : `${imageName || "등록된 대표 이미지"} · 클릭하여 변경`}</span>
            </>
          ) : (
            <>
              <span className="flex items-center justify-center" style={{ width: "49px", height: "49px", borderRadius: "9999px", background: "#F9FAFB", marginBottom: "9.76px" }}>
                <ImageIcon />
              </span>
              <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "#9CA3AF" }}>이미지를 업로드하세요</span>
              <span style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "#D1D5DB", marginTop: "2.44px" }}>{uploading ? "업로드 중…" : "클릭하여 이미지 선택"}</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
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
              <button
                type="button"
                onClick={() => detailRef.current?.click()}
                disabled={detailImages.length >= 10}
                className="flex items-center justify-center"
                style={{ marginTop: "14.64px", padding: "14.2px", borderRadius: "9.76px", border: "2px dashed #E5E7EB", gap: "9.76px", background: "transparent", cursor: detailImages.length >= 10 ? "default" : "pointer", width: "100%" }}
              >
                <ImageIcon width={20} height={18} />
                <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#9CA3AF" }}>
                  {detailUploading ? "업로드 중…" : `이미지 업로드 (${detailImages.length}/10)`}
                </span>
              </button>
              <input ref={detailRef} type="file" accept="image/*" multiple onChange={onDetailFiles} style={{ display: "none" }} />
              {detailImages.length > 0 && (
                <div className="flex flex-wrap" style={{ gap: "9.76px", marginTop: "14.64px" }}>
                  {detailImages.map((url, i) => (
                    <div key={i} className="relative" style={{ width: "78px", height: "78px", borderRadius: "9.76px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                      <img src={url} alt={`상세 이미지 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        aria-label="삭제"
                        onClick={() => removeDetail(i)}
                        className="absolute flex items-center justify-center"
                        style={{ top: "3.66px", right: "3.66px", width: "19.52px", height: "19.52px", borderRadius: "9999px", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer" }}
                      >
                        <CloseIcon size={8} opacity={1} color="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

function AiModal({ onClose, onApply }: { onClose: () => void; onApply: (url: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [sampleUrls, setSampleUrls] = useState<string[]>([]);
  const [sampleUploading, setSampleUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const sampleRef = useRef<HTMLInputElement>(null);
  const hasPrompt = prompt.trim().length > 0;
  const busy = generating || sampleUploading;

  async function onSampleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const room = 10 - sampleUrls.length;
    const picked = files.slice(0, Math.max(0, room));
    setSampleUploading(true);
    try {
      const urls: string[] = [];
      for (const file of picked) {
        try {
          const saved = await uploadFile(file);
          urls.push(saved.url);
        } catch {
        }
      }
      if (urls.length) setSampleUrls([...sampleUrls, ...urls]);
    } finally {
      setSampleUploading(false);
      if (sampleRef.current) sampleRef.current.value = "";
    }
  }
  function removeSample(i: number) {
    setSampleUrls(sampleUrls.filter((_, idx) => idx !== i));
  }

  async function generate() {
    if (!hasPrompt || busy) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/partner/products/ai-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), sampleUrls }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.message ?? "이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요");
        return;
      }
      const d = (await res.json()) as { url?: string };
      if (d?.url) setGeneratedUrl(d.url);
      else setError("이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요");
    } catch {
      setError("이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setGenerating(false);
    }
  }

  function apply() {
    if (!generatedUrl) return;
    onApply(generatedUrl);
    onClose();
  }

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
            <span className="ml-auto" style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)" }}>{sampleUrls.length}/10장</span>
          </div>
          <button
            type="button"
            onClick={() => sampleRef.current?.click()}
            disabled={sampleUrls.length >= 10}
            className="flex w-full items-center justify-center"
            style={{ padding: "16.64px 2px", borderRadius: "14.64px", border: "2px dashed rgba(210,210,215,0.3)", gap: "9.76px", background: "transparent", cursor: sampleUrls.length >= 10 ? "default" : "pointer" }}
          >
            <UploadImageIcon color={NAVY} opacity={0.4} />
            <span style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "26.35px", color: "rgba(29,29,31,0.4)" }}>{sampleUploading ? "업로드 중…" : "샘플 이미지 업로드"}</span>
          </button>
          <input ref={sampleRef} type="file" accept="image/*" multiple onChange={onSampleFiles} style={{ display: "none" }} />
          {sampleUrls.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: "9.76px", marginTop: "14.64px" }}>
              {sampleUrls.map((url, i) => (
                <div key={i} className="relative" style={{ width: "78px", height: "78px", borderRadius: "9.76px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                  <img src={url} alt={`샘플 이미지 ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    aria-label="삭제"
                    onClick={() => removeSample(i)}
                    className="absolute flex items-center justify-center"
                    style={{ top: "3.66px", right: "3.66px", width: "19.52px", height: "19.52px", borderRadius: "9999px", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer" }}
                  >
                    <CloseIcon size={8} opacity={1} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col" style={{ marginTop: "24.4px" }}>
            <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "rgba(29,29,31,0.7)", marginBottom: "7.32px" }}>프롬프트 입력</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder="예: 고성능 데스크탑 PC 상세페이지. 상단에 제품 정면 이미지를 크게 배치하고, 하단에 CPU·그래픽카드·메모리·SSD 핵심 사양을 아이콘과 함께 정리. 화이트 배경에 네이비 포인트 컬러, 깔끔하고 신뢰감 있는 B2B 공공조달 톤, 한글 설명 텍스트 포함"
              rows={3}
              style={{ height: "100px", resize: "none", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "#fff", padding: "13.2px 15.64px", fontSize: "17.08px", fontWeight: prompt ? 400 : 500, letterSpacing: "-0.2928px", lineHeight: "24.4px", color: prompt ? INK : "#9CA3AF", outline: "none" }}
            />
            <span className="self-end" style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "-0.15px", lineHeight: "18px", color: "rgba(29,29,31,0.3)", marginTop: "4.88px" }}>{prompt.length}/500</span>
          </div>

          <button
            type="button"
            disabled={!hasPrompt || busy}
            onClick={generate}
            className="flex w-full items-center justify-center"
            style={{ gap: "9.76px", marginTop: "24.4px", height: "60px", borderRadius: "14.64px", border: "none", background: hasPrompt && !busy ? NAVY : "rgba(30,58,95,0.4)", cursor: hasPrompt && !busy ? "pointer" : "default" }}
          >
            <SparkleIcon color="#fff" opacity={hasPrompt && !busy ? 1 : 0.4} size={14} />
            <span style={{ fontSize: "17.08px", fontWeight: 600, letterSpacing: "-0.2562px", lineHeight: "30.74px", color: hasPrompt && !busy ? "#fff" : "rgba(255,255,255,0.4)" }}>{generating ? "제작 중…" : "AI 상세 페이지 제작"}</span>
          </button>

          {error && (
            <p style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "-0.18px", lineHeight: "19.8px", color: "#DC2626", margin: "9.76px 0 0", textAlign: "center" }}>{error}</p>
          )}

          {generatedUrl && (
            <div style={{ marginTop: "24.4px", paddingTop: "10.76px", borderTop: "1px solid rgba(210,210,215,0.1)" }}>
              <div className="flex items-center justify-center" style={{ height: "275px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden", background: "rgba(29,29,31,0.02)" }}>
                <img src={generatedUrl} alt="제작된 상세 페이지" style={{ maxHeight: "275px", maxWidth: "100%", objectFit: "contain" }} />
              </div>
              <div className="flex" style={{ gap: "12.2px", marginTop: "14.64px" }}>
                <button type="button" onClick={() => setPreviewOpen(true)} className="flex flex-1 items-center justify-center" style={{ gap: "7.32px", height: "46px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.3)", background: "transparent", cursor: "pointer" }}>
                  <EyeIcon color="#1D1D1F" opacity={0.7} width={13} height={11} />
                  <span style={{ fontSize: "14.64px", fontWeight: 500, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "rgba(29,29,31,0.7)" }}>미리보기</span>
                </button>
                <button type="button" onClick={apply} className="flex flex-1 items-center justify-center" style={{ gap: "7.32px", height: "46px", borderRadius: "14.64px", border: "none", background: NAVY, cursor: "pointer" }}>
                  <CheckIcon color="#fff" width={11} height={8} />
                  <span style={{ fontSize: "14.64px", fontWeight: 600, letterSpacing: "-0.2928px", lineHeight: "19.52px", color: "#fff" }}>이미지 적용</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewOpen && generatedUrl && <PreviewModal url={generatedUrl} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}

function PreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
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
          <div className="flex items-center justify-center" style={{ height: "649px", borderRadius: "14.64px", border: "1px solid rgba(210,210,215,0.2)", overflow: "hidden", background: "rgba(29,29,31,0.02)" }}>
            <img src={url} alt="제작된 상세 페이지" style={{ maxHeight: "649px", maxWidth: "100%", objectFit: "contain" }} />
          </div>
          <p className="text-center" style={{ fontSize: "14.64px", fontWeight: 400, letterSpacing: "-0.2196px", lineHeight: "19.52px", color: "rgba(29,29,31,0.3)", margin: "14.64px 0 0" }}>AI가 생성한 상품 상세 페이지 이미지입니다.</p>
        </div>
      </div>
    </div>
  );
}
