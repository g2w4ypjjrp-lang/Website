import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { rateLimitLocal } from "@/server/rate-limit";

export const dynamic = "force-dynamic";

const body = z.object({ type: z.enum(["service", "provider"]), id: z.string().uuid() });

/**
 * Favori ekle/çıkar. Önbellekli (ISR) sayfalardaki kalp butonu bu ucu kullanır.
 * Çerezle kimlik doğrulandığı için yalnızca aynı kökenden gelen isteklere izin verilir (CSRF).
 */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin || new URL(origin).host !== new URL(req.url).host) return Response.json({ error: "Geçersiz istek" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
  if (!rateLimitLocal(`fav:${user.id}`, 60, 60_000).ok) return Response.json({ error: "Çok fazla istek" }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Geçersiz veri" }, { status: 400 });
  const { type, id } = parsed.data;
  const where = and(eq(favorites.userId, user.id), eq(favorites.targetType, type), eq(favorites.targetId, id));
  const exists = await db.query.favorites.findFirst({ where });
  if (exists) await db.delete(favorites).where(where);
  else await db.insert(favorites).values({ userId: user.id, targetType: type, targetId: id }).onConflictDoNothing();
  return Response.json({ favorited: !exists }, { headers: { "Cache-Control": "private, no-store" } });
}
