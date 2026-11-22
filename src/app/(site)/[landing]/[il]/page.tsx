import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages, services } from "@/db/schema";
import { listProviders, listServices } from "@/server/queries";
import { categoryFamily, localSeoSettings, providerCountsByCity, publishedLandings, sameRegion, serviceCityIndexable } from "@/server/local-seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceGrid, ProviderRow } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { IconArrowRight, IconPin } from "@/components/icons";
import { buildMetadata, ld } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { REGIONS, SECTORS, citySlugFromName, getCity } from "@/lib/tr-cities";
import { genitive, locative, lowerFirst, titleCaseTR } from "@/lib/tr-grammar";
import { adviceFor } from "@/lib/local-seo-content";
import { formatTRY } from "@/lib/utils";

export const revalidate = 3600;
/** Boş liste: sayfalar ilk istekte üretilir ve ISR ile önbelleğe alınır (81 il × hizmet). */
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ landing: string; il: string }> };

async function load(landingSlug: string, citySlug: string) {
  const city = getCity(citySlug);
  if (!city) return null;
  const l = await db.query.landingPages.findFirst({ where: and(eq(landingPages.slug, landingSlug), eq(landingPages.isPublished, true)) });
  if (!l) return null;
  const [s, counts, fam] = await Promise.all([localSeoSettings(), providerCountsByCity(l.categoryId), categoryFamily(l.categoryId)]);
  const local = counts.get(city.slug) ?? 0;
  const regionTotal = sameRegion(city).reduce((a, c) => a + (counts.get(c.slug) ?? 0), 0);
  return { city, l, s, counts, fam, local, regionTotal, indexable: !l.noindex && serviceCityIndexable(s, city.slug, local) };
}

const serviceName = (h1: string) => lowerFirst(h1);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { landing, il } = await params;
  const d = await load(landing, il);
  if (!d) return {};
  const { city, l, local } = d;
  const title = `${city.name} ${titleCaseTR(l.h1)}: Uzmanlar ve Fiyatlar`;
  const description = `${locative(city.name)} ${serviceName(l.h1)} için ${local > 0 ? `${local} yerel uzman ve ` : ""}Türkiye genelinden doğrulanmış uzmanların paketlerini, teslim sürelerini ve fiyatlarını karşılaştırın. Ödeme, teslimatı onaylayana kadar güvende.`;
  return buildMetadata({ title, description, path: `/${l.slug}/${city.slug}`, noindex: !d.indexable });
}

