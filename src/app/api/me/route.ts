import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, notifications } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { fileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Başlıktaki kullanıcı alanı için hafif oturum özeti. Herkese açık sayfalar bu sayede önbelleğe alınabilir. */
export async function GET() {
  const u = await getCurrentUser();
  if (!u) return Response.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const [[{ n }], favRows] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, u.id), isNull(notifications.readAt))),
    // Önbellekli sayfalardaki kalp butonları için favori hizmet kimlikleri (üst sınırlı)
    db.select({ id: favorites.targetId }).from(favorites).where(and(eq(favorites.userId, u.id), eq(favorites.targetType, "service"))).limit(500),
  ]);
  return Response.json(
    { user: { name: u.name, email: u.email, role: u.role, avatar: fileUrl(u.avatarId), providerSlug: u.providerSlug }, unread: n, favs: favRows.map((f) => f.id) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
