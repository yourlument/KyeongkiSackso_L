import { readFileSync } from "node:fs";
import path from "node:path";
import {
  getQuoteSealCharacterAngles,
  getQuoteSealOccupiedArcLength,
  getQuoteSealTextLayout,
  normalizeQuoteSealCompanyName,
  QUOTE_SEAL_RING_CENTER_X,
  QUOTE_SEAL_RING_CENTER_Y,
} from "../quote-seal";

const FONT_BOLD = "KR-Bold";
const SEAL_RED = "#F41B17";
const TEMPLATE_SIZE = 1254;
const TEMPLATE_PATH = path.join(process.cwd(), "src", "lib", "pdf", "assets", "quote-seal-template.png");

type Doc = PDFKit.PDFDocument;

let templateDataUri: string | null = null;

export function resolveQuoteSealCompanyName(
  generatedCompanyName: string | null | undefined,
  supplierName: string,
): string {
  return normalizeQuoteSealCompanyName(supplierName)
    ?? normalizeQuoteSealCompanyName(generatedCompanyName)
    ?? "업체";
}

export function getQuoteSealDimensions(height: number): { width: number; height: number } {
  return { width: height, height };
}

function getTemplateDataUri(): string {
  if (!templateDataUri) {
    templateDataUri = `data:image/png;base64,${readFileSync(TEMPLATE_PATH).toString("base64")}`;
  }
  return templateDataUri;
}

function drawCompanyNameOnArc(doc: Doc, companyName: string, x: number, y: number, scale: number): void {
  const layout = getQuoteSealTextLayout(companyName);
  const characters = Array.from(layout.text);
  const radius = layout.radius * scale;
  const maxArcRadians = (layout.maxArcDegrees * Math.PI) / 180;
  const preferredFontSize = layout.preferredFontSize * scale;

  doc.font(FONT_BOLD).fontSize(preferredFontSize);
  const preferredWidths = characters.map((character) => doc.widthOfString(character));
  const preferredArcLength = getQuoteSealOccupiedArcLength(
    preferredWidths,
    preferredFontSize * layout.gapRatio,
  );
  const fitRatio = preferredArcLength > 0
    ? Math.min(1, radius * maxArcRadians / preferredArcLength)
    : 1;
  const fontSize = preferredFontSize * fitRatio;

  doc.font(FONT_BOLD).fontSize(fontSize);
  const widths = characters.map((character) => doc.widthOfString(character));
  const gap = fontSize * layout.gapRatio;
  const angles = getQuoteSealCharacterAngles(widths, gap, radius);
  const centerX = x + QUOTE_SEAL_RING_CENTER_X * scale;
  const centerY = y + QUOTE_SEAL_RING_CENTER_Y * scale;

  characters.forEach((character, index) => {
    const width = widths[index];
    const glyphAngle = angles[index];
    const glyphX = centerX + Math.cos(glyphAngle) * radius;
    const glyphY = centerY + Math.sin(glyphAngle) * radius;

    doc.save();
    doc.fillColor(SEAL_RED).font(FONT_BOLD).fontSize(fontSize);
    doc.rotate((glyphAngle * 180) / Math.PI + 90, { origin: [glyphX, glyphY] });
    doc.text(character, glyphX - width / 2, glyphY - fontSize * layout.verticalOffsetRatio, {
      width,
      align: "center",
      lineBreak: false,
    });
    doc.restore();
  });
}

                                                                                              
export function drawQuoteCompanySeal(doc: Doc, companyName: string, x: number, y: number, height: number): void {
  const originalX = doc.x;
  const originalY = doc.y;
  const { width } = getQuoteSealDimensions(height);
  const scale = height / TEMPLATE_SIZE;

  doc.save();
  doc.image(getTemplateDataUri(), x, y, { width, height });
  drawCompanyNameOnArc(doc, companyName, x, y, scale);
  doc.restore();
  doc.x = originalX;
  doc.y = originalY;
}
