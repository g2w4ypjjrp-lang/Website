import { IconCheck, IconShield } from "@/components/icons";
import { LogoMarkBolt, LogoMarkLayers } from "@/components/logo";

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

/** Örnek müşteri sitesi (Tema 3): gece gökyüzü ve dağlar. Uzmanların teslim ettiği işi temsil eden çizim. */
function MountainSite() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#120f33] text-left text-white">
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sky-neo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120f33" /><stop offset="1" stopColor="#3a2b8c" /></linearGradient>
          <linearGradient id="mt-neo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8f7cf0" /><stop offset="1" stopColor="#2c2170" /></linearGradient>
        </defs>
        <rect width="320" height="200" fill="url(#sky-neo)" />
        <path d="M120 200 L190 70 L215 105 L240 60 L300 150 L320 135 L320 200Z" fill="url(#mt-neo)" />
        <path d="M240 60 L229 78 L238 74 L245 84 L251 76Z M190 70 L181 87 L190 82 L196 91 L201 82Z" fill="#ece8ff" />
        <path d="M100 200 L170 130 L205 160 L245 120 L320 185 L320 200Z" fill="#1d1652" />
      </svg>
      <div className="relative flex items-center gap-1.5 px-3 py-2 text-[7px]">
        <span className="font-bold">Eksen</span>
        <span className="ml-auto opacity-60">Hakkımızda</span><span className="opacity-60">Hizmetler</span><span className="opacity-60">İletişim</span>
        <span className="rounded bg-[#7350ff] px-1.5 py-0.5 font-semibold">Teklif al</span>
      </div>
      <div className="relative px-3 pt-3">
        <p className="max-w-[55%] text-[13px] font-bold leading-tight">Markanızı Dijitalde Büyütün</p>
        <div className="mt-1.5 space-y-1"><div className="h-1 w-[40%] rounded bg-white/40" /><div className="h-1 w-[32%] rounded bg-white/25" /></div>
        <span className="mt-2.5 inline-block rounded bg-[#7350ff] px-2 py-1 text-[6.5px] font-semibold">Hemen başla</span>
      </div>
      <div className="absolute inset-x-3 bottom-2.5 grid grid-cols-3 gap-1.5">
        {["#3b2f8f", "#2a3d8f", "#4b2f7f"].map((c) => (
          <div key={c} className="h-8 rounded border border-white/10" style={{ background: `linear-gradient(160deg, ${c}, #151236)` }} />
        ))}
      </div>
    </div>
  );
}

/** Örnek müşteri sitesi (Tema 4): kurumsal site, cam cepheli bina çizimi. */
function CorporateSite() {
  return (
    <div className="flex h-full w-full flex-col bg-white text-left text-[#1b1d23]">
      <div className="flex items-center gap-1.5 border-b border-[#eee] px-3 py-1.5 text-[6.5px]">
        <span className="flex items-center gap-1 font-bold"><LogoMarkBolt size={9} /> Eksen</span>
        <span className="ml-auto text-[#888]">Hakkımızda</span><span className="text-[#888]">Hizmetler</span><span className="text-[#888]">Projeler</span><span className="text-[#888]">İletişim</span>
      </div>
      <div className="grid flex-1 grid-cols-[1fr_1.2fr] gap-2 px-3 pt-2.5">
        <div>
          <p className="text-[12.5px] font-bold italic leading-tight">Kurumsal<br />Web Sitesi</p>
          <div className="mt-1.5 space-y-1"><div className="h-1 w-[90%] rounded bg-[#ddd]" /><div className="h-1 w-[70%] rounded bg-[#e6e6e6]" /></div>
          <div className="mt-2 flex gap-1"><span className="rounded bg-[#1b1d23] px-1.5 py-0.5 text-[5.5px] text-white">İncele</span><span className="rounded border border-[#ddd] px-1.5 py-0.5 text-[5.5px]">İletişim</span></div>
        </div>
        <svg viewBox="0 0 120 80" className="h-full w-full rounded" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs><linearGradient id="sky-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfe3f7" /><stop offset="1" stopColor="#f4f7fb" /></linearGradient></defs>
          <rect width="120" height="80" fill="url(#sky-sun)" />
          <path d="M28 80V18l34-8v70z" fill="#5b6b80" />
          <path d="M62 10l28 10v60H62z" fill="#3f4d60" />
          {Array.from({ length: 8 }).map((_, r) => (
            <g key={r}>
              {[32, 40, 48, 56].map((x) => <rect key={x} x={x} y={22 + r * 7} width="5" height="4" fill="#a9c9ea" opacity=".85" />)}
              {[66, 74, 82].map((x) => <rect key={x} x={x} y={24 + r * 7} width="5" height="4" fill="#8db3dc" opacity=".7" />)}
            </g>
          ))}
          <path d="M92 80V44h22v36z" fill="#7b8aa0" />
          <rect y="76" width="120" height="4" fill="#c9d2dd" />
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-1.5 px-3 pb-2.5 pt-2">
        {["#dfe7f1", "#e9e4dc", "#dde8e4", "#ece2dc"].map((c) => <div key={c} className="h-6 rounded" style={{ background: c }} />)}
      </div>
    </div>
  );
}

