import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { sha256 } from "./crypto";

/**
 * Mobil uygulamalar (Android / iOS) için ortak API katmanı.
 * Web ile aynı oturum tablosunu kullanır; token Authorization: Bearer başlığıyla gönderilir.
 */
export async function apiUser(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const [row] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row && row.status === "active" ? row : null;
}

export const json = (data: unknown, status = 200, cache = "private, no-store") => Response.json(data, { status, headers: { "Cache-Control": cache } });
export const apiError = (status: number, message: string) => json({ error: message }, status);
