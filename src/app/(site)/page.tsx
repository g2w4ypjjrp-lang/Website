import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryTree, homeReviews, homeServiceRails, latestPosts, listProviders } from "@/server/queries";
import { getSettings } from "@/server/settings";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { and, eq, or, isNull, gt } from "drizzle-orm";
import { SearchBox } from "@/components/site/header-search";
import { ServiceGrid, ProviderRow } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconArrowUpRight, IconStar } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Eksen — Dijital projeni hayata geçirecek doğru uzmanı bul",
  absoluteTitle: true,
  description: "Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini tek platformda keşfedin. Ödemeniz teslimatı onaylayana kadar güvende.",
  path: "/",
});

const QUICK = [
  ["Web sitesi yaptır", "/web-sitesi-yaptirma"],
  ["Logo tasarla", "/logo-tasarimi"],
  ["Mobil uygulama geliştir", "/mobil-uygulama-gelistirme"],
  ["SEO hizmeti al", "/seo-hizmeti"],
  ["E-ticaret sitesi kur", "/e-ticaret-sitesi"],
] as const;

export default async function HomePage() {
  const [tree, rails, providers, reviews, posts, settings] = await Promise.all([
    getCategoryTree(),
    homeServiceRails(),
    listProviders({ verifiedOnly: true, limit: 6 }),
    homeReviews(),
    latestPosts(3),
    getSettings(),
  ]);
  const banner = await db.query.banners.findFirst({ where: and(eq(banners.placement, "home_top"), eq(banners.isActive, true), or(isNull(banners.endsAt), gt(banners.endsAt, new Date()))) });
  const commission = (settings.commissionBps / 100).toLocaleString("tr-TR");
  const showcase = rails.bestselling.length >= 4 ? rails.bestselling : rails.newest;

  return (
    <>
      <JsonLd data={[ld.organization(), ld.website()]} />

      {banner && (
        <div className="border-b border-line bg-ink text-white">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-2.5 text-[13.5px]">
            <p><span className="font-medium">{banner.title}</span>{banner.body && <span className="text-white/70"> — {banner.body}</span>}{banner.isSponsored && <span className="ml-2 font-mono text-[10.5px] uppercase tracking-wider text-white/50">Sponsorlu</span>}</p>
            {banner.href && <Link href={banner.href} className="font-medium underline decoration-accent underline-offset-4">{banner.ctaLabel ?? "İncele"}</Link>}
          </div>
        </div>
      )}
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-line">
        <HeroAxes />
        <div className="container-x relative pb-16 pt-14 sm:pb-24 sm:pt-24">
          <p className="eyebrow mb-5 flex items-center gap-2">
            <span className="h-2 w-2 bg-accent" /> Türkiye’nin dijital hizmet pazaryeri
          </p>
          <h1 className="max-w-[16ch] text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[76px]">
            Dijital projeni hayata geçirecek doğru uzmanı bul.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[17px] text-ink-2 sm:text-[19px]">
            Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini tek platformda keşfet.
          </p>
          <div className="mt-9 max-w-[680px]">
            <SearchBox size="lg" />
            <div className="-mx-4 mt-4 flex items-center gap-x-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-y-2 sm:px-0">
              <span className="mr-2 shrink-0 text-[13px] text-muted">Sık arananlar:</span>
              {QUICK.map(([label, href]) => (
                <Link key={href} href={href} className="shrink-0 rounded-sm border border-line bg-surface/70 px-2.5 py-1 text-[13.5px] text-ink-2 transition-colors hover:border-ink/40 hover:text-ink">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <dl className="mt-14 grid max-w-[760px] grid-cols-1 gap-6 border-t border-line pt-6 text-[14px] sm:grid-cols-3">
            <div>
              <dt className="font-medium text-ink">Onaylayana kadar korunan ödeme</dt>
              <dd className="mt-1 text-muted">Para, teslimatı kabul edene kadar uzmana geçmez.</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Yalnızca gerçek değerlendirme</dt>
              <dd className="mt-1 text-muted">Yorum yazabilmek için siparişin tamamlanmış olması gerekir.</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Hazır paket ya da teklif</dt>
              <dd className="mt-1 text-muted">Paket satın al veya projeni yaz, teklifleri karşılaştır.</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ───────── Kategori dizini (editoryal liste) ───────── */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="eyebrow mb-3">Hizmet alanları</p>
            <h2 className="text-[30px] font-semibold sm:text-[36px]">Ne yaptırmak istediğini seç.</h2>
            <p className="mt-4 text-ink-2">Her alanda hazır paketler, fiyat aralıkları ve o işi daha önce yapmış uzmanlar.</p>
            <Link href="/kategoriler" className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-medium hover:text-accent-strong">
              Tüm kategoriler <IconArrowRight size={15} />
            </Link>
          </div>
          <ol className="border-t border-ink">
            {tree.map((c, i) => (
              <li key={c.id} className="group border-b border-line">
                <Link href={`/kategori/${c.slug}`} className="grid grid-cols-[44px_1fr_auto] items-baseline gap-x-4 py-5 sm:grid-cols-[56px_minmax(0,260px)_1fr_auto]">
                  <span className="num text-[13px] text-faint transition-colors group-hover:text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-[21px] font-semibold tracking-[-0.02em] sm:text-[24px]">{c.name}</span>
                  <span className="col-start-2 mt-1 text-[14px] text-muted sm:col-start-3 sm:mt-0">{c.shortDescription}</span>
                  <IconArrowUpRight size={18} className="col-start-3 row-start-1 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink sm:col-start-4" />
                </Link>
                <div className="-mt-2 hidden flex-wrap gap-x-4 gap-y-1 pb-5 pl-[72px] sm:flex">
                  {c.children.slice(0, 6).map((s) => (
                    <Link key={s.id} href={`/kategori/${s.slug}`} className="text-[13.5px] text-ink-2 underline decoration-line underline-offset-4 hover:decoration-accent">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Hizmet vitrini ───────── */}
      {showcase.length > 0 && (
        <section className="border-y border-line bg-surface py-16 sm:py-20">
          <div className="container-x">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-2">{showcase === rails.bestselling ? "En çok satılanlar" : "Yeni eklenen hizmetler"}</p>
                <h2 className="text-[26px] font-semibold sm:text-[30px]">Hemen sipariş verilebilen paketler</h2>
              </div>
              <Link href="/ara?siralama=yeni" className="hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium hover:text-accent-strong sm:inline-flex">
                Tümünü gör <IconArrowRight size={15} />
              </Link>
            </div>
            <ServiceGrid items={showcase.slice(0, 8)} />
          </div>
        </section>
      )}

      {/* ───────── Nasıl çalışır: para akışı ───────── */}
      <section className="bg-ink text-white">
        <div className="container-x py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-3 !text-white/50">Nasıl çalışır?</p>
              <h2 className="text-[30px] font-semibold sm:text-[38px]">Ödemen, iş bitene kadar ortada durur.</h2>
              <p className="mt-5 max-w-md text-white/70">
                Sipariş verdiğinde ödeme lisanslı ödeme kuruluşunun havuz hesabına alınır. Uzman teslim eder, sen onaylarsın, para ancak o zaman uzmana aktarılır.
              </p>
              <Link href="/nasil-calisir" className="mt-7 inline-flex items-center gap-1.5 text-[14.5px] font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent">
                Süreci ayrıntılı incele <IconArrowRight size={15} />
              </Link>
            </div>
            <ol className="relative grid gap-0 sm:grid-cols-4">
              <span className="absolute left-[11px] top-3 h-[calc(100%-24px)] w-px bg-white/20 sm:left-0 sm:top-[11px] sm:h-px sm:w-full" aria-hidden />
              {[
                ["Seç ya da tarif et", "Hazır paketi seç veya projeni yazıp teklif topla."],
                ["Güvenle öde", "Ödeme havuz hesabında bekler, uzman işe başlar."],
                ["Teslim al", "Dosyalar ve mesajlar sipariş sayfasında toplanır. Gerekirse revizyon iste."],
                ["Onayla", "Onayladığında ödeme uzmana aktarılır, değerlendirmeni yazarsın."],
              ].map(([t, d], i) => (
                <li key={t} className="relative pb-8 pl-10 sm:pb-0 sm:pl-0 sm:pr-6 sm:pt-10">
                  <span className={`absolute left-0 top-0 flex h-[23px] w-[23px] items-center justify-center text-[11px] font-mono ${i === 3 ? "bg-accent" : "border border-white/40 bg-ink"}`}>{i + 1}</span>
                  <p className="font-display text-[18px] font-semibold">{t}</p>
                  <p className="mt-2 text-[14px] text-white/60">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── İki yol ───────── */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid overflow-hidden rounded-lg border border-line md:grid-cols-2">
          <div className="bg-surface p-8 sm:p-10">
            <p className="eyebrow mb-3">İşin net mi?</p>
            <h2 className="text-[26px] font-semibold">Hazır paketi seç, bugün başlasın.</h2>
            <p className="mt-3 max-w-sm text-ink-2">Fiyatı, teslim süresi ve revizyon hakkı belli paketler. Uzmana sipariş öncesi soru da sorabilirsin.</p>
            <ButtonLink href="/kategoriler" className="mt-7" variant="primary">Paketlere göz at</ButtonLink>
          </div>
          <div className="border-t border-line bg-paper-2/60 p-8 sm:p-10 md:border-l md:border-t-0">
            <p className="eyebrow mb-3">Kapsam belirsiz mi?</p>
            <h2 className="text-[26px] font-semibold">Projeni yaz, uzmanlar teklif versin.</h2>
            <p className="mt-3 max-w-sm text-ink-2">Bütçe aralığını ve tarihi belirt; gelen teklifleri fiyat, süre ve portföye göre yan yana karşılaştır.</p>
            <ButtonLink href="/proje-olustur" className="mt-7" variant="accent">Ücretsiz proje oluştur</ButtonLink>
          </div>
        </div>
      </section>

      {/* ───────── Doğrulanmış uzmanlar ───────── */}
      {providers.items.length > 0 && (
        <section className="container-x pb-16 sm:pb-24">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div>
              <p className="eyebrow mb-3">Doğrulanmış uzmanlar</p>
              <h2 className="text-[28px] font-semibold">Kimliği ve vergi bilgisi doğrulanan uzmanlar.</h2>
              <p className="mt-4 text-[14.5px] text-ink-2">Doğrulama rozeti, uzmanın kimlik ve iletişim bilgilerinin Eksen ekibince kontrol edildiğini gösterir.</p>
              <Link href="/uzmanlar" className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-medium hover:text-accent-strong">
                Tüm uzmanlar <IconArrowRight size={15} />
              </Link>
            </div>
            <div className="grid divide-y divide-line border-y border-line md:grid-cols-2 md:gap-x-10 md:divide-y-0 [&>*]:border-line md:[&>*]:border-b">
              {providers.items.map((p) => (
                <ProviderRow key={p.slug} p={p} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Gerçek değerlendirmeler (varsa) ───────── */}
      {reviews.length > 0 && (
        <section className="border-y border-line bg-surface py-16">
          <div className="container-x">
            <p className="eyebrow mb-6">Tamamlanan siparişlerden</p>
            <div className="grid gap-8 md:grid-cols-3">
              {reviews.map(({ r, buyerName, providerName, providerSlug }) => (
                <figure key={r.id} className="border-l-2 border-accent pl-5">
                  <div className="flex gap-0.5 text-accent" aria-label={`${r.rating} yıldız`}>
                    {Array.from({ length: r.rating }).map((_, i) => <IconStar key={i} filled size={13} />)}
                  </div>
                  <blockquote className="mt-3 text-[15.5px] leading-relaxed text-ink">“{r.comment}”</blockquote>
                  <figcaption className="mt-3 text-[13px] text-muted">
                    {buyerName.split(" ")[0]} {buyerName.split(" ")[1]?.[0] ? `${buyerName.split(" ")[1]![0]}.` : ""} →{" "}
                    <Link href={`/uzman/${providerSlug}`} className="underline underline-offset-2">{providerName}</Link>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Rehberler ───────── */}
      {posts.length > 0 && (
        <section className="container-x py-16 sm:py-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Rehberler</p>
              <h2 className="text-[26px] font-semibold sm:text-[30px]">Sipariş vermeden önce oku</h2>
            </div>
            <Link href="/blog" className="hidden items-center gap-1.5 text-[14.5px] font-medium hover:text-accent-strong sm:inline-flex">
              Tüm yazılar <IconArrowRight size={15} />
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {posts.map((p, i) => (
              <article key={p.id} className="group relative flex flex-col bg-paper p-6 transition-colors hover:bg-surface sm:p-7">
                <p className="eyebrow">{p.category} · {p.readingMinutes} dk</p>
                <h3 className={`mt-3 font-semibold ${i === 0 ? "text-[22px]" : "text-[18px]"}`}>
                  <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-[14.5px] text-ink-2">{p.excerpt}</p>
                <p className="mt-auto pt-6 text-[12.5px] text-muted">{p.publishedAt && formatDate(p.publishedAt)}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ───────── Uzman CTA ───────── */}
      <section className="container-x">
        <div className="grid items-center gap-8 rounded-lg border border-line bg-surface p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow mb-3">Uzmanlar ve ajanslar için</p>
            <h2 className="text-[28px] font-semibold sm:text-[34px]">İşini anlat, müşteri seni bulsun.</h2>
            <p className="mt-4 max-w-lg text-ink-2">Üyelik ücretsiz. Yalnızca tamamlanan siparişlerden %{commission} hizmet bedeli alınır; ödemen sipariş onaylandıktan sonra hesabına aktarılır.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/kayit?rol=uzman" size="lg">Uzman olarak kaydol</ButtonLink>
            <ButtonLink href="/uzman-ol" size="lg" variant="outline">Nasıl kazanırım?</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

/** Marka motifinin büyük ölçekli hali: sayfayı kesen iki eksen ve kesişimde kiremit kare. */
function HeroAxes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-y-0 right-[22%] hidden w-px bg-line lg:block" />
      <div className="absolute inset-x-0 top-[64%] hidden h-px bg-line lg:block" />
      <div className="absolute right-[22%] top-[64%] hidden h-14 w-14 -translate-y-1/2 translate-x-1/2 bg-accent lg:block" />
      <div className="absolute right-[calc(22%-140px)] top-[calc(64%-140px)] hidden h-[280px] w-[280px] rounded-full border border-line lg:block" />
    </div>
  );
}
