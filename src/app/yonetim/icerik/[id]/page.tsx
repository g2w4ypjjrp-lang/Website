import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staticPages } from "@/db/schema";
import { savePageAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";

export const metadata = { title: "Sayfa düzenle" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "yeni";
  const p = isNew ? null : await db.query.staticPages.findFirst({ where: eq(staticPages.id, id) });
  if (!isNew && !p) notFound();
  return (
    <>
      <AHead title={p?.title ?? "Yeni sayfa"} />
      <AdminForm action={savePageAction} className="max-w-3xl space-y-4">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Başlık"><input name="title" defaultValue={p?.title} className="field !py-2" /></F>
          <F label="Adres" hint="/sayfa/…"><input name="slug" defaultValue={p?.slug} className="field !py-2 font-mono text-[13px]" /></F>
        </div>
        <F label="Meta açıklama"><input name="seoDescription" defaultValue={p?.seoDescription ?? ""} maxLength={160} className="field !py-2" /></F>
        <F label="İçerik (markdown)"><textarea name="content" defaultValue={p?.content} rows={22} className="field font-mono text-[13px]" /></F>
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="noindex" defaultChecked={p?.noindex} /> noindex</label>
      </AdminForm>
    </>
  );
}
