"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  banners,
  blogPosts,
  categories,
  landingPages,
  orderEvents,
  orders,
  payments,
  payouts,
  providerProfiles,
  redirects,
  reviews,
  notifications,
  services,
  staticPages,
  tickets,
  users,
} from "@/db/schema";
import { requireAdmin, destroyAllSessions } from "@/server/auth";
import { audit } from "@/server/audit";
import { notify } from "@/server/notify";
import { saveSettings } from "@/server/settings";
import { transitionOrder } from "@/server/orders";
import { getProviderByName } from "@/server/payments";
import { clientInfo } from "@/server/request";
import { saveUpload } from "@/server/storage";
import { slugify } from "@/lib/utils";
import type { FormState } from "./auth";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const bool = (f: FormData, k: string) => f.get(k) === "on";
const pctToBps = (v: string) => (v === "" ? null : Math.round(Number(v.replace(",", ".")) * 100));

function parseFaqs(v: string) {
  return v
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((x) => x[0] && x[1])
    .map(([q, a]) => ({ q: q!, a: a! }));
}

/* ───────────── Kullanıcılar ───────────── */

export async function adminUserAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const op = str(form, "op");
  if (id === admin.id && op !== "commission") return;
  const target = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!target) return;
  switch (op) {
    case "suspend":
      await db.update(users).set({ status: "suspended" }).where(eq(users.id, id));
      await destroyAllSessions(id);
      await db.update(services).set({ status: "paused" }).where(and(eq(services.providerId, id), eq(services.status, "active")));
      break;
    case "activate":
      await db.update(users).set({ status: "active" }).where(eq(users.id, id));
      break;
    case "delete":
      await db.update(users).set({ status: "deleted", email: `silindi-${id}@eksen.invalid`, name: "Silinmiş kullanıcı", phone: null, billing: null, avatarId: null }).where(eq(users.id, id));
      await destroyAllSessions(id);
      await db.update(services).set({ status: "paused" }).where(eq(services.providerId, id));
      break;
    case "verify":
      await db.update(providerProfiles).set({ verifiedAt: new Date() }).where(eq(providerProfiles.userId, id));
      await db.update(users).set({ emailVerifiedAt: target.emailVerifiedAt ?? new Date() }).where(eq(users.id, id));
      await notify(id, "account", "Hesabınız doğrulandı", { body: "Profilinizde artık doğrulanmış rozeti görünüyor." });
      break;
    case "unverify":
      await db.update(providerProfiles).set({ verifiedAt: null }).where(eq(providerProfiles.userId, id));
      break;
    case "level": {
      const level = z.enum(["new", "rising", "pro", "top"]).parse(form.get("level"));
      await db.update(providerProfiles).set({ level }).where(eq(providerProfiles.userId, id));
      break;
    }
    case "commission":
      await db.update(providerProfiles).set({ customCommissionBps: pctToBps(str(form, "pct")) }).where(eq(providerProfiles.userId, id));
      break;
    case "submerchant":
      await db.update(providerProfiles).set({ subMerchantKey: str(form, "key") || null }).where(eq(providerProfiles.userId, id));
      break;
    case "premium":
      await db.update(providerProfiles).set({ premiumUntil: new Date(Date.now() + 30 * 864e5) }).where(eq(providerProfiles.userId, id));
      break;
  }
  await audit(admin.id, `admin.user.${op}`, "user", id, { pct: form.get("pct"), level: form.get("level") });
  revalidatePath("/yonetim/kullanicilar");
}

/* ───────────── Hizmet moderasyonu ───────────── */

