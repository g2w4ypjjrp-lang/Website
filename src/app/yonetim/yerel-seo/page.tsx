import Link from "next/link";
import { saveLocalSeoAction } from "@/app/actions/admin";
import { getLocalSeoSettings } from "@/server/settings";
import { hubIndexable, providerCountsByCity, publishedLandings, serviceCityIndexable } from "@/server/local-seo";
import { AHead, KPI, Table } from "@/components/admin/ui";
import { AdminForm } from "@/components/admin/admin-form";
import { Badge } from "@/components/ui/primitives";
import { CITIES, REGIONS, type Region } from "@/lib/tr-cities";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Yerel SEO" };

export default async function LocalSeoAdmin() {
  await requireAdmin();
  const [s, landings, totals] = await Promise.all([getLocalSeoSettings(), publishedLandings(), providerCountsByCity(null)]);
  const perLanding = await Promise.all(landings.map((l) => providerCountsByCity(l.categoryId)));
  const rows = CITIES.map((c) => {
    const indexedPairs = perLanding.filter((m) => serviceCityIndexable(s, c.slug, m.get(c.slug) ?? 0)).length;
    return { c, providers: totals.get(c.slug) ?? 0, hub: hubIndexable(s, c.slug, totals.get(c.slug) ?? 0), indexedPairs };
  });
  const totalPairs = rows.reduce((a, r) => a + r.indexedPairs, 0);
  const regions = Object.keys(REGIONS) as Region[];
  return (
    <>
      <AHead title="Yerel SEO · 81 il" sub="İl merkez sayfaları (/il/…) ve hizmet × il sayfaları (/web-sitesi-yaptirma/istanbul gibi) için indeksleme kuralları" />
      <section className="mb-8 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
        <KPI accent label="İndekslenen il merkezi" value={rows.filter((r) => r.hub).length} sub="81 ilden" />
        <KPI accent label="İndekslenen hizmet × il" value={totalPairs} sub={`${landings.length * 81} olası sayfadan`} />
        <KPI label="Uzmanı olan il" value={rows.filter((r) => r.providers > 0).length} />
        <KPI label="Öncelikli il" value={s.priority.length} sub="Uzman sayısından bağımsız indekslenir" />
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AdminForm action={saveLocalSeoAction} className="space-y-6" submit="Kuralları kaydet">
          <section className="rounded-lg border border-line bg-surface p-5 text-[14px]">
            <h2 className="text-[16px] font-semibold">Kalite kapısı</h2>
            <p className="mt-1 text-[13px] text-muted">Google, birbirinin şehir adı değiştirilmiş kopyası olan sayfaları “kapı sayfası” sayıp tüm siteyi zayıf değerlendirebilir. Bu yüzden hizmet × il sayfaları yalnızca gerçek yerel veri olduğunda ya da öncelikli illerde indekslenir; diğerleri ziyaretçiye açık kalır ama “noindex, follow” döner. Bir ilde ilk uzman kaydolduğunda o ilin sayfası kendiliğinden indekse açılır.</p>
            <div className="mt-4 grid gap-3">
              <label className="flex items-center gap-2"><input type="checkbox" name="indexAllHubs" defaultChecked={s.indexAllHubs} /> 81 il merkez sayfasının tamamını indeksle (her birinde ile özgü profil ve bağlantılar var)</label>
              <label className="flex items-center gap-2">Hizmet × il sayfası için gereken en az yerel uzman: <input name="minProviders" defaultValue={s.minProviders} inputMode="numeric" className="field !w-16 !py-1" /></label>
              <label className="flex items-center gap-2 text-bad"><input type="checkbox" name="indexAll" defaultChecked={s.indexAll} /> Kalite kapısını kapat, tüm hizmet × il sayfalarını indeksle (önerilmez)</label>
            </div>
          </section>
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-[16px] font-semibold">Öncelikli iller</h2>
            <p className="mt-1 text-[13px] text-muted">Arama hacmi yüksek iller. Varsayılan: 30 büyükşehir.</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((r) => (
                <fieldset key={r}>
                  <legend className="mb-1 text-[12.5px] font-semibold">{REGIONS[r]}</legend>
                  {CITIES.filter((c) => c.region === r).sort((a, b) => a.name.localeCompare(b.name, "tr")).map((c) => (
                    <label key={c.slug} className="flex items-center gap-2 py-0.5 text-[13.5px]">
                      <input type="checkbox" name="priority" value={c.slug} defaultChecked={s.priority.includes(c.slug)} /> {c.name}
                      {c.metro && <span className="text-[10.5px] text-faint">BŞ</span>}
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </section>
        </AdminForm>

        <aside>
          <Table head={["İl", "Uzman", "Merkez", { label: "Hizmet sayfası", right: true }]}>
            {rows.sort((a, b) => b.providers - a.providers || a.c.name.localeCompare(b.c.name, "tr")).map((r) => (
              <tr key={r.c.slug}>
                <td className="px-3 py-2"><Link href={`/il/${r.c.slug}`} target="_blank" className="hover:underline">{r.c.name}</Link></td>
                <td className="num px-3 py-2">{r.providers}</td>
                <td className="px-3 py-2">{r.hub ? <Badge tone="ok">index</Badge> : <Badge>noindex</Badge>}</td>
                <td className="num px-3 py-2 text-right">{r.indexedPairs}/{landings.length}</td>
              </tr>
            ))}
          </Table>
        </aside>
      </div>
    </>
  );
}
