import "server-only";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { clientInfo } from "./request";

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  meta: Record<string, unknown> = {},
) {
  let ip: string | null = null;
  try {
    ip = (await clientInfo()).ip;
  } catch {
    /* istek bağlamı dışında (cron, script) */
  }
  await db.insert(auditLogs).values({ actorId, action, entityType, entityId, meta, ip });
}
