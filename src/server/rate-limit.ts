import "server-only";

/**
 * Basit sabit-pencere hız sınırlayıcı (tek sunucu için).
 * Yatay ölçeklemede aynı arayüz Redis/Upstash ile değiştirilmelidir.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 50_000) for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
    return { ok: true, remaining: limit - 1 };
  }
  b.count++;
  return { ok: b.count <= limit, remaining: Math.max(0, limit - b.count), retryAfter: Math.ceil((b.resetAt - now) / 1000) };
}
