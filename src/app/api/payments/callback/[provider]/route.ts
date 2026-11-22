import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { getProviderByName } from "@/server/payments";
import { markOrderPaid } from "@/server/orders";
import { audit } from "@/server/audit";
import { absoluteUrl } from "@/lib/site";

/**
 * Ödeme sağlayıcısı dönüşü. Token, sağlayıcının API’sinden sunucu tarafında doğrulanır;
 * tutar sipariş tutarıyla eşleşmezse sipariş ödenmiş sayılmaz. İşlem idempotenttir.
 */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await params;
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const payment = await db.query.payments.findFirst({ where: and(eq(payments.providerRef, token), eq(payments.provider, name)) });
  if (!payment) return NextResponse.redirect(absoluteUrl("/panel/siparisler?odeme=bulunamadi"), 303);
  const order = await db.query.orders.findFirst({ where: eq(orders.id, payment.orderId) });
  if (!order) return NextResponse.redirect(absoluteUrl("/panel/siparisler"), 303);
  if (payment.status === "succeeded") return NextResponse.redirect(absoluteUrl(`/panel/siparisler/${order.code}?odeme=basarili`), 303);

  if (form.get("simulate") === "fail" && name === "sandbox") {
    await db.update(payments).set({ status: "failed", meta: { reason: "Test: kullanıcı reddetti" }, updatedAt: new Date() }).where(eq(payments.id, payment.id));
    await audit(order.buyerId, "payment.failed", "order", order.id, { provider: name });
    return NextResponse.redirect(absoluteUrl(`/odeme/${order.code}?hata=reddedildi`), 303);
  }

  const result = await getProviderByName(name).verify(token, payment.conversationId);
  const amountOk = result.amountKurus === order.totalKurus;
  if (!result.ok || !amountOk) {
    await db.update(payments).set({ status: "failed", meta: { ...result.meta, error: result.error ?? "Tutar uyuşmazlığı" }, updatedAt: new Date() }).where(eq(payments.id, payment.id));
    await audit(order.buyerId, "payment.failed", "order", order.id, { provider: name, error: result.error, amountOk });
    return NextResponse.redirect(absoluteUrl(`/odeme/${order.code}?hata=reddedildi`), 303);
  }
  await db.update(payments).set({ status: "succeeded", meta: result.meta, updatedAt: new Date() }).where(eq(payments.id, payment.id));
  await markOrderPaid(order.id);
  await audit(order.buyerId, "payment.succeeded", "order", order.id, { provider: name, amount: order.totalKurus, ref: result.providerRef });
  return NextResponse.redirect(absoluteUrl(`/panel/siparisler/${order.code}?odeme=basarili`), 303);
}
