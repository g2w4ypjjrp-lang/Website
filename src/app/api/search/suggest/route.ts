import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages, providerProfiles, services, users } from "@/db/schema";
import { rateLimitLocal } from "@/server/rate-limit";
import { matchLandings, splitCityQuery } from "@/lib/search-city";
import { lowerFirst } from "@/lib/tr-grammar";
import { ipFromHeaders } from "@/server/request";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });
  const ip = ipFromHeaders(req.headers);
  if (!rateLimitLocal(`suggest:${ip}`, 60, 60_000).ok) return NextResponse.json({ items: [] }, { status: 429 });
  // İl adı ayrılır: "izmir web sitesi" için hizmet/kategori araması "web sitesi" ile yapılır
  const { city, rest } = splitCityQuery(q);
  const textQ = city && rest.length >= 2 ? rest : q;
  const like = sql`'%' || search_norm(${textQ}) || '%'`;
  const [cats, lands, svcs, provs] = await Promise.all([
    db.select({ name: categories.name, slug: categories.slug }).from(categories).where(and(eq(categories.isActive, true), sql`search_norm(${categories.name}) ilike ${like}`)).limit(4),
    db.select({ h1: landingPages.h1, slug: landingPages.slug }).from(landingPages).where(and(eq(landingPages.isPublished, true), sql`search_norm(${landingPages.h1}) ilike ${like}`)).limit(2),
    db
      .select({ title: services.title, slug: services.slug })
      .from(services)
      .where(and(eq(services.status, "active"), sql`search_norm(${services.title} || ' ' || arr_text(${services.tags})) ilike ${like}`))
      .orderBy(sql`${services.orderCount} desc`)
      .limit(4),
    db
      .select({ name: providerProfiles.displayName, slug: providerProfiles.slug })
      .from(providerProfiles)
      .innerJoin(users, eq(users.id, providerProfiles.userId))
      .where(and(eq(users.status, "active"), sql`search_norm(${providerProfiles.displayName} || ' ' || arr_text(${providerProfiles.skills})) ilike ${like}`))
      .limit(3),
  ]);
  // İl algılama: "ankara logo", "izmir'de web sitesi" gibi aramalarda il sayfalarını öner
  const cityItems: { type: string; label: string; href: string }[] = [];
  if (city) {
    const allLandings = await db.select({ h1: landingPages.h1, slug: landingPages.slug }).from(landingPages).where(eq(landingPages.isPublished, true));
    for (const l of matchLandings(rest, allLandings)) cityItems.push({ type: "city", label: `${city.name} ${lowerFirst(l.h1)}`, href: `/${l.slug}/${city.slug}` });
    cityItems.push({ type: "city", label: `${city.name} dijital hizmetler`, href: `/il/${city.slug}` });
  }
  const items = [
    ...cityItems,
    ...lands.map((l) => ({ type: "landing", label: l.h1, href: `/${l.slug}` })),
    ...cats.map((c) => ({ type: "category", label: c.name, href: `/kategori/${c.slug}` })),
    ...svcs.map((s) => ({ type: "service", label: s.title, href: `/hizmet/${s.slug}` })),
    ...provs.map((p) => ({ type: "provider", label: p.name, href: `/uzman/${p.slug}` })),
  ].slice(0, 10);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=60" } });
}
