import Link from "next/link";
import type { ReactNode } from "react";
import { SearchBox } from "@/components/site/header-search";
import { CategoryIcon, CompactServiceCard } from "@/components/cards";
import { CitySelect } from "@/components/city-select";
import { Avatar } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowRight, IconChat, IconCheck, IconLock, IconRefresh, IconScale, IconShield, IconStar } from "@/components/icons";
import { fileUrl, formatNumber, formatRating, formatTRY } from "@/lib/utils";
import { Guides, StoriesAndReviews } from "./parts";
import type { HomeData } from "./types";

const FREQUENT = [
  ["Kurumsal web sitesi", "/web-sitesi-yaptirma"],
  ["E-ticaret sitesi", "/e-ticaret-sitesi"],
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

const GUARANTEES = [
  [IconLock, "Korunan ödeme", "Tutar, teslimatı onaylayana kadar havuz hesabında bekler; iş tamamlanmadan uzmana aktarılmaz."],
  [IconShield, "Doğrulanmış uzmanlar", "Kimlik ve vergi bilgisi kontrol edilen uzmanlar profilde rozetle gösterilir."],
  [IconRefresh, "Yazılı kapsam ve revizyon", "Paket kapsamı, teslim süresi ve revizyon hakkı sipariş sayfasında açıkça yazar."],
  [IconChat, "Kayıtlı iletişim", "Her siparişin kendi mesaj ve dosya alanı vardır; konuşmalar kayıt altında tutulur."],
  [IconScale, "Uyuşmazlık çözümü", "Teslim şartlara uymazsa itiraz açılır; Eksen ekibi kayıtları inceleyip karar verir."],
  [IconCheck, "Kart bilgisi saklanmaz", "Ödemeler lisanslı ödeme kuruluşu üzerinden alınır; kart bilgileriniz Eksen’de tutulmaz."],
] as const;

const CORPORATE = ["Hesap yöneticisi ve karşılaştırmalı kısa liste", "Kapsam, gizlilik ve fikri mülkiyet şartları yazılı", "Şirket unvanıyla kayıtlı siparişler, dönemsel döküm", "Talep, revizyon ve itirazlarda öncelik"] as const;

/** Bölüm başlığı: etiket, başlık, açıklama; sağda yazı biçiminde bağlantı. */
function Head({ eyebrow, title, sub, href, cta }: { eyebrow: string; title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="text-balance text-[length:var(--h2-size)] font-semibold leading-[1.12] tracking-[-0.03em]">{title}</h2>
        {sub && <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{sub}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-[14.5px] font-semibold text-accent">
          {cta} <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Girişteki teklif formu: seçilen kategori ve il ile proje oluşturma sayfasını doldurulmuş açar (ek istek yok). */
function QuoteCard({ tree }: { tree: HomeData["tree"] }) {
  return (
    <form action="/proje-olustur" method="get" className="relative rounded-2xl border border-line bg-surface p-6 shadow-pop sm:p-8">
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
      <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-accent text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-accent-strong">
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

/** Tema 5 · Ultra Profesyonel ana sayfası (lacivert ve kurumsal mavi, ince çizgiler, kurumsal dil). */
export function HomeUltra({ d }: { d: HomeData }) {
  const st = d.stats;
  // Yalnızca gerçek kayıtlar; değerlendirme yoksa oran yerine çizgi
  const stats: { v: string; l: string; s?: string }[] = [
    { v: formatNumber(st.providers), l: "Aktif uzman" },
    { v: formatNumber(st.completed), l: "Tamamlanan proje" },
    { v: st.satisfaction != null ? `%${st.satisfaction}` : "—", l: "Müşteri memnuniyeti", s: st.reviews ? `${formatNumber(st.reviews)} değerlendirme` : "henüz değerlendirme yok" },
    { v: "81", l: "İlde hizmet" },
  ];
  const services = d.pool.slice(0, d.pool.length >= 8 ? 8 : 4);
  const shortlist = d.providers.slice(0, 4);
  return (
    <>
      {/* ───────── Giriş ───────── */}
      <section className="relative overflow-hidden border-b border-line bg-surface">
        {/* İnce teknik ızgara; sağ üstte belirgin, kenarlara doğru söner */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(11_21_38/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(11_21_38/0.05)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_75%_at_78%_35%,#000_25%,transparent_72%)]" />
        <div className="container-x relative grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-2 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-trust" /> Doğrulanmış uzmanlar · Korunan ödeme · 81 il
            </p>
            <h1 className="mt-6 text-balance text-[length:var(--hero-size)] font-semibold leading-[1.05] tracking-[-0.038em]">
              Dijital işleriniz için doğrulanmış uzmanlar, <span className="text-accent">güvenceli süreç.</span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-ink-2">Web sitesi, yazılım, tasarım ve dijital pazarlama işlerinizi teklif, yazılı kapsam ve korunan ödemeyle tek yerden yönetin.</p>
            <div className="mt-8 max-w-[620px]"><SearchBox size="lg" placeholder="Hangi hizmete ihtiyacınız var?" buttonLabel={<>Uzman bul <IconArrowRight size={15} /></>} /></div>
            <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13.5px]">
              <span className="mr-0.5 font-medium text-ink-2">Sık arananlar:</span>
              {FREQUENT.map(([t, href], i) => (
                <span key={href} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden className="text-faint">·</span>}
                  <Link href={href} className="text-muted underline-offset-4 transition-colors hover:text-accent hover:underline">{t}</Link>
                </span>
              ))}
            </p>
          </div>
          <QuoteCard tree={d.tree} />
        </div>
      </section>

      {/* ───────── Gerçek verili rakamlar ───────── */}
      <section className="border-b border-line bg-paper">
        <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
          {stats.map(({ v, l, s }, i) => (
            <div key={l} className={`py-7 sm:py-8 ${i % 2 ? "border-l border-line pl-5 sm:pl-8" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-8" : ""}`}>
              <dt className="sr-only">{l}</dt>
              <dd className="num text-[30px] font-semibold leading-none tracking-[-0.03em] sm:text-[34px]">{v}</dd>
              <dd className="mt-2 text-[13.5px] text-ink-2">{l}{s && <span className="block text-[12.5px] text-muted sm:inline"><span className="hidden sm:inline"> · </span>{s}</span>}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────── Kategori dizini ───────── */}
      <section className="container-x py-16 sm:py-20">
        <Head eyebrow="Hizmet alanları" title="Her ihtiyaç için uzman kadrosu" sub="Ana kategoriler ve en çok talep gören alt hizmetler. Uzman sayıları yayındaki gerçek kayıtlardan." href="/kategoriler" cta="Tüm kategoriler" />
        {/* Mobilde kısa iki sütun (kartın tamamı bağlantı); geniş ekranda alt hizmet listeli dizin */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {d.tree.slice(0, 8).map((c) => {
            const n = d.catCounts[c.slug] ?? 0;
            const count = n > 0 ? `${n} uzman` : `${c.children.length} alt hizmet`;
            return (
              <div key={c.id} className="group relative flex flex-col bg-surface p-4 transition-colors hover:bg-[#fbfcfe] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent"><CategoryIcon slug={c.slug} size={20} /></span>
                  <span className="num hidden text-[12.5px] text-muted sm:inline">{count}</span>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold leading-snug sm:mt-4 sm:text-[16.5px]">
                  <Link href={`/kategori/${c.slug}`} className="transition-colors after:absolute after:inset-0 hover:text-accent sm:after:hidden">{c.name}</Link>
                </h3>
                <p className="num mt-0.5 text-[12.5px] text-muted sm:hidden">{count}</p>
                <ul className="mt-3 hidden space-y-1.5 text-[14px] sm:block">
                  {c.children.slice(0, 4).map((s) => <li key={s.id}><Link href={`/kategori/${s.slug}`} className="text-ink-2 transition-colors hover:text-accent">{s.name}</Link></li>)}
                </ul>
                <Link href={`/kategori/${c.slug}`} className="mt-auto hidden items-center gap-1 pt-5 text-[13.5px] font-semibold text-accent sm:inline-flex">Tümünü gör <IconArrowRight size={14} /></Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────── Süreç ───────── */}
      <section className="border-y border-line bg-paper">
        <div className="container-x grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Süreç</p>
            <h2 className="text-balance text-[length:var(--h2-size)] font-semibold leading-[1.12] tracking-[-0.03em]">Dört adımda, kayıt altında.</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-muted">Her adım sipariş sayfasında görünür. Mesajlar, dosyalar ve onaylar kayıt altında tutulur.</p>
            <Link href="/nasil-calisir" className="group mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-accent">Süreci ayrıntılı inceleyin <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></Link>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {STEPS.map(([t, x], i) => (
              <li key={t} className="bg-surface p-6 sm:p-7">
                <span className="num text-[13px] font-semibold text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 text-[17px] font-semibold tracking-[-0.01em]">{t}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{x}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Hizmet paketleri ───────── */}
      {services.length > 0 && (
        <section className="container-x py-16 sm:py-20">
          <Head eyebrow="Hizmet paketleri" title="Kapsamı, süresi ve fiyatı belli paketler" sub="Teklif beklemeden hemen satın alınabilir; ödeme yine onayınıza kadar korunur." href="/ara?siralama=yeni" cta="Tüm hizmetler" />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => <div key={s.id} className="grid grid-cols-1"><CompactServiceCard s={s} /></div>)}
          </div>
        </section>
      )}

      {/* ───────── Kurumsal ───────── */}
      <section className="bg-[#0a1628] text-white">
        <div className="container-x grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <p className="text-[13px] font-semibold text-[#8fb0ff]">Eksen Kurumsal</p>
            <h2 className="mt-3 text-balance text-[length:var(--h2-size)] font-semibold leading-[1.12] tracking-[-0.03em]">Şirketiniz için tek muhatap, yazılı çalışma şartları.</h2>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-white/70">Hesap yöneticiniz ihtiyacı sizinle netleştirir, doğrulanmış uzmanlardan karşılaştırmalı kısa liste hazırlar ve işi baştan sona takip eder.</p>
            <ul className="mt-7 grid gap-3 text-[14.5px] text-white/85 sm:grid-cols-2">
              {CORPORATE.map((t) => <li key={t} className="flex gap-2.5"><IconCheck size={16} className="mt-0.5 shrink-0 text-[#8fb0ff]" />{t}</li>)}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/kurumsal" size="lg" variant="accent">Kurumsal görüşme talep edin</ButtonLink>
              <Link href="/fiyatlar" className="inline-flex h-12 items-center rounded-[var(--radius-btn)] border border-white/20 px-6 text-[15.5px] font-medium text-white transition-colors hover:border-white/50">Ücretler</Link>
            </div>
          </div>
          {shortlist.length > 0 && <Shortlist items={shortlist} />}
        </div>
      </section>

      {/* ───────── Güvenceler ───────── */}
      <section className="container-x py-16 sm:py-20">
        <Head eyebrow="Güvence" title="Kurumsal işlerde aranan güvenceler, her siparişte" href="/yardim" cta="Yardım merkezi" />
        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {GUARANTEES.map(([I, t, x]) => (
            <div key={t} className="bg-surface p-6 sm:p-7">
              <I size={20} className="text-accent" />
              <h3 className="mt-4 text-[16px] font-semibold">{t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{x}</p>
            </div>
          ))}
        </div>
      </section>

      <StoriesAndReviews d={d} />
      <Guides d={d} />

      {/* ───────── Çağrı ───────── */}
      <section className="container-x">
        <div className="grid gap-8 rounded-2xl border border-line bg-surface p-8 shadow-card sm:p-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[36px]">Projenizi bugün yayınlayın.</h2>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">Proje yayınlamak ücretsiz. Teklifleri karşılaştırır, yalnızca seçtiğiniz uzmanla çalışırsınız; ödemeniz onayınıza kadar güvende kalır.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <ButtonLink href="/proje-olustur" size="lg" variant="accent">Ücretsiz proje oluştur</ButtonLink>
            <ButtonLink href="/kurumsal" size="lg" variant="outline">Kurumsal görüşme</ButtonLink>
          </div>
          <p className="border-t border-line pt-6 text-[14px] text-muted lg:col-span-2">
            Uzman mısınız? Üyelik ücretsiz; yalnızca tamamlanan siparişlerden %{d.commission} hizmet bedeli alınır.{" "}
            <Link href="/kayit?rol=uzman" className="font-semibold text-accent hover:underline">Uzman olarak katılın</Link>
          </p>
        </div>
      </section>
    </>
  );
}

/** Kurumsal bölümdeki kısa liste: platformdaki gerçek, kimliği doğrulanmış uzmanlar (puan, iş sayısı, başlangıç fiyatı). */
function Shortlist({ items }: { items: HomeData["providers"] }) {
  const cell = (c: ReactNode, cls = "") => <td className={`py-3.5 ${cls}`}>{c}</td>;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
      <div className="overflow-hidden rounded-xl bg-surface text-ink shadow-pop">
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
              <tr key={p.slug} className="transition-colors hover:bg-[#fbfcfe]">
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
        <Link href="/uzmanlar" className="flex items-center justify-between border-t border-line px-5 py-3.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-[#fbfcfe]">
          Tüm doğrulanmış uzmanlar <IconArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
