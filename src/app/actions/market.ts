"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, favorites, offers, orders, projects, reviews, servicePackages, services, tickets, users } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/server/auth";
import { resolveCommissionBps, splitAmount } from "@/server/commission";
import { findOrCreateDirectConversation } from "@/server/messaging";
import { notify } from "@/server/notify";
import { audit } from "@/server/audit";
import { rateLimit } from "@/server/rate-limit";
import { saveUpload } from "@/server/storage";
import { randomCode, slugify } from "@/lib/utils";
import { getSettings } from "@/server/settings";
import type { FormState } from "./auth";

/* ───────────── Sipariş oluşturma (hazır paket) ───────────── */

export async function createOrderAction(form: FormData) {
  const user = await requireUser();
  const serviceId = String(form.get("serviceId"));
  const tier = z.enum(["basic", "standard", "premium"]).parse(form.get("tier"));
  const extraIds = form.getAll("extras").map(String);
  const svc = await db.query.services.findFirst({ where: and(eq(services.id, serviceId), eq(services.status, "active")) });
  if (!svc) redirect("/?hata=hizmet");
  if (svc.providerId === user.id) redirect(`/hizmet/${svc.slug}?hata=kendi`);
  if (user.role === "admin") redirect(`/hizmet/${svc.slug}?hata=yonetici`);
  const pkg = await db.query.servicePackages.findFirst({ where: and(eq(servicePackages.serviceId, svc.id), eq(servicePackages.tier, tier)) });
  if (!pkg) redirect(`/hizmet/${svc.slug}`);
  // Fiyatlar her zaman sunucudaki kayıttan hesaplanır; istemciden gelen tutara güvenilmez.
  const selected = svc.extras.filter((e) => extraIds.includes(e.id));
  const extrasKurus = selected.reduce((a, e) => a + e.priceKurus, 0);
  const total = pkg.priceKurus + extrasKurus;
  const settings = await getSettings();
  if (settings.maintenanceMode) redirect(`/hizmet/${svc.slug}?hata=bakim`);
  if (total < settings.minOrderKurus) redirect(`/hizmet/${svc.slug}?hata=asgari`);
  const days = Math.max(1, pkg.deliveryDays + selected.reduce((a, e) => a + e.days, 0));
  const { bps } = await resolveCommissionBps(svc.providerId, svc.categoryId);
  const split = splitAmount(total, bps);
  const code = randomCode("EK");
  await db.insert(orders).values({
    code,
    serviceId: svc.id,
    packageId: pkg.id,
    buyerId: user.id,
    providerId: svc.providerId,
    title: svc.title,
    tier,
    selectedExtras: selected,
    subtotalKurus: pkg.priceKurus,
    extrasKurus,
    totalKurus: total,
    commissionBps: bps,
    commissionKurus: split.commissionKurus,
    providerEarningKurus: split.providerEarningKurus,
    deliveryDays: days,
    revisionsAllowed: pkg.revisions,
    requirements: String(form.get("requirements") ?? "").slice(0, 4000) || null,
  });
  await audit(user.id, "order.created", "order", code, { total, bps });
  redirect(`/odeme/${code}`);
}

/* ───────────── Mesaj başlatma ───────────── */

export async function contactProviderAction(form: FormData) {
  const user = await requireUser(String(form.get("back") ?? "/"));
  const providerId = String(form.get("providerId"));
  if (providerId === user.id) redirect("/panel/mesajlar");
  const target = await db.query.users.findFirst({ where: eq(users.id, providerId), columns: { id: true, status: true } });
  if (!target || target.status !== "active") redirect("/panel/mesajlar");
  const conv = await findOrCreateDirectConversation(user.id, providerId);
  redirect(`/panel/mesajlar/${conv.id}`);
}

/* ───────────── Favoriler ───────────── */

