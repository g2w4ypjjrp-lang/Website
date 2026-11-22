"use server";

import { redirect } from "next/navigation";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { authTokens, providerProfiles, users } from "@/db/schema";
import { createSession, destroyAllSessions, destroySession, getCurrentUser, hashPassword, verifyPassword } from "@/server/auth";
import { randomToken, sha256 } from "@/server/crypto";
import { rateLimit } from "@/server/rate-limit";
import { clientInfo } from "@/server/request";
import { sendMail } from "@/server/mail";
import { audit } from "@/server/audit";
import { absoluteUrl } from "@/lib/site";
import { slugify } from "@/lib/utils";

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; ok?: string } | undefined;

const email = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin.").max(200);
const password = z
  .string()
  .min(10, "Şifre en az 10 karakter olmalı.")
  .max(200)
  .refine((p) => /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(p) && /\d/.test(p), "Şifre en az bir harf ve bir rakam içermeli.");

function safeNext(next: unknown) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/yonetim") ? n : null;
}

async function issueToken(userId: string, type: "verify_email" | "reset_password", hours: number) {
  const token = randomToken();
  await db.insert(authTokens).values({ id: sha256(token), userId, type, expiresAt: new Date(Date.now() + hours * 3600_000) });
  return token;
}

async function sendVerification(userId: string, to: string, name: string) {
  const token = await issueToken(userId, "verify_email", 48);
  await sendMail({
    to,
    subject: "E-posta adresinizi doğrulayın",
    title: `Hoş geldiniz, ${name.split(" ")[0]}`,
    body: "Hesabınızı kullanmaya başlamak için e-posta adresinizi doğrulayın. Bağlantı 48 saat geçerlidir.",
    cta: { label: "E-postamı doğrula", href: absoluteUrl(`/e-posta-dogrula?token=${token}`) },
  });
}

