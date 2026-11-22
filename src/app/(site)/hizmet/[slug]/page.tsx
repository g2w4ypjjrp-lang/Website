import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { and, eq, ne, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { favorites, redirects, services } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { getReviews, getServiceBySlug, isOnline, listServices } from "@/server/queries";
import { contactProviderAction, toggleFavoriteAction } from "@/app/actions/market";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceCover, ServiceGrid } from "@/components/cards";
import { PackagePicker } from "@/components/package-picker";
import { ReviewList } from "@/components/review-list";
import { Avatar, Rating, VerifiedMark, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { IconHeart, IconChat } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { renderMarkdown } from "@/lib/markdown";
import { LEVEL_LABEL, TIER_LABEL } from "@/lib/order-status";
import { fileUrl, formatMonthYear, formatTRY, truncate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ hata?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getServiceBySlug(slug);
  if (!d) return {};
  return buildMetadata({
    title: d.s.seoTitle ?? d.s.title,
    description: d.s.seoDescription ?? truncate(`${d.s.summary} ${formatTRY(d.s.startingPriceKurus)}’den başlayan fiyatlarla, ${d.p.displayName}.`, 158),
    path: `/hizmet/${d.s.slug}`,
    image: fileUrl(d.s.coverId),
    noindex: d.s.noindex || d.s.status !== "active",
  });
}

export default async function ServicePage({ params, searchParams }: Props) {
  const [{ slug }, { hata }] = await Promise.all([params, searchParams]);
  const d = await getServiceBySlug(slug);
  if (!d) {
    const r = await db.query.redirects.findFirst({ where: eq(redirects.fromPath, `/hizmet/${slug}`) });
    if (r) permanentRedirect(r.toPath);
    notFound();
  }
  const user = await getCurrentUser();
  const isOwner = user?.id === d.s.providerId;
  if ((d.s.status !== "active" || d.u.status !== "active") && !isOwner && user?.role !== "admin") notFound();

  const ua = (await headers()).get("user-agent") ?? "";
  if (!isOwner && !/bot|crawl|spider|slurp|preview/i.test(ua)) await db.update(services).set({ viewCount: sql`${services.viewCount} + 1` }).where(eq(services.id, d.s.id));

  const [reviewRows, related, more, fav] = await Promise.all([
    getReviews({ serviceId: d.s.id }, 8),
    listServices({ categoryIds: [d.c.id], perPage: 5 }),
    db.select({ slug: services.slug, title: services.title, price: services.startingPriceKurus }).from(services).where(and(eq(services.providerId, d.s.providerId), eq(services.status, "active"), ne(services.id, d.s.id))).orderBy(desc(services.orderCount)).limit(4),
    user ? db.query.favorites.findFirst({ where: and(eq(favorites.userId, user.id), eq(favorites.targetType, "service"), eq(favorites.targetId, d.s.id)) }) : null,
  ]);
  const path = `/hizmet/${d.s.slug}`;
  const crumbs = [...(d.parent ? [{ name: d.parent.name, path: `/kategori/${d.parent.slug}` }] : []), { name: d.c.name, path: `/kategori/${d.c.slug}` }, { name: truncate(d.s.title, 40), path }];
  const prices = d.packages.map((p) => p.priceKurus / 100);
  const disabled = isOwner ? "Bu sizin hizmetiniz." : user?.role === "admin" ? "Yönetici hesabıyla sipariş verilemez." : d.s.status !== "active" ? "Bu hizmet şu an satışta değil." : undefined;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: d.s.title,
    description: d.s.summary,
    url: absoluteUrl(path),
    serviceType: d.c.name,
    areaServed: { "@type": "Country", name: "Türkiye" },
    provider: { "@type": d.u.accountType === "individual" ? "Person" : "Organization", name: d.p.displayName, url: absoluteUrl(`/uzman/${d.p.slug}`) },
    ...(prices.length ? { offers: { "@type": "AggregateOffer", priceCurrency: "TRY", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length } } : {}),
    // Yalnızca gerçek, tamamlanmış siparişlerden gelen değerlendirmeler varsa
    ...(d.s.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: (d.s.ratingAvg / 100).toFixed(1), reviewCount: d.s.ratingCount, bestRating: 5, worstRating: 1 } } : {}),
  };

  return (
    <div className="container-x pt-6">
      <JsonLd data={serviceLd} />
      {d.s.faqs.length > 0 && <JsonLd data={ld.faq(d.s.faqs)} />}
      <Breadcrumbs items={crumbs} />
      {hata === "bakim" && <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-[14px] text-warn">Platform kısa süreli bakımda; yeni sipariş alınamıyor. Lütfen biraz sonra tekrar deneyin.</p>}
      {hata === "kendi" && <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-[14px] text-warn">Kendi hizmetinize sipariş veremezsiniz.</p>}
      {d.s.status !== "active" && <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-[14px] text-warn">Önizleme: bu hizmet “{d.s.status === "pending" ? "onay bekliyor" : d.s.status}” durumunda ve herkese görünmüyor.</p>}

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <div className="min-w-0">
          <h1 className="text-[28px] font-semibold leading-tight sm:text-[36px]">{d.s.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={`/uzman/${d.p.slug}`} className="flex items-center gap-2.5">
              <Avatar name={d.p.displayName} src={fileUrl(d.u.avatarId)} size={36} online={isOnline(d.u.lastSeenAt)} />
              <span>
                <span className="block text-[14.5px] font-medium hover:underline">{d.p.displayName}</span>
                <span className="block text-[12.5px] text-muted">{LEVEL_LABEL[d.p.level]}{d.p.city ? ` · ${d.p.city}` : ""}</span>
              </span>
            </Link>
            {d.p.verifiedAt && <VerifiedMark />}
            <Rating value={d.s.ratingAvg} count={d.s.ratingCount} />
            {d.s.orderCount > 0 && <span className="text-[13px] text-muted">{d.s.orderCount} tamamlanan sipariş</span>}
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-line-2">
            <ServiceCover rootSlug={d.parent?.slug ?? d.c.slug} coverId={d.s.coverId} title={d.s.title} priority />
          </div>
          {d.s.gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {d.s.gallery.slice(0, 8).map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <a key={g} href={fileUrl(g)!} target="_blank" className="overflow-hidden rounded-md border border-line-2"><img src={fileUrl(g)!} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" /></a>
              ))}
            </div>
          )}

          <div id="paketler" className="mt-6 scroll-mt-20 lg:hidden">
            <PackagePicker serviceId={d.s.id} packages={d.packages} extras={d.s.extras} disabledReason={disabled} />
          </div>

          <section className="mt-12">
            <h2 className="text-[22px] font-semibold">Hizmet hakkında</h2>
            <div className="prose-ek mt-4" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.s.description) }} />
            {d.s.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {d.s.tags.map((t) => <li key={t}><Link href={`/ara?q=${encodeURIComponent(t)}`} className="rounded-sm border border-line px-2 py-0.5 text-[12.5px] text-ink-2 hover:border-ink/40">{t}</Link></li>)}
              </ul>
            )}
          </section>

          {d.packages.length > 1 && (
            <section className="mt-12">
              <h2 className="text-[22px] font-semibold">Paketleri karşılaştır</h2>
              <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
                <table className="w-full min-w-[520px] text-[14px]">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="p-3 font-medium text-muted" />
                      {d.packages.map((p) => <th key={p.tier} className="p-3 font-semibold">{TIER_LABEL[p.tier]}<span className="block text-[12.5px] font-normal text-muted">{p.name}</span></th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-2">
                    <tr><td className="p-3 text-muted">Fiyat</td>{d.packages.map((p) => <td key={p.tier} className="num p-3">{formatTRY(p.priceKurus)}</td>)}</tr>
                    <tr><td className="p-3 text-muted">Teslim</td>{d.packages.map((p) => <td key={p.tier} className="p-3">{p.deliveryDays} gün</td>)}</tr>
                    <tr><td className="p-3 text-muted">Revizyon</td>{d.packages.map((p) => <td key={p.tier} className="p-3">{p.revisions}</td>)}</tr>
                    <tr className="align-top"><td className="p-3 text-muted">Kapsam</td>{d.packages.map((p) => <td key={p.tier} className="p-3 text-ink-2">{p.features.join(" · ")}</td>)}</tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {d.s.faqs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[22px] font-semibold">Sık sorulan sorular</h2>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {d.s.faqs.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none justify-between gap-4 font-medium">{f.q}<span className="text-muted group-open:rotate-45">+</span></summary>
                    <p className="mt-2 text-[14.5px] text-ink-2">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12" id="degerlendirmeler">
            <h2 className="text-[22px] font-semibold">Değerlendirmeler</h2>
            <p className="mt-1 text-[13.5px] text-muted">Yalnızca bu hizmeti satın alıp siparişi tamamlanan müşteriler değerlendirme yazabilir.</p>
            <ReviewList rows={reviewRows} />
          </section>

          <section className="mt-12 rounded-lg border border-line bg-surface p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={d.p.displayName} src={fileUrl(d.u.avatarId)} size={56} />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold"><Link href={`/uzman/${d.p.slug}`} className="hover:underline">{d.p.displayName}</Link></p>
                <p className="text-[14px] text-ink-2">{d.p.headline}</p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-[13.5px] sm:grid-cols-4">
                  <div><dt className="text-muted">Üyelik</dt><dd>{formatMonthYear(d.u.createdAt)}</dd></div>
                  <div><dt className="text-muted">Tamamlanan iş</dt><dd className="num">{d.p.completedOrders}</dd></div>
                  <div><dt className="text-muted">Yanıt süresi</dt><dd>{d.p.avgResponseMinutes ? `~${Math.max(1, Math.round(d.p.avgResponseMinutes / 60))} saat` : "Henüz ölçülmedi"}</dd></div>
                  <div><dt className="text-muted">Konum</dt><dd>{d.p.city ?? "—"}</dd></div>
                </dl>
              </div>
            </div>
            {more.length > 0 && (
              <div className="mt-6 border-t border-line-2 pt-4">
                <p className="mb-2 text-[13px] font-medium text-muted">Uzmanın diğer hizmetleri</p>
                <ul className="space-y-1.5">{more.map((m) => <li key={m.slug} className="flex justify-between gap-4 text-[14px]"><Link href={`/hizmet/${m.slug}`} className="truncate hover:underline">{m.title}</Link><span className="num shrink-0 text-muted">{formatTRY(m.price)}</span></li>)}</ul>
              </div>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[84px] space-y-3">
            <PackagePicker serviceId={d.s.id} packages={d.packages} extras={d.s.extras} disabledReason={disabled} />
            {!isOwner && (
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <form action={contactProviderAction}>
                  <input type="hidden" name="providerId" value={d.s.providerId} />
                  <input type="hidden" name="back" value={path} />
                  <Button variant="outline" className="w-full"><IconChat size={16} /> Sipariş öncesi soru sor</Button>
                </form>
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="targetType" value="service" />
                  <input type="hidden" name="targetId" value={d.s.id} />
                  <input type="hidden" name="back" value={path} />
                  <Button variant="outline" aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"} aria-pressed={!!fav} className={fav ? "text-accent" : ""}><IconHeart size={16} filled={!!fav} /></Button>
                </form>
              </div>
            )}
            {d.s.sponsored && <Badge>Sponsorlu listeleme</Badge>}
          </div>
        </aside>
      </div>

      {related.items.filter((r) => r.id !== d.s.id).length > 0 && (
        <section className="mt-20 border-t border-line pt-10">
          <h2 className="mb-6 text-[22px] font-semibold">{d.c.name} alanında diğer hizmetler</h2>
          <ServiceGrid items={related.items.filter((r) => r.id !== d.s.id).slice(0, 4)} />
        </section>
      )}

      {!isOwner && (
        <div className="fixed inset-x-0 bottom-[58px] z-30 border-t border-line bg-paper/95 p-3 backdrop-blur lg:hidden">
          <form action={contactProviderAction} className="flex gap-2">
            <input type="hidden" name="providerId" value={d.s.providerId} />
            <input type="hidden" name="back" value={path} />
            <Button variant="outline" className="flex-1"><IconChat size={16} /> Soru sor</Button>
            <a href="#paketler" className="flex h-10 flex-1 items-center justify-center rounded-md bg-ink text-[14.5px] font-medium text-white">{formatTRY(d.s.startingPriceKurus)}’den başla</a>
          </form>
        </div>
      )}
    </div>
  );
}
