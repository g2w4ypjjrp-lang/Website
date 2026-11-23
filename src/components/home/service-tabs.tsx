"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hizmetleri kategoriye göre süzen sekmeler. Kartlar sunucuda çizilir; burada yalnızca görünürlük değişir
 * (ek istek yok, önbellekli sayfada çalışır).
 */
export function ServiceTabs({ tabs, items, variant, empty, between, trailing }: { tabs: { key: string; label: ReactNode }[]; items: { cat: string; node: ReactNode }[]; variant: "pills" | "bar"; empty: ReactNode; between?: ReactNode; trailing?: ReactNode }) {
  const [active, setActive] = useState("all");
  const shown = items.filter((i) => active === "all" || i.cat === active);
  return (
    <div>
      <div role="tablist" aria-label="Kategoriye göre süz" className={cn("-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0", variant === "bar" ? "mb-8 rounded-2xl border border-line bg-surface p-2 shadow-card" : "mb-6")}>
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "shrink-0 transition-colors",
              variant === "pills"
                ? cn("rounded-full px-4 py-2 text-[14px] font-medium", active === t.key ? "bg-accent text-white shadow-xs" : "bg-paper-2 text-ink-2 hover:text-ink")
                : cn("flex min-w-[112px] flex-1 flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-[13.5px] font-medium", active === t.key ? "bg-accent text-white shadow-lift" : "text-ink-2 hover:bg-paper-2 hover:text-ink"),
            )}
          >
            {t.label}
          </button>
        ))}
        {trailing}
      </div>
      {between}
      {shown.length ? (
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">{shown.map((i, n) => <div key={n} className="contents">{i.node}</div>)}</div>
      ) : (
        empty
      )}
    </div>
  );
}
