import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, dailyStats, orders, providerProfiles, services, users } from "@/db/schema";
import { AHead, KPI } from "@/components/admin/ui";
import { formatNumber, formatTRY } from "@/lib/utils";

export const metadata = { title: "Özet" };

const iso = (d: Date) => d.toISOString();

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ gun?: string }> }) {
  const { gun } = await searchParams;
  const days = [7, 30, 90].includes(Number(gun)) ? Number(gun) : 30;
  const since = new Date(Date.now() - days * 864e5);
  const today = new Date(new Date().toISOString().slice(0, 10));
  const [[u], [o], [svc], series, regSeries, traffic, organic, organicPages, topCats, topSvc, topProv] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*) filter (where ${users.status} <> 'deleted')::int`,
        dau: sql<number>`count(*) filter (where ${users.lastSeenAt} >= ${iso(today)}::timestamptz)::int`,
        mau: sql<number>`count(*) filter (where ${users.lastSeenAt} >= ${iso(new Date(Date.now() - 30 * 864e5))}::timestamptz)::int`,
        newUsers: sql<number>`count(*) filter (where ${users.createdAt} >= ${iso(since)}::timestamptz)::int`,
        providers: sql<number>`count(*) filter (where ${users.role} = 'provider' and ${users.status} = 'active')::int`,
        agencies: sql<number>`count(*) filter (where ${users.role} = 'provider' and ${users.accountType} <> 'individual' and ${users.status} = 'active')::int`,
        customers: sql<number>`count(*) filter (where ${users.role} = 'customer' and ${users.status} = 'active')::int`,
      })
      .from(users),
    db
      .select({
        orders: sql<number>`count(*) filter (where ${orders.paidAt} >= ${iso(since)}::timestamptz)::int`,
        gmv: sql<number>`coalesce(sum(${orders.totalKurus}) filter (where ${orders.paidAt} >= ${iso(since)}::timestamptz and ${orders.status} <> 'cancelled'),0)::bigint`,
        commission: sql<number>`coalesce(sum(${orders.commissionKurus}) filter (where ${orders.completedAt} >= ${iso(since)}::timestamptz and ${orders.status} = 'completed'),0)::bigint`,
        created: sql<number>`count(*) filter (where ${orders.createdAt} >= ${iso(since)}::timestamptz)::int`,
        active: sql<number>`count(*) filter (where ${orders.status} in ('created','in_progress','awaiting_delivery','delivered','revision_requested'))::int`,
      })
      .from(orders),
    db.select({ active: sql<number>`count(*) filter (where ${services.status} = 'active')::int`, pending: sql<number>`count(*) filter (where ${services.status} = 'pending')::int`, views: sql<number>`coalesce(sum(${services.viewCount}),0)::int` }).from(services),
    db.select({ d: sql<string>`to_char(${orders.paidAt}, 'YYYY-MM-DD')`, n: sql<number>`count(*)::int`, v: sql<number>`sum(${orders.totalKurus})::bigint` }).from(orders).where(gte(orders.paidAt, since)).groupBy(sql`1`),
    db.select({ d: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`, n: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, since)).groupBy(sql`1`),
    db.select({ d: dailyStats.day, m: dailyStats.metric, v: dailyStats.value }).from(dailyStats).where(and(gte(dailyStats.day, since.toISOString().slice(0, 10)), sql`${dailyStats.metric} in ('pageview','visitor','organic')`)),
    db.select({ e: dailyStats.dimension, v: sql<number>`sum(${dailyStats.value})::int` }).from(dailyStats).where(and(eq(dailyStats.metric, "organic"), gte(dailyStats.day, since.toISOString().slice(0, 10)))).groupBy(dailyStats.dimension),
    db.select({ p: dailyStats.dimension, v: sql<number>`sum(${dailyStats.value})::int` }).from(dailyStats).where(and(eq(dailyStats.metric, "organic_landing"), gte(dailyStats.day, since.toISOString().slice(0, 10)))).groupBy(dailyStats.dimension).orderBy(desc(sql`2`)).limit(8),
    db
      .select({ name: sql<string>`coalesce(pc.name, ${categories.name})`, n: sql<number>`count(${orders.id})::int`, v: sql<number>`coalesce(sum(${orders.totalKurus}),0)::bigint` })
      .from(orders)
      .innerJoin(services, eq(services.id, orders.serviceId))
      .innerJoin(categories, eq(categories.id, services.categoryId))
      .leftJoin(sql`categories pc`, sql`pc.id = ${categories.parentId}`)
      .where(and(gte(orders.paidAt, since), sql`${orders.status} <> 'cancelled'`))
      .groupBy(sql`1`)
      .orderBy(desc(sql`3`))
      .limit(6),
    db.select({ title: services.title, slug: services.slug, orders: services.orderCount, views: services.viewCount }).from(services).where(eq(services.status, "active")).orderBy(desc(services.orderCount), desc(services.viewCount)).limit(6),
    db.select({ name: providerProfiles.displayName, slug: providerProfiles.slug, done: providerProfiles.completedOrders, rating: providerProfiles.ratingAvg, count: providerProfiles.ratingCount }).from(providerProfiles).orderBy(desc(providerProfiles.completedOrders), desc(providerProfiles.ratingAvg)).limit(6),
  ]);
  const dayKeys = Array.from({ length: days }, (_, i) => new Date(Date.now() - (days - 1 - i) * 864e5).toISOString().slice(0, 10));
  const tsum = (m: string) => traffic.filter((t) => t.m === m).reduce((a, t) => a + t.v, 0);
  const visitors = tsum("visitor");
  const conv = svc!.views ? (o!.orders / svc!.views) * 100 : 0;
  const regConv = visitors ? (u!.newUsers / visitors) * 100 : 0;
  return (
    <>
      <AHead
        title="Özet ve analitik"
        sub={`Son ${days} gün`}
        action={<div className="flex gap-1 text-[13px]">{[7, 30, 90].map((d) => <Link key={d} href={`?gun=${d}`} className={`rounded px-2.5 py-1 ${d === days ? "bg-ink text-white" : "border border-line"}`}>{d} gün</Link>)}</div>}
      />
      <section className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        <KPI accent label="Satış hacmi (GMV)" value={formatTRY(Number(o!.gmv))} sub={`${formatNumber(o!.orders)} ödenmiş sipariş`} />
        <KPI accent label="Platform komisyon geliri" value={formatTRY(Number(o!.commission))} sub="Tamamlanan siparişler" />
        <KPI label="Günlük aktif kullanıcı" value={formatNumber(u!.dau)} sub={`Aylık aktif: ${formatNumber(u!.mau)}`} />
        <KPI label="Yeni kayıt" value={formatNumber(u!.newUsers)} sub={`Toplam üye: ${formatNumber(u!.total)}`} />
        <KPI label="Uzman / ajans" value={formatNumber(u!.providers)} sub={`${formatNumber(u!.agencies)} ajans veya şirket`} />
        <KPI label="Yayındaki hizmet" value={formatNumber(svc!.active)} sub={<Link href="/yonetim/hizmetler?durum=pending" className="underline">{svc!.pending} onay bekliyor</Link>} />
        <KPI label="Devam eden sipariş" value={formatNumber(o!.active)} sub={`${formatNumber(o!.created)} sipariş oluşturuldu`} />
        <KPI label="Dönüşüm" value={`%${conv.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`} sub={visitors >= 50 ? `Ziyaretçi → kayıt: %${regConv.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}` : "Sipariş / hizmet görüntüleme"} />
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        <Chart title="Günlük satış hacmi" keys={dayKeys} values={Object.fromEntries(series.map((s) => [s.d, Number(s.v) / 100]))} fmt={(v) => formatTRY(v * 100)} />
        <Chart title="Günlük yeni kayıt" keys={dayKeys} values={Object.fromEntries(regSeries.map((s) => [s.d, s.n]))} fmt={(v) => String(v)} />
        <Chart title="Ziyaretçi (çerezsiz sayaç)" keys={dayKeys} values={Object.fromEntries(dayKeys.map((k) => [k, traffic.filter((t) => t.d === k && t.m === "visitor").reduce((a, t) => a + t.v, 0)]))} fmt={(v) => formatNumber(v)} sub={`${formatNumber(tsum("pageview"))} sayfa görüntüleme`} />
        <Chart title="Organik arama trafiği" keys={dayKeys} values={Object.fromEntries(dayKeys.map((k) => [k, traffic.filter((t) => t.d === k && t.m === "organic").reduce((a, t) => a + t.v, 0)]))} fmt={(v) => formatNumber(v)} sub={organic.length ? organic.map((x) => `${x.e} ${x.v}`).join(" · ") : "Henüz organik ziyaret yok"} accent />
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-4">
        <List title="En çok satan kategoriler" rows={topCats.map((c) => [c.name, `${c.n} · ${formatTRY(Number(c.v))}`])} />
        <List title="Popüler hizmetler" rows={topSvc.map((s) => [<Link key={s.slug} href={`/hizmet/${s.slug}`} className="hover:underline">{s.title}</Link>, `${s.orders} sipariş · ${s.views} gör.`])} />
        <List title="En başarılı uzmanlar" rows={topProv.map((p) => [<Link key={p.slug} href={`/uzman/${p.slug}`} className="hover:underline">{p.name}</Link>, `${p.done} iş${p.count ? ` · ${(p.rating / 100).toFixed(1)}★` : ""}`])} />
        <List title="Organik giriş sayfaları" rows={organicPages.map((p) => [p.p, String(p.v)])} empty="Arama motorlarından giriş henüz yok. Search Console bağlantısını kontrol edin." />
      </section>
    </>
  );
}

