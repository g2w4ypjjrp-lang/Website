import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { fileUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Başlıktaki kullanıcı alanı için hafif oturum özeti. Herkese açık sayfalar bu sayede önbelleğe alınabilir. */
export async function GET() {
  const u = await getCurrentUser();
  if (!u) return Response.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, u.id), isNull(notifications.readAt)));
  return Response.json(
    { user: { name: u.name, email: u.email, role: u.role, avatar: fileUrl(u.avatarId), providerSlug: u.providerSlug }, unread: n },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
