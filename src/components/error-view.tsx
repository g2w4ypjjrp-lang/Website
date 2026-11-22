"use client";
import Link from "next/link";
import { useEffect } from "react";

/** Hata sınırı görünümü: ne olduğunu söyler, tekrar deneme ve çıkış yolu sunar. Teknik ayrıntı göstermez. */
export function ErrorView({ error, reset, home = "/" }: { error: Error & { digest?: string }; reset: () => void; home?: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-lg py-20" role="alert">
      <p className="num text-[13px] text-accent">Hata{error.digest ? ` · ${error.digest}` : ""}</p>
      <h1 className="mt-3 text-[30px] font-semibold">Bu sayfa şu an yüklenemedi.</h1>
      <p className="mt-3 text-ink-2">Sorun bizden kaynaklanıyor ve kayıt altına alındı. Birkaç saniye sonra tekrar deneyebilirsiniz; işleminiz kaybolmadı.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="h-10 rounded-md bg-ink px-4 text-[14.5px] font-medium text-white">Tekrar dene</button>
        <Link href={home} className="flex h-10 items-center rounded-md border border-line px-4 text-[14.5px]">Geri dön</Link>
      </div>
    </div>
  );
}