export async function adminServiceAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const op = str(form, "op");
  const svc = await db.query.services.findFirst({ where: eq(services.id, id) });
  if (!svc) return;
  switch (op) {
    case "approve":
      await db.update(services).set({ status: "active", rejectionReason: null, publishedAt: svc.publishedAt ?? new Date() }).where(eq(services.id, id));
      await notify(svc.providerId, "account", "Hizmetiniz yayında", { body: svc.title, link: `/hizmet/${svc.slug}` });
      break;
    case "reject": {
      const reason = str(form, "reason") || "Hizmet içeriği yayın kurallarına uygun değil.";
      await db.update(services).set({ status: "rejected", rejectionReason: reason }).where(eq(services.id, id));
      await notify(svc.providerId, "account", "Hizmetiniz için düzenleme gerekli", { body: reason, link: `/panel/hizmetler/${id}` });
      break;
    }
    case "pause":
      await db.update(services).set({ status: "paused" }).where(eq(services.id, id));
      break;
    case "feature":
      await db.update(services).set({ featuredUntil: new Date(Date.now() + Number(form.get("days") ?? 7) * 864e5) }).where(eq(services.id, id));
      break;
    case "unfeature":
      await db.update(services).set({ featuredUntil: null }).where(eq(services.id, id));
      break;
    case "sponsor":
      await db.update(services).set({ sponsored: !svc.sponsored }).where(eq(services.id, id));
      break;
    case "seo":
      await db
        .update(services)
        .set({ seoTitle: str(form, "seoTitle") || null, seoDescription: str(form, "seoDescription") || null, noindex: bool(form, "noindex"), slug: slugify(str(form, "slug")) || svc.slug, categoryId: str(form, "categoryId") || svc.categoryId })
        .where(eq(services.id, id));
      if (str(form, "slug") && slugify(str(form, "slug")) !== svc.slug)
        await db.insert(redirects).values({ fromPath: `/hizmet/${svc.slug}`, toPath: `/hizmet/${slugify(str(form, "slug"))}` }).onConflictDoNothing();
      break;
  }
  await audit(admin.id, `admin.service.${op}`, "service", id, { reason: form.get("reason") });
  revalidatePath("/yonetim/hizmetler");
}

/* ───────────── Sipariş, iade, uyuşmazlık ───────────── */

async function refundOrder(orderId: string, adminId: string, note: string) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) throw new Error("Sipariş yok");
  const pay = await db.query.payments.findFirst({ where: and(eq(payments.orderId, orderId), eq(payments.status, "succeeded")) });
  if (pay) {
    const txId = ((pay.meta as { paymentTransactionIds?: string[] }).paymentTransactionIds ?? [])[0] ?? pay.providerRef ?? "";
    const { ip } = await clientInfo();
    const r = await getProviderByName(pay.provider).refund(txId, order.totalKurus, ip);
    if (!r.ok) throw new Error("Ödeme kuruluşu iadeyi reddetti: " + JSON.stringify(r.meta));
    await db.update(payments).set({ status: "refunded", meta: { ...pay.meta, refund: r.meta }, updatedAt: new Date() }).where(eq(payments.id, pay.id));
  }
  await db.update(orders).set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() }).where(eq(orders.id, orderId));
  await db.update(payouts).set({ status: "cancelled" }).where(eq(payouts.orderId, orderId));
  await db.insert(orderEvents).values({ orderId, actorId: adminId, type: "refund", fromStatus: order.status, toStatus: "cancelled", note });
  await notify(order.buyerId, "order_cancelled", `${order.code}: iadeniz onaylandı`, { body: "Tutar, ödeme kuruluşu üzerinden kartınıza iade edilecek. Bankanıza göre 2–10 iş günü sürebilir.", link: `/panel/siparisler/${order.code}` });
  await notify(order.providerId, "order_cancelled", `${order.code}: sipariş iade ile kapatıldı`, { body: note, link: `/panel/siparisler/${order.code}` });
}

