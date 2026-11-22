import Link from "next/link";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { adminCancelOrderAction } from "@/app/actions/admin";
import { AHead, Table, Tabs } from "@/components/admin/ui";
import { StatusBadge } from "@/components/panel/order-bits";
import { ORDER_STATUS, type OrderStatus } from "@/lib/order-status";
import { formatDateTime, formatTRY } from "@/lib/utils";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Siparişler" };
const b = alias(users, "b");
const p = alias(users, "p");

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ durum?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const where: (SQL | undefined)[] = [];
  if (sp.durum && sp.durum in ORDER_STATUS) where.push(eq(orders.status, sp.durum as OrderStatus));
  if (sp.q) where.push(sql`(${orders.code} ilike '%' || ${sp.q} || '%' or search_norm(${orders.title}) ilike '%' || search_norm(${sp.q}) || '%')`);
  const [rows, counts] = await Promise.all([
    db.select({ o: orders, buyer: b.name, provider: p.name }).from(orders).innerJoin(b, eq(b.id, orders.buyerId)).innerJoin(p, eq(p.id, orders.providerId)).where(and(...where)).orderBy(desc(orders.createdAt)).limit(200),
    db.select({ s: orders.status, n: sql<number>`count(*)::int` }).from(orders).groupBy(orders.status),
  ]);
  const tabs: [string, string, number?][] = [["/yonetim/siparisler", "Tümü", counts.reduce((a, c) => a + c.n, 0)], ...counts.map((c) => [`/yonetim/siparisler?durum=${c.s}`, ORDER_STATUS[c.s].label, c.n] as [string, string, number])];
  return (
    <>
      <AHead title="Siparişler" sub="Tüm siparişler, iptal ve iadeler. Sipariş detayında sohbet ve dosyalar salt okunur görüntülenir." action={<a href="/api/yonetim/export?tur=siparisler" className="rounded border border-line px-3 py-1.5 text-[13px]">CSV indir</a>} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Tabs current={sp.durum ? `/yonetim/siparisler?durum=${sp.durum}` : "/yonetim/siparisler"} items={tabs} />
        <form className="flex gap-2"><input name="q" defaultValue={sp.q} placeholder="Kod veya başlık" className="field !w-52 !py-1.5 text-[13.5px]" /><button className="rounded bg-ink px-3 text-[13px] text-white">Ara</button></form>
      </div>
      <Table head={["Sipariş", "Müşteri → Uzman", "Durum", "Tarih", { label: "Tutar", right: true }, { label: "Komisyon", right: true }, ""]}>
        {rows.map(({ o, buyer, provider }) => (
          <tr key={o.id}>
            <td className="px-3 py-2.5"><Link href={`/panel/siparisler/${o.code}`} className="font-medium hover:underline">{o.title}</Link><span className="num block text-[12px] text-muted">{o.code}</span></td>
            <td className="px-3 py-2.5 text-[13px]">{buyer} → {provider}</td>
            <td className="px-3 py-2.5"><StatusBadge status={o.status} /></td>
            <td className="px-3 py-2.5 text-muted">{formatDateTime(o.createdAt)}</td>
            <td className="num px-3 py-2.5 text-right">{formatTRY(o.totalKurus)}</td>
            <td className="num px-3 py-2.5 text-right">{formatTRY(o.commissionKurus)} <span className="text-muted">%{o.commissionBps / 100}</span></td>
            <td className="px-3 py-2.5 text-right">
              {["created", "in_progress", "awaiting_delivery", "delivered", "revision_requested", "refund_in_progress", "disputed"].includes(o.status) && (
                <form action={adminCancelOrderAction}><input type="hidden" name="id" value={o.id} /><button className="text-[12.5px] text-bad underline">İptal + iade</button></form>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
