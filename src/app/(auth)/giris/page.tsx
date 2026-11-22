import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sonra?: string }> }) {
  const { sonra } = await searchParams;
  return (
    <>
      <h1 className="text-[30px] font-semibold">Tekrar hoş geldiniz</h1>
      <p className="mb-8 mt-2 text-muted">
        Hesabınız yok mu? <Link href={`/kayit${sonra ? `?sonra=${encodeURIComponent(sonra)}` : ""}`} className="font-medium text-ink underline underline-offset-4">Ücretsiz kaydolun</Link>
      </p>
      <LoginForm next={sonra} />
    </>
  );
}
