import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import type { OrderStatus } from "@/lib/order-status";

const other = alias(users, "other");

export async function listOrdersFor(userId: string, perspective: "buyer" | "provider", statuses?: OrderStatus[], limit = 50) {
  const mine = perspective === "buyer" ? orders.buyerId : orders.providerId;
  const otherId = perspective === "buyer" ? orders.providerId : orders.buyerId;
  return db
    .select({ code: orders.code, title: orders.title, status: orders.status, totalKurus: orders.totalKurus, providerEarningKurus: orders.providerEarningKurus, dueAt: orders.dueAt, createdAt: orders.createdAt, otherName: other.name, otherAvatar: other.avatarId })
    .from(orders)
    .innerJoin(other, eq(other.id, otherId))
    .where(and(eq(mine, userId), statuses?.length ? inArray(orders.status, statuses) : sql`${orders.status} <> 'awaiting_payment' or ${orders.buyerId} = ${userId}`))
    .orderBy(desc(orders.updatedAt))
    .limit(limit);
}
