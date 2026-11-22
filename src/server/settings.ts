import "server-only";
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
