import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages, providerProfiles, services, users } from "@/db/schema";
import { rateLimit } from "@/server/rate-limit";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`suggest:${ip}`, 60, 60_000).ok) return NextResponse.json({ items: [] }, { status: 429 });
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
  const items = [
    ...lands.map((l) => ({ type: "landing", label: l.h1, href: `/${l.slug}` })),
    ...cats.map((c) => ({ type: "category", label: c.name, href: `/kategori/${c.slug}` })),
    ...svcs.map((s) => ({ type: "service", label: s.title, href: `/hizmet/${s.slug}` })),
    ...provs.map((p) => ({ type: "provider", label: p.name, href: `/uzman/${p.slug}` })),
  ].slice(0, 9);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=60" } });
}
