import { storage } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const file = await storage.read(key);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "private, max-age=60" },
  });
}
