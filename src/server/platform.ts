import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare Workers (workerd) üzerinde mi çalışıyoruz? Node.js'te false döner. */
export const isWorkers = typeof navigator !== "undefined" && (navigator as { userAgent?: string }).userAgent === "Cloudflare-Workers";

type Ctx = { env: CloudflareEnv; ctx: { waitUntil(p: Promise<unknown>): void }; cf?: unknown };

/** İstek bağlamı (env, ctx). Node.js'te veya istek dışında null. */
export function cfContext(): Ctx | null {
  if (!isWorkers) return null;
  try {
    return getCloudflareContext() as unknown as Ctx;
  } catch {
    return null;
  }
}

export function cfEnv() {
  return cfContext()?.env ?? null;
}

export function cfImages(): CfImagesBinding | null {
  return ((cfEnv() as unknown as { IMAGES?: CfImagesBinding } | null)?.IMAGES ?? null) as CfImagesBinding | null;
}