export default async function ServiceCityPage({ params }: Props) {
  const { landing, il } = await params;
  const d = await load(landing, il);
  if (!d) {
    // "afyon", "antep", "urfa" gibi yaygın adları doğru il sayfasına yönlendir
    const alias = citySlugFromName(il);
    if (alias && alias !== il) permanentRedirect(`/${landing}/${alias}`);
    notFound();
  }
  const { city, l, counts, fam, local, regionTotal } = d;
  const regionCities = sameRegion(city);
  const [cat, localProviders, regionProviders, svc, stats, landings] = await Promise.all([
    l.categoryId ? db.query.categories.findFirst({ where: eq(categories.id, l.categoryId) }) : null,
    local > 0 ? listProviders({ categoryId: l.categoryId ?? undefined, city: city.name, limit: 6 }) : null,
    local === 0 && regionTotal > 0 ? listProviders({ categoryId: l.categoryId ?? undefined, cityIn: regionCities.map((c) => c.slug), limit: 4 }) : null,
    fam.length ? listServices({ categoryIds: fam, preferCity: city.name, perPage: 8 }) : null,
    fam.length
      ? db
          .select({
            n: sql<number>`count(*)::int`,
            min: sql<number>`min(${services.startingPriceKurus})`,
            med: sql<number>`percentile_disc(0.5) within group (order by ${services.startingPriceKurus})`,
            days: sql<number>`percentile_disc(0.5) within group (order by ${services.minDeliveryDays})`,
          })
          .from(services)
          .where(and(eq(services.status, "active"), inArray(services.categoryId, fam)))
          .then((r) => r[0])
      : null,
    publishedLandings(),
  ]);
  const showStats = !!stats && stats.n >= 3;
  const svcName = serviceName(l.h1);
  const advice = adviceFor(l.slug, city.sectors);
  const path = `/${l.slug}/${city.slug}`;
  const ctaHref = `/proje-olustur?${new URLSearchParams({ ...(cat ? { kategori: cat.slug } : {}), il: city.slug })}`;

  const faqs = [
    {
      q: `${locative(city.name)} yüz yüze görüşebileceğim bir uzman bulabilir miyim?`,
      a:
        local > 0
          ? `Evet. Eksen’de ${city.name} merkezli ${local} uzman bu alanda yayında hizmet sunuyor; profillerindeki konum bilgisine göre listeleyebilir, sipariş öncesi mesajlaşarak görüşme ayarlayabilirsiniz.`
          : `Şu an ${city.name} merkezli kayıtlı uzman bulunmuyor${regionTotal > 0 ? `; ${REGIONS[city.region]} Bölgesi’nde ${regionTotal} uzman var` : ""}. Dijital hizmetler çevrim içi yürütüldüğü için Türkiye’nin her yerinden uzmanla çalışabilir, görüşmeleri görüntülü yapabilirsiniz.`,
    },
    {
      q: `${genitive(city.name)} işletmeleri için ${svcName} fiyatları ne kadar?`,
      a: showStats
        ? `Eksen’de yayında olan ${stats!.n} ilanın başlangıç fiyatları ${formatTRY(stats!.min)}’den başlıyor, ortanca başlangıç fiyatı ${formatTRY(stats!.med)}. Fiyatı kapsam, sayfa/ekran sayısı ve entegrasyonlar belirler; ${city.name} için ayrı bir fiyat farkı yoktur.`
        : `Fiyat; kapsama, içerik ihtiyacına ve entegrasyonlara göre değişir. Projenizi ücretsiz yazarak ${city.name} ve diğer illerden uzmanların tekliflerini karşılaştırabilirsiniz.`,
    },
    {
      q: "İş bitmeden ödeme yapmam gerekir mi?",
      a: "Ödeme sipariş başında alınır ancak lisanslı ödeme kuruluşunun havuz hesabında bekler; siz teslimatı onaylayana kadar uzmana aktarılmaz. Sorun yaşarsanız iade talebi açabilirsiniz.",
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${locative(city.name)} ${svcName}`,
          serviceType: l.h1,
          url: absoluteUrl(path),
          provider: { "@id": absoluteUrl("/#org") },
          areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "Country", name: "Türkiye" } },
          ...(showStats ? { offers: { "@type": "AggregateOffer", priceCurrency: "TRY", lowPrice: stats!.min / 100, offerCount: stats!.n } } : {}),
        }}
      />
      <JsonLd data={ld.faq(faqs)} />

      {/* ───────── Başlık ───────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pb-12 pt-6">
          <Breadcrumbs items={[{ name: l.h1, path: `/${l.slug}` }, { name: city.name, path }]} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="eyebrow mb-4 flex items-center gap-2">
                <span className="num rounded-sm bg-ink px-1.5 py-0.5 text-[11px] text-white">{city.plate}</span> {city.name} · {REGIONS[city.region]} Bölgesi
              </p>
              <h1 className="text-[36px] font-semibold leading-[1.05] sm:text-[52px]">
                {locative(city.name)} {svcName}
              </h1>
              <p className="mt-5 max-w-[60ch] text-[17px] text-ink-2">
                {city.profile} Bu sayfada {genitive(city.name)} işletmeleri için {svcName} hizmeti veren uzmanları, fiyatları ve ilin ihtiyaçlarına göre dikkat edilmesi gerekenleri bulursunuz.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={ctaHref} size="lg" variant="accent">Ücretsiz teklif al</ButtonLink>
                <ButtonLink href={`/uzmanlar?sehir=${encodeURIComponent(city.name)}${cat ? `&kategori=${cat.slug}` : ""}`} size="lg" variant="outline">{city.name} uzmanları</ButtonLink>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink pt-5 text-[13px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div><dt className="text-muted">{city.name} merkezli uzman</dt><dd className="num mt-1 text-[24px]">{local}</dd></div>
              <div><dt className="text-muted">{REGIONS[city.region]} Bölgesi’nde</dt><dd className="num mt-1 text-[24px]">{regionTotal + local}</dd></div>
              {showStats && <div><dt className="text-muted">Ortanca başlangıç fiyatı</dt><dd className="num mt-1 text-[24px]">{formatTRY(stats!.med)}</dd></div>}
              {showStats && <div><dt className="text-muted">Tipik teslim</dt><dd className="num mt-1 text-[24px]">{stats!.days} gün</dd></div>}
              <p className="col-span-2 text-[12px] text-muted">Sayılar platformdaki yayında olan profil ve ilanlardan anlık hesaplanır.</p>
            </dl>
          </div>
        </div>
      </section>

      {/* ───────── Yerel / bölgesel uzmanlar ───────── */}
      <section className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <p className="eyebrow mb-3">Uzmanlar</p>
            <h2 className="text-[26px] font-semibold">{local > 0 ? `${city.name} merkezli uzmanlar` : `${city.name} için uzmanlar`}</h2>
            <p className="mt-3 text-[14.5px] text-ink-2">
              {local > 0
                ? `Yüz yüze görüşmeyi tercih ediyorsanız bu uzmanlarla başlayabilirsiniz. Tüm süreç yine Eksen güvencesinde yürür.`
                : `Henüz ${city.name} merkezli uzman yok. Dijital işler uzaktan yürütüldüğü için ${regionTotal > 0 ? `${REGIONS[city.region]} Bölgesi’ndeki ve ` : ""}Türkiye genelindeki uzmanlarla aynı güvenceyle çalışabilirsiniz.`}
            </p>
            <Link href="/uzman-ol" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium hover:text-accent-strong">
              {locative(city.name)} mı çalışıyorsunuz? Uzman olarak katılın <IconArrowRight size={14} />
            </Link>
          </div>
          <div>
            {localProviders && localProviders.items.length > 0 ? (
              <div className="divide-y divide-line border-y border-line">{localProviders.items.map((p) => <ProviderRow key={p.slug} p={p} />)}</div>
            ) : regionProviders && regionProviders.items.length > 0 ? (
              <>
                <p className="mb-2 text-[13px] text-muted">{REGIONS[city.region]} Bölgesi’nden uzmanlar</p>
                <div className="divide-y divide-line border-y border-line">{regionProviders.items.map((p) => <ProviderRow key={p.slug} p={p} />)}</div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-line bg-surface/60 p-6 text-[14.5px] text-ink-2">
                <p className="flex items-center gap-2 font-medium text-ink"><IconPin size={16} /> Bölgede henüz kayıtlı uzman yok</p>
                <p className="mt-2">Projenizi yazdığınızda Türkiye’nin her yerinden uzmanlar teklif gönderebilir. İlk teklifler genellikle 24–48 saat içinde gelir.</p>
                <ButtonLink href={ctaHref} size="sm" className="mt-4">Proje oluştur</ButtonLink>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────── Paketler ───────── */}
      {svc && svc.items.length > 0 && (
        <section className="border-y border-line bg-surface py-14">
          <div className="container-x">
            <div className="mb-6 flex items-end justify-between gap-6">
              <h2 className="text-[24px] font-semibold">{l.h1} paketleri</h2>
              {cat && <Link href={`/kategori/${cat.slug}`} className="text-[14.5px] font-medium hover:text-accent-strong">Tümü →</Link>}
            </div>
            <ServiceGrid items={svc.items} />
            {local > 0 && <p className="mt-4 text-[12.5px] text-muted">{city.name} merkezli uzmanların hizmetleri listenin başında gösterilir.</p>}
          </div>
        </section>
      )}

      {/* ───────── İle özgü tavsiyeler ───────── */}
      <section className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <p className="eyebrow mb-3">{city.name} için</p>
            <h2 className="text-[26px] font-semibold">{locative(city.name)}ki işletmeler için öneriler</h2>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {city.sectors.map((s) => (
                <li key={s} className="rounded-sm border border-line bg-surface px-2 py-1 text-[12.5px] text-ink-2">{SECTORS[s]}</li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-muted">Tavsiyeler ilin öne çıkan ekonomik yapısına göre seçildi.</p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {advice.map((a, i) => (
              <li key={a.title} className="bg-paper p-6">
                <p className="num text-[12px] text-accent">{String(i + 1).padStart(2, "0")}{a.sector ? ` · ${SECTORS[a.sector]}` : ""}</p>
                <h3 className="mt-2 text-[17px] font-semibold">{a.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-6 text-[14px]">
          Süreç, fiyatı belirleyen kalemler ve teslimat kontrol listesi için <Link href={`/${l.slug}`} className="font-medium underline decoration-accent underline-offset-4">{lowerFirst(l.h1)} rehberinin tamamını</Link> okuyun.
        </p>
      </section>

      {/* ───────── SSS ───────── */}
      <section className="container-x border-t border-line py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[26px] font-semibold">Sık sorulan sorular</h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none justify-between gap-4 text-[16px] font-medium">{f.q}<span className="text-muted transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-[15px] text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── İç bağlantılar ───────── */}
      <section className="container-x pb-6">
        <div className="grid gap-10 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-2">
          <nav aria-label={`${REGIONS[city.region]} Bölgesi’ndeki iller`}>
            <h2 className="text-[16px] font-semibold">{REGIONS[city.region]} Bölgesi’nde {svcName}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px]">
              {regionCities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${l.slug}/${c.slug}`} className="text-ink-2 hover:text-ink hover:underline">
                    {c.name}{(counts.get(c.slug) ?? 0) > 0 && <span className="num ml-1 text-[11.5px] text-trust">{counts.get(c.slug)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/il" className="mt-4 inline-block text-[13px] text-muted hover:text-ink">Tüm iller →</Link>
          </nav>
          <nav aria-label={`${locative(city.name)} diğer hizmetler`}>
            <h2 className="text-[16px] font-semibold">{locative(city.name)} diğer hizmetler</h2>
            <ul className="mt-3 grid grid-cols-1 gap-y-1.5 text-[14px] sm:grid-cols-2">
              {landings.filter((x) => x.slug !== l.slug).map((x) => (
                <li key={x.slug}><Link href={`/${x.slug}/${city.slug}`} className="text-ink-2 hover:text-ink hover:underline">{city.name} {lowerFirst(x.h1)}</Link></li>
              ))}
            </ul>
            <Link href={`/il/${city.slug}`} className="mt-4 inline-block text-[13px] text-muted hover:text-ink">{city.name} dijital hizmetler sayfası →</Link>
          </nav>
        </div>
      </section>

      <section className="container-x pt-10">
        <div className="rounded-lg bg-ink p-8 text-white sm:p-12">
          <h2 className="max-w-xl text-[28px] font-semibold">{locative(city.name)}ki işiniz için teklif toplayın.</h2>
          <p className="mt-3 max-w-xl text-white/70">Proje oluşturmak ücretsiz. {city.name} ve diğer illerden uzmanların tekliflerini karşılaştırın; ödemeniz teslimatı onaylayana kadar güvende kalsın.</p>
          <ButtonLink href={ctaHref} size="lg" variant="accent" className="mt-6">Proje oluştur</ButtonLink>
        </div>
      </section>
    </>
  );
}
