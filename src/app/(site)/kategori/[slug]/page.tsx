import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { landingPages, redirects, services } from "@/db/schema";
import { getCategoryBySlug, listServices, latestPosts } from "@/server/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceGrid } from "@/components/cards";
import { ServiceFilters, SortSelect, Pagination, MobileFilters, filtersFromSP, activeFilterCount, hasFilters, type SP } from "@/components/listing";
import { EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";
import { renderMarkdown } from "@/lib/markdown";
import { formatNumber, formatTRY } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const c = await getCategoryBySlug(slug);
  if (!c) return {};
  const page = Number(sp.sayfa ?? 1);
  return buildMetadata({
    title: (c.seoTitle ?? `${c.name} hizmetleri`) + (page > 1 ? ` – Sayfa ${page}` : ""),
    description: c.seoDescription ?? c.shortDescription,
    path: `/kategori/${c.slug}${page > 1 ? `?sayfa=${page}` : ""}`,
    noindex: c.noindex || hasFilters(sp),
    canonical: c.canonicalUrl,
    image: c.imageId ? `/api/files/${c.imageId}` : null,
  });
}

/** Kategorideki gerçek aktif ilanlardan fiyat aralığı. Yeterli veri yoksa gösterilmez. */
async function priceStats(categoryIds: string[]) {
  const [r] = await db
    .select({
      n: sql<number>`count(*)::int`,
      p25: sql<number>`percentile_disc(0.25) within group (order by ${services.startingPriceKurus})`,
      p75: sql<number>`percentile_disc(0.75) within group (order by ${services.startingPriceKurus})`,
    })
    .from(services)
    .where(and(eq(services.status, "active"), inArray(services.categoryId, categoryIds)));
  return r && r.n >= 5 ? r : null;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const c = await getCategoryBySlug(slug);
  if (!c) {
    const r = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, `/kategori/${slug}`) });
    if (r) permanentRedirect(r.toPath);
    notFound();
  }
  const ids = [c.id, ...c.children.map((x) => x.id)];
  const f = filtersFromSP(sp);
  const sub = typeof sp.kategori === "string" ? c.children.find((x) => x.slug === sp.kategori) : undefined;
  const [result, stats, landing, posts] = await Promise.all([
    listServices({ ...f, categoryIds: sub ? [sub.id] : ids }),
    priceStats(ids),
    db.query.landingPages.findFirst({ where: and(eq(landingPages.categoryId, c.id), eq(landingPages.isPublished, true)) }),
    latestPosts(2),
  ]);
  const crumbs = [...(c.parent ? [{ name: c.parent.name, path: `/kategori/${c.parent.slug}` }] : []), { name: c.name, path: `/kategori/${c.slug}` }];
  const base = `/kategori/${c.slug}`;

  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex items-start gap-5">
          {c.imageId && <img src={`/api/files/${c.imageId}`} alt="" width={88} height={88} className="hidden h-[88px] w-[88px] shrink-0 rounded-md border border-line object-cover sm:block" />}
          <div>
          <h1 className="text-[34px] font-semibold sm:text-[44px]">{c.h1 ?? c.name}</h1>
          <p className="mt-3 max-w-2xl text-[16.5px] text-ink-2">{c.shortDescription}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13.5px] text-muted">
          <span><span className="num text-[18px] text-ink">{formatNumber(result.total)}</span> aktif hizmet</span>
          {stats && (
            <span>
              Tipik başlangıç: <span className="num text-ink">{formatTRY(stats.p25)} – {formatTRY(stats.p75)}</span>
            </span>
          )}
        </div>
      </header>

      {c.filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line py-4 text-[13.5px]">
          {c.filters.map((f) => (
            <div key={f.key} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-muted">{f.label}:</span>
              {f.options.map((o) => {
                const on = sp.etiket === o;
                return <Link key={o} href={on ? base : `${base}?etiket=${encodeURIComponent(o)}`} aria-current={on ? "true" : undefined} className={on ? "rounded-sm bg-ink px-2 py-0.5 text-white" : "rounded-sm border border-line bg-surface px-2 py-0.5 hover:border-ink/40"}>{o}</Link>;
              })}
            </div>
          ))}
        </div>
      )}

      {c.children.length > 0 && (
        <nav aria-label="Alt kategoriler" className="-mx-4 overflow-x-auto px-4 py-4 [scrollbar-width:none]">
          <ul className="flex gap-2 whitespace-nowrap">
            {c.children.map((s) => (
              <li key={s.id}>
                <Link href={`/kategori/${s.slug}`} className="block rounded-sm border border-line bg-surface px-3 py-1.5 text-[13.5px] text-ink-2 hover:border-ink/40 hover:text-ink">{s.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <ServiceFilters sp={sp} action={base} categories={c.children.map((x) => ({ slug: x.slug, name: x.name }))} showCategory={c.children.length > 0} />
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-[14px] text-muted">{formatNumber(result.total)} sonuç</p>
            <SortSelect sp={sp} action={base} />
          </div>
          <div className="mb-6">
            <MobileFilters count={activeFilterCount(sp)}>
              <ServiceFilters sp={sp} action={base} categories={c.children.map((x) => ({ slug: x.slug, name: x.name }))} showCategory={c.children.length > 0} />
            </MobileFilters>
          </div>
          {result.items.length ? (
            <>
            <h2 className="sr-only">Hizmetler</h2>
            <ServiceGrid items={result.items} cols={3} />
            </>
          ) : (
            <EmptyState
              title="Bu kriterlere uyan hizmet yok"
              body="Filtreleri gevşetebilir ya da işinizi anlatan bir proje oluşturup uzmanlardan teklif alabilirsiniz."
              action={<ButtonLink href={`/proje-olustur?kategori=${c.slug}`} variant="accent">Proje oluştur</ButtonLink>}
            />
          )}
          <Pagination page={result.page} pages={result.pages} base={base} sp={sp} />
        </div>
      </div>

      {(c.intro || c.faqs.length > 0) && (
        <section className="mt-20 grid gap-12 border-t border-line pt-12 lg:grid-cols-[1fr_380px]">
          {c.intro && (
            <div>
              <h2 className="text-[26px] font-semibold">{c.name} hizmeti alırken</h2>
              <div className="prose-ek mt-5 max-w-[68ch]" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.intro) }} />
              {landing && (
                <Link href={`/${landing.slug}`} className="mt-6 inline-block text-[14.5px] font-medium underline decoration-accent underline-offset-4">
                  {landing.h1} rehberinin tamamı →
                </Link>
              )}
            </div>
          )}
          <div className="space-y-10">
            {c.faqs.length > 0 && (
              <div>
                <h2 className="text-[20px] font-semibold">Sık sorulan sorular</h2>
                <div className="mt-4 divide-y divide-line border-y border-line">
                  {c.faqs.map((q) => (
                    <details key={q.q} className="group py-4">
                      <summary className="flex cursor-pointer list-none justify-between gap-4 font-medium">
                        {q.q}
                        <span className="text-muted transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 text-[14.5px] text-ink-2">{q.a}</p>
                    </details>
                  ))}
                </div>
                <JsonLd data={ld.faq(c.faqs)} />
              </div>
            )}
            {posts.length > 0 && (
              <div>
                <p className="eyebrow mb-3">İlgili rehberler</p>
                <ul className="space-y-3">
                  {posts.map((p) => (
                    <li key={p.id}><Link href={`/blog/${p.slug}`} className="text-[15px] font-medium hover:underline">{p.title}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
