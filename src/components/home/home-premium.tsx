import Link from "next/link";
import { SearchBox } from "@/components/site/header-search";
import { CategoryGlyph, ProviderCard, ServiceCover, ServiceGrid } from "@/components/cards";
import { Avatar, Rating } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconArrowUpRight, IconBriefcase, IconChat, IconCheck, IconClock, IconDoc, IconLayers, IconLock, IconPin, IconRefresh, IconScale, IconSearch, IconShield } from "@/components/icons";
import { CITIES } from "@/lib/tr-cities";
import { LEVEL_LABEL } from "@/lib/order-status";
import { fileUrl, formatTRY } from "@/lib/utils";
import type { ServiceCardData } from "@/server/queries";
import { CityJump } from "./city-jump";
import { FeatureTile, Guides, QuickChips, SectionHead, StoriesAndReviews } from "./parts";
import type { HomeData } from "./types";

const POPULAR = [
  ["Web sitesi", "/web-sitesi-yaptirma"],
  ["Mobil uygulama", "/mobil-uygulama-gelistirme"],
  ["Logo ve marka tasarımı", "/logo-tasarimi"],
  ["E-ticaret", "/e-ticaret-sitesi"],
  ["SEO", "/seo-hizmeti"],
  ["Dijital reklam", "/kategori/dijital-pazarlama"],
  ["Video ve içerik", "/kategori/video-ve-icerik"],
  ["Yazılım", "/yazilim-gelistirme"],
  ["Yapay zekâ çözümleri", "/kategori/yapay-zeka"],
] as const;

