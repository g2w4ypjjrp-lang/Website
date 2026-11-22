import "server-only";
import { desc, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { conversations, orders, users } from "@/db/schema";

const ua = alias(users, "ua");
const ub = alias(users, "ub");

export async function inboxFor(userId: string) {
  const rows = await db
    .select({
      id: conversations.id,
      lastMessageAt: conversations.lastMessageAt,
      preview: conversations.lastMessagePreview,
      orderCode: orders.code,
      orderTitle: orders.title,
      aId: conversations.userAId,
      aName: ua.name,
      aAvatar: ua.avatarId,
      bName: ub.name,
      bAvatar: ub.avatarId,
      unread: sql<number>`(select count(*)::int from messages m where m.conversation_id = ${conversations.id} and m.read_at is null and m.sender_id is not null and m.sender_id <> ${userId})`,
    })
    .from(conversations)
    .innerJoin(ua, eq(ua.id, conversations.userAId))
    .innerJoin(ub, eq(ub.id, conversations.userBId))
    .leftJoin(orders, eq(orders.id, conversations.orderId))
    .where(or(eq(conversations.userAId, userId), eq(conversations.userBId, userId)))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);
  return rows.map((r) => {
    const meIsA = r.aId === userId;
    return { id: r.id, lastMessageAt: r.lastMessageAt, preview: r.preview, orderCode: r.orderCode, orderTitle: r.orderTitle, otherName: meIsA ? r.bName : r.aName, otherAvatar: meIsA ? r.bAvatar : r.aAvatar, unread: r.unread };
  });
}
