import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryTree, listProviders } from "@/server/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProviderRow } from "@/components/cards";
import { Pagination, hasFilters, one, type SP } from "@/components/listing";
import { EmptyState } from "@/components/ui/primitives";
import { AutoSubmit } from "@/components/auto-submit";
import { buildMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import { CitySelect } from "@/components/city-select";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  return buildMetadata({
    title: "Freelancer ve dijital ajanslar",
    description: "Web tasarım, yazılım, grafik tasarım ve dijital pazarlama alanlarında çalışan doğrulanmış freelancer ve ajansları inceleyin.",
    path: "/uzmanlar",
    noindex: hasFilters(sp),
  });
}

export default async function ProvidersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tree = await getCategoryTree();
  const cat = tree.find((c) => c.slug === one(sp.kategori));
  const type = one(sp.tur);
  const res = await listProviders({
    q: one(sp.q),
    categoryId: cat?.id,
    verifiedOnly: one(sp.dogrulanmis) === "1",
    accountType: type === "ajans" ? "agency" : type === "bireysel" ? "individual" : type === "sirket" ? "company" : undefined,
    city: one(sp.sehir),
    sort: one(sp.siralama),
    page: Number(one(sp.sayfa) ?? 1),
  });
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Uzmanlar", path: "/uzmanlar" }]} />
      <h1 className="mt-6 text-[34px] font-semibold sm:text-[44px]">Freelancer ve ajanslar</h1>
      <p className="mt-3 max-w-2xl text-[16.5px] text-ink-2">Profilleri, tamamlanan işleri ve gerçek müşteri değerlendirmelerini inceleyin; doğrudan mesaj gönderip özel teklif isteyin.</p>
      <form action="/uzmanlar" className="mt-8 flex flex-wrap items-end gap-3 border-y border-line py-4 text-[14px]">
        <AutoSubmit />
        <input name="q" defaultValue={one(sp.q)} placeholder="Yetenek veya isim" className="field !w-56 !py-2" />
        <select name="kategori" defaultValue={cat?.slug ?? ""} className="field !w-auto !py-2"><option value="">Tüm alanlar</option>{tree.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select name="tur" defaultValue={type ?? ""} className="field !w-auto !py-2"><option value="">Tüm hesaplar</option><option value="bireysel">Freelancer</option><option value="ajans">Ajans</option><option value="sirket">Şirket</option></select>
        <CitySelect name="sehir" defaultValue={one(sp.sehir)} placeholder="Tüm iller" className="field !w-40 !py-2" />
        <select name="siralama" defaultValue={one(sp.siralama) ?? ""} className="field !w-auto !py-2"><option value="">Önerilen</option><option value="rating">En yüksek puan</option><option value="newest">En yeni</option></select>
        <label className="flex items-center gap-2 py-2"><input type="checkbox" name="dogrulanmis" value="1" defaultChecked={one(sp.dogrulanmis) === "1"} className="h-4 w-4 accent-[var(--color-ink)]" /> Yalnızca doğrulanmış</label>
        <button className="h-9 rounded-md bg-ink px-4 text-white">Filtrele</button>
      </form>
      <p className="mt-6 text-[14px] text-muted">{formatNumber(res.total)} uzman</p>
      {res.items.length ? (
        <div className="divide-y divide-line border-b border-line">{res.items.map((p) => <ProviderRow key={p.slug} p={p} />)}</div>
      ) : (
        <EmptyState className="mt-6" title="Bu kriterlere uyan uzman bulunamadı" body={<>Filtreleri değiştirin ya da <Link href="/proje-olustur" className="underline">proje oluşturup</Link> teklif toplayın.</>} />
      )}
      <Pagination page={res.page} pages={res.pages} base="/uzmanlar" sp={sp} />
    </div>
  );
}
