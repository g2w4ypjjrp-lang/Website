import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { absoluteUrl } from "@/lib/site";
import { sendMail } from "./mail";

export type NotificationType =
  | "order_new"
  | "order_paid"
  | "order_started"
  | "order_delivered"
  | "order_revision"
  | "order_completed"
  | "order_cancelled"
  | "offer_new"
  | "offer_accepted"
  | "message_new"
  | "review_new"
  | "payout"
  | "account"
  | "system"
  | "ticket";

const EMAIL_CATEGORY: Partial<Record<NotificationType, "emailOrders" | "emailMessages">> = {
  order_new: "emailOrders",
  order_paid: "emailOrders",
  order_delivered: "emailOrders",
  order_revision: "emailOrders",
  order_completed: "emailOrders",
  order_cancelled: "emailOrders",
  offer_new: "emailOrders",
  offer_accepted: "emailOrders",
  review_new: "emailOrders",
  message_new: "emailMessages",
  ticket: "emailOrders",
};

export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  opts: { body?: string; link?: string; email?: boolean } = {},
) {
  await db.insert(notifications).values({ userId, type, title, body: opts.body, link: opts.link });
  if (opts.email === false) return;
  const u = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { email: true, notificationPrefs: true } });
  if (!u) return;
  const cat = EMAIL_CATEGORY[type];
  if (cat && !u.notificationPrefs[cat]) return;
  if (!cat && type !== "account" && type !== "system" && type !== "payout") return;
  await sendMail({
    to: u.email,
    subject: title,
    title,
    body: opts.body ?? "",
    cta: opts.link ? { label: "Görüntüle", href: absoluteUrl(opts.link) } : undefined,
  });
}
