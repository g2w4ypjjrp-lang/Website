import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, providerProfiles, reviews, services, servicePackages, users, blogPosts, projects } from "@/db/schema";

export type Category = typeof categories.$inferSelect;

/** Tüm aktif kategoriler, ağaç olarak. Menü, footer ve sitemap tarafından paylaşılır. */
export const getCategoryTree = cache(async () => {
  const rows = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.name));
  const roots = rows.filter((c) => !c.parentId);
  return roots.map((r) => ({ ...r, children: rows.filter((c) => c.parentId === r.id) }));
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const cat = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), eq(categories.isActive, true)) });
  if (!cat) return null;
  const [parent, children] = await Promise.all([
    cat.parentId ? db.query.categories.findFirst({ where: eq(categories.id, cat.parentId) }) : null,
    db.select().from(categories).where(and(eq(categories.parentId, cat.id), eq(categories.isActive, true))).orderBy(asc(categories.sortOrder)),
  ]);
  return { ...cat, parent: parent ?? null, children };
});

export const serviceCardSelect = {
  id: services.id,
  slug: services.slug,
  title: services.title,
  coverId: services.coverId,
  startingPriceKurus: services.startingPriceKurus,
  minDeliveryDays: services.minDeliveryDays,
  ratingAvg: services.ratingAvg,
  ratingCount: services.ratingCount,
  orderCount: services.orderCount,
  sponsored: services.sponsored,
  featuredUntil: services.featuredUntil,
  createdAt: services.createdAt,
  categoryName: categories.name,
  categorySlug: categories.slug,
  rootSlug: sql<string>`coalesce((select pc.slug from categories pc where pc.id = ${categories.parentId}), ${categories.slug})`,
  providerName: providerProfiles.displayName,
  providerSlug: providerProfiles.slug,
  providerLevel: providerProfiles.level,
  providerVerified: providerProfiles.verifiedAt,
  providerAvatarId: users.avatarId,
  providerLastSeen: users.lastSeenAt,
};
export type ServiceCardData = Awaited<ReturnType<typeof cardQuery>>[number];

const activeService = and(eq(services.status, "active"), eq(users.status, "active"));

function cardQuery() {
  return db
    .select(serviceCardSelect)
    .from(services)
    .innerJoin(categories, eq(categories.id, services.categoryId))
    .innerJoin(users, eq(users.id, services.providerId))
    .innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId));
}

export type ServiceFilters = {
  q?: string;
  categoryIds?: string[];
  minPrice?: number; // TL
  maxPrice?: number;
  maxDays?: number;
  minRating?: number;
  level?: string;
  online?: boolean;
  city?: string;
  tier?: "basic" | "standard" | "premium";
  sort?: "relevance" | "popular" | "bestselling" | "rating" | "price_asc" | "price_desc" | "newest";
  page?: number;
  perPage?: number;
};

export function searchNormSql(q: string) {
  return sql`search_norm(${q})`;
}

