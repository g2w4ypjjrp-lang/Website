import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payouts, providerProfiles } from "@/db/schema";
import { admin2faRequired, getCurrentUser } from "@/server/auth";
import { audit } from "@/server/audit";

const csv = (rows: (string | number | null | undefined)[][]) => "﻿" + rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return new Response("Yetkisiz", { status: 403 });
  if (admin2faRequired() && !user.totpEnabled) return new Response("Önce iki adımlı doğrulamayı etkinleştirin.", { status: 403 });
  const tur = new URL(req.url).searchParams.get("tur");
  let body: string;
  if (tur === "hakedisler") {
    const rows = await db.select({ p: payouts, code: orders.code, name: providerProfiles.displayName, iban: providerProfiles.iban }).from(payouts).innerJoin(orders, eq(orders.id, payouts.orderId)).innerJoin(providerProfiles, eq(providerProfiles.userId, payouts.providerId)).orderBy(desc(payouts.createdAt));
    body = csv([["Uzman", "IBAN", "Sipariş", "Durum", "Vade", "Ödeme tarihi", "Referans", "Tutar (TL)"], ...rows.map(({ p, code, name, iban }) => [name, iban, code, p.status, p.availableAt?.toISOString().slice(0, 10), p.paidAt?.toISOString().slice(0, 10), p.reference, (p.amountKurus / 100).toFixed(2).replace(".", ",")])]);
  } else {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    body = csv([["Kod", "Başlık", "Durum", "Oluşturma", "Ödeme", "Tamamlanma", "Tutar", "Komisyon oranı", "Komisyon", "Uzman net"], ...rows.map((o) => [o.code, o.title, o.status, o.createdAt.toISOString(), o.paidAt?.toISOString(), o.completedAt?.toISOString(), (o.totalKurus / 100).toFixed(2).replace(".", ","), (o.commissionBps / 100).toString().replace(".", ","), (o.commissionKurus / 100).toFixed(2).replace(".", ","), (o.providerEarningKurus / 100).toFixed(2).replace(".", ",")])]);
  }
  await audit(user.id, "admin.export", tur ?? "siparisler", null);
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="eksen-${tur ?? "siparisler"}-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
