import { sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyStats } from "@/db/schema";
import { rateLimitLocal } from "@/server/rate-limit";
import { ipFromHeaders } from "@/server/request";

/**
 * Çerezsiz, kişisel veri tutmayan sayaç: günlük sayfa görüntüleme, tekil ziyaretçi (tarayıcı günlük bayrağıyla)
 * ve arama motorlarından gelen organik girişler. KVKK açısından açık rıza gerektirmeyecek şekilde tasarlanmıştır.
 */
export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  if (!rateLimitLocal(`t:${ip}`, 120, 60_000).ok) return new Response(null, { status: 204 });
  if (/bot|crawl|spider|slurp/i.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  let body: { p?: string; r?: string; v?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 204 });
  }
  const path = String(body.p ?? "/").split("?")[0]!.slice(0, 200);
  if (path.startsWith("/panel") || path.startsWith("/yonetim")) return new Response(null, { status: 204 });
  const day = new Date().toISOString().slice(0, 10);
  const ref = String(body.r ?? "");
  const engine = /google\./.test(ref) ? "google" : /bing\./.test(ref) ? "bing" : /yandex\./.test(ref) ? "yandex" : /duckduckgo\./.test(ref) ? "duckduckgo" : null;
  const rows: { day: string; metric: string; dimension: string; value: number }[] = [
    { day, metric: "pageview", dimension: "", value: 1 },
    { day, metric: "page", dimension: path, value: 1 },
  ];
  if (body.v) rows.push({ day, metric: "visitor", dimension: "", value: 1 });
  if (engine) {
    rows.push({ day, metric: "organic", dimension: engine, value: 1 });
    rows.push({ day, metric: "organic_landing", dimension: path, value: 1 });
  }
  await db.insert(dailyStats).values(rows).onConflictDoUpdate({ target: [dailyStats.day, dailyStats.metric, dailyStats.dimension], set: { value: sql`${dailyStats.value} + 1` } });
  return new Response(null, { status: 204 });
}
