import Link from "next/link";

/** Eksen işareti: kesişen iki eksen ve kesişim noktasında kiremit renkli düğüm. */
export function LogoMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1.75" y="1.75" width="20.5" height="20.5" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 2v20M2 14.5h20" stroke="currentColor" strokeWidth="2" />
      <rect x="6.25" y="11.75" width="5.5" height="5.5" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ href = "/", className = "", tone = "ink" }: { href?: string; className?: string; tone?: "ink" | "light" }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${tone === "light" ? "text-white" : "text-ink"} ${className}`} aria-label="Eksen ana sayfa">
      <LogoMark />
      <span className="font-display text-[21px] font-bold leading-none tracking-[-0.045em]">eksen</span>
    </Link>
  );
}