/** Saksı bitkisi (Tema 4 dekoru): kökten yelpaze gibi açılan yapraklar, alan derinliği için hafif bulanık. */
function Plant({ className }: { className?: string }) {
  const leaves: [number, number, number, string][] = [
    [-62, 92, 30, "#3f7a45"], [-38, 118, 34, "#5c9e5c"], [-14, 132, 36, "#4c8a4f"], [8, 126, 35, "#6aa96a"],
    [30, 116, 33, "#3f7a45"], [52, 98, 30, "#5c9e5c"], [-26, 84, 26, "#77b673"], [20, 88, 27, "#4c8a4f"],
  ];
  return (
    <svg aria-hidden viewBox="0 0 240 230" className={className}>
      {leaves.map(([rot, len, w, fill], i) => (
        <g key={i} transform={`rotate(${rot} 120 228)`}>
          <path d={`M120 228 C${120 + w} ${228 - len * 0.35} ${120 + w * 0.75} ${228 - len * 0.85} 120 ${228 - len} C${120 - w * 0.75} ${228 - len * 0.85} ${120 - w} ${228 - len * 0.35} 120 228Z`} fill={fill} />
          <path d={`M120 226 L120 ${232 - len}`} stroke="#2f5f35" strokeOpacity=".45" strokeWidth="1.4" />
        </g>
      ))}
    </svg>
  );
}

/** Dizüstünün klavye tablası: ekrana menteşeden bağlı, öne yatırılmış yüzey (tuşlar ve dokunmatik alan). */
function LaptopDeck({ neo }: { neo: boolean }) {
  const id = neo ? "keys-neo" : "keys-sun";
  return (
    <div
      aria-hidden
      className={`absolute -left-[6%] top-[calc(100%-3px)] h-[74%] w-[112%] origin-top rounded-b-[26px] rounded-t-[6px] [transform-style:preserve-3d] [transform:rotateX(60deg)] ${neo ? "bg-[linear-gradient(180deg,#2d3166,#1b1e44)]" : "bg-[linear-gradient(180deg,#eceef2,#cdd1d8)]"}`}
    >
      <svg viewBox="0 0 300 180" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill={neo ? "#121436" : "#3b3e47"} />
          </pattern>
        </defs>
        <rect x="22" y="14" width="256" height="96" rx="4" fill={`url(#${id})`} />
        <rect x="104" y="120" width="92" height="50" rx="7" fill={neo ? "#252859" : "#c3c7cf"} stroke={neo ? "#3c4182" : "#b3b8c1"} />
      </svg>
      {/* Ön kenar (izleyiciye dönük kalınlık) */}
      <div className={`absolute inset-x-[2%] top-[calc(100%-1px)] h-[14px] origin-top rounded-b-[12px] [transform:rotateX(-60deg)] ${neo ? "bg-[#111334]" : "bg-[#a9aeb8]"}`} />
    </div>
  );
}

/**
 * Giriş bölümündeki dizüstü + telefon kompozisyonu (Tema 3 ve 4).
 * Dizüstüde uzmanların teslim ettiği türden örnek bir site, telefonda örnek bir projenin durum ekranı.
 * Görsel bir örnektir; gerçek bir sipariş ya da müşteri verisi göstermez.
 */
