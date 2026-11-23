import Link from "next/link";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, CompactServiceCard, ProviderCard } from "@/components/cards";
import { Avatar } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconBolt, IconBriefcase, IconCard, IconCart, IconChat, IconCheck, IconGrid, IconLock, IconRefresh, IconScale, IconShield, IconStar, IconUsers } from "@/components/icons";
import { titleCaseTR } from "@/lib/tr-grammar";
import { fileUrl, formatNumber } from "@/lib/utils";
import { DeviceShowcase, FlagTR } from "./showcase";
import { NeoCover } from "./neo-cover";
import { FeatureTile, fullRows, Guides, SectionHead, StoriesAndReviews } from "./parts";
import type { HomeData } from "./types";

const POPULAR = [
  ["Web Sitesi", "/web-sitesi-yaptirma"],
  ["Mobil Uygulama", "/mobil-uygulama-gelistirme"],
  ["Logo Tasarımı", "/logo-tasarimi"],
  ["E-Ticaret", "/e-ticaret-sitesi"],
  ["SEO", "/seo-hizmeti"],
  ["QR Menü", "/qr-menu"],
] as const;

const HOW = [
  [IconCart, "Hizmet veya proje seçin"],
  [IconUsers, "Uygun uzmanlardan teklif alın"],
  [IconCard, "Güvenli ödeme ile başlayın"],
  [IconCheck, "İşinizi teslim alıp onaylayın"],
] as const;

/** "Web ve yazılım" → "Web & Yazılım" (görseldeki etiket biçimi) */
const tabLabel = (name: string) => titleCaseTR(name).replace(/ Ve /g, " & ");

