import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryTree, homeReviews, homeServiceRails, homeStories, latestPosts, listProviders } from "@/server/queries";
import { getSettings } from "@/server/settings";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { and, eq, or, isNull, gt } from "drizzle-orm";
import { SearchBox } from "@/components/site/header-search";
import { ServiceGrid, ProviderCard, CategoryGlyph } from "@/components/cards";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { CityJump } from "@/components/home/city-jump";
import { CITIES } from "@/lib/tr-cities";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconArrowUpRight, IconStar, IconShield, IconCheck, IconLayers, IconBriefcase, IconDoc, IconPin, IconChat } from "@/components/icons";
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
  // Başarı hikâyesi olarak gösterilen yorum, aşağıdaki değerlendirmelerde tekrar edilmez
  const storyIds = new Set(stories.map((st) => st.r.id));
  const otherReviews = reviews.filter(({ r }) => !storyIds.has(r.id));

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
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <HeroBackdrop />
        <div className="container-x relative grid grid-cols-1 items-center gap-12 pb-12 pt-10 sm:pb-16 sm:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:pb-20">
          <div className="min-w-0">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink-2 shadow-xs">
              <span className="h-2 w-2 rounded-[3px] bg-accent" aria-hidden />
              Türkiye’nin dijital hizmet pazaryeri
            </p>
            <h1 className="max-w-[17ch] text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[58px] xl:text-[66px]">
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
                  <Link key={href} href={href} className="chip shrink-0 shadow-xs">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <HeroShowcase items={[...rails.featured, ...rails.bestselling, ...rails.newest].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).slice(0, 3)} />
        </div>
        <div className="container-x relative pb-12 sm:pb-16">
          <dl className="card grid grid-cols-1 divide-y divide-line-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {([
              [IconShield, "Onaylayana kadar korunan ödeme", "Para, teslimatı kabul edene kadar uzmana geçmez.", "bg-trust-soft text-trust"],
              [IconCheck, "Yalnızca gerçek değerlendirme", "Yorum için siparişin tamamlanmış olması gerekir.", "bg-accent-soft text-accent-strong"],
              [IconLayers, "Hazır paket ya da teklif", "Paket satın al veya projeni yaz, teklifleri karşılaştır.", "bg-info-soft text-info"],
            ] as const).map(([Icon, t, d, tone]) => (
              <div key={t} className="flex gap-4 p-5 sm:p-6">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span>
                <div>
                  <dt className="text-[15px] font-semibold text-ink">{t}</dt>
                  <dd className="mt-0.5 text-[13.5px] text-muted">{d}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Kategoriler: kart ızgarası ───────── */}
      <section className="container-x py-16 sm:py-24">
        <SectionHead eyebrow="Hizmet alanları" title="Ne yaptırmak istiyorsun?" sub="Her alanda hazır paketler, fiyat aralıkları ve o işi daha önce yapmış uzmanlar." href="/kategoriler" cta="Tüm kategoriler" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {tree.map((c) => (
            <article key={c.id} className="card card-hover group relative flex flex-col p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <CategoryGlyph slug={c.slug} size={72} className="h-[42px] w-[56px] rounded-xl transition-transform duration-500 ease-out group-hover:scale-105 sm:h-[54px] sm:w-[72px]" />
                <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-faint transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white sm:flex">
                  <IconArrowUpRight size={16} />
                </span>
              </div>
              <h3 className="mt-4 text-[16px] font-semibold sm:mt-5 sm:text-[20px]">
                <Link href={`/kategori/${c.slug}`} className="after:absolute after:inset-0 after:rounded-[18px]">{c.name}</Link>
              </h3>
              <p className="mt-1 text-[12.5px] text-muted sm:mt-1.5 sm:text-[14px]">{c.children.length} alt kategori<span className="hidden sm:inline"> · {c.shortDescription}</span></p>
              <ul className="relative z-10 mt-4 hidden flex-wrap gap-1.5 sm:flex">
                {c.children.slice(0, 4).map((sc) => (
                  <li key={sc.id}>
                    <Link href={`/kategori/${sc.slug}`} className="block rounded-full bg-paper-2 px-2.5 py-1 text-[12.5px] text-ink-2 transition-colors hover:bg-ink hover:text-white">{sc.name}</Link>
                  </li>
                ))}
                {c.children.length > 4 && <li className="px-1.5 py-1 text-[12.5px] text-faint">+{c.children.length - 4}</li>}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── Hizmet vitrini ───────── */}
      {showcase.length > 0 && (
        <section className="border-y border-line bg-surface py-16 sm:py-24">
          <div className="container-x">
            <SectionHead eyebrow={showcase === rails.bestselling ? "En çok satılanlar" : "Yeni eklenen hizmetler"} title="Hemen sipariş verilebilen paketler" sub="Fiyatı, teslim süresi ve revizyon hakkı belli paketler." href="/ara?siralama=yeni" cta="Tümünü gör" />
            <ServiceGrid items={showcase.slice(0, 8)} rail />
          </div>
        </section>
      )}

      {/* ───────── Öne çıkan hizmetler (ücretli tanıtım; etiketli) ───────── */}
      {rails.featured.length >= 4 && (
        <section className="container-x py-16 sm:py-20">
          <SectionHead eyebrow="Öne çıkanlar" title="Uzmanların öne çıkardığı hizmetler" sub="Bu alan ücretli tanıtım içerir. Sıralama puan veya satışa göre değildir." />
          <ServiceGrid items={rails.featured} rail />
        </section>
      )}

      {/* ───────── Neden Eksen: bento ızgara ───────── */}
      <section className="container-x py-16 sm:py-24">
        <SectionHead eyebrow="Neden Eksen?" title="Güvenle iş yaptırmanın kuralları baştan belli" sub="Ödeme, iletişim, teslim ve itiraz aynı sipariş sayfasında; kim ne zaman ne yaptı kayıt altında." href="/nasil-calisir" cta="Nasıl çalışır?" />
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Büyük kutu: ödeme akışı */}
          <div className="relative overflow-hidden rounded-[24px] bg-ink p-7 text-white sm:p-10 lg:col-span-2 lg:row-span-2">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
            <p className="eyebrow relative !text-accent">Ödeme güvencesi</p>
            <h3 className="relative mt-2 max-w-lg text-[28px] font-semibold sm:text-[36px]">Ödemen, iş bitene kadar ortada durur.</h3>
            <p className="relative mt-4 max-w-lg text-[15.5px] text-white/70">
              Sipariş verdiğinde ödeme lisanslı ödeme kuruluşunun havuz hesabına alınır. Uzman teslim eder, sen onaylarsın; para ancak o zaman uzmana aktarılır.
            </p>
            <ol className="relative mt-10 grid gap-3 sm:grid-cols-4">
              <span className="escrow-token absolute -top-3 z-10 h-[23px] w-[23px] items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white shadow-[0_0_0_4px_var(--color-ink)]" aria-hidden title="Ödemen">₺</span>
              {[
                ["Seç ya da tarif et", "Hazır paketi seç veya projeni yazıp teklif topla."],
                ["Güvenle öde", "Ödeme havuz hesabında bekler, uzman işe başlar."],
                ["Teslim al", "Dosyalar ve mesajlar sipariş sayfasında. Gerekirse revizyon iste."],
                ["Onayla", "Onayladığında ödeme uzmana aktarılır, değerlendirmeni yazarsın."],
              ].map(([t, d], i) => (
                <li key={t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${i === 1 ? "bg-accent text-white" : "bg-white/10 text-white"}`}>{i + 1}</span>
                  <p className="mt-4 text-[15.5px] font-semibold">{t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{d}</p>
                </li>
              ))}
            </ol>
          </div>
          <BentoTile icon={<IconShield size={20} />} tone="bg-trust-soft text-trust" title="Doğrulanmış uzmanlar" text="Kimlik ve vergi bilgisi kontrol edilen uzmanlar rozetle gösterilir. Profilde başarı oranı ve yanıt süresi görünür." />
          <BentoTile icon={<IconStar size={20} />} tone="bg-accent-soft text-accent-strong" title="Yalnızca gerçek değerlendirmeler" text="Yorum yazabilmek için siparişin tamamlanmış olması gerekir. Uzman yorumu silemez, yalnızca yanıt verebilir." />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <BentoTile icon={<IconChat size={20} />} tone="bg-info-soft text-info" title="Her şey tek sayfada" text="Mesajlar, dosyalar, revizyonlar ve teslimat sipariş sayfasında; anlaşmazlıkta Eksen ekibi kayıtlara bakarak karar verir." />
          <BentoTile icon={<IconPin size={20} />} tone="bg-paper-2 text-ink" title="81 ilde yerel" text="İlinizdeki uzmanlar ve sektörünüze göre tavsiyeler. Dijital işler uzaktan yürütüldüğü için her ilden uzmanla çalışabilirsiniz." href="/il" cta="İlinizi seçin" />
          <BentoTile icon={<IconBriefcase size={20} />} tone="bg-paper-2 text-ink" title="Şirketler için" text="Birden fazla işi tek hesap yöneticisi, yazılı çalışma şartları ve düzenli kayıtla yürütün." href="/kurumsal" cta="Kurumsal üyelik" />
        </div>
      </section>

      {/* ───────── İki yol ───────── */}
      <section className="container-x pb-16 sm:pb-24">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card flex flex-col p-7 sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper-2 text-ink"><IconLayers size={20} /></span>
            <p className="eyebrow mt-6">İşin net mi?</p>
            <h2 className="mt-2 text-[26px] font-semibold sm:text-[28px]">Hazır paketi seç, bugün başlasın.</h2>
            <p className="mt-3 max-w-sm text-ink-2">Fiyatı, teslim süresi ve revizyon hakkı belli paketler. Uzmana sipariş öncesi soru da sorabilirsin.</p>
            <div className="mt-auto pt-8"><ButtonLink href="/kategoriler" variant="primary">Paketlere göz at</ButtonLink></div>
          </div>
          <div className="flex flex-col rounded-[18px] bg-ink p-7 text-white sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"><IconDoc size={20} /></span>
            <p className="eyebrow mt-6 !text-accent">Kapsam belirsiz mi?</p>
            <h2 className="mt-2 text-[26px] font-semibold sm:text-[28px]">Projeni yaz, uzmanlar teklif versin.</h2>
            <p className="mt-3 max-w-sm text-white/70">Bütçe aralığını ve tarihi belirt; gelen teklifleri fiyat, süre ve portföye göre yan yana karşılaştır.</p>
            <div className="mt-auto pt-8"><ButtonLink href="/proje-olustur" variant="accent">Ücretsiz proje oluştur</ButtonLink></div>
          </div>
        </div>
      </section>

      {/* ───────── İlinize göre ───────── */}
      <section className="container-x pb-16 sm:pb-24">
        <div className="card grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow mb-2 flex items-center gap-1.5"><IconPin size={14} /> 81 il</p>
            <h2 className="text-[26px] font-semibold">İlinizdeki uzmanlar ve ilinize özel tavsiyeler</h2>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {CITIES.filter((c) => ["istanbul", "ankara", "izmir", "bursa", "antalya", "konya", "adana", "gaziantep", "kocaeli", "mersin", "kayseri", "eskisehir"].includes(c.slug)).map((c) => (
                <li key={c.slug}><Link href={`/il/${c.slug}`} className="chip">{c.name}</Link></li>
              ))}
              <li><Link href="/il" className="chip !border-ink !bg-ink !text-white hover:!bg-[#262a31]">Tüm 81 il <IconArrowRight size={13} /></Link></li>
            </ul>
          </div>
          <CityJump />
        </div>
      </section>

      {/* ───────── Doğrulanmış uzmanlar ───────── */}
      {providers.items.length > 0 && (
        <section className="container-x pb-16 sm:pb-24">
          <SectionHead eyebrow="Doğrulanmış uzmanlar" title="Kimliği ve vergi bilgisi doğrulanan uzmanlar" sub="Doğrulama rozeti, uzmanın kimlik ve iletişim bilgilerinin Eksen ekibince kontrol edildiğini gösterir." href="/uzmanlar" cta="Tüm uzmanlar" />
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&>*]:w-[82%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto">
            {providers.items.map((p) => (
              <ProviderCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── Başarı hikâyeleri (yalnızca tamamlanmış gerçek siparişlerden, editör seçimi) ───────── */}
      {stories.length > 0 && (
        <section className="container-x pb-16 sm:pb-24">
          <SectionHead eyebrow="Başarı hikâyeleri" title="Eksen üzerinden tamamlanan işler" />
          <div className={`grid gap-4 ${stories.length === 1 ? "max-w-2xl" : stories.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {stories.map((st) => {
              const days = st.startedAt && st.completedAt ? Math.max(1, Math.round((+st.completedAt - +st.startedAt) / 864e5)) : st.deliveryDays;
              return (
                <article key={st.r.id} className="card flex flex-col p-7">
                  <p className="flex items-center gap-2 text-[12.5px] font-medium"><span className="rounded-full bg-trust-soft px-2 py-0.5 text-trust">{days} günde tamamlandı</span><span className="flex items-center gap-1 text-accent-strong"><IconStar filled size={12} /> {st.r.rating}/5</span></p>
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
      {otherReviews.length > 0 && (
        <section className="border-y border-line bg-surface py-16 sm:py-20">
          <div className="container-x">
            <SectionHead eyebrow="Tamamlanan siparişlerden" title="Müşteriler ne diyor" sub="Yalnızca siparişi tamamlanan müşteriler değerlendirme yazabilir." />
            <div className="grid gap-4 md:grid-cols-3">
              {otherReviews.map(({ r, buyerName, providerName, providerSlug }) => (
                <figure key={r.id} className="rounded-[18px] border border-line bg-paper p-6">
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
          <SectionHead eyebrow="Rehberler" title="Sipariş vermeden önce oku" href="/blog" cta="Tüm yazılar" />
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((p, i) => (
              <article key={p.id} className="card card-hover group relative flex flex-col p-6 sm:p-7">
                <p className="eyebrow">{p.category} · {p.readingMinutes} dk</p>
                <h3 className={`mt-3 font-semibold ${i === 0 ? "text-[21px]" : "text-[18px]"}`}>
                  <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:rounded-[18px]">{p.title}</Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-[14.5px] text-ink-2">{p.excerpt}</p>
                <p className="mt-auto flex items-center justify-between pt-6 text-[12.5px] text-muted">{p.publishedAt && formatDate(p.publishedAt)}<span className="flex items-center gap-1 font-medium text-ink transition-colors group-hover:text-accent-strong">Oku <IconArrowRight size={13} /></span></p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ───────── Uzman CTA ───────── */}
      <section className="container-x">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[24px] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div aria-hidden className="pointer-events-none absolute -right-4 top-10 h-40 w-40 rounded-full border border-white/10" />
          <div className="relative">
            <p className="eyebrow mb-3 flex items-center gap-1.5 !text-accent"><IconBriefcase size={14} /> Uzmanlar ve ajanslar için</p>
            <h2 className="text-[28px] font-semibold sm:text-[36px]">İşini anlat, müşteri seni bulsun.</h2>
            <p className="mt-4 max-w-lg text-white/70">Üyelik ücretsiz. Yalnızca tamamlanan siparişlerden %{commission} hizmet bedeli alınır; ödemen sipariş onaylandıktan sonra hesabına aktarılır.</p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/kayit?rol=uzman" size="lg" variant="accent">Uzman olarak kaydol</ButtonLink>
            <ButtonLink href="/uzman-ol" size="lg" variant="outline" className="!border-white/20 !bg-white/5 !text-white hover:!bg-white/10">Nasıl kazanırım?</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

/** Hero zemini: marka eksenlerini çağrıştıran ince ızgara, aşağı doğru kaybolur. */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(var(--color-line-2)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-2)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_70%)]" />
    </div>
  );
}

/** Bento ızgarasındaki küçük kutu. */
function BentoTile({ icon, tone, title, text, href, cta }: { icon: React.ReactNode; tone: string; title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className={`card relative flex flex-col p-6 sm:p-7 ${href ? "card-hover group" : ""}`}>
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <h3 className="mt-5 text-[18px] font-semibold">
        {href ? <Link href={href} className="after:absolute after:inset-0 after:rounded-[18px]">{title}</Link> : title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{text}</p>
      {href && cta && <p className="mt-auto flex items-center gap-1.5 pt-5 text-[14px] font-medium text-ink transition-colors group-hover:text-accent-strong">{cta} <IconArrowRight size={14} /></p>}
    </div>
  );
}

/** Bölüm başlığı: etiket, başlık, açıklama ve sağda isteğe bağlı bağlantı. */
function SectionHead({ eyebrow, title, sub, href, cta }: { eyebrow: string; title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-10">
      <div className="max-w-2xl">
        <p className="eyebrow mb-2.5">{eyebrow}</p>
        <h2 className="text-[28px] font-semibold sm:text-[36px]">{title}</h2>
        {sub && <p className="mt-3 text-[15.5px] text-muted">{sub}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-[14px] font-medium shadow-xs transition-colors hover:border-ink">
          {cta} <IconArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
