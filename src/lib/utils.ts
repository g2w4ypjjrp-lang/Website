export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i: "i", İ: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u", I: "i" };

/** Türkçe karakterlerden arındırılmış, kısa ve anlamlı URL parçası üretir. */
export function slugify(input: string, max = 80) {
  return input
    .replace(/[çğıİöşüâîûÇĞÖŞÜI]/g, (c) => TR_MAP[c] ?? c)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

const tryFmt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const tryFmtCents = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

export function formatTRY(kurus: number, withCents = false) {
  return (withCents ? tryFmtCents : tryFmt).format(kurus / 100);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

export function formatRating(x100: number) {
  return (x100 / 100).toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const monthYearFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));
export const formatMonthYear = (d: Date | string) => monthYearFmt.format(new Date(d));

export function timeAgo(d: Date | string) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} gün önce`;
  return formatDate(d);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr-TR"))
    .join("");
}

export function plural(n: number, word: string) {
  return `${formatNumber(n)} ${word}`;
}

export function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function randomCode(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${prefix}-${out}`;
}

export const fileUrl = (id: string | null | undefined) => (id ? `/api/files/${id}` : null);
