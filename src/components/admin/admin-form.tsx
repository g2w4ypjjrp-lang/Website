"use client";
import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";
import { Notice } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/button";

/** Sunucu eylemine bağlı, sonuç mesajını gösteren genel form kabuğu. Alanlar kontrolsüz (defaultValue) girilir. */
export function AdminForm({ action, children, submit = "Kaydet", className }: { action: (s: FormState, f: FormData) => Promise<FormState>; children: React.ReactNode; submit?: string; className?: string }) {
  const [s, act] = useActionState<FormState, FormData>(action, undefined);
  const fe = s?.fieldErrors ?? {};
  return (
    <form action={act} className={className ?? "space-y-4"}>
      {s?.ok && <Notice tone="ok">{s.ok}</Notice>}
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      {Object.keys(fe).length > 0 && <Notice tone="bad">{Object.entries(fe).map(([k, v]) => `${k}: ${v?.[0]}`).join(" · ")}</Notice>}
      {children}
      <div className="sticky bottom-0 -mx-1 bg-paper/95 px-1 py-3 backdrop-blur"><SubmitButton pendingText="Kaydediliyor">{submit}</SubmitButton></div>
    </form>
  );
}

export function F({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block text-[13px] ${className ?? ""}`}>
      <span className="mb-1 block font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

export function CharCount({ name, defaultValue, max, placeholder }: { name: string; defaultValue?: string | null; max: number; placeholder?: string }) {
  return <input name={name} defaultValue={defaultValue ?? ""} maxLength={max} placeholder={placeholder} className="field !py-2 text-[14px]" />;
}
