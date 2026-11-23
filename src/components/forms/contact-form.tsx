"use client";
import Link from "next/link";
import { useActionState } from "react";
import { submitContactAction } from "@/app/actions/leads";
import type { FormState } from "@/app/actions/auth";
import { CONTACT_TOPICS } from "@/lib/leads";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";

export function ContactForm() {
  const [s, action] = useActionState<FormState, FormData>(submitContactAction, undefined);
  const fe = s?.fieldErrors ?? {};
  if (s?.ok) {
    return (
      <div className="card p-7" role="status">
        <p className="eyebrow">Mesaj alındı</p>
        <p className="mt-3 text-[20px] font-semibold leading-snug">Teşekkürler, mesajınız destek ekibine iletildi.</p>
        <p className="mt-3 text-[14.5px] text-ink-2">Onay e-postası gönderdik. Sipariş ile ilgili konularda sipariş sayfasındaki mesajlaşma en hızlı yoldur.</p>
        <Link href="/yardim" className="mt-6 inline-block text-[14.5px] font-medium underline underline-offset-4">Yardım merkezine göz at</Link>
      </div>
    );
  }
  return (
    <form action={action} className="card space-y-5 p-6 sm:p-7" noValidate>
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad soyad" htmlFor="name" error={fe.name}><input id="name" name="name" required autoComplete="name" className="field" /></Field>
        <Field label="E-posta" htmlFor="email" error={fe.email}><input id="email" name="email" type="email" required autoComplete="email" className="field" /></Field>
      </div>
      <Field label="Konu" htmlFor="topic" error={fe.topic}>
        <select id="topic" name="topic" defaultValue="" required className="field">
          <option value="" disabled>Seçin</option>
          {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Mesajınız" htmlFor="message" error={fe.message} hint="Sipariş ile ilgiliyse sipariş numarasını (EK-…) ekleyin.">
        <textarea id="message" name="message" rows={6} required maxLength={4000} className="field" />
      </Field>
      <label className="flex items-start gap-2.5 text-[13px] text-ink-2">
        <input type="checkbox" name="kvkk" className="mt-0.5 size-4 accent-[var(--color-ink)]" />
        <span><Link href="/sayfa/kvkk-aydinlatma-metni" className="underline underline-offset-2" target="_blank">KVKK aydınlatma metnini</Link> okudum; mesajım hakkında benimle iletişime geçilmesini kabul ediyorum.</span>
      </label>
      {fe.kvkk && <p className="-mt-3 text-[13px] text-bad">{fe.kvkk[0]}</p>}
      <SubmitButton size="lg" className="w-full" pendingText="Gönderiliyor">Mesajı gönder</SubmitButton>
    </form>
  );
}
