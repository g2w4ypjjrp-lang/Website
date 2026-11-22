import { CITIES, METRO_SLUGS, citySlugFromName } from "../../src/lib/tr-cities.ts";
import { locative, genitive, ablative, lowerFirst, titleCaseTR } from "../../src/lib/tr-grammar.ts";
const plates = new Set(CITIES.map((c) => c.plate));
console.log("il sayısı:", CITIES.length, "plaka benzersiz:", plates.size, "büyükşehir:", METRO_SLUGS.length);
const missing = Array.from({ length: 81 }, (_, i) => String(i + 1).padStart(2, "0")).filter((p) => !plates.has(p));
console.log("eksik plaka:", missing.join(",") || "yok");
const bad = CITIES.filter((c) => citySlugFromName(c.name) !== c.slug).map((c) => c.name);
console.log("ad→slug uyuşmayan:", bad.join(",") || "yok");
const sample = ["İstanbul", "Ankara", "İzmir", "Muş", "Kars", "Rize", "Bolu", "Düzce", "Gaziantep", "Iğdır", "Elazığ", "Şırnak", "Tokat", "Sinop", "Hakkari", "Van", "Ağrı", "Ordu", "Kütahya", "Uşak"];
for (const s of sample) console.log(`${s.padEnd(10)} ${locative(s).padEnd(14)} ${genitive(s).padEnd(14)} ${ablative(s)}`);
console.log(lowerFirst("Web sitesi yaptırma"), "|", lowerFirst("SEO hizmeti"), "|", lowerFirst("QR menü"), "|", titleCaseTR("e-ticaret sitesi kurulumu"), "|", titleCaseTR("SEO hizmeti"));

// Aramada il algılama
const { splitCityQuery, matchLandings } = await import("../../src/lib/search-city.ts");
const cases: [string, string | null, string][] = [
  ["izmir web sitesi", "izmir", "web sitesi"],
  ["İzmir'de web sitesi", "izmir", "web sitesi"],
  ["ankaradaki seo ajansı", "ankara", "seo ajansı"],
  ["logo tasarımı Kahramanmaraş", "kahramanmaras", "logo tasarımı"],
  ["e-ticaret sitesi", null, "e-ticaret sitesi"],
  ["istanbul", "istanbul", ""],
];
let pass = 0;
for (const [q, slug, rest] of cases) {
  const r = splitCityQuery(q);
  const ok = (r.city?.slug ?? null) === slug && r.rest === rest;
  if (ok) pass++;
  else console.log("HATALI:", q, "→", r.city?.slug, JSON.stringify(r.rest));
}
console.log(`il algılama: ${pass}/${cases.length}`);
const lands = [{ h1: "Web sitesi yaptırma", slug: "web-sitesi-yaptirma" }, { h1: "SEO hizmeti", slug: "seo-hizmeti" }, { h1: "Logo tasarımı", slug: "logo-tasarimi" }];
console.log("açılış eşleşmesi:", matchLandings("web sitesi", lands).map((l) => l.slug).join(","), "|", matchLandings("seo ajansı", lands).map((l) => l.slug).join(","));
if (pass !== cases.length) process.exit(1);
