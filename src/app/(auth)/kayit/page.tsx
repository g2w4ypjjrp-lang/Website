import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Kaydol", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ rol?: string; sonra?: string }> }) {
  const { rol, sonra } = await searchParams;
  return (
    <>
      <h1 className="text-[30px] font-semibold">Hesap oluşturun</h1>
      <p className="mb-8 mt-2 text-muted">
        Zaten üye misiniz? <Link href="/giris" className="font-medium text-ink underline underline-offset-4">Giriş yapın</Link>
      </p>
      <RegisterForm defaultRole={rol === "uzman" ? "provider" : "customer"} next={sonra} />
    </>
  );
}
