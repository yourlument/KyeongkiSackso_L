function safeFilename(value: string | null | undefined): string {
  const cleaned = value?.replace(/[\r\n"\\]/g, " ").trim().slice(0, 180);
  return cleaned || "download";
}

export function fileDownloadUrl(fileUrl: string, fileName: string): string {
  if (!fileUrl.startsWith("/api/files/")) return fileUrl;
  const divider = fileUrl.includes("?") ? "&" : "?";
  return `${fileUrl}${divider}download=1&filename=${encodeURIComponent(safeFilename(fileName))}`;
}

export function attachmentDisposition(fileName: string | null): string {
  const safe = safeFilename(fileName);
  return `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}
