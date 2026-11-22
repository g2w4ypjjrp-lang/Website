import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Metadata } from "next";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages, redirects, services } from "@/db/schema";
import { latestPosts, listProviders, listServices } from "@/server/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceGrid, ProviderRow } from "@/components/cards";
import { SearchBox } from "@/components/site/header-search";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";
import { renderMarkdown, extractHeadings } from "@/lib/markdown";
import { formatTRY, slugify } from "@/lib/utils";

type Props = { params: Promise<{ landing: string }> };

async function load(slug: string) {
  return db.query.landingPages.findFirst({ where: and(eq(landingPages.slug, slug), eq(landingPages.isPublished, true)) });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await load((await params).landing);
  if (!l) return {};
  return buildMetadata({ title: l.seoTitle, description: l.seoDescription, path: `/${l.slug}`, noindex: l.noindex, image: l.ogImageId ? `/api/files/${l.ogImageId}` : null });
}

/**
 * Programatik SEO açılış sayfası. Yalnızca yönetim panelinde editörün yayınladığı,
 * özgün içeriği olan kayıtlar için çalışır; otomatik toplu sayfa üretilmez.
 */
export default async function LandingPage({ params }: Props) {
  const { landing } = await params;
  const l = await load(landing);
  if (!l) {
    const r = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, `/${landing}`) });
    if (r) {
      await db.update(redirects).set({ hits: sql`${redirects.hits} + 1` }).where(eq(redirects.id, r.id));
      if (r.permanent) permanentRedirect(r.toPath);
      redirect(r.toPath);
    }
    notFound();
  }
  const cat = l.categoryId ? await db.query.categories.findFirst({ where: eq(categories.id, l.categoryId) }) : null;
  const childIds = cat ? (await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, cat.id))).map((x) => x.id) : [];
  const ids = cat ? [cat.id, ...childIds] : [];
  const [svc, providers, posts, stats] = await Promise.all([
    ids.length ? listServices({ categoryIds: ids, perPage: 8 }) : null,
    cat ? listProviders({ categoryId: cat.id, limit: 4 }) : null,
    latestPosts(3),
    ids.length
      ? db
          .select({
            n: sql<number>`count(*)::int`,
            min: sql<number>`min(${services.startingPriceKurus})`,
            med: sql<number>`percentile_disc(0.5) within group (order by ${services.startingPriceKurus})`,
            days: sql<number>`percentile_disc(0.5) within group (order by ${services.minDeliveryDays})`,
          })
          .from(services)
          .where(and(eq(services.status, "active"), inArray(services.categoryId, ids)))
          .then((r) => r[0])
      : null,
  ]);
  const headings = extractHeadings(l.body);
  const crumbs = [...(cat ? [{ name: cat.name, path: `/kategori/${cat.slug}` }] : []), { name: l.h1, path: `/${l.slug}` }];
  // Gerçek veri yeterliyse (en az 3 aktif ilan) fiyat özeti gösterilir
  const showStats = stats && stats.n >= 3;
  const bodyHtml = renderMarkdown(l.body).replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${slugify(t.replace(/<[^>]+>/g, ""))}">${t}</h2>`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: l.h1,
          description: l.seoDescription,
          areaServed: { "@type": "Country", name: "Türkiye" },
          provider: { "@id": "/#org" },
          ...(showStats ? { offers: { "@type": "AggregateOffer", priceCurrency: "TRY", lowPrice: stats!.min / 100, offerCount: stats!.n } } : {}),
        }}
      />
      {l.faqs.length > 0 && <JsonLd data={ld.faq(l.faqs)} />}
      <section className="border-b border-line">
        <div className="container-x pb-12 pt-6">
          <Breadcrumbs items={crumbs} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <h1 className="text-[38px] font-semibold leading-[1.05] sm:text-[56px]">{l.h1}</h1>
              <p className="mt-5 max-w-[58ch] text-[17.5px] text-ink-2">{l.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={`/proje-olustur${cat ? `?kategori=${cat.slug}` : ""}`} size="lg" variant="accent">Ücretsiz teklif al</ButtonLink>
                {cat && <ButtonLink href={`/kategori/${cat.slug}`} size="lg" variant="outline">Paketleri incele</ButtonLink>}
              </div>
            </div>
            {showStats && (
              <div>
              <dl className="grid grid-cols-3 border-t border-ink pt-4 text-[13px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div><dt className="text-muted">Aktif ilan</dt><dd className="num mt-1 text-[22px]">{stats!.n}</dd></div>
                <div><dt className="text-muted">Başlangıç fiyatı (medyan)</dt><dd className="num mt-1 text-[22px]">{formatTRY(stats!.med)}</dd></div>
                <div><dt className="text-muted">Tipik teslim</dt><dd className="num mt-1 text-[22px]">{stats!.days} gün</dd></div>
              </dl>
              <p className="mt-3 text-[12px] text-muted lg:pl-8">Platformdaki yayında olan ilanlardan anlık hesaplanır.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {svc && svc.items.length > 0 && (
        <section className="container-x py-14">
          <div className="mb-6 flex items-end justify-between"><h2 className="text-[24px] font-semibold">{l.h1} paketleri</h2>{cat && <Link href={`/kategori/${cat.slug}`} className="text-[14.5px] font-medium hover:text-accent-strong">Tümü →</Link>}</div>
          <ServiceGrid items={svc.items} />
        </section>
      )}

      <section className="container-x grid gap-12 border-t border-line py-14 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        {headings.length > 1 ? (
          <nav aria-label="İçindekiler" className="hidden lg:block">
            <div className="sticky top-[84px]">
              <p className="eyebrow mb-3">Bu sayfada</p>
              <ol className="space-y-2 text-[13.5px]">{headings.map((h) => <li key={h}><a href={`#${slugify(h)}`} className="text-ink-2 hover:text-ink">{h}</a></li>)}</ol>
            </div>
          </nav>
        ) : <div className="hidden lg:block" />}
        <article className="prose-ek max-w-[68ch]" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        <aside className="space-y-10">
          {providers && providers.items.length > 0 && (
            <div>
              <p className="eyebrow mb-1">Bu alanda çalışan uzmanlar</p>
              <div className="divide-y divide-line">{providers.items.map((p) => <ProviderRow key={p.slug} p={p} compact />)}</div>
            </div>
          )}
          {posts.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Rehberler</p>
              <ul className="space-y-3">{posts.map((p) => <li key={p.id}><Link href={`/blog/${p.slug}`} className="text-[14.5px] font-medium hover:underline">{p.title}</Link></li>)}</ul>
            </div>
          )}
        </aside>
      </section>

      {l.faqs.length > 0 && (
        <section className="container-x border-t border-line py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <h2 className="text-[26px] font-semibold">Sık sorulan sorular</h2>
            <div className="divide-y divide-line border-y border-line">
              {l.faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none justify-between gap-4 text-[16px] font-medium">{f.q}<span className="text-muted group-open:rotate-45">+</span></summary>
                  <p className="mt-2 text-[15px] text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-x">
        <div className="rounded-lg bg-ink p-8 text-white sm:p-12">
          <h2 className="max-w-xl text-[28px] font-semibold">Ne istediğini yaz, uzmanlar sana teklif göndersin.</h2>
          <p className="mt-3 max-w-xl text-white/70">Proje oluşturmak ücretsiz. Teklifleri karşılaştır, beğendiğini seç; ödemen teslimatı onaylayana kadar güvende kalsın.</p>
          <div className="mt-6 max-w-xl"><SearchBox placeholder={`ör. ${l.h1.toLocaleLowerCase("tr-TR")}`} /></div>
        </div>
      </section>
    </>
  );
}
