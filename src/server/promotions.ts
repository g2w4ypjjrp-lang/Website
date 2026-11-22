import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { promotions, providerProfiles, services } from "@/db/schema";
import { audit } from "./audit";
import { notify } from "./notify";

/** Tanıtım ödemesi doğrulandığında çağrılır; idempotenttir. Mevcut süre varsa üzerine eklenir. */
export async function activatePromotion(id: string, providerRef?: string) {
  const [p] = await db.update(promotions).set({ status: "succeeded", paidAt: new Date(), providerRef }).where(and(eq(promotions.id, id), eq(promotions.status, "pending"))).returning();
  if (!p) return null;
  const extend = (col: unknown) => sql`greatest(coalesce(${col}, now()), now()) + (${p.days} || ' days')::interval`;
  if (p.type === "featured" && p.serviceId) await db.update(services).set({ featuredUntil: extend(services.featuredUntil) }).where(eq(services.id, p.serviceId));
  if (p.type === "premium") await db.update(providerProfiles).set({ premiumUntil: extend(providerProfiles.premiumUntil) }).where(eq(providerProfiles.userId, p.providerId));
  await notify(p.providerId, "payout", p.type === "premium" ? "Premium üyeliğiniz aktif" : "Hizmetiniz öne çıkarıldı", { body: `${p.days} gün süreyle geçerli.`, link: "/panel/tanitim", email: false });
  await audit(p.providerId, "promotion.paid", "promotion", p.id, { type: p.type, amount: p.amountKurus });
  return p;
}
