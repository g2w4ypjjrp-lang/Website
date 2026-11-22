"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, registerAction, forgotPasswordAction, resetPasswordAction, type FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-posta" htmlFor="email" error={state?.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" aria-invalid={!!state?.fieldErrors?.email} />
      </Field>
      <Field label="Şifre" htmlFor="password" error={state?.fieldErrors?.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </Field>
      <div className="flex justify-end">
        <Link href="/sifremi-unuttum" className="text-[13.5px] text-muted hover:text-ink">Şifremi unuttum</Link>
      </div>
      <SubmitButton className="w-full" size="lg" pendingText="Giriş yapılıyor">Giriş yap</SubmitButton>
    </form>
  );
}

export function RegisterForm({ defaultRole = "customer", next }: { defaultRole?: "customer" | "provider"; next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(registerAction, undefined);
  const [role, setRole] = useState(defaultRole);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <fieldset>
        <legend className="mb-2 text-[13.5px] font-medium">Eksen’i nasıl kullanacaksınız?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["customer", "Hizmet almak", "Proje ver, uzman bul"],
              ["provider", "Hizmet vermek", "Uzman veya ajans olarak satış yap"],
            ] as const
          ).map(([v, t, d]) => (
            <label key={v} className={cn("cursor-pointer rounded-md border p-3 transition-colors", role === v ? "border-ink bg-surface shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-line bg-surface/50 hover:border-ink/30")}>
              <input type="radio" name="role" value={v} checked={role === v} onChange={() => setRole(v)} className="sr-only" />
              <span className="block text-[14.5px] font-medium">{t}</span>
              <span className="mt-0.5 block text-[12.5px] text-muted">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={role === "provider" ? "Ad soyad veya ajans adı" : "Ad soyad"} htmlFor="name" error={fe.name}>
        <input id="name" name="name" autoComplete="name" required className="field" />
      </Field>
      <Field label="E-posta" htmlFor="email" error={fe.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </Field>
      <Field label="Şifre" htmlFor="password" error={fe.password} hint="En az 10 karakter; harf ve rakam içersin.">
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className="field" />
      </Field>
      {role === "provider" && (
        <Field label="Hesap türü" htmlFor="accountType">
          <select id="accountType" name="accountType" className="field" defaultValue="individual">
            <option value="individual">Bireysel (serbest çalışan)</option>
            <option value="agency">Dijital ajans</option>
            <option value="company">Şirket</option>
          </select>
        </Field>
      )}
      <label className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]" />
        <span>
          <Link href="/sayfa/kullanim-kosullari" className="underline underline-offset-2" target="_blank">Kullanım koşullarını</Link> okudum, kabul ediyorum.{" "}
          <Link href="/sayfa/kvkk-aydinlatma-metni" className="underline underline-offset-2" target="_blank">KVKK aydınlatma metnini</Link> inceledim.
        </span>
      </label>
      {fe.consent && <p className="-mt-2 text-[13px] text-bad">{fe.consent[0]}</p>}
      <SubmitButton className="w-full" size="lg" pendingText="Hesap oluşturuluyor">Hesap oluştur</SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, undefined);
  if (state?.ok) return <Notice tone="ok">{state.ok}</Notice>;
  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <Field label="E-posta" htmlFor="email" error={state?.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Gönderiliyor">Sıfırlama bağlantısı gönder</SubmitButton>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPasswordAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <input type="hidden" name="token" value={token} />
      <Field label="Yeni şifre" htmlFor="password" error={state?.fieldErrors?.password} hint="En az 10 karakter; harf ve rakam içersin.">
        <input id="password" name="password" type="password" autoComplete="new-password" required className="field" />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Kaydediliyor">Şifreyi güncelle</SubmitButton>
    </form>
  );
}
