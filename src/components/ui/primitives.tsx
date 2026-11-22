import type { ReactNode } from "react";
import { cn, initials, formatRating } from "@/lib/utils";
import { IconStar, IconShield } from "@/components/icons";

export function Field({ label, htmlFor, hint, error, children, optional, className }: { label: string; htmlFor?: string; hint?: ReactNode; error?: string | string[]; children: ReactNode; optional?: boolean; className?: string }) {
  const err = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[13.5px] font-medium text-ink">
        {label}
        {optional && <span className="text-[12px] font-normal text-faint">İsteğe bağlı</span>}
      </label>
      {children}
      {err ? (
        <p className="text-[13px] text-bad" role="alert">{err}</p>
      ) : hint ? (
        <p className="text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const tones = {
  neutral: "bg-paper-2 text-ink-2",
  info: "bg-info-soft text-info",
  warn: "bg-warn-soft text-warn",
  ok: "bg-trust-soft text-trust",
  bad: "bg-bad-soft text-bad",
  accent: "bg-accent-soft text-accent-strong",
  ink: "bg-ink text-white",
};
export function Badge({ tone = "neutral", children, className, dot }: { tone?: keyof typeof tones; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium leading-4", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const palette = ["#0e5a4e", "#274a7a", "#6b3d8f", "#9a6512", "#b5361e", "#3a3f47"];
export function Avatar({ name, src, size = 36, className, online }: { name: string; src?: string | null; size?: number; className?: string; online?: boolean }) {
  const color = palette[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return (
    <span className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src.startsWith("/api/files/") && !src.includes("?") ? `${src}?w=${size > 80 ? 320 : 160}` : src} alt="" width={size} height={size} loading="lazy" decoding="async" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full font-display font-semibold text-white" style={{ background: color, fontSize: size * 0.38 }}>
          {initials(name)}
        </span>
      )}
      {online && <span className="absolute bottom-0 right-0 h-[28%] w-[28%] rounded-full border-2 border-surface bg-[#1f9d55]" title="Çevrimiçi" />}
    </span>
  );
}

export function Rating({ value, count, size = "sm" }: { value: number; count: number; size?: "sm" | "md" }) {
  if (count === 0) return <span className={cn("text-muted", size === "sm" ? "text-[13px]" : "text-sm")}>Henüz değerlendirme yok</span>;
  return (
    <span className={cn("inline-flex items-center gap-1", size === "sm" ? "text-[13px]" : "text-[15px]")}>
      <IconStar filled size={size === "sm" ? 13 : 15} className="text-accent" />
      <span className="font-semibold text-ink">{formatRating(value)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}

export function VerifiedMark({ label = "Doğrulanmış" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-trust" title="Kimlik ve iletişim bilgileri Eksen tarafından doğrulandı">
      <IconShield size={14} /> {label}
    </span>
  );
}

export function EmptyState({ title, body, action, className }: { title: string; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-3 rounded-lg border border-dashed border-line bg-surface/60 px-6 py-10 sm:items-center sm:text-center", className)}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="text-line">
        <rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M15 4v32M4 24h32" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="21" width="6" height="6" fill="var(--color-accent)" opacity=".5" />
      </svg>
      <p className="font-display text-[17px] font-semibold text-ink">{title}</p>
      {body && <div className="max-w-md text-[14px] text-muted">{body}</div>}
      {action}
    </div>
  );
}

export function Notice({ tone = "info", children, className }: { tone?: "info" | "ok" | "warn" | "bad"; children: ReactNode; className?: string }) {
  const map = { info: "border-info/20 bg-info-soft text-info", ok: "border-trust/20 bg-trust-soft text-trust", warn: "border-warn/20 bg-warn-soft text-warn", bad: "border-bad/20 bg-bad-soft text-bad" };
  return <div className={cn("rounded-md border px-3.5 py-2.5 text-[14px]", map[tone], className)} role={tone === "bad" ? "alert" : "status"}>{children}</div>;
}

export function SectionHead({ eyebrow, title, action, className }: { eyebrow?: string; title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-6", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[26px] font-semibold sm:text-[30px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, className }: { label: string; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-[14px] border border-line bg-surface p-4 shadow-xs sm:p-5", className)}>
      <p className="text-[12.5px] font-medium text-muted">{label}</p>
      <p className="num mt-1.5 truncate text-[24px] font-semibold tracking-[-0.02em] text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-faint">{sub}</p>}
    </div>
  );
}
