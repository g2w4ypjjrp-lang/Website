"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blocks, conversations, notifications, orders, portfolioItems, providerProfiles, servicePackages, services, tickets, users, categories, type Attachment } from "@/db/schema";
import { requireUser, getCurrentUser } from "@/server/auth";
import { transitionOrder, OrderError, type OrderAction } from "@/server/orders";
import { sendMessage, MessageError, getConversationFor } from "@/server/messaging";
import { saveUpload } from "@/server/storage";
import { audit } from "@/server/audit";
import { notify } from "@/server/notify";
import { slugify } from "@/lib/utils";
import type { FormState } from "./auth";

/* ───────────── Sipariş işlemleri ───────────── */

export async function orderAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum bulunamadı." };
  const code = String(form.get("code"));
  const action = String(form.get("action")) as OrderAction;
  const note = String(form.get("note") ?? "").trim() || undefined;
  const order = await db.query.orders.findFirst({ where: eq(orders.code, code) });
  if (!order) return { error: "Sipariş bulunamadı." };
  const as = order.buyerId === user.id ? "buyer" : order.providerId === user.id ? "provider" : null;
  if (!as) return { error: "Bu siparişte işlem yetkiniz yok." };
  if ((action === "request_revision" || action === "request_refund" || action === "open_dispute") && (!note || note.length < 15)) return { error: "Lütfen talebinizi en az 15 karakterle açıklayın." };
  try {
    if (action === "deliver") {
      const conv = await db.query.conversations.findFirst({ where: eq(conversations.orderId, order.id) });
      if (!conv) return { error: "Sipariş sohbeti bulunamadı." };
      const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 10);
      if (!files.length && !note) return { error: "Teslimat için en az bir dosya veya açıklama ekleyin." };
      const atts: Attachment[] = [];
      for (const f of files) atts.push(await saveUpload(f, { ownerId: user.id, kind: "file", isPublic: false, scope: `conversation:${conv.id}` }));
      await transitionOrder(order.id, "deliver", { id: user.id, as });
      await sendMessage(user.id, conv.id, note ?? "Teslimat dosyaları ektedir.", atts, "delivery");
    } else {
      await transitionOrder(order.id, action, { id: user.id, as }, note);
    }
    if (action === "request_refund" || action === "open_dispute") {
      await db.insert(tickets).values({ type: action === "request_refund" ? "refund" : "dispute", orderId: order.id, openedById: user.id, reason: action === "request_refund" ? "İade talebi" : "Uyuşmazlık", details: note ?? "", refundKurus: action === "request_refund" ? order.totalKurus : null });
    }
  } catch (e) {
    if (e instanceof OrderError || e instanceof MessageError) return { error: e.message };
    return { error: (e as Error).message || "İşlem tamamlanamadı." };
  }
  revalidatePath(`/panel/siparisler/${code}`);
  return { ok: "İşlem kaydedildi." };
}

/* ───────────── Mesajlaşma ───────────── */

export async function sendMessageAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum bulunamadı." };
  const conversationId = String(form.get("conversationId"));
  const body = String(form.get("body") ?? "");
  const conv = await getConversationFor(user.id, conversationId);
  if (!conv) return { error: "Sohbet bulunamadı." };
  try {
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 5);
    const atts: Attachment[] = [];
    for (const f of files) atts.push(await saveUpload(f, { ownerId: user.id, kind: "file", isPublic: false, scope: `conversation:${conv.id}` }));
    const r = await sendMessage(user.id, conversationId, body, atts);
    return { ok: r.warnContact ? "uyari" : "gonderildi" };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function blockUserAction(form: FormData) {
  const user = await requireUser();
  const target = z.string().uuid().parse(form.get("userId"));
  const unblock = form.get("unblock") === "1";
  if (unblock) await db.delete(blocks).where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, target)));
  else await db.insert(blocks).values({ blockerId: user.id, blockedId: target }).onConflictDoNothing();
  await audit(user.id, unblock ? "user.unblock" : "user.block", "user", target);
  revalidatePath("/panel/mesajlar");
}

/* ───────────── Hizmet yönetimi ───────────── */

const pkgSchema = z.object({
  name: z.string().trim().min(2).max(40),
  price: z.coerce.number().int().min(100, "Paket fiyatı en az 100 ₺ olmalı.").max(5_000_000),
  days: z.coerce.number().int().min(1).max(365),
  revisions: z.coerce.number().int().min(0).max(50),
  features: z.string().max(1000),
});

