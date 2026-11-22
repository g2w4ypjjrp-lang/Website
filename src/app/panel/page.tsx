import Link from "next/link";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, payouts, projects, providerProfiles, services } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { listOrdersFor } from "@/server/panel-queries";
import { PageHead } from "@/components/panel/page-head";
import { OrderTable } from "@/components/panel/order-bits";
import { EarningsChart } from "@/components/panel/earnings-chart";
import { EmptyState, Stat, Notice } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ACTIVE_STATUSES } from "@/lib/order-status";
import { formatNumber, formatRating, formatTRY } from "@/lib/utils";

export default async function PanelHome({ searchParams }: { searchParams: Promise<{ hosgeldin?: string; yetki?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const first = user.name.split(" ")[0];
  return (
    <>
      {sp.yetki === "yok" && <Notice tone="warn" className="mb-6">Bu sayfaya erişim yetkiniz yok.</Notice>}
      {user.role === "provider" ? <ProviderHome userId={user.id} name={first!} welcome={!!sp.hosgeldin} /> : <CustomerHome userId={user.id} name={first!} welcome={!!sp.hosgeldin} />}
    </>
  );
}

async function ProviderHome({ userId, name, welcome }: { userId: string; name: string; welcome: boolean }) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [profile, [agg], [svcAgg], active, monthly, [pending]] = await Promise.all([
    db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, userId) }),
    db
      .select({
        totalSales: sql<number>`coalesce(sum(${orders.totalKurus}) filter (where ${orders.status} = 'completed'), 0)::int`,
        monthEarning: sql<number>`coalesce(sum(${orders.providerEarningKurus}) filter (where ${orders.status} = 'completed' and ${orders.completedAt} >= ${monthStart.toISOString()}::timestamptz), 0)::int`,
        pending: sql<number>`count(*) filter (where ${orders.status} in ('created','in_progress','awaiting_delivery','revision_requested'))::int`,
        completed: sql<number>`count(*) filter (where ${orders.status} = 'completed')::int`,
        paidOrders: sql<number>`count(*) filter (where ${orders.paidAt} is not null)::int`,
      })
      .from(orders)
      .where(eq(orders.providerId, userId)),
    db.select({ views: sql<number>`coalesce(sum(${services.viewCount}),0)::int`, count: sql<number>`count(*)::int` }).from(services).where(eq(services.providerId, userId)),
    listOrdersFor(userId, "provider", ACTIVE_STATUSES, 6),
    db
      .select({ m: sql<string>`to_char(date_trunc('month', ${orders.completedAt}), 'YYYY-MM')`, v: sql<number>`sum(${orders.providerEarningKurus})::int` })
      .from(orders)
      .where(and(eq(orders.providerId, userId), eq(orders.status, "completed"), gte(orders.completedAt, new Date(Date.now() - 180 * 864e5))))
      .groupBy(sql`1`),
    db.select({ v: sql<number>`coalesce(sum(${payouts.amountKurus}),0)::int` }).from(payouts).where(and(eq(payouts.providerId, userId), inArray(payouts.status, ["held", "available"]))),
  ]);
  const conv = svcAgg!.views > 0 ? (agg!.paidOrders / svcAgg!.views) * 100 : null;
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label: d.toLocaleDateString("tr-TR", { month: "short" }), value: monthly.find((m) => m.m === key)?.v ?? 0 };
  });
  const checklist = [
    { done: !!profile?.headline && (profile?.bio.length ?? 0) > 80, label: "Profil unvanı ve tanıtım yazısı", href: "/panel/profil" },
    { done: (profile?.skills.length ?? 0) >= 3, label: "En az 3 yetenek", href: "/panel/profil" },
    { done: svcAgg!.count > 0, label: "İlk hizmetini oluştur", href: "/panel/hizmetler/yeni" },
    { done: !!profile?.iban, label: "Ödeme almak için IBAN ekle", href: "/panel/profil#odeme" },
  ];
  const todo = checklist.filter((c) => !c.done);
  return (
    <>
      <PageHead title={welcome ? `Hoş geldin, ${name}` : `Merhaba, ${name}`} sub="Satışlarının ve siparişlerinin özeti" action={<ButtonLink href="/panel/hizmetler/yeni" size="sm">Yeni hizmet</ButtonLink>} />
      {todo.length > 0 && (
        <section className="mb-8 rounded-lg border border-line bg-surface p-5">
          <p className="font-semibold">Profilini tamamla — {checklist.length - todo.length}/{checklist.length}</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-paper-2"><div className="h-full bg-accent" style={{ width: `${((checklist.length - todo.length) / checklist.length) * 100}%` }} /></div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.label}><Link href={c.href} className={`flex items-center gap-2 text-[14px] ${c.done ? "text-muted line-through" : "text-ink hover:underline"}`}><span className={`h-3.5 w-3.5 border ${c.done ? "border-trust bg-trust" : "border-ink"}`} />{c.label}</Link></li>
            ))}
          </ul>
        </section>
      )}
      <section className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-line py-6 md:grid-cols-4">
        <Stat label="Toplam satış" value={formatTRY(agg!.totalSales)} sub="Tamamlanan siparişler" />
        <Stat label="Bu ayki kazanç" value={formatTRY(agg!.monthEarning)} sub="Komisyon sonrası" />
        <Stat label="Bekleyen sipariş" value={formatNumber(agg!.pending)} />
        <Stat label="Tamamlanan iş" value={formatNumber(agg!.completed)} />
        <Stat label="Profil görüntüleme" value={formatNumber(profile?.profileViews ?? 0)} />
        <Stat label="Hizmet görüntüleme" value={formatNumber(svcAgg!.views)} />
        <Stat label="Dönüşüm oranı" value={conv != null ? `%${conv.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}` : "—"} sub="Sipariş / görüntüleme" />
        <Stat label="Ortalama puan" value={profile?.ratingCount ? formatRating(profile.ratingAvg) : "—"} sub={profile?.ratingCount ? `${profile.ratingCount} değerlendirme` : "Henüz yok"} />
      </section>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="mb-3 flex items-baseline justify-between"><h2 className="text-[18px] font-semibold">Devam eden siparişler</h2><Link href="/panel/siparisler" className="text-[13.5px] text-muted hover:text-ink">Tümü →</Link></div>
          {active.length ? <OrderTable rows={active} perspective="provider" /> : <EmptyState title="Devam eden sipariş yok" body="Yeni siparişler geldiğinde burada görünecek. Bu arada açık projelere teklif verebilirsin." action={<ButtonLink href="/projeler" size="sm" variant="outline">Açık projeler</ButtonLink>} />}
        </section>
        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-semibold">Son 6 ay kazanç</h2>
            <Link href="/panel/kazanc" className="text-[13px] text-muted hover:text-ink">Ayrıntı →</Link>
          </div>
          <EarningsChart data={months} />
          <p className="mt-4 border-t border-line-2 pt-3 text-[13.5px] text-muted">Hakediş bekleyen: <span className="num text-ink">{formatTRY(pending!.v)}</span></p>
        </section>
      </div>
    </>
  );
}

