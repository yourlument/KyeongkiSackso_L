"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PartnerSubscriptionData } from "@/lib/partner-subscription";
import {
  createBrowserUuid,
  NicepayWindowClosedError,
  openNicepayPayment,
  type NicepayBrowserPayload,
} from "@/lib/nicepay/browser";

const NAVY = "#1E3A5F";
const INK = "#1D1D1F";

const GREEN_BADGE = {
  background: "#ECFDF5",
  border: "1px solid #A7F3D0",
  color: "#047857",
};
const RED_BADGE = {
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  color: "#DC2626",
};
const STATUS_BADGE: Record<string, typeof GREEN_BADGE> = {
  완료: GREEN_BADGE,
  해지: RED_BADGE,
  취소: RED_BADGE,
  실패: RED_BADGE,
  미납: {
    background: "#FFF7ED",
    border: "1px solid #FED7AA",
    color: "#EA580C",
  },
  대기: {
    background: "#FEFCE8",
    border: "1px solid #FEF08A",
    color: "#CA8A04",
  },
  "결제 대기": {
    background: "#FEFCE8",
    border: "1px solid #FEF08A",
    color: "#CA8A04",
  },
};

function badgeStyle(label: string): typeof GREEN_BADGE {
  return STATUS_BADGE[label] ?? GREEN_BADGE;
}

type Cycle = "monthly" | "annual";

const PLAN = {
  monthly: {
    price: "2,990",
    unit: "/월",
    next: "2,990원",
    cycleLabel: "월간",
  },
  annual: {
    price: "29,900",
    unit: "/년",
    next: "29,900원",
    cycleLabel: "연간",
  },
};

const FEATURES = [
  "상품 등록 무제한",
  "견적 요청 우선 열람",
  "고급 통계/분석",
  "실시간 채팅",
  "우선 노출",
  "전화/이메일 지원",
];

function CheckIcon() {
  return (
    <img
      src="/icons/sub-plan-check.svg"
      alt=""
      aria-hidden="true"
      width={12.33}
      height={12}
    />
  );
}

function CardIcon() {
  return (
    <img
      src="/icons/sub-payment-card.svg"
      alt=""
      aria-hidden="true"
      width={15}
      height={13}
    />
  );
}

function CloseIcon() {
  return (
    <img
      src="/icons/sub-payment-method-close.svg"
      alt=""
      aria-hidden="true"
      width={9}
      height={10}
    />
  );
}

function ModalCloseIcon() {
  return (
    <img
      src="/icons/sub-modal-close.svg"
      alt=""
      aria-hidden="true"
      width={11}
      height={11}
    />
  );
}

