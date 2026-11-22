import Link from "next/link";
import type { Metadata } from "next";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages } from "@/db/schema";
import { getCategoryTree, listProviders, listServices, openProjects } from "@/server/queries";
import { ServiceGrid, ProviderRow } from "@/components/cards";
import { ServiceFilters, SortSelect, Pagination, MobileFilters, filtersFromSP, activeFilterCount, one, type SP } from "@/components/listing";
import { SearchBox } from "@/components/site/header-search";
import { EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { formatNumber, cn } from "@/lib/utils";
import { ProjectList } from "@/components/project-list";
import { CitySelect } from "@/components/city-select";
import { matchLandings, splitCityQuery } from "@/lib/search-city";
import { locative, lowerFirst } from "@/lib/tr-grammar";

export const metadata: Metadata = { title: "Arama", robots: { index: false, follow: true } };

const TABS = [
  ["hizmetler", "Hizmetler"],
  ["uzmanlar", "Uzmanlar"],
  ["ajanslar", "Ajanslar"],
  ["projeler", "Projeler"],
] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim() ?? "";
  const tab = (one(sp.tur) ?? "hizmetler") as (typeof TABS)[number][0];
  const tree = await getCategoryTree();
  const flat = tree.flatMap((c) => [c, ...c.children]);
  const catSlug = one(sp.kategori);
  const cat = catSlug ? flat.find((c) => c.slug === catSlug) : undefined;
  const catIds = cat ? [cat.id, ...flat.filter((c) => c.parentId === cat.id).map((c) => c.id)] : undefined;

  // "izmir web sitesi": il adı ayrılır, kalan metinle aranır, o ildeki uzmanlar öne alınır
  const { city: qCity, rest } = splitCityQuery(q);
  const textQ = qCity ? rest : q;
  const [matchedCats, cityLandings] = await Promise.all([
    textQ
      ? db.select({ name: categories.name, slug: categories.slug }).from(categories).where(and(eq(categories.isActive, true), sql`search_norm(${categories.name}) ilike '%' || search_norm(${textQ}) || '%'`)).limit(6)
      : Promise.resolve([] as { name: string; slug: string }[]),
    qCity ? db.select({ h1: landingPages.h1, slug: landingPages.slug }).from(landingPages).where(eq(landingPages.isPublished, true)).then((all) => matchLandings(rest, all)) : Promise.resolve([] as { h1: string; slug: string }[]),
  ]);

  const f = filtersFromSP(sp);
  const page = f.page;
  const services = tab === "hizmetler" ? await listServices({ ...f, q: textQ || undefined, preferCity: qCity && !f.city ? qCity.name : undefined, categoryIds: catIds }) : null;
  const providers = tab === "uzmanlar" || tab === "ajanslar" ? await listProviders({ q: textQ, categoryId: cat?.id, accountType: tab === "ajanslar" ? "agency" : undefined, city: f.city, page }) : null;
  const projects = tab === "projeler" ? await openProjects(20, { q: textQ, categoryIds: catIds, page }) : null;
  const total = services?.total ?? providers?.total ?? projects?.total ?? 0;

  const tabHref = (t: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (catSlug) p.set("kategori", catSlug);
    if (t !== "hizmetler") p.set("tur", t);
    return `/ara?${p}`;
  };

  return (
    <div className="container-x pt-8">
      <div className="max-w-2xl">
        <SearchBox defaultValue={q} placeholder="Hizmet, uzman veya proje ara" />
      </div>
      <h1 className="mt-8 text-[28px] font-semibold sm:text-[34px]">{q ? <>“{q}” için sonuçlar</> : "Tüm hizmetler"}</h1>
      {qCity && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[13.5px]">
          <span className="text-muted">{qCity.name} için:</span>
          {cityLandings.map((l) => (
            <Link key={l.slug} href={`/${l.slug}/${qCity.slug}`} className="rounded-sm border border-ink/20 bg-surface px-2.5 py-1 font-medium hover:border-ink/50">{qCity.name} {lowerFirst(l.h1)}</Link>
          ))}
          <Link href={`/il/${qCity.slug}`} className="rounded-sm border border-line bg-surface px-2.5 py-1 hover:border-ink/40">{locative(qCity.name)} tüm dijital hizmetler</Link>
          {tab === "hizmetler" && !f.city && <span className="text-muted">· {locative(qCity.name)}ki uzmanların hizmetleri önce gösteriliyor</span>}
        </div>
      )}
      {matchedCats.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[13.5px]">
          <span className="text-muted">Kategoriler:</span>
          {matchedCats.map((c) => (
            <Link key={c.slug} href={`/kategori/${c.slug}`} className="rounded-sm border border-line bg-surface px-2.5 py-1 hover:border-ink/40">{c.name}</Link>
          ))}
        </div>
      )}
      <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-line text-[14.5px]" aria-label="Sonuç türü">
        {TABS.map(([k, l]) => (
          <Link key={k} href={tabHref(k)} className={cn("-mb-px whitespace-nowrap border-b-2 pb-3", tab === k ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink")}>{l}</Link>
        ))}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          {tab === "hizmetler" ? (
            <ServiceFilters sp={sp} action="/ara" categories={tree.map((c) => ({ slug: c.slug, name: c.name }))} />
          ) : (
            <form action="/ara" className="space-y-4 text-[14px]">
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="tur" value={tab} />
              <label className="block font-medium">Kategori
                <select name="kategori" defaultValue={catSlug ?? ""} className="field mt-2 !py-2 text-[14px]">
                  <option value="">Tümü</option>
                  {tree.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </label>
              {tab !== "projeler" && (
                <label className="block font-medium">Konum
                  <CitySelect name="sehir" defaultValue={one(sp.sehir)} placeholder="Tüm iller" className="field mt-2 !py-2 text-[14px]" />
                </label>
              )}
              <button className="h-9 w-full rounded-md bg-ink text-white">Uygula</button>
            </form>
          )}
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-[14px] text-muted">{formatNumber(total)} sonuç</p>
            {tab === "hizmetler" && <SortSelect sp={sp} action="/ara" />}
          </div>
          {tab === "hizmetler" && (
            <div className="mb-6">
              <MobileFilters count={activeFilterCount(sp)}>
                <ServiceFilters sp={sp} action="/ara" categories={tree.map((c) => ({ slug: c.slug, name: c.name }))} />
              </MobileFilters>
            </div>
          )}
          {total === 0 ? (
            <EmptyState
              title="Aradığınızı bulamadık"
              body={<>Farklı bir kelime deneyin ya da ihtiyacınızı anlatan bir proje oluşturun; ilgili uzmanlar size teklif göndersin.</>}
              action={<ButtonLink href="/proje-olustur" variant="accent">Proje oluştur</ButtonLink>}
            />
          ) : services ? (
            <>
            <h2 className="sr-only">Hizmetler</h2>
            <ServiceGrid items={services.items} cols={3} />
            </>
          ) : providers ? (
            <div className="divide-y divide-line border-y border-line">{providers.items.map((p) => <ProviderRow key={p.slug} p={p} />)}</div>
          ) : projects ? (
            <ProjectList items={projects.items} />
          ) : null}
          <Pagination page={page} pages={services?.pages ?? providers?.pages ?? projects?.pages ?? 1} base="/ara" sp={sp} />
        </div>
      </div>
    </div>
  );
}

