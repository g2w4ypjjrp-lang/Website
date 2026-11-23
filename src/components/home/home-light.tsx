import Link from "next/link";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, ProviderCard, ServiceCover, ServiceGrid } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconChat, IconCheck, IconLock, IconRefresh, IconScale, IconShield } from "@/components/icons";
import { formatTRY } from "@/lib/utils";
import { Guides, QuickChips, SectionHead, StoriesAndReviews } from "./parts";
import type { HomeData } from "./types";

const POPULAR = [
  ["Web sitesi yaptır", "/web-sitesi-yaptirma"],
  ["Logo tasarla", "/logo-tasarimi"],
  ["Mobil uygulama geliştir", "/mobil-uygulama-gelistirme"],
  ["SEO hizmeti al", "/seo-hizmeti"],
  ["E-ticaret sitesi kur", "/e-ticaret-sitesi"],
  ["Sosyal medya yönetimi", "/sosyal-medya-yonetimi"],
] as const;

const STEPS = [
  ["İhtiyacını belirle", "Hazır paketlere göz at ya da projeni birkaç cümleyle yaz; bütçe ve tarih aralığını belirt."],
  ["Uzmanları karşılaştır", "Paketleri, teklifleri, puanları ve portföyleri yan yana incele; sipariş öncesi soru sor."],
  ["Güvenli ödeme yap", "Ödeme lisanslı ödeme kuruluşunun havuz hesabında bekler, uzman işe başlar."],
  ["İşini teslim al", "Teslimatı incele, gerekirse revizyon iste. Onayladığında ödeme uzmana aktarılır."],
] as const;

const TRUST = [
  [IconLock, "Ödeme güvenliği", "Kart bilgileri Eksen sunucularında tutulmaz; ödemeler lisanslı ödeme kuruluşu üzerinden alınır."],
  [IconShield, "Onaylayana kadar ödeme koruması", "Tutar, teslimatı onaylayana kadar havuz hesabında bekler; iş tamamlanmadan uzmana aktarılmaz."],
  [IconCheck, "Doğrulanmış uzmanlar", "Kimlik ve vergi bilgisi kontrol edilen uzmanlar profillerinde rozetle gösterilir."],
  [IconChat, "Sipariş bazlı mesajlaşma", "Her siparişin kendi mesaj ve dosya alanı vardır; konuşmalar ve teslimatlar kayıt altındadır."],
  [IconRefresh, "Revizyon sistemi", "Paketteki revizyon hakkı sipariş sayfasında görünür; düzeltme talebin kayıtlı olarak iletilir."],
  [IconScale, "Uyuşmazlık desteği", "Anlaşmazlıkta itiraz açılır; Eksen ekibi kayıtları inceleyip tarafları dinleyerek karar verir."],
] as const;

