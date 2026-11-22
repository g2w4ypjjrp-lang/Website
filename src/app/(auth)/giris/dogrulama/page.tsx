import type { Metadata } from "next";
import Link from "next/link";
import { TwoFactorForm } from "@/components/forms/two-factor-form";

export const metadata: Metadata = { title: "İki adımlı doğrulama", robots: { index: false } };

export default function TwoFactorPage() {
  return (
    <>
      <h1 className="text-[30px] font-semibold">Doğrulama kodu</h1>
      <p className="mb-8 mt-2 text-muted">Telefonunuzdaki doğrulama uygulamasında “Eksen” için gösterilen 6 haneli kodu girin. Kod her 30 saniyede yenilenir.</p>
      <TwoFactorForm />
      <Link href="/giris" className="mt-6 block text-[14px] text-muted hover:text-ink">← Girişe dön</Link>
    </>
  );
}