export function DeviceShowcase({ variant }: { variant: "neo" | "sunrise" }) {
  const neo = variant === "neo";
  const steps = neo ? ["Tasarım", "Geliştirme", "Test", "Teslimat"] : ["Ödeme Alındı", "Çalışma Devam Ediyor", "Teslimat Hazır", "Tamamlandı"];
  const done = 3;
  return (
    <div className="relative mx-auto w-full max-w-[620px] select-none pb-[9%] [perspective:1500px]" aria-label="Örnek proje ve proje durumu ekranı">
      {neo ? (
        <>
          <div aria-hidden className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgb(115_80_255/0.42),transparent)] blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -left-[8%] -top-[4%] h-[92%] w-[60%] -rotate-[18deg] rounded-[48%] border-[2.5px] border-[#9b7dff]/80 shadow-[0_0_28px_rgba(139,92,246,0.75),inset_0_0_22px_rgba(139,92,246,0.45)]" />
        </>
      ) : (
        <>
          {/* Turuncu kıvrım: bölümün üst kenarından taşar, kesik kenarları görünmez */}
          <div aria-hidden className="pointer-events-none absolute -inset-[12%] rounded-full bg-[radial-gradient(closest-side,#fff3e8,transparent)]" />
          <svg aria-hidden viewBox="0 0 160 190" preserveAspectRatio="none" className="pointer-events-none absolute -left-[30%] -top-[70%] hidden h-[190%] w-[160%] lg:block">
            <defs>
              <linearGradient id="swoosh" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#f97316" stopOpacity=".6" />
                <stop offset=".22" stopColor="#fb8a3c" stopOpacity=".9" />
                <stop offset=".6" stopColor="#fdba74" stopOpacity=".72" />
                <stop offset="1" stopColor="#ffe4cc" stopOpacity=".5" />
              </linearGradient>
            </defs>
            <path d="M28 162 C23 128 35 85 60 58 C80 38 110 20 160 0 L160 60 C120 80 85 100 55 132 C42 148 34 158 28 162 Z" fill="url(#swoosh)" />
          </svg>
          <Plant className="pointer-events-none absolute -right-[24%] -top-[42%] hidden h-[96%] opacity-90 blur-[1.6px] lg:block" />
        </>
      )}
      {/* Dizüstü: ekran + klavye tablası, soldan ve hafif yukarıdan bakış */}
      {/* Masa gölgesi */}
      <div aria-hidden className={`pointer-events-none absolute bottom-[1%] left-[2%] h-[12%] w-[80%] rounded-[50%] blur-xl ${neo ? "bg-[#7350ff]/25" : "bg-black/15"}`} />
      <div className={`relative ${neo ? "w-[86%]" : "w-[80%]"} [transform-style:preserve-3d] [transform-origin:50%_100%] [transform:rotateZ(-5deg)_rotateX(8deg)_rotateY(18deg)_rotateX(10deg)]`}>
        <div className={`rounded-[16px] border-[7px] ${neo ? "border-[#1d2046] bg-[#0f1230]" : "border-[#23252b] bg-[#1d1f25]"} shadow-pop`}>
          <div className="aspect-[16/10] overflow-hidden rounded-[8px]">{neo ? <MountainSite /> : <CorporateSite />}</div>
        </div>
        <LaptopDeck neo={neo} />
      </div>
      {/* Telefon */}
      <div className={`absolute top-[14%] w-[31%] min-w-[146px] rounded-[28px] ${neo ? "-right-[2%]" : "right-[11%]"} border-[6px] ${neo ? "border-[#1d2046] bg-[#12152f]" : "border-[#23252b] bg-white"} p-3 text-left shadow-pop [transform:rotateZ(3deg)_rotateY(-10deg)]`}>
        <div className="mx-auto mb-2.5 h-[9px] w-[38%] rounded-full bg-[#0b0c10]" />
        {neo && <p className="mb-1 flex items-center gap-1 text-[9px] font-bold"><LogoMarkLayers size={11} /> Eksen</p>}
        <p className="text-[10.5px] font-semibold">Proje Durumu</p>
        {neo ? (
          <div className="relative mx-auto my-3 h-[78px] w-[78px]">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-line)" strokeWidth="3" />
              {/* Parlama: filtre yerine geniş ve saydam ikinci iz (katman kutusu oluşmaz) */}
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#9b7dff" strokeOpacity=".28" strokeWidth="6" strokeLinecap="round" strokeDasharray="73 97.4" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeDasharray="73 97.4" />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center text-[15px] font-bold leading-none">%75<span className="mt-0.5 text-[7px] font-normal text-muted">Tamamlandı</span></span>
          </div>
        ) : (
          <div className="mt-1.5 h-px w-full bg-line" />
        )}
        <ul className="mt-2.5 space-y-2.5">
          {steps.map((st, i) => (
            <li key={st} className="flex items-center gap-1.5 whitespace-nowrap text-[8.5px]">
              <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${i < done ? (neo ? "bg-[#7350ff] text-white" : "bg-[#16a34a] text-white") : "border border-line"}`}>{i < done && <IconCheck size={8} />}</span>
              <span className={i < done ? "text-ink" : "text-faint"}>{st}</span>
              {neo && i < done && <IconCheck size={9} className="ml-auto text-[#a78bfa]" />}
            </li>
          ))}
        </ul>
      </div>
      {!neo && (
        <>
          <div className="absolute -left-2 -top-9 z-10 flex -rotate-[4deg] items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 shadow-pop sm:-left-7">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-bright"><IconShield size={20} /></span>
            <span className="text-left leading-tight"><span className="block text-[14px] font-semibold">Güvenli Ödeme</span><span className="block text-[12px] text-muted">İş bitene kadar<br />ödemen bizde</span></span>
          </div>
          {/* Kupa (dekor) */}
          <div aria-hidden className="absolute right-0 top-[50%] hidden h-[76px] w-[64px] rounded-b-[16px] rounded-t-[7px] bg-gradient-to-b from-white to-[#ebebeb] shadow-pop sm:block">
            <span className="absolute -right-[14px] top-[15px] h-[34px] w-[20px] rounded-r-full border-[5px] border-l-0 border-[#eeeeee]" />
            <span className="absolute left-1/2 top-[24px] -translate-x-1/2"><LogoMarkBolt size={24} /></span>
          </div>
        </>
      )}
    </div>
  );
}
