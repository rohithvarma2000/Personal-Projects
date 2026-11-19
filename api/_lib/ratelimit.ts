/** Best-effort in-memory sliding window (per serverless instance). Contact also has a persistent DB-backed limit. */
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000) }
  }
  hits.push(now); buckets.set(key, hits)
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k)
  return { ok: true, retryAfterSec: 0 }
}
export const _resetRateLimits = () => buckets.clear()
