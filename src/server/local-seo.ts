import "server-only";
import { cache } from "react";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages, projects, providerProfiles, services, users } from "@/db/schema";
import { CITIES, citySlugFromName, getCity, type City } from "@/lib/tr-cities";
import { getLocalSeoSettings, type LocalSeoSettings } from "./settings";

/** Kategori ve alt kategorilerinin kimlikleri */
export const categoryFamily = cache(async (categoryId: string | null) => {
  if (!categoryId) return [] as string[];
  const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, categoryId));
  return [categoryId, ...children.map((c) => c.id)];
});

/**
 * İl bazında aktif uzman sayıları. categoryId verilirse yalnızca o kategoride (veya alt kategorilerinde)
 * yayında hizmeti olan uzmanlar sayılır. Uzman profillerindeki il adı slug'a normalize edilir.
 */
export const providerCountsByCity = cache(async (categoryId: string | null): Promise<Map<string, number>> => {
  const fam = await categoryFamily(categoryId);
  const rows = await db
    .select({ city: providerProfiles.city, n: sql<number>`count(*)::int` })
    .from(providerProfiles)
    .innerJoin(users, eq(users.id, providerProfiles.userId))
    .where(
      and(
        eq(users.status, "active"),
        sql`${providerProfiles.city} is not null`,
        fam.length
          ? sql`exists (select 1 from ${services} s where s.provider_id = ${providerProfiles.userId} and s.status = 'active' and s.category_id in ${fam})`
          : sql`exists (select 1 from ${services} s where s.provider_id = ${providerProfiles.userId} and s.status = 'active')`,
      ),
    )
    .groupBy(providerProfiles.city);
  const m = new Map<string, number>();
  for (const r of rows) {
    const slug = citySlugFromName(r.city);
    if (slug) m.set(slug, (m.get(slug) ?? 0) + r.n);
  }
  return m;
});

export const openProjectCountsByCity = cache(async () => {
  const rows = await db.select({ city: projects.city, n: sql<number>`count(*)::int` }).from(projects).where(and(eq(projects.status, "open"), sql`${projects.city} is not null`)).groupBy(projects.city);
  return new Map(rows.map((r) => [r.city!, r.n]));
});

export const localSeoSettings = cache(getLocalSeoSettings);

/** Hizmet × il sayfası indekslenebilir mi (kapı sayfası / ince içerik riskine karşı kalite kapısı). */
export function serviceCityIndexable(s: LocalSeoSettings, citySlug: string, localProviders: number) {
  return s.indexAll || s.priority.includes(citySlug) || localProviders >= Math.max(1, s.minProviders);
}

export function hubIndexable(s: LocalSeoSettings, citySlug: string, totalLocalProviders: number) {
  return s.indexAllHubs || s.priority.includes(citySlug) || totalLocalProviders >= Math.max(1, s.minProviders);
}

/** Yayındaki açılış sayfaları (il sayfaları bu hizmetler için üretilir) */
export const publishedLandings = cache(async () =>
  db
    .select({ slug: landingPages.slug, h1: landingPages.h1, categoryId: landingPages.categoryId, updatedAt: landingPages.updatedAt })
    .from(landingPages)
    .where(and(eq(landingPages.isPublished, true), eq(landingPages.noindex, false)))
    .orderBy(landingPages.createdAt),
);

/** Sitemap için: indekslenebilir il merkezleri ve hizmet × il sayfaları */
export async function indexableLocalPaths() {
  const [s, landings, totals] = await Promise.all([getLocalSeoSettings(), publishedLandings(), providerCountsByCity(null)]);
  const hubs = CITIES.filter((c) => hubIndexable(s, c.slug, totals.get(c.slug) ?? 0)).map((c) => `/il/${c.slug}`);
  const pairs: string[] = [];
  for (const l of landings) {
    const counts = await providerCountsByCity(l.categoryId);
    for (const c of CITIES) if (serviceCityIndexable(s, c.slug, counts.get(c.slug) ?? 0)) pairs.push(`/${l.slug}/${c.slug}`);
  }
  return { hubs, pairs };
}

export function sameRegion(city: City) {
  return CITIES.filter((x) => x.region === city.region && x.slug !== city.slug);
}

export { getCity, inArray };
