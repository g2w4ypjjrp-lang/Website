import "server-only";
import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { blocks, conversations, messages, type Attachment } from "@/db/schema";
import { notify } from "./notify";
import { rateLimit } from "./rate-limit";

export class MessageError extends Error {}

const CONTACT_PATTERNS = [
  /(\+?90[\s-]?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/, // TR cep
  /[\w.+-]+@[\w-]+\.[\w.]+/, // e-posta
  /(whats?app|telegram|wp\.me|t\.me\/)/i,
];

/** Platform dışına yönlendirme ve spam sinyalleri: mesaj engellenmez, işaretlenir ve kullanıcı uyarılır. */
export function riskSignals(body: string) {
  const contact = CONTACT_PATTERNS.some((r) => r.test(body));
  const links = (body.match(/https?:\/\//g) ?? []).length;
  return { flagged: contact || links > 3, contact };
}

export async function isBlocked(a: string, b: string) {
  const row = await db.query.blocks.findFirst({
    where: or(and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)), and(eq(blocks.blockerId, b), eq(blocks.blockedId, a))),
  });
  return !!row;
}

export async function getConversationFor(userId: string, conversationId: string) {
  const conv = await db.query.conversations.findFirst({ where: eq(conversations.id, conversationId) });
  if (!conv || (conv.userAId !== userId && conv.userBId !== userId)) return null;
  return conv;
}

export async function findOrCreateDirectConversation(a: string, b: string) {
  const existing = await db.query.conversations.findFirst({
    where: and(
      sql`${conversations.orderId} is null`,
      or(and(eq(conversations.userAId, a), eq(conversations.userBId, b)), and(eq(conversations.userAId, b), eq(conversations.userBId, a))),
    ),
  });
  if (existing) return existing;
  const [conv] = await db.insert(conversations).values({ userAId: a, userBId: b }).returning();
  return conv!;
}

export async function sendMessage(senderId: string, conversationId: string, body: string, attachments: Attachment[] = [], kind: "text" | "delivery" = "text") {
  const conv = await getConversationFor(senderId, conversationId);
  if (!conv) throw new MessageError("Sohbet bulunamadı.");
  const other = conv.userAId === senderId ? conv.userBId : conv.userAId;
  if (await isBlocked(senderId, other)) throw new MessageError("Bu kullanıcıyla mesajlaşma engellenmiş.");
  const rl = await rateLimit(`msg:${senderId}`, 30, 60_000);
  if (!rl.ok) throw new MessageError("Çok hızlı mesaj gönderiyorsunuz. Biraz bekleyin.");
  const text = body.trim().slice(0, 5000);
  if (!text && attachments.length === 0) throw new MessageError("Boş mesaj gönderilemez.");
  const risk = riskSignals(text);
  const [msg] = await db
    .insert(messages)
    .values({ conversationId, senderId, body: text, attachments, kind, flagged: risk.flagged })
    .returning();
  const preview = kind === "delivery" ? "Teslimat gönderildi" : text ? text.slice(0, 120) : `${attachments.length} dosya`;
  await db.update(conversations).set({ lastMessageAt: new Date(), lastMessagePreview: preview }).where(eq(conversations.id, conversationId));
  // Bildirim: aynı sohbet için 10 dakikada en fazla bir e-posta
  const throttle = await rateLimit(`notify-msg:${conversationId}:${other}`, 1, 10 * 60_000);
  await notify(other, "message_new", "Yeni mesajınız var", {
    body: preview,
    link: `/panel/mesajlar/${conversationId}`,
    email: throttle.ok,
  });
  return { message: msg!, warnContact: risk.contact };
}

export async function postSystemMessage(conversationId: string, body: string) {
  await db.insert(messages).values({ conversationId, senderId: null, kind: "system", body });
  await db.update(conversations).set({ lastMessageAt: new Date(), lastMessagePreview: body.slice(0, 120) }).where(eq(conversations.id, conversationId));
}

export async function markRead(userId: string, conversationId: string) {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(and(eq(messages.conversationId, conversationId), sql`${messages.senderId} <> ${userId}`, sql`${messages.readAt} is null`));
}
