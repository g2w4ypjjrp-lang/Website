import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { AutoSubmit } from "./auto-submit";
import { cn } from "@/lib/utils";

export const SORTS = [
  ["onerilen", "En alakalı"],
  ["populer", "En popüler"],
  ["cok-satan", "En çok satılan"],
  ["puan", "En yüksek puan"],
  ["fiyat-artan", "En düşük fiyat"],
  ["fiyat-azalan", "En yüksek fiyat"],
  ["yeni", "Yeni hizmetler"],
] as const;

export const SORT_MAP = { onerilen: "relevance", populer: "popular", "cok-satan": "bestselling", puan: "rating", "fiyat-artan": "price_asc", "fiyat-azalan": "price_desc", yeni: "newest" } as const;

export type SP = Record<string, string | string[] | undefined>;
export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
export const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && one(v) !== "" && one(v) != null ? n : undefined;
};

/** Filtre parametresi varsa sayfa indekslenmez (yinelenen içerik önleme). Yalnızca ?sayfa= serbesttir. */
export function hasFilters(sp: SP, allowed: string[] = ["sayfa"]) {
  return Object.keys(sp).some((k) => !allowed.includes(k) && one(sp[k]));
}

export function ServiceFilters({ sp, categories, action, showCategory = true }: { sp: SP; categories?: { slug: string; name: string }[]; action: string; showCategory?: boolean }) {
  return (
    <form action={action} method="get" className="space-y-6 text-[14px]">
      <AutoSubmit />
      {one(sp.q) && <input type="hidden" name="q" value={one(sp.q)} />}
      {one(sp.siralama) && <input type="hidden" name="siralama" value={one(sp.siralama)} />}
      {showCategory && categories && categories.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-medium">Kategori</legend>
          <select name="kategori" defaultValue={one(sp.kategori) ?? ""} className="field !py-2 text-[14px]">
            <option value="">Tümü</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </fieldset>
      )}
      <fieldset>
        <legend className="mb-2 font-medium">Bütçe (₺)</legend>
        <div className="flex items-center gap-2">
          <input name="min" inputMode="numeric" placeholder="En az" defaultValue={one(sp.min)} className="field !py-2 text-[14px]" aria-label="En az fiyat" />
          <span className="text-faint">–</span>
          <input name="max" inputMode="numeric" placeholder="En çok" defaultValue={one(sp.max)} className="field !py-2 text-[14px]" aria-label="En çok fiyat" />
        </div>
      </fieldset>
      <Radios name="teslim" label="Teslim süresi" value={one(sp.teslim)} options={[["", "Fark etmez"], ["3", "3 gün içinde"], ["7", "1 hafta içinde"], ["14", "2 hafta içinde"], ["30", "1 ay içinde"]]} />
      <Radios name="puan" label="Puan" value={one(sp.puan)} options={[["", "Tümü"], ["4", "4 ve üzeri"], ["4.5", "4,5 ve üzeri"]]} />
      <Radios name="seviye" label="Uzman seviyesi" value={one(sp.seviye)} options={[["", "Tümü"], ["top", "Üst düzey"], ["pro", "Profesyonel"], ["rising", "Yükselen"], ["new", "Yeni üye"]]} />
      <Radios name="paket" label="Paket" value={one(sp.paket)} options={[["", "Tümü"], ["basic", "Temel paketi olan"], ["premium", "Profesyonel paketi olan"]]} />
      <fieldset>
        <legend className="mb-2 font-medium">Konum</legend>
        <input name="sehir" placeholder="Şehir, ör. İzmir" defaultValue={one(sp.sehir)} className="field !py-2 text-[14px]" />
      </fieldset>
      <label className="flex items-center gap-2.5">
        <input type="checkbox" name="cevrimici" value="1" defaultChecked={one(sp.cevrimici) === "1"} className="h-4 w-4 accent-[var(--color-ink)]" />
        Şu an çevrimiçi olanlar
      </label>
      <div className="flex gap-2">
        <button className="h-9 flex-1 rounded-md bg-ink text-[14px] font-medium text-white">Uygula</button>
        <Link href={action} className="flex h-9 items-center rounded-md px-3 text-[14px] text-muted hover:text-ink">Temizle</Link>
      </div>
    </form>
  );
}

