import Link from "next/link";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments, payouts, promotions, providerProfiles } from "@/db/schema";
import { markPayoutPaidAction, releasePayoutsAction } from "@/app/actions/admin";
import { AHead, KPI, Table, Tabs } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { formatDate, formatTRY } from "@/lib/utils";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Finans" };

export default async function Finance({ searchParams }: { searchParams: Promise<{ sekme?: string }> }) {
  await requireAdmin();
  const { sekme = "hakedis" } = await searchParams;
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const [[t], [pay], monthly, payoutRows, paymentRows, [promo], promoRows] = await Promise.all([
    db
      .select({
        gmv: sql<number>`coalesce(sum(${orders.totalKurus}) filter (where ${orders.paidAt} is not null and ${orders.status} <> 'cancelled'),0)::bigint`,
        commission: sql<number>`coalesce(sum(${orders.commissionKurus}) filter (where ${orders.status} = 'completed'),0)::bigint`,
        pendingCommission: sql<number>`coalesce(sum(${orders.commissionKurus}) filter (where ${orders.status} in ('created','in_progress','awaiting_delivery','delivered','revision_requested','disputed','refund_in_progress')),0)::bigint`,
        refunded: sql<number>`coalesce(sum(${orders.totalKurus}) filter (where ${orders.status} = 'cancelled' and ${orders.paidAt} is not null),0)::bigint`,
      })
      .from(orders),
    db
      .select({
        held: sql<number>`coalesce(sum(${payouts.amountKurus}) filter (where ${payouts.status} = 'held'),0)::bigint`,
        available: sql<number>`coalesce(sum(${payouts.amountKurus}) filter (where ${payouts.status} = 'available'),0)::bigint`,
        paid: sql<number>`coalesce(sum(${payouts.amountKurus}) filter (where ${payouts.status} = 'paid'),0)::bigint`,
        due: sql<number>`count(*) filter (where ${payouts.status} = 'held' and ${payouts.availableAt} <= now())::int`,
      })
      .from(payouts),
    db
      .select({ m: sql<string>`to_char(date_trunc('month', ${orders.completedAt}), 'YYYY-MM')`, gmv: sql<number>`sum(${orders.totalKurus})::bigint`, fee: sql<number>`sum(${orders.commissionKurus})::bigint`, n: sql<number>`count(*)::int` })
      .from(orders)
      .where(sql`${orders.status} = 'completed' and ${orders.completedAt} >= ${yearStart.toISOString()}::timestamptz`)
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select({ p: payouts, code: orders.code, name: providerProfiles.displayName, iban: providerProfiles.iban }).from(payouts).innerJoin(orders, eq(orders.id, payouts.orderId)).innerJoin(providerProfiles, eq(providerProfiles.userId, payouts.providerId)).orderBy(desc(payouts.createdAt)).limit(200),
    db.select({ p: payments, code: orders.code }).from(payments).innerJoin(orders, eq(orders.id, payments.orderId)).where(gte(payments.createdAt, new Date(Date.now() - 90 * 864e5))).orderBy(desc(payments.createdAt)).limit(200),
    db.select({ featured: sql<number>`coalesce(sum(${promotions.amountKurus}) filter (where ${promotions.status} = 'succeeded' and ${promotions.type} = 'featured'),0)::bigint`, premium: sql<number>`coalesce(sum(${promotions.amountKurus}) filter (where ${promotions.status} = 'succeeded' and ${promotions.type} = 'premium'),0)::bigint` }).from(promotions),
    db.select({ p: promotions, name: providerProfiles.displayName }).from(promotions).innerJoin(providerProfiles, eq(providerProfiles.userId, promotions.providerId)).orderBy(desc(promotions.createdAt)).limit(200),
  ]);
  return (
    <>
      <AHead title="Finans" sub="Satış hacmi, komisyon geliri, hakedişler ve ödeme kayıtları" action={<div className="flex gap-2 text-[13px]"><a href="/api/yonetim/export?tur=hakedisler" className="rounded border border-line px-3 py-1.5">Hakediş CSV</a><a href="/api/yonetim/export?tur=siparisler" className="rounded border border-line px-3 py-1.5">Sipariş CSV</a></div>} />
      <section className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        <KPI accent label="Toplam satış hacmi" value={formatTRY(Number(t!.gmv))} />
        <KPI accent label="Kazanılmış komisyon" value={formatTRY(Number(t!.commission))} sub={`Devam eden siparişlerde: ${formatTRY(Number(t!.pendingCommission))}`} />
        <KPI label="Ödemeye hazır hakediş" value={formatTRY(Number(pay!.available))} sub={`Bekleme süresinde: ${formatTRY(Number(pay!.held))}`} />
        <KPI label="İade edilen" value={formatTRY(Number(t!.refunded))} sub={`Aktarılan hakediş: ${formatTRY(Number(pay!.paid))}`} />
        <KPI accent label="Tanıtım geliri" value={formatTRY(Number(promo!.featured) + Number(promo!.premium))} sub={`Öne çıkarma ${formatTRY(Number(promo!.featured))} · Premium ${formatTRY(Number(promo!.premium))}`} />
      </section>
      <section className="mt-8 rounded-lg border border-line bg-surface p-5">
        <p className="mb-3 text-[14px] font-medium">{new Date().getFullYear()} aylık rapor (tamamlanan siparişler)</p>
        {monthly.length === 0 ? <p className="text-[13px] text-muted">Bu yıl tamamlanan sipariş yok.</p> : (
          <table className="w-full text-[13.5px]"><thead className="text-left text-[12px] text-muted"><tr><th className="py-1 font-normal">Ay</th><th className="py-1 text-right font-normal">Sipariş</th><th className="py-1 text-right font-normal">Hacim</th><th className="py-1 text-right font-normal">Komisyon</th></tr></thead>
            <tbody className="divide-y divide-line-2">{monthly.map((m) => <tr key={m.m}><td className="num py-1.5">{m.m}</td><td className="num py-1.5 text-right">{m.n}</td><td className="num py-1.5 text-right">{formatTRY(Number(m.gmv))}</td><td className="num py-1.5 text-right">{formatTRY(Number(m.fee))}</td></tr>)}</tbody></table>
        )}
      </section>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Tabs current={`/yonetim/finans?sekme=${sekme}`} items={[["/yonetim/finans?sekme=hakedis", "Hakedişler"], ["/yonetim/finans?sekme=odemeler", "Ödeme kayıtları"], ["/yonetim/finans?sekme=tanitim", "Tanıtım satışları"]]} />
        {sekme === "hakedis" && <form action={releasePayoutsAction}><button className="rounded bg-ink px-3 py-1.5 text-[13px] text-white">Vadesi gelenleri serbest bırak ({pay!.due})</button></form>}
      </div>
      {sekme === "tanitim" ? (
        <Table head={["Kod", "Uzman", "Ürün", "Durum", "Tarih", { label: "Tutar", right: true }]}>
          {promoRows.map(({ p, name }) => (
            <tr key={p.id}><td className="num px-3 py-2.5">{p.code}</td><td className="px-3 py-2.5">{name}</td><td className="px-3 py-2.5">{p.type === "premium" ? "Premium üyelik" : "Öne çıkarma"} · {p.days} gün</td><td className="px-3 py-2.5"><Badge tone={p.status === "succeeded" ? "ok" : p.status === "failed" ? "bad" : "neutral"}>{p.status}</Badge></td><td className="px-3 py-2.5 text-muted">{formatDate(p.createdAt)}</td><td className="num px-3 py-2.5 text-right">{formatTRY(p.amountKurus)}</td></tr>
          ))}
        </Table>
      ) : sekme === "hakedis" ? (
        <Table head={["Uzman", "Sipariş", "Durum", "Vade", "IBAN", { label: "Tutar", right: true }, ""]}>
          {payoutRows.map(({ p, code, name, iban }) => (
            <tr key={p.id}>
              <td className="px-3 py-2.5">{name}</td>
              <td className="num px-3 py-2.5"><Link href={`/panel/siparisler/${code}`} className="underline">{code}</Link></td>
              <td className="px-3 py-2.5"><Badge tone={p.status === "paid" ? "ok" : p.status === "available" ? "info" : p.status === "held" ? "warn" : "neutral"}>{p.status === "paid" ? "Ödendi" : p.status === "available" ? "Ödemeye hazır" : p.status === "held" ? "Bekleme süresinde" : "İptal"}</Badge></td>
              <td className="px-3 py-2.5 text-muted">{p.availableAt ? formatDate(p.availableAt) : "—"}</td>
              <td className="px-3 py-2.5 font-mono text-[12px]">{iban ?? <span className="text-bad">Eksik</span>}</td>
              <td className="num px-3 py-2.5 text-right">{formatTRY(p.amountKurus, true)}</td>
              <td className="px-3 py-2.5 text-right">{p.status === "available" && <form action={markPayoutPaidAction} className="flex justify-end gap-1"><input type="hidden" name="id" value={p.id} /><input name="reference" placeholder="EFT ref." className="field !w-24 !px-2 !py-0.5 text-[12px]" /><button className="text-[12.5px] underline">Ödendi</button></form>}{p.status === "paid" && <span className="text-[12px] text-muted">{p.reference}</span>}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <Table head={["Sipariş", "Sağlayıcı", "Durum", "Tarih", { label: "Tutar", right: true }]}>
          {paymentRows.map(({ p, code }) => (
            <tr key={p.id}>
              <td className="num px-3 py-2.5"><Link href={`/panel/siparisler/${code}`} className="underline">{code}</Link></td>
              <td className="px-3 py-2.5">{p.provider}</td>
              <td className="px-3 py-2.5"><Badge tone={p.status === "succeeded" ? "ok" : p.status === "failed" ? "bad" : p.status === "refunded" ? "neutral" : "warn"}>{p.status}</Badge></td>
              <td className="px-3 py-2.5 text-muted">{formatDate(p.createdAt)}</td>
              <td className="num px-3 py-2.5 text-right">{formatTRY(p.amountKurus, true)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
