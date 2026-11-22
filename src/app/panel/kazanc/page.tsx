import Link from "next/link";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, payouts, tickets } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { PageHead } from "@/components/panel/page-head";
import { Badge, EmptyState, Stat } from "@/components/ui/primitives";
import { StatusBadge } from "@/components/panel/order-bits";
import { formatDate, formatTRY } from "@/lib/utils";

export const metadata = { title: "Kazanç ve ödemeler" };
const PS = { held: ["Hakediş bekliyor", "warn"], available: ["Ödemeye hazır", "info"], paid: ["Ödendi", "ok"], cancelled: ["İptal", "neutral"] } as const;

export default async function Earnings() {
  const user = await requireRole("provider");
  const [[sum], payoutRows, orderRows, refunds] = await Promise.all([
    db
      .select({
        gross: sql<number>`coalesce(sum(${orders.totalKurus}) filter (where ${orders.status} = 'completed'),0)::int`,
        fee: sql<number>`coalesce(sum(${orders.commissionKurus}) filter (where ${orders.status} = 'completed'),0)::int`,
        net: sql<number>`coalesce(sum(${orders.providerEarningKurus}) filter (where ${orders.status} = 'completed'),0)::int`,
        inProgress: sql<number>`coalesce(sum(${orders.providerEarningKurus}) filter (where ${orders.status} in ('created','in_progress','awaiting_delivery','delivered','revision_requested')),0)::int`,
      })
      .from(orders)
      .where(eq(orders.providerId, user.id)),
    db.select({ p: payouts, code: orders.code, title: orders.title }).from(payouts).innerJoin(orders, eq(orders.id, payouts.orderId)).where(eq(payouts.providerId, user.id)).orderBy(desc(payouts.createdAt)).limit(100),
    db.select().from(orders).where(and(eq(orders.providerId, user.id), inArray(orders.status, ["completed", "cancelled", "refund_in_progress", "disputed"]))).orderBy(desc(orders.updatedAt)).limit(100),
    db.select({ t: tickets, code: orders.code }).from(tickets).innerJoin(orders, eq(orders.id, tickets.orderId)).where(and(eq(orders.providerId, user.id), eq(tickets.type, "refund"))).orderBy(desc(tickets.createdAt)),
  ]);
  const held = payoutRows.filter((r) => r.p.status === "held").reduce((a, r) => a + r.p.amountKurus, 0);
  const avail = payoutRows.filter((r) => r.p.status === "available").reduce((a, r) => a + r.p.amountKurus, 0);
  const paid = payoutRows.filter((r) => r.p.status === "paid").reduce((a, r) => a + r.p.amountKurus, 0);
  return (
    <>
      <PageHead title="Kazanç ve ödemeler" sub="Hakedişler sipariş onayından sonra bekleme süresinin ardından IBAN’ına aktarılır." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Toplam net kazanç" value={formatTRY(sum!.net)} sub={`Brüt ${formatTRY(sum!.gross)}`} />
        <Stat label="Ödenen hizmet bedeli" value={formatTRY(sum!.fee)} />
        <Stat label="Hakediş bekleyen" value={formatTRY(held)} sub={`Ödemeye hazır: ${formatTRY(avail)}`} />
        <Stat label="Hesabına aktarılan" value={formatTRY(paid)} sub={`Devam eden işler: ${formatTRY(sum!.inProgress)}`} />
      </section>
      <section className="mt-10">
        <h2 className="mb-3 text-[18px] font-semibold">Hakediş geçmişi</h2>
        {payoutRows.length === 0 ? <EmptyState title="Henüz hakediş yok" body="Müşteri teslimatı onayladığında tutar burada görünür." /> : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[560px] text-[14px]">
              <thead className="border-b border-line text-left text-[12.5px] text-muted"><tr><th className="px-4 py-2.5 font-normal">Sipariş</th><th className="px-4 py-2.5 font-normal">Durum</th><th className="px-4 py-2.5 font-normal">Serbest kalma</th><th className="px-4 py-2.5 text-right font-normal">Tutar</th></tr></thead>
              <tbody className="divide-y divide-line-2">
                {payoutRows.map(({ p, code, title }) => (
                  <tr key={p.id}><td className="px-4 py-3"><Link href={`/panel/siparisler/${code}`} className="hover:underline">{title}</Link><span className="num block text-[12px] text-muted">{code}</span></td><td className="px-4 py-3"><Badge tone={PS[p.status][1]} dot>{PS[p.status][0]}</Badge></td><td className="px-4 py-3 text-muted">{p.paidAt ? `Ödendi ${formatDate(p.paidAt)}` : p.availableAt ? formatDate(p.availableAt) : "—"}</td><td className="num px-4 py-3 text-right">{formatTRY(p.amountKurus, true)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="mt-10">
        <h2 className="mb-3 text-[18px] font-semibold">Komisyon dökümü</h2>
        {orderRows.length === 0 ? <p className="text-[14px] text-muted">Kayıt yok.</p> : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead className="border-b border-line text-left text-[12.5px] text-muted"><tr><th className="px-4 py-2.5 font-normal">Sipariş</th><th className="px-4 py-2.5 font-normal">Durum</th><th className="px-4 py-2.5 text-right font-normal">Tutar</th><th className="px-4 py-2.5 text-right font-normal">Oran</th><th className="px-4 py-2.5 text-right font-normal">Hizmet bedeli</th><th className="px-4 py-2.5 text-right font-normal">Net</th></tr></thead>
              <tbody className="divide-y divide-line-2">
                {orderRows.map((o) => (
                  <tr key={o.id}><td className="num px-4 py-3"><Link href={`/panel/siparisler/${o.code}`} className="hover:underline">{o.code}</Link></td><td className="px-4 py-3"><StatusBadge status={o.status} /></td><td className="num px-4 py-3 text-right">{formatTRY(o.totalKurus)}</td><td className="num px-4 py-3 text-right">%{(o.commissionBps / 100).toLocaleString("tr-TR")}</td><td className="num px-4 py-3 text-right">{formatTRY(o.commissionKurus)}</td><td className="num px-4 py-3 text-right">{formatTRY(o.providerEarningKurus)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {refunds.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-[18px] font-semibold">İade talepleri</h2>
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">{refunds.map(({ t, code }) => <li key={t.id} className="flex justify-between gap-4 px-4 py-3 text-[14px]"><Link href={`/panel/siparisler/${code}`} className="num hover:underline">{code}</Link><span className="text-muted">{t.status === "open" ? "İnceleniyor" : t.status === "approved" ? "İade onaylandı" : t.status === "rejected" ? "Reddedildi" : "Çözüldü"}</span></li>)}</ul>
        </section>
      )}
    </>
  );
}
