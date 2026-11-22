import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversations, offers, orderEvents, orders, payouts, projects, providerProfiles, services } from "@/db/schema";
import type { OrderStatus } from "@/lib/order-status";
import { ORDER_STATUS } from "@/lib/order-status";
import { audit } from "./audit";
import { notify } from "./notify";
import { getSettings } from "./settings";

type Order = typeof orders.$inferSelect;
type Actor = "buyer" | "provider" | "admin" | "system";

export type OrderAction =
  | "start"
  | "accept_revision"
  | "deliver"
  | "request_revision"
  | "approve"
  | "cancel"
  | "request_refund"
  | "open_dispute";

/** İzinli geçişler: [eylem] → { kim, hangi durumlardan, hangi duruma } */
const TRANSITIONS: Record<OrderAction, { actors: Actor[]; from: OrderStatus[]; to: OrderStatus }> = {
  start: { actors: ["provider"], from: ["created"], to: "in_progress" },
  accept_revision: { actors: ["provider"], from: ["revision_requested"], to: "awaiting_delivery" },
  deliver: { actors: ["provider"], from: ["in_progress", "awaiting_delivery", "revision_requested"], to: "delivered" },
  request_revision: { actors: ["buyer"], from: ["delivered"], to: "revision_requested" },
  approve: { actors: ["buyer", "system", "admin"], from: ["delivered"], to: "completed" },
  cancel: { actors: ["provider", "admin"], from: ["created", "in_progress", "awaiting_delivery"], to: "cancelled" },
  request_refund: { actors: ["buyer"], from: ["created", "in_progress", "awaiting_delivery", "delivered", "revision_requested"], to: "refund_in_progress" },
  open_dispute: { actors: ["buyer", "provider"], from: ["in_progress", "awaiting_delivery", "delivered", "revision_requested"], to: "disputed" },
};

export function allowedActions(order: Pick<Order, "status" | "revisionsAllowed" | "revisionsUsed">, actor: Actor) {
  return (Object.keys(TRANSITIONS) as OrderAction[]).filter((a) => {
    const t = TRANSITIONS[a];
    if (!t.actors.includes(actor) || !t.from.includes(order.status)) return false;
    if (a === "request_revision" && order.revisionsUsed >= order.revisionsAllowed) return false;
    return true;
  });
}

export class OrderError extends Error {}

export async function transitionOrder(orderId: string, action: OrderAction, actor: { id: string | null; as: Actor }, note?: string) {
  return db.transaction(async (tx) => {
    // Satırı kilitle: eşzamanlı iki onay/teslim isteğinin çakışmasını önler
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order) throw new OrderError("Sipariş bulunamadı.");
    if (actor.as === "buyer" && order.buyerId !== actor.id) throw new OrderError("Bu sipariş size ait değil.");
    if (actor.as === "provider" && order.providerId !== actor.id) throw new OrderError("Bu sipariş size ait değil.");
    const t = TRANSITIONS[action];
    if (!allowedActions(order, actor.as).includes(action)) {
      throw new OrderError(`"${ORDER_STATUS[order.status].label}" durumundaki siparişte bu işlem yapılamaz.`);
    }
    const now = new Date();
    const patch: Partial<Order> = { status: t.to, updatedAt: now };
    if (action === "start") {
      patch.startedAt = now;
      patch.dueAt = new Date(now.getTime() + order.deliveryDays * 864e5);
    }
    if (action === "deliver") patch.deliveredAt = now;
    if (action === "request_revision") patch.revisionsUsed = order.revisionsUsed + 1;
    if (action === "approve") patch.completedAt = now;
    if (action === "cancel") patch.cancelledAt = now;
    if (action === "request_refund" || action === "open_dispute") patch.statusBeforeIssue = order.status;

    await tx.update(orders).set(patch).where(eq(orders.id, order.id));
    await tx.insert(orderEvents).values({
      orderId: order.id,
      actorId: actor.id,
      type: action,
      fromStatus: order.status,
      toStatus: t.to,
      note: note?.slice(0, 4000),
    });

    if (action === "approve") {
      const s = await getSettings();
      await tx
        .insert(payouts)
        .values({
          providerId: order.providerId,
          orderId: order.id,
          amountKurus: order.providerEarningKurus,
          status: "held",
          availableAt: new Date(now.getTime() + s.payoutHoldDays * 864e5),
        })
        .onConflictDoNothing();
      await tx
        .update(providerProfiles)
        .set({ completedOrders: sql`${providerProfiles.completedOrders} + 1` })
        .where(eq(providerProfiles.userId, order.providerId));
      if (order.serviceId)
        await tx
          .update(services)
          .set({ orderCount: sql`${services.orderCount} + 1` })
          .where(eq(services.id, order.serviceId));
    }
    if (action === "cancel") {
      await tx
        .update(providerProfiles)
        .set({ cancelledOrders: sql`${providerProfiles.cancelledOrders} + 1` })
        .where(eq(providerProfiles.userId, order.providerId));
    }
    return { order: { ...order, ...patch } as Order, from: order.status };
  }).then(async (res) => {
    await afterTransition(res.order, action, actor, note);
    return res.order;
  });
}

