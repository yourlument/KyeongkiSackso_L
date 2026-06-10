import { withRedis } from "./redis";

export async function cached<T>(key: string, ttlSec: number, compute: () => Promise<T>): Promise<T> {
  const hit = await withRedis(async (r) => r.get(`cache:${key}`), null);
  if (hit != null) {
    try {
      return JSON.parse(hit) as T;
    } catch {
    }
  }
  const fresh = await compute();
  await withRedis(async (r) => {
    await r.set(`cache:${key}`, JSON.stringify(fresh), "EX", ttlSec);
    return null;
  }, null);
  return fresh;
}

export async function invalidate(keyOrPrefix: string): Promise<void> {
  await withRedis(async (r) => {
    if (keyOrPrefix.endsWith("*")) {
      const keys = await r.keys(`cache:${keyOrPrefix}`);
      if (keys.length) await r.del(...keys);
    } else {
      await r.del(`cache:${keyOrPrefix}`);
    }
    return null;
  }, null);
}
