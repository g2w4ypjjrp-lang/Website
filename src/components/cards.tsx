import Link from "next/link";
import { Avatar, Rating, Badge } from "@/components/ui/primitives";
import { IconClock, IconShield } from "@/components/icons";
import { formatTRY, cn } from "@/lib/utils";
import { LEVEL_LABEL } from "@/lib/order-status";
import { fileUrl } from "@/lib/utils";
import { isOnline, type ServiceCardData } from "@/server/queries";

const MOTIFS: Record<string, { bg: string; fg: string; draw: (fg: string) => React.ReactNode }> = {
  "web-ve-yazilim": {
    bg: "#e7ebe4",
    fg: "#0e5a4e",
    draw: (c) => (
      <>
        <rect x="24" y="22" width="152" height="96" rx="4" fill="none" stroke={c} strokeWidth="2" />
        <path d={`M24 38h152`} stroke={c} strokeWidth="2" />
        <circle cx="34" cy="30" r="2.5" fill={c} /><circle cx="43" cy="30" r="2.5" fill={c} />
        <rect x="36" y="50" width="60" height="8" fill={c} opacity=".85" />
        <rect x="36" y="64" width="90" height="4" fill={c} opacity=".35" />
        <rect x="36" y="72" width="76" height="4" fill={c} opacity=".35" />
        <rect x="132" y="50" width="32" height="56" fill="#c63e22" />
      </>
    ),
  },
  "mobil-uygulama": {
    bg: "#e5eaf3",
    fg: "#274a7a",
    draw: (c) => (
      <>
        <rect x="78" y="14" width="44" height="112" rx="8" fill="none" stroke={c} strokeWidth="2" />
        <rect x="86" y="30" width="28" height="28" fill="#c63e22" />
        <rect x="86" y="64" width="28" height="4" fill={c} opacity=".4" />
        <rect x="86" y="72" width="20" height="4" fill={c} opacity=".4" />
        <path d="M94 116h12" stroke={c} strokeWidth="2" />
        <path d="M30 70h36M134 70h36" stroke={c} strokeWidth="2" strokeDasharray="3 4" />
      </>
    ),
  },
  "grafik-tasarim": {
    bg: "#f3e9e2",
    fg: "#8a3a22",
    draw: (c) => (
      <>
        <circle cx="86" cy="72" r="38" fill="none" stroke={c} strokeWidth="2" />
        <rect x="96" y="44" width="56" height="56" fill="#c63e22" opacity=".9" />
        <path d="M20 118h160" stroke={c} strokeWidth="2" />
        <path d="M86 20v104M30 72h130" stroke={c} strokeWidth="1" strokeDasharray="2 4" />
      </>
    ),
  },
  "dijital-pazarlama": {
    bg: "#efece2",
    fg: "#3a3f47",
    draw: (c) => (
      <>
        <path d="M26 118h148" stroke={c} strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={36 + i * 28} y={110 - (i + 1) * 15} width="16" height={(i + 1) * 15} fill={i === 4 ? "#c63e22" : c} opacity={i === 4 ? 1 : 0.25 + i * 0.12} />
        ))}
        <path d="M44 90 72 74l28 8 28-26 30-18" fill="none" stroke={c} strokeWidth="2" />
      </>
    ),
  },
  "video-ve-icerik": {
    bg: "#e9e5ee",
    fg: "#4b3470",
    draw: (c) => (
      <>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={28 + i * 50} y="36" width="44" height="68" rx="3" fill={i === 1 ? "#c63e22" : "none"} stroke={c} strokeWidth="2" />
        ))}
        <path d="M95 60v20l16-10-16-10Z" fill="#fff" />
        <path d="M28 120h144" stroke={c} strokeWidth="2" strokeDasharray="10 6" />
      </>
    ),
  },
  "yapay-zeka": {
    bg: "#e3ece9",
    fg: "#0e5a4e",
    draw: (c) => (
      <>
        {[[50, 40], [100, 30], [150, 46], [64, 100], [136, 104]].map(([x, y], i) => (
          <path key={i} d={`M100 72L${x} ${y}`} stroke={c} strokeWidth="1.5" />
        ))}
        {[[50, 40], [100, 30], [150, 46], [64, 100], [136, 104]].map(([x, y], i) => (
          <circle key={`c${i}`} cx={x} cy={y} r="6" fill="#fff" stroke={c} strokeWidth="2" />
        ))}
        <rect x="88" y="60" width="24" height="24" fill="#c63e22" />
      </>
    ),
  },
};

/** Kapak görseli olmayan hizmetler için kategoriye özgü çizimsel kapak. Stok fotoğraf yerine tutarlı bir dil. */
export function ServiceCover({ rootSlug, coverId, title, className, priority }: { rootSlug: string; coverId?: string | null; title: string; className?: string; priority?: boolean }) {
  if (coverId)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fileUrl(coverId)!} alt={title} width={600} height={420} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("aspect-[10/7] w-full object-cover", className)} />
    );
  const m = MOTIFS[rootSlug] ?? MOTIFS["web-ve-yazilim"]!;
  return (
    <svg viewBox="0 0 200 140" className={cn("cover-grid aspect-[10/7] w-full", className)} role="img" aria-label={title} style={{ backgroundColor: m.bg }}>
      {m.draw(m.fg)}
    </svg>
  );
}

