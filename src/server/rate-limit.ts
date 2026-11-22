import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

type Result = { ok: boolean; remaining: number; retryAfter?: number };

/*
 * İki katmanlı hız sınırlama:
 *  - rateLimitLocal: süreç/izolat belleğinde, ek gecikmesiz. Arama önerisi ve sayfa sayacı gibi sık ve düşük riskli uçlar için.
 *  - rateLimit: Postgres'te tutulur; Cloudflare Workers'ın birden çok izolatı ve birden çok sunucu arasında ortaktır.
 *    Giriş, kayıt, mesaj, teklif, ödeme gibi kötüye kullanıma açık işlemler için.
 * Uç katmanda ek koruma için Cloudflare WAF hız sınırı kuralları önerilir (bkz. docs/CLOUDFLARE.md).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitLocal(key: string, limit: number, windowMs: number): Result {
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

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Result> {
  try {
    const rows = await db.execute<{ count: number; retry: number }>(sql`
      insert into rate_limits (key, count, reset_at)
      values (${key}, 1, now() + (${windowMs} * interval '1 millisecond'))
      on conflict (key) do update set
        count = case when rate_limits.reset_at < now() then 1 else rate_limits.count + 1 end,
        reset_at = case when rate_limits.reset_at < now() then excluded.reset_at else rate_limits.reset_at end
      returning count, greatest(0, extract(epoch from (reset_at - now())))::int as retry`);
    const r = rows[0]!;
    return { ok: r.count <= limit, remaining: Math.max(0, limit - r.count), retryAfter: r.retry };
  } catch {
    // Veritabanına ulaşılamıyorsa bellek içi sınırlamaya düş (hizmet kesintisi yaratmamak için)
    return rateLimitLocal(key, limit, windowMs);
  }
}
