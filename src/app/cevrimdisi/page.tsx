import type { Metadata } from "next";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Bağlantı yok", robots: { index: false } };

export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center px-6">
      <LogoMark size={28} />
      <h1 className="mt-6 text-[28px] font-semibold">İnternet bağlantısı yok.</h1>
      <p className="mt-2 max-w-sm text-ink-2">Bağlantınız geldiğinde sayfa kaldığınız yerden açılır. Gönderdiğiniz mesajlar ve ödemeler bağlantı olmadan işlenmez.</p>
    </main>
  );
}
