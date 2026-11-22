import Link from "next/link";
import type { Metadata } from "next";
import { ForgotForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Şifremi unuttum", robots: { index: false } };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-[30px] font-semibold">Şifrenizi mi unuttunuz?</h1>
      <p className="mb-8 mt-2 text-muted">Kayıtlı e-posta adresinizi yazın, size bir sıfırlama bağlantısı gönderelim.</p>
      <ForgotForm />
      <Link href="/giris" className="mt-6 block text-[14px] text-muted hover:text-ink">← Girişe dön</Link>
    </>
  );
}
