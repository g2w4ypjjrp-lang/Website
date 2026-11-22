import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, orders, payouts } from "@/db/schema";
import { getSettings } from "@/server/settings";
import { transitionOrder } from "@/server/orders";
import { safeEqual } from "@/server/crypto";
import { audit } from "@/server/audit";

/**
 * Zamanlanmış işler (saatte bir):
 * 1) Süresi dolan teslimatları otomatik onaylar
 * 2) Bekleme süresi dolan hakedişleri ödemeye hazır yapar
 * 3) Planlanmış blog yazılarını yayınlar
 * 4) Süresi dolan öne çıkarmaları temizler
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !safeEqual(auth, secret)) return new Response("Yetkisiz", { status: 401 });
  const s = await getSettings();
  const cutoff = new Date(Date.now() - s.autoCompleteDays * 864e5);
  const due = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.status, "delivered"), lte(orders.deliveredAt, cutoff)));
  let completed = 0;
  for (const o of due) {
    try {
      await transitionOrder(o.id, "approve", { id: null, as: "system" }, "Otomatik onay");
      completed++;
    } catch {}
  }
  const released = await db.update(payouts).set({ status: "available" }).where(and(eq(payouts.status, "held"), lte(payouts.availableAt, new Date()))).returning({ id: payouts.id });
  const published = await db.update(blogPosts).set({ status: "published" }).where(and(eq(blogPosts.status, "scheduled"), lte(blogPosts.publishedAt, new Date()))).returning({ id: blogPosts.id });
  await db.execute(sql`update services set featured_until = null where featured_until < now()`);
  const result = { autoCompleted: completed, payoutsReleased: released.length, postsPublished: published.length };
  await audit(null, "cron.run", "system", null, result);
  return Response.json(result);
}