export async function adminTicketAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const op = str(form, "op"); // refund | reject | complete | resolve
  const note = str(form, "note");
  const t = await db.query.tickets.findFirst({ where: eq(tickets.id, id) });
  if (!t || t.status !== "open") return { error: "Talep zaten sonuçlanmış." };
  try {
    if (t.orderId && op === "refund") await refundOrder(t.orderId, admin.id, note || "İade onaylandı.");
    if (t.orderId && op === "complete") {
      const o = await db.query.orders.findFirst({ where: eq(orders.id, t.orderId) });
      if (o && (o.status === "disputed" || o.status === "refund_in_progress")) {
        await db.update(orders).set({ status: "delivered" }).where(eq(orders.id, o.id));
        await transitionOrder(o.id, "approve", { id: admin.id, as: "admin" }, note || "Uyuşmazlık uzman lehine sonuçlandı.");
      }
    }
    if (t.orderId && op === "reject") {
      const o = await db.query.orders.findFirst({ where: eq(orders.id, t.orderId) });
      if (o?.statusBeforeIssue) {
        await db.update(orders).set({ status: o.statusBeforeIssue, statusBeforeIssue: null }).where(eq(orders.id, o.id));
        await db.insert(orderEvents).values({ orderId: o.id, actorId: admin.id, type: "ticket_rejected", fromStatus: o.status, toStatus: o.statusBeforeIssue, note: note || "Talep reddedildi; sipariş kaldığı yerden devam ediyor." });
        await notify(o.buyerId, "ticket", `${o.code}: talebiniz sonuçlandı`, { body: note || "Talep reddedildi; sipariş devam ediyor.", link: `/panel/siparisler/${o.code}` });
        await notify(o.providerId, "ticket", `${o.code}: talep sonuçlandı, sipariş devam ediyor`, { link: `/panel/siparisler/${o.code}`, email: false });
      }
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  await db
    .update(tickets)
    .set({ status: op === "refund" ? "approved" : op === "reject" ? "rejected" : "resolved", resolution: note || op, resolvedById: admin.id, resolvedAt: new Date() })
    .where(eq(tickets.id, id));
  await audit(admin.id, `admin.ticket.${op}`, "ticket", id, { orderId: t.orderId, note });
  revalidatePath("/yonetim/talepler");
  return { ok: "Talep sonuçlandırıldı." };
}

export async function adminCancelOrderAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  await refundOrder(id, admin.id, str(form, "note") || "Yönetim tarafından iptal ve iade edildi.");
  await audit(admin.id, "admin.order.cancel_refund", "order", id);
  revalidatePath("/yonetim/siparisler");
}

/* ───────────── Finans ───────────── */

export async function releasePayoutsAction() {
  const admin = await requireAdmin();
  const r = await db.update(payouts).set({ status: "available" }).where(and(eq(payouts.status, "held"), lte(payouts.availableAt, new Date()))).returning({ id: payouts.id });
  await audit(admin.id, "admin.payouts.release", "payout", null, { count: r.length });
  revalidatePath("/yonetim/finans");
}

export async function markPayoutPaidAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const ref = str(form, "reference").slice(0, 80) || null;
  const p = await db.query.payouts.findFirst({ where: eq(payouts.id, id) });
  if (!p || p.status !== "available") return;
  // iyzico pazaryeri modelinde serbest bırakma "approve" ile yapılır
  const pay = await db.query.payments.findFirst({ where: and(eq(payments.orderId, p.orderId), eq(payments.status, "succeeded")) });
  if (pay && pay.provider !== "sandbox") {
    const txId = ((pay.meta as { paymentTransactionIds?: string[] }).paymentTransactionIds ?? [])[0];
    if (txId) await getProviderByName(pay.provider).releaseToSeller(txId);
  }
  await db.update(payouts).set({ status: "paid", paidAt: new Date(), reference: ref }).where(eq(payouts.id, id));
  await notify(p.providerId, "payout", "Hakedişiniz aktarıldı", { body: `Referans: ${ref ?? "—"}`, link: "/panel/kazanc" });
  await audit(admin.id, "admin.payout.paid", "payout", id, { amount: p.amountKurus, ref });
  revalidatePath("/yonetim/finans");
}

/* ───────────── Ayarlar ───────────── */

export async function saveSettingsAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const n = (k: string) => Number(str(form, k).replace(",", "."));
  const commission = n("commissionPct");
  if (!(commission >= 0 && commission <= 50)) return { error: "Komisyon oranı %0–50 arasında olmalı." };
  const next = await saveSettings({
    commissionBps: Math.round(commission * 100),
    autoCompleteDays: Math.max(1, Math.min(30, Math.round(n("autoCompleteDays")))),
    payoutHoldDays: Math.max(0, Math.min(60, Math.round(n("payoutHoldDays")))),
    minOrderKurus: Math.max(0, Math.round(n("minOrder") * 100)),
    featuredPriceKurus: Math.max(0, Math.round(n("featuredPrice") * 100)),
    premiumMonthlyKurus: Math.max(0, Math.round(n("premiumPrice") * 100)),
    supportEmail: str(form, "supportEmail"),
    maintenanceMode: bool(form, "maintenanceMode"),
  });
  await audit(admin.id, "admin.settings.update", "settings", "platform", next as unknown as Record<string, unknown>);
  revalidatePath("/", "layout");
  return { ok: "Ayarlar kaydedildi. Yeni oranlar bundan sonraki siparişlere uygulanır." };
}

