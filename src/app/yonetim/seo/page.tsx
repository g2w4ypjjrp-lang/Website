import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, categories, landingPages, providerProfiles, redirects, services } from "@/db/schema";
import { redirectAction } from "@/app/actions/admin";
import { AHead, KPI, Table, Tabs } from "@/components/admin/ui";
import { Badge, Notice } from "@/components/ui/primitives";
import { site } from "@/lib/site";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "SEO" };

export default async function AdminSeo({ searchParams }: { searchParams: Promise<{ sekme?: string; kaydedildi?: string }> }) {
  await requireAdmin();
  const { sekme = "sayfalar", kaydedildi } = await searchParams;
  const [lands, reds, [idx], noindexList] = await Promise.all([
    db.select({ l: landingPages, cat: categories.name, words: sql<number>`array_length(regexp_split_to_array(trim(${landingPages.body}), '\\s+'), 1)` }).from(landingPages).leftJoin(categories, eq(categories.id, landingPages.categoryId)).orderBy(desc(landingPages.updatedAt)),
    db.select().from(redirects).orderBy(desc(redirects.createdAt)),
    db
      .select({
        services: sql<number>`(select count(*) from services where status = 'active' and not noindex)::int`,
        servicesNo: sql<number>`(select count(*) from services where status = 'active' and noindex)::int`,
        cats: sql<number>`(select count(*) from categories where is_active and not noindex)::int`,
        posts: sql<number>`(select count(*) from blog_posts where status = 'published' and not noindex)::int`,
        lands: sql<number>`(select count(*) from landing_pages where is_published and not noindex)::int`,
        providers: sql<number>`(select count(*) from provider_profiles pp where not pp.noindex and exists (select 1 from services s where s.provider_id = pp.user_id and s.status = 'active'))::int`,
        missingMeta: sql<number>`(select count(*) from services where status = 'active' and seo_description is null)::int`,
      })
      .from(sql`(select 1) x`),
    Promise.all([
      db.select({ t: services.title, href: sql<string>`'/hizmet/' || ${services.slug}` }).from(services).where(and(eq(services.noindex, true))),
      db.select({ t: categories.name, href: sql<string>`'/kategori/' || ${categories.slug}` }).from(categories).where(eq(categories.noindex, true)),
      db.select({ t: blogPosts.title, href: sql<string>`'/blog/' || ${blogPosts.slug}` }).from(blogPosts).where(eq(blogPosts.noindex, true)),
      db.select({ t: providerProfiles.displayName, href: sql<string>`'/uzman/' || ${providerProfiles.slug}` }).from(providerProfiles).where(eq(providerProfiles.noindex, true)),
    ]).then((a) => a.flat()),
  ]);
  const total = idx!.services + idx!.cats + idx!.posts + idx!.lands + idx!.providers + 7;
  return (
    <>
      {kaydedildi && <Notice tone="ok" className="mb-4">Sayfa kaydedildi.</Notice>}
      <AHead title="SEO yönetimi" sub="Programatik açılış sayfaları, yönlendirmeler, sitemap ve indeks durumu" action={<Link href="/yonetim/seo/yeni" className="rounded bg-ink px-3 py-1.5 text-[13px] text-white">Yeni açılış sayfası</Link>} />
      <section className="mb-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
        <KPI accent label="Sitemap’teki URL" value={total} sub={<a href="/sitemap.xml" target="_blank" className="underline">sitemap.xml ↗</a>} />
        <KPI label="İndekslenebilir hizmet" value={idx!.services} sub={`${idx!.servicesNo} hizmet noindex`} />
        <KPI label="Açılış sayfası / kategori" value={`${idx!.lands} / ${idx!.cats}`} sub={`${idx!.posts} blog · ${idx!.providers} uzman profili`} />
        <KPI label="Meta açıklaması eksik hizmet" value={idx!.missingMeta} sub="Otomatik açıklama kullanılıyor" />
      </section>
      <Tabs current={`/yonetim/seo?sekme=${sekme}`} items={[["/yonetim/seo?sekme=sayfalar", "Açılış sayfaları", lands.length], ["/yonetim/seo?sekme=yonlendirme", "301 yönlendirmeler", reds.length], ["/yonetim/seo?sekme=indeks", "İndeks ve sitemap"]]} />
      {sekme === "sayfalar" && (
        <Table head={["Sayfa", "Kategori", "İçerik", "Durum", ""]}>
          {lands.map(({ l, cat, words }) => (
            <tr key={l.id}>
              <td className="px-3 py-2.5"><Link href={`/yonetim/seo/${l.id}`} className="font-medium hover:underline">{l.h1}</Link><span className="block font-mono text-[12px] text-muted">/{l.slug}</span></td>
              <td className="px-3 py-2.5">{cat ?? "—"}</td>
              <td className="px-3 py-2.5"><span className={words < 250 ? "text-bad" : ""}>{words ?? 0} kelime</span> · {l.faqs.length} SSS</td>
              <td className="px-3 py-2.5 space-x-1">{l.isPublished ? <Badge tone="ok">Yayında</Badge> : <Badge>Taslak</Badge>}{l.noindex && <Badge tone="warn">noindex</Badge>}</td>
              <td className="px-3 py-2.5 text-right"><Link href={`/${l.slug}`} target="_blank" className="text-[12.5px] underline">Görüntüle ↗</Link></td>
            </tr>
          ))}
        </Table>
      )}
      {sekme === "yonlendirme" && (
        <>
          <form action={redirectAction} className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
            <input name="from" placeholder="/eski-adres" className="field !w-60 !py-1.5 font-mono text-[13px]" />
            <span>→</span>
            <input name="to" placeholder="/yeni-adres" className="field !w-60 !py-1.5 font-mono text-[13px]" />
            <label className="flex items-center gap-1.5"><input type="checkbox" name="temporary" /> Geçici (307)</label>
            <button className="rounded bg-ink px-3 py-1.5 text-white">Ekle</button>
          </form>
          <Table head={["Kaynak", "Hedef", "Tür", "Kullanım", ""]}>
            {reds.map((r) => (
              <tr key={r.id}><td className="px-3 py-2 font-mono text-[12.5px]">{r.fromPath}</td><td className="px-3 py-2 font-mono text-[12.5px]">{r.toPath}</td><td className="px-3 py-2">{r.permanent ? "301" : "307"}</td><td className="num px-3 py-2">{r.hits}</td><td className="px-3 py-2 text-right"><form action={redirectAction}><input type="hidden" name="op" value="delete" /><input type="hidden" name="id" value={r.id} /><button className="text-[12.5px] text-bad underline">Sil</button></form></td></tr>
            ))}
          </Table>
        </>
      )}
      {sekme === "indeks" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-line bg-surface p-5 text-[14px]">
            <h2 className="font-semibold">Arama motoru bağlantıları</h2>
            <ul className="mt-3 space-y-2 text-ink-2">
              <li>Sitemap index: <a href="/sitemap.xml" className="font-mono text-[12.5px] underline">{site.url}/sitemap.xml</a></li>
              <li>robots.txt: <a href="/robots.txt" className="font-mono text-[12.5px] underline">{site.url}/robots.txt</a></li>
              <li>Google Search Console doğrulaması: {process.env.GOOGLE_SITE_VERIFICATION ? <Badge tone="ok">Tanımlı</Badge> : <Badge tone="warn">GOOGLE_SITE_VERIFICATION eksik</Badge>}</li>
              <li>Bing Webmaster Tools doğrulaması: {process.env.BING_SITE_VERIFICATION ? <Badge tone="ok">Tanımlı</Badge> : <Badge tone="warn">BING_SITE_VERIFICATION eksik</Badge>}</li>
            </ul>
            <p className="mt-4 text-[13px] text-muted">Panel, yönetim, ödeme ve arama sayfaları noindex ve robots.txt ile kapalıdır. Filtre ve sıralama parametreli sayfalar noindex,follow döner; yalnızca ?sayfa= parametresi indekslenir.</p>
          </section>
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-[14px] font-semibold">Elle noindex yapılan sayfalar ({noindexList.length})</h2>
            {noindexList.length === 0 ? <p className="mt-2 text-[13px] text-muted">Yok.</p> : <ul className="mt-3 space-y-1.5 text-[13px]">{noindexList.map((x) => <li key={x.href} className="flex justify-between gap-3"><span className="truncate">{x.t}</span><span className="font-mono text-[12px] text-muted">{x.href}</span></li>)}</ul>}
          </section>
        </div>
      )}
    </>
  );
}
