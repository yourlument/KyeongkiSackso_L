import { readFileSync } from "node:fs";
import path from "node:path";
import {
  getQuoteSealCharacterAngles,
  getQuoteSealOccupiedArcLength,
  getQuoteSealTextLayout,
  QUOTE_SEAL_RING_CENTER_X,
  QUOTE_SEAL_RING_CENTER_Y,
} from "./quote-seal";

const TEMPLATE_SIZE = 1254;
const TEMPLATE_PATH = path.join(process.cwd(), "src", "lib", "pdf", "assets", "quote-seal-template.png");
const SEAL_RED = "#F41B17";

let templateDataUri: string | null = null;

function getTemplateDataUri(): string {
  if (!templateDataUri) {
    templateDataUri = `data:image/png;base64,${readFileSync(TEMPLATE_PATH).toString("base64")}`;
  }
  return templateDataUri;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function estimatedCharacterWidths(text: string, fontSize: number): number[] {
  return Array.from(text).map((character) => {
    if (/[A-Z0-9]/.test(character)) return fontSize * 0.66;
    if (/[&().,\-]/.test(character)) return fontSize * 0.45;
    return fontSize;
  });
}

                                                                               
export function buildQuoteSealPreviewSvg(companyName: string): string {
  const layout = getQuoteSealTextLayout(companyName);
  const maxArcLength = layout.radius * (layout.maxArcDegrees * Math.PI / 180);
  const preferredWidths = estimatedCharacterWidths(layout.text, layout.preferredFontSize);
  const widthAtPreferredSize = getQuoteSealOccupiedArcLength(
    preferredWidths,
    layout.preferredFontSize * layout.gapRatio,
  );
  const fitRatio = widthAtPreferredSize > 0
    ? Math.min(1, maxArcLength / widthAtPreferredSize)
    : 1;
  const fontSize = layout.preferredFontSize * fitRatio;
  const widths = estimatedCharacterWidths(layout.text, fontSize);

  const angles = getQuoteSealCharacterAngles(widths, fontSize * layout.gapRatio, layout.radius);
  const characters = Array.from(layout.text);
  const characterElements = characters.map((character, index) => {
    const angle = angles[index];
    const glyphX = QUOTE_SEAL_RING_CENTER_X + Math.cos(angle) * layout.radius;
    const glyphY = QUOTE_SEAL_RING_CENTER_Y + Math.sin(angle) * layout.radius;
    const rotation = angle * 180 / Math.PI + 90;
    const baselineOffset = fontSize * layout.previewBaselineOffsetRatio;
    return `<text x="${glyphX.toFixed(2)}" y="${glyphY.toFixed(2)}" dy="${baselineOffset.toFixed(2)}" text-anchor="middle" transform="rotate(${rotation.toFixed(2)} ${glyphX.toFixed(2)} ${glyphY.toFixed(2)})">${escapeXml(character)}</text>`;
  }).join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TEMPLATE_SIZE}" height="${TEMPLATE_SIZE}" viewBox="0 0 ${TEMPLATE_SIZE} ${TEMPLATE_SIZE}">`,
    `<image href="${getTemplateDataUri()}" x="0" y="0" width="${TEMPLATE_SIZE}" height="${TEMPLATE_SIZE}"/>`,
    `<g fill="${SEAL_RED}" font-family="Noto Sans KR, Apple SD Gothic Neo, sans-serif" font-size="${fontSize.toFixed(2)}" font-weight="700">${characterElements}</g>`,
    `</svg>`,
  ].join("");
}
