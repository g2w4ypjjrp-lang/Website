import type { Metadata } from "next";
import { ResetForm } from "@/components/forms/auth-forms";
import { Notice } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Yeni şifre belirle", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="text-[30px] font-semibold">Yeni şifre belirleyin</h1>
      <p className="mb-8 mt-2 text-muted">Şifreniz güncellendiğinde tüm cihazlardaki oturumlar kapatılır.</p>
      {token ? <ResetForm token={token} /> : <Notice tone="bad">Bağlantı eksik. E-postadaki bağlantıyı tekrar açın.</Notice>}
    </>
  );
}