export function SubscriptionView({ data }: { data: PartnerSubscriptionData }) {
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle>(data.cycle);
  const [modalOpen, setModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const registrationKey = useRef<string | null>(null);
  const plan = PLAN[cycle];
  const canReactivate = data.statusLabel === "해지" && data.hasBillingKey;

  useEffect(() => {
    const url = new URL(window.location.href);
    const billing = url.searchParams.get("billing");
    if (!billing) return;
    url.searchParams.delete("billing");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    alert(
      billing === "success"
        ? "카드 등록과 이용권 결제가 완료되었습니다."
        : "카드 등록 또는 이용권 결제에 실패했습니다. 결제 내역을 확인해 주세요.",
    );
  }, []);

  async function registerCard() {
    if (registering) return;
    setRegistering(true);
    try {
      registrationKey.current ??= createBrowserUuid();
      const res = await fetch("/api/partner/subscription/billing/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycle: cycle === "annual" ? "ANNUAL" : "MONTHLY",
          requestKey: registrationKey.current,
        }),
      });
      const result = (await res.json().catch(() => ({}))) as {
        message?: string;
        payment?: NicepayBrowserPayload;
      };
      if (!res.ok || !result.payment) {
        registrationKey.current = null;
        alert(result.message ?? "카드 등록에 실패했습니다.");
        return;
      }
      await openNicepayPayment(result.payment);
    } catch (error) {
      if (!(error instanceof NicepayWindowClosedError)) {
        registrationKey.current = null;
        alert("NICEPAY 카드 등록창을 열지 못했습니다.");
      }
    } finally {
      setRegistering(false);
    }
  }

  async function removeCard() {
    if (registering || reactivating) return;
    setRegistering(true);
    try {
      const res = await fetch("/api/partner/subscription/billing-key", {
        method: "DELETE",
      });
      const result = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      if (!res.ok) {
        alert(result.message ?? "결제수단 삭제에 실패했습니다.");
        return;
      }
      setModalOpen(false);
      router.refresh();
    } catch {
      alert("결제수단 삭제에 실패했습니다.");
    } finally {
      setRegistering(false);
    }
  }

  async function reactivate() {
    if (reactivating || !canReactivate) return;
    setReactivating(true);
    try {
      const res = await fetch("/api/partner/subscription/reactivate", {
        method: "POST",
      });
      const result = (await res.json().catch(() => ({}))) as {
        message?: string;
        result?: string;
      };
      if (!res.ok || result.result !== "paid") {
        alert(
          result.message ??
            "카드 등록 또는 이용권 결제에 실패했습니다. 결제 내역을 확인해 주세요.",
        );
        return;
      }
      alert("카드 등록과 이용권 결제가 완료되었습니다.");
      router.refresh();
    } catch {
      alert(
        "카드 등록 또는 이용권 결제에 실패했습니다. 결제 내역을 확인해 주세요.",
      );
    } finally {
      setReactivating(false);
    }
  }

  return (
    <div data-partner-area="subscription">
      <div style={{ paddingBottom: "29.28px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            lineHeight: "25px",
            letterSpacing: "-0.56px",
            color: INK,
            margin: 0,
          }}
        >
          이용권 관리
        </h1>
        <p
          style={{
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "21.6px",
            letterSpacing: "-0.18px",
            color: "rgba(29,29,31,0.4)",
            margin: "4.88px 0 0",
          }}
        >
          월간 결제 (최소 3개월) 또는 연간 결제를 선택하세요
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "9.76px",
          paddingBottom: "39.04px",
        }}
      >
        <CycleButton
          active={cycle === "monthly"}
          disabled={data.hasSubscription || canReactivate}
          onClick={() => setCycle("monthly")}
        >
          월간 결제
        </CycleButton>
        <CycleButton
          active={cycle === "annual"}
          disabled={data.hasSubscription || canReactivate}
          onClick={() => setCycle("annual")}
        >
          연간 결제
        </CycleButton>
      </div>

      <div style={{ maxWidth: "547px", margin: "0 auto" }}>
        <section
          style={{
            padding: "29.28px",
            borderRadius: "19.52px",
            background: "rgba(30,58,95,0.03)",
            border: `2px solid ${NAVY}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "20px",
                letterSpacing: "-0.448px",
                color: INK,
                margin: 0,
              }}
            >
              프리미엄 이용권
            </h3>
            {data.hasSubscription && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4.88px 14.64px",
                  borderRadius: "9999px",
                  ...(data.isActive
                    ? {
                        background: NAVY,
                        border: "1px solid transparent",
                        color: "#fff",
                      }
                    : badgeStyle(data.statusLabel)),
                  fontSize: "11px",
                  fontWeight: 500,
                  lineHeight: "19.8px",
                  letterSpacing: "-0.165px",
                }}
              >
                {data.isActive ? "현재 이용 중" : data.statusLabel}
              </span>
            )}
          </div>

          <div style={{ paddingTop: "14.64px", paddingBottom: "19.52px" }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  lineHeight: "54px",
                  letterSpacing: "-0.45px",
                  color: INK,
                }}
              >
                {plan.price}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "23.4px",
                  letterSpacing: "-0.195px",
                  color: "rgba(29,29,31,0.4)",
                  marginLeft: "2px",
                }}
              >
                원
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: "21.6px",
                  letterSpacing: "-0.18px",
                  color: "rgba(29,29,31,0.4)",
                  marginLeft: "2px",
                }}
              >
                {plan.unit}
              </span>
            </div>
          </div>

          {cycle === "monthly" && (
            <p
              style={{
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: "19.8px",
                letterSpacing: "-0.165px",
                color: "rgba(29,29,31,0.4)",
                margin: "0 0 19.52px",
              }}
            >
              최소 3개월 이상 결제
            </p>
          )}

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {FEATURES.map((f, i) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9.76px",
                  marginTop: i === 0 ? 0 : "9.76px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: "19.52px",
                    height: "19.52px",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    paddingTop: "2.44px",
                  }}
                >
                  <CheckIcon />
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    lineHeight: "21.6px",
                    letterSpacing: "-0.18px",
                    color: "rgba(29,29,31,0.7)",
                  }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section
          style={{
            marginTop: "39.04px",
            padding: "24.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 700,
              lineHeight: "17.5px",
              letterSpacing: "-0.392px",
              color: INK,
              margin: "0 0 14.64px",
            }}
          >
            현재 이용 현황
          </h3>
          <div style={{ display: "flex", gap: "19.52px" }}>
            <StatusItem label="현재 플랜" value={data.planName || "-"} />
            <StatusItem
              label="결제 주기"
              value={data.cycleLabel || plan.cycleLabel}
            />
            <StatusItem label="다음 결제일" value={data.nextBillingDate} />
          </div>
          <div
            style={{
              marginTop: "19.52px",
              paddingTop: "19.52px",
              borderTop: "1px solid rgba(210,210,215,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ margin: 0 }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: "23.4px",
                  letterSpacing: "-0.195px",
                  color: "rgba(29,29,31,0.6)",
                }}
              >
                {"다음 결제 금액: ​"}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  lineHeight: "23.4px",
                  letterSpacing: "-0.195px",
                  color: INK,
                }}
              >
                {data.nextAmount}
              </span>
            </p>
            <button
              type="button"
              onClick={() =>
                canReactivate ? reactivate() : setModalOpen(true)
              }
              disabled={reactivating}
              style={{
                padding: "12.2px 19.52px",
                borderRadius: "14.64px",
                background: NAVY,
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "21px",
                letterSpacing: "-0.2928px",
                border: "none",
                opacity: reactivating ? 0.4 : 1,
                cursor: reactivating ? "not-allowed" : "pointer",
              }}
            >
              {data.hasSubscription ? "결제 수단 변경" : "이용권 결제 시작"}
            </button>
          </div>
        </section>

        {data.hasBillingKey && (
          <section
            style={{
              marginTop: "24.4px",
              padding: "24.4px",
              borderRadius: "19.52px",
              background: "#fff",
              border: "1px solid rgba(210,210,215,0.2)",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "17.5px",
                letterSpacing: "-0.392px",
                color: INK,
                margin: "0 0 14.64px",
              }}
            >
              등록된 결제 수단
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12.2px 14.64px",
                borderRadius: "14.64px",
                background: "rgba(29,29,31,0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14.64px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: "39.03px",
                    height: "39.03px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9.76px",
                    background: "#fff",
                    border: "1px solid rgba(210,210,215,0.2)",
                  }}
                >
                  <CardIcon />
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "21.6px",
                      letterSpacing: "-0.18px",
                      color: INK,
                      margin: 0,
                    }}
                  >
                    {data.payMethod}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 400,
                      lineHeight: "18px",
                      letterSpacing: "-0.15px",
                      color: "rgba(29,29,31,0.4)",
                      margin: 0,
                    }}
                  >
                    {data.cardNo}
                  </p>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "9.76px" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2.44px 9.76px",
                    borderRadius: "9999px",
                    background: "rgba(30,58,95,0.1)",
                    color: NAVY,
                    fontSize: "10px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    letterSpacing: "-0.15px",
                  }}
                >
                  기본
                </span>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  style={{
                    display: "flex",
                    width: "24.39px",
                    height: "24.39px",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label="결제 수단 관리"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          </section>
        )}

        <section
          style={{
            marginTop: "24.4px",
            borderRadius: "19.52px",
            background: "#fff",
            border: "1px solid rgba(210,210,215,0.2)",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "19.52px 24.4px",
              borderBottom: "1px solid rgba(210,210,215,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                lineHeight: "17.5px",
                letterSpacing: "-0.392px",
                color: INK,
                margin: 0,
              }}
            >
              결제 내역
            </h3>
          </div>
          <div>
            {data.history.length === 0 && (
              <p
                style={{
                  margin: 0,
                  padding: "17.08px 24.4px",
                  fontSize: "12px",
                  color: "rgba(29,29,31,0.4)",
                }}
              >
                결제 내역이 없습니다.
              </p>
            )}
            {data.history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "17.08px 24.4px",
                  borderTop:
                    i === 0 ? "none" : "1px solid rgba(210,210,215,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "19.52px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "21.6px",
                      letterSpacing: "-0.18px",
                      color: "rgba(29,29,31,0.5)",
                    }}
                  >
                    {h.date}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: "23.4px",
                      letterSpacing: "-0.195px",
                      color: INK,
                    }}
                  >
                    {h.amount}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9.76px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "21.6px",
                      letterSpacing: "-0.18px",
                      color: "rgba(29,29,31,0.4)",
                    }}
                  >
                    {h.method}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2.44px 12.2px",
                      borderRadius: "9999px",
                      ...badgeStyle(h.status),
                      fontSize: "11px",
                      fontWeight: 400,
                      lineHeight: "19.8px",
                      letterSpacing: "-0.165px",
                    }}
                  >
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {modalOpen && (
        <PaymentMethodModal
          data={data}
          registering={registering || reactivating}
          onRegister={registerCard}
          onRemove={removeCard}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function CycleButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: active ? "12.2px 24.4px" : "13.2px 25.4px",
        borderRadius: "14.64px",
        background: active ? NAVY : "#fff",
        color: active ? "#fff" : "rgba(29,29,31,0.6)",
        border: active ? "none" : "1px solid rgba(210,210,215,0.3)",
        fontSize: "13px",
        fontWeight: 600,
        lineHeight: "22.75px",
        letterSpacing: "-0.2928px",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ width: "152px" }}>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: "19.8px",
          letterSpacing: "-0.165px",
          color: "rgba(29,29,31,0.4)",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: "23.4px",
          letterSpacing: "-0.195px",
          color: INK,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function PaymentMethodModal({
  data,
  registering,
  onRegister,
  onRemove,
  onClose,
}: {
  data: PartnerSubscriptionData;
  registering: boolean;
  onRegister: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  function handleRegister() {
    if (registering) return;
    onRegister();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "19.52px",
        background: "rgba(0,0,0,0.4)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "546px",
          maxHeight: "100%",
          overflowY: "auto",
          padding: "29.28px",
          borderRadius: "14.64px",
          background: "#fff",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "19.52px",
          }}
        >
          <h2
            style={{
              fontSize: "19.52px",
              fontWeight: 700,
              lineHeight: "29.28px",
              letterSpacing: "-0.5466px",
              color: "#111827",
              margin: 0,
            }}
          >
            결제 수단 관리
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "flex",
              width: "39.03px",
              height: "39.03px",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="닫기"
          >
            <ModalCloseIcon />
          </button>
        </div>

        {data.hasBillingKey && (
          <div style={{ paddingBottom: "19.52px" }}>
            <p
              style={{
                fontSize: "14.64px",
                fontWeight: 500,
                lineHeight: "19.52px",
                letterSpacing: "-0.2196px",
                color: "#6B7280",
                margin: "0 0 9.76px",
              }}
            >
              등록된 카드
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9.76px 14.64px",
                borderRadius: "9.76px",
                background: "#F9FAFB",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14.64px",
                    fontWeight: 500,
                    lineHeight: "19.52px",
                    letterSpacing: "-0.2196px",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {data.payMethod}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 400,
                    lineHeight: "18px",
                    letterSpacing: "-0.15px",
                    color: "#9CA3AF",
                    margin: 0,
                  }}
                >
                  {data.cardNo}
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "9.76px" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2.44px 7.32px",
                    borderRadius: "4.88px",
                    background: "#E5E7EB",
                    color: "#4B5563",
                    fontSize: "10px",
                    fontWeight: 400,
                    lineHeight: "18px",
                    letterSpacing: "-0.15px",
                  }}
                >
                  기본
                </span>
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={registering}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: registering ? "not-allowed" : "pointer",
                    padding: 0,
                    color: "#9CA3AF",
                    fontSize: "14.64px",
                    fontWeight: 400,
                    lineHeight: "19.52px",
                    letterSpacing: "-0.2928px",
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ paddingTop: "19.52px", borderTop: "1px solid #F3F4F6" }}>
          <p
            style={{
              fontSize: "14.64px",
              fontWeight: 500,
              lineHeight: "19.52px",
              letterSpacing: "-0.2196px",
              color: "#111827",
              margin: "0 0 14.64px",
            }}
          >
            새 카드 등록
          </p>

          <p
            style={{
              fontSize: "14.64px",
              fontWeight: 400,
              lineHeight: "24.4px",
              letterSpacing: "-0.2196px",
              color: "#6B7280",
              margin: 0,
            }}
          >
            카드 등록 시 NICEPAY 안전결제창에서 카드정보를 입력합니다.
          </p>
        </div>

        <div style={{ marginTop: "19.52px", display: "flex", gap: "14.64px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12.2px 0",
              borderRadius: "9.76px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              color: "#4B5563",
              fontSize: "17.08px",
              fontWeight: 400,
              lineHeight: "24.4px",
              letterSpacing: "-0.2928px",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleRegister}
            disabled={registering}
            style={{
              flex: 1,
              padding: "12.2px 0",
              borderRadius: "9.76px",
              background: "#1F2937",
              opacity: registering ? 0.4 : 1,
              border: "none",
              color: "#FFFFFF",
              fontSize: "17.08px",
              fontWeight: 600,
              lineHeight: "24.4px",
              letterSpacing: "-0.2928px",
              cursor: registering ? "not-allowed" : "pointer",
            }}
          >
            {registering ? "처리 중" : "카드 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
