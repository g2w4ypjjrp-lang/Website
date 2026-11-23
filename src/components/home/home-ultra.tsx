import Link from "next/link";
import type { ReactNode } from "react";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, CompactServiceCard } from "@/components/cards";
import { CitySelect } from "@/components/city-select";
import { Avatar } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconCard, IconChat, IconCheck, IconLock, IconRefresh, IconScale, IconShield, IconStar } from "@/components/icons";
import { fileUrl, formatNumber, formatRating, formatTRY } from "@/lib/utils";
import { Guides, StoriesAndReviews } from "./parts";
import type { HomeData } from "./types";

const FREQUENT = [
  ["Kurumsal web sitesi", "/web-sitesi-yaptirma"],
  ["E-ticaret", "/e-ticaret-sitesi"],
  ["Mobil uygulama", "/mobil-uygulama-gelistirme"],
  ["SEO", "/seo-hizmeti"],
  ["Logo tasarımı", "/logo-tasarimi"],
] as const;

const STEPS = [
  ["İhtiyacı tanımlayın", "Hazır bir paketi seçin ya da projenizi kapsamı, bütçesi ve süresiyle ücretsiz yayınlayın."],
  ["Teklifleri karşılaştırın", "Fiyat, teslim süresi, puan ve portföyü yan yana değerlendirin; yalnızca seçtiğiniz uzmanla çalışın."],
  ["Güvenceyle başlatın", "Ödeme havuz hesabında bekler. Kapsam, süre ve revizyon hakkı sipariş sayfasında yazılıdır."],
  ["Teslim alın, onaylayın", "Onayınızla ödeme uzmana aktarılır. Anlaşmazlıkta Eksen ekibi kayıtları inceleyip karar verir."],
] as const;

const SMALL_GUARANTEES = [
  [IconRefresh, "Yazılı kapsam ve revizyon", "Paket kapsamı, teslim süresi ve revizyon hakkı sipariş sayfasında açıkça yazar."],
  [IconChat, "Kayıtlı iletişim", "Her siparişin kendi mesaj ve dosya alanı vardır; konuşmalar kayıt altında tutulur."],
  [IconScale, "Uyuşmazlık çözümü", "Teslim şartlara uymazsa itiraz açılır; Eksen ekibi kayıtları inceleyip karar verir."],
  [IconCheck, "Kart bilgisi saklanmaz", "Ödemeler lisanslı ödeme kuruluşu üzerinden alınır; kart bilgileriniz Eksen’de tutulmaz."],
] as const;

const CORPORATE = ["Hesap yöneticisi ve karşılaştırmalı kısa liste", "Kapsam, gizlilik ve fikri mülkiyet şartları yazılı", "Şirket unvanıyla kayıtlı siparişler, dönemsel döküm", "Talep, revizyon ve itirazlarda öncelik"] as const;

/** Koyu bölümlerin ince ızgarası (verilen noktada belirgin, kenarlara doğru söner). */
function GridGlow({ at = "50% 0%" }: { at?: string }) {
  const mask = `radial-gradient(ellipse 75% 70% at ${at}, #000 30%, transparent 100%)`;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.055)_1px,transparent_1px)] bg-[size:64px_64px]"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

