import { withRedis } from "./redis";

const K = (key: string) => `rl:${key}`;

export async function rlCount(key: string): Promise<number> {
  return withRedis(async (r) => {
    const v = await r.get(K(key));
    return v ? parseInt(v, 10) : 0;
  }, 0);
}

export async function rlIncr(key: string, windowSec: number): Promise<void> {
  await withRedis(async (r) => {
    const n = await r.incr(K(key));
    if (n === 1) await r.expire(K(key), windowSec);
    return null;
  }, null);
}

export async function rlReset(key: string): Promise<void> {
  await withRedis(async (r) => {
    await r.del(K(key));
    return null;
  }, null);
}
