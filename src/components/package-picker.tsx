"use client";
import { useState } from "react";
import { createOrderAction } from "@/app/actions/market";
import { SubmitButton } from "@/components/ui/button";
import { IconCheck, IconClock, IconRefresh, IconShield } from "@/components/icons";
import { cn, formatTRY } from "@/lib/utils";

type Pkg = { tier: "basic" | "standard" | "premium"; name: string; description: string; priceKurus: number; deliveryDays: number; revisions: number; features: string[] };
type Extra = { id: string; title: string; priceKurus: number; days: number };
const TIER = { basic: "Temel", standard: "Standart", premium: "Profesyonel" };

export function PackagePicker({ serviceId, packages, extras, disabledReason }: { serviceId: string; packages: Pkg[]; extras: Extra[]; disabledReason?: string }) {
  const [tier, setTier] = useState<Pkg["tier"]>(packages[Math.min(1, packages.length - 1)]?.tier ?? "basic");
  const [chosen, setChosen] = useState<string[]>([]);
  const pkg = packages.find((p) => p.tier === tier) ?? packages[0];
  if (!pkg) return null;
  const sel = extras.filter((e) => chosen.includes(e.id));
  const total = pkg.priceKurus + sel.reduce((a, e) => a + e.priceKurus, 0);
  const days = Math.max(1, pkg.deliveryDays + sel.reduce((a, e) => a + e.days, 0));
  return (
    <form action={createOrderAction} className="overflow-hidden rounded-lg border border-line bg-surface shadow-lift">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="tier" value={tier} />
      <div role="tablist" className="grid border-b border-line" style={{ gridTemplateColumns: `repeat(${packages.length}, 1fr)` }}>
        {packages.map((p) => (
          <button key={p.tier} type="button" role="tab" aria-selected={p.tier === tier} onClick={() => setTier(p.tier)} className={cn("relative py-3 text-[14px] transition-colors", p.tier === tier ? "font-semibold text-ink" : "text-muted hover:text-ink")}>
            {TIER[p.tier]}
            {p.tier === tier && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-ink" />}
          </button>
        ))}
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-[17px] font-semibold">{pkg.name}</p>
          <p className="num text-[24px] font-medium">{formatTRY(pkg.priceKurus)}</p>
        </div>
        <div className="mt-3 flex gap-5 text-[13.5px] text-ink-2">
          <span className="flex items-center gap-1.5"><IconClock size={15} /> {pkg.deliveryDays} gün teslim</span>
          <span className="flex items-center gap-1.5"><IconRefresh size={15} /> {pkg.revisions} revizyon</span>
        </div>
        <ul className="mt-4 space-y-2 text-[14px]">
          {pkg.features.map((f) => (
            <li key={f} className="flex gap-2"><IconCheck size={15} className="mt-0.5 shrink-0 text-trust" /> {f}</li>
          ))}
        </ul>
        {extras.length > 0 && (
          <fieldset className="mt-5 border-t border-line-2 pt-4">
            <legend className="mb-2 text-[13px] font-medium text-muted">Ek hizmetler</legend>
            {extras.map((e) => (
              <label key={e.id} className="flex cursor-pointer items-start gap-2.5 py-1.5 text-[14px]">
                <input type="checkbox" name="extras" value={e.id} checked={chosen.includes(e.id)} onChange={(ev) => setChosen((c) => (ev.target.checked ? [...c, e.id] : c.filter((x) => x !== e.id)))} className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]" />
                <span className="flex-1">{e.title}</span>
                <span className="num text-ink-2">+{formatTRY(e.priceKurus)}</span>
              </label>
            ))}
          </fieldset>
        )}
        <details className="mt-4 border-t border-line-2 pt-4">
          <summary className="cursor-pointer text-[13.5px] font-medium text-ink-2">Uzmana not ekle (isteğe bağlı)</summary>
          <textarea name="requirements" maxLength={4000} rows={3} placeholder="Projenizi kısaca anlatın; dosyaları sipariş sonrası mesajla iletebilirsiniz." className="field mt-2 !min-h-[90px] text-[14px]" />
        </details>
        <div className="mt-5 flex items-baseline justify-between border-t border-line-2 pt-4 text-[14px]">
          <span className="text-muted">Toplam · {days} gün</span>
          <span className="num text-[20px] font-medium">{formatTRY(total)}</span>
        </div>
        {disabledReason ? (
          <p className="mt-4 rounded-md bg-paper-2 px-3 py-2.5 text-[13.5px] text-muted">{disabledReason}</p>
        ) : (
          <SubmitButton size="lg" className="mt-4 w-full" pendingText="Sipariş hazırlanıyor">Devam et</SubmitButton>
        )}
        <p className="mt-3 flex items-start gap-2 text-[12.5px] text-muted">
          <IconShield size={14} className="mt-0.5 shrink-0 text-trust" /> Ödeme, teslimatı onaylayana kadar uzmana aktarılmaz. KDV dahildir.
        </p>
      </div>
    </form>
  );
}
