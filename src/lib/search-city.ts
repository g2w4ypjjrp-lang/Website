import { citySlugFromName, getCity, type City } from "@/lib/tr-cities";

/** Türkçe karakterleri sadeleştirip küçük harfe çevirir (karşılaştırma için). */
export const normTR = (t: string) =>
  t.replace(/[İI]/g, (m) => (m === "İ" ? "i" : "ı")).toLocaleLowerCase("tr-TR").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u");

const SUFFIX = /(?:['’].*|deki|daki|teki|taki|den|dan|ten|tan|de|da|te|ta)$/;

function cityFromWord(word: string): City | null {
  const direct = citySlugFromName(word.replace(/['’].*$/, ""));
  if (direct) return getCity(direct);
  // "izmirde", "ankaradaki" gibi kesme işaretsiz yazımlar
  const stripped = word.replace(SUFFIX, "");
  if (stripped.length >= 3 && stripped !== word) {
    const s = citySlugFromName(stripped);
    if (s) return getCity(s);
  }
  return null;
}

/**
 * Arama metnindeki il adını ayırır: "izmir web sitesi" → { city: İzmir, rest: "web sitesi" }.
 * Böylece arama hem il sayfalarına yönlendirebilir hem de geri kalan metinle hizmet arar.
 */
export function splitCityQuery(q: string): { city: City | null; rest: string } {
  const words = q.trim().split(/\s+/).filter(Boolean);
  for (const w of words) {
    const city = cityFromWord(w);
    if (city) return { city, rest: words.filter((x) => x !== w).join(" ") };
  }
  return { city: null, rest: q.trim() };
}

/** Kalan metne uyan yayındaki açılış sayfaları ("web sitesi" → web-sitesi-yaptirma). */
export function matchLandings<T extends { h1: string; slug: string }>(rest: string, landings: T[], limit = 3): T[] {
  const r = normTR(rest);
  if (!r) return [];
  return landings
    .filter((l) => normTR(l.h1).includes(r) || normTR(l.slug.replace(/-/g, " ")).includes(r) || r.split(" ").some((w) => w.length > 2 && normTR(l.h1).includes(w)))
    .slice(0, limit);
}
