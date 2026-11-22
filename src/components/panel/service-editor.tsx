"use client";
import { useActionState, useState } from "react";
import { saveServiceAction } from "@/app/actions/panel";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";
import { cn, fileUrl } from "@/lib/utils";

type Pkg = { name: string; priceKurus: number; deliveryDays: number; revisions: number; features: string[] };
export type ServiceDraft = {
  id?: string;
  title: string;
  categoryId: string;
  summary: string;
  description: string;
  tags: string[];
  requirements: string;
  faqs: { q: string; a: string }[];
  extras: { title: string; priceKurus: number; days: number }[];
  coverId: string | null;
  gallery: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  status?: string;
  packages: Partial<Record<"basic" | "standard" | "premium", Pkg>>;
};
type Cat = { id: string; name: string; children: { id: string; name: string }[] };
const TIERS = [["basic", "Temel"], ["standard", "Standart"], ["premium", "Profesyonel"]] as const;

export function ServiceEditor({ initial, categories, commissionPct }: { initial: ServiceDraft; categories: Cat[]; commissionPct: number }) {
  const [state, act] = useActionState<FormState, FormData>(saveServiceAction, undefined);
  const [enabled, setEnabled] = useState({ standard: !!initial.packages.standard, premium: !!initial.packages.premium });
  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [seoT, setSeoT] = useState(initial.seoTitle ?? "");
  const [seoD, setSeoD] = useState(initial.seoDescription ?? "");
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={act} className="space-y-10">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      {state?.ok && <Notice tone="ok">{state.ok}</Notice>}

      <Section n="1" title="Temel bilgiler">
        <Field label="Hizmet başlığı" htmlFor="title" error={fe.title} hint={`${title.length}/90 · Müşterinin arayacağı kelimelerle yaz: “Restoranınız için QR menü kurarım”`}>
          <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} className="field" />
        </Field>
        <Field label="Kategori" htmlFor="categoryId" error={fe.categoryId}>
          <select id="categoryId" name="categoryId" defaultValue={initial.categoryId} className="field">
            <option value="">Seçin</option>
            {categories.map((c) => <optgroup key={c.id} label={c.name}>{c.children.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>)}
          </select>
        </Field>
        <Field label="Kısa açıklama" htmlFor="summary" error={fe.summary} hint={`${summary.length}/200 · Kartlarda ve arama sonuçlarında görünür.`}>
          <input id="summary" name="summary" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={200} className="field" />
        </Field>
        <Field label="Ayrıntılı açıklama" htmlFor="description" error={fe.description} hint="Markdown desteklenir: ## başlık, - liste, **kalın**. Süreci, kapsamı ve kapsam dışını yaz.">
          <textarea id="description" name="description" defaultValue={initial.description} rows={12} className="field font-[450]" />
        </Field>
        <Field label="Etiketler" htmlFor="tags" optional hint="Virgülle ayır, en fazla 8.">
          <input id="tags" name="tags" defaultValue={initial.tags.join(", ")} className="field" />
        </Field>
      </Section>

      <Section n="2" title="Paketler" sub={`Temel paket zorunlu. Platform hizmet bedeli %${commissionPct}; net kazancın her pakette gösterilir.`}>
        <div className="grid gap-4 xl:grid-cols-3">
          {TIERS.map(([t, label]) => {
            const p = initial.packages[t];
            const on = t === "basic" || enabled[t as "standard" | "premium"];
            return (
              <fieldset key={t} className={cn("rounded-lg border p-4 transition-opacity", on ? "border-line bg-surface" : "border-dashed border-line bg-transparent")}>
                <legend className="px-1 text-[14px] font-semibold">{label}</legend>
                {t !== "basic" && (
                  <label className="mb-3 flex items-center gap-2 text-[13.5px]">
                    <input type="checkbox" name={`${t}.enabled`} checked={on} onChange={(e) => setEnabled((s) => ({ ...s, [t]: e.target.checked }))} className="h-4 w-4 accent-[var(--color-ink)]" /> Bu paketi sun
                  </label>
                )}
                <div className={cn("space-y-3", !on && "pointer-events-none opacity-40")}>
                  <input name={`${t}.name`} placeholder="Paket adı (ör. Başlangıç)" defaultValue={p?.name} className="field !py-2 text-[14px]" />
                  <PriceInput name={`${t}.price`} initial={p ? p.priceKurus / 100 : undefined} pct={commissionPct} />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[12.5px] text-muted">Teslim (gün)<input name={`${t}.days`} inputMode="numeric" defaultValue={p?.deliveryDays} className="field mt-1 !py-2 text-[14px]" /></label>
                    <label className="text-[12.5px] text-muted">Revizyon<input name={`${t}.revisions`} inputMode="numeric" defaultValue={p?.revisions ?? 1} className="field mt-1 !py-2 text-[14px]" /></label>
                  </div>
                  <label className="block text-[12.5px] text-muted">Pakete dahil olanlar (her satıra bir madde)<textarea name={`${t}.features`} rows={4} defaultValue={p?.features.join("\n")} className="field mt-1 !min-h-[96px] text-[14px]" /></label>
                </div>
              </fieldset>
            );
          })}
        </div>
      </Section>

      <Section n="3" title="Görseller">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Kapak görseli" htmlFor="cover" optional hint="16:10 oran önerilir; WebP’ye dönüştürülür ve konum verileri silinir. Yüklenmezse kategoriye özel çizim kullanılır.">
            {initial.coverId && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(initial.coverId)!} alt="" className="mb-2 aspect-[10/7] w-48 rounded-md border border-line object-cover" />
            )}
            <input id="cover" name="cover" type="file" accept="image/*" className="block text-[13.5px]" />
          </Field>
          <Field label="Galeri" htmlFor="gallery" optional hint="En fazla 8 görsel.">
            {initial.gallery.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {initial.gallery.map((g) => (
                  <label key={g} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fileUrl(g)!} alt="" className="h-16 w-20 rounded border border-line object-cover" />
                    <span className="mt-1 flex items-center gap-1 text-[11.5px]"><input type="checkbox" name="removeGallery" value={g} /> Kaldır</span>
                  </label>
                ))}
              </div>
            )}
            <input id="gallery" name="gallery" type="file" accept="image/*" multiple className="block text-[13.5px]" />
          </Field>
        </div>
      </Section>

      <Section n="4" title="Ek hizmetler, SSS ve gereksinimler">
        <Field label="Ek hizmetler" htmlFor="extras" optional hint="Her satır: Başlık | Fiyat (₺) | Ek gün (süreyi kısaltıyorsa eksi). Örn: Kaynak dosya | 500 | 0">
          <textarea id="extras" name="extras" rows={3} defaultValue={initial.extras.map((e) => `${e.title} | ${e.priceKurus / 100} | ${e.days}`).join("\n")} className="field !min-h-[80px] font-mono text-[13px]" />
        </Field>
        <Field label="Sık sorulan sorular" htmlFor="faqs" optional hint="Her satır: Soru | Cevap">
          <textarea id="faqs" name="faqs" rows={4} defaultValue={initial.faqs.map((f) => `${f.q} | ${f.a}`).join("\n")} className="field text-[14px]" />
        </Field>
        <Field label="Müşteriden beklenenler" htmlFor="requirements" optional hint="Sipariş sonrası müşteriye gösterilir.">
          <textarea id="requirements" name="requirements" rows={3} defaultValue={initial.requirements} className="field !min-h-[80px]" />
        </Field>
      </Section>

      <Section n="5" title="Arama motoru görünümü" sub="Boş bırakırsan başlık ve kısa açıklama kullanılır.">
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="text-[12.5px] text-trust">eksen.com.tr › hizmet › …</p>
          <p className="mt-0.5 truncate text-[18px] text-info">{(seoT || title || "Hizmet başlığı") + " | Eksen"}</p>
          <p className="mt-0.5 line-clamp-2 text-[13.5px] text-ink-2">{seoD || summary || "Kısa açıklama burada görünür."}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO başlığı" htmlFor="seoTitle" optional hint={`${seoT.length}/70`}><input id="seoTitle" name="seoTitle" value={seoT} onChange={(e) => setSeoT(e.target.value)} maxLength={70} className="field" /></Field>
          <Field label="Meta açıklama" htmlFor="seoDescription" optional hint={`${seoD.length}/160`}><input id="seoDescription" name="seoDescription" value={seoD} onChange={(e) => setSeoD(e.target.value)} maxLength={160} className="field" /></Field>
        </div>
      </Section>

      <div className="sticky bottom-[58px] z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:bottom-0">
        {initial.status && <span className="mr-auto text-[13px] text-muted">Durum: {initial.status}</span>}
        <SubmitButton name="intent" value="draft" variant="outline" pendingText="Kaydediliyor">Kaydet</SubmitButton>
        <SubmitButton name="intent" value="submit" pendingText="Gönderiliyor">{initial.status === "active" ? "Değişiklikleri onaya gönder" : "Onaya gönder"}</SubmitButton>
      </div>
    </form>
  );
}

function Section({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <div>
        <p className="num text-[12px] text-accent">{n.padStart(2, "0")}</p>
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-muted">{sub}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function PriceInput({ name, initial, pct }: { name: string; initial?: number; pct: number }) {
  const [v, setV] = useState(initial ?? 0);
  return (
    <label className="block text-[12.5px] text-muted">
      Fiyat (₺, KDV dahil)
      <input name={name} inputMode="numeric" defaultValue={initial} onChange={(e) => setV(Number(e.target.value) || 0)} className="field mt-1 !py-2 text-[14px]" />
      {v > 0 && <span className="mt-1 block">Net kazanç: <span className="num text-ink">{Math.round(v * (1 - pct / 100)).toLocaleString("tr-TR")} ₺</span></span>}
    </label>
  );
}
