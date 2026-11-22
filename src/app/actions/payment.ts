"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { categories, orders, payments, providerProfiles, services, users } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { getPaymentProvider } from "@/server/payments";
import { clientInfo } from "@/server/request";
import { audit } from "@/server/audit";
import { rateLimit } from "@/server/rate-limit";
import { absoluteUrl } from "@/lib/site";

export async function startPaymentAction(form: FormData) {
  const user = await requireUser();
  const code = String(form.get("code"));
  if (form.get("consent") !== "on") redirect(`/odeme/${code}?hata=onay`);
  if (!rateLimit(`pay:${user.id}`, 10, 10 * 60_000).ok) redirect(`/odeme/${code}?hata=limit`);
  const order = await db.query.orders.findFirst({ where: eq(orders.code, code) });
  if (!order || order.buyerId !== user.id) redirect("/panel/siparisler");
  if (order.status !== "awaiting_payment") redirect(`/panel/siparisler/${code}`);

  // Fatura bilgisi kaydet (e-Arşiv için gerekli)
  const billing = {
    kind: (form.get("billingKind") === "corporate" ? "corporate" : "individual") as "individual" | "corporate",
    fullName: String(form.get("fullName") ?? "").slice(0, 100),
    company: String(form.get("company") ?? "").slice(0, 150) || undefined,
    taxOffice: String(form.get("taxOffice") ?? "").slice(0, 80) || undefined,
    taxNumber: String(form.get("taxNumber") ?? "").replace(/\D/g, "").slice(0, 11) || undefined,
    address: String(form.get("address") ?? "").slice(0, 300),
    city: String(form.get("city") ?? "").slice(0, 40),
  };
  if (!billing.fullName || !billing.address || !billing.city) redirect(`/odeme/${code}?hata=fatura`);
  await db.update(users).set({ billing }).where(eq(users.id, user.id));

  const [svc, profile] = await Promise.all([
    order.serviceId ? db.select({ cat: categories.name }).from(services).innerJoin(categories, eq(categories.id, services.categoryId)).where(eq(services.id, order.serviceId)).then((r) => r[0]) : null,
    db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, order.providerId) }),
  ]);
  const provider = getPaymentProvider();
  const conversationId = randomUUID();
  const { ip } = await clientInfo();
  let session;
  try {
    session = await provider.createCheckout({
      orderId: order.id,
      orderCode: order.code,
      conversationId,
      totalKurus: order.totalKurus,
      providerEarningKurus: order.providerEarningKurus,
      subMerchantKey: profile?.subMerchantKey ?? null,
      itemTitle: order.title,
      categoryName: svc?.cat ?? "Dijital hizmet",
      buyer: { id: user.id, name: billing.fullName, email: user.email, ip, city: billing.city, address: billing.address, identityNumber: billing.kind === "individual" ? billing.taxNumber : undefined },
      callbackUrl: absoluteUrl(`/api/payments/callback/${provider.name}`),
    });
  } catch (e) {
    await audit(user.id, "payment.init_failed", "order", order.id, { error: String(e) });
    redirect(`/odeme/${code}?hata=saglayici`);
  }
  await db.insert(payments).values({ orderId: order.id, provider: provider.name, conversationId, amountKurus: order.totalKurus, providerRef: session.token, status: "pending" });
  await audit(user.id, "payment.initiated", "order", order.id, { provider: provider.name, amount: order.totalKurus });
  redirect(session.kind === "redirect" ? session.url : `/odeme/${code}`);
}
