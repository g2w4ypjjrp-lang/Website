import Link from "next/link";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, CompactServiceCard, ProviderCard } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconBolt, IconHeadset, IconLayers, IconShield, IconTrophy } from "@/components/icons";
import { titleCaseTR } from "@/lib/tr-grammar";
import { DeviceShowcase, FlagTR } from "./showcase";
import { ServiceTabs } from "./service-tabs";
import { fullRows, Guides, SectionHead, StoriesAndReviews } from "./parts";
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
  [IconShield, "Güvenli Alışveriş", "Ödemeniz koruma altında"],
  [IconBolt, "Doğrulanmış Uzmanlar", "Yetkin ve güvenilir hizmet"],
  [IconLayers, "Net Süreç", "Teklif, çalışma, teslimat"],
  [IconHeadset, "Destek Ekibi", "Her adımda yanınızdayız"],
  [IconTrophy, "Memnuniyet Odaklı", "Değerlendirme sistemi"],
] as const;

/** "Web ve yazılım" → "Web & Yazılım" (görseldeki etiket biçimi) */
const tabLabel = (name: string) => titleCaseTR(name).replace(/ Ve /g, " & ");

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
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-surface">
        <div className="container-x relative grid items-center gap-14 pb-14 pt-10 sm:pt-14 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
          <div className="min-w-0">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-paper-2 px-3.5 py-1.5 text-[13.5px] font-medium text-ink-2"><FlagTR size={17} /> Türkiye’nin Dijital Hizmet Platformu</p>
            <h1 className="text-[length:var(--hero-size)] font-bold leading-[1.12] tracking-[-0.03em]">
              Dijital projelerin için <br className="hidden sm:block" />doğru uzman,{" "}
              <span className="relative whitespace-nowrap text-accent-bright">
                doğru çözüm.
                <svg aria-hidden viewBox="0 0 300 18" preserveAspectRatio="none" className="absolute -bottom-[0.1em] left-0 h-[0.16em] w-full text-accent-bright">
                  <path d="M3 13C60 5 140 3 297 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="hero-underline" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] text-ink-2">Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini güvenle al, projeni zamanında teslim ettir.</p>
            <div className="mt-8 max-w-[680px]"><SearchBox size="lg" divider placeholder="Ne yaptırmak istiyorsun? (Örn: Web sitesi, logo, mobil uygulama)" buttonLabel={<>Ara <IconArrowRight size={15} /></>} /></div>
            <div className="-mx-4 mt-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-y-2 sm:px-0">
              <span className="mr-1 shrink-0 text-[13px] font-semibold text-ink">Popüler aramalar:</span>
              {POPULAR.map(([t, href]) => <Link key={href} href={href} className="chip shrink-0 !px-2.5 !py-[3px] !text-[12px] shadow-xs">{t}</Link>)}
            </div>
          </div>
          <div className="relative pl-4 pt-8 sm:pl-8"><DeviceShowcase variant="sunrise" /></div>
        </div>
        {/* Özellik şeridi */}
        <div className="container-x relative pb-10">
          {/* Mobilde 2 sütun (ince çizgili ızgara), geniş ekranda tek satır ve kısa ayırıcılar */}
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-2 bg-line-2 shadow-[0_10px_30px_-12px_rgb(15_23_42/0.14)] lg:grid-cols-5 lg:gap-0 lg:bg-surface">
            {FEATURES.map(([I, t, x], i) => (
              <li key={t} className={`relative flex items-center gap-3 bg-surface px-4 py-4 last:col-span-2 sm:py-5 lg:last:col-span-1 xl:px-5 ${i > 0 ? "lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:h-10 lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-line" : ""}`}>
                <I size={27} className="shrink-0 text-accent-bright" />
                <span className="min-w-0"><span className="block text-[14px] font-semibold leading-snug sm:text-[14.5px]">{t}</span><span className="hidden text-[12.5px] text-muted sm:block lg:hidden xl:block">{x}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Hizmet kategorileri: tek sırada 6 kart, ilki vurgulu ───────── */}
      <section className="container-x pb-12 pt-6 sm:pb-16 sm:pt-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-[length:var(--h2-size)] font-bold">Hizmet Kategorileri</h2><p className="mt-1.5 text-[15.5px] text-muted">İhtiyacınıza uygun uzmanlığı kolayca bulun.</p></div>
          <Link href="/kategoriler" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:underline">Tüm Kategorileri Gör <IconArrowRight size={15} /></Link>
        </div>
        <div className="group/cats grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {d.tree.slice(0, 6).map((c, i) => {
            const n = d.catCounts[c.slug] ?? 0;
            const first = i === 0;
            return (
              <Link
                key={c.id}
                href={`/kategori/${c.slug}`}
                className={`group flex flex-col rounded-2xl border p-5 transition-[border-color,background-color,box-shadow] ${first ? "border-accent-bright bg-accent-soft/60 shadow-lift lg:group-hover/cats:border-line lg:group-hover/cats:bg-surface lg:group-hover/cats:shadow-none lg:hover:!border-accent-bright lg:hover:!bg-accent-soft/60" : "border-line bg-surface shadow-card hover:border-accent-bright hover:bg-accent-soft/60"}`}
              >
                <CategoryIcon slug={c.slug} size={30} className="text-accent-bright" />
                <span className="mt-5 text-[16.5px] font-bold">{tabLabel(c.name)}</span>
                <span className="mt-1 flex items-center justify-between text-[13.5px] text-muted">
                  {n > 0 ? `${n} uzman` : `${c.children.length} alt kategori`}
                  <IconArrowRight size={18} className={`text-accent-bright transition-opacity ${first ? "opacity-100 lg:group-hover/cats:opacity-0 lg:group-hover:!opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── Öne çıkan hizmetler: başlık, sekmeler ve bağlantı aynı satırda ───────── */}
      {d.pool.length > 0 && (
        <section className="container-x pb-14 sm:pb-20">
          <ServiceTabs
            cols={4}
            head={<h2 className="text-[length:var(--h2-size)] font-bold">Öne Çıkan Hizmetler</h2>}
            tabs={[{ key: "all", label: "Tümü" }, ...FILTERS.map(([k, l]) => ({ key: k, label: l }))]}
            trailing={<Link href="/ara?siralama=yeni" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:underline">Daha Fazlasını Gör <IconArrowRight size={15} /></Link>}
            items={d.pool.slice(0, 8).map((s) => ({ cat: s.rootSlug, node: <CompactServiceCard key={s.id} s={s} /> }))}
            empty={<p className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">Bu kategoride henüz yayında hizmet yok. <Link href="/proje-olustur" className="font-medium text-ink underline underline-offset-4">Proje oluşturup teklif alın.</Link></p>}
          />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fullRows(d.providers).map((p, i, a) => <div key={p.slug} className={a.length === 3 && i === 2 ? "grid grid-cols-1 sm:max-lg:hidden" : "grid grid-cols-1"}><ProviderCard p={p} /></div>)}</div>
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
