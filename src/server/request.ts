import "server-only";
import { headers } from "next/headers";
import { isWorkers } from "@/server/platform";

/**
 * İstemci IP'si. Cloudflare'de `cf-connecting-ip` Cloudflare tarafından yazılır ve istemci tarafından
 * taklit edilemez; Node kurulumunda ters vekilin eklediği ilk `x-forwarded-for` değeri kullanılır.
 */
export function ipFromHeaders(h: Headers): string {
  const cf = h.get("cf-connecting-ip");
  if (isWorkers && cf) return cf.trim();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? cf ?? "unknown").trim();
}

export async function clientInfo() {
  const h = await headers();
  return { ip: ipFromHeaders(h), userAgent: h.get("user-agent")?.slice(0, 300) ?? null };
}
