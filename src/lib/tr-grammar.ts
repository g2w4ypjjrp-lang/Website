/**
 * Özel isimlere Türkçe ek getirme (ünlü uyumu ve ünsüz benzeşmesi).
 * "İstanbul'da", "Muş'ta", "Rize'de", "Kars'ın", "Ankara'nın" …
 */
const BACK = "aıou";
const FRONT = "eiöü";
const VOICELESS = "fstkçşhp";

function lastVowel(word: string) {
  const w = word.toLocaleLowerCase("tr-TR");
  for (let i = w.length - 1; i >= 0; i--) if ((BACK + FRONT).includes(w[i]!)) return w[i]!;
  return "e";
}
const endsWithVowel = (w: string) => (BACK + FRONT).includes(w.toLocaleLowerCase("tr-TR").slice(-1));
const endsVoiceless = (w: string) => VOICELESS.includes(w.toLocaleLowerCase("tr-TR").slice(-1));

/** Bulunma eki: İstanbul'da, İzmir'de, Muş'ta, Gaziantep'te */
export function locative(name: string) {
  const v = BACK.includes(lastVowel(name)) ? "a" : "e";
  return `${name}’${endsVoiceless(name) ? "t" : "d"}${v}`;
}

/** Ayrılma eki: İstanbul'dan, Rize'den, Muş'tan */
export function ablative(name: string) {
  const v = BACK.includes(lastVowel(name)) ? "a" : "e";
  return `${name}’${endsVoiceless(name) ? "t" : "d"}${v}n`;
}

/** İlgi eki: İstanbul'un, İzmir'in, Ankara'nın, Rize'nin, Bolu'nun, Düzce'nin */
export function genitive(name: string) {
  const lv = lastVowel(name);
  const v = lv === "a" || lv === "ı" ? "ı" : lv === "e" || lv === "i" ? "i" : lv === "o" || lv === "u" ? "u" : "ü";
  return `${name}’${endsWithVowel(name) ? "n" : ""}${v}n`;
}

/** Cümle içi kullanım için ilk harfi küçültür; "SEO", "QR" gibi kısaltmaları korur. */
export function lowerFirst(s: string) {
  if (s.length > 1 && s[1] === s[1]!.toLocaleUpperCase("tr-TR") && /[A-ZÇĞİÖŞÜ]/.test(s[1]!)) return s;
  return s.charAt(0).toLocaleLowerCase("tr-TR") + s.slice(1);
}

/** Başlık biçimi: "web sitesi yaptırma" → "Web Sitesi Yaptırma" */
export function titleCaseTR(s: string) {
  return s
    .split(" ")
    .map((w) => (w.length > 1 && w === w.toLocaleUpperCase("tr-TR") ? w : w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1)))
    .join(" ");
}
