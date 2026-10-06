import { createHash, timingSafeEqual } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function secureHexEqual(actual: string, expected: string): boolean {
  if (!/^[0-9a-f]+$/i.test(actual) || actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(
    Buffer.from(actual.toLowerCase(), "utf8"),
    Buffer.from(expected.toLowerCase(), "utf8"),
  );
}

export function kstTimestamp(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(now)
    .filter((part) => part.type !== "literal")
    .map((part) => part.value)
    .join("");
}

export function kstDate(now = new Date()): string {
  return kstTimestamp(now).slice(0, 8);
}

export function nicepayText(value: string, maxBytes: number): string {
  let result = "";
  let bytes = 0;
  for (const char of value.replace(/["[\]]/g, "").trim()) {
    const size = char.charCodeAt(0) <= 0x7f ? 1 : 2;
    if (bytes + size > maxBytes) break;
    result += char;
    bytes += size;
  }
  return result;
}
