import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight, IconStar } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import type { HomeData } from "./types";

/** Bölüm başlığı: etiket, başlık, açıklama ve sağda isteğe bağlı bağlantı. Başlık boyutu temaya göre (--h2-size). */
export function SectionHead({ eyebrow, title, sub, href, cta, center }: { eyebrow?: string; title: string; sub?: string; href?: string; cta?: string; center?: boolean }) {
  return (
    <div className={`mb-8 flex flex-wrap items-end gap-x-8 gap-y-4 sm:mb-10 ${center ? "flex-col items-center text-center" : "justify-between"}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-2.5">{eyebrow}</p>}
        <h2 className="text-[length:var(--h2-size)] font-semibold">{title}</h2>
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

/** İkonlu özellik kutusu (güven alanları). */
export function FeatureTile({ icon, tone, title, text, href, cta }: { icon: ReactNode; tone: string; title: string; text: string; href?: string; cta?: string }) {
  return (
    <div className={`card relative flex flex-col p-6 ${href ? "card-hover group" : ""}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
      <h3 className="mt-4 text-[16.5px] font-semibold">
        {href ? <Link href={href} className="after:absolute after:inset-0 after:rounded-xl">{title}</Link> : title}
      </h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{text}</p>
      {href && cta && <p className="mt-auto flex items-center gap-1.5 pt-4 text-[14px] font-medium text-ink transition-colors group-hover:text-accent-strong">{cta} <IconArrowRight size={14} /></p>}
    </div>
  );
}

/** Popüler arama çipleri. */
export function QuickChips({ items, label = "Popüler", center }: { items: readonly (readonly [string, string])[]; label?: string; center?: boolean }) {
  return (
    <div className={`-mx-4 mt-5 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-y-2 sm:px-0 ${center ? "sm:justify-center" : ""}`}>
      <span className="mr-1 shrink-0 text-[13px] text-muted">{label}</span>
      {items.map(([t, href]) => (
        <Link key={href} href={href} className="chip shrink-0 shadow-xs">{t}</Link>
      ))}
    </div>
  );
}

/** Başarı hikâyeleri ve gerçek değerlendirmeler (yalnızca tamamlanmış siparişlerden). */
export function StoriesAndReviews({ d }: { d: HomeData }) {
  if (!d.stories.length && !d.otherReviews.length) return null;
  return (
    <section className="container-x pb-16 sm:pb-24">
      <SectionHead eyebrow="Tamamlanan işler" title="Eksen üzerinden tamamlanan işler" sub="Yalnızca siparişi tamamlanan müşteriler değerlendirme yazabilir." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {d.stories.map((st) => {
          const days = st.startedAt && st.completedAt ? Math.max(1, Math.round((+st.completedAt - +st.startedAt) / 864e5)) : st.deliveryDays;
          return (
            <article key={st.r.id} className="card flex flex-col p-6">
              <p className="flex items-center gap-2 text-[12.5px] font-medium"><span className="rounded-full bg-trust-soft px-2 py-0.5 text-trust">{days} günde tamamlandı</span><span className="flex items-center gap-1 text-accent"><IconStar filled size={12} /> {st.r.rating}/5</span></p>
              <h3 className="mt-3 text-[18px] font-semibold">{st.r.storyTitle ?? st.orderTitle}</h3>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">“{st.r.comment}”</blockquote>
              <p className="mt-5 border-t border-line-2 pt-4 text-[13px] text-muted">{shortName(st.buyerName)} · uzman <Link href={`/uzman/${st.providerSlug}`} className="text-ink underline underline-offset-2">{st.providerName}</Link></p>
            </article>
          );
        })}
        {d.otherReviews.map(({ r, buyerName, providerName, providerSlug }) => (
          <figure key={r.id} className="card flex flex-col p-6">
            <div className="flex gap-0.5 text-accent" role="img" aria-label={`${r.rating} yıldız`}>{Array.from({ length: r.rating }).map((_, i) => <IconStar key={i} filled size={13} />)}</div>
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">“{r.comment}”</blockquote>
            <figcaption className="mt-4 text-[13px] text-muted">{shortName(buyerName)} → <Link href={`/uzman/${providerSlug}`} className="underline underline-offset-2">{providerName}</Link></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/** Rehber yazıları. */
export function Guides({ d }: { d: HomeData }) {
  if (!d.posts.length) return null;
  return (
    <section className="container-x pb-16 sm:pb-24">
      <SectionHead eyebrow="Rehberler" title="Sipariş vermeden önce oku" href="/blog" cta="Tüm yazılar" />
      <div className="grid gap-4 md:grid-cols-3">
        {d.posts.map((p) => (
          <article key={p.id} className="card card-hover group relative flex flex-col p-6">
            <p className="eyebrow">{p.category} · {p.readingMinutes} dk</p>
            <h3 className="mt-3 text-[18px] font-semibold"><Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 after:rounded-xl">{p.title}</Link></h3>
            <p className="mt-3 line-clamp-3 text-[14.5px] text-ink-2">{p.excerpt}</p>
            <p className="mt-auto flex items-center justify-between pt-6 text-[12.5px] text-muted">{p.publishedAt && formatDate(p.publishedAt)}<span className="flex items-center gap-1 font-medium text-ink transition-colors group-hover:text-accent-strong">Oku <IconArrowRight size={13} /></span></p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function shortName(full: string) {
  const [a, b] = full.split(" ");
  return `${a}${b?.[0] ? ` ${b[0]}.` : ""}`;
}

/** Üç sütunlu ızgarada yarım satır bırakmamak için öğe sayısını 3 ya da 6'ya indirir (3'ten azsa olduğu gibi). */
export function fullRows<T>(items: T[]): T[] {
  return items.length >= 6 ? items.slice(0, 6) : items.length >= 3 ? items.slice(0, 3) : items;
}
