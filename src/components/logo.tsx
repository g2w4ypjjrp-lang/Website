import Link from "next/link";

/** Eksen işareti: kesişen iki eksen ve kesişim noktasında kiremit renkli düğüm. */
export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1.75" y="1.75" width="20.5" height="20.5" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 2v20M2 14.5h20" stroke="currentColor" strokeWidth="2" />
      <rect x="6.25" y="11.75" width="5.5" height="5.5" fill="var(--color-accent-bright)" />
    </svg>
  );
}

/** Tema 3 (Gece Moru) işareti: mor tonlu üst üste üç katman. */
export function LogoMarkLayers({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <defs>
        <linearGradient id="lg-neo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4b5fd" /><stop offset="1" stopColor="#6d4aff" /></linearGradient>
      </defs>
      <path d="M8 3h14l-6 6H2z" fill="url(#lg-neo)" />
      <path d="M8 11h14l-6 6H2z" fill="url(#lg-neo)" opacity=".85" />
      <path d="M8 19h14l-6 6H2z" fill="url(#lg-neo)" opacity=".7" />
    </svg>
  );
}

/** Tema 4 (Gün Işığı) işareti: turuncu iki eğik şerit (şimşek). */
export function LogoMarkBolt({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <path d="M11 2h15L17 12H2z" fill="var(--color-accent-bright)" />
      <path d="M11 16h15l-9 10H2z" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ href = "/", className = "", tone = "ink", variant = "default" }: { href?: string; className?: string; tone?: "ink" | "light"; variant?: "default" | "neo" | "sunrise" }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${tone === "light" ? "text-white" : "text-ink"} ${className}`} aria-label="Eksen ana sayfa">
      {variant === "neo" ? <LogoMarkLayers /> : variant === "sunrise" ? <LogoMarkBolt /> : <LogoMark />}
      {variant === "default" ? (
        <span className="font-display text-[21px] font-bold leading-none tracking-[-0.045em]">eksen</span>
      ) : (
        <span className="font-display text-[24px] font-bold leading-none tracking-[-0.035em]">Eksen</span>
      )}
    </Link>
  );
}
