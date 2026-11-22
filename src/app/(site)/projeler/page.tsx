import type { Metadata } from "next";
import { getCategoryTree, openProjects } from "@/server/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProjectList } from "@/components/project-list";
import { Pagination, hasFilters, one, type SP } from "@/components/listing";
import { EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { AutoSubmit } from "@/components/auto-submit";
import { buildMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  return buildMetadata({ title: "Açık proje ilanları", description: "İşletmelerin yayınladığı web, yazılım, tasarım ve pazarlama projelerine teklif verin.", path: "/projeler", noindex: hasFilters(await searchParams) });
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tree = await getCategoryTree();
  const cat = tree.find((c) => c.slug === one(sp.kategori));
  const res = await openProjects(20, { q: one(sp.q), categoryIds: cat ? [cat.id, ...cat.children.map((c) => c.id)] : undefined, minBudget: Number(one(sp.butce)) || undefined, page: Number(one(sp.sayfa) ?? 1) });
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Proje ilanları", path: "/projeler" }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-[34px] font-semibold sm:text-[44px]">Proje ilanları</h1>
          <p className="mt-3 max-w-2xl text-[16.5px] text-ink-2">Müşterilerin tarif ettiği işler. Uzman hesabıyla teklif verebilir, kabul edilirse ödemeyi güvenle alırsınız.</p>
        </div>
        <ButtonLink href="/proje-olustur" variant="accent">Proje oluştur</ButtonLink>
      </div>
      <form action="/projeler" className="mt-8 flex flex-wrap items-end gap-3 border-y border-line py-4 text-[14px]">
        <AutoSubmit />
        <input name="q" defaultValue={one(sp.q)} placeholder="Anahtar kelime" className="field !w-56 !py-2" />
        <select name="kategori" defaultValue={cat?.slug ?? ""} className="field !w-auto !py-2"><option value="">Tüm alanlar</option>{tree.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select name="butce" defaultValue={one(sp.butce) ?? ""} className="field !w-auto !py-2"><option value="">Her bütçe</option><option value="5000">5.000 ₺ ve üzeri</option><option value="20000">20.000 ₺ ve üzeri</option><option value="50000">50.000 ₺ ve üzeri</option></select>
        <button className="h-9 rounded-md bg-ink px-4 text-white">Filtrele</button>
      </form>
      <p className="mt-6 text-[14px] text-muted">{formatNumber(res.total)} açık proje</p>
      {res.items.length ? <ProjectList items={res.items} /> : <EmptyState className="mt-4" title="Şu an açık proje yok" body="Yeni projeler yayınlandığında burada listelenir." />}
      <Pagination page={res.page} pages={res.pages} base="/projeler" sp={sp} />
    </div>
  );
}