export async function listServices(f: ServiceFilters) {
  const perPage = f.perPage ?? 24;
  const page = Math.max(1, f.page ?? 1);
  const where: (SQL | undefined)[] = [activeService];
  const q = f.q?.trim();
  const doc = sql`search_norm(${services.title} || ' ' || ${services.summary} || ' ' || arr_text(${services.tags}))`;
  if (q) where.push(or(sql`${doc} ilike '%' || search_norm(${q}) || '%'`, sql`word_similarity(search_norm(${q}), ${doc}) > 0.45`));
  if (f.categoryIds?.length) where.push(inArray(services.categoryId, f.categoryIds));
  if (f.minPrice != null) where.push(gte(services.startingPriceKurus, f.minPrice * 100));
  if (f.maxPrice != null) where.push(lte(services.startingPriceKurus, f.maxPrice * 100));
  if (f.maxDays != null) where.push(lte(services.minDeliveryDays, f.maxDays));
  if (f.minRating != null) where.push(gte(services.ratingAvg, f.minRating * 100));
  if (f.level) where.push(sql`${providerProfiles.level} = ${f.level}`);
  if (f.online) where.push(gte(users.lastSeenAt, new Date(Date.now() - 10 * 60_000)));
  if (f.city) where.push(sql`search_norm(${providerProfiles.city}) = search_norm(${f.city})`);
  if (f.tier) where.push(sql`exists (select 1 from ${servicePackages} sp where sp.service_id = ${services.id} and sp.tier = ${f.tier})`);

  const featuredFirst = sql`(case when ${services.featuredUntil} > now() then 0 else 1 end)`;
  const order: SQL[] = (() => {
    switch (f.sort) {
      case "popular":
        return [desc(services.viewCount)];
      case "bestselling":
        return [desc(services.orderCount)];
      case "rating":
        return [desc(services.ratingAvg), desc(services.ratingCount)];
      case "price_asc":
        return [asc(services.startingPriceKurus)];
      case "price_desc":
        return [desc(services.startingPriceKurus)];
      case "newest":
        return [desc(services.publishedAt)];
      default:
        return q
          ? [featuredFirst, sql`word_similarity(search_norm(${q}), ${doc}) desc`, desc(services.orderCount)]
          : [featuredFirst, desc(services.orderCount), desc(services.ratingAvg), desc(services.publishedAt)];
    }
  })();

  const cond = and(...where);
  const [items, [{ total }]] = await Promise.all([
    cardQuery().where(cond).orderBy(...order).limit(perPage).offset((page - 1) * perPage),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(services)
      .innerJoin(users, eq(users.id, services.providerId))
      .innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId))
      .where(cond) as Promise<{ total: number }[]>,
  ]);
  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function homeServiceRails() {
  const [bestselling, newest, featured] = await Promise.all([
    cardQuery().where(and(activeService, sql`${services.orderCount} > 0`)).orderBy(desc(services.orderCount)).limit(8),
    cardQuery().where(activeService).orderBy(desc(services.publishedAt)).limit(8),
    cardQuery().where(and(activeService, sql`${services.featuredUntil} > now()`)).orderBy(desc(services.featuredUntil)).limit(4),
  ]);
  return { bestselling, newest, featured };
}

export const providerCardSelect = {
  userId: providerProfiles.userId,
  slug: providerProfiles.slug,
  displayName: providerProfiles.displayName,
  headline: providerProfiles.headline,
  city: providerProfiles.city,
  level: providerProfiles.level,
  verifiedAt: providerProfiles.verifiedAt,
  ratingAvg: providerProfiles.ratingAvg,
  ratingCount: providerProfiles.ratingCount,
  completedOrders: providerProfiles.completedOrders,
  skills: providerProfiles.skills,
  avatarId: users.avatarId,
  lastSeenAt: users.lastSeenAt,
  accountType: users.accountType,
  createdAt: users.createdAt,
};

export async function listProviders(opts: { q?: string; categoryId?: string; verifiedOnly?: boolean; accountType?: "individual" | "agency" | "company"; city?: string; sort?: string; limit?: number; page?: number }) {
  const where: (SQL | undefined)[] = [eq(users.status, "active"), eq(users.role, "provider"), eq(providerProfiles.noindex, false)];
  if (opts.q) {
    const doc = sql`search_norm(${providerProfiles.displayName} || ' ' || ${providerProfiles.headline} || ' ' || arr_text(${providerProfiles.skills}))`;
    where.push(or(sql`${doc} ilike '%' || search_norm(${opts.q}) || '%'`, sql`word_similarity(search_norm(${opts.q}), ${doc}) > 0.45`));
  }
  if (opts.verifiedOnly) where.push(sql`${providerProfiles.verifiedAt} is not null`);
  if (opts.accountType) where.push(eq(users.accountType, opts.accountType));
  if (opts.city) where.push(sql`search_norm(${providerProfiles.city}) = search_norm(${opts.city})`);
  if (opts.categoryId)
    where.push(sql`exists (select 1 from ${services} s join ${categories} c on c.id = s.category_id where s.provider_id = ${providerProfiles.userId} and s.status = 'active' and (c.id = ${opts.categoryId} or c.parent_id = ${opts.categoryId}))`);
  const limit = opts.limit ?? 24;
  const page = Math.max(1, opts.page ?? 1);
  const order =
    opts.sort === "newest"
      ? [desc(users.createdAt)]
      : opts.sort === "rating"
        ? [desc(providerProfiles.ratingAvg), desc(providerProfiles.ratingCount)]
        : [sql`(${providerProfiles.verifiedAt} is null)`, desc(providerProfiles.completedOrders), desc(providerProfiles.ratingAvg), desc(users.createdAt)];
  const cond = and(...where);
  const [items, [{ total }]] = await Promise.all([
    db
      .select(providerCardSelect)
      .from(providerProfiles)
      .innerJoin(users, eq(users.id, providerProfiles.userId))
      .where(cond)
      .orderBy(...order)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: sql<number>`count(*)::int` }).from(providerProfiles).innerJoin(users, eq(users.id, providerProfiles.userId)).where(cond) as Promise<{ total: number }[]>,
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getServiceBySlug(slug: string) {
  const rows = await db
    .select({ s: services, c: categories, p: providerProfiles, u: { id: users.id, avatarId: users.avatarId, lastSeenAt: users.lastSeenAt, createdAt: users.createdAt, status: users.status, accountType: users.accountType } })
    .from(services)
    .innerJoin(categories, eq(categories.id, services.categoryId))
    .innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId))
    .innerJoin(users, eq(users.id, services.providerId))
    .where(eq(services.slug, slug))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  const [packages, parent] = await Promise.all([
    db.select().from(servicePackages).where(eq(servicePackages.serviceId, r.s.id)),
    r.c.parentId ? db.query.categories.findFirst({ where: eq(categories.id, r.c.parentId) }) : null,
  ]);
  const order = { basic: 0, standard: 1, premium: 2 };
  packages.sort((a, b) => order[a.tier] - order[b.tier]);
  return { ...r, packages, parent: parent ?? null };
}

