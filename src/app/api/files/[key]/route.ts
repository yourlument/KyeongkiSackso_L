import { storage } from "@/lib/storage";
import { attachmentDisposition } from "@/lib/file-links";

export async function GET(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const file = await storage.read(key);
  if (!file) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=60",
      ...(url.searchParams.get("download") === "1"
        ? { "Content-Disposition": attachmentDisposition(url.searchParams.get("filename")) }
        : {}),
    },
  });
}
