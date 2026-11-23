"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Başlık, kategori sekmeleri ve "daha fazlası" bağlantısı tek satırda; altında süzülen hizmet kartları.
 * Kartlar sunucuda çizilir; burada yalnızca görünürlük değişir (ek istek yok, önbellekli sayfada çalışır).
 */
export function ServiceTabs({ tabs, items, empty, trailing, head, cols = 4 }: { tabs: { key: string; label: ReactNode }[]; items: { cat: string; node: ReactNode }[]; empty: ReactNode; trailing?: ReactNode; head: ReactNode; cols?: 4 | 5 }) {
  const [active, setActive] = useState(tabs[0]?.key ?? "all");
  const shown = items.filter((i) => active === "all" || i.cat === active);
  const grid = cols === 5 ? "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" : "grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5";
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        {head}
        <div role="tablist" aria-label="Kategoriye göre süz" className="-mx-4 flex max-w-full gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:rounded-full sm:bg-paper-2 sm:p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active === t.key}
              onClick={() => setActive(t.key)}
              className={cn("shrink-0 rounded-full px-4 py-[7px] text-[14px] font-medium transition-colors", active === t.key ? "bg-accent text-white shadow-xs" : "bg-paper-2 text-ink-2 hover:bg-surface hover:text-ink sm:bg-transparent")}
            >
              {t.label}
            </button>
          ))}
        </div>
        {trailing}
      </div>
      {shown.length ? <div className={grid}>{shown.map((i, n) => <div key={n} className="contents">{i.node}</div>)}</div> : empty}
    </div>
  );
}
