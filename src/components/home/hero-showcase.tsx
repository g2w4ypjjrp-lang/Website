import Link from "next/link";
import { ServiceCover } from "@/components/cards";
import { Avatar } from "@/components/ui/primitives";
import { IconLock, IconShield, IconCheck } from "@/components/icons";
import { fileUrl, formatTRY } from "@/lib/utils";
import type { ServiceCardData } from "@/server/queries";

/**
 * Hero’nun sağ tarafı: platformdaki gerçek bir hizmet ve ödemenin nasıl korunduğunu anlatan akış.
 * Uydurma sayı yok; akış kutusu ürün özelliğini açıklar.
 */
export function HeroShowcase({ items }: { items: ServiceCardData[] }) {
  const [main, ...rest] = items;
  if (!main) return null;
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[460px] lg:mx-0" aria-label="Örnek hizmet ve güvenli ödeme akışı">
      {/* arkadaki kartlar: derinlik */}
      {rest.slice(0, 2).map((r, i) => (
        <div key={r.id} aria-hidden className="absolute inset-x-4 top-4 hidden overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-lift sm:block" style={{ transform: i === 0 ? "translate(-34px, 10px) rotate(-5deg)" : "translate(34px, 22px) rotate(4deg)", zIndex: 0 }}>
          <ServiceCover rootSlug={r.rootSlug} coverId={r.coverId} title="" className="rounded-lg" />
          <div className="h-24" />
        </div>
      ))}

      <article className="relative z-10 overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-pop">
        <div className="relative overflow-hidden rounded-lg">
          <ServiceCover rootSlug={main.rootSlug} coverId={main.coverId} title={main.title} priority />
          <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-2.5 py-1 text-[11.5px] font-medium leading-none text-ink-2 shadow-xs">{main.categoryName}</span>
        </div>
        <div className="px-4 pb-4 pt-4">
          <div className="flex items-center gap-2 text-[13px]">
            <Avatar name={main.providerName} src={fileUrl(main.providerAvatarId)} size={24} />
            <span className="font-medium text-ink-2">{main.providerName}</span>
            {main.providerVerified && <IconShield size={13} className="text-trust" />}
          </div>
          <Link href={`/hizmet/${main.slug}`} className="mt-2 block font-display text-[19px] font-semibold leading-snug tracking-[-0.02em] hover:underline hover:decoration-accent hover:underline-offset-4">
            {main.title}
          </Link>
          <div className="mt-4 flex items-end justify-between border-t border-line-2 pt-4">
            <span className="text-[12.5px] text-muted">{main.minDeliveryDays} günden başlayan teslim</span>
            <span className="price text-[24px]">{formatTRY(main.startingPriceKurus)}</span>
          </div>
        </div>
      </article>

      {/* güvenli ödeme akışı: kartın kenarına taşan fiş */}
      <div className="relative z-20 -mt-6 ml-auto mr-0 w-[290px] max-w-[88%] rounded-2xl border border-ink bg-ink p-4 text-white shadow-pop sm:mr-[-28px]">
        <p className="flex items-center gap-2 text-[13px] font-medium"><IconLock size={14} className="text-accent" /> Ödemen güvencede</p>
        <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Sipariş adımları">
          {["Öde", "Çalışma", "Teslim", "Onay"].map((s, i) => (
            <li key={s}>
              <span className={`block h-1 rounded-full ${i < 2 ? "bg-accent" : "bg-white/20"}`} />
              <span className={`mt-1.5 block text-[11px] ${i < 2 ? "text-white" : "text-white/50"}`}>{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-snug text-white/65"><IconCheck size={13} className="mt-px shrink-0 text-accent" /> Tutar, sen teslimatı onaylayana kadar uzmana aktarılmaz.</p>
      </div>
    </div>
  );
}
