export const MULTIPART_THRESHOLD = 10 * 1024 * 1024;
export const MULTIPART_CHUNK = 8 * 1024 * 1024;
export const SINGLE_UPLOAD_MAX = 60 * 1024 * 1024;
export const FILE_MAX = 50 * 1024 * 1024;
export const VIDEO_MAX = 200 * 1024 * 1024;

export const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
export const VIDEO_EXTS = ["mp4", "webm", "mov", "avi", "mkv", "m4v"];
export const DOC_EXTS = [
  "pdf",
  "hwp",
  "hwpx",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "txt",
  "csv",
  "dwg",
];

export const ALLOWED_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS, ...DOC_EXTS];

export function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

export function isVideoName(name: string): boolean {
  return VIDEO_EXTS.includes(extOf(name));
}

export function isImageName(name: string): boolean {
  return IMAGE_EXTS.includes(extOf(name));
}

export function isAllowedName(name: string): boolean {
  return ALLOWED_EXTS.includes(extOf(name));
}

export function maxBytesFor(name: string): number {
  return isVideoName(name) ? VIDEO_MAX : FILE_MAX;
}

export const MAX_PARTS = Math.ceil(VIDEO_MAX / MULTIPART_CHUNK) + 2;
export const PART_MAX_BYTES = MULTIPART_CHUNK + 1024 * 1024;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  m4v: "video/x-m4v",
  pdf: "application/pdf",
  zip: "application/zip",
  txt: "text/plain",
  csv: "text/csv",
};

export function contentTypeFor(name: string, provided?: string): string {
  const byExt = CONTENT_TYPES[extOf(name)];
  if (byExt) return byExt;
  if (provided && provided !== "application/octet-stream") return provided;
  return "application/octet-stream";
}
