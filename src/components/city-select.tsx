import { CITIES, getCity, citySlugFromName } from "@/lib/tr-cities";

const SORTED = [...CITIES].sort((a, b) => a.name.localeCompare(b.name, "tr"));

/**
 * 81 il seçimi. `valueKind="name"` profil ve fatura bilgisinde il adını, `"slug"` proje kaydında il kodunu saklar.
 * Serbest metin yerine seçim kullanmak il sayfalarındaki uzman ve proje sayılarının doğru olmasını sağlar.
 */
export function CitySelect({ name, id, defaultValue, valueKind = "name", placeholder = "İl seçin", className = "field", required }: { name: string; id?: string; defaultValue?: string | null; valueKind?: "name" | "slug"; placeholder?: string; className?: string; required?: boolean }) {
  const slug = citySlugFromName(defaultValue ?? "") ?? (getCity(defaultValue ?? "")?.slug ?? "");
  const def = slug ? (valueKind === "slug" ? slug : getCity(slug)!.name) : "";
  return (
    <select id={id ?? name} name={name} defaultValue={def} className={className} required={required}>
      <option value="">{placeholder}</option>
      {SORTED.map((c) => (
        <option key={c.slug} value={valueKind === "slug" ? c.slug : c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
