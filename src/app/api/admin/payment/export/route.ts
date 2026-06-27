import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSessionClaims } from "@/lib/auth/session";
import { loadAdminPayment } from "@/lib/admin-payment";

export const dynamic = "force-dynamic";

export async function GET() {
  const claims = await getSessionClaims();
  if (!claims) return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  if (claims.role !== "ADMIN") return NextResponse.json({ message: "권한이 없어요" }, { status: 403 });

  const data = await loadAdminPayment(Date.now());

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("거래 내역");
  ws.columns = [
    { header: "결제 일시", key: "date", width: 20 },
    { header: "PG 거래번호", key: "pg", width: 22 },
    { header: "결제수단", key: "method", width: 14 },
    { header: "수요기관", key: "buyer", width: 26 },
    { header: "부서", key: "buyerDept", width: 18 },
    { header: "공급사", key: "supplier", width: 22 },
    { header: "사업자등록번호", key: "supplierBiz", width: 18 },
    { header: "결제금액", key: "amount", width: 16 },
    { header: "정산상태", key: "settle", width: 12 },
  ];

  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  header.height = 22;
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  for (const t of data.txns) {
    const numeric = Number(String(t.amount).replace(/[^0-9.-]/g, ""));
    ws.addRow({
      date: t.date,
      pg: t.pg,
      method: t.method,
      buyer: t.buyer,
      buyerDept: t.buyerDept,
      supplier: t.supplier,
      supplierBiz: t.supplierBiz,
      amount: Number.isFinite(numeric) ? numeric : t.amount,
      settle: t.settle,
    });
  }
  ws.getColumn("amount").numFmt = "#,##0";
  ws.eachRow((row) => row.eachCell((cell) => { cell.border = { bottom: { style: "thin", color: { argb: "FFE5E7EB" } } }; }));

  const buf = await wb.xlsx.writeBuffer();
  const fileName = `거래내역_${data.txns.length}건.xlsx`;
  return new NextResponse(new Uint8Array(buf as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
