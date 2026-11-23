import { ThemedLogo } from "@/components/themed-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,520px)]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <ThemedLogo />
        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">{children}</main>
        <p className="text-[12.5px] text-muted">Ödemeler lisanslı ödeme kuruluşu üzerinden alınır. Kart bilgileriniz Eksen’de saklanmaz.</p>
      </div>
      <aside className="auth-aside relative hidden overflow-hidden bg-[#0f1115] text-white lg:block" aria-hidden>
        <svg className="absolute inset-0 h-full w-full opacity-[0.09]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0v48" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        <div className="absolute left-[38%] top-0 h-full w-px bg-white/25" />
        <div className="absolute left-0 top-[58%] h-px w-full bg-white/25" />
        <div className="absolute left-[38%] top-[58%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 bg-accent" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="max-w-sm font-display text-[30px] font-semibold leading-[1.15] tracking-[-0.03em]">
            İşi tarif edin, teklifleri karşılaştırın, yalnızca beğendiğiniz teslimatın parasını ödeyin.
          </p>
          <ul className="mt-8 space-y-2.5 text-[14px] text-white/70">
            <li>— Ödeme, siz onaylayana kadar havuz hesabında bekler.</li>
            <li>— Değerlendirmeleri yalnızca işi tamamlanan müşteriler yazabilir.</li>
            <li>— Anlaşmazlıkta Eksen ekibi arabulucu olur.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
