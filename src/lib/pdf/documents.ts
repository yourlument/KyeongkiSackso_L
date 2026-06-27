import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { getRegularFont, getBoldFont } from "./font";

const FONT_REGULAR = "KR";
const FONT_BOLD = "KR-Bold";

const COLOR_TEXT = "#1D1D1F";
const COLOR_MUTED = "#6E6E73";
const COLOR_LINE = "#D2D2D7";
const COLOR_HEAD_BG = "#F5F5F7";

const PAGE_MARGIN = 50;

export type QuoteItemLine = {
  no: number;
  name: string;
  spec: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

export type QuotePdfData = {
  quoteNo: string;
  issuedAt: string;
  requestTitle: string;
  orgName: string;
  supplierName: string;
  supplierRepresentative: string;
  supplierBusinessNo: string;
  supplierPhone: string;
  items: QuoteItemLine[];
  totalAmount: string;
  deliveryDate: string;
  validUntil: string;
  memo: string;
};

export type ConfirmItemLine = {
  no: number;
  name: string;
  spec: string;
  quantity: string;
  unitPrice: string;
  amount: string;
};

export type PurchaseConfirmPdfData = {
  orderNo: string;
  issuedAt: string;
  buyerOrgName: string;
  buyerName: string;
  buyerDepartment: string;
  supplierName: string;
  payMethod: string;
  paidAt: string;
  items: ConfirmItemLine[];
  totalAmount: string;
  deliveryPlace: string;
  deliveryDeadline: string;
};

export type SalesSlipPdfData = {
  orderNo: string;
  issuedAt: string;
  supplierName: string;
  supplierBusinessNo: string;
  buyerOrgName: string;
  buyerName: string;
  items: ConfirmItemLine[];
  supplyAmount: string;
  vatAmount: string;
  totalAmount: string;
  payMethod: string;
  paidAt: string;
};

type Doc = PDFKit.PDFDocument;

function createDoc(): Doc {
  const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });
  doc.registerFont(FONT_REGULAR, getRegularFont());
  doc.registerFont(FONT_BOLD, getBoldFont());
  doc.font(FONT_REGULAR).fillColor(COLOR_TEXT);
  const baseText = doc.text.bind(doc) as (t: unknown, ...a: unknown[]) => Doc;
  doc.text = function (text: unknown, ...args: unknown[]) {
    return baseText(typeof text === "string" ? text.normalize("NFKC") : text, ...args);
  } as typeof doc.text;
  const baseHeightOfString = doc.heightOfString.bind(doc) as (t: unknown, ...a: unknown[]) => number;
  doc.heightOfString = function (text: unknown, ...args: unknown[]) {
    return baseHeightOfString(typeof text === "string" ? text.normalize("NFKC") : text, ...args);
  } as typeof doc.heightOfString;
  return doc;
}

function toBuffer(doc: Doc): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function contentWidth(doc: Doc): number {
  return doc.page.width - PAGE_MARGIN * 2;
}

function drawTitle(doc: Doc, title: string): void {
  doc.font(FONT_BOLD).fontSize(26).fillColor(COLOR_TEXT);
  doc.text(title, PAGE_MARGIN, doc.y, { width: contentWidth(doc), align: "center", characterSpacing: 8 });
  doc.moveDown(0.4);
  const y = doc.y;
  doc.lineWidth(2).strokeColor(COLOR_TEXT).moveTo(PAGE_MARGIN, y).lineTo(doc.page.width - PAGE_MARGIN, y).stroke();
  doc.moveDown(1.2);
}

function drawMeta(doc: Doc, label: string, value: string): void {
  doc.font(FONT_BOLD).fontSize(9).fillColor(COLOR_MUTED).text(label, { continued: false });
  doc.font(FONT_REGULAR).fontSize(11).fillColor(COLOR_TEXT).text(value || "-");
  doc.moveDown(0.5);
}

function drawInfoBlock(doc: Doc, heading: string, rows: [string, string][]): void {
  doc.font(FONT_BOLD).fontSize(12).fillColor(COLOR_TEXT).text(heading);
  doc.moveDown(0.4);
  const labelW = 110;
  const startX = PAGE_MARGIN;
  for (const [label, value] of rows) {
    const rowY = doc.y;
    doc.font(FONT_BOLD).fontSize(10).fillColor(COLOR_MUTED).text(label, startX, rowY, { width: labelW });
    doc.font(FONT_REGULAR).fontSize(10).fillColor(COLOR_TEXT).text(value || "-", startX + labelW, rowY, {
      width: contentWidth(doc) - labelW,
    });
    doc.moveDown(0.3);
  }
  doc.moveDown(0.8);
}

