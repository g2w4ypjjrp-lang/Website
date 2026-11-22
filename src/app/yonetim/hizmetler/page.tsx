import Link from "next/link";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, providerProfiles, services } from "@/db/schema";
import { adminServiceAction } from "@/app/actions/admin";
import { getCategoryTree } from "@/server/queries";
import { AHead, Tabs } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { formatTRY, timeAgo } from "@/lib/utils";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Hizmetler" };
const ST = { draft: "Taslak", pending: "Onay bekliyor", active: "Yayında", rejected: "Reddedildi", paused: "Duraklatıldı" } as const;

export default async function AdminServices({ searchParams }: { searchParams: Promise<{ durum?: string; q?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = (["pending", "active", "rejected", "paused", "draft"].includes(sp.durum ?? "") ? sp.durum : "pending") as keyof typeof ST;
  const where: (SQL | undefined)[] = [eq(services.status, status)];
  if (sp.q) where.push(sql`search_norm(${services.title}) ilike '%' || search_norm(${sp.q}) || '%'`);
  const [rows, counts, tree] = await Promise.all([
    db.select({ s: services, cat: categories.name, prov: providerProfiles.displayName, provSlug: providerProfiles.slug }).from(services).innerJoin(categories, eq(categories.id, services.categoryId)).innerJoin(providerProfiles, eq(providerProfiles.userId, services.providerId)).where(and(...where)).orderBy(desc(services.updatedAt)).limit(100),
    db.select({ s: services.status, n: sql<number>`count(*)::int` }).from(services).groupBy(services.status),
    getCategoryTree(),
  ]);
  const n = (s: string) => counts.find((c) => c.s === s)?.n ?? 0;
  return (
    <>
      <AHead title="Hizmetler" sub="Onay kuyruğu, öne çıkarma, sponsorlu listeleme ve hizmet bazlı SEO" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Tabs current={`/yonetim/hizmetler?durum=${status}`} items={(Object.keys(ST) as (keyof typeof ST)[]).map((k) => [`/yonetim/hizmetler?durum=${k}`, ST[k], n(k)])} />
        <form className="flex gap-2"><input type="hidden" name="durum" value={status} /><input name="q" defaultValue={sp.q} placeholder="Başlıkta ara" className="field !w-56 !py-1.5 text-[13.5px]" /><button className="rounded bg-ink px-3 text-[13px] text-white">Ara</button></form>
      </div>
      {rows.length === 0 && <p className="rounded-lg border border-dashed border-line p-8 text-center text-[14px] text-muted">Bu durumda hizmet yok.</p>}
      <div className="space-y-3">
        {rows.map(({ s, cat, prov, provSlug }) => (
          <details key={s.id} className="group rounded-lg border border-line bg-surface">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
              <span className="min-w-0 flex-1"><span className="block font-medium">{s.title}</span><span className="text-[12.5px] text-muted">{cat} · <Link href={`/uzman/${provSlug}`} className="underline">{prov}</Link> · {timeAgo(s.updatedAt)}</span></span>
              <span className="num text-[13.5px]">{formatTRY(s.startingPriceKurus)}’den</span>
              {s.featuredUntil && s.featuredUntil > new Date() && <Badge tone="accent">Öne çıkan</Badge>}
              {s.sponsored && <Badge tone="info">Sponsorlu</Badge>}
              {s.noindex && <Badge tone="warn">noindex</Badge>}
              <span className="text-[12px] text-muted group-open:hidden">Aç ▾</span>
            </summary>
            <div className="grid gap-6 border-t border-line-2 p-4 lg:grid-cols-[1fr_360px]">
              <div className="text-[14px]">
                <p className="text-ink-2">{s.summary}</p>
                <p className="mt-3 line-clamp-6 whitespace-pre-line text-[13px] text-muted">{s.description}</p>
                <Link href={`/hizmet/${s.slug}`} target="_blank" className="mt-3 inline-block text-[13px] underline">Önizle ↗</Link>
              </div>
              <div className="space-y-4 text-[13px]">
                {status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <form action={adminServiceAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="op" value="approve" /><button className="rounded bg-trust px-3 py-1.5 font-medium text-white">Onayla ve yayınla</button></form>
                    <form action={adminServiceAction} className="flex flex-1 gap-1"><input type="hidden" name="id" value={s.id} /><input type="hidden" name="op" value="reject" /><input name="reason" placeholder="Red nedeni (uzmana iletilir)" className="field !py-1 text-[12.5px]" /><button className="rounded border border-bad/40 px-2 text-bad">Reddet</button></form>
                  </div>
                )}
                {status === "active" && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <form action={adminServiceAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="op" value={s.featuredUntil && s.featuredUntil > new Date() ? "unfeature" : "feature"} /><input type="hidden" name="days" value="7" /><button className="underline">{s.featuredUntil && s.featuredUntil > new Date() ? "Öne çıkarmayı kaldır" : "7 gün öne çıkar"}</button></form>
                    <form action={adminServiceAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="op" value="sponsor" /><button className="underline">{s.sponsored ? "Sponsorluğu kaldır" : "Sponsorlu yap"}</button></form>
                    <form action={adminServiceAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="op" value="pause" /><button className="text-bad underline">Yayından kaldır</button></form>
                  </div>
                )}
                <form action={adminServiceAction} className="space-y-2 rounded-md bg-paper/60 p-3">
                  <input type="hidden" name="id" value={s.id} /><input type="hidden" name="op" value="seo" />
                  <p className="font-medium">SEO ve kategori</p>
                  <input name="slug" defaultValue={s.slug} className="field !py-1 font-mono text-[12px]" aria-label="URL" />
                  <input name="seoTitle" defaultValue={s.seoTitle ?? ""} placeholder="SEO başlığı" className="field !py-1 text-[12.5px]" />
                  <input name="seoDescription" defaultValue={s.seoDescription ?? ""} placeholder="Meta açıklama" className="field !py-1 text-[12.5px]" />
                  <select name="categoryId" defaultValue={s.categoryId} className="field !py-1 text-[12.5px]">{tree.map((c) => <optgroup key={c.id} label={c.name}>{c.children.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</optgroup>)}</select>
                  <label className="flex items-center gap-2"><input type="checkbox" name="noindex" defaultChecked={s.noindex} /> Arama motorlarında gösterme (noindex)</label>
                  <button className="rounded bg-ink px-3 py-1 text-white">Kaydet</button>
                  <p className="text-[11.5px] text-muted">URL değişirse eski adresten 301 yönlendirme otomatik eklenir.</p>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
