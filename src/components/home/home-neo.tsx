import Link from "next/link";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, ProviderCard, ServiceCard } from "@/components/cards";
import { Avatar } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconBriefcase, IconChat, IconCheck, IconGrid, IconLayers, IconLock, IconPin, IconRefresh, IconScale, IconShield, IconStar, IconUser, IconWallet } from "@/components/icons";
import { fileUrl, formatNumber } from "@/lib/utils";
import { DeviceShowcase, FlagTR } from "./showcase";
import { ServiceTabs } from "./service-tabs";
import { FeatureTile, Guides, SectionHead, StoriesAndReviews } from "./parts";
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
  [IconLayers, "Hizmet veya proje seçin"],
  [IconUser, "Uygun uzmanlardan teklif alın"],
  [IconWallet, "Güvenli ödeme ile başlayın"],
  [IconCheck, "İşinizi teslim alıp onaylayın"],
] as const;

/** Tema 3 · Gece Moru ana sayfası (koyu zemin, mor vurgu) */
export function HomeNeo({ d }: { d: HomeData }) {
  const hero = d.heroItems[0];
  const st = d.stats;
  // Yalnızca gerçek sayılar; anlamlı eşiğin altında niteliksel güven maddesi gösterilir
  const stats = [
    st.providers >= 25 ? { I: IconUser, v: `${formatNumber(st.providers)}`, l: "Aktif uzman" } : { I: IconShield, v: "Doğrulanmış", l: "Kimliği kontrol edilen uzmanlar" },
    st.completed >= 25 ? { I: IconBriefcase, v: `${formatNumber(st.completed)}`, l: "Tamamlanan proje" } : { I: IconLock, v: "Güvenli ödeme", l: "Onaylayana kadar korumada" },
    st.reviews >= 20 && st.satisfaction != null ? { I: IconStar, v: `%${st.satisfaction}`, l: "Olumlu değerlendirme" } : { I: IconCheck, v: "Gerçek yorumlar", l: "Yalnızca tamamlanan siparişlerden" },
    { I: IconPin, v: "81 il", l: "Türkiye genelinde hizmet" },
  ];
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 -top-48 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(115_80_255/0.22),transparent)]" />
          <div className="absolute -right-24 top-0 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(88_60_230/0.18),transparent)]" />
        </div>
        <div className="container-x relative grid items-center gap-12 pb-10 pt-10 sm:pt-14 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.72fr] xl:gap-8">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[13px] font-medium text-ink-2 backdrop-blur"><FlagTR size={16} /> Türkiye’nin Dijital Hizmet Pazaryeri</p>
            <h1 className="text-[length:var(--hero-size)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Dijital projenizi hayata geçirecek{" "}
              <span className="bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#7c5cff] bg-clip-text text-transparent">doğru uzmanı bulun.</span>
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16.5px] text-ink-2">Web sitesi, mobil uygulama, tasarım, yazılım, dijital pazarlama ve çok daha fazlası için güvenilir uzmanlarla çalışın.</p>
            <div className="mt-7 max-w-[600px]"><SearchBox size="lg" placeholder="Ne yaptırmak istiyorsunuz?" buttonLabel={<>Ara <IconArrowRight size={15} /></>} /></div>
            <div className="-mx-4 mt-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
              <span className="mr-1 shrink-0 text-[13px] font-semibold text-ink">Popüler:</span>
              {POPULAR.map(([t, href]) => <Link key={href} href={href} className="chip shrink-0 !py-1 !text-[12.5px]">{t}</Link>)}
            </div>
          </div>
          {hero && <div className="relative pb-6"><DeviceShowcase s={hero} variant="neo" /></div>}
          <aside className="card relative p-6 lg:col-span-2 xl:col-span-1">
            <h2 className="text-[22px] font-semibold">Nasıl Çalışır?</h2>
            <ol className="mt-5 space-y-4">
              {HOW.map(([I, t]) => (
                <li key={t} className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper-2 text-accent-bright"><I size={17} /></span>
                  <span className="text-[15px] text-ink-2">{t}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href="/nasil-calisir" variant="accent" className="mt-6 w-full">Detayları İncele <IconArrowRight size={15} /></ButtonLink>
          </aside>
        </div>
        {/* İstatistik şeridi (gerçek veri) */}
        <div className="container-x relative pb-10">
          <div className="card grid gap-px overflow-hidden !bg-line-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_1.35fr]">
            {stats.map(({ I, v, l }) => (
              <div key={l} className="flex items-center gap-3.5 bg-surface px-5 py-4">
                <I size={22} className="shrink-0 text-accent-bright" />
                <div><p className="text-[18px] font-semibold leading-tight">{v}</p><p className="text-[12.5px] text-muted">{l}</p></div>
              </div>
            ))}
            <div className="flex items-center gap-3.5 bg-surface px-5 py-4 sm:col-span-2 lg:col-span-1">
              <span className="flex -space-x-2.5">{d.providers.slice(0, 3).map((p) => <Avatar key={p.slug} name={p.displayName} src={fileUrl(p.avatarId)} size={34} className="rounded-full ring-2 ring-surface" />)}</span>
              {st.reviews >= 10 ? (
                <p className="text-[12.5px] text-muted"><span className="flex items-center gap-1 text-[15px] font-semibold text-ink"><IconStar filled size={14} className="text-[#f5b400]" /> {st.avgRating.toFixed(1)} / 5</span>{formatNumber(st.reviews)} gerçek değerlendirme</p>
              ) : (
                <p className="text-[12.5px] text-muted">Puanlar yalnızca tamamlanan siparişlerden gelir.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Kategori sekmeleri + popüler hizmetler ───────── */}
      {d.pool.length > 0 && (
        <section className="container-x py-14 sm:py-20">
          <ServiceTabs
            variant="bar"
            tabs={[{ key: "all", label: <><IconGrid size={20} /> Tümü</> }, ...d.tree.slice(0, 7).map((c) => ({ key: c.slug, label: <><CategoryIcon slug={c.slug} size={20} /> <span className="whitespace-nowrap">{c.name}</span></> }))]}
            trailing={<Link href="/kategoriler" className="flex min-w-[130px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-3.5 text-[13.5px] font-medium text-ink-2 hover:bg-paper-2 hover:text-ink">Tüm kategoriler <IconArrowRight size={14} /></Link>}
            between={<SectionHead title="Popüler Hizmetler" sub="En çok tercih edilen hizmetleri keşfedin." href="/ara?siralama=yeni" cta="Tüm hizmetleri gör" />}
            items={d.pool.slice(0, 12).map((s) => ({ cat: s.rootSlug, node: <ServiceCard key={s.id} s={s} /> }))}
            empty={<p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">Bu kategoride henüz yayında hizmet yok. <Link href="/proje-olustur" className="font-medium text-ink underline underline-offset-4">Proje oluşturup teklif alın.</Link></p>}
          />
        </section>
      )}

      {/* ───────── Uzmanlar ───────── */}
      {d.providers.length > 0 && (
        <section className="container-x pb-16 sm:pb-20">
          <SectionHead eyebrow="Uzmanlar" title="Doğrulanmış uzmanlar ve ajanslar" sub="Puan, tamamlanan iş ve başlangıç fiyatı yalnızca platformdaki gerçek kayıtlardan." href="/uzmanlar" cta="Tüm uzmanlar" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{d.providers.map((p) => <ProviderCard key={p.slug} p={p} />)}</div>
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