/** Tema 1 · Modern Premium ana sayfası */
export function HomePremium({ d }: { d: HomeData }) {
  return (
    <>
      {/* ───────── Hero: ortalanmış arama + ürün arayüzü önizlemesi ───────── */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-80 [background-image:linear-gradient(var(--color-line-2)_1px,transparent_1px),linear-gradient(90deg,var(--color-line-2)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_72%)]" />
        <div className="container-x relative pt-12 text-center sm:pt-20">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-medium text-ink-2 shadow-xs">
            <span className="h-2 w-2 rounded-[3px] bg-accent-bright" aria-hidden />
            Türkiye’nin dijital hizmet pazaryeri
          </p>
          <h1 className="mx-auto max-w-[15ch] text-[length:var(--hero-size)] font-semibold leading-[1.02] tracking-[-0.035em]">
            İşin için{" "}
            <span className="relative whitespace-nowrap">
              doğru uzmanı
              <svg aria-hidden viewBox="0 0 300 18" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-0 h-[0.18em] w-full text-accent-bright">
                <path d="M3 13C60 5 140 3 297 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="hero-underline" />
              </svg>
            </span>{" "}
            bul.
          </h1>
          <p className="mx-auto mt-6 max-w-[60ch] text-[17px] text-ink-2 sm:text-[19px]">
            Web sitesi, mobil uygulama, tasarım, yazılım ve dijital hizmetler için uzmanları keşfet, teklifleri karşılaştır ve güvenle çalış.
          </p>
          <div className="mx-auto mt-9 max-w-[720px] text-left">
            <SearchBox size="lg" buttonLabel="Uzman bul" />
          </div>
          <div className="mx-auto max-w-[860px]"><QuickChips items={POPULAR} label="Popüler" center /></div>
        </div>
        {d.heroItems.length > 0 && (
          <div className="container-x relative mt-12 sm:mt-16">
            <ProductPreview items={d.heroItems} />
          </div>
        )}
      </section>

      {/* ───────── Öne çıkan hizmetler ───────── */}
      {d.showcase.length > 0 && (
        <section className="container-x py-16 sm:py-24">
          <SectionHead eyebrow={d.showcase === d.rails.bestselling ? "En çok satılanlar" : "Öne çıkan hizmetler"} title="Hemen sipariş verilebilen paketler" sub="Fiyatı, teslim süresi ve revizyon hakkı belli paketler; uzmanın puanı ve doğrulama durumu kartın üzerinde." href="/ara?siralama=yeni" cta="Tüm hizmetler" />
          <ServiceGrid items={d.showcase.slice(0, 8)} rail />
        </section>
      )}

      {/* ───────── Kategoriler ───────── */}
      <section className="border-y border-line bg-surface py-16 sm:py-24">
        <div className="container-x">
          <SectionHead eyebrow="Hizmet alanları" title="Ne yaptırmak istiyorsun?" sub="Her alanda hazır paketler, fiyat aralıkları ve o işi daha önce yapmış uzmanlar." href="/kategoriler" cta="Tüm kategoriler" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {d.tree.slice(0, 8).map((c) => (
              <article key={c.id} className="card card-hover group relative flex flex-col p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <CategoryGlyph slug={c.slug} size={64} className="h-[40px] w-[54px] rounded-lg transition-transform duration-500 ease-out group-hover:scale-105 sm:h-[48px] sm:w-[64px]" />
                  <IconArrowUpRight size={16} className="hidden text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:block" />
                </div>
                <h3 className="mt-4 text-[15.5px] font-semibold sm:text-[17px]">
                  <Link href={`/kategori/${c.slug}`} className="after:absolute after:inset-0 after:rounded-xl">{c.name}</Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-[12.5px] text-muted sm:text-[13.5px]">{c.shortDescription}</p>
                <p className="mt-3 text-[12px] font-medium text-faint">{c.children.length} alt kategori</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Güven sistemi ───────── */}
      <section className="container-x py-16 sm:py-24">
        <SectionHead eyebrow="Güven sistemi" title="Ödemen ve işin baştan sona korumada" sub="Ödeme, iletişim, teslim ve itiraz aynı sipariş sayfasında; kim ne zaman ne yaptı kayıt altında." href="/nasil-calisir" cta="Nasıl çalışır?" />
        <div className="grid gap-4 lg:grid-cols-3">
          <EscrowCard />
          <FeatureTile icon={<IconShield size={19} />} tone="bg-trust-soft text-trust" title="Doğrulanmış uzmanlar" text="Kimlik ve vergi bilgisi kontrol edilen uzmanlar rozetle gösterilir; profilde başarı oranı ve yanıt süresi görünür." />
          <FeatureTile icon={<IconLock size={19} />} tone="bg-accent-soft text-accent-strong" title="Sipariş koruması" text="Kapsam, teslim tarihi ve revizyon hakkı sipariş anında sabitlenir. Şartlara uyulmazsa iade talep edebilirsin." />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FeatureTile icon={<IconRefresh size={19} />} tone="bg-info-soft text-info" title="Revizyon sistemi" text="Paketteki revizyon hakkı sipariş sayfasında görünür; düzeltme talebin uzmana kayıtlı olarak iletilir." />
          <FeatureTile icon={<IconChat size={19} />} tone="bg-paper-2 text-ink" title="Platform içi mesajlaşma" text="Her siparişin kendi mesaj ve dosya alanı var. Konuşmalar ve teslimatlar tek yerde saklanır." />
          <FeatureTile icon={<IconScale size={19} />} tone="bg-paper-2 text-ink" title="Uyuşmazlık çözümü" text="Anlaşmazlıkta itiraz açılır; Eksen ekibi sipariş kayıtlarını inceleyip tarafları dinleyerek karar verir." />
        </div>
      </section>

      {/* ───────── Doğrulanmış uzmanlar ───────── */}
      {d.providers.length > 0 && (
        <section className="border-y border-line bg-surface py-16 sm:py-24">
          <div className="container-x">
            <SectionHead eyebrow="Uzmanlar" title="Kimliği doğrulanmış uzmanlar ve ajanslar" sub="Puanlar yalnızca tamamlanan siparişlerden gelir; başlangıç fiyatı uzmanın yayındaki paketlerinden hesaplanır." href="/uzmanlar" cta="Tüm uzmanlar" />
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 [&>*]:w-[82%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto">
              {d.providers.map((p) => <ProviderCard key={p.slug} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ───────── İki yol ───────── */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card flex flex-col p-7 sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-paper-2 text-ink"><IconLayers size={20} /></span>
            <p className="eyebrow mt-6">İşin net mi?</p>
            <h2 className="mt-2 text-[24px] font-semibold sm:text-[28px]">Hazır paketi seç, bugün başlasın.</h2>
            <p className="mt-3 max-w-sm text-ink-2">Fiyatı, teslim süresi ve revizyon hakkı belli paketler. Uzmana sipariş öncesi soru da sorabilirsin.</p>
            <div className="mt-auto pt-8"><ButtonLink href="/kategoriler">Paketlere göz at</ButtonLink></div>
          </div>
          <div className="card flex flex-col bg-paper-2 p-7 sm:p-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-ink shadow-xs"><IconDoc size={20} /></span>
            <p className="eyebrow mt-6">Kapsam belirsiz mi?</p>
            <h2 className="mt-2 text-[24px] font-semibold sm:text-[28px]">Projeni yaz, uzmanlar teklif versin.</h2>
            <p className="mt-3 max-w-sm text-ink-2">Bütçe aralığını ve tarihi belirt; gelen teklifleri fiyat, süre ve portföye göre yan yana karşılaştır.</p>
            <div className="mt-auto pt-8"><ButtonLink href="/proje-olustur" variant="accent">Ücretsiz proje oluştur</ButtonLink></div>
          </div>
        </div>
      </section>

      {/* ───────── İller ───────── */}
      <section className="container-x pb-16 sm:pb-24">
        <div className="card grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow mb-2 flex items-center gap-1.5"><IconPin size={14} /> 81 il</p>
            <h2 className="text-[24px] font-semibold sm:text-[26px]">İlinizdeki uzmanlar ve ilinize özel tavsiyeler</h2>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {CITIES.filter((c) => ["istanbul", "ankara", "izmir", "bursa", "antalya", "konya", "adana", "gaziantep", "kocaeli", "mersin", "kayseri", "eskisehir"].includes(c.slug)).map((c) => (
                <li key={c.slug}><Link href={`/il/${c.slug}`} className="chip">{c.name}</Link></li>
              ))}
              <li><Link href="/il" className="chip !border-ink !bg-ink !text-white">Tüm 81 il <IconArrowRight size={13} /></Link></li>
            </ul>
          </div>
          <CityJump />
        </div>
      </section>

      <StoriesAndReviews d={d} />
      <Guides d={d} />

      {/* ───────── Uzman çağrısı ───────── */}
      <section className="container-x">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-2xl bg-ink p-8 text-white sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div aria-hidden className="pointer-events-none absolute -right-4 top-10 h-40 w-40 rounded-full border border-white/10" />
          <div className="relative">
            <p className="eyebrow mb-3 flex items-center gap-1.5 !text-accent-bright"><IconBriefcase size={14} /> Uzmanlar ve ajanslar için</p>
            <h2 className="text-[28px] font-semibold sm:text-[36px]">Uzmanlığını kazanca dönüştür.</h2>
            <p className="mt-4 max-w-lg text-white/70">Üyelik ücretsiz. Yalnızca tamamlanan siparişlerden %{d.commission} hizmet bedeli alınır; ödemen sipariş onaylandıktan sonra hesabına aktarılır.</p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/kayit?rol=uzman" size="lg" variant="accent">Uzman olarak katıl</ButtonLink>
            <ButtonLink href="/uzman-ol" size="lg" variant="outline" className="!border-white/20 !bg-white/5 !text-white hover:!bg-white/10">Nasıl kazanırım?</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

/** Hero altındaki ürün arayüzü önizlemesi: arama araç çubuğu ve gerçek hizmetlerden kartlar. */
function ProductPreview({ items }: { items: ServiceCardData[] }) {
  return (
    <div className="relative mx-auto max-w-[1080px]">
      <div className="overflow-hidden rounded-t-2xl border border-b-0 border-line bg-paper shadow-pop">
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-3 sm:px-5" aria-hidden>
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-paper-2 px-3.5 py-2 text-[13px] text-muted sm:max-w-[300px]"><IconSearch size={14} /> kurumsal web sitesi</span>
          <span className="hidden rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 sm:inline">Teslim: 2 hafta içinde</span>
          <span className="hidden rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-2 md:inline">Doğrulanmış uzman</span>
          <span className="ml-auto hidden text-[12.5px] text-muted sm:inline">Sırala: Önerilen</span>
        </div>
        <div className="-mx-0 flex snap-x gap-3 overflow-x-auto p-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-5 lg:grid-cols-3 [&>*]:w-[80%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto">
          {items.slice(0, 3).map((s, i) => <PreviewCard key={s.id} s={s} className={i === 2 ? "sm:hidden lg:flex" : ""} />)}
        </div>
      </div>
      <div className="absolute -right-3 top-16 z-10 hidden w-[270px] rounded-xl border border-line bg-surface p-4 text-left shadow-pop xl:block">
        <p className="flex items-center gap-2 text-[13px] font-semibold"><IconLock size={14} className="text-accent" /> Ödemen güvencede</p>
        <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Sipariş adımları">
          {["Öde", "Çalışma", "Teslim", "Onay"].map((st, i) => (
            <li key={st}>
              <span className={`block h-1 rounded-full ${i < 2 ? "bg-accent-bright" : "bg-line"}`} />
              <span className={`mt-1.5 block text-[11px] ${i < 2 ? "text-ink" : "text-faint"}`}>{st}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-snug text-muted"><IconCheck size={13} className="mt-px shrink-0 text-trust" /> Tutar, teslimatı onaylayana kadar uzmana aktarılmaz.</p>
      </div>
    </div>
  );
}

function PreviewCard({ s, className }: { s: ServiceCardData; className?: string }) {
  return (
    <Link href={`/hizmet/${s.slug}`} className={`group flex flex-col rounded-xl border border-line bg-surface p-2 text-left shadow-card transition-shadow hover:shadow-lift ${className ?? ""}`}>
      <div className="overflow-hidden rounded-lg">
        <ServiceCover rootSlug={s.rootSlug} coverId={s.coverId} title={s.title} priority aspect="aspect-[16/8]" className="transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="px-2 pb-1.5 pt-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={s.providerName} src={fileUrl(s.providerAvatarId)} size={30} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-[13px] font-semibold">{s.providerName}{s.providerVerified && <IconShield size={13} className="shrink-0 text-trust" aria-label="Doğrulanmış uzman" />}</p>
            <p className="truncate text-[11.5px] text-muted">{s.providerHeadline || LEVEL_LABEL[s.providerLevel]}</p>
          </div>
        </div>
        <p className="mt-2.5 line-clamp-2 min-h-[2.6em] text-[14px] font-semibold leading-snug">{s.title}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[12.5px] text-muted">
          <Rating value={s.ratingAvg} count={s.ratingCount} />
          <span className="flex items-center gap-1"><IconClock size={12} /> {s.minDeliveryDays} gün</span>
        </div>
        <p className="mt-2.5 flex items-baseline justify-between border-t border-line-2 pt-2.5"><span className="text-[12px] text-muted">Başlangıç</span><span className="price text-[17px]">{formatTRY(s.startingPriceKurus)}</span></p>
      </div>
    </Link>
  );
}

/** Güvenli ödeme kartı: siparişin para akışını ürün arayüzü diliyle gösterir. */
function EscrowCard() {
  const steps: [string, string, "done" | "now" | "next"][] = [
    ["Sipariş verildi", "Paket ve kapsam sabitlendi", "done"],
    ["Ödeme havuz hesabında", "Uzmana aktarılmadı, güvencede bekliyor", "now"],
    ["Teslimat", "Dosyalar sipariş sayfasına yüklenir", "next"],
    ["Onay", "Onayladığında ödeme uzmana geçer", "next"],
  ];
  return (
    <div className="card relative flex flex-col overflow-hidden p-7 sm:p-9 lg:col-span-2 lg:row-span-2">
      <p className="eyebrow">Güvenli ödeme</p>
      <h3 className="mt-2 max-w-md text-[26px] font-semibold sm:text-[30px]">İş tamamlanmadan ödeme uzmana aktarılmaz.</h3>
      <p className="mt-3 max-w-lg text-[15px] text-muted">Sipariş verdiğinde ödeme lisanslı ödeme kuruluşunun havuz hesabına alınır. Uzman teslim eder, sen onaylarsın; para ancak o zaman uzmana aktarılır.</p>
      <ol className="mt-8 rounded-xl border border-line bg-paper p-2" aria-label="Örnek sipariş akışı">
        {steps.map(([t, sub, st], i) => (
          <li key={t} className={`flex items-center gap-3.5 rounded-lg px-3.5 py-3 ${st === "now" ? "bg-surface shadow-card" : ""}`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${st === "done" ? "bg-trust-soft text-trust" : st === "now" ? "bg-accent text-white" : "border border-line bg-surface text-faint"}`}>
              {st === "done" ? <IconCheck size={13} /> : i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[14.5px] font-semibold ${st === "next" ? "text-muted" : ""}`}>{t}</span>
              <span className="block truncate text-[12.5px] text-muted">{sub}</span>
            </span>
            {st === "now" && <span className="hidden rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent-strong sm:inline">Güvencede</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
