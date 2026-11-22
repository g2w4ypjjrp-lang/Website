import type { MetadataRoute } from "next";
import { and, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, categories, landingPages, providerProfiles, services, staticPages, users } from "@/db/schema";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;
const PER = 5000;

/**
 * Sitemap index (/sitemap.xml) → /haritalar/sitemap/0.xml (sabit + kategori + açılış + blog), /sitemap/1.xml… (hizmetler), uzmanlar ayrı.
 * Yalnızca indekslenebilir, yayında ve içeriği olan sayfalar listelenir.
 */
export async function generateSitemaps() {
  const [{ s }] = await db.select({ s: sql<number>`count(*)::int` }).from(services).where(and(eq(services.status, "active"), eq(services.noindex, false)));
  const servicePages = Math.max(1, Math.ceil(s / PER));
  return [{ id: 0 }, ...Array.from({ length: servicePages }, (_, i) => ({ id: i + 1 })), { id: 1000 }];
}

export default async function sitemap({ id }: { id: Promise<string> | number | string }): Promise<MetadataRoute.Sitemap> {
  const n = Number(await id);
  if (n === 0) {
    const [cats, lands, posts, pages] = await Promise.all([
      db.select({ slug: categories.slug, u: categories.updatedAt }).from(categories).where(and(eq(categories.isActive, true), eq(categories.noindex, false))),
      db.select({ slug: landingPages.slug, u: landingPages.updatedAt }).from(landingPages).where(and(eq(landingPages.isPublished, true), eq(landingPages.noindex, false))),
      db.select({ slug: blogPosts.slug, u: blogPosts.updatedAt }).from(blogPosts).where(and(eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, new Date()), eq(blogPosts.noindex, false))),
      db.select({ slug: staticPages.slug, u: staticPages.updatedAt }).from(staticPages).where(eq(staticPages.noindex, false)),
    ]);
    return [
      { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
      ...["/kategoriler", "/uzmanlar", "/projeler", "/blog", "/nasil-calisir", "/uzman-ol", "/proje-olustur"].map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const, priority: 0.6 })),
      ...lands.map((l) => ({ url: absoluteUrl(`/${l.slug}`), lastModified: l.u, changeFrequency: "weekly" as const, priority: 0.9 })),
      ...cats.map((c) => ({ url: absoluteUrl(`/kategori/${c.slug}`), lastModified: c.u, changeFrequency: "daily" as const, priority: 0.8 })),
      ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.u, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...pages.map((p) => ({ url: absoluteUrl(`/sayfa/${p.slug}`), lastModified: p.u, changeFrequency: "yearly" as const, priority: 0.2 })),
    ];
  }
  if (n === 1000) {
    const rows = await db
      .select({ slug: providerProfiles.slug, u: providerProfiles.updatedAt })
      .from(providerProfiles)
      .innerJoin(users, eq(users.id, providerProfiles.userId))
      .where(and(eq(users.status, "active"), eq(providerProfiles.noindex, false), sql`exists (select 1 from services s where s.provider_id = ${providerProfiles.userId} and s.status = 'active')`));
    return rows.map((r) => ({ url: absoluteUrl(`/uzman/${r.slug}`), lastModified: r.u, changeFrequency: "weekly", priority: 0.5 }));
  }
  const rows = await db
    .select({ slug: services.slug, u: services.updatedAt })
    .from(services)
    .where(and(eq(services.status, "active"), eq(services.noindex, false)))
    .orderBy(services.createdAt)
    .limit(PER)
    .offset((n - 1) * PER);
  return rows.map((r) => ({ url: absoluteUrl(`/hizmet/${r.slug}`), lastModified: r.u, changeFrequency: "weekly", priority: 0.7 }));
}