export async function getReviews(where: { providerId?: string; serviceId?: string }, limit = 10) {
  const conds = [eq(reviews.isHidden, false)];
  if (where.providerId) conds.push(eq(reviews.providerId, where.providerId));
  if (where.serviceId) conds.push(eq(reviews.serviceId, where.serviceId));
  return db
    .select({ r: reviews, buyerName: users.name, buyerAvatar: users.avatarId, serviceTitle: services.title })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.buyerId))
    .leftJoin(services, eq(services.id, reviews.serviceId))
    .where(and(...conds))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

/** Ana sayfa için yalnızca gerçek, yazılı ve 4+ puanlı değerlendirmeler. Yoksa bölüm hiç gösterilmez. */
export async function homeReviews() {
  return db
    .select({ r: reviews, buyerName: users.name, providerName: providerProfiles.displayName, providerSlug: providerProfiles.slug })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.buyerId))
    .innerJoin(providerProfiles, eq(providerProfiles.userId, reviews.providerId))
    .where(and(eq(reviews.isHidden, false), gte(reviews.rating, 4), sql`length(${reviews.comment}) > 60`))
    .orderBy(desc(reviews.createdAt))
    .limit(3);
}

export async function latestPosts(limit = 3, excludeId?: string) {
  return db
    .select({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title, excerpt: blogPosts.excerpt, category: blogPosts.category, publishedAt: blogPosts.publishedAt, readingMinutes: blogPosts.readingMinutes, coverId: blogPosts.coverId })
    .from(blogPosts)
    .where(and(eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, new Date()), excludeId ? sql`${blogPosts.id} <> ${excludeId}` : undefined))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function openProjects(limit = 20, opts: { categoryIds?: string[]; q?: string; minBudget?: number; page?: number } = {}) {
  const where: (SQL | undefined)[] = [eq(projects.status, "open")];
  if (opts.categoryIds?.length) where.push(inArray(projects.categoryId, opts.categoryIds));
  if (opts.q) where.push(sql`search_norm(${projects.title} || ' ' || ${projects.description}) ilike '%' || search_norm(${opts.q}) || '%'`);
  if (opts.minBudget) where.push(gte(projects.budgetMaxKurus, opts.minBudget * 100));
  const page = Math.max(1, opts.page ?? 1);
  const cond = and(...where);
  const [items, [{ total }]] = await Promise.all([
    db
      .select({ p: projects, categoryName: categories.name, categorySlug: categories.slug, buyerName: users.name })
      .from(projects)
      .innerJoin(categories, eq(categories.id, projects.categoryId))
      .innerJoin(users, eq(users.id, projects.buyerId))
      .where(cond)
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: sql<number>`count(*)::int` }).from(projects).where(cond) as Promise<{ total: number }[]>,
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function isOnline(lastSeen: Date | null | undefined) {
  return !!lastSeen && Date.now() - new Date(lastSeen).getTime() < 10 * 60_000;
}

export { isNull };
