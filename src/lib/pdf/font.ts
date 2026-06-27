import { readFileSync } from "fs";
import path from "path";

const FONT_DIR = path.join(process.cwd(), "src", "lib", "pdf", "fonts");

export const REGULAR_FONT_PATH = path.join(FONT_DIR, "NotoSansKR-Regular.ttf");
export const BOLD_FONT_PATH = path.join(FONT_DIR, "NotoSansKR-Bold.ttf");

let regular: Buffer | null = null;
let bold: Buffer | null = null;

export function getRegularFont(): Buffer {
  if (!regular) regular = readFileSync(REGULAR_FONT_PATH);
  return regular;
}

export function getBoldFont(): Buffer {
  if (!bold) bold = readFileSync(BOLD_FONT_PATH);
  return bold;
}
