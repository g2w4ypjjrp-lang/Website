import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";

/**
 * Cloudflare önbellek mimarisi
 * - Artımlı önbellek (ISR sayfaları): R2 + kenar konumunda bölgesel önbellek → sayfalar Türkiye’deki PoP’tan anında döner.
 * - Yeniden doğrulama kuyruğu: Durable Objects (süresi dolan sayfa arka planda yenilenir, kullanıcı beklemez).
 * - Etiket önbelleği: Durable Objects (yönetim panelindeki değişiklikler revalidatePath ile anında yansır).
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: doQueue,
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
  enableCacheInterception: true,
});
