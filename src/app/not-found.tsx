import Link from "next/link";
import { Logo } from "@/components/logo";
import { SearchBox } from "@/components/site/header-search";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="container-x py-5"><Logo /></div>
      <main className="container-x flex flex-1 flex-col justify-center pb-24">
        <p className="num text-[13px] text-accent">404</p>
        <h1 className="mt-3 max-w-xl text-[36px] font-semibold sm:text-[48px]">Bu sayfa yerinde yok.</h1>
        <p className="mt-3 max-w-lg text-ink-2">Bağlantı eskimiş ya da sayfa kaldırılmış olabilir. Aradığınız hizmeti buradan bulabilirsiniz:</p>
        <div className="mt-8 max-w-xl"><SearchBox /></div>
        <div className="mt-8 flex gap-6 text-[14.5px]"><Link href="/" className="underline underline-offset-4">Ana sayfa</Link><Link href="/kategoriler" className="underline underline-offset-4">Kategoriler</Link><Link href="/blog" className="underline underline-offset-4">Rehberler</Link></div>
      </main>
    </div>
  );
}
