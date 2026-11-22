import Link from "next/link";
import type { Metadata } from "next";
import { providerCountsByCity } from "@/server/local-seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { CITIES, REGIONS, type Region } from "@/lib/tr-cities";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "İllere göre dijital hizmetler: 81 ilde web, yazılım, tasarım ve SEO uzmanları",
  description: "Türkiye’nin 81 ilinde web sitesi, e-ticaret, mobil uygulama, logo tasarımı, SEO ve sosyal medya hizmeti veren uzmanları ilinize göre bulun.",
  path: "/il",
});

export default async function CitiesIndex() {
  const counts = await providerCountsByCity(null);
  const regions = Object.keys(REGIONS) as Region[];
  return (
    <div className="container-x pt-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "İllere göre dijital hizmetler",
          itemListElement: CITIES.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: absoluteUrl(`/il/${c.slug}`) })),
        }}
      />
      <Breadcrumbs items={[{ name: "İller", path: "/il" }]} />
      <header className="mt-8 grid gap-6 border-b border-ink pb-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow mb-3">81 il</p>
          <h1 className="text-[36px] font-semibold leading-[1.05] sm:text-[52px]">İlinize göre dijital hizmet uzmanları</h1>
        </div>
        <p className="text-[16px] text-ink-2">
          Dijital işler uzaktan yürütülür, ama yüz yüze görüşmeyi seven ya da yerel pazarı bilen bir uzman arıyorsanız ilinizdeki uzmanlarla başlayın. Her il sayfasında o ilin ekonomisine göre hazırlanmış tavsiyeler de var.
        </p>
      </header>
      <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((r) => {
          const list = CITIES.filter((c) => c.region === r).sort((a, b) => a.name.localeCompare(b.name, "tr"));
          return (
            <section key={r}>
              <h2 className="flex items-baseline justify-between border-b border-line pb-2 text-[19px] font-semibold">
                {REGIONS[r]} <span className="num text-[12px] font-normal text-muted">{list.length} il</span>
              </h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14.5px]">
                {list.map((c) => {
                  const n = counts.get(c.slug) ?? 0;
                  return (
                    <li key={c.slug}>
                      <Link href={`/il/${c.slug}`} className="group flex items-baseline gap-2 text-ink-2 hover:text-ink">
                        <span className="num w-5 shrink-0 text-[11px] text-faint group-hover:text-accent">{c.plate}</span>
                        <span className="group-hover:underline group-hover:underline-offset-4">{c.name}</span>
                        {n > 0 && <span className="num text-[11px] text-trust" title={`${n} uzman`}>{n}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-10 text-[13px] text-muted">Yeşil sayılar, o ilde profilinde konumunu belirtmiş ve yayında hizmeti olan uzman sayısıdır.</p>
    </div>
  );
}
