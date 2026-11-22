import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryTree, homeReviews, homeServiceRails, homeStories, latestPosts, listProviders } from "@/server/queries";
import { getSettings } from "@/server/settings";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { and, eq, or, isNull, gt } from "drizzle-orm";
import { SearchBox } from "@/components/site/header-search";
import { ServiceGrid, ProviderRow, CategoryGlyph } from "@/components/cards";
import { HeroShowcase } from "@/components/home/hero-showcase";
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
  const [tree, rails, providers, reviews, posts, settings, stories] = await Promise.all([
    getCategoryTree(),
    homeServiceRails(),
    listProviders({ verifiedOnly: true, limit: 6 }),
    homeReviews(),
    latestPosts(3),
    getSettings(),
    homeStories(),
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
        <HeroBackdrop />
        <div className="container-x relative grid grid-cols-1 items-center gap-12 pb-14 pt-10 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:pb-24">
          <div className="min-w-0">
            <p className="eyebrow mb-5 flex items-center gap-2">
              <span className="h-2 w-2 bg-accent" /> Türkiye’nin dijital hizmet pazaryeri
            </p>
            <h1 className="max-w-[17ch] text-[40px] font-semibold leading-[1.04] tracking-[-0.038em] sm:text-[56px] xl:text-[64px]">
              Dijital projeni hayata geçirecek{" "}
              <span className="relative whitespace-nowrap">
                doğru uzmanı
                <svg aria-hidden viewBox="0 0 300 18" preserveAspectRatio="none" className="absolute -bottom-[0.08em] left-0 h-[0.2em] w-full text-accent">
                  <path d="M3 13C60 5 140 3 297 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="hero-underline" />
                </svg>
              </span>{" "}
              bul.
            </h1>
            <p className="mt-7 max-w-[50ch] text-[17px] text-ink-2 sm:text-[19px]">
              Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini tek platformda keşfet.
            </p>
            <div className="mt-9 max-w-[640px]">
              <SearchBox size="lg" />
              <div className="-mx-4 mt-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-y-2 sm:px-0">
                <span className="mr-1 shrink-0 text-[13px] text-muted">Sık arananlar</span>
                {QUICK.map(([label, href]) => (
                  <Link key={href} href={href} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-[13.5px] text-ink-2 transition-colors hover:border-ink hover:bg-ink hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <HeroShowcase items={[...rails.featured, ...rails.bestselling, ...rails.newest].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).slice(0, 3)} />
        </div>
        <div className="relative border-t border-line bg-surface/60">
          <dl className="container-x grid grid-cols-1 divide-line text-[14px] sm:grid-cols-3 sm:divide-x">
            {[
              ["01", "Onaylayana kadar korunan ödeme", "Para, teslimatı kabul edene kadar uzmana geçmez."],
              ["02", "Yalnızca gerçek değerlendirme", "Yorum yazabilmek için siparişin tamamlanmış olması gerekir."],
              ["03", "Hazır paket ya da teklif", "Paket satın al veya projeni yaz, teklifleri karşılaştır."],
            ].map(([n, t, d]) => (
              <div key={n} className="py-5 sm:px-6 sm:first:pl-0">
                <dt className="font-medium text-ink"><span className="num mr-3 inline-block w-[22px] text-[12px] text-accent">{n}</span>{t}</dt>
                <dd className="mt-1 pl-[34px] text-muted">{d}</dd>
              </div>
            ))}
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
                <Link href={`/kategori/${c.slug}`} className="grid grid-cols-[56px_1fr_auto] items-center gap-x-4 py-5 sm:grid-cols-[72px_minmax(0,250px)_1fr_auto]">
                  <CategoryGlyph slug={c.slug} size={64} className="h-12 w-14 transition-transform duration-500 ease-out group-hover:-rotate-2 group-hover:scale-105 sm:h-[54px] sm:w-[72px]" />
                  <span>
                    <span className="block font-display text-[20px] font-semibold tracking-[-0.02em] sm:text-[23px]">{c.name}</span>
                    <span className="num block text-[11.5px] text-faint">{String(i + 1).padStart(2, "0")} · {c.children.length} alt kategori</span>
                  </span>
                  <span className="col-start-2 text-[14px] text-muted sm:col-start-3">{c.shortDescription}</span>
                  <IconArrowUpRight size={18} className="col-start-3 row-start-1 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:col-start-4" />
                </Link>
                <div className="-mt-2 hidden flex-wrap gap-x-4 gap-y-1 pb-5 pl-[88px] sm:flex">
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

      {/* ───────── Öne çıkan hizmetler (ücretli tanıtım; etiketli) ───────── */}
      {rails.featured.length >= 4 && (
        <section className="container-x py-16">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div><p className="eyebrow mb-2">Öne çıkanlar</p><h2 className="text-[24px] font-semibold">Uzmanların öne çıkardığı hizmetler</h2></div>
            <p className="hidden max-w-xs text-right text-[12.5px] text-muted sm:block">Bu alan ücretli tanıtım içerir. Sıralama puan veya satışa göre değildir.</p>
          </div>
          <ServiceGrid items={rails.featured} />
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
              <span className="escrow-token absolute top-0 z-10 h-[23px] w-[23px] items-center justify-center bg-accent font-mono text-[12px] text-white shadow-[0_0_0_4px_var(--color-ink)]" aria-hidden title="Ödemen">₺</span>
              {[
                ["Seç ya da tarif et", "Hazır paketi seç veya projeni yazıp teklif topla."],
                ["Güvenle öde", "Ödeme havuz hesabında bekler, uzman işe başlar."],
                ["Teslim al", "Dosyalar ve mesajlar sipariş sayfasında toplanır. Gerekirse revizyon iste."],
                ["Onayla", "Onayladığında ödeme uzmana aktarılır, değerlendirmeni yazarsın."],
              ].map(([t, d], i) => (
                <li key={t} className="relative pb-8 pl-10 sm:pb-0 sm:pl-0 sm:pr-6 sm:pt-10">
                  <span className={`absolute left-0 top-0 flex h-[23px] w-[23px] items-center justify-center font-mono text-[11px] ${i === 3 ? "border border-accent bg-ink text-accent sm:border-white/40 sm:text-white" : "border border-white/40 bg-ink"}`}>{i + 1}</span>
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

      {/* ───────── Başarı hikâyeleri (yalnızca tamamlanmış gerçek siparişlerden, editör seçimi) ───────── */}
      {stories.length > 0 && (
        <section className="container-x pb-16 sm:pb-24">
          <p className="eyebrow mb-3">Başarı hikâyeleri</p>
          <h2 className="mb-8 max-w-xl text-[28px] font-semibold">Eksen üzerinden tamamlanan işler</h2>
          <div className={`grid gap-px overflow-hidden rounded-lg border border-line bg-line ${stories.length === 1 ? "max-w-2xl" : stories.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {stories.map((st) => {
              const days = st.startedAt && st.completedAt ? Math.max(1, Math.round((+st.completedAt - +st.startedAt) / 864e5)) : st.deliveryDays;
              return (
                <article key={st.r.id} className="flex flex-col bg-surface p-7">
                  <p className="num text-[12px] text-accent-strong">{days} günde tamamlandı · {st.r.rating}/5</p>
                  <h3 className="mt-3 text-[19px] font-semibold">{st.r.storyTitle ?? st.orderTitle}</h3>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-2">“{st.r.comment}”</blockquote>
                  <p className="mt-5 border-t border-line-2 pt-4 text-[13px] text-muted">
                    {st.buyerName.split(" ")[0]} {st.buyerName.split(" ")[1]?.[0] ? `${st.buyerName.split(" ")[1]![0]}.` : ""} · uzman <Link href={`/uzman/${st.providerSlug}`} className="text-ink underline underline-offset-2">{st.providerName}</Link>
                  </p>
                </article>
              );
            })}
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
                  <div className="flex gap-0.5 text-accent" role="img" aria-label={`${r.rating} yıldız`}>
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

/** Hero zemini: noktalı ızgara (kâğıt dokusu) ve marka ekseni; içerikten uzak durur. */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-[0.55] [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
    </div>
  );
}
