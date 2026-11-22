"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CITIES } from "@/lib/tr-cities";
import { IconPin, IconArrowRight } from "@/components/icons";

const SORTED = [...CITIES].sort((a, b) => a.name.localeCompare(b.name, "tr"));

/** Ana sayfada il seçimi: kullanıcıyı ilinin dijital hizmetler sayfasına götürür. */
export function CityJump() {
  const router = useRouter();
  const [city, setCity] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (city) router.push(`/il/${city}`);
      }}
      className="flex w-full max-w-md items-center gap-2"
    >
      <label htmlFor="city-jump" className="sr-only">İliniz</label>
      <span className="relative flex-1">
        <IconPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <select id="city-jump" value={city} onChange={(e) => setCity(e.target.value)} className="field !pl-9">
          <option value="">İlinizi seçin</option>
          {SORTED.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </span>
      <button disabled={!city} className="flex h-[42px] items-center gap-1.5 rounded-md bg-ink px-4 text-[14.5px] font-medium text-white disabled:opacity-40">
        Göster <IconArrowRight size={14} />
      </button>
    </form>
  );
}
