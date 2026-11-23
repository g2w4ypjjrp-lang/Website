import Link from "next/link";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, ProviderCard, ServiceCard } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconChat, IconCheck, IconLayers, IconShield, IconStar } from "@/components/icons";
import { DeviceShowcase, FlagTR } from "./showcase";
import { ServiceTabs } from "./service-tabs";
import { Guides, SectionHead, StoriesAndReviews } from "./parts";
import type { HomeData } from "./types";

const POPULAR = [
  ["Web Sitesi", "/web-sitesi-yaptirma"],
  ["E-Ticaret", "/e-ticaret-sitesi"],
  ["Logo Tasarımı", "/logo-tasarimi"],
  ["Mobil Uygulama", "/mobil-uygulama-gelistirme"],
  ["SEO", "/seo-hizmeti"],
  ["QR Menü", "/qr-menu"],
] as const;

const FEATURES = [
  [IconShield, "Güvenli alışveriş", "Ödemeniz koruma altında"],
  [IconCheck, "Doğrulanmış uzmanlar", "Yetkin ve güvenilir hizmet"],
  [IconLayers, "Net süreç", "Teklif, çalışma, teslimat"],
  [IconChat, "Destek ekibi", "Her adımda yanınızdayız"],
  [IconStar, "Memnuniyet odaklı", "Gerçek değerlendirme sistemi"],
] as const;

const FILTERS = [
  ["web-ve-yazilim", "Web Sitesi"],
  ["mobil-uygulama", "Mobil Uygulama"],
  ["grafik-tasarim", "Tasarım"],
  ["dijital-pazarlama", "Pazarlama"],
  ["yapay-zeka", "Yapay Zekâ"],
] as const;

const STEPS = [
  ["İhtiyacını anlat", "Hazır paketi seç ya da projeni birkaç cümleyle yaz."],
  ["Teklifleri karşılaştır", "Fiyat, süre, puan ve portföyü yan yana incele."],
  ["Güvenle öde", "Ödeme havuz hesabında bekler, uzman işe başlar."],
  ["Teslim al, onayla", "Onayladığında ödeme uzmana aktarılır."],
] as const;

