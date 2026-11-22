"use client";
import { useActionState } from "react";
import { createProjectAction } from "@/app/actions/market";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";

type Cat = { id: string; name: string; children: { id: string; name: string }[] };

export function ProjectForm({ categories, defaultCategoryId }: { categories: Cat[]; defaultCategoryId?: string }) {
  const [state, action] = useActionState<FormState, FormData>(createProjectAction, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <Field label="Proje başlığı" htmlFor="title" error={fe.title} hint="ör. “Diş kliniğimiz için randevu alınabilen web sitesi”">
        <input id="title" name="title" className="field" maxLength={140} required />
      </Field>
      <Field label="Kategori" htmlFor="categoryId" error={fe.categoryId}>
        <select id="categoryId" name="categoryId" className="field" defaultValue={defaultCategoryId ?? ""} required>
          <option value="" disabled>Seçin</option>
          {categories.map((c) => (
            <optgroup key={c.id} label={c.name}>
              <option value={c.id}>{c.name} (genel)</option>
              {c.children.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          ))}
        </select>
      </Field>
      <Field label="Açıklama" htmlFor="description" error={fe.description} hint="Kim için, ne amaçla, hangi özellikler şart? Beğendiğiniz örnek bağlantıları ekleyin.">
        <textarea id="description" name="description" rows={7} className="field" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bütçe alt sınırı (₺)" htmlFor="budgetMin" error={fe.budgetMin} optional>
          <input id="budgetMin" name="budgetMin" inputMode="numeric" className="field" />
        </Field>
        <Field label="Bütçe üst sınırı (₺)" htmlFor="budgetMax" error={fe.budgetMax}>
          <input id="budgetMax" name="budgetMax" inputMode="numeric" className="field" required />
        </Field>
      </div>
      <Field label="İstenen teslim tarihi" htmlFor="deadline" optional>
        <input id="deadline" name="deadline" type="date" className="field" min={new Date().toISOString().slice(0, 10)} />
      </Field>
      <Field label="Dosyalar" htmlFor="files" optional hint="En fazla 5 dosya; PDF, ZIP, Office veya görsel, her biri 25 MB’a kadar. Yalnızca uzmanlar görebilir.">
        <input id="files" name="files" type="file" multiple className="block w-full text-[14px] file:mr-3 file:rounded-md file:border file:border-line file:bg-paper file:px-3 file:py-1.5 file:text-[13.5px]" />
      </Field>
      <Field label="Ek bilgiler" htmlFor="extraInfo" optional>
        <textarea id="extraInfo" name="extraInfo" rows={3} className="field !min-h-[80px]" />
      </Field>
      <SubmitButton size="lg" variant="accent" className="w-full" pendingText="Yayınlanıyor">Projeyi yayınla</SubmitButton>
      <p className="text-[12.5px] text-muted">İletişim bilgilerinizi açıklamaya yazmayın; uzmanlarla platform içinden mesajlaşırsınız.</p>
    </form>
  );
}
