"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";

type Suggestion = { type: "category" | "service" | "provider" | "landing" | "city"; label: string; href: string; meta?: string };

const TYPE_LABEL = { category: "Kategori", service: "Hizmet", provider: "Uzman", landing: "Rehber", city: "İl" };

export function useSuggestions(q: string) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setItems(d.items ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);
  return { items, loading };
}

export function SearchBox({ size = "md", placeholder = "Ne yaptırmak istiyorsun?", autoFocus, defaultValue = "" }: { size?: "md" | "lg"; placeholder?: string; autoFocus?: boolean; defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { items } = useSuggestions(q);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(href?: string) {
    setOpen(false);
    if (href) router.push(href);
    else if (q.trim()) router.push(`/ara?q=${encodeURIComponent(q.trim())}`);
  }

  const lg = size === "lg";
  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(active >= 0 ? items[active]?.href : undefined);
        }}
        className={cn(
          "flex items-center border transition-[border-color,box-shadow,background-color] focus-within:border-ink focus-within:bg-surface focus-within:shadow-[0_0_0_4px_rgb(17_19_24/0.07)]",
          lg ? "h-[64px] rounded-2xl border-line bg-surface pl-5 pr-2 shadow-lift" : "h-10 rounded-full border-transparent bg-paper-2 pl-4 pr-1 hover:border-line",
        )}
      >
        <IconSearch size={lg ? 20 : 16} className="shrink-0 text-muted" />
        <input
          type="search"
          name="q"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          role="combobox"
          aria-label="Hizmet, uzman veya kategori ara"
          aria-autocomplete="list"
          aria-expanded={open && items.length > 0}
          autoComplete="off"
          className={cn("min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden", lg ? "px-3 text-[17px]" : "px-2 text-[14.5px]")}
        />
        {lg && (
          <button type="submit" className="h-12 rounded-xl bg-accent px-6 text-[15px] font-semibold text-white shadow-xs transition-colors hover:bg-accent-strong">
            Ara
          </button>
        )}
      </form>
      {open && items.length > 0 && (
        <ul role="listbox" className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-pop animate-rise">
          {items.map((s, i) => (
            <li key={s.href} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(s.href)}
                className={cn("flex w-full items-center justify-between gap-4 px-4 py-2 text-left text-[14.5px]", i === active && "bg-paper")}
              >
                <span className="truncate text-ink">{s.label}</span>
                <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 text-[11.5px] font-medium text-muted">{TYPE_LABEL[s.type]}</span>
              </button>
            </li>
          ))}
          <li className="border-t border-line-2 mt-1.5 pt-1.5">
            <button type="button" onClick={() => go()} className="w-full px-4 py-2 text-left text-[14px] text-muted hover:text-ink">
              “{q}” için tüm sonuçlar →
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export function HeaderSearch() {
  return (
    <div className="hidden max-w-[420px] md:block">
      <SearchBox placeholder="Hizmet veya uzman ara" />
    </div>
  );
}
