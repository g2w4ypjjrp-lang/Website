import { notFound } from "next/navigation";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories, landingPages } from "@/db/schema";
import { saveLandingAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Açılış sayfası" };

export default async function EditLanding({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "yeni";
  const l = isNew ? null : await db.query.landingPages.findFirst({ where: eq(landingPages.id, id) });
  if (!isNew && !l) notFound();
  const roots = await db.select({ id: categories.id, name: categories.name }).from(categories).where(isNull(categories.parentId)).orderBy(asc(categories.sortOrder));
  return (
    <>
      <AHead title={l?.h1 ?? "Yeni açılış sayfası"} sub="Her sayfa özgün içerikle yayınlanır; ilgili hizmetler, uzmanlar, fiyat özeti ve SSS otomatik eklenir." />
      <AdminForm action={saveLandingAction} className="max-w-4xl space-y-5">
        {l && <input type="hidden" name="id" value={l.id} />}
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="URL" hint="ör. web-sitesi-yaptirma"><input name="slug" defaultValue={l?.slug} className="field !py-2 font-mono text-[13px]" /></F>
          <F label="H1"><input name="h1" defaultValue={l?.h1} className="field !py-2" /></F>
          <F label="Bağlı kategori" hint="Hizmet ve uzman listeleri bu kategoriden gelir."><select name="categoryId" defaultValue={l?.categoryId ?? ""} className="field !py-2"><option value="">—</option>{roots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></F>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="SEO başlığı (title)" hint="50–60 karakter idealdir; marka eki otomatik eklenir."><input name="seoTitle" defaultValue={l?.seoTitle} maxLength={70} className="field !py-2" /></F>
          <F label="Meta açıklama" hint="140–158 karakter."><input name="seoDescription" defaultValue={l?.seoDescription} maxLength={170} className="field !py-2" /></F>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Canonical URL" hint="Boşsa sayfanın kendi adresi."><input name="canonicalUrl" defaultValue={l?.canonicalUrl ?? ""} className="field !py-2 font-mono text-[12.5px]" /></F>
          <F label="Open Graph görseli" hint="1200×630 önerilir; yoksa varsayılan paylaşım görseli.">{l?.ogImageId && <img src={`/api/files/${l.ogImageId}`} alt="" className="mb-2 h-16 rounded border border-line object-cover" />}<input type="file" name="ogImage" accept="image/*" className="block text-[12.5px]" /></F>
        </div>
        <F label="Giriş paragrafı"><textarea name="intro" defaultValue={l?.intro} rows={2} className="field !min-h-[70px]" /></F>
        <F label="Gövde (markdown)" hint="## ile başlayan bölümler içindekiler tablosunda listelenir. Yayın için en az 250 kelime."><textarea name="body" defaultValue={l?.body} rows={18} className="field font-mono text-[13px]" /></F>
        <F label="SSS" hint="Her satır: Soru | Cevap"><textarea name="faqs" defaultValue={l?.faqs.map((f) => `${f.q} | ${f.a}`).join("\n")} rows={5} className="field text-[13.5px]" /></F>
        <div className="flex gap-6 text-[13.5px]"><label className="flex items-center gap-2"><input type="checkbox" name="isPublished" defaultChecked={l?.isPublished} /> Yayında</label><label className="flex items-center gap-2"><input type="checkbox" name="noindex" defaultChecked={l?.noindex} /> noindex</label></div>
      </AdminForm>
    </>
  );
}
