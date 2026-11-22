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