type Column = { key: string; label: string; width: number; align: "left" | "right" | "center" };

function drawTable(doc: Doc, columns: Column[], rows: Record<string, string>[]): void {
  const startX = PAGE_MARGIN;
  const rowPadding = 6;
  const headerHeight = 24;

  let x = startX;
  const headTop = doc.y;
  doc.rect(startX, headTop, contentWidth(doc), headerHeight).fill(COLOR_HEAD_BG);
  doc.fillColor(COLOR_TEXT).font(FONT_BOLD).fontSize(9);
  for (const col of columns) {
    doc.text(col.label, x + 4, headTop + 7, { width: col.width - 8, align: col.align });
    x += col.width;
  }
  doc.y = headTop + headerHeight;

  doc.font(FONT_REGULAR).fontSize(9).fillColor(COLOR_TEXT);
  for (const row of rows) {
    const rowTop = doc.y;
    let cellMax = 0;
    for (const col of columns) {
      const h = doc.heightOfString(row[col.key] ?? "-", { width: col.width - 8 });
      if (h > cellMax) cellMax = h;
    }
    const rowHeight = cellMax + rowPadding * 2;

    if (rowTop + rowHeight > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      doc.y = PAGE_MARGIN;
    }

    let cx = startX;
    const top = doc.y;
    for (const col of columns) {
      doc.text(row[col.key] ?? "-", cx + 4, top + rowPadding, { width: col.width - 8, align: col.align });
      cx += col.width;
    }
    doc.y = top + rowHeight;
    doc
      .lineWidth(0.5)
      .strokeColor(COLOR_LINE)
      .moveTo(startX, doc.y)
      .lineTo(startX + contentWidth(doc), doc.y)
      .stroke();
  }
}

function drawTotalRow(doc: Doc, label: string, value: string): void {
  doc.moveDown(0.6);
  const startX = PAGE_MARGIN;
  const w = contentWidth(doc);
  const top = doc.y;
  doc.rect(startX, top, w, 28).fill(COLOR_HEAD_BG);
  doc.font(FONT_BOLD).fontSize(11).fillColor(COLOR_TEXT);
  doc.text(label, startX + 12, top + 8, { width: w * 0.5 });
  doc.text(value, startX + w * 0.5, top + 8, { width: w * 0.5 - 12, align: "right" });
  doc.y = top + 28;
  doc.moveDown(1);
}

function drawFooterNote(doc: Doc, lines: string[]): void {
  doc.moveDown(1.5);
  doc.font(FONT_REGULAR).fontSize(9).fillColor(COLOR_MUTED);
  for (const line of lines) {
    doc.text(line, { align: "center" });
  }
}

export async function buildQuotePdf(data: QuotePdfData): Promise<Buffer> {
  const doc = createDoc();

  drawTitle(doc, "견 적 서");

  const headerLeft = PAGE_MARGIN;
  const headerTop = doc.y;
  doc.font(FONT_REGULAR).fontSize(10).fillColor(COLOR_MUTED);
  doc.text(`견적번호 ${data.quoteNo}`, headerLeft, headerTop);
  doc.text(`발행일 ${data.issuedAt}`, headerLeft, headerTop, {
    width: contentWidth(doc),
    align: "right",
  });
  doc.y = headerTop;
  doc.moveDown(2);

  drawInfoBlock(doc, "수신", [
    ["기관명", data.orgName],
    ["견적요청 건", data.requestTitle],
  ]);

  drawInfoBlock(doc, "공급자", [
    ["상호", data.supplierName],
    ["대표자", data.supplierRepresentative],
    ["사업자등록번호", data.supplierBusinessNo],
    ["연락처", data.supplierPhone],
  ]);

  const columns: Column[] = [
    { key: "no", label: "번호", width: 40, align: "center" },
    { key: "name", label: "품명", width: 150, align: "left" },
    { key: "spec", label: "규격", width: 120, align: "left" },
    { key: "quantity", label: "수량", width: 55, align: "center" },
    { key: "unitPrice", label: "단가", width: 70, align: "right" },
    { key: "amount", label: "금액", width: 60, align: "right" },
  ];
  const rows = data.items.map((it) => ({
    no: String(it.no),
    name: it.name,
    spec: it.spec,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    amount: it.amount,
  }));
  drawTable(doc, columns, rows);
  drawTotalRow(doc, "합계금액 (VAT 별도)", data.totalAmount);

  drawInfoBlock(doc, "납품 조건", [
    ["납품 예정일", data.deliveryDate],
    ["견적 유효기간", data.validUntil],
    ["비고", data.memo],
  ]);

  drawFooterNote(doc, ["위와 같이 견적합니다.", `${data.supplierName}`]);

  return toBuffer(doc);
}

