import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, providerProfiles } from "@/db/schema";
import { randomToken, sha256 } from "./crypto";
import { clientInfo } from "./request";

export const SESSION_COOKIE = "eksen_oturum";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "provider" | "admin";
  accountType: "individual" | "agency" | "company";
  emailVerifiedAt: Date | null;
  avatarId: string | null;
  providerSlug: string | null;
  /** Yönetici iki adımlı doğrulaması etkin mi */
  totpEnabled: boolean;
};

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function createSession(userId: string) {
  const token = randomToken();
  const { ip, userAgent } = await clientInfo();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt, ip, userAgent });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  // Süresi dolmuş oturumları fırsatçı olarak temizle
  await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())));
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** İstek başına bir kez çalışır (React cache). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      accountType: users.accountType,
      status: users.status,
      emailVerifiedAt: users.emailVerifiedAt,
      avatarId: users.avatarId,
      lastSeenAt: users.lastSeenAt,
      totpEnabledAt: users.totpEnabledAt,
      providerSlug: providerProfiles.slug,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(providerProfiles, eq(providerProfiles.userId, users.id))
    .where(and(eq(sessions.id, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0];
  if (!u || u.status !== "active") return null;
  // Çevrimiçi durumu: en fazla 2 dakikada bir güncelle
  if (!u.lastSeenAt || Date.now() - u.lastSeenAt.getTime() > 120_000) {
    await db.update(users).set({ lastSeenAt: sql`now()` }).where(eq(users.id, u.id));
  }
  const { status: _s, lastSeenAt: _l, totpEnabledAt, ...rest } = u;
  return { ...rest, totpEnabled: !!totpEnabledAt };
});

export async function requireUser(next?: string) {
  const u = await getCurrentUser();
  if (!u) redirect(`/giris${next ? `?sonra=${encodeURIComponent(next)}` : ""}`);
  return u;
}

export async function requireRole(role: SessionUser["role"] | SessionUser["role"][]) {
  const u = await requireUser();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(u.role)) redirect("/panel?yetki=yok");
  return u;
}

/** Yönetici iki adımlı doğrulaması zorunlu mu (ADMIN_2FA_REQUIRED=true) */
export const admin2faRequired = () => process.env.ADMIN_2FA_REQUIRED === "true";

export async function requireAdmin(opts: { allowWithout2fa?: boolean } = {}) {
  const u = await getCurrentUser();
  // Yönetici olmayanlar için yönetim alanının varlığını bile belli etme
  if (!u || u.role !== "admin") redirect("/giris");
  // Zorunluysa: iki adımlı doğrulama etkinleştirilmeden yönetim işlemi yapılamaz (yalnızca görüntüleme)
  if (!opts.allowWithout2fa && admin2faRequired() && !u.totpEnabled) redirect("/yonetim/guvenlik?zorunlu=1");
  return u;
}

/** Geçerli oturumun kimliği (sha256(token)) — "diğer oturumları kapat" için */
export async function currentSessionId() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? sha256(token) : null;
}
