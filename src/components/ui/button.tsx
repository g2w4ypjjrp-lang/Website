"use client";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger" | "trust";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-xs hover:bg-[#262a31] active:bg-black",
  accent: "bg-accent text-white shadow-xs hover:bg-accent-strong",
  trust: "bg-trust text-white shadow-xs hover:bg-[#0b4a40]",
  outline: "border border-line bg-surface text-ink shadow-xs hover:border-ink/30 hover:bg-paper",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger: "border border-bad/30 bg-surface text-bad hover:bg-bad-soft",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13.5px] gap-1.5",
  md: "h-10 px-4 text-[14.5px] gap-2",
  lg: "h-12 px-6 text-[15.5px] gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[background,border-color,color,transform,box-shadow] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant, size, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button {...p} className={buttonClass(variant, size, className)} />;
}

export function ButtonLink({ href, variant, size, className, children, ...rest }: { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode; prefetch?: boolean }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Form içinde gönderim durumunu kendisi bilen buton. */
export function SubmitButton({ children, pendingText, variant, size, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button {...p} type="submit" disabled={pending || p.disabled} aria-busy={pending} className={buttonClass(variant, size, className)}>
      {pending ? (
        <>
          <Spinner />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