/* ───────────── Kategoriler ───────────── */

export async function saveCategoryAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = str(form, "id");
  const name = str(form, "name");
  if (name.length < 2) return { fieldErrors: { name: ["Ad girin."] } };
  const slug = slugify(str(form, "slug") || name);
  const clash = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (clash && clash.id !== id) return { fieldErrors: { slug: ["Bu adres kullanılıyor."] } };
  const values = {
    name,
    slug,
    parentId: str(form, "parentId") || null,
    shortDescription: str(form, "shortDescription"),
    intro: str(form, "intro"),
    h1: str(form, "h1") || null,
    seoTitle: str(form, "seoTitle") || null,
    seoDescription: str(form, "seoDescription") || null,
    commissionBps: pctToBps(str(form, "commissionPct")),
    sortOrder: Number(str(form, "sortOrder")) || 0,
    isActive: bool(form, "isActive"),
    noindex: bool(form, "noindex"),
    faqs: parseFaqs(str(form, "faqs")),
    canonicalUrl: str(form, "canonicalUrl") || null,
    filters: str(form, "filters")
      .split("\n")
      .map((l) => l.split("|").map((x) => x.trim()))
      .filter((x) => x[0] && x[1])
      .map(([label, opts]) => ({ key: slugify(label!), label: label!, options: opts!.split(",").map((o) => o.trim()).filter(Boolean).slice(0, 20) })),
    updatedAt: new Date(),
    ...(await (async () => {
      const img = form.get("image");
      if (img instanceof File && img.size > 0) return { imageId: (await saveUpload(img, { ownerId: admin.id, kind: "image", isPublic: true })).id };
      return {};
    })()),
  };
  if (id) {
    const old = await db.query.categories.findFirst({ where: eq(categories.id, id) });
    await db.update(categories).set(values).where(eq(categories.id, id));
    if (old && old.slug !== slug) await db.insert(redirects).values({ fromPath: `/kategori/${old.slug}`, toPath: `/kategori/${slug}` }).onConflictDoNothing();
  } else await db.insert(categories).values(values);
  await audit(admin.id, id ? "admin.category.update" : "admin.category.create", "category", id || slug);
  revalidatePath("/", "layout");
  if (!id) redirect("/yonetim/kategoriler?kaydedildi=1");
  return { ok: "Kategori kaydedildi." };
}

/* ───────────── SEO: açılış sayfaları, yönlendirmeler ───────────── */

export async function saveLandingAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = str(form, "id");
  const slug = slugify(str(form, "slug"));
  const required = { slug, h1: str(form, "h1"), seoTitle: str(form, "seoTitle"), seoDescription: str(form, "seoDescription"), intro: str(form, "intro") };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return { error: `Zorunlu alanlar eksik: ${missing.join(", ")}` };
  const body = str(form, "body");
  const publish = bool(form, "isPublished");
  // İnce içerik koruması: yayınlanacak sayfanın gövdesi en az 250 kelime olmalı
  if (publish && body.split(/\s+/).filter(Boolean).length < 250) return { error: "Yayınlamak için içerik en az 250 kelime olmalı. Kopya veya ince içerikli sayfalar sıralamaya zarar verir." };
  const og = form.get("ogImage");
  const ogImageId = og instanceof File && og.size > 0 ? (await saveUpload(og, { ownerId: admin.id, kind: "image", isPublic: true })).id : undefined;
  const values = { ...required, body, categoryId: str(form, "categoryId") || null, faqs: parseFaqs(str(form, "faqs")), isPublished: publish, noindex: bool(form, "noindex"), canonicalUrl: str(form, "canonicalUrl") || null, updatedAt: new Date(), ...(ogImageId ? { ogImageId } : {}) };
  const clash = await db.query.landingPages.findFirst({ where: eq(landingPages.slug, slug) });
  if (clash && clash.id !== id) return { error: "Bu adres başka bir sayfada kullanılıyor." };
  if (id) await db.update(landingPages).set(values).where(eq(landingPages.id, id));
  else await db.insert(landingPages).values(values);
  await audit(admin.id, "admin.landing.save", "landing", slug, { publish });
  revalidatePath(`/${slug}`);
  revalidatePath("/haritalar/sitemap/0.xml");
  if (!id) redirect("/yonetim/seo?kaydedildi=1");
  return { ok: "Sayfa kaydedildi." };
}

