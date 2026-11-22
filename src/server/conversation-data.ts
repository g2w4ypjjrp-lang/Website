import "server-only";
import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export type ChatMessage = { id: string; senderId: string | null; kind: "text" | "delivery" | "system"; body: string; attachments: { id: string; name: string; size: number; mime: string }[]; readAt: string | null; createdAt: string };

export async function loadMessages(conversationId: string, after?: Date) {
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.conversationId, conversationId), after ? gt(messages.createdAt, after) : undefined))
    .orderBy(asc(messages.createdAt))
    .limit(after ? 100 : 300);
  return rows.map((m) => ({ id: m.id, senderId: m.senderId, kind: m.kind, body: m.body, attachments: m.attachments, readAt: m.readAt?.toISOString() ?? null, createdAt: m.createdAt.toISOString() })) satisfies ChatMessage[];
}
