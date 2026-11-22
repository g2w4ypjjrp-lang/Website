import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, projects, providerProfiles, users } from "@/db/schema";
import { listProviders } from "@/server/queries";
import { hubIndexable, localSeoSettings, providerCountsByCity, publishedLandings, sameRegion } from "@/server/local-seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryGlyph, ProviderRow } from "@/components/cards";
import { ProjectList } from "@/components/project-list";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { IconArrowUpRight } from "@/components/icons";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { REGIONS, SECTORS, citySlugFromName, getCity, type Sector } from "@/lib/tr-cities";
import { genitive, locative, lowerFirst } from "@/lib/tr-grammar";

export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ il: string }> };

/** İlin sektör yapısına göre dijitalde öne çıkan ihtiyaçlar */
const SECTOR_NEEDS: Record<Sector, string> = {
  turizm: "Çok dilli web siteleri, doğrudan rezervasyon, QR menü ve yabancı pazarlara reklam en çok talep gören işler.",
  sanayi: "İngilizce kurumsal site ve ürün kataloğu, e-ihracat, ERP/CRM entegrasyonu ve LinkedIn iletişimi öne çıkıyor.",
  tarim: "Üreticiden doğrudan satış için e-ticaret, ambalaj ve logo tasarımı, kooperatif yazılımları öne çıkıyor.",
  ticaret: "Yerel SEO, Google İşletme Profili, kampanya odaklı sosyal medya ve sadakat uygulamaları öne çıkıyor.",
  universite: "Genç kitleye yönelik sosyal medya, mobil uyumlu siteler, girişimler için MVP ve uygulama geliştirme öne çıkıyor.",
  saglik: "Randevu sistemleri, güven veren çok dilli siteler ve KVKK uyumlu hasta yazılımları öne çıkıyor.",
};

