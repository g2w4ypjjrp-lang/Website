import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, categories } from "@/db/schema";
import { savePostAction, deletePostAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { renderMarkdown } from "@/lib/markdown";
import { AdminForm, F } from "@/components/admin/admin-form";

export const metadata = { title: "Yazı düzenle" };

const local = (d: Date | null | undefined) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "yeni";
  const p = isNew ? null : await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
  if (!isNew && !p) notFound();
  const roots = await db.select({ id: categories.id, name: categories.name }).from(categories).where(isNull(categories.parentId)).orderBy(asc(categories.sortOrder));
  return (
    <>
      <AHead title={p?.title ?? "Yeni yazı"} sub={p?.status === "published" ? <Link href={`/blog/${p.slug}`} target="_blank" className="underline">Yayındaki sayfa ↗</Link> : "Markdown ile yazın; ## başlıklar içindekiler tablosunu oluşturur."} action={p && <form action={deletePostAction}><input type="hidden" name="id" value={p.id} /><button className="text-[13px] text-bad underline">Sil</button></form>} />
      {p && (
        <details className="mb-6 rounded-lg border border-line bg-surface p-4">
          <summary className="cursor-pointer text-[13.5px] font-medium">Kaydedilmiş hâlin önizlemesi</summary>
          <h2 className="mt-4 text-[28px] font-semibold">{p.title}</h2>
          <div className="prose-ek mt-4 max-w-[68ch]" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
        </details>
      )}
      <AdminForm action={savePostAction} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="space-y-4">
          <F label="Başlık"><input name="title" defaultValue={p?.title} className="field !py-2 text-[16px]" /></F>
          <F label="Özet" hint="Liste sayfalarında ve varsayılan meta açıklamada kullanılır."><textarea name="excerpt" defaultValue={p?.excerpt} rows={2} className="field !min-h-[70px]" /></F>
          <F label="İçerik (markdown)" hint="İç bağlantı için: [web sitesi yaptırma](/web-sitesi-yaptirma)"><textarea name="content" defaultValue={p?.content} rows={26} className="field font-mono text-[13px] leading-relaxed" /></F>
        </div>
        <aside className="space-y-4">
          <F label="Durum"><select name="status" defaultValue={p?.status ?? "draft"} className="field !py-2"><option value="draft">Taslak</option><option value="scheduled">Planlanmış</option><option value="published">Yayında</option></select></F>
          <F label="Yayın tarihi" hint="Planlanmış yazılar bu saatte otomatik yayına girer."><input type="datetime-local" name="publishedAt" defaultValue={local(p?.publishedAt)} className="field !py-2" /></F>
          <F label="URL"><input name="slug" defaultValue={p?.slug} className="field !py-2 font-mono text-[12.5px]" /></F>
          <F label="Kategori"><input name="category" defaultValue={p?.category ?? "Rehber"} className="field !py-2" /></F>
          <F label="Etiketler" hint="Virgülle"><input name="tags" defaultValue={p?.tags.join(", ")} className="field !py-2" /></F>
          <F label="İlgili hizmet kategorisi" hint="Yazının altında bu kategoriden hizmetler gösterilir."><select name="relatedCategoryId" defaultValue={p?.relatedCategoryId ?? ""} className="field !py-2"><option value="">—</option>{roots.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></F>
          <F label="Yazar"><input name="authorName" defaultValue={p?.authorName ?? "Eksen Editör Ekibi"} className="field !py-2" /></F>
          <F label="Kapak görseli"><input type="file" name="cover" accept="image/*" className="block text-[12.5px]" /></F>
          <F label="SEO başlığı"><input name="seoTitle" defaultValue={p?.seoTitle ?? ""} maxLength={70} className="field !py-2" /></F>
          <F label="Meta açıklama"><textarea name="seoDescription" defaultValue={p?.seoDescription ?? ""} maxLength={160} rows={3} className="field !min-h-[70px]" /></F>
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="noindex" defaultChecked={p?.noindex} /> noindex</label>
        </aside>
      </AdminForm>
    </>
  );
}
