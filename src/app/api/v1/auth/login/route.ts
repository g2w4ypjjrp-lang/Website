import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { verifyPassword } from "@/server/auth";
import { randomToken, sha256 } from "@/server/crypto";
import { rateLimit } from "@/server/rate-limit";
import { audit } from "@/server/audit";
import { apiError, json } from "@/server/api";
import { ipFromHeaders } from "@/server/request";

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!body.success) return apiError(400, "E-posta ve şifre gerekli.");
  if (!(await rateLimit(`api-login:${ip}:${body.data.email}`, 8, 15 * 60_000)).ok) return apiError(429, "Çok fazla deneme.");
  const u = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${body.data.email.toLowerCase()}` });
  if (!u || u.status !== "active" || !(await verifyPassword(body.data.password, u.passwordHash))) return apiError(401, "E-posta veya şifre hatalı.");
  if (u.role === "admin") return apiError(403, "Yönetici hesapları mobil API ile giriş yapamaz.");
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 30 * 864e5);
  await db.insert(sessions).values({ id: sha256(token), userId: u.id, expiresAt, ip, userAgent: req.headers.get("user-agent")?.slice(0, 300) });
  await audit(u.id, "auth.api_login", "user", u.id);
  return json({ token, expiresAt, user: { id: u.id, name: u.name, role: u.role } });
}