const registerSchema = z.object({
  name: z.string().trim().min(3, "Adınızı ve soyadınızı yazın.").max(80),
  email,
  password,
  role: z.enum(["customer", "provider"]),
  accountType: z.enum(["individual", "agency", "company"]).default("individual"),
  consent: z.literal("on", { message: "Devam etmek için koşulları onaylamanız gerekiyor." }),
});

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  if (form.get("website")) return { error: "İstek doğrulanamadı." }; // honeypot
  const { ip } = await clientInfo();
  if (!(await rateLimit(`register:${ip}`, 5, 60 * 60_000)).ok) return { error: "Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin." };
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  const exists = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${d.email}`, columns: { id: true } });
  if (exists) return { fieldErrors: { email: ["Bu e-posta ile kayıtlı bir hesap var. Giriş yapmayı deneyin."] } };

  const [u] = await db
    .insert(users)
    .values({ email: d.email, name: d.name, passwordHash: await hashPassword(d.password), role: d.role, accountType: d.accountType })
    .returning({ id: users.id });
  if (d.role === "provider") {
    let slug = slugify(d.name, 40) || "uzman";
    if (await db.query.providerProfiles.findFirst({ where: eq(providerProfiles.slug, slug), columns: { userId: true } })) slug = `${slug}-${u!.id.slice(0, 4)}`;
    await db.insert(providerProfiles).values({ userId: u!.id, slug, displayName: d.name });
  }
  await sendVerification(u!.id, d.email, d.name);
  await audit(u!.id, "auth.register", "user", u!.id, { role: d.role });
  await createSession(u!.id);
  redirect(d.role === "provider" ? "/panel/profil?hosgeldin=1" : safeNext(form.get("next")) ?? "/panel?hosgeldin=1");
}

const loginSchema = z.object({ email, password: z.string().min(1, "Şifrenizi girin.") });

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const { ip } = await clientInfo();
  const key = `login:${ip}:${parsed.data.email}`;
  const rl = await rateLimit(key, 8, 15 * 60_000);
  if (!rl.ok) return { error: `Çok fazla başarısız deneme. ${Math.ceil((rl.retryAfter ?? 60) / 60)} dakika sonra tekrar deneyin.` };
  const u = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${parsed.data.email}` });
  // Zamanlama saldırılarına karşı kullanıcı yoksa da hash karşılaştırması yap
  const ok = await verifyPassword(parsed.data.password, u?.passwordHash ?? "$2a$12$0000000000000000000000uZx4cE7wqRrW1x4bJmK3o8e5mVnq9eW");
  if (!u || !ok) {
    await audit(u?.id ?? null, "auth.login_failed", "user", u?.id ?? null, { email: parsed.data.email });
    return { error: "E-posta veya şifre hatalı." };
  }
  if (u.status !== "active") return { error: "Bu hesap askıya alınmış. Destek ekibiyle iletişime geçin." };
  await createSession(u.id);
  await audit(u.id, u.role === "admin" ? "auth.admin_login" : "auth.login", "user", u.id);
  redirect(safeNext(form.get("next")) ?? (u.role === "admin" ? "/yonetim" : "/panel"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) return { fieldErrors: { email: ["Geçerli bir e-posta adresi girin."] } };
  const { ip } = await clientInfo();
  if (!(await rateLimit(`forgot:${ip}`, 5, 60 * 60_000)).ok) return { error: "Çok fazla istek. Lütfen daha sonra deneyin." };
  const u = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${parsed.data}` });
  if (u && u.status === "active") {
    const token = await issueToken(u.id, "reset_password", 1);
    await sendMail({
      to: u.email,
      subject: "Şifre sıfırlama isteği",
      title: "Şifrenizi sıfırlayın",
      body: "Hesabınız için şifre sıfırlama isteği aldık. Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz. Bağlantı 1 saat geçerlidir.",
      cta: { label: "Yeni şifre belirle", href: absoluteUrl(`/sifre-sifirla?token=${token}`) },
    });
    await audit(u.id, "auth.reset_requested", "user", u.id);
  }
  // Hesabın var olup olmadığını belli etme
  return { ok: "Bu adrese kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi." };
}

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const token = String(form.get("token") ?? "");
  const pw = password.safeParse(form.get("password"));
  if (!pw.success) return { fieldErrors: { password: pw.error.issues.map((i) => i.message) } };
  const row = await db.query.authTokens.findFirst({
    where: and(eq(authTokens.id, sha256(token)), eq(authTokens.type, "reset_password"), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())),
  });
  if (!row) return { error: "Bağlantının süresi dolmuş veya daha önce kullanılmış. Yeni bir bağlantı isteyin." };
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, row.id));
  await db.update(users).set({ passwordHash: await hashPassword(pw.data), updatedAt: new Date() }).where(eq(users.id, row.userId));
  await destroyAllSessions(row.userId);
  await audit(row.userId, "auth.password_reset", "user", row.userId);
  await createSession(row.userId);
  redirect("/panel?sifre=guncellendi");
}

export async function verifyEmailToken(token: string) {
  const row = await db.query.authTokens.findFirst({
    where: and(eq(authTokens.id, sha256(token)), eq(authTokens.type, "verify_email"), isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date())),
  });
  if (!row) return false;
  await db.update(authTokens).set({ usedAt: new Date() }).where(eq(authTokens.id, row.id));
  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, row.userId));
  await audit(row.userId, "auth.email_verified", "user", row.userId);
  return true;
}

export async function resendVerificationAction(): Promise<FormState> {
  const u = await getCurrentUser();
  if (!u) return { error: "Oturum bulunamadı." };
  if (u.emailVerifiedAt) return { ok: "E-posta adresiniz zaten doğrulanmış." };
  if (!(await rateLimit(`verify-resend:${u.id}`, 3, 60 * 60_000)).ok) return { error: "Kısa süre içinde çok fazla istek gönderdiniz." };
  await sendVerification(u.id, u.email, u.name);
  return { ok: "Doğrulama e-postası tekrar gönderildi." };
}

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const u = await getCurrentUser();
  if (!u) return { error: "Oturum bulunamadı." };
  const current = String(form.get("current") ?? "");
  const pw = password.safeParse(form.get("password"));
  if (!pw.success) return { fieldErrors: { password: pw.error.issues.map((i) => i.message) } };
  const row = await db.query.users.findFirst({ where: eq(users.id, u.id) });
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { fieldErrors: { current: ["Mevcut şifre hatalı."] } };
  await db.update(users).set({ passwordHash: await hashPassword(pw.data), updatedAt: new Date() }).where(eq(users.id, u.id));
  await destroyAllSessions(u.id);
  await createSession(u.id);
  await audit(u.id, "auth.password_changed", "user", u.id);
  return { ok: "Şifreniz güncellendi. Diğer cihazlardaki oturumlar kapatıldı." };
}
