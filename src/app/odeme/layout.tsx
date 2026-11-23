import { ThemedLogo } from "@/components/themed-logo";
import { IconLock } from "@/components/icons";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="container-x flex h-[60px] items-center justify-between">
          <ThemedLogo />
          <span className="flex items-center gap-1.5 text-[13.5px] text-trust"><IconLock size={15} /> Güvenli ödeme</span>
        </div>
      </header>
      <main className="container-x py-10">{children}</main>
    </div>
  );
}
