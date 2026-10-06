"use client";

import Link from "next/link";
import {
  settlementAccountVerificationHref,
  type SettlementAccountVerificationActionStatus,
} from "@/lib/supplier-account-verification";
import { AlertTriangleIcon } from "@/app/partner/profile/profile-icons";

type BannerStatus = SettlementAccountVerificationActionStatus;

const COPY: Record<
  BannerStatus,
  {
    title: string;
    description: string;
    action: string;
    background: string;
    border: string;
    iconBackground: string;
    titleColor: string;
    descriptionColor: string;
  }
> = {
  UNVERIFIED: {
    title: "정산 계좌 인증이 필요합니다",
    description: "계좌 인증 완료 후 상품 등록 및 견적 대응이 가능합니다.",
    action: "계좌 인증하기",
    background: "#FEF2F2",
    border: "#FECACA",
    iconBackground: "#FEE2E2",
    titleColor: "#B91C1C",
    descriptionColor: "#EF4444",
  },
  PENDING: {
    title: "정산 계좌 인증 번호 확인이 필요합니다",
    description: "입금자명에 표시된 4자리 인증 번호를 입력해 주세요.",
    action: "인증 번호 입력",
    background: "#FFFBEB",
    border: "#FDE68A",
    iconBackground: "#FEF3C7",
    titleColor: "#92400E",
    descriptionColor: "#B45309",
  },
  ERROR: {
    title: "정산 계좌 인증을 다시 확인해 주세요",
    description: "인증 유효 시간이 지났거나 요청을 완료하지 못했습니다.",
    action: "다시 인증하기",
    background: "#FEF2F2",
    border: "#FECACA",
    iconBackground: "#FEE2E2",
    titleColor: "#B91C1C",
    descriptionColor: "#EF4444",
  },
};

   
                                                                       
                                                                          
   
export function SettlementAccountVerificationBanner({
  status,
}: {
  status: BannerStatus;
}) {
  const copy = COPY[status];

  return (
    <div
      className="flex items-center justify-between"
      style={{
        gap: "14.64px",
        padding: "20.52px",
        borderRadius: "19.52px",
        background: copy.background,
        border: `1px solid ${copy.border}`,
        marginBottom: "24.4px",
      }}
    >
      <div className="flex items-center" style={{ gap: "14.64px", minWidth: 0 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: "44px",
            height: "44px",
            flex: "0 0 44px",
            borderRadius: "14.64px",
            background: copy.iconBackground,
          }}
        >
          <AlertTriangleIcon />
        </div>
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "-0.195px",
              lineHeight: "23.4px",
              color: copy.titleColor,
              margin: 0,
            }}
          >
            {copy.title}
          </p>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "-0.165px",
              lineHeight: "19.8px",
              color: copy.descriptionColor,
              margin: "2.44px 0 0",
            }}
          >
            {copy.description}
          </p>
        </div>
      </div>
      <Link
        href={settlementAccountVerificationHref(status)}
        style={{
          flex: "0 0 auto",
          padding: "9.76px 19.52px",
          borderRadius: "14.64px",
          background: "#1E3A5F",
          color: "#FFFFFF",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "-0.2928px",
          lineHeight: "21px",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        {copy.action}
      </Link>
    </div>
  );
}