/** Tema 3 · Gece Moru ana sayfası (koyu zemin, mor vurgu) */
export function HomeNeo({ d }: { d: HomeData }) {
  const st = d.stats;
  // Görseldeki sayı + etiket düzeni; değerler yalnızca gerçek kayıtlardan
  const stats = [
    { I: IconUsers, v: formatNumber(st.providers), l: "Aktif Uzman" },
    { I: IconBriefcase, v: formatNumber(st.completed), l: "Tamamlanan Proje" },
    { I: IconShield, v: st.satisfaction != null ? `%${st.satisfaction}` : "—", l: "Müşteri Memnuniyeti" },
    { I: IconBolt, v: "81", l: "İlde Hizmet" },
  ];
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 -top-48 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(115_80_255/0.22),transparent)]" />
          <div className="absolute -right-24 top-0 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(88_60_230/0.18),transparent)]" />
        </div>
        <div className="container-x relative grid items-center gap-12 pb-10 pt-10 sm:pt-12 lg:grid-cols-2 xl:grid-cols-[1.36fr_1.12fr_0.64fr] xl:gap-5 2xl:max-w-[1560px] 2xl:grid-cols-[1.15fr_1.25fr_0.7fr] 2xl:gap-8 2xl:pb-6 2xl:pt-8">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[13px] font-medium text-ink-2 backdrop-blur"><FlagTR size={16} /> Türkiye’nin Dijital Hizmet Pazaryeri</p>
            <h1 className="text-[length:var(--hero-size)] font-bold leading-[1.08] tracking-[-0.03em]">
              Dijital projenizi <br className="hidden sm:block" />hayata geçirecek <br className="hidden sm:block" />
              <span className="neo-gradient-text">doğru uzmanı bulun.</span>
            </h1>
            <p className="mt-4 max-w-[52ch] text-[16.5px] text-ink-2">Web sitesi, mobil uygulama, tasarım, yazılım, dijital pazarlama ve çok daha fazlası için güvenilir uzmanlarla çalışın.</p>
            <div className="relative mt-6 max-w-[600px]">
              <div aria-hidden className="absolute -inset-2 rounded-[22px] bg-[#7350ff]/20 blur-xl" />
              <div className="relative"><SearchBox size="lg" placeholder="Ne yaptırmak istiyorsunuz?" buttonLabel={<>Ara <IconArrowRight size={15} /></>} /></div>
            </div>
            <div className="-mx-4 mt-4 flex items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-y-1.5 sm:px-0 2xl:flex-nowrap">
              <span className="mr-0.5 shrink-0 text-[12.5px] font-semibold text-ink">Popüler:</span>
              {POPULAR.map(([t, href]) => <Link key={href} href={href} className="chip shrink-0 !px-[7px] !py-[3px] !text-[11px]">{t}</Link>)}
            </div>
          </div>
          <div className="relative px-3 pb-8 pt-4 sm:px-0"><DeviceShowcase variant="neo" /></div>
          <aside className="neo-glass relative rounded-2xl p-6 lg:col-span-2 xl:col-span-1 xl:p-5">
            <h2 className="text-[22px] font-semibold">Nasıl Çalışır?</h2>
            <ol className="mt-5 space-y-4">
              {HOW.map(([I, t]) => (
                <li key={t} className="flex items-center gap-3.5 xl:gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper-2 text-accent-bright xl:h-9 xl:w-9"><I size={17} /></span>
                  <span className="text-[15px] leading-snug text-ink-2 xl:text-[14.5px]">{t}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href="/nasil-calisir" variant="accent" className="mt-6 w-full">Detayları İncele <IconArrowRight size={15} /></ButtonLink>
          </aside>
        </div>
        {/* İstatistik şeridi (gerçek veri) */}
        <div className="container-x relative pb-4 2xl:max-w-[1560px]">
          {/* Görseldeki gibi: solda çerçeveli rakam kutusu, sağda çerçevesiz müşteri satırı. Değerler gerçek kayıtlardan. */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-center lg:gap-6">
            <dl className="neo-glass grid grid-cols-2 overflow-hidden rounded-2xl lg:grid-cols-4">
              {stats.map(({ I, v, l }, i) => (
                <div key={l} className={`relative flex items-center gap-3 px-4 py-4 lg:px-6 ${i % 2 ? "border-l border-line lg:border-l-0" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""}`}>
                  <I size={26} className="shrink-0 text-[#a78bfa]" />
                  <div className="min-w-0"><dt className="sr-only">{l}</dt><dd className="text-[21px] font-bold leading-tight">{v}</dd><dd className="text-[12.5px] leading-snug text-muted lg:whitespace-nowrap">{l}</dd></div>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
              <span className="flex -space-x-3">{d.providers.slice(0, 3).map((p) => <Avatar key={p.slug} name={p.displayName} src={fileUrl(p.avatarId)} size={44} className="rounded-full ring-2 ring-paper" />)}</span>
              <p className="min-w-0 max-w-[30ch] flex-1 text-[13px] leading-snug text-ink-2">{st.customers > 0 ? `${formatNumber(st.customers)} işletme ve girişimci Eksen üzerinden iş tamamladı.` : "Ödemeniz, teslimatı onaylayana kadar güvende kalır."}</p>
              {st.reviews > 0 && (
                <p className="leading-tight">
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold"><span className="flex text-[#f5b400]">{Array.from({ length: 5 }).map((_, i) => <IconStar key={i} filled size={13} />)}</span>{st.avgRating.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="font-normal text-muted">/ 5</span></span>
                  <span className="mt-0.5 block text-right text-[11.5px] text-faint">{formatNumber(st.reviews)} değerlendirme</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Kategori çubuğu (ilk sekme vurgulu; üzerine gelince vurgu kayar) ───────── */}
      <section className="container-x pt-3 2xl:max-w-[1560px]">
        <nav aria-label="Kategoriler" className="group/cats -mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:neo-glass sm:mx-0 sm:rounded-2xl sm:p-2">
          {d.tree.slice(0, 7).map((c, i) => (
            <Link
              key={c.id}
              href={`/kategori/${c.slug}`}
              className={`relative flex min-w-[118px] flex-1 flex-col items-center gap-2.5 rounded-xl px-3 py-4 text-center text-[13.5px] font-medium transition-colors ${i > 1 ? "sm:before:absolute sm:before:-left-0.5 sm:before:top-1/2 sm:before:h-12 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-line" : ""} ${i === 0 ? "bg-accent text-white shadow-lift group-hover/cats:bg-transparent group-hover/cats:text-ink-2 group-hover/cats:shadow-none hover:!bg-accent hover:!text-white" : "text-ink-2 hover:bg-accent hover:text-white"}`}
            >
              <CategoryIcon slug={c.slug} size={24} />
              <span className="whitespace-nowrap">{tabLabel(c.name)}</span>
            </Link>
          ))}
          <Link href="/kategoriler" className="relative flex min-w-[130px] flex-1 flex-col items-center justify-center gap-2.5 rounded-xl px-3 py-4 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink sm:before:absolute sm:before:-left-0.5 sm:before:top-1/2 sm:before:h-12 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-line">
            <IconGrid size={22} /><span className="flex items-center gap-1 whitespace-nowrap">Tüm Kategoriler <IconArrowRight size={13} /></span>
          </Link>
        </nav>
      </section>

      {d.pool.length > 0 && (
        <section className="container-x pb-12 pt-10 sm:pb-14 2xl:max-w-[1560px] 2xl:pt-7">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-[26px] font-bold sm:text-[28px]">Popüler Hizmetler</h2><p className="mt-1.5 text-[15px] text-muted">En çok tercih edilen hizmetleri keşfedin.</p></div>
            <Link href="/ara?siralama=yeni" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-ink hover:text-accent-bright">Tüm Hizmetleri Gör <IconArrowRight size={15} /></Link>
          </div>
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {/* Yalnızca dolu satırlar: 5 sütunda 5/10 kart; 2 ve 4 sütunda fazlası gizlenir */}
            {d.pool.slice(0, d.pool.length >= 10 ? 10 : 5).map((s, i) => (
              <div key={s.id} className={i % 5 === 4 ? "grid grid-cols-1 min-[480px]:max-xl:hidden" : "grid grid-cols-1"}><CompactServiceCard s={s} showProvider={false} art={<NeoCover rootSlug={s.rootSlug} uid={s.id} title={s.title} />} /></div>
            ))}
          </div>
        </section>
      )}

      {/* ───────── Uzmanlar ───────── */}
      {d.providers.length > 0 && (
        <section className="container-x pb-16 sm:pb-20">
          <SectionHead eyebrow="Uzmanlar" title="Doğrulanmış uzmanlar ve ajanslar" sub="Puan, tamamlanan iş ve başlangıç fiyatı yalnızca platformdaki gerçek kayıtlardan." href="/uzmanlar" cta="Tüm uzmanlar" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{fullRows(d.providers).map((p, i, a) => <div key={p.slug} className={a.length === 3 && i === 2 ? "grid grid-cols-1 sm:max-lg:hidden" : "grid grid-cols-1"}><ProviderCard p={p} /></div>)}</div>
        </section>
      )}

      {/* ───────── Güven ───────── */}
      <section className="container-x pb-16 sm:pb-20">
        <SectionHead eyebrow="Güven sistemi" title="Ödemen iş bitene kadar güvende" href="/yardim" cta="Yardım merkezi" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureTile icon={<IconLock size={19} />} tone="bg-accent-soft text-accent-bright" title="Güvenli ödeme" text="Tutar, teslimatı onaylayana kadar havuz hesabında bekler; iş tamamlanmadan uzmana aktarılmaz." />
          <FeatureTile icon={<IconShield size={19} />} tone="bg-trust-soft text-trust" title="Doğrulanmış uzmanlar" text="Kimlik ve vergi bilgisi kontrol edilen uzmanlar rozetle gösterilir." />
          <FeatureTile icon={<IconRefresh size={19} />} tone="bg-info-soft text-info" title="Revizyon sistemi" text="Paketteki revizyon hakkı sipariş sayfasında görünür; düzeltme talebi kayıtlı iletilir." />
          <FeatureTile icon={<IconChat size={19} />} tone="bg-paper-2 text-ink" title="Platform içi mesajlaşma" text="Her siparişin kendi mesaj ve dosya alanı vardır; konuşmalar kayıt altındadır." />
          <FeatureTile icon={<IconScale size={19} />} tone="bg-paper-2 text-ink" title="Uyuşmazlık çözümü" text="Anlaşmazlıkta itiraz açılır; Eksen ekibi kayıtları inceleyip karar verir." />
          <FeatureTile icon={<IconBriefcase size={19} />} tone="bg-paper-2 text-ink" title="Kurumsal üyelik" text="Birden fazla işi tek muhatap ve yazılı şartlarla yürütün." href="/kurumsal" cta="Başvur" />
        </div>
      </section>

      <StoriesAndReviews d={d} />
      <Guides d={d} />

      {/* ───────── Çağrı ───────── */}
      <section className="container-x">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-2xl border border-line bg-surface p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(115_80_255/0.35),transparent)]" />
          <div className="relative">
            <p className="eyebrow mb-3">Uzmanlar ve ajanslar için</p>
            <h2 className="text-[28px] font-semibold sm:text-[36px]">Uzmanlığını kazanca dönüştür.</h2>
            <p className="mt-4 max-w-lg text-ink-2">Üyelik ücretsiz. Yalnızca tamamlanan siparişlerden %{d.commission} hizmet bedeli alınır; ödemen onaydan sonra hesabına aktarılır.</p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/kayit?rol=uzman" size="lg" variant="accent">Uzman olarak katıl</ButtonLink>
            <ButtonLink href="/proje-olustur" size="lg" variant="outline">+ Proje oluştur</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
