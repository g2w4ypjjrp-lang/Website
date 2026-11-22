import { listOrdersFor } from "@/server/panel-queries";
import { apiError, apiUser, json } from "@/server/api";
import { ORDER_STATUS } from "@/lib/order-status";

export async function GET(req: Request) {
  const u = await apiUser(req);
  if (!u) return apiError(401, "Oturum gerekli.");
  const rows = await listOrdersFor(u.id, u.role === "provider" ? "provider" : "buyer", undefined, 100);
  return json({
    items: rows.map((o) => ({ code: o.code, title: o.title, status: o.status, statusLabel: ORDER_STATUS[o.status].label, total: o.totalKurus / 100, providerEarning: u.role === "provider" ? o.providerEarningKurus / 100 : undefined, dueAt: o.dueAt, counterpart: o.otherName })),
  });
}