export async function buildPurchaseConfirmPdf(data: PurchaseConfirmPdfData): Promise<Buffer> {
  const doc = createDoc();

  drawTitle(doc, "구 매 확 인 서");

  const headerTop = doc.y;
  doc.font(FONT_REGULAR).fontSize(10).fillColor(COLOR_MUTED);
  doc.text(`주문번호 ${data.orderNo}`, PAGE_MARGIN, headerTop);
  doc.text(`발행일 ${data.issuedAt}`, PAGE_MARGIN, headerTop, {
    width: contentWidth(doc),
    align: "right",
  });
  doc.y = headerTop;
  doc.moveDown(2);

  drawInfoBlock(doc, "구매기관", [
    ["기관명", data.buyerOrgName],
    ["부서", data.buyerDepartment],
    ["담당자", data.buyerName],
  ]);

  drawInfoBlock(doc, "공급자", [
    ["상호", data.supplierName],
    ["결제수단", data.payMethod],
    ["결제일", data.paidAt],
  ]);

  const columns: Column[] = [
    { key: "no", label: "번호", width: 40, align: "center" },
    { key: "name", label: "품명", width: 160, align: "left" },
    { key: "spec", label: "규격", width: 120, align: "left" },
    { key: "quantity", label: "수량", width: 55, align: "center" },
    { key: "unitPrice", label: "단가", width: 60, align: "right" },
    { key: "amount", label: "금액", width: 60, align: "right" },
  ];
  const rows = data.items.map((it) => ({
    no: String(it.no),
    name: it.name,
    spec: it.spec,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    amount: it.amount,
  }));
  drawTable(doc, columns, rows);
  drawTotalRow(doc, "결제금액", data.totalAmount);

  drawInfoBlock(doc, "납품 정보", [
    ["납품 장소", data.deliveryPlace],
    ["납품 기한", data.deliveryDeadline],
  ]);

  drawFooterNote(doc, ["위 물품의 구매 사실을 확인합니다.", "KORINK 공공조달 플랫폼"]);

  return toBuffer(doc);
}

export async function buildSalesSlipPdf(data: SalesSlipPdfData): Promise<Buffer> {
  const doc = createDoc();

  drawTitle(doc, "매 출 전 표");

  const headerTop = doc.y;
  doc.font(FONT_REGULAR).fontSize(10).fillColor(COLOR_MUTED);
  doc.text(`주문번호 ${data.orderNo}`, PAGE_MARGIN, headerTop);
  doc.text(`발행일 ${data.issuedAt}`, PAGE_MARGIN, headerTop, {
    width: contentWidth(doc),
    align: "right",
  });
  doc.y = headerTop;
  doc.moveDown(2);

  drawInfoBlock(doc, "공급자", [
    ["상호", data.supplierName],
    ["사업자등록번호", data.supplierBusinessNo],
  ]);

  drawInfoBlock(doc, "공급받는 자", [
    ["기관명", data.buyerOrgName],
    ["담당자", data.buyerName],
  ]);

  const columns: Column[] = [
    { key: "no", label: "번호", width: 40, align: "center" },
    { key: "name", label: "품명", width: 160, align: "left" },
    { key: "spec", label: "규격", width: 120, align: "left" },
    { key: "quantity", label: "수량", width: 55, align: "center" },
    { key: "unitPrice", label: "단가", width: 60, align: "right" },
    { key: "amount", label: "금액", width: 60, align: "right" },
  ];
  const rows = data.items.map((it) => ({
    no: String(it.no),
    name: it.name,
    spec: it.spec,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    amount: it.amount,
  }));
  drawTable(doc, columns, rows);

  doc.moveDown(0.6);
  const w = contentWidth(doc);
  const sx = PAGE_MARGIN;
  const summary: [string, string][] = [
    ["공급가액", data.supplyAmount],
    ["부가세", data.vatAmount],
    ["합계금액", data.totalAmount],
  ];
  for (const [label, value] of summary) {
    const top = doc.y;
    doc.font(FONT_BOLD).fontSize(10).fillColor(COLOR_TEXT);
    doc.text(label, sx + w * 0.5, top, { width: w * 0.25 - 8, align: "right" });
    doc.text(value, sx + w * 0.75, top, { width: w * 0.25 - 8, align: "right" });
    doc.moveDown(0.4);
  }
  doc.moveDown(0.8);

  drawInfoBlock(doc, "결제 정보", [
    ["결제수단", data.payMethod],
    ["결제일", data.paidAt],
  ]);

  drawFooterNote(doc, ["위와 같이 매출 사실을 증빙합니다.", `${data.supplierName}`]);

  return toBuffer(doc);
}