export async function toggleFavoriteAction(form: FormData) {
  const user = await getCurrentUser();
  const back = String(form.get("back") ?? "/");
  if (!user) redirect(`/giris?sonra=${encodeURIComponent(back)}`);
  const targetType = z.enum(["service", "provider"]).parse(form.get("targetType"));
  const targetId = z.string().uuid().parse(form.get("targetId"));
  const where = and(eq(favorites.userId, user.id), eq(favorites.targetType, targetType), eq(favorites.targetId, targetId));
  const exists = await db.query.favorites.findFirst({ where });
  if (exists) await db.delete(favorites).where(where);
  else await db.insert(favorites).values({ userId: user.id, targetType, targetId });
  revalidatePath(back);
}

/* ───────────── Proje oluşturma ───────────── */

const projectSchema = z.object({
  title: z.string().trim().min(12, "Başlık en az 12 karakter olmalı; işi kısaca tarif edin.").max(140),
  description: z.string().trim().min(60, "Açıklama en az 60 karakter olmalı. Kapsamı, beklentilerinizi ve varsa örnekleri yazın.").max(8000),
  categoryId: z.string().uuid("Bir kategori seçin."),
  budgetMin: z.coerce.number().int().min(0).max(10_000_000).optional(),
  budgetMax: z.coerce.number().int().min(100, "Bütçe üst sınırı en az 100 ₺ olmalı.").max(10_000_000),
  deadline: z.string().optional(),
  extraInfo: z.string().max(3000).optional(),
});

export async function createProjectAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Proje oluşturmak için giriş yapın." };
  if (user.role !== "customer") return { error: "Proje oluşturmak için müşteri hesabı gerekir." };
  if (!rateLimit(`project:${user.id}`, 5, 60 * 60_000).ok) return { error: "Kısa sürede çok fazla proje oluşturdunuz." };
  const raw = Object.fromEntries(form);
  const parsed = projectSchema.safeParse({ ...raw, budgetMin: raw.budgetMin || undefined, deadline: raw.deadline || undefined, extraInfo: raw.extraInfo || undefined });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  if (d.budgetMin && d.budgetMin > d.budgetMax) return { fieldErrors: { budgetMin: ["Alt sınır üst sınırdan büyük olamaz."] } };
  const cat = await db.query.categories.findFirst({ where: eq(categories.id, d.categoryId) });
  if (!cat) return { fieldErrors: { categoryId: ["Geçersiz kategori."] } };
  const slug = `${slugify(d.title, 60)}-${Math.random().toString(36).slice(2, 6)}`;
  const [p] = await db
    .insert(projects)
    .values({
      buyerId: user.id,
      categoryId: d.categoryId,
      slug,
      title: d.title,
      description: d.description,
      budgetMinKurus: d.budgetMin ? d.budgetMin * 100 : null,
      budgetMaxKurus: d.budgetMax * 100,
      deadline: d.deadline ? new Date(d.deadline) : null,
      extraInfo: d.extraInfo,
    })
    .returning();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 5);
  try {
    const atts = [];
    for (const f of files) atts.push(await saveUpload(f, { ownerId: user.id, kind: "file", isPublic: false, scope: `project:${p!.id}` }));
    if (atts.length) await db.update(projects).set({ attachments: atts }).where(eq(projects.id, p!.id));
  } catch (e) {
    return { error: (e as Error).message };
  }
  await audit(user.id, "project.created", "project", p!.id);
  redirect(`/panel/projeler/${p!.id}?yeni=1`);
}

/* ───────────── Teklif verme ───────────── */

const offerSchema = z.object({
  projectId: z.string().uuid(),
  price: z.coerce.number().int().min(100, "Teklif en az 100 ₺ olmalı.").max(10_000_000),
  days: z.coerce.number().int().min(1, "En az 1 gün.").max(365),
  message: z.string().trim().min(80, "Teklif açıklaması en az 80 karakter olmalı. İşi nasıl yapacağınızı anlatın.").max(4000),
});

