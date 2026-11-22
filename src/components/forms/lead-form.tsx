"use client";
import Link from "next/link";
import { useActionState } from "react";
import { submitLeadAction } from "@/app/actions/leads";
import { BUDGETS, LEAD_NEEDS, TEAM_SIZES } from "@/lib/leads";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";
import { CitySelect } from "@/components/city-select";

export function LeadForm({ defaults }: { defaults?: { name?: string; email?: string; company?: string; city?: string | null } }) {
  const [s, action] = useActionState<FormState, FormData>(submitLeadAction, undefined);
  const fe = s?.fieldErrors ?? {};
  if (s?.ok) {
    return (
      <div className="rounded-lg border border-line bg-surface p-7" role="status">
        <p className="eyebrow">Başvuru alındı</p>
        <p className="mt-3 text-[20px] font-semibold leading-snug">Teşekkürler. Hesap yöneticiniz sizinle iletişime geçecek.</p>
        <p className="mt-3 text-[14.5px] text-ink-2">Onay e-postası gönderdik. Beklerken açık uzmanlara göz atabilir ya da ilk işinizi proje olarak yayınlayabilirsiniz.</p>
        <div className="mt-6 flex flex-wrap gap-3 text-[14.5px]">
          <Link href="/uzmanlar" className="font-medium underline underline-offset-4">Uzmanlara göz at</Link>
          <Link href="/proje-olustur" className="font-medium underline underline-offset-4">Proje yayınla</Link>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5 rounded-lg border border-line bg-surface p-6 sm:p-7" noValidate>
      <div>
        <h2 className="text-[20px] font-semibold">Başvuru formu</h2>
        <p className="mt-1 text-[13.5px] text-muted">İki dakika sürer. Bilgileriniz yalnızca size dönüş yapmak için kullanılır.</p>
      </div>
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Şirket adı" htmlFor="company" error={fe.company}>
          <input id="company" name="company" required autoComplete="organization" defaultValue={defaults?.company} className="field" />
        </Field>
        <Field label="Ad soyad" htmlFor="contactName" error={fe.contactName}>
          <input id="contactName" name="contactName" required autoComplete="name" defaultValue={defaults?.name} className="field" />
        </Field>
        <Field label="İş e-postası" htmlFor="email" error={fe.email}>
          <input id="email" name="email" type="email" required autoComplete="email" defaultValue={defaults?.email} className="field" />
        </Field>
        <Field label="Telefon" htmlFor="phone" optional error={fe.phone}>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" className="field" />
        </Field>
        <Field label="İl" htmlFor="city" optional>
          <CitySelect name="city" defaultValue={defaults?.city} />
        </Field>
        <Field label="Çalışan sayısı" htmlFor="teamSize" optional error={fe.teamSize}>
          <select id="teamSize" name="teamSize" defaultValue="" className="field">
            <option value="">Seçin</option>
            {TEAM_SIZES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-[13.5px] font-medium text-ink">İhtiyaçlarınız</legend>
        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {LEAD_NEEDS.map((n) => (
            <label key={n} className="flex items-center gap-2.5 text-[14px]">
              <input type="checkbox" name="needs" value={n} className="size-4 accent-[var(--color-ink)]" /> {n}
            </label>
          ))}
        </div>
        {fe.needs && <p className="mt-2 text-[13px] text-bad">{fe.needs[0]}</p>}
      </fieldset>
      <Field label="Tahmini dijital bütçe" htmlFor="monthlyBudget" optional error={fe.monthlyBudget}>
        <select id="monthlyBudget" name="monthlyBudget" defaultValue="" className="field">
          <option value="">Seçin</option>
          {BUDGETS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Kısaca anlatın" htmlFor="details" optional hint="Örnek: 12 şubemiz için ortak web sitesi, şube sayfaları ve yerel reklam yönetimi." error={fe.details}>
        <textarea id="details" name="details" rows={4} maxLength={3000} className="field" />
      </Field>
      <label className="flex items-start gap-2.5 text-[13px] text-ink-2">
        <input type="checkbox" name="kvkk" className="mt-0.5 size-4 accent-[var(--color-ink)]" />
        <span>
          <Link href="/sayfa/kvkk-aydinlatma-metni" className="underline underline-offset-2" target="_blank">KVKK aydınlatma metnini</Link> okudum; başvurum hakkında benimle iletişime geçilmesini kabul ediyorum.
        </span>
      </label>
      {fe.kvkk && <p className="-mt-3 text-[13px] text-bad">{fe.kvkk[0]}</p>}
      <SubmitButton size="lg" className="w-full" pendingText="Gönderiliyor">Başvuruyu gönder</SubmitButton>
    </form>
  );
}