/** Tema 2 · Light Professional ana sayfası */
export function HomeLight({ d }: { d: HomeData }) {
  return (
    <>
      {/* ───────── Hero: sade ve dengeli ───────── */}
      <section className="border-b border-line bg-paper">
        <div className="container-x grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14 lg:py-20">
          <div className="min-w-0">
            <p className="eyebrow mb-4">Türkiye’nin dijital hizmet pazaryeri</p>
            <h1 className="max-w-[20ch] text-[length:var(--hero-size)] font-semibold leading-[1.08] tracking-[-0.025em]">Dijital işlerin için doğru uzmanı bul.</h1>
            <p className="mt-5 max-w-[54ch] text-[17px] text-ink-2">Web sitesi, uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini tek platformda keşfet.</p>
            <div className="mt-8 max-w-[640px]"><SearchBox size="lg" /></div>
            <QuickChips items={POPULAR} label="Popüler aramalar" />
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-ink-2">
              {["Onaylayana kadar ödeme koruması", "Doğrulanmış uzmanlar", "Sipariş bazlı mesajlaşma"].map((t) => (
                <li key={t} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-trust-soft text-trust"><IconCheck size={11} /></span>{t}</li>
              ))}
            </ul>
          </div>
          {d.heroItems.length > 0 && (
            <aside className="card p-2" aria-label="Öne çıkan paketler">
              <p className="flex items-center justify-between px-3 pb-2 pt-3 text-[13.5px] font-semibold">Öne çıkan paketler <Link href="/ara?siralama=yeni" className="text-[13px] font-medium text-accent-strong hover:underline">Tümü</Link></p>
              <ul className="divide-y divide-line-2">
                {d.heroItems.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <Link href={`/hizmet/${s.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-paper">
                      <span className="w-16 shrink-0 overflow-hidden rounded-md"><ServiceCover rootSlug={s.rootSlug} coverId={s.coverId} title="" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{s.title}</span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-muted">{s.providerName} · {s.minDeliveryDays} gün</span>
                      </span>
                      <span className="price shrink-0 text-[14.5px]">{formatTRY(s.startingPriceKurus)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </section>

      {/* ───────── Hizmet kategorileri ───────── */}
      <section className="container-x py-16 sm:py-20">
        <SectionHead eyebrow="Hizmet kategorileri" title="Ne yaptırmak istiyorsun?" href="/kategoriler" cta="Tüm kategoriler" />
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {d.tree.slice(0, 8).map((c) => (
            <Link key={c.id} href={`/kategori/${c.slug}`} className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-ink/25 hover:shadow-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-paper-2 text-ink transition-colors group-hover:bg-accent-soft group-hover:text-accent-strong"><CategoryIcon slug={c.slug} size={19} /></span>
              <span className="mt-4 text-[16px] font-semibold">{c.name}</span>
              <span className="mt-1 line-clamp-2 text-[13.5px] text-muted">{c.shortDescription}</span>
              <span className="mt-auto flex items-center gap-1 pt-4 text-[13px] font-medium text-ink-2 group-hover:text-accent-strong">{c.children.length} alt kategori <IconArrowRight size={13} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── Öne çıkan uzmanlar ───────── */}
      {d.providers.length > 0 && (
        <section className="border-y border-line bg-paper-2/60 py-16 sm:py-20">
          <div className="container-x">
            <SectionHead eyebrow="Öne çıkan uzmanlar" title="Doğrulanmış uzmanlarla çalış" href="/uzmanlar" cta="Tüm uzmanlar" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {d.providers.map((p) => <ProviderCard key={p.slug} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Öne çıkan hizmetler ───────── */}
      {d.showcase.length > 0 && (
        <section className="container-x py-16 sm:py-20">
          <SectionHead eyebrow="Öne çıkan hizmetler" title="Hemen sipariş verilebilen paketler" href="/ara?siralama=yeni" cta="Tüm hizmetler" />
          <ServiceGrid items={d.showcase.slice(0, 8)} />
        </section>
      )}

      {/* ───────── Nasıl çalışır ───────── */}
      <section className="border-y border-line bg-paper-2/60 py-16 sm:py-20">
        <div className="container-x">
          <SectionHead eyebrow="Nasıl çalışır?" title="Dört adımda işini yaptır" href="/nasil-calisir" cta="Ayrıntılar" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, x], i) => (
              <li key={t} className="rounded-xl border border-line bg-surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white">{i + 1}</span>
                <p className="mt-4 text-[16px] font-semibold">{t}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{x}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Güven sistemi ───────── */}
      <section className="container-x py-16 sm:py-20">
        <SectionHead eyebrow="Güven sistemi" title="İşini güvenle yaptır." sub="Ödemeden teslime kadar her adım kayıt altında ve koruma altında." />
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST.map(([Icon, t, x]) => (
            <div key={t} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trust-soft text-trust"><Icon size={18} /></span>
              <div>
                <h3 className="text-[16px] font-semibold">{t}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{x}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <StoriesAndReviews d={d} />
      <Guides d={d} />

      {/* ───────── İki çağrı: müşteriler ve uzmanlar ───────── */}
      <section className="container-x">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-line bg-surface p-7 sm:p-9">
            <p className="eyebrow">Müşteriler için</p>
            <h2 className="mt-2 text-[24px] font-semibold sm:text-[28px]">İşin için uzman bul.</h2>
            <p className="mt-3 max-w-md text-ink-2">Hazır paketlerden seç ya da projeni ücretsiz yayınla; teklifleri karşılaştır, ödemen onaylayana kadar güvende kalsın.</p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <ButtonLink href="/proje-olustur" variant="accent">Ücretsiz proje oluştur</ButtonLink>
              <ButtonLink href="/uzmanlar" variant="outline">Uzmanları keşfet</ButtonLink>
            </div>
          </div>
          <div className="flex flex-col rounded-xl border border-line bg-paper-2/70 p-7 sm:p-9">
            <p className="eyebrow">Uzmanlar ve ajanslar için</p>
            <h2 className="mt-2 text-[24px] font-semibold sm:text-[28px]">Uzmanlığını kazanca dönüştür.</h2>
            <p className="mt-3 max-w-md text-ink-2">Üyelik ücretsiz. Yalnızca tamamlanan siparişlerden %{d.commission} hizmet bedeli alınır; ödemen onaydan sonra hesabına aktarılır.</p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <ButtonLink href="/kayit?rol=uzman">Uzman olarak katıl</ButtonLink>
              <ButtonLink href="/uzman-ol" variant="outline">Nasıl kazanırım?</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
