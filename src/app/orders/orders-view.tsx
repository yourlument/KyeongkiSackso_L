"use client";

import { useEffect, useState } from "react";

type Status = "납품완료" | "결제완료" | "배송중" | "결제대기";
type Row = { date: string; orderNo: string; name: string; qty: string; supplier: string; amount: number; status: Status };

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const DEMO: Row[] = [
  { date: "2026-04-01", orderNo: "o001", name: "레미콘 24-40-140, 아스콘 표준배합 15-40", qty: "10㎥, 5톤", supplier: "경기건설(주)", amount: 1625000, status: "납품완료" },
  { date: "2026-04-15", orderNo: "o002", name: "업무용 PC i7/16GB/512GB", qty: "5대", supplier: "디지털솔루션(주)", amount: 4450000, status: "결제완료" },
  { date: "2026-04-20", orderNo: "o003", name: "분말소화기 3.3kg, 소방호스 65A 20m", qty: "20개, 10개", supplier: "안전소방(주)", amount: 1780000, status: "배송중" },
  { date: "2026-05-07", orderNo: "o004", name: "일반 사무용 책상 1400x700", qty: "10개", supplier: "오피스퍼니처(주)", amount: 1450000, status: "결제대기" },
  { date: "2026-03-20", orderNo: "o005", name: "자동전자혈압계 상완식", qty: "5대", supplier: "메디칼텍(주)", amount: 475000, status: "납품완료" },
  { date: "2026-03-10", orderNo: "o006", name: "업무용 PC i7/16GB/512GB, 24인치 FHD 모니터", qty: "20대, 20대", supplier: "디지털솔루션(주)", amount: 22600000, status: "납품완료" },
  { date: "2026-04-28", orderNo: "o007", name: "레이저 프린터 흑백 A4 45ppm", qty: "10대", supplier: "디지털솔루션(주)", amount: 4250000, status: "배송중" },
  { date: "2026-05-03", orderNo: "o008", name: "48포트 L3 관리형 스위치", qty: "5대", supplier: "디지털솔루션(주)", amount: 9250000, status: "결제완료" },
  { date: "2026-05-06", orderNo: "o009", name: "업무용 PC i7/16GB/512GB", qty: "30대", supplier: "디지털솔루션(주)", amount: 25800000, status: "결제대기" },
  { date: "2026-01-02", orderNo: "o010", name: "IT 시스템 유지보수 서비스", qty: "12개월", supplier: "디지털솔루션(주)", amount: 5400000, status: "납품완료" },
  { date: "2026-03-01", orderNo: "o011", name: "홈페이지 유지보수 및 운영 대행", qty: "6개월", supplier: "디지털솔루션(주)", amount: 2280000, status: "배송중" },
  { date: "2026-05-05", orderNo: "o012", name: "전산장비 설치 및 네트워크 구성 서비스", qty: "1식", supplier: "디지털솔루션(주)", amount: 3200000, status: "결제완료" },
  { date: "2026-05-07", orderNo: "o013", name: "사이버보안 취약점 진단 및 컨설팅", qty: "1식", supplier: "디지털솔루션(주)", amount: 8500000, status: "결제대기" },
];

const GRID = "110px 70px minmax(0,1fr) 150px 140px 96px 72px";

export function OrdersView() {
  const [extra, setExtra] = useState<Row[]>([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("korink_mock_orders") ?? "[]") as Array<{
        id: string; date: string; total: number; status: string;
        items: Array<{ name: string; supplier: string; qty: number }>;
      }>;
      setExtra(
        raw.map((o) => ({
          date: (o.date ?? "").slice(0, 10),
          orderNo: o.id,
          name: o.items.map((i) => i.name).join(", "),
          qty: o.items.map((i) => `${i.qty}개`).join(", "),
          supplier: o.items[0]?.supplier ?? "-",
          amount: o.total,
          status: (o.status as Status) ?? "결제완료",
        })),
      );
    } catch {  }
  }, []);

  const rows = [...extra, ...DEMO];

  return (
    <div style={{ borderRadius: "19.52px", background: "#fff", border: "1px solid rgba(210,210,215,0.15)", overflow: "hidden" }}>

      <div className="grid items-center" style={{ gridTemplateColumns: GRID, gap: "14.64px", padding: "16px 25.4px", borderBottom: "1px solid rgba(210,210,215,0.2)" }}>
        {["결제 일시", "주문 번호", "물품/용역명", "판매 업체명", "결제 금액", "상태", ""].map((h, i) => (
          <span key={i} style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "-0.18px", color: "rgba(29,29,31,0.6)", textAlign: i === 4 ? "right" : "left" }}>{h}</span>
        ))}
      </div>

      {rows.map((r, i) => (
        <div key={r.orderNo + i} className="grid items-center" style={{ gridTemplateColumns: GRID, gap: "14.64px", padding: "16px 25.4px", borderTop: i === 0 ? "none" : "1px solid rgba(210,210,215,0.12)" }}>
          <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.5)" }}>{r.date}</span>
          <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(29,29,31,0.6)" }}>{r.orderNo}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "-0.21px", color: "#1D1D1F", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</p>
            <p style={{ fontSize: "12px", fontWeight: 400, color: "rgba(29,29,31,0.4)", margin: "2px 0 0" }}>{r.qty}</p>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(29,29,31,0.6)" }}>{r.supplier}</span>
          <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.225px", color: "#1D1D1F", textAlign: "right" }}>{won(r.amount)}</span>
          <span><StatusBadge status={r.status} /></span>
          <button type="button" style={{ fontSize: "13px", fontWeight: 500, color: "#0071E3", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>상세보기</button>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; color: string }> = {
    결제완료: { bg: "#1E3A5F", color: "#FFFFFF" },
    배송중: { bg: "rgba(30,58,95,0.1)", color: "#1E3A5F" },
    납품완료: { bg: "rgba(29,29,31,0.05)", color: "rgba(29,29,31,0.6)" },
    결제대기: { bg: "rgba(29,29,31,0.05)", color: "rgba(29,29,31,0.4)" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", padding: "4px 11px", fontSize: "12px", fontWeight: 500, letterSpacing: "-0.18px", background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}