/** Tema 4 · Gün Işığı ana sayfası (beyaz zemin, canlı turuncu vurgu) */
export function HomeSunrise({ d }: { d: HomeData }) {
  const hero = d.heroItems[0];
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-surface">
        <div className="container-x relative grid items-center gap-14 pb-12 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="min-w-0">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-paper-2 px-3.5 py-1.5 text-[13.5px] font-medium text-ink-2"><FlagTR size={17} /> Türkiye’nin Dijital Hizmet Platformu</p>
            <h1 className="text-[length:var(--hero-size)] font-bold leading-[1.06] tracking-[-0.03em]">
              Dijital projelerin için doğru uzman,{" "}
              <span className="relative whitespace-nowrap text-accent-bright">
                doğru çözüm.
                <svg aria-hidden viewBox="0 0 300 18" preserveAspectRatio="none" className="absolute -bottom-[0.1em] left-0 h-[0.16em] w-full text-accent-bright">
                  <path d="M3 13C60 5 140 3 297 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="hero-underline" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] text-ink-2">Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini güvenle al, projeni zamanında teslim ettir.</p>
            <div className="mt-8 max-w-[680px]"><SearchBox size="lg" placeholder="Ne yaptırmak istiyorsun? (Örn: Web sitesi, logo, mobil uygulama)" buttonLabel={<>Ara <IconArrowRight size={15} /></>} /></div>
            <div className="-mx-4 mt-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
              <span className="mr-1 shrink-0 text-[13.5px] font-semibold text-ink">Popüler aramalar:</span>
              {POPULAR.map(([t, href]) => <Link key={href} href={href} className="chip shrink-0 shadow-xs">{t}</Link>)}
            </div>
          </div>
          {hero && <div className="relative pb-6 pl-4 sm:pl-8"><DeviceShowcase s={hero} variant="sunrise" /></div>}
        </div>
        {/* Özellik şeridi */}
        <div className="container-x relative pb-12">
          <ul className="card grid divide-y divide-line-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
            {FEATURES.map(([I, t, x]) => (
              <li key={t} className="flex items-center gap-3.5 px-5 py-4">
                <I size={26} className="shrink-0 text-accent-bright" />
                <span><span className="block text-[15px] font-semibold">{t}</span><span className="block text-[13px] text-muted">{x}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Hizmet kategorileri ───────── */}
      <section className="container-x py-14 sm:py-20">
        <SectionHead title="Hizmet Kategorileri" sub="İhtiyacınıza uygun uzmanlığı kolayca bulun." href="/kategoriler" cta="Tüm kategorileri gör" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {d.tree.slice(0, 8).map((c) => {
            const n = d.catCounts[c.slug] ?? 0;
            return (
              <Link key={c.id} href={`/kategori/${c.slug}`} className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-[border-color,background-color,box-shadow] hover:border-accent-bright hover:bg-accent-soft/50 hover:shadow-lift">
                <CategoryIcon slug={c.slug} size={30} className="text-accent-bright" />
                <span className="mt-4 text-[16.5px] font-semibold">{c.name}</span>
                <span className="mt-1 flex items-center justify-between text-[13.5px] text-muted">
                  {n > 0 ? `${n} uzman` : `${c.children.length} alt kategori`}
                  <IconArrowRight size={16} className="text-accent-bright opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── Öne çıkan hizmetler (sekmeli) ───────── */}
      {d.pool.length > 0 && (
        <section className="border-y border-line bg-paper-2/60 py-14 sm:py-20">
          <div className="container-x">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[length:var(--h2-size)] font-semibold">Öne Çıkan Hizmetler</h2>
              <Link href="/ara?siralama=yeni" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:underline">Daha fazlasını gör <IconArrowRight size={15} /></Link>
            </div>
            <p className="mb-6 text-[15.5px] text-muted">Fiyatı, süresi ve kapsamı belli paketler.</p>
            <ServiceTabs
              variant="pills"
              tabs={[{ key: "all", label: "Tümü" }, ...FILTERS.map(([k, l]) => ({ key: k, label: l }))]}
              items={d.pool.slice(0, 12).map((s) => ({ cat: s.rootSlug, node: <ServiceCard key={s.id} s={s} /> }))}
              empty={<p className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">Bu kategoride henüz yayında hizmet yok. <Link href="/proje-olustur" className="font-medium text-ink underline underline-offset-4">Proje oluşturup teklif alın.</Link></p>}
            />
          </div>
        </section>
      )}

      {/* ───────── Nasıl çalışır ───────── */}
      <section className="container-x py-14 sm:py-20">
        <SectionHead title="Nasıl Çalışır?" sub="Dört adımda işini güvenle yaptır." href="/nasil-calisir" cta="Ayrıntılar" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, x], i) => (
            <li key={t} className="rounded-xl border border-line bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white">{i + 1}</span>
              <p className="mt-4 text-[16.5px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[14px] text-muted">{x}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Uzmanlar ───────── */}
      {d.providers.length > 0 && (
        <section className="container-x pb-14 sm:pb-20">
          <SectionHead title="Öne Çıkan Uzmanlar" sub="Kimliği doğrulanmış uzmanlar ve ajanslar." href="/uzmanlar" cta="Tüm uzmanlar" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{d.providers.map((p) => <ProviderCard key={p.slug} p={p} />)}</div>
        </section>
      )}

      <StoriesAndReviews d={d} />
      <Guides d={d} />

      {/* ───────── İki çağrı ───────── */}
      <section className="container-x">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl bg-accent-soft p-8 sm:p-10">
            <h2 className="text-[26px] font-bold sm:text-[30px]">İşin için uzman bul.</h2>
            <p className="mt-3 max-w-md text-ink-2">Projeni ücretsiz yayınla, teklifleri karşılaştır; ödemen onaylayana kadar güvende kalsın.</p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8"><ButtonLink href="/proje-olustur" variant="accent" size="lg">Ücretsiz proje oluştur</ButtonLink></div>
          </div>
          <div className="flex flex-col rounded-2xl border border-line bg-surface p-8 sm:p-10">
            <h2 className="text-[26px] font-bold sm:text-[30px]">Uzmanlığını kazanca dönüştür.</h2>
            <p className="mt-3 max-w-md text-ink-2">Üyelik ücretsiz; yalnızca tamamlanan siparişlerden %{d.commission} hizmet bedeli alınır.</p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8"><ButtonLink href="/kayit?rol=uzman" size="lg">Uzman olarak katıl</ButtonLink><ButtonLink href="/fiyatlar" size="lg" variant="outline">Ücretler</ButtonLink></div>
          </div>
        </div>
      </section>
    </>
  );
}