async function CustomerHome({ userId, name, welcome }: { userId: string; name: string; welcome: boolean }) {
  const [active, myProjects, awaiting] = await Promise.all([
    listOrdersFor(userId, "buyer", [...ACTIVE_STATUSES, "refund_in_progress", "disputed"], 6),
    db.select().from(projects).where(eq(projects.buyerId, userId)).orderBy(desc(projects.createdAt)).limit(4),
    db.select({ code: orders.code, title: orders.title }).from(orders).where(and(eq(orders.buyerId, userId), eq(orders.status, "delivered"))),
  ]);
  return (
    <>
      <PageHead title={welcome ? `Hoş geldin, ${name}` : `Merhaba, ${name}`} sub="Siparişlerin ve projelerin" action={<ButtonLink href="/proje-olustur" size="sm" variant="accent">Proje oluştur</ButtonLink>} />
      {awaiting.length > 0 && (
        <div className="mb-8 rounded-lg border border-warn/25 bg-warn-soft p-4 text-[14.5px]">
          <p className="font-medium text-warn">İncelemeni bekleyen {awaiting.length} teslimat var</p>
          <ul className="mt-2 space-y-1">{awaiting.map((a) => <li key={a.code}><Link href={`/panel/siparisler/${a.code}`} className="underline underline-offset-2">{a.title}</Link></li>)}</ul>
        </div>
      )}
      <section>
        <div className="mb-3 flex items-baseline justify-between"><h2 className="text-[18px] font-semibold">Devam eden siparişler</h2><Link href="/panel/siparisler" className="text-[13.5px] text-muted hover:text-ink">Tümü →</Link></div>
        {active.length ? <OrderTable rows={active} perspective="buyer" /> : <EmptyState title="Henüz siparişin yok" body="Hazır paketlerden birini seçebilir ya da projeni anlatıp teklif toplayabilirsin." action={<div className="flex gap-2"><ButtonLink href="/kategoriler" size="sm">Hizmetlere göz at</ButtonLink><ButtonLink href="/proje-olustur" size="sm" variant="outline">Proje oluştur</ButtonLink></div>} />}
      </section>
      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between"><h2 className="text-[18px] font-semibold">Projelerin</h2><Link href="/panel/projeler" className="text-[13.5px] text-muted hover:text-ink">Tümü →</Link></div>
        {myProjects.length ? (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {myProjects.map((p) => (
              <li key={p.id}><Link href={`/panel/projeler/${p.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-paper/60"><span className="font-medium">{p.title}</span><span className="shrink-0 text-[13px] text-muted">{p.offerCount} teklif · {p.status === "open" ? "Açık" : "Kapalı"}</span></Link></li>
            ))}
          </ul>
        ) : <p className="text-[14px] text-muted">Henüz proje oluşturmadın.</p>}
      </section>
    </>
  );
}