function Chart({ title, keys, values, fmt, sub, accent }: { title: string; keys: string[]; values: Record<string, number>; fmt: (v: number) => string; sub?: string; accent?: boolean }) {
  const vals = keys.map((k) => values[k] ?? 0);
  const max = Math.max(1, ...vals);
  const total = vals.reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4"><p className="text-[14px] font-medium">{title}</p><p className="num text-[15px]">{fmt(total)}</p></div>
      {sub && <p className="mt-0.5 text-[12px] text-muted">{sub}</p>}
      <div className="mt-4 flex h-28 items-end gap-[2px]" role="img" aria-label={`${title}: toplam ${fmt(total)}`}>
        {vals.map((v, i) => <div key={keys[i]} title={`${keys[i]}: ${fmt(v)}`} className={`flex-1 rounded-t-[1px] ${accent ? "bg-trust" : i === vals.length - 1 ? "bg-accent" : "bg-ink/75"}`} style={{ height: `${Math.max(1.5, (v / max) * 100)}%`, opacity: v ? 1 : 0.12 }} />)}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted"><span>{keys[0]?.slice(5)}</span><span>{keys[keys.length - 1]?.slice(5)}</span></div>
    </div>
  );
}

function List({ title, rows, empty = "Veri yok" }: { title: string; rows: [React.ReactNode, string][]; empty?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="mb-3 text-[14px] font-medium">{title}</p>
      {rows.length === 0 ? <p className="text-[13px] text-muted">{empty}</p> : (
        <ol className="space-y-2 text-[13px]">{rows.map(([a, b], i) => <li key={i} className="flex justify-between gap-3"><span className="min-w-0 truncate">{a}</span><span className="num shrink-0 text-muted">{b}</span></li>)}</ol>
      )}
    </div>
  );
}
