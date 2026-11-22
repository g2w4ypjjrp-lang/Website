import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages, providerProfiles, services, users } from "@/db/schema";
import { rateLimitLocal } from "@/server/rate-limit";
import { citySlugFromName, getCity } from "@/lib/tr-cities";
import { lowerFirst } from "@/lib/tr-grammar";

const norm = (t: string) => t.replace(/[İI]/g, (m) => (m === "İ" ? "i" : "ı")).toLocaleLowerCase("tr-TR").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u");

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimitLocal(`suggest:${ip}`, 60, 60_000).ok) return NextResponse.json({ items: [] }, { status: 429 });
  const like = sql`'%' || search_norm(${q}) || '%'`;
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
  // İl algılama: "ankara logo", "izmir web sitesi" gibi aramalarda il sayfalarını öner
  const words = q.split(/\s+/).filter(Boolean);
  const cityWord = words.find((w) => citySlugFromName(w.replace(/['’].*$/, "")));
  const city = cityWord ? getCity(citySlugFromName(cityWord.replace(/['’].*$/, ""))) : null;
  const cityItems: { type: string; label: string; href: string }[] = [];
  if (city) {
    const rest = norm(words.filter((w) => w !== cityWord).join(" "));
    const allLandings = await db.select({ h1: landingPages.h1, slug: landingPages.slug }).from(landingPages).where(eq(landingPages.isPublished, true));
    const matched = rest ? allLandings.filter((l) => norm(l.h1).includes(rest) || norm(l.slug.replace(/-/g, " ")).includes(rest) || rest.split(" ").some((r) => r.length > 2 && norm(l.h1).includes(r))) : [];
    for (const l of matched.slice(0, 3)) cityItems.push({ type: "city", label: `${city.name} ${lowerFirst(l.h1)}`, href: `/${l.slug}/${city.slug}` });
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