/** Bölüm başlığı: etiket, başlık, açıklama; sağda yazı biçiminde bağlantı. */
function Head({ eyebrow, title, sub, href, cta }: { eyebrow: string; title: ReactNode; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 sm:mb-12">
      <div className="max-w-2xl">
        <p className="mb-3.5 inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-[12.5px] font-semibold text-accent">{eyebrow}</p>
        <h2 className="text-balance text-[clamp(28px,3.2vw,44px)] font-semibold leading-[1.08] tracking-[-0.035em]">{title}</h2>
        {sub && <p className="mt-4 text-[16px] leading-relaxed text-muted">{sub}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-[14.5px] font-semibold text-accent">
          {cta} <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Degrade ikon kutusu. */
function GlowIcon({ children }: { children: ReactNode }) {
  return <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f4ed8] to-[#38a0ff] text-white shadow-[0_10px_24px_-10px_rgb(31_78_216/0.85)]">{children}</span>;
}

/** Girişteki teklif formu: seçilen kategori ve il ile proje oluşturma sayfasını doldurulmuş açar (ek istek yok). */
function QuoteCard({ tree }: { tree: HomeData["tree"] }) {
  return (
    <form action="/proje-olustur" method="get" className="relative rounded-[18.5px] bg-surface p-6 text-ink sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13.5px] font-semibold text-accent">Ücretsiz teklif alın</p>
        <span className="rounded-md bg-trust-soft px-2 py-1 text-[12px] font-medium text-trust">Bağlayıcı değil</span>
      </div>
      <h2 className="mt-2 text-[21px] font-semibold leading-snug tracking-[-0.02em] sm:text-[23px]">Projenizi yayınlayın, doğrulanmış uzmanlar teklif versin.</h2>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-medium text-ink-2">Hizmet alanı</span>
          <select name="kategori" defaultValue="" className="field">
            <option value="">Seçin</option>
            {tree.map((c) => (
              <optgroup key={c.id} label={c.name}>
                <option value={c.slug}>{c.name} (genel)</option>
                {c.children.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-medium text-ink-2">İşletmenizin bulunduğu il <span className="font-normal text-muted">(isteğe bağlı)</span></span>
          <CitySelect name="il" valueKind="slug" placeholder="İl seçin" />
        </label>
      </div>
      <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-gradient-to-r from-[#1f4ed8] to-[#3a6cf0] text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgb(31_78_216/0.9)] transition-[filter,translate] hover:-translate-y-px hover:brightness-110">
        Teklif almaya başla <IconArrowRight size={16} />
      </button>
      <ul className="mt-5 space-y-2 text-[13.5px] text-ink-2">
        {["Proje yayınlamak ücretsiz, teklifler bağlayıcı değil", "Teklifleri fiyat, süre ve puana göre karşılaştırın", "Ödeme, teslimatı onaylayana kadar güvende"].map((t) => (
          <li key={t} className="flex gap-2"><IconCheck size={15} className="mt-0.5 shrink-0 text-trust" />{t}</li>
        ))}
      </ul>
    </form>
  );
}

/** Tema 5 · Ultra Profesyonel ana sayfası: koyu sinematik giriş, ışıltılı arka plan, hareketli ayrıntılar; tüm rakamlar gerçek. */
export function HomeUltra({ d }: { d: HomeData }) {
  const st = d.stats;
  const avg = st.avgRating.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  // Yalnızca gerçek kayıtlar; değerlendirme yoksa oran yerine çizgi
  const stats: { v: string; l: string; s?: string }[] = [
    { v: formatNumber(st.providers), l: "Aktif uzman" },
    { v: formatNumber(st.completed), l: "Tamamlanan proje" },
    { v: st.satisfaction != null ? `%${st.satisfaction}` : "—", l: "Müşteri memnuniyeti", s: st.reviews ? `${formatNumber(st.reviews)} değerlendirme` : "henüz değerlendirme yok" },
    { v: "81", l: "İlde hizmet" },
  ];
  const services = d.pool.slice(0, d.pool.length >= 8 ? 8 : 4);
  const shortlist = d.providers.slice(0, 4);
  // Kayan şerit: her ana kategoriden üç alt hizmet (gerçek kategori ağacı)
  const subs = d.tree.flatMap((c) => c.children.slice(0, 3).map((s) => ({ slug: s.slug, name: s.name, root: c.slug })));
  return (
    <>
      {/* ───────── Giriş: koyu, ışıltılı ───────── */}
      <section className="relative isolate overflow-hidden bg-[#060f22] text-white">
        <div aria-hidden className="ultra-aurora -z-10" />
        <GridGlow at="50% 0%" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#5b8cff]/70 to-transparent" />
        <div className="container-x relative grid items-center gap-14 pb-14 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:gap-14 lg:pb-16 lg:pt-24">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-white/85 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3ee0a1] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3ee0a1]" />
              </span>
              Doğrulanmış uzmanlar · Korunan ödeme · 81 il
            </p>
            <h1 className="mt-7 text-[clamp(38px,4.3vw,58px)] font-semibold leading-[1.04] tracking-[-0.045em]">
              Dijital işleriniz için <br className="hidden sm:block" />doğrulanmış uzmanlar, <br className="hidden sm:block" /><span className="ultra-gradient-text">güvenceli süreç.</span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17.5px] leading-relaxed text-white/70">Web sitesi, yazılım, tasarım ve dijital pazarlama işlerinizi teklif, yazılı kapsam ve korunan ödemeyle tek yerden yönetin.</p>
            <div className="relative mt-9 max-w-[620px]">
              <div aria-hidden className="absolute -inset-3 rounded-[24px] bg-[#2b5cff]/30 blur-2xl" />
              <div className="relative"><SearchBox size="lg" placeholder="Hangi hizmete ihtiyacınız var?" buttonLabel={<>Uzman bul <IconArrowRight size={15} /></>} /></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="mr-1 text-white/55">Sık arananlar</span>
              {FREQUENT.map(([t, href]) => (
                <Link key={href} href={href} className="rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-white/80 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white">{t}</Link>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[540px] lg:mx-0 lg:justify-self-end">
            <div aria-hidden className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(43_92_255/0.38),transparent)]" />
            <div className="ultra-glow-border shadow-[0_40px_100px_-30px_rgb(10_40_140/0.85)]"><QuoteCard tree={d.tree} /></div>
            {/* Yüzen rozetler: platformun gerçek durumu */}
            <div className="ultra-float absolute -top-7 left-8 hidden items-center gap-3 rounded-xl border border-white/15 bg-[#0c1a38]/85 px-3.5 py-2.5 text-white shadow-[0_20px_50px_-15px_rgb(0_0_0/0.6)] backdrop-blur-md xl:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3ee0a1]/15 text-[#3ee0a1]"><IconShield size={18} /></span>
              <span className="leading-tight"><span className="block text-[13.5px] font-semibold">Ödeme güvencede</span><span className="block text-[12px] text-white/60">Onayınıza kadar havuz hesabında</span></span>
            </div>
            {d.providers.length > 0 && (
              <div className="ultra-float-late absolute -bottom-10 -right-4 hidden items-center gap-3 rounded-xl border border-white/15 bg-[#0c1a38]/85 px-3.5 py-2.5 text-white shadow-[0_20px_50px_-15px_rgb(0_0_0/0.6)] backdrop-blur-md xl:flex">
                <span className="flex -space-x-2">{d.providers.slice(0, 3).map((p) => <Avatar key={p.slug} name={p.displayName} src={fileUrl(p.avatarId)} size={30} className="rounded-full ring-2 ring-[#0c1a38]" />)}</span>
                <span className="leading-tight">
                  <span className="block text-[13.5px] font-semibold">{formatNumber(d.verifiedTotal)} doğrulanmış uzman</span>
                  <span className="flex items-center gap-1 text-[12px] text-white/60">{st.reviews > 0 ? <><IconStar filled size={11} className="text-[#f5b400]" /> {avg} ortalama · {formatNumber(st.reviews)} değerlendirme</> : "Kimlik ve vergi bilgisi kontrollü"}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Gerçek verili rakamlar */}
        <div className="container-x relative pb-12 lg:pb-16">
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur lg:grid-cols-4">
            {stats.map(({ v, l, s }, i) => (
              <div key={l} className={`px-5 py-6 sm:px-7 ${i % 2 ? "border-l border-white/10" : ""} ${i > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                <dt className="sr-only">{l}</dt>
                <dd className="num bg-gradient-to-b from-white to-[#9db8ff] bg-clip-text text-[34px] font-semibold leading-none tracking-[-0.03em] text-transparent sm:text-[40px]">{v}</dd>
                <dd className="mt-2.5 text-[13.5px] text-white/70">{l}{s && <span className="block text-[12.5px] text-white/45">{s}</span>}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Kayan hizmet şeridi ───────── */}
      {subs.length > 0 && (
        <section aria-label="Popüler hizmetler" className="border-b border-line bg-surface py-5">
          <div className="ultra-marquee overflow-hidden">
            <div className="ultra-marquee-track">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 || undefined}>
                  {subs.map((s) => (
                    <li key={s.slug} className="pr-3">
                      <Link href={`/kategori/${s.slug}`} tabIndex={copy === 1 ? -1 : undefined} className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-paper px-4 py-2 text-[14px] font-medium text-ink-2 transition-colors hover:border-accent hover:text-accent">
                        <CategoryIcon slug={s.root} size={15} className="text-accent" />{s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Kategori dizini ───────── */}
      <section className="container-x py-16 sm:py-24">
        <Head eyebrow="Hizmet alanları" title="Her ihtiyaç için uzman kadrosu" sub="Ana kategoriler ve en çok talep gören alt hizmetler. Uzman sayıları yayındaki gerçek kayıtlardan." href="/kategoriler" cta="Tüm kategoriler" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {d.tree.slice(0, 8).map((c) => {
            const n = d.catCounts[c.slug] ?? 0;
            const count = n > 0 ? `${n} uzman` : `${c.children.length} alt hizmet`;
            return (
              <div key={c.id} className="ultra-card group flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-card transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgb(31_78_216/0.45)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <GlowIcon><CategoryIcon slug={c.slug} size={20} /></GlowIcon>
                  <span className="num hidden rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-semibold text-accent sm:inline">{count}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold leading-snug sm:mt-5 sm:text-[17px]">
                  <Link href={`/kategori/${c.slug}`} className="transition-colors after:absolute after:inset-0 hover:text-accent sm:after:hidden">{c.name}</Link>
                </h3>
                <p className="num mt-0.5 text-[12.5px] text-muted sm:hidden">{count}</p>
                <ul className="mt-3 hidden space-y-1.5 text-[14px] sm:block">
                  {c.children.slice(0, 4).map((s) => <li key={s.id}><Link href={`/kategori/${s.slug}`} className="text-ink-2 transition-colors hover:text-accent">{s.name}</Link></li>)}
                </ul>
                <Link href={`/kategori/${c.slug}`} className="mt-auto hidden items-center gap-1 pt-5 text-[13.5px] font-semibold text-accent sm:inline-flex">Tümünü gör <IconArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Süreç: zaman çizelgesi ───────── */}
      <section className="border-y border-line bg-surface">
        <div className="container-x py-16 sm:py-24">
          <Head eyebrow="Süreç" title="Dört adımda, kayıt altında" sub="Her adım sipariş sayfasında görünür. Mesajlar, dosyalar ve onaylar kayıt altında tutulur." href="/nasil-calisir" cta="Süreci inceleyin" />
          <div className="relative">
            <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 overflow-hidden rounded bg-line lg:block"><span className="ultra-sweep absolute inset-0" /></div>
            <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
              {STEPS.map(([t, x], i) => (
                <li key={t} className="flex gap-4 lg:block lg:text-center">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1f4ed8] to-[#38a0ff] text-[17px] font-semibold text-white shadow-[0_14px_30px_-12px_rgb(31_78_216/0.85)] ring-8 ring-surface lg:mx-auto">{String(i + 1).padStart(2, "0")}</span>
                  <div className="lg:mt-6">
                    <p className="text-[17.5px] font-semibold tracking-[-0.01em]">{t}</p>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-muted lg:mx-auto lg:max-w-[30ch]">{x}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── Hizmet paketleri ───────── */}
      {services.length > 0 && (
        <section className="container-x py-16 sm:py-24">
          <Head eyebrow="Hizmet paketleri" title="Kapsamı, süresi ve fiyatı belli paketler" sub="Teklif beklemeden hemen satın alınabilir; ödeme yine onayınıza kadar korunur." href="/ara?siralama=yeni" cta="Tüm hizmetler" />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => <div key={s.id} className="grid grid-cols-1"><CompactServiceCard s={s} /></div>)}
          </div>
        </section>
      )}

      {/* ───────── Kurumsal: koyu, ışıltılı ───────── */}
      <section className="relative isolate overflow-hidden bg-[#060f22] text-white">
        <div aria-hidden className="ultra-aurora -z-10" />
        <GridGlow at="85% 20%" />
        <div className="container-x grid items-center gap-14 py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <p className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[12.5px] font-semibold text-[#9db8ff] backdrop-blur">Eksen Kurumsal</p>
            <h2 className="mt-5 text-balance text-[clamp(30px,3.4vw,48px)] font-semibold leading-[1.06] tracking-[-0.04em]">Şirketiniz için tek muhatap, <span className="ultra-gradient-text">yazılı çalışma şartları.</span></h2>
            <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-white/70">Hesap yöneticiniz ihtiyacı sizinle netleştirir, doğrulanmış uzmanlardan karşılaştırmalı kısa liste hazırlar ve işi baştan sona takip eder.</p>
            <ul className="mt-8 grid gap-3.5 text-[14.5px] text-white/85 sm:grid-cols-2">
              {CORPORATE.map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1f4ed8] to-[#38a0ff]"><IconCheck size={12} /></span>{t}</li>)}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/kurumsal" size="lg" variant="accent" className="shadow-[0_14px_34px_-12px_rgb(43_92_255/0.9)]">Kurumsal görüşme talep edin</ButtonLink>
              <Link href="/fiyatlar" className="inline-flex h-12 items-center rounded-[var(--radius-btn)] border border-white/20 bg-white/[0.05] px-6 text-[15.5px] font-medium text-white backdrop-blur transition-colors hover:border-white/50">Ücretler</Link>
            </div>
          </div>
          {shortlist.length > 0 && (
            <div className="ultra-glow-border shadow-[0_40px_100px_-30px_rgb(10_40_140/0.85)]"><Shortlist items={shortlist} total={d.verifiedTotal} /></div>
          )}
        </div>
      </section>

      {/* ───────── Güvenceler: bento ───────── */}
      <section className="container-x py-16 sm:py-24">
        <Head eyebrow="Güvence" title="Kurumsal işlerde aranan güvenceler, her siparişte" href="/yardim" cta="Yardım merkezi" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="ultra-card relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#eaf0ff] via-white to-white p-6 sm:col-span-2 sm:p-8">
            <GlowIcon><IconLock size={19} /></GlowIcon>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.01em]">Korunan ödeme</h3>
            <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-muted">Tutar, teslimatı onaylayana kadar havuz hesabında bekler; iş tamamlanmadan uzmana aktarılmaz.</p>
            <div className="mt-8" aria-hidden>
              <div className="relative h-[30px]">
                <div className="absolute inset-x-[15px] top-1/2 h-0.5 -translate-y-1/2 rounded bg-gradient-to-r from-[#1f4ed8]/35 via-[#1f4ed8]/60 to-[#0b7a59]/55" />
                {["15px", "50%", "calc(100% - 15px)"].map((x) => <span key={x} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1f4ed8] shadow" style={{ left: x }} />)}
                <span className="ultra-escrow-token flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-br from-[#1f4ed8] to-[#38a0ff] text-white shadow-[0_10px_24px_-8px_rgb(31_78_216/0.85)]"><IconCard size={15} /></span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[12.5px] font-medium text-ink-2"><span>Siz ödersiniz</span><span className="text-center">Havuz hesabında bekler</span><span className="text-right">Onayınızla uzmana geçer</span></div>
            </div>
          </div>
          <div className="ultra-card relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:col-span-2 sm:p-8">
            <GlowIcon><IconShield size={19} /></GlowIcon>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.01em]">Doğrulanmış uzmanlar</h3>
            <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-muted">Kimlik ve vergi bilgisi kontrol edilen uzmanlar ve ajanslar profilde rozetle gösterilir.</p>
            {d.providers.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="flex -space-x-2.5">{d.providers.slice(0, 5).map((p) => <Avatar key={p.slug} name={p.displayName} src={fileUrl(p.avatarId)} size={42} className="rounded-full ring-[3px] ring-surface" />)}</span>
                <span className="text-[14px] text-ink-2"><b className="num font-semibold text-ink">{formatNumber(d.verifiedTotal)}</b> doğrulanmış uzman ve ajans</span>
              </div>
            )}
          </div>
          {SMALL_GUARANTEES.map(([I, t, x]) => (
            <div key={t} className="ultra-card relative rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><I size={19} /></span>
              <h3 className="mt-4 text-[16px] font-semibold">{t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{x}</p>
            </div>
          ))}
        </div>
      </section>

      <StoriesAndReviews d={d} />
      <Guides d={d} />

      {/* ───────── Çağrı: koyu degrade panel ───────── */}
      <section className="container-x">
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#071226] px-6 py-14 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="ultra-aurora -z-10" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgb(31_78_216/0.5),transparent_55%)]" />
          <GridGlow at="20% 30%" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="text-balance text-[clamp(30px,3.4vw,46px)] font-semibold leading-[1.06] tracking-[-0.04em]">Projenizi bugün yayınlayın, <span className="ultra-gradient-text">uzmanlar teklif versin.</span></h2>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/70">Proje yayınlamak ücretsiz. Teklifleri karşılaştırır, yalnızca seçtiğiniz uzmanla çalışırsınız; ödemeniz onayınıza kadar güvende kalır.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href="/proje-olustur" className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-white px-6 text-[15.5px] font-semibold text-[#0b1526] shadow-[0_14px_40px_-12px_rgb(255_255_255/0.4)] transition-[translate] hover:-translate-y-0.5">Ücretsiz proje oluştur <IconArrowRight size={16} /></Link>
              <Link href="/kurumsal" className="inline-flex h-12 items-center justify-center rounded-[var(--radius-btn)] border border-white/20 bg-white/[0.06] px-6 text-[15.5px] font-medium text-white backdrop-blur transition-colors hover:border-white/45">Kurumsal görüşme</Link>
            </div>
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 text-[14px] text-white/60">
            Uzman mısınız? Üyelik ücretsiz; yalnızca tamamlanan siparişlerden %{d.commission} hizmet bedeli alınır.{" "}
            <Link href="/kayit?rol=uzman" className="font-semibold text-[#9db8ff] hover:underline">Uzman olarak katılın</Link>
          </p>
        </div>
      </section>
    </>
  );
}

/** Kurumsal bölümdeki kısa liste: platformdaki gerçek, kimliği doğrulanmış uzmanlar (puan, iş sayısı, başlangıç fiyatı). */
function Shortlist({ items, total }: { items: HomeData["providers"]; total: number }) {
  const cell = (c: ReactNode, cls = "") => <td className={`py-3.5 ${cls}`}>{c}</td>;
  return (
    <div className="overflow-hidden rounded-[18.5px] bg-surface text-ink">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="text-[15px] font-semibold">Karşılaştırmalı kısa liste</p>
          <p className="text-[12.5px] text-muted">Örnek: platformdaki doğrulanmış uzmanlar</p>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-trust-soft px-2 py-1 text-[12px] font-medium text-trust"><IconShield size={12} /> Doğrulanmış</span>
      </div>
      <table className="w-full text-left text-[13.5px]">
        <thead className="bg-paper text-[12px] text-muted">
          <tr>
            <th className="px-5 py-2.5 font-medium">Uzman</th>
            <th className="hidden py-2.5 font-medium sm:table-cell">Puan</th>
            <th className="hidden py-2.5 font-medium sm:table-cell">Tamamlanan</th>
            <th className="px-5 py-2.5 text-right font-medium">Başlangıç</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-2">
          {items.map((p) => (
            <tr key={p.slug} className="transition-colors hover:bg-[#f7f9fe]">
              <td className="w-full max-w-0 px-5 py-3.5 sm:w-[48%]">
                <Link href={`/uzman/${p.slug}`} className="flex items-center gap-3">
                  <Avatar name={p.displayName} src={fileUrl(p.avatarId)} size={34} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{p.displayName}</span>
                    <span className="block truncate text-[12px] text-muted">{p.headline}</span>
                  </span>
                </Link>
              </td>
              {cell(p.ratingCount > 0 ? <span className="inline-flex items-center gap-1 font-medium"><IconStar filled size={12} className="text-[#f5b400]" />{formatRating(p.ratingAvg)} <span className="font-normal text-muted">({p.ratingCount})</span></span> : <span className="text-muted">Yeni</span>, "hidden sm:table-cell")}
              {cell(<span className="num">{formatNumber(p.completedOrders)} iş</span>, "hidden sm:table-cell")}
              {cell(<span className="price">{p.fromKurus != null ? formatTRY(p.fromKurus) : "—"}</span>, "px-5 text-right")}
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/uzmanlar" className="flex items-center justify-between border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-[#f7f9fe]">
        Tüm doğrulanmış uzmanlar ({formatNumber(total)}) <IconArrowRight size={15} />
      </Link>
    </div>
  );
}
