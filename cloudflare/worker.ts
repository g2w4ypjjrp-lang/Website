/**
 * Cloudflare Worker giriş noktası.
 * OpenNext’in ürettiği Next.js işleyicisini sarar ve Cloudflare Cron Trigger ile zamanlanmış görevleri çalıştırır
 * (otomatik sipariş onayı, hakediş serbest bırakma, planlı blog yayını, e-posta yeniden deneme).
 */
// @ts-expect-error: `opennextjs-cloudflare build` sonrası oluşur
import { default as nextHandler } from "../.open-next/worker.js";

type Env = { CRON_SECRET?: string } & Record<string, unknown>;
type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException(): void };

export default {
  fetch(request: Request, env: Env, ctx: Ctx) {
    return nextHandler.fetch(request, env, ctx);
  },
  async scheduled(_event: unknown, env: Env, ctx: Ctx) {
    if (!env.CRON_SECRET) return;
    const req = new Request("https://cron.internal/api/cron/run", { method: "POST", headers: { authorization: `Bearer ${env.CRON_SECRET}` } });
    ctx.waitUntil(nextHandler.fetch(req, env, ctx));
  },
};

// Önbellek altyapısının Durable Object sınıfları
// @ts-expect-error: `opennextjs-cloudflare build` sonrası oluşur
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "../.open-next/worker.js";