export async function redirectAction(form: FormData) {
  const admin = await requireAdmin();
  const op = str(form, "op");
  if (op === "delete") await db.delete(redirects).where(eq(redirects.id, str(form, "id")));
  else {
    const from = "/" + str(form, "from").replace(/^\/+/, "");
    const to = str(form, "to");
    if (from.length > 1 && to && from !== to) await db.insert(redirects).values({ fromPath: from, toPath: to, permanent: !bool(form, "temporary") }).onConflictDoUpdate({ target: redirects.fromPath, set: { toPath: to } });
  }
  await audit(admin.id, `admin.redirect.${op || "save"}`, "redirect", str(form, "from") || str(form, "id"));
  revalidatePath("/yonetim/seo");
}

/* ───────────── Blog ───────────── */

export async function savePostAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title");
  const content = str(form, "content");
  if (title.length < 10) return { fieldErrors: { title: ["Başlık en az 10 karakter olmalı."] } };
  const slug = slugify(str(form, "slug") || title, 90);
  const clash = await db.query.blogPosts.findFirst({ where: eq(blogPosts.slug, slug) });
  if (clash && clash.id !== id) return { fieldErrors: { slug: ["Bu adres kullanılıyor."] } };
  const status = z.enum(["draft", "scheduled", "published"]).parse(form.get("status"));
  const when = str(form, "publishedAt");
  const publishedAt = status === "draft" ? null : when ? new Date(when) : new Date();
  if (status === "scheduled" && (!publishedAt || publishedAt <= new Date())) return { error: "Planlanmış yayın için ileri bir tarih seçin." };
  let coverId: string | undefined;
  const cover = form.get("cover");
  try {
    if (cover instanceof File && cover.size > 0) coverId = (await saveUpload(cover, { ownerId: admin.id, kind: "image", isPublic: true })).id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  const values = {
    title,
    slug,
    excerpt: str(form, "excerpt"),
    content,
    category: str(form, "category") || "Rehber",
    tags: str(form, "tags").split(",").map((t) => t.trim()).filter(Boolean),
    authorName: str(form, "authorName") || "Eksen Editör Ekibi",
    status,
    publishedAt,
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
    relatedCategoryId: str(form, "relatedCategoryId") || null,
    seoTitle: str(form, "seoTitle") || null,
    seoDescription: str(form, "seoDescription") || null,
    noindex: bool(form, "noindex"),
    updatedAt: new Date(),
    ...(coverId ? { coverId } : {}),
  };
  let postId = id;
  if (id) await db.update(blogPosts).set(values).where(eq(blogPosts.id, id));
  else postId = (await db.insert(blogPosts).values({ ...values, authorId: admin.id }).returning())[0]!.id;
  await audit(admin.id, "admin.post.save", "post", postId, { status });
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  if (!id) redirect(`/yonetim/blog/${postId}?kaydedildi=1`);
  return { ok: "Yazı kaydedildi." };
}

export async function deletePostAction(form: FormData) {
  const admin = await requireAdmin();
  await db.delete(blogPosts).where(eq(blogPosts.id, str(form, "id")));
  await audit(admin.id, "admin.post.delete", "post", str(form, "id"));
  redirect("/yonetim/blog");
}

/* ───────────── İçerik: sabit sayfalar, bannerlar ───────────── */

