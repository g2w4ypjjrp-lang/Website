import { notFound } from "next/navigation";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { saveCategoryAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Kategori düzenle" };

export default async function EditCategory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ust?: string }> }) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "yeni";
  const c = isNew ? null : await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!isNew && !c) notFound();
  const roots = await db.select({ id: categories.id, name: categories.name }).from(categories).where(isNull(categories.parentId));
  return (
    <>
      <AHead title={isNew ? "Yeni kategori" : c!.name} sub={c ? `/kategori/${c.slug}` : "Yeni kategoriler hemen menüde ve sitemap’te görünür."} />
      <AdminForm action={saveCategoryAction} className="max-w-3xl space-y-5">
        {c && <input type="hidden" name="id" value={c.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Ad"><input name="name" defaultValue={c?.name} className="field !py-2" /></F>
          <F label="URL" hint="Boş bırakılırsa addan üretilir. Değişirse 301 yönlendirme eklenir."><input name="slug" defaultValue={c?.slug} className="field !py-2 font-mono text-[13px]" /></F>
          <F label="Üst kategori"><select name="parentId" defaultValue={c?.parentId ?? sp.ust ?? ""} className="field !py-2"><option value="">— Ana kategori —</option>{roots.filter((r) => r.id !== c?.id).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></F>
          <F label="Kategori komisyonu (%)" hint="Boşsa üst kategori veya genel oran uygulanır."><input name="commissionPct" defaultValue={c?.commissionBps != null ? c.commissionBps / 100 : ""} className="field !py-2" /></F>
          <F label="Sıra"><input name="sortOrder" defaultValue={c?.sortOrder ?? 0} className="field !py-2" /></F>
          <div className="flex items-end gap-6 pb-2 text-[13.5px]"><label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={c?.isActive ?? true} /> Aktif</label><label className="flex items-center gap-2"><input type="checkbox" name="noindex" defaultChecked={c?.noindex} /> noindex</label></div>
        </div>
        <F label="Kısa açıklama"><input name="shortDescription" defaultValue={c?.shortDescription} className="field !py-2" /></F>
        <F label="SEO içerik metni (markdown)" hint="Kategori sayfasının altında “… hizmeti alırken” bölümünde gösterilir. Özgün ve kullanıcıya faydalı olmalı."><textarea name="intro" defaultValue={c?.intro} rows={8} className="field text-[14px]" /></F>
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="H1"><input name="h1" defaultValue={c?.h1 ?? ""} className="field !py-2" /></F>
          <F label="SEO başlığı"><input name="seoTitle" defaultValue={c?.seoTitle ?? ""} maxLength={70} className="field !py-2" /></F>
          <F label="Meta açıklama"><input name="seoDescription" defaultValue={c?.seoDescription ?? ""} maxLength={160} className="field !py-2" /></F>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Kategori görseli" hint="Kategori sayfasının başlığında ve paylaşım kartında kullanılır.">{c?.imageId && <img src={`/api/files/${c.imageId}`} alt="" className="mb-2 h-20 rounded border border-line object-cover" />}<input type="file" name="image" accept="image/*" className="block text-[12.5px]" /></F>
          <F label="Canonical URL" hint="Boşsa sayfanın kendi adresi. Yalnızca içerik başka bir sayfanın kopyasıysa doldurun."><input name="canonicalUrl" defaultValue={c?.canonicalUrl ?? ""} placeholder="/kategori/…" className="field !py-2 font-mono text-[12.5px]" /></F>
        </div>
        <F label="Özel filtreler" hint="Her satır: Filtre adı | seçenek1, seçenek2. Seçenekler hizmet etiketleriyle eşleşir. Ör: Altyapı | WordPress, Shopify, Next.js"><textarea name="filters" defaultValue={c?.filters.map((f) => `${f.label} | ${f.options.join(", ")}`).join("\n")} rows={3} className="field font-mono text-[13px]" /></F>
        <F label="SSS" hint="Her satır: Soru | Cevap. FAQ schema yalnızca bu içerik sayfada görünür olduğu için üretilir."><textarea name="faqs" defaultValue={c?.faqs.map((f) => `${f.q} | ${f.a}`).join("\n")} rows={5} className="field text-[13.5px]" /></F>
      </AdminForm>
    </>
  );
}
