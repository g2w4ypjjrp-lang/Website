"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { promotions, services } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { getPaymentProvider } from "@/server/payments";
import { clientInfo } from "@/server/request";
import { audit } from "@/server/audit";
import { rateLimit } from "@/server/rate-limit";
import { absoluteUrl } from "@/lib/site";
import { randomCode } from "@/lib/utils";

export async function buyPromotionAction(form: FormData) {
  const user = await requireRole("provider");
  if (!rateLimit(`promo:${user.id}`, 10, 10 * 60_000).ok) redirect("/panel/tanitim?hata=limit");
  const type = z.enum(["featured", "premium"]).parse(form.get("type"));
  const s = await getSettings();
  let serviceId: string | null = null;
  let title = "Premium üyelik (30 gün)";
  if (type === "featured") {
    serviceId = z.string().uuid().parse(form.get("serviceId"));
    const svc = await db.query.services.findFirst({ where: and(eq(services.id, serviceId), eq(services.providerId, user.id), eq(services.status, "active")) });
    if (!svc) redirect("/panel/tanitim?hata=hizmet");
    title = `Öne çıkarma (7 gün): ${svc.title}`.slice(0, 200);
  }
  const amount = type === "premium" ? s.premiumMonthlyKurus : s.featuredPriceKurus;
  const days = type === "premium" ? 30 : 7;
  const code = randomCode("TN");
  const conversationId = randomUUID();
  const [p] = await db.insert(promotions).values({ code, providerId: user.id, serviceId, type, days, amountKurus: amount, conversationId }).returning();
  const provider = getPaymentProvider();
  const { ip } = await clientInfo();
  let session;
  try {
    session = await provider.createCheckout({
      orderId: p!.id,
      orderCode: code,
      conversationId,
      totalKurus: amount,
      providerEarningKurus: 0,
      subMerchantKey: null,
      platformOnly: true,
      itemTitle: title,
      categoryName: "Tanıtım hizmeti",
      buyer: { id: user.id, name: user.name, email: user.email, ip },
      callbackUrl: absoluteUrl(`/api/payments/callback/${provider.name}`),
    });
  } catch (e) {
    await db.update(promotions).set({ status: "failed" }).where(eq(promotions.id, p!.id));
    await audit(user.id, "promotion.init_failed", "promotion", p!.id, { error: String(e) });
    redirect("/panel/tanitim?hata=saglayici");
  }
  await db.update(promotions).set({ provider: provider.name, providerRef: session.token }).where(eq(promotions.id, p!.id));
  await audit(user.id, "promotion.initiated", "promotion", p!.id, { type, amount });
  redirect(session.kind === "redirect" ? session.url : "/panel/tanitim");
}