/** Kategori motifinin küçük, kırpılmış hâli: dizinlerde ve menülerde kategori işareti olarak. */
export function CategoryGlyph({ slug, size = 56, className }: { slug: string; size?: number; className?: string }) {
  const m = MOTIFS[slug] ?? MOTIFS["web-ve-yazilim"]!;
  return (
    <svg viewBox="20 10 160 120" width={size} height={size * 0.75} className={cn("shrink-0 rounded-md", className)} style={{ background: m.bg }} aria-hidden>
      {m.draw(m.fg)}
    </svg>
  );
}

export function ServiceCard({ s, className }: { s: ServiceCardData; className?: string }) {
  const featured = s.featuredUntil && new Date(s.featuredUntil) > new Date();
  return (
    <article className={cn("group relative flex flex-col rounded-lg border border-line bg-surface p-2 transition-[box-shadow,transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift", className)}>
      <div className="relative overflow-hidden rounded-md">
        <ServiceCover rootSlug={s.rootSlug} coverId={s.coverId} title={s.title} className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <span className="absolute bottom-2 left-2 rounded-sm bg-surface/90 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-2 backdrop-blur-sm">{s.categoryName}</span>
        {(s.sponsored || featured) && (
          <span className="absolute right-2 top-2 rounded-sm bg-ink px-1.5 py-0.5 text-[11px] font-medium text-white">{s.sponsored ? "Sponsorlu" : "Öne çıkan"}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3">
        <div className="flex items-center gap-2">
          <Avatar name={s.providerName} src={fileUrl(s.providerAvatarId)} size={22} online={isOnline(s.providerLastSeen)} />
          <span className="truncate text-[13px] font-medium text-ink-2">{s.providerName}</span>
          {s.providerVerified && <IconShield size={13} className="shrink-0 text-trust" aria-label="Doğrulanmış" />}
          <span className="ml-auto shrink-0 text-[11.5px] text-faint">{LEVEL_LABEL[s.providerLevel]}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-ink">
          <Link href={`/hizmet/${s.slug}`} className="after:absolute after:inset-0 after:rounded-lg">
            {s.title}
          </Link>
        </h3>
        <div className="mt-1.5"><Rating value={s.ratingAvg} count={s.ratingCount} /></div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <span className="flex items-center gap-1 text-[12.5px] text-muted"><IconClock size={13} /> {s.minDeliveryDays} gün</span>
          <span className="text-right leading-none">
            <span className="block text-[11px] text-muted">başlangıç</span>
            <span className="num text-[17px] font-medium text-ink">{formatTRY(s.startingPriceKurus)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function ServiceGrid({ items, className }: { items: ServiceCardData[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5", className)}>
      {items.map((s) => (
        <ServiceCard key={s.id} s={s} />
      ))}
    </div>
  );
}

type ProviderCardData = {
  slug: string;
  displayName: string;
  headline: string;
  city: string | null;
  level: keyof typeof LEVEL_LABEL;
  verifiedAt: Date | null;
  ratingAvg: number;
  ratingCount: number;
  completedOrders: number;
  skills: string[];
  avatarId: string | null;
  lastSeenAt: Date | null;
  accountType: "individual" | "agency" | "company";
  premiumUntil?: Date | null;
};

export function ProviderRow({ p, compact }: { p: ProviderCardData; compact?: boolean }) {
  return (
    <article className="group relative flex gap-4 py-5">
      <Avatar name={p.displayName} src={fileUrl(p.avatarId)} size={52} online={isOnline(p.lastSeenAt)} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="text-[16px] font-semibold">
            <Link href={`/uzman/${p.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">{p.displayName}</Link>
          </h3>
          {p.verifiedAt && <IconShield size={14} className="text-trust" aria-label="Doğrulanmış" />}
          {p.accountType !== "individual" && <Badge>{p.accountType === "agency" ? "Ajans" : "Şirket"}</Badge>}
          {p.premiumUntil && new Date(p.premiumUntil) > new Date() && <Badge tone="ink">Premium</Badge>}
        </div>
        <p className="mt-0.5 truncate text-[14px] text-ink-2">{p.headline || "Profilini hazırlıyor"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <Rating value={p.ratingAvg} count={p.ratingCount} />
          {p.completedOrders > 0 && <span>{p.completedOrders} tamamlanan iş</span>}
          {p.city && <span>{p.city}</span>}
          <span>{LEVEL_LABEL[p.level]}</span>
        </div>
      </div>
      <ul className={cn("hidden max-w-[260px] flex-wrap content-start justify-end gap-1.5", !compact && "md:flex")}>
        {p.skills.slice(0, 4).map((s) => (
          <li key={s} className="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-ink-2">{s}</li>
        ))}
      </ul>
    </article>
  );
}
