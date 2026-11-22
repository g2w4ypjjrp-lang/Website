"use client";
import { useActionState } from "react";
import { saveProfileAction, addPortfolioAction, saveAccountAction, deleteAccountAction } from "@/app/actions/panel";
import { changePasswordAction, type FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";
import { CitySelect } from "@/components/city-select";

type Profile = { displayName: string; headline: string; bio: string; city: string | null; website: string | null; skills: string[]; languages: string[]; iban: string | null };

export function ProfileForm({ p }: { p: Profile }) {
  const [s, act] = useActionState<FormState, FormData>(saveProfileAction, undefined);
  const fe = s?.fieldErrors ?? {};
  return (
    <form action={act} className="space-y-5">
      {s?.ok && <Notice tone="ok">{s.ok}</Notice>}
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Görünen ad" htmlFor="displayName" error={fe.displayName}><input id="displayName" name="displayName" defaultValue={p.displayName} className="field" /></Field>
        <Field label="Profil fotoğrafı / logo" htmlFor="avatar" optional><input id="avatar" name="avatar" type="file" accept="image/*" className="block pt-2 text-[13.5px]" /></Field>
      </div>
      <Field label="Unvan" htmlFor="headline" error={fe.headline} hint="ör. “Shopify ve WooCommerce e-ticaret geliştiricisi”"><input id="headline" name="headline" defaultValue={p.headline} maxLength={100} className="field" /></Field>
      <Field label="Hakkında" htmlFor="bio" error={fe.bio} hint="Deneyimin, çalışma şeklin ve uzmanlaştığın sektörler."><textarea id="bio" name="bio" defaultValue={p.bio} rows={7} className="field" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Yetenekler" htmlFor="skills" hint="Virgülle ayır."><input id="skills" name="skills" defaultValue={p.skills.join(", ")} className="field" /></Field>
        <Field label="Diller" htmlFor="languages"><input id="languages" name="languages" defaultValue={p.languages.join(", ")} className="field" /></Field>
        <Field label="İl" htmlFor="city" optional hint="İl sayfalarında yerel uzman olarak listelenirsiniz."><CitySelect name="city" defaultValue={p.city} /></Field>
        <Field label="Web sitesi" htmlFor="website" optional error={fe.website}><input id="website" name="website" defaultValue={p.website ?? ""} placeholder="https://" className="field" /></Field>
      </div>
      <div id="odeme" className="scroll-mt-24 rounded-lg border border-line bg-paper/60 p-4">
        <Field label="IBAN (hakediş ödemeleri için)" htmlFor="iban" error={fe.iban} hint="Hesap sahibinin adı, Eksen hesabındaki ad veya ajans unvanıyla aynı olmalı.">
          <input id="iban" name="iban" defaultValue={p.iban ?? ""} placeholder="TR00 0000 0000 0000 0000 0000 00" className="field font-mono" />
        </Field>
      </div>
      <SubmitButton pendingText="Kaydediliyor">Profili kaydet</SubmitButton>
    </form>
  );
}

export function PortfolioForm() {
  const [s, act] = useActionState<FormState, FormData>(addPortfolioAction, undefined);
  return (
    <form action={act} className="space-y-4 rounded-lg border border-line bg-surface p-5">
      <h2 className="font-semibold">Yeni çalışma ekle</h2>
      {s?.ok && <Notice tone="ok">{s.ok}</Notice>}
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Başlık" htmlFor="title" error={s?.fieldErrors?.title}><input id="title" name="title" className="field" /></Field>
        <Field label="Bağlantı" htmlFor="link" optional error={s?.fieldErrors?.link}><input id="link" name="link" placeholder="https://" className="field" /></Field>
      </div>
      <Field label="Kısa açıklama" htmlFor="description" optional><input id="description" name="description" maxLength={500} className="field" /></Field>
      <Field label="Görsel" htmlFor="image" optional><input id="image" name="image" type="file" accept="image/*" className="block text-[13.5px]" /></Field>
      <SubmitButton size="sm" pendingText="Ekleniyor">Portföye ekle</SubmitButton>
    </form>
  );
}

type Account = { name: string; email: string; phone: string | null; billing: Record<string, string | undefined> | null; prefs: { emailOrders: boolean; emailMessages: boolean; emailMarketing: boolean } };

export function AccountForm({ a }: { a: Account }) {
  const [s, act] = useActionState<FormState, FormData>(saveAccountAction, undefined);
  const b = a.billing ?? {};
  return (
    <form action={act} className="space-y-8">
      {s?.ok && <Notice tone="ok">{s.ok}</Notice>}
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <section className="space-y-4">
        <h2 className="text-[17px] font-semibold">Hesap</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ad soyad" htmlFor="name" error={s?.fieldErrors?.name}><input id="name" name="name" defaultValue={a.name} className="field" /></Field>
          <Field label="E-posta" htmlFor="email" hint="E-posta değişikliği için destek ekibine yazın."><input id="email" value={a.email} disabled className="field opacity-60" /></Field>
          <Field label="Telefon" htmlFor="phone" optional hint="Yalnızca hesap güvenliği için; diğer kullanıcılara gösterilmez."><input id="phone" name="phone" defaultValue={a.phone ?? ""} className="field" /></Field>
          <Field label="Profil fotoğrafı" htmlFor="avatar" optional><input id="avatar" name="avatar" type="file" accept="image/*" className="block pt-2 text-[13.5px]" /></Field>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-[17px] font-semibold">Fatura bilgileri</h2>
        <fieldset className="flex gap-4 text-[14px]">
          <label className="flex items-center gap-2"><input type="radio" name="billingKind" value="individual" defaultChecked={b.kind !== "corporate"} className="accent-[var(--color-ink)]" /> Bireysel</label>
          <label className="flex items-center gap-2"><input type="radio" name="billingKind" value="corporate" defaultChecked={b.kind === "corporate"} className="accent-[var(--color-ink)]" /> Kurumsal</label>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fatura adı" htmlFor="fullName" optional><input id="fullName" name="fullName" defaultValue={b.fullName} className="field" /></Field>
          <Field label="T.C. kimlik / vergi no" htmlFor="taxNumber" optional><input id="taxNumber" name="taxNumber" defaultValue={b.taxNumber} className="field" /></Field>
          <Field label="Firma unvanı" htmlFor="company" optional><input id="company" name="company" defaultValue={b.company} className="field" /></Field>
          <Field label="Vergi dairesi" htmlFor="taxOffice" optional><input id="taxOffice" name="taxOffice" defaultValue={b.taxOffice} className="field" /></Field>
          <Field label="Adres" htmlFor="address" optional className="sm:col-span-2"><input id="address" name="address" defaultValue={b.address} className="field" /></Field>
          <Field label="İl" htmlFor="city" optional><CitySelect name="city" defaultValue={b.city} /></Field>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-[17px] font-semibold">E-posta bildirimleri</h2>
        {[["emailOrders", "Sipariş, teklif ve ödeme bildirimleri", a.prefs.emailOrders], ["emailMessages", "Yeni mesajlar (sohbet başına 10 dakikada en fazla bir e-posta)", a.prefs.emailMessages], ["emailMarketing", "Kampanya ve duyurular", a.prefs.emailMarketing]].map(([n, l, v]) => (
          <label key={n as string} className="flex items-center gap-2.5 text-[14.5px]"><input type="checkbox" name={n as string} defaultChecked={v as boolean} className="h-4 w-4 accent-[var(--color-ink)]" /> {l as string}</label>
        ))}
        <p className="text-[12.5px] text-muted">Hesap güvenliği e-postaları (şifre sıfırlama, doğrulama) her zaman gönderilir.</p>
      </section>
      <SubmitButton pendingText="Kaydediliyor">Kaydet</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [s, act] = useActionState<FormState, FormData>(changePasswordAction, undefined);
  return (
    <form action={act} className="space-y-4">
      {s?.ok && <Notice tone="ok">{s.ok}</Notice>}
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mevcut şifre" htmlFor="current" error={s?.fieldErrors?.current}><input id="current" name="current" type="password" autoComplete="current-password" className="field" /></Field>
        <Field label="Yeni şifre" htmlFor="password" error={s?.fieldErrors?.password}><input id="password" name="password" type="password" autoComplete="new-password" className="field" /></Field>
      </div>
      <SubmitButton variant="outline" pendingText="Güncelleniyor">Şifreyi değiştir</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [s, act] = useActionState<FormState, FormData>(deleteAccountAction, undefined);
  return (
    <form action={act} className="space-y-3">
      {s?.error && <Notice tone="bad">{s.error}</Notice>}
      <p className="text-[14px] text-ink-2">Hesabın silindiğinde kişisel bilgilerin anonimleştirilir. Yasal saklama süresi olan fatura ve sipariş kayıtları korunur. Onaylamak için <b>HESABIMI SIL</b> yaz.</p>
      <div className="flex gap-2"><input name="confirm" className="field !w-56" /><SubmitButton variant="danger">Hesabı sil</SubmitButton></div>
    </form>
  );
}
