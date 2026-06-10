import Redis from "ioredis";

const g = globalThis as unknown as { __korinkRedis?: Redis | null; __korinkRedisTried?: boolean };

export function getRedis(): Redis | null {
  if (g.__korinkRedisTried) return g.__korinkRedis ?? null;
  g.__korinkRedisTried = true;

  const url = process.env.REDIS_URL;
  if (!url) {
    g.__korinkRedis = null;
    return null;
  }
  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 1500,

      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });

    client.on("error", (e) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[redis] unavailable — graceful fallback:", e.message);
      }
    });
    g.__korinkRedis = client;
    return client;
  } catch {
    g.__korinkRedis = null;
    return null;
  }
}

export async function withRedis<T>(fn: (r: Redis) => Promise<T>, fallback: T): Promise<T> {
  const r = getRedis();
  if (!r) return fallback;
  try {
    return await fn(r);
  } catch {
    return fallback;
  }
}
