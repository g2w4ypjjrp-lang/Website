import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export type PlatformSettings = {
  commissionBps: number; // 1500 = %15
  autoCompleteDays: number; // teslimden sonra müşteri sessiz kalırsa otomatik onay
  payoutHoldDays: number; // tamamlanan siparişten sonra hakedişin serbest kalması
  minOrderKurus: number;
  maintenanceMode: boolean;
  supportEmail: string;
  featuredPriceKurus: number; // 7 günlük öne çıkarma
  premiumMonthlyKurus: number;
};

export const DEFAULT_SETTINGS: PlatformSettings = {
  commissionBps: 1500,
  autoCompleteDays: 3,
  payoutHoldDays: 7,
  minOrderKurus: 25000,
  maintenanceMode: false,
  supportEmail: "destek@eksen.local",
  featuredPriceKurus: 49900,
  premiumMonthlyKurus: 39900,
};

export async function getSettings(): Promise<PlatformSettings> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, "platform") });
  return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<PlatformSettings>) ?? {}) };
}

export async function saveSettings(patch: Partial<PlatformSettings>) {
  const next = { ...(await getSettings()), ...patch };
  await db
    .insert(settings)
    .values({ key: "platform", value: next })
    .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
  return next;
}

/* ───────────── Yerel SEO (il sayfaları) ───────────── */

export type LocalSeoSettings = {
  /** 81 il merkez sayfası (/il/…) indekslensin mi */
  indexAllHubs: boolean;
  /** Hizmet × il sayfası, ilde bu kategoride en az bu kadar aktif uzman varsa otomatik indekslenir */
  minProviders: number;
  /** Uzman sayısından bağımsız olarak hizmet × il sayfaları indekslenecek iller (varsayılan: 30 büyükşehir) */
  priority: string[];
  /** Tüm hizmet × il sayfalarını indeksle (kalite kapısını kapatır; önerilmez) */
  indexAll: boolean;
};

export async function getLocalSeoSettings(): Promise<LocalSeoSettings> {
  const { METRO_SLUGS } = await import("@/lib/tr-cities");
  const row = await db.query.settings.findFirst({ where: eq(settings.key, "localSeo") });
  return { indexAllHubs: true, minProviders: 1, priority: METRO_SLUGS, indexAll: false, ...((row?.value as Partial<LocalSeoSettings>) ?? {}) };
}

export async function saveLocalSeoSettings(patch: Partial<LocalSeoSettings>) {
  const next = { ...(await getLocalSeoSettings()), ...patch };
  await db
    .insert(settings)
    .values({ key: "localSeo", value: next })
    .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
  return next;
}

/* ───────────── Tema ve görünüm ───────────── */

export type ThemeId = "premium" | "light" | "neo" | "sunrise";
export const THEMES: { id: ThemeId; no: number; name: string; summary: string }[] = [
  { id: "premium", no: 1, name: "Modern Premium", summary: "Güçlü tipografi, ortalanmış arama, ürün arayüzü hissi veren hizmet kartları, koyu alt bilgi." },
  { id: "light", no: 2, name: "Light Professional", summary: "Aydınlık ve kurumsal: ölçülü başlıklar, ince çerçeveler, geniş boşluklar, açık alt bilgi." },
  { id: "neo", no: 3, name: "Gece Moru", summary: "Koyu lacivert zemin, mor vurgu ve ışıltılar; cihaz görünümlü giriş, “Nasıl çalışır?” kartı, kategori sekmeleri." },
  { id: "sunrise", no: 4, name: "Gün Işığı", summary: "Beyaz zemin, canlı turuncu vurgu, hap biçimli düğmeler; cihaz görünümlü giriş, özellik şeridi, filtreli hizmetler." },
];
export const THEME_IDS = THEMES.map((t) => t.id);
export type SocialLinks = { instagram?: string; linkedin?: string; x?: string; youtube?: string; facebook?: string };
export type ThemeSettings = { theme: ThemeId; social: SocialLinks };
export const DEFAULT_THEME: ThemeSettings = { theme: "premium", social: {} };

/**
 * Etkin tema. Kök düzende her sayfada okunur; istek içinde tek sorguya iner (React cache).
 * Veritabanına ulaşılamazsa varsayılan temayla devam edilir: tema okuması hiçbir sayfayı düşürmez.
 */
export const getThemeSettings = cache(async (): Promise<ThemeSettings> => {
  try {
    const row = await db.query.settings.findFirst({ where: eq(settings.key, "theme") });
    const v = (row?.value as Partial<ThemeSettings>) ?? {};
    return { theme: v.theme && THEME_IDS.includes(v.theme) ? v.theme : "premium", social: { ...(v.social ?? {}) } };
  } catch {
    return DEFAULT_THEME;
  }
});

export async function saveThemeSettings(patch: Partial<ThemeSettings>) {
  const next = { ...(await getThemeSettings()), ...patch };
  await db
    .insert(settings)
    .values({ key: "theme", value: next })
    .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
  return next;
}