export async function submitOfferAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "provider") return { error: "Teklif vermek için uzman hesabıyla giriş yapın." };
  if (!user.emailVerifiedAt) return { error: "Teklif vermeden önce e-posta adresinizi doğrulayın." };
  const parsed = offerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  if (!rateLimit(`offer:${user.id}`, 20, 60 * 60_000).ok) return { error: "Saatlik teklif sınırına ulaştınız." };
  const p = await db.query.projects.findFirst({ where: eq(projects.id, d.projectId) });
  if (!p || p.status !== "open") return { error: "Bu proje artık teklif kabul etmiyor." };
  if (p.buyerId === user.id) return { error: "Kendi projenize teklif veremezsiniz." };
  const existing = await db.query.offers.findFirst({ where: and(eq(offers.projectId, p.id), eq(offers.providerId, user.id)) });
  if (existing) {
    if (existing.status !== "pending") return { error: "Bu proje için teklifiniz sonuçlanmış." };
    await db.update(offers).set({ priceKurus: d.price * 100, deliveryDays: d.days, message: d.message }).where(eq(offers.id, existing.id));
    revalidatePath(`/projeler/${p.slug}`);
    return { ok: "Teklifiniz güncellendi." };
  }
  await db.insert(offers).values({ projectId: p.id, providerId: user.id, priceKurus: d.price * 100, deliveryDays: d.days, message: d.message });
  await db.update(projects).set({ offerCount: sql`${projects.offerCount} + 1` }).where(eq(projects.id, p.id));
  await notify(p.buyerId, "offer_new", `“${p.title}” projenize yeni teklif`, { body: `${user.name} teklif gönderdi.`, link: `/panel/projeler/${p.id}` });
  revalidatePath(`/projeler/${p.slug}`);
  return { ok: "Teklifiniz gönderildi. Müşteri teklifinizi kabul ettiğinde bildirim alacaksınız." };
}

export async function withdrawOfferAction(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("offerId"));
  const o = await db.query.offers.findFirst({ where: and(eq(offers.id, id), eq(offers.providerId, user.id), eq(offers.status, "pending")) });
  if (o) {
    await db.update(offers).set({ status: "withdrawn" }).where(eq(offers.id, o.id));
    await db.update(projects).set({ offerCount: sql`greatest(${projects.offerCount} - 1, 0)` }).where(eq(projects.id, o.projectId));
  }
  revalidatePath("/panel/teklifler");
}

/** Müşteri teklifi kabul eder → teklif tutarıyla sipariş oluşur ve ödeme sayfasına gidilir. */
export async function acceptOfferAction(form: FormData) {
  const user = await requireUser();
  const offerId = String(form.get("offerId"));
  const o = await db.query.offers.findFirst({ where: eq(offers.id, offerId) });
  if (!o) redirect("/panel/projeler");
  const p = await db.query.projects.findFirst({ where: eq(projects.id, o.projectId) });
  if (!p || p.buyerId !== user.id || p.status !== "open" || o.status !== "pending") redirect("/panel/projeler");
  const { bps } = await resolveCommissionBps(o.providerId, p.categoryId);
  const split = splitAmount(o.priceKurus, bps);
  const code = randomCode("EK");
  await db.insert(orders).values({
    code,
    projectId: p.id,
    offerId: o.id,
    buyerId: user.id,
    providerId: o.providerId,
    title: p.title,
    subtotalKurus: o.priceKurus,
    totalKurus: o.priceKurus,
    commissionBps: bps,
    commissionKurus: split.commissionKurus,
    providerEarningKurus: split.providerEarningKurus,
    deliveryDays: o.deliveryDays,
    revisionsAllowed: 2,
    requirements: p.description.slice(0, 4000),
  });
  await audit(user.id, "offer.accept_started", "offer", o.id, { code });
  redirect(`/odeme/${code}`);
}

export async function rejectOfferAction(form: FormData) {
  const user = await requireUser();
  const o = await db.query.offers.findFirst({ where: eq(offers.id, String(form.get("offerId"))) });
  if (!o) return;
  const p = await db.query.projects.findFirst({ where: eq(projects.id, o.projectId) });
  if (!p || p.buyerId !== user.id) return;
  await db.update(offers).set({ status: "rejected" }).where(eq(offers.id, o.id));
  revalidatePath(`/panel/projeler/${p.id}`);
}