async function afterTransition(order: Order, action: OrderAction, actor: { id: string | null; as: Actor }, note?: string) {
  const link = `/panel/siparisler/${order.code}`;
  const conv = await db.query.conversations.findFirst({ where: eq(conversations.orderId, order.id) });
  const systemLine: Partial<Record<OrderAction, string>> = {
    start: "Uzman siparişi başlattı.",
    accept_revision: "Uzman revizyon talebini kabul etti.",
    request_revision: "Müşteri revizyon istedi.",
    approve: actor.as === "system" ? "Teslimat süre dolduğu için otomatik onaylandı." : "Müşteri teslimatı onayladı. Sipariş tamamlandı.",
    cancel: "Sipariş iptal edildi.",
    request_refund: "Müşteri iade talebi oluşturdu. Ekip inceliyor.",
    open_dispute: "Uyuşmazlık kaydı açıldı. Ekip arabuluculuk yapacak.",
  };
  if (conv && systemLine[action]) {
    const { postSystemMessage } = await import("./messaging");
    await postSystemMessage(conv.id, systemLine[action]! + (note && action !== "deliver" ? `\n\n“${note}”` : ""));
  }
  switch (action) {
    case "start":
      await notify(order.buyerId, "order_started", `${order.code} numaralı siparişiniz başladı`, { link, email: false });
      break;
    case "deliver":
      await notify(order.buyerId, "order_delivered", `${order.code}: teslimat yapıldı`, {
        body: "Teslim edilen dosyaları inceleyin. Onaylayabilir ya da revizyon isteyebilirsiniz.",
        link,
      });
      break;
    case "request_revision":
      await notify(order.providerId, "order_revision", `${order.code}: revizyon istendi`, { body: note, link });
      break;
    case "approve":
      await notify(order.providerId, "order_completed", `${order.code} tamamlandı`, {
        body: "Kazancınız hakediş sürecine alındı.",
        link,
      });
      await notify(order.buyerId, "order_completed", `${order.code} tamamlandı — deneyiminizi puanlayın`, { link, email: false });
      break;
    case "cancel":
      await notify(order.buyerId, "order_cancelled", `${order.code} iptal edildi`, { body: note, link });
      await notify(order.providerId, "order_cancelled", `${order.code} iptal edildi`, { link, email: false });
      break;
    case "request_refund":
    case "open_dispute":
      await notify(actor.as === "buyer" ? order.providerId : order.buyerId, "ticket", `${order.code}: ${action === "request_refund" ? "iade talebi" : "uyuşmazlık"} açıldı`, { body: note, link });
      break;
  }
  await audit(actor.id, `order.${action}`, "order", order.id, { code: order.code, to: order.status });
}

/** Ödeme doğrulandığında çağrılır. İdempotenttir. */
export async function markOrderPaid(orderId: string) {
  const updated = await db
    .update(orders)
    .set({ status: "created", paidAt: new Date(), updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "awaiting_payment")))
    .returning();
  const order = updated[0];
  if (!order) return null;
  await db.insert(orderEvents).values([
    { orderId, type: "paid", fromStatus: "awaiting_payment", toStatus: "payment_received", note: "Ödeme güvenli havuz hesabına alındı." },
    { orderId, type: "created", fromStatus: "payment_received", toStatus: "created" },
  ]);
  // Tekliften gelen siparişte: teklif kabul, proje kapanır, diğer teklifler reddedilir
  if (order.offerId && order.projectId) {
    await db.update(offers).set({ status: "accepted" }).where(eq(offers.id, order.offerId));
    await db.update(offers).set({ status: "rejected" }).where(and(eq(offers.projectId, order.projectId), eq(offers.status, "pending")));
    await db.update(projects).set({ status: "in_progress", updatedAt: new Date() }).where(eq(projects.id, order.projectId));
    await notify(order.providerId, "offer_accepted", "Teklifin kabul edildi", { body: order.title, link: `/panel/siparisler/${order.code}`, email: false });
  }
  // Siparişe bağlı sohbet
  const existing = await db.query.conversations.findFirst({ where: eq(conversations.orderId, orderId) });
  if (!existing) {
    const [conv] = await db
      .insert(conversations)
      .values({ orderId, userAId: order.buyerId, userBId: order.providerId, lastMessagePreview: "Sipariş oluşturuldu" })
      .returning();
    const { postSystemMessage } = await import("./messaging");
    await postSystemMessage(
      conv!.id,
      `Sipariş ${order.code} oluşturuldu. Ödeme Eksen güvencesinde tutuluyor; teslimatı onaylayana kadar uzmana aktarılmaz.` +
        (order.requirements ? `\n\nMüşterinin notu:\n${order.requirements}` : ""),
    );
  }
  await notify(order.providerId, "order_new", `Yeni sipariş: ${order.title}`, {
    body: `${order.code} numaralı sipariş ödendi. İşe başladığınızda müşteriye haber verilir.`,
    link: `/panel/siparisler/${order.code}`,
  });
  await notify(order.buyerId, "order_paid", `Ödemeniz alındı — ${order.code}`, {
    body: "Ödemeniz güvenli havuz hesabında. Uzman bilgilendirildi.",
    link: `/panel/siparisler/${order.code}`,
  });
  await audit(null, "order.paid", "order", orderId, { code: order.code, totalKurus: order.totalKurus });
  return order;
}