function Radios({ name, label, value, options }: { name: string; label: string; value?: string; options: [string, string][] }) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium">{label}</legend>
      <div className="space-y-1.5">
        {options.map(([v, l]) => (
          <label key={v} className="flex cursor-pointer items-center gap-2.5 text-ink-2">
            <input type="radio" name={name} value={v} defaultChecked={(value ?? "") === v} className="h-3.5 w-3.5 accent-[var(--color-ink)]" />
            {l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SortSelect({ sp, action }: { sp: SP; action: string }) {
  return (
    <form action={action} method="get" className="flex items-center gap-2 text-[14px]">
      <AutoSubmit />
      {Object.entries(sp)
        .filter(([k]) => k !== "siralama" && k !== "sayfa")
        .map(([k, v]) => (one(v) ? <input key={k} type="hidden" name={k} value={one(v)} /> : null))}
      <label htmlFor="siralama" className="hidden text-muted sm:block">Sırala</label>
      <select id="siralama" name="siralama" defaultValue={one(sp.siralama) ?? "onerilen"} className="field !w-auto !py-1.5 text-[14px]">
        {SORTS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <noscript><button className="text-[13px] underline">Uygula</button></noscript>
    </form>
  );
}

export function Pagination({ page, pages, base, sp }: { page: number; pages: number; base: string; sp: SP }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (k !== "sayfa" && one(v)) q.set(k, one(v)!);
    if (p > 1) q.set("sayfa", String(p));
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Sayfalar" className="mt-12 flex items-center justify-center gap-1 text-[14px]">
      {page > 1 && <Link rel="prev" href={href(page - 1)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-paper-2" aria-label="Önceki sayfa"><IconChevronLeft /></Link>}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && n - nums[i - 1]! > 1 && <span className="px-1 text-faint">…</span>}
          <Link href={href(n)} aria-current={n === page ? "page" : undefined} className={cn("num flex h-9 min-w-9 items-center justify-center rounded-md px-2", n === page ? "bg-ink text-white" : "hover:bg-paper-2")}>{n}</Link>
        </span>
      ))}
      {page < pages && <Link rel="next" href={href(page + 1)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-paper-2" aria-label="Sonraki sayfa"><IconChevronRight /></Link>}
    </nav>
  );
}

export function MobileFilters({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <details className="group rounded-md border border-line bg-surface lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[14.5px] font-medium">
        Filtrele {count > 0 && <span className="num rounded-sm bg-ink px-1.5 text-[11px] text-white">{count}</span>}
        <span className="text-muted group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-line-2 p-4">{children}</div>
    </details>
  );
}

export function filtersFromSP(sp: SP) {
  const sort = SORT_MAP[(one(sp.siralama) ?? "onerilen") as keyof typeof SORT_MAP] ?? "relevance";
  const tier = one(sp.paket);
  return {
    q: one(sp.q)?.slice(0, 100),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    maxDays: num(sp.teslim),
    minRating: num(sp.puan),
    level: ["new", "rising", "pro", "top"].includes(one(sp.seviye) ?? "") ? one(sp.seviye) : undefined,
    online: one(sp.cevrimici) === "1",
    city: one(sp.sehir)?.slice(0, 40) || undefined,
    tier: tier === "basic" || tier === "standard" || tier === "premium" ? tier : undefined,
    sort,
    page: num(sp.sayfa) ?? 1,
  } as const;
}

export function activeFilterCount(sp: SP) {
  return ["min", "max", "teslim", "puan", "seviye", "paket", "sehir", "cevrimici", "kategori"].filter((k) => one(sp[k])).length;
}