export async function closeProjectAction(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("projectId"));
  await db.update(projects).set({ status: "cancelled", updatedAt: new Date() }).where(and(eq(projects.id, id), eq(projects.buyerId, user.id), eq(projects.status, "open")));
  revalidatePath(`/panel/projeler/${id}`);
}

/* ───────────── Değerlendirme ───────────── */

const reviewSchema = z.object({
  orderId: z.string().uuid(),
  quality: z.coerce.number().int().min(1).max(5),
  communication: z.coerce.number().int().min(1).max(5),
  delivery: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(20, "Yorum en az 20 karakter olmalı.").max(2000),
});

export async function submitReviewAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Oturum bulunamadı." };
  const parsed = reviewSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;
  const o = await db.query.orders.findFirst({ where: eq(orders.id, d.orderId) });
  // Yalnızca tamamlanmış, kendi siparişi için ve bir kez
  if (!o || o.buyerId !== user.id || o.status !== "completed") return { error: "Yalnızca tamamlanan siparişler değerlendirilebilir." };
  if (await db.query.reviews.findFirst({ where: eq(reviews.orderId, o.id) })) return { error: "Bu siparişi zaten değerlendirdiniz." };
  const rating = Math.round((d.quality + d.communication + d.delivery) / 3);
  await db.insert(reviews).values({ orderId: o.id, serviceId: o.serviceId, providerId: o.providerId, buyerId: user.id, rating, quality: d.quality, communication: d.communication, delivery: d.delivery, comment: d.comment });
  // Puan ortalamalarını gerçek kayıtlardan yeniden hesapla
  await db.execute(sql`update provider_profiles set rating_avg = coalesce((select round(avg(rating) * 100) from reviews where provider_id = ${o.providerId} and not is_hidden), 0), rating_count = (select count(*) from reviews where provider_id = ${o.providerId} and not is_hidden) where user_id = ${o.providerId}`);
  if (o.serviceId)
    await db.execute(sql`update services set rating_avg = coalesce((select round(avg(rating) * 100) from reviews where service_id = ${o.serviceId} and not is_hidden), 0), rating_count = (select count(*) from reviews where service_id = ${o.serviceId} and not is_hidden) where id = ${o.serviceId}`);
  await notify(o.providerId, "review_new", `${o.code} için yeni değerlendirme: ${rating}/5`, { body: d.comment.slice(0, 200), link: "/panel/degerlendirmeler" });
  revalidatePath(`/panel/siparisler/${o.code}`);
  return { ok: "Değerlendirmeniz için teşekkürler." };
}

export async function replyReviewAction(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("reviewId"));
  const reply = String(form.get("reply") ?? "").trim().slice(0, 1000);
  if (reply) await db.update(reviews).set({ providerReply: reply }).where(and(eq(reviews.id, id), eq(reviews.providerId, user.id)));
  revalidatePath("/panel/degerlendirmeler");
}

/* ───────────── Şikâyet ───────────── */

export async function reportAction(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Şikâyet için giriş yapın." };
  if (!rateLimit(`report:${user.id}`, 10, 60 * 60_000).ok) return { error: "Çok fazla şikâyet gönderdiniz." };
  const targetType = z.enum(["user", "service", "message", "order", "project"]).safeParse(form.get("targetType"));
  const reason = String(form.get("reason") ?? "").trim();
  if (!targetType.success || reason.length < 3) return { error: "Şikâyet nedenini seçin." };
  await db.insert(tickets).values({ type: "complaint", openedById: user.id, targetType: targetType.data, targetId: String(form.get("targetId")).slice(0, 80), reason: reason.slice(0, 200), details: String(form.get("details") ?? "").slice(0, 2000) });
  return { ok: "Şikâyetiniz alındı. Ekibimiz inceleyecek." };
}