export type SubscriptionReceiptPdfData = {
  receiptNo: string;
  issuedAt: string;
  supplierName: string;
  planName: string;
  payMethod: string;
  paidAt: string;
  billingPeriod: string;
  amount: string;
};

export async function buildSubscriptionReceiptPdf(data: SubscriptionReceiptPdfData): Promise<Buffer> {
  const doc = createDoc();

  drawTitle(doc, "영 수 증");

  const headerLeft = PAGE_MARGIN;
  const headerTop = doc.y;
  doc.font(FONT_REGULAR).fontSize(10).fillColor(COLOR_MUTED);
  doc.text(`영수증번호 ${data.receiptNo}`, headerLeft, headerTop);
  doc.text(`발행일 ${data.issuedAt}`, headerLeft, headerTop, { width: contentWidth(doc), align: "right" });
  doc.y = headerTop;
  doc.moveDown(2);

  drawInfoBlock(doc, "공급받는 자", [["상호", data.supplierName]]);

  drawInfoBlock(doc, "결제 내역", [
    ["이용권", data.planName],
    ["결제 수단", data.payMethod],
    ["결제일", data.paidAt],
    ["이용 기간", data.billingPeriod],
  ]);

  drawTotalRow(doc, "결제 금액", data.amount);

  drawFooterNote(doc, ["위 금액을 정히 영수합니다.", "KORINK 공공조달 플랫폼"]);

  return toBuffer(doc);
}

export type TaxInvoicePdfData = {
  invoiceNo: string;
  issuedAt: string;
  supplierName: string;
  supplierBusinessNo: string;
  supplierRepresentative: string;
  buyerOrgName: string;
  buyerBusinessNo: string;
  buyerRepresentative: string;
  buyerAddress: string;
  buyerEmail: string;
  items: ConfirmItemLine[];
  supplyAmount: string;
  vatAmount: string;
  totalAmount: string;
  remark: string;
};

export async function buildTaxInvoicePdf(data: TaxInvoicePdfData): Promise<Buffer> {
  const doc = createDoc();

  drawTitle(doc, "세 금 계 산 서");

  const headerTop = doc.y;
  doc.font(FONT_REGULAR).fontSize(10).fillColor(COLOR_MUTED);
  doc.text(`승인번호 ${data.invoiceNo}`, PAGE_MARGIN, headerTop);
  doc.text(`작성일자 ${data.issuedAt}`, PAGE_MARGIN, headerTop, {
    width: contentWidth(doc),
    align: "right",
  });
  doc.y = headerTop;
  doc.moveDown(2);

  drawInfoBlock(doc, "공급자", [
    ["상호", data.supplierName],
    ["사업자등록번호", data.supplierBusinessNo],
    ["대표자", data.supplierRepresentative],
  ]);

  drawInfoBlock(doc, "공급받는 자", [
    ["상호", data.buyerOrgName],
    ["사업자등록번호", data.buyerBusinessNo],
    ["대표자", data.buyerRepresentative],
    ["주소", data.buyerAddress],
    ["이메일", data.buyerEmail],
  ]);

  const columns: Column[] = [
    { key: "no", label: "번호", width: 40, align: "center" },
    { key: "name", label: "품목", width: 160, align: "left" },
    { key: "spec", label: "규격", width: 120, align: "left" },
    { key: "quantity", label: "수량", width: 55, align: "center" },
    { key: "unitPrice", label: "단가", width: 60, align: "right" },
    { key: "amount", label: "공급가액", width: 60, align: "right" },
  ];
  const rows = data.items.map((it) => ({
    no: String(it.no),
    name: it.name,
    spec: it.spec,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    amount: it.amount,
  }));
  drawTable(doc, columns, rows);

  doc.moveDown(0.6);
  const w = contentWidth(doc);
  const sx = PAGE_MARGIN;
  const summary: [string, string][] = [
    ["공급가액", data.supplyAmount],
    ["세액", data.vatAmount],
    ["합계금액", data.totalAmount],
  ];
  for (const [label, value] of summary) {
    const top = doc.y;
    doc.font(FONT_BOLD).fontSize(10).fillColor(COLOR_TEXT);
    doc.text(label, sx + w * 0.5, top, { width: w * 0.25 - 8, align: "right" });
    doc.text(value, sx + w * 0.75, top, { width: w * 0.25 - 8, align: "right" });
    doc.moveDown(0.4);
  }
  doc.moveDown(0.8);

  drawInfoBlock(doc, "비고", [["품목 요약", data.remark]]);

  drawFooterNote(doc, ["위와 같이 세금계산서를 발행합니다.", "KORINK 공공조달 플랫폼"]);

  return toBuffer(doc);
}