export async function savePageAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = str(form, "id");
  const values = { slug: slugify(str(form, "slug")), title: str(form, "title"), content: str(form, "content"), seoDescription: str(form, "seoDescription") || null, noindex: bool(form, "noindex"), updatedAt: new Date() };
  if (!values.slug || !values.title) return { error: "Başlık ve adres zorunlu." };
  if (id) await db.update(staticPages).set(values).where(eq(staticPages.id, id));
  else await db.insert(staticPages).values(values);
  await audit(admin.id, "admin.page.save", "page", values.slug);
  revalidatePath(`/sayfa/${values.slug}`);
  return { ok: "Sayfa kaydedildi." };
}

export async function bannerAction(form: FormData) {
  const admin = await requireAdmin();
  const op = str(form, "op");
  if (op === "delete") await db.delete(banners).where(eq(banners.id, str(form, "id")));
  else if (op === "toggle") await db.update(banners).set({ isActive: sql`not ${banners.isActive}` }).where(eq(banners.id, str(form, "id")));
  else
    await db.insert(banners).values({
      placement: str(form, "placement") || "home_top",
      title: str(form, "title"),
      body: str(form, "body") || null,
      href: str(form, "href") || null,
      ctaLabel: str(form, "ctaLabel") || null,
      isSponsored: bool(form, "isSponsored"),
      endsAt: str(form, "endsAt") ? new Date(str(form, "endsAt")) : null,
    });
  await audit(admin.id, `admin.banner.${op || "create"}`, "banner", str(form, "id") || null);
  revalidatePath("/yonetim/icerik");
  revalidatePath("/");
}

/* ───────────── Değerlendirme moderasyonu ve başarı hikâyeleri ───────────── */

export async function adminReviewAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const op = str(form, "op");
  const r = await db.query.reviews.findFirst({ where: eq(reviews.id, id) });
  if (!r) return;
  if (op === "hide" || op === "show") {
    await db.update(reviews).set({ isHidden: op === "hide", isFeatured: op === "hide" ? false : r.isFeatured }).where(eq(reviews.id, id));
    // Ortalama puanları yeniden hesapla
    await db.execute(sql`update provider_profiles set rating_avg = coalesce((select round(avg(rating) * 100) from reviews where provider_id = ${r.providerId} and not is_hidden), 0), rating_count = (select count(*) from reviews where provider_id = ${r.providerId} and not is_hidden) where user_id = ${r.providerId}`);
    if (r.serviceId) await db.execute(sql`update services set rating_avg = coalesce((select round(avg(rating) * 100) from reviews where service_id = ${r.serviceId} and not is_hidden), 0), rating_count = (select count(*) from reviews where service_id = ${r.serviceId} and not is_hidden) where id = ${r.serviceId}`);
  }
  if (op === "feature") await db.update(reviews).set({ isFeatured: true, storyTitle: str(form, "storyTitle").slice(0, 120) || null }).where(eq(reviews.id, id));
  if (op === "unfeature") await db.update(reviews).set({ isFeatured: false }).where(eq(reviews.id, id));
  await audit(admin.id, `admin.review.${op}`, "review", id);
  revalidatePath("/yonetim/degerlendirmeler");
  revalidatePath("/");
}

/* ───────────── Sistem duyurusu ───────────── */

export async function broadcastAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const title = str(form, "title");
  const body = str(form, "body");
  const audience = str(form, "audience"); // all | customer | provider
  if (title.length < 5) return { error: "Başlık en az 5 karakter olmalı." };
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.status, "active"), audience === "customer" || audience === "provider" ? eq(users.role, audience) : sql`${users.role} <> 'admin'`));
  const link = str(form, "link") || null;
  for (let i = 0; i < rows.length; i += 500)
    await db.insert(notifications).values(rows.slice(i, i + 500).map((u) => ({ userId: u.id, type: "system", title, body, link })));
  if (bool(form, "email")) for (const u of rows) await notify(u.id, "system", title, { body, link: link ?? undefined, email: true }).catch(() => {});
  await audit(admin.id, "admin.broadcast", "notification", null, { title, audience, count: rows.length });
  return { ok: `Duyuru ${rows.length} kullanıcıya gönderildi.` };
}

/* ───────────── Rol ve profil SEO ───────────── */

