import { ServiceCover } from "@/components/cards";
import { Avatar } from "@/components/ui/primitives";
import { LogoMark } from "@/components/logo";
import { IconCheck, IconSearch, IconShield } from "@/components/icons";
import { fileUrl, formatTRY } from "@/lib/utils";
import type { ServiceCardData } from "@/server/queries";

/** Türk bayrağı (emoji yerine çizim). */
export function FlagTR({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0 rounded-full">
      <circle cx="12" cy="12" r="12" fill="#e30a17" />
      <circle cx="10" cy="12" r="5.6" fill="#fff" />
      <circle cx="11.4" cy="12" r="4.5" fill="#e30a17" />
      <path d="M13.10 12.00 L14.63 11.44 L14.69 9.81 L15.69 11.10 L17.26 10.65 L16.35 12.00 L17.26 13.35 L15.69 12.90 L14.69 14.19 L14.63 12.56Z" fill="#fff" />
    </svg>
  );
}

const STEPS = ["Ödeme alındı", "Çalışma sürüyor", "Teslimat", "Onay"] as const;

/**
 * Dizüstü + telefon görünümünde canlı ürün arayüzü: ekranda platformdaki gerçek bir hizmet,
 * telefonda siparişin gerçek adımları. Fotoğraf ya da uydurma sayı yok.
 */
export function DeviceShowcase({ s, variant }: { s: ServiceCardData; variant: "neo" | "sunrise" }) {
  const neo = variant === "neo";
  return (
    <div className="relative mx-auto w-full max-w-[560px] select-none" aria-label="Eksen arayüzü önizlemesi">
      {neo ? (
        <div aria-hidden className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,rgb(115_80_255/0.45),transparent)] blur-2xl" />
      ) : (
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-6 h-[78%] w-[78%] rounded-[46%_54%_42%_58%/55%_40%_60%_45%] bg-accent-soft" />
      )}
      {/* Dizüstü */}
      <div className="relative pr-[16%]">
        <div className={`rounded-[16px] border-[7px] ${neo ? "border-[#20233f] bg-[#0f1230]" : "border-[#2a2c33] bg-[#1d1f25]"} shadow-pop`}>
          <div className="aspect-[16/10] overflow-hidden rounded-[8px] bg-paper text-left">
            <div className="flex items-center gap-1.5 border-b border-line bg-surface px-2.5 py-1.5 text-[8px]">
              <LogoMark size={10} /><span className="font-semibold">eksen</span>
              <span className="ml-2 hidden text-muted sm:inline">Hizmetler</span><span className="hidden text-muted sm:inline">Uzmanlar</span>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-faint"><IconSearch size={7} /> Ara</span>
            </div>
            <div className="grid grid-cols-[1.1fr_1fr] gap-2.5 p-2.5">
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-accent-soft px-1.5 py-0.5 text-[7px] font-medium text-accent-strong">{s.categoryName}</span>
                <p className="mt-1.5 line-clamp-2 text-[10.5px] font-semibold leading-tight">{s.title}</p>
                <div className="mt-1.5 flex items-center gap-1 text-[7.5px] text-muted">
                  <Avatar name={s.providerName} src={fileUrl(s.providerAvatarId)} size={12} />
                  <span className="truncate">{s.providerName}</span>
                  {s.providerVerified && <IconShield size={7} className="shrink-0 text-trust" />}
                </div>
                <div className="mt-2 rounded-md border border-line bg-surface p-1.5">
                  <p className="flex items-center justify-between text-[7.5px] text-muted">Başlangıç <span className="text-[10px] font-semibold text-ink">{formatTRY(s.startingPriceKurus)}</span></p>
                  <p className="mt-1 rounded-[var(--radius-btn)] bg-accent py-0.5 text-center text-[7.5px] font-semibold text-white">Devam et</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-md"><ServiceCover rootSlug={s.rootSlug} coverId={s.coverId} title="" priority /></div>
            </div>
            <div className="grid grid-cols-3 gap-2 px-2.5 pb-2.5">
              {["grafik-tasarim", "mobil-uygulama", "dijital-pazarlama"].map((slug) => (
                <div key={slug} className="overflow-hidden rounded-md border border-line bg-surface">
                  <ServiceCover rootSlug={slug} title="" aspect="aspect-[16/9]" />
                  <div className="space-y-1 p-1.5"><div className="h-1 w-4/5 rounded bg-ink/50" /><div className="h-1 w-1/2 rounded bg-ink/20" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={`mx-auto -mt-px h-3 w-[108%] -translate-x-[3.7%] rounded-b-[12px] ${neo ? "bg-[#2a2e52]" : "bg-[#d4d6dd]"} shadow-pop`} />
      </div>
      {/* Telefon: sipariş adımları */}
      <div className={`absolute -bottom-5 right-0 w-[34%] min-w-[150px] rounded-[26px] border-[6px] ${neo ? "border-[#20233f]" : "border-[#2a2c33]"} bg-surface p-3 text-left shadow-pop`}>
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-line" />
        <p className="text-[10px] font-semibold">Sipariş durumu</p>
        {neo ? (
          <div className="relative mx-auto my-2.5 h-[68px] w-[68px]">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-line)" strokeWidth="3.2" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-accent-bright)" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="48.7 97.4" />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center text-[13px] font-semibold leading-none">2/4<span className="mt-0.5 text-[7px] font-normal text-muted">adım</span></span>
          </div>
        ) : (
          <p className="mt-1 text-[8.5px] text-muted">Ödemen güvencede</p>
        )}
        <ul className="mt-1.5 space-y-1.5">
          {STEPS.map((st, i) => (
            <li key={st} className="flex items-center gap-1.5 text-[8.5px]">
              <span className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${i < 2 ? "bg-trust text-white" : "border border-line"}`}>{i < 2 && <IconCheck size={7} />}</span>
              <span className={i < 2 ? "text-ink" : "text-faint"}>{st}</span>
            </li>
          ))}
        </ul>
      </div>
      {!neo && (
        <div className="absolute -left-3 top-2 z-10 flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-pop sm:-left-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent"><IconShield size={18} /></span>
          <span className="text-left leading-tight"><span className="block text-[13px] font-semibold">Güvenli ödeme</span><span className="block text-[11.5px] text-muted">İş bitene kadar ödemen bizde</span></span>
        </div>
      )}
    </div>
  );
}