const serviceSchema = z.object({
  title: z.string().trim().min(15, "Başlık en az 15 karakter olmalı.").max(90, "Başlık en fazla 90 karakter olabilir."),
  categoryId: z.string().uuid("Kategori seçin."),
  summary: z.string().trim().min(20, "Kısa açıklama en az 20 karakter olmalı.").max(200),
  description: z.string().trim().min(150, "Açıklama en az 150 karakter olmalı; süreci ve kapsamı anlatın.").max(12000),
  tags: z.string().max(300).optional(),
  requirements: z.string().max(2000).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

function parseLines(v: FormDataEntryValue | null) {
  return String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
}

export async function saveServiceAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") return { error: "Hizmet oluşturmak için uzman hesabı gerekir." };
  const id = String(form.get("id") ?? "");
  const intent = String(form.get("intent") ?? "draft"); // draft | submit
  const parsed = serviceSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, error: "Formdaki hataları düzeltin." };
  const d = parsed.data;
  const cat = await db.query.categories.findFirst({ where: eq(categories.id, d.categoryId) });
  if (!cat) return { fieldErrors: { categoryId: ["Geçersiz kategori."] } };

  const tiers = ["basic", "standard", "premium"] as const;
  const pkgs: { tier: (typeof tiers)[number]; name: string; priceKurus: number; deliveryDays: number; revisions: number; features: string[] }[] = [];
  for (const t of tiers) {
    const enabled = t === "basic" || form.get(`${t}.enabled`) === "on";
    if (!enabled) continue;
    const r = pkgSchema.safeParse({ name: form.get(`${t}.name`), price: form.get(`${t}.price`), days: form.get(`${t}.days`), revisions: form.get(`${t}.revisions`), features: form.get(`${t}.features`) });
    if (!r.success) return { error: `${t === "basic" ? "Temel" : t === "standard" ? "Standart" : "Profesyonel"} paket bilgileri eksik veya hatalı: ${r.error.issues[0]?.message}` };
    pkgs.push({ tier: t, name: r.data.name, priceKurus: r.data.price * 100, deliveryDays: r.data.days, revisions: r.data.revisions, features: parseLines(r.data.features).slice(0, 12) });
  }
  const faqs = parseLines(form.get("faqs"))
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((x) => x[0] && x[1])
    .slice(0, 10)
    .map(([q, a]) => ({ q: q!, a: a! }));
  const extras = parseLines(form.get("extras"))
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((x) => x[0] && Number(x[1]) > 0)
    .slice(0, 6)
    .map(([title, price, days], i) => ({ id: `e${i}`, title: title!, priceKurus: Math.round(Number(price) * 100), days: Number(days) || 0 }));
  const tags = (d.tags ?? "").split(",").map((t) => t.trim().toLocaleLowerCase("tr-TR")).filter(Boolean).slice(0, 8);

  let existing = id ? await db.query.services.findFirst({ where: and(eq(services.id, id), eq(services.providerId, user.id)) }) : null;
  if (id && !existing) return { error: "Hizmet bulunamadı." };

  const files = { cover: form.get("cover"), gallery: form.getAll("gallery") };
  let coverId = existing?.coverId ?? null;
  let gallery = existing?.gallery ?? [];
  try {
    if (files.cover instanceof File && files.cover.size > 0) coverId = (await saveUpload(files.cover, { ownerId: user.id, kind: "image", isPublic: true })).id;
    const removed = form.getAll("removeGallery").map(String);
    gallery = gallery.filter((g) => !removed.includes(g));
    for (const g of files.gallery) if (g instanceof File && g.size > 0 && gallery.length < 8) gallery.push((await saveUpload(g, { ownerId: user.id, kind: "image", isPublic: true })).id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const status = intent === "submit" ? (existing?.status === "active" ? "pending" : "pending") : existing?.status === "active" ? "active" : "draft";
  if (intent === "submit" && !user.emailVerifiedAt) return { error: "Hizmeti onaya göndermeden önce e-posta adresinizi doğrulayın." };
  const values = {
    title: d.title,
    categoryId: d.categoryId,
    summary: d.summary,
    description: d.description,
    tags,
    requirements: d.requirements ?? "",
    faqs,
    extras,
    coverId,
    gallery,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    startingPriceKurus: Math.min(...pkgs.map((p) => p.priceKurus)),
    minDeliveryDays: Math.min(...pkgs.map((p) => p.deliveryDays)),
    status: status as "draft" | "pending" | "active",
    updatedAt: new Date(),
  };
  if (existing) {
    await db.update(services).set(values).where(eq(services.id, existing.id));
  } else {
    let slug = slugify(d.title, 70);
    if (await db.query.services.findFirst({ where: eq(services.slug, slug), columns: { id: true } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    [existing] = await db.insert(services).values({ ...values, providerId: user.id, slug }).returning();
  }
  await db.delete(servicePackages).where(eq(servicePackages.serviceId, existing!.id));
  await db.insert(servicePackages).values(pkgs.map((p) => ({ ...p, serviceId: existing!.id, description: p.features.join(", ") })));
  await audit(user.id, intent === "submit" ? "service.submitted" : "service.saved", "service", existing!.id);
  revalidatePath("/panel/hizmetler");
  if (!id) redirect(`/panel/hizmetler/${existing!.id}?kaydedildi=1`);
  return { ok: intent === "submit" ? "Hizmetiniz incelemeye gönderildi. Onaylandığında yayına alınır." : "Değişiklikler kaydedildi." };
}

export async function setServiceStatusAction(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id"));
  const to = String(form.get("to"));
  const svc = await db.query.services.findFirst({ where: and(eq(services.id, id), eq(services.providerId, user.id)) });
  if (!svc) return;
  if (to === "paused" && svc.status === "active") await db.update(services).set({ status: "paused" }).where(eq(services.id, id));
  if (to === "active" && svc.status === "paused") await db.update(services).set({ status: "active" }).where(eq(services.id, id));
  if (to === "delete" && ["draft", "rejected", "paused"].includes(svc.status)) {
    const used = await db.query.orders.findFirst({ where: eq(orders.serviceId, id), columns: { id: true } });
    if (used) await db.update(services).set({ status: "paused" }).where(eq(services.id, id));
    else await db.delete(services).where(eq(services.id, id));
  }
  revalidatePath("/panel/hizmetler");
}

/* ───────────── Profil ───────────── */

const profileSchema = z.object({
  displayName: z.string().trim().min(3).max(80),
  headline: z.string().trim().min(10, "Unvan en az 10 karakter olmalı.").max(100),
  bio: z.string().trim().max(3000),
  city: z.string().trim().max(40).optional(),
  website: z.union([z.literal(""), z.string().url("Geçerli bir adres girin (https://…)").max(200)]).optional(),
  skills: z.string().max(400),
  languages: z.string().max(200),
  iban: z.union([z.literal(""), z.string().regex(/^TR\d{24}$/, "IBAN TR ile başlamalı ve 26 karakter olmalı.")]).optional(),
});

export async function saveProfileAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") return { error: "Uzman hesabı gerekir." };
  const raw = Object.fromEntries(form);
  const parsed = profileSchema.safeParse({ ...raw, iban: String(raw.iban ?? "").replace(/\s/g, "").toUpperCase() });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  const avatar = form.get("avatar");
  try {
    if (avatar instanceof File && avatar.size > 0) {
      const up = await saveUpload(avatar, { ownerId: user.id, kind: "image", isPublic: true });
      await db.update(users).set({ avatarId: up.id }).where(eq(users.id, user.id));
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  await db
    .update(providerProfiles)
    .set({
      displayName: d.displayName,
      headline: d.headline,
      bio: d.bio,
      city: d.city || null,
      website: d.website || null,
      skills: d.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 15),
      languages: d.languages.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6),
      iban: d.iban || null,
      updatedAt: new Date(),
    })
    .where(eq(providerProfiles.userId, user.id));
  revalidatePath("/panel/profil");
  return { ok: "Profiliniz güncellendi." };
}

export async function addPortfolioAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") return { error: "Uzman hesabı gerekir." };
  const title = String(form.get("title") ?? "").trim();
  if (title.length < 3) return { fieldErrors: { title: ["Başlık girin."] } };
  const link = String(form.get("link") ?? "").trim();
  if (link && !/^https?:\/\//.test(link)) return { fieldErrors: { link: ["Bağlantı https:// ile başlamalı."] } };
  let imageId: string | null = null;
  const img = form.get("image");
  try {
    if (img instanceof File && img.size > 0) imageId = (await saveUpload(img, { ownerId: user.id, kind: "image", isPublic: true })).id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(portfolioItems).where(eq(portfolioItems.providerId, user.id));
  if (n >= 30) return { error: "En fazla 30 portföy öğesi ekleyebilirsiniz." };
  await db.insert(portfolioItems).values({ providerId: user.id, title: title.slice(0, 100), description: String(form.get("description") ?? "").slice(0, 500), link: link || null, imageId });
  revalidatePath("/panel/portfolyo");
  return { ok: "Portföye eklendi." };
}

export async function deletePortfolioAction(form: FormData) {
  const user = await requireUser();
  await db.delete(portfolioItems).where(and(eq(portfolioItems.id, String(form.get("id"))), eq(portfolioItems.providerId, user.id)));
  revalidatePath("/panel/portfolyo");
}

/* ───────────── Hesap ayarları ───────────── */

export async function saveAccountAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum bulunamadı." };
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 3) return { fieldErrors: { name: ["Ad soyad girin."] } };
  const phone = String(form.get("phone") ?? "").replace(/[^\d+]/g, "").slice(0, 15) || null;
  const billing = {
    kind: (form.get("billingKind") === "corporate" ? "corporate" : "individual") as "individual" | "corporate",
    fullName: String(form.get("fullName") ?? "").slice(0, 100) || undefined,
    company: String(form.get("company") ?? "").slice(0, 150) || undefined,
    taxOffice: String(form.get("taxOffice") ?? "").slice(0, 80) || undefined,
    taxNumber: String(form.get("taxNumber") ?? "").replace(/\D/g, "").slice(0, 11) || undefined,
    address: String(form.get("address") ?? "").slice(0, 300) || undefined,
    city: String(form.get("city") ?? "").slice(0, 40) || undefined,
  };
  const prefs = { emailOrders: form.get("emailOrders") === "on", emailMessages: form.get("emailMessages") === "on", emailMarketing: form.get("emailMarketing") === "on" };
  const avatar = form.get("avatar");
  let avatarId: string | undefined;
  try {
    if (avatar instanceof File && avatar.size > 0) avatarId = (await saveUpload(avatar, { ownerId: user.id, kind: "image", isPublic: true })).id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  await db.update(users).set({ name, phone, billing, notificationPrefs: prefs, ...(avatarId ? { avatarId } : {}), updatedAt: new Date() }).where(eq(users.id, user.id));
  revalidatePath("/panel/ayarlar");
  return { ok: "Bilgileriniz kaydedildi." };
}

export async function deleteAccountAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum bulunamadı." };
  if (form.get("confirm") !== "HESABIMI SIL") return { error: "Onay metnini aynen yazın." };
  const active = await db.query.orders.findFirst({ where: and(sql`(${orders.buyerId} = ${user.id} or ${orders.providerId} = ${user.id})`, inArray(orders.status, ["created", "in_progress", "awaiting_delivery", "delivered", "revision_requested", "refund_in_progress", "disputed"])) });
  if (active) return { error: "Devam eden siparişleriniz varken hesabınızı silemezsiniz." };
  // Yasal saklama yükümlülüğü olan sipariş/ödeme kayıtları korunur; kişisel veriler anonimleştirilir.
  await db.update(users).set({ status: "deleted", email: `silindi-${user.id}@eksen.invalid`, name: "Silinmiş kullanıcı", phone: null, billing: null, avatarId: null }).where(eq(users.id, user.id));
  await db.update(services).set({ status: "paused" }).where(eq(services.providerId, user.id));
  await audit(user.id, "user.self_deleted", "user", user.id);
  const { destroyAllSessions } = await import("@/server/auth");
  await destroyAllSessions(user.id);
  redirect("/?hesap=silindi");
}

/* ───────────── Bildirimler ───────────── */

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  revalidatePath("/panel", "layout");
}

export async function requestVerificationAction() {
  const user = await requireUser();
  await notify(user.id, "account", "Doğrulama talebiniz alındı", { body: "Ekibimiz kimlik ve vergi bilgilerinizi inceleyip 2 iş günü içinde dönüş yapacak.", email: false });
  await audit(user.id, "provider.verification_requested", "user", user.id);
  revalidatePath("/panel/profil");
}