export async function adminRoleAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const role = z.enum(["customer", "provider"]).parse(form.get("role"));
  const u = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!u || u.role === "admin") return;
  await db.update(users).set({ role }).where(eq(users.id, id));
  if (role === "provider" && !(await db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, id) }))) {
    let slug = slugify(u.name, 40) || "uzman";
    if (await db.query.providerProfiles.findFirst({ where: eq(providerProfiles.slug, slug) })) slug = `${slug}-${id.slice(0, 4)}`;
    await db.insert(providerProfiles).values({ userId: id, slug, displayName: u.name });
  }
  await destroyAllSessions(id);
  await audit(admin.id, "admin.user.role", "user", id, { from: u.role, to: role });
  revalidatePath("/yonetim/kullanicilar");
}

export async function adminProviderSeoAction(form: FormData) {
  const admin = await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const p = await db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, id) });
  if (!p) return;
  const slug = slugify(str(form, "slug"), 40) || p.slug;
  if (slug !== p.slug) {
    if (await db.query.providerProfiles.findFirst({ where: eq(providerProfiles.slug, slug) })) return;
    await db.insert(redirects).values({ fromPath: `/uzman/${p.slug}`, toPath: `/uzman/${slug}` }).onConflictDoNothing();
  }
  await db.update(providerProfiles).set({ slug, seoTitle: str(form, "seoTitle") || null, seoDescription: str(form, "seoDescription") || null, noindex: bool(form, "noindex") }).where(eq(providerProfiles.userId, id));
  await audit(admin.id, "admin.provider.seo", "user", id);
  revalidatePath("/yonetim/kullanicilar");
}

/* ───────────── Yerel SEO (81 il) ───────────── */

export async function saveLocalSeoAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const { saveLocalSeoSettings } = await import("@/server/settings");
  const { getCity } = await import("@/lib/tr-cities");
  const min = Math.max(1, Math.min(50, Number(str(form, "minProviders")) || 1));
  const priority = form.getAll("priority").map(String).filter((s) => !!getCity(s));
  const next = await saveLocalSeoSettings({ indexAllHubs: bool(form, "indexAllHubs"), indexAll: bool(form, "indexAll"), minProviders: min, priority });
  await audit(admin.id, "admin.localseo.update", "settings", "localSeo", next as unknown as Record<string, unknown>);
  // Tüm il sayfalarını ve site haritasını yeniden üret
  revalidatePath("/il", "layout");
  revalidatePath("/[landing]/[il]", "page");
  revalidatePath("/haritalar/sitemap/[__metadata_id__]", "page");
  return { ok: `Kaydedildi. ${priority.length} öncelikli il; diğer illerde en az ${min} yerel uzman olduğunda sayfalar otomatik indekslenir.` };
}

/* ───────────── Yönetici güvenliği: iki adımlı doğrulama ve oturumlar ───────────── */

export async function beginTotpSetupAction() {
  const admin = await requireAdmin({ allowWithout2fa: true });
  const { generateSecret, sealSecret } = await import("@/server/totp");
  const u = await db.query.users.findFirst({ where: eq(users.id, admin.id) });
  if (u?.totpEnabledAt) return;
  await db.update(users).set({ totpSecret: await sealSecret(generateSecret()), totpEnabledAt: null }).where(eq(users.id, admin.id));
  await audit(admin.id, "admin.2fa.setup_started", "user", admin.id);
  revalidatePath("/yonetim/guvenlik");
}

export async function confirmTotpAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin({ allowWithout2fa: true });
  const { openSecret, verifyTotp } = await import("@/server/totp");
  const u = await db.query.users.findFirst({ where: eq(users.id, admin.id) });
  if (!u?.totpSecret) return { error: "Önce kurulumu başlatın." };
  if (!(await verifyTotp(await openSecret(u.totpSecret), str(form, "code")))) return { fieldErrors: { code: ["Kod doğrulanamadı. Uygulamadaki güncel 6 haneli kodu girin."] } };
  await db.update(users).set({ totpEnabledAt: new Date() }).where(eq(users.id, admin.id));
  await audit(admin.id, "admin.2fa.enabled", "user", admin.id);
  revalidatePath("/yonetim", "layout");
  return { ok: "İki adımlı doğrulama etkinleştirildi. Bir sonraki girişte kod istenecek." };
}