async function load(slug: string) {
  const city = getCity(slug);
  if (!city) return null;
  const [s, totals] = await Promise.all([localSeoSettings(), providerCountsByCity(null)]);
  const local = totals.get(city.slug) ?? 0;
  return { city, s, totals, local, indexable: hubIndexable(s, city.slug, local) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await load((await params).il);
  if (!d) return {};
  const { city, local } = d;
  return buildMetadata({
    title: `${city.name} Dijital Hizmetler: Web Tasarım, Yazılım, SEO ve Reklam Uzmanları`,
    description: `${locative(city.name)} web sitesi, e-ticaret, mobil uygulama, logo tasarımı, SEO ve sosyal medya hizmetleri. ${local > 0 ? `${city.name} merkezli ${local} uzman ve ` : ""}Türkiye genelinden doğrulanmış uzmanlar, güvenli ödeme.`,
    path: `/il/${city.slug}`,
    noindex: !d.indexable,
  });
}

export default async function CityHub({ params }: Props) {
  const { il } = await params;
  const d = await load(il);
  if (!d) {
    const alias = citySlugFromName(il);
    if (alias && alias !== il) permanentRedirect(`/il/${alias}`);
    notFound();
  }
  const { city, totals, local } = d;
  const landings = await publishedLandings();
  const catIds = landings.map((l) => l.categoryId).filter(Boolean) as string[];
  const [cats, perCategory, providers, cityProjects] = await Promise.all([
    catIds.length ? db.select({ id: categories.id, slug: categories.slug }).from(categories).where(inArray(categories.id, catIds)) : [],
    Promise.all(landings.map((l) => providerCountsByCity(l.categoryId).then((m) => m.get(city.slug) ?? 0))),
    local > 0 ? listProviders({ city: city.name, limit: 8 }) : null,
    db
      .select({ p: projects, categoryName: categories.name, categorySlug: categories.slug, buyerName: users.name })
      .from(projects)
      .innerJoin(categories, eq(categories.id, projects.categoryId))
      .innerJoin(users, eq(users.id, projects.buyerId))
      .where(and(eq(projects.status, "open"), eq(projects.city, city.slug)))
      .orderBy(desc(projects.createdAt))
      .limit(5),
  ]);
  const catSlug = new Map(cats.map((c) => [c.id, c.slug]));
  const region = sameRegion(city);
  const regionTotal = region.reduce((a, c) => a + (totals.get(c.slug) ?? 0), 0);
  const [{ n: nationalTotal }] = await db.select({ n: sql<number>`count(*)::int` }).from(providerProfiles).innerJoin(users, eq(users.id, providerProfiles.userId)).where(and(eq(users.status, "active"), sql`exists (select 1 from services s where s.provider_id = ${providerProfiles.userId} and s.status = 'active')`));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${city.name} dijital hizmetler`,
          url: absoluteUrl(`/il/${city.slug}`),
          about: { "@type": "City", name: city.name, containedInPlace: { "@type": "Country", name: "Türkiye" } },
          hasPart: landings.map((l) => ({ "@type": "WebPage", name: `${city.name} ${lowerFirst(l.h1)}`, url: absoluteUrl(`/${l.slug}/${city.slug}`) })),
        }}
      />
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pb-12 pt-6">
          <Breadcrumbs items={[{ name: "İller", path: "/il" }, { name: city.name, path: `/il/${city.slug}` }]} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="eyebrow mb-4 flex items-center gap-2">
                <span className="num rounded-sm bg-ink px-1.5 py-0.5 text-[11px] text-white">{city.plate}</span> {REGIONS[city.region]} Bölgesi{city.metro ? " · Büyükşehir" : ""}
              </p>
              <h1 className="text-[36px] font-semibold leading-[1.05] sm:text-[54px]">{locative(city.name)} dijital hizmetler</h1>
              <p className="mt-5 max-w-[60ch] text-[17px] text-ink-2">{city.profile}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5">
                {city.sectors.map((s) => <li key={s} className="rounded-sm border border-line bg-surface px-2 py-1 text-[12.5px] text-ink-2">{SECTORS[s]}</li>)}
              </ul>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink pt-5 text-[13px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div><dt className="text-muted">{city.name} merkezli uzman</dt><dd className="num mt-1 text-[26px]">{local}</dd></div>
              {cityProjects.length > 0 ? (
                <div><dt className="text-muted">Açık proje</dt><dd className="num mt-1 text-[26px]">{cityProjects.length}</dd></div>
              ) : (
                <div><dt className="text-muted">{REGIONS[city.region]} Bölgesi’nde</dt><dd className="num mt-1 text-[26px]">{regionTotal + local}</dd></div>
              )}
              <div className="col-span-2">
                <dt className="text-muted">Türkiye genelinde hizmet veren uzman</dt>
                <dd className="num mt-1 text-[26px]">{nationalTotal}</dd>
                <p className="mt-1 text-[12px] text-muted">Dijital işler uzaktan yürütüldüğü için tüm uzmanlar {genitive(city.name)} işletmelerine hizmet verebilir.</p>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Hizmetler: ilin her hizmet sayfasına bağlantı */}
      <section className="container-x py-14">
        <p className="eyebrow mb-3">Hizmetler</p>
        <h2 className="mb-6 text-[26px] font-semibold">{locative(city.name)} hangi işi yaptırmak istiyorsunuz?</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {landings.map((l, i) => (
            <li key={l.slug}>
              <Link href={`/${l.slug}/${city.slug}`} className="group flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <CategoryGlyph slug={(l.categoryId && catSlug.get(l.categoryId)) || "web-ve-yazilim"} size={56} className="h-[42px] w-14" />
                  <IconArrowUpRight size={16} className="text-faint transition-colors group-hover:text-accent" />
                </div>
                <p className="mt-4 font-display text-[17px] font-semibold leading-snug">{city.name} {lowerFirst(l.h1)}</p>
                <p className="mt-auto pt-2 text-[12.5px] text-muted">{perCategory[i]! > 0 ? `${perCategory[i]} yerel uzman` : "Türkiye genelinden uzmanlar"}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* İlin ekonomisine göre dijital ihtiyaçlar */}
      <section className="border-y border-line bg-surface py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <p className="eyebrow mb-3">{genitive(city.name)} ihtiyaçları</p>
            <h2 className="text-[26px] font-semibold">İşletmeler en çok ne arıyor?</h2>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {city.sectors.map((s) => (
              <li key={s} className="grid gap-2 py-5 sm:grid-cols-[200px_1fr]">
                <p className="font-medium">{SECTORS[s]}</p>
                <p className="text-[15px] text-ink-2">{SECTOR_NEEDS[s]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {providers && providers.items.length > 0 && (
        <section className="container-x py-14">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-[24px] font-semibold">{city.name} merkezli uzmanlar</h2>
            <Link href={`/uzmanlar?sehir=${encodeURIComponent(city.name)}`} className="text-[14px] font-medium hover:text-accent-strong">Tümü →</Link>
          </div>
          <div className="divide-y divide-line border-y border-line">{providers.items.map((p) => <ProviderRow key={p.slug} p={p} />)}</div>
        </section>
      )}

      {cityProjects.length > 0 && (
        <section className="container-x pb-14">
          <h2 className="mb-2 text-[24px] font-semibold">{locative(city.name)} açık projeler</h2>
          <ProjectList items={cityProjects} />
        </section>
      )}

      <section className="container-x pb-4 pt-6">
        <div className="grid gap-8 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <nav aria-label={`${REGIONS[city.region]} Bölgesi’ndeki iller`}>
            <h2 className="text-[16px] font-semibold">{REGIONS[city.region]} Bölgesi’ndeki diğer iller</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
              {region.map((c) => <li key={c.slug}><Link href={`/il/${c.slug}`} className="text-ink-2 hover:text-ink hover:underline">{c.name}</Link></li>)}
            </ul>
          </nav>
          <ButtonLink href={`/proje-olustur?il=${city.slug}`} size="lg" variant="accent">{locative(city.name)} proje oluştur</ButtonLink>
        </div>
      </section>
    </>
  );
}
