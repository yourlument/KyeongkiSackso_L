   
                                                                          
                                                                            
   
export const QUOTE_SEAL_RING_CENTER_X = 632;
export const QUOTE_SEAL_RING_CENTER_Y = 626;
export const QUOTE_SEAL_INNER_RING_RADIUS = 320;
export const QUOTE_SEAL_OUTER_RING_RADIUS = 526;
export const QUOTE_SEAL_TEXT_RADIUS = (
  QUOTE_SEAL_INNER_RING_RADIUS + QUOTE_SEAL_OUTER_RING_RADIUS
) / 2;
const BASE_TEXT_ARC_DEGREES = 145;
const KOREAN_LONG_TEXT_ARC_DEGREES = 205;
const LATIN_LONG_TEXT_ARC_DEGREES = 210;

export function normalizeQuoteSealCompanyName(value: string | null | undefined): string | null {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized || null;
}

export type QuoteSealTextLayout = {
  text: string;
  radius: number;
  preferredFontSize: number;
  maxArcDegrees: number;
  gapRatio: number;
  verticalOffsetRatio: number;
  previewBaselineOffsetRatio: number;
};

export function getQuoteSealOccupiedArcLength(widths: number[], gap: number): number {
  if (widths.length === 0) return 0;
  const slotWidth = Math.max(...widths);
  return slotWidth * widths.length + gap * Math.max(0, widths.length - 1);
}

   
                                                                           
                                                                           
   
export function getQuoteSealCharacterAngles(widths: number[], gap: number, radius: number): number[] {
  if (widths.length === 0) return [];
  if (widths.length === 1) return [-Math.PI / 2];
  const step = (Math.max(...widths) + gap) / radius;
  const first = -Math.PI / 2 - step * (widths.length - 1) / 2;
  return widths.map((_, index) => first + step * index);
}

   
                                                                        
                                                                         
   
export function getQuoteSealTextLayout(companyName: string): QuoteSealTextLayout {
  const compact = companyName.replace(/\s+/g, "").trim() || "업체";
  const text = compact.replace(/[a-z]/g, (character) => character.toUpperCase());
  const characterCount = Array.from(text).length;
  const latinOnly = /^[A-Z0-9&().,\-]+$/.test(text);

  if (latinOnly) {
    const maxArcDegrees = Math.min(
      LATIN_LONG_TEXT_ARC_DEGREES,
      BASE_TEXT_ARC_DEGREES + Math.max(0, characterCount - 16) * (65 / 7),
    );
    return {
      text,
      radius: QUOTE_SEAL_TEXT_RADIUS,
      preferredFontSize: 214,
      maxArcDegrees,
      gapRatio: 0.1,
      verticalOffsetRatio: 0.57,
      previewBaselineOffsetRatio: 0.36,
    };
  }

  const maxArcDegrees = Math.min(
    KOREAN_LONG_TEXT_ARC_DEGREES,
    BASE_TEXT_ARC_DEGREES + Math.max(0, characterCount - 6) * 12,
  );
  return {
    text,
    radius: QUOTE_SEAL_TEXT_RADIUS,
    preferredFontSize: 172,
    maxArcDegrees,
    gapRatio: 0.04,
    verticalOffsetRatio: 0.52,
    previewBaselineOffsetRatio: 0.39,
  };
}
