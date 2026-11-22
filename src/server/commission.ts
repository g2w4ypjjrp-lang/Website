import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, providerProfiles } from "@/db/schema";
import { getSettings } from "./settings";

/**
 * Komisyon önceliği: uzmana özel oran → alt kategori oranı → üst kategori oranı → genel oran.
 * Tüm tutarlar kuruş, oranlar baz puan (bps) cinsindendir; yuvarlama platform aleyhine değil, kuruş bazında yapılır.
 */
export async function resolveCommissionBps(providerId: string, categoryId: string | null) {
  const profile = await db.query.providerProfiles.findFirst({
    where: eq(providerProfiles.userId, providerId),
    columns: { customCommissionBps: true },
  });
  if (profile?.customCommissionBps != null) return { bps: profile.customCommissionBps, source: "uzman" as const };
  if (categoryId) {
    const cat = await db.query.categories.findFirst({ where: eq(categories.id, categoryId) });
    if (cat?.commissionBps != null) return { bps: cat.commissionBps, source: "kategori" as const };
    if (cat?.parentId) {
      const parent = await db.query.categories.findFirst({ where: eq(categories.id, cat.parentId) });
      if (parent?.commissionBps != null) return { bps: parent.commissionBps, source: "kategori" as const };
    }
  }
  return { bps: (await getSettings()).commissionBps, source: "genel" as const };
}

export function splitAmount(totalKurus: number, bps: number) {
  const commissionKurus = Math.round((totalKurus * bps) / 10_000);
  return { commissionKurus, providerEarningKurus: totalKurus - commissionKurus };
}