export async function disableTotpAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin({ allowWithout2fa: true });
  const { openSecret, verifyTotp } = await import("@/server/totp");
  const u = await db.query.users.findFirst({ where: eq(users.id, admin.id) });
  if (!u?.totpSecret || !u.totpEnabledAt) return { error: "İki adımlı doğrulama zaten kapalı." };
  if (!(await verifyTotp(await openSecret(u.totpSecret), str(form, "code")))) return { fieldErrors: { code: ["Kapatmak için geçerli bir kod girin."] } };
  await db.update(users).set({ totpSecret: null, totpEnabledAt: null }).where(eq(users.id, admin.id));
  await audit(admin.id, "admin.2fa.disabled", "user", admin.id);
  revalidatePath("/yonetim", "layout");
  return { ok: "İki adımlı doğrulama kapatıldı." };
}

export async function revokeOtherSessionsAction() {
  const admin = await requireAdmin({ allowWithout2fa: true });
  const { currentSessionId } = await import("@/server/auth");
  const { sessions } = await import("@/db/schema");
  const current = await currentSessionId();
  await db.delete(sessions).where(and(eq(sessions.userId, admin.id), sql`${sessions.id} <> ${current ?? ""}`));
  await audit(admin.id, "admin.sessions.revoked_others", "user", admin.id);
  revalidatePath("/yonetim/guvenlik");
}

/* ───────────── Kurumsal başvurular ───────────── */

export async function updateLeadAction(form: FormData) {
  const admin = await requireAdmin();
  const { leads } = await import("@/db/schema");
  const { LEAD_STATUSES } = await import("@/lib/leads");
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!id || !(status in LEAD_STATUSES)) return;
  const note = String(form.get("note") ?? "").trim().slice(0, 2000) || null;
  await db.update(leads).set({ status, note }).where(eq(leads.id, id));
  await audit(admin.id, "lead.updated", "lead", id, { status });
  revalidatePath("/yonetim/kurumsal");
  revalidatePath("/yonetim", "layout");
}

/* ───────────── Tema ve görünüm ───────────── */

const SOCIAL_HOSTS: Record<string, string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  linkedin: ["linkedin.com", "www.linkedin.com", "tr.linkedin.com"],
  x: ["x.com", "twitter.com", "www.x.com", "www.twitter.com"],
  youtube: ["youtube.com", "www.youtube.com"],
  facebook: ["facebook.com", "www.facebook.com"],
};

export async function setThemeAction(form: FormData) {
  const admin = await requireAdmin();
  const { saveThemeSettings } = await import("@/server/settings");
  const theme = form.get("theme") === "light" ? "light" : "premium";
  await saveThemeSettings({ theme });
  await audit(admin.id, "admin.theme.changed", "settings", "theme", { theme });
  // Tema kök düzende okunduğu için tüm sayfalar yeniden üretilir
  revalidatePath("/", "layout");
}

export async function saveSocialLinksAction(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const { saveThemeSettings } = await import("@/server/settings");
  const social: Record<string, string> = {};
  const errors: Record<string, string[]> = {};
  for (const [key, hosts] of Object.entries(SOCIAL_HOSTS)) {
    const raw = String(form.get(key) ?? "").trim();
    if (!raw) continue;
    try {
      const u = new URL(raw);
      // Yalnızca https ve ilgili ağın alan adı: javascript: vb. bağlantılar alt bilgiye giremez
      if (u.protocol !== "https:" || !hosts.includes(u.hostname)) throw new Error();
      social[key] = u.toString();
    } catch {
      errors[key] = [`Geçerli bir ${hosts[0]} adresi girin (https://…).`];
    }
  }
  if (Object.keys(errors).length) return { fieldErrors: errors };
  await saveThemeSettings({ social });
  await audit(admin.id, "admin.social.updated", "settings", "theme", { keys: Object.keys(social) });
  revalidatePath("/", "layout");
  return { ok: "Sosyal medya bağlantıları kaydedildi." };
}
