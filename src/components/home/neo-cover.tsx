import type { ReactNode } from "react";

/**
 * Tema 3 vitrin kapakları: koyu mor zeminde ışıklı “ürün çekimi” çizimleri (stok fotoğraf yerine).
 * Uzmanın kendi kapak görseli varsa kart onu gösterir; bu çizim yalnızca görseli olmayan hizmetler için.
 * Aynı sayfada birden çok kapak olduğundan degrade kimlikleri karta özgü ön ekle üretilir.
 */
export function NeoCover({ rootSlug, uid, title }: { rootSlug: string; uid: string; title: string }) {
  const k = uid.replace(/[^a-z0-9]/gi, "").slice(0, 10);
  const id = (n: string) => `${n}-${k}`;
  const url = (n: string) => `url(#${id(n)})`;
  // Aynı kategoriden iki hizmet yan yana düşerse farklı görünsün diye bazı kategorilerde ikinci çizim
  const alt = [...uid].reduce((a, c) => a + c.charCodeAt(0), 0) % 2 === 1 ? ALT_SCENES[rootSlug] : undefined;
  const scene = alt ?? SCENES[rootSlug] ?? SCENES["web-ve-yazilim"]!;
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className="aspect-[16/10] w-full" role="img" aria-label={title}>
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#21185e" /><stop offset=".55" stopColor="#120e38" /><stop offset="1" stopColor="#0a0922" /></linearGradient>
        <radialGradient id={id("glow")} cx=".5" cy=".42" r=".62"><stop offset="0" stopColor="#7c5cff" stopOpacity=".6" /><stop offset=".55" stopColor="#5b3cf0" stopOpacity=".18" /><stop offset="1" stopColor="#5b3cf0" stopOpacity="0" /></radialGradient>
        <linearGradient id={id("scr")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#30238a" /><stop offset="1" stopColor="#140f40" /></linearGradient>
        <linearGradient id={id("acc")} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7c5cff" /><stop offset="1" stopColor="#c4b5fd" /></linearGradient>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8f7bff" /><stop offset="1" stopColor="#3b2fa0" /></linearGradient>
        <linearGradient id={id("area")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38d6ff" stopOpacity=".45" /><stop offset="1" stopColor="#7c5cff" stopOpacity="0" /></linearGradient>
        <linearGradient id={id("paper")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f1ff" /><stop offset="1" stopColor="#d9d1ff" /></linearGradient>
      </defs>
      <rect width="320" height="200" fill={url("bg")} />
      <ellipse cx="160" cy="92" rx="170" ry="105" fill={url("glow")} />
      {/* Zemin yansıması */}
      <ellipse cx="160" cy="186" rx="120" ry="10" fill="#7c5cff" opacity=".18" />
      {scene({ url })}
    </svg>
  );
}

type Scene = (p: { url: (n: string) => string }) => ReactNode;

const line = (x: number, y: number, w: number, fill = "#8b80d9", h = 3) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;

const SCENES: Record<string, Scene> = {
  // Dizüstü ve tarayıcıda kurumsal site
  "web-ve-yazilim": ({ url }) => (
    <g transform="translate(58 30)">
      <rect width="204" height="124" rx="9" fill="#0d0b2b" stroke={url("rim")} strokeWidth="1.6" />
      <rect x="7" y="7" width="190" height="110" rx="4" fill={url("scr")} />
      {line(14, 14, 24, "#c4b5fd", 4)}
      {line(118, 14.5, 14)}{line(136, 14.5, 14)}{line(154, 14.5, 14)}
      <rect x="172" y="12" width="20" height="8" rx="4" fill={url("acc")} />
      <rect x="14" y="30" width="84" height="8" rx="2" fill="#fff" opacity=".92" />
      <rect x="14" y="41" width="64" height="8" rx="2" fill="#fff" opacity=".92" />
      {line(14, 55, 72)}{line(14, 61, 54)}
      <rect x="14" y="70" width="34" height="10" rx="5" fill={url("acc")} />
      <path d="M104 80 L128 46 L142 62 L158 40 L190 80 Z" fill="#6c58e8" opacity=".95" />
      <path d="M158 40 L151 50 L158 47 L163 53 L166 47 Z M128 46 L123 53 L129 51 L133 56 Z" fill="#efeaff" />
      {[14, 74, 134].map((x) => <rect key={x} x={x} y="88" width="56" height="22" rx="3" fill="#2a2178" stroke="#3f3496" strokeWidth=".8" />)}
      <path d="M-16 124 H220 L208 138 H-4 Z" fill="#2a2468" />
      <path d="M-16 124 H220" stroke="#8f7bff" strokeWidth="1" opacity=".6" />
    </g>
  ),
  // İki telefonda mobil uygulama
  "mobil-uygulama": ({ url }) => (
    <>
      <g transform="rotate(-9 126 104)">
        <rect x="86" y="24" width="80" height="156" rx="15" fill="#0d0b2b" stroke={url("rim")} strokeWidth="1.6" />
        <rect x="92" y="30" width="68" height="144" rx="10" fill={url("scr")} />
        <rect x="114" y="34" width="24" height="5" rx="2.5" fill="#05040f" />
        <circle cx="126" cy="76" r="20" fill="none" stroke="#3f3496" strokeWidth="6" />
        <circle cx="126" cy="76" r="20" fill="none" stroke={url("acc")} strokeWidth="6" strokeLinecap="round" strokeDasharray="94 126" transform="rotate(-90 126 76)" />
        <rect x="102" y="110" width="48" height="6" rx="3" fill="#fff" opacity=".9" />
        {line(102, 121, 36)}
        <rect x="102" y="146" width="48" height="14" rx="7" fill={url("acc")} />
      </g>
      <g transform="rotate(8 206 108)">
        <rect x="170" y="36" width="76" height="148" rx="15" fill="#0d0b2b" stroke={url("rim")} strokeWidth="1.6" />
        <rect x="176" y="42" width="64" height="136" rx="10" fill={url("scr")} />
        {[58, 84, 110, 136].map((y) => (
          <g key={y}>
            <rect x="183" y={y} width="50" height="20" rx="5" fill="#2a2178" />
            <circle cx="193" cy={y + 10} r="5" fill={url("acc")} />
            {line(202, y + 6, 24, "#d6ceff")}{line(202, y + 12, 16)}
          </g>
        ))}
      </g>
    </>
  ),
  // Kartvizit ve logo işareti
  "grafik-tasarim": ({ url }) => (
    <>
      <g transform="rotate(-10 140 96)">
        <rect x="58" y="52" width="160" height="96" rx="7" fill="#141130" stroke="#3b3290" strokeWidth="1.2" />
        <path d="M120 74 l18 -10 18 10 v21 l-18 10 -18 -10z" fill="none" stroke={url("acc")} strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="138" cy="84.5" r="5" fill="#c4b5fd" />
        {line(100, 118, 76, "#c4b5fd", 4)}{line(112, 128, 52)}
      </g>
      <g transform="rotate(9 214 122)">
        <rect x="160" y="86" width="118" height="72" rx="6" fill={url("paper")} />
        <path d="M200 140 L214 108 L228 140 M205 130 H223" stroke="#2a1f7a" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="160" y="86" width="118" height="72" rx="6" fill="none" stroke="#fff" strokeOpacity=".6" />
      </g>
    </>
  ),
  // Yükselen grafikli pazarlama paneli
  "dijital-pazarlama": ({ url }) => (
    <g>
      <rect x="40" y="28" width="240" height="146" rx="11" fill="#110e33" stroke={url("rim")} strokeWidth="1.4" />
      {line(56, 44, 58, "#c4b5fd", 5)}{line(56, 54, 38)}
      <rect x="206" y="40" width="60" height="14" rx="7" fill={url("acc")} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={56 + i * 70} y="66" width="62" height="26" rx="5" fill="#1d1752" />
          {line(63 + i * 70, 73, 26, "#8b80d9")}
          <rect x={63 + i * 70} y="80" width={[34, 28, 40][i]} height="6" rx="2" fill="#fff" opacity=".9" />
        </g>
      ))}
      <path d="M56 160 L84 146 L112 150 L140 128 L168 134 L196 112 L224 116 L262 94 V164 H56 Z" fill={url("area")} />
      <path d="M56 160 L84 146 L112 150 L140 128 L168 134 L196 112 L224 116 L262 94" fill="none" stroke="#38d6ff" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="262" cy="94" r="4.5" fill="#38d6ff" />
      <circle cx="262" cy="94" r="9" fill="#38d6ff" opacity=".25" />
    </g>
  ),
  // Video oynatıcı ve zaman çizelgesi
  "video-ve-icerik": ({ url }) => (
    <g>
      <rect x="46" y="30" width="228" height="132" rx="11" fill={url("scr")} stroke={url("rim")} strokeWidth="1.5" />
      <path d="M46 120 L110 74 L150 104 L190 70 L274 130 V151 a11 11 0 0 1 -11 11 H57 a11 11 0 0 1 -11 -11 Z" fill="#241c6c" />
      <circle cx="160" cy="92" r="25" fill={url("acc")} />
      <circle cx="160" cy="92" r="33" fill="none" stroke="#c4b5fd" strokeOpacity=".35" strokeWidth="2" />
      <path d="M152 79 L174 92 L152 105 Z" fill="#fff" />
      <rect x="62" y="146" width="196" height="4" rx="2" fill="#2d2470" />
      <rect x="62" y="146" width="92" height="4" rx="2" fill="#c4b5fd" />
      <circle cx="154" cy="148" r="5" fill="#fff" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={58 + i * 36} y="172" width="28" height="18" rx="3" fill="#1d1752" stroke="#3b3290" strokeWidth=".8" />)}
    </g>
  ),
  // Işıyan yapay zekâ çipi ve bağlantılar
  "yapay-zeka": ({ url }) => (
    <g>
      {[[160, 34], [160, 166], [86, 100], [234, 100], [104, 52], [216, 52], [104, 148], [216, 148]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M160 100 L${x} ${y}`} stroke="#6f5ce8" strokeWidth="1.6" opacity=".7" />
          <circle cx={x} cy={y} r="6" fill="#120e38" stroke={url("acc")} strokeWidth="2" />
          <circle cx={x} cy={y} r="2.2" fill="#c4b5fd" />
        </g>
      ))}
      <rect x="122" y="62" width="76" height="76" rx="14" fill="#1b1550" stroke={url("acc")} strokeWidth="2.4" />
      <rect x="138" y="78" width="44" height="44" rx="8" fill={url("acc")} opacity=".9" />
      <rect x="150" y="90" width="20" height="20" rx="4" fill="#1b1550" />
      {[0, 1, 2].map((i) => (
        <g key={i} fill="#8f7bff">
          <rect x={136 + i * 18} y="54" width="4" height="8" rx="1" /><rect x={136 + i * 18} y="138" width="4" height="8" rx="1" />
          <rect x="114" y={80 + i * 18} width="8" height="4" rx="1" /><rect x="198" y={80 + i * 18} width="8" height="4" rx="1" />
        </g>
      ))}
    </g>
  ),
  // Sunum panosu: çubuk ve pasta grafik
  "is-ve-danismanlik": ({ url }) => (
    <g>
      <rect x="44" y="28" width="232" height="140" rx="11" fill="#110e33" stroke={url("rim")} strokeWidth="1.4" />
      {line(60, 44, 70, "#c4b5fd", 5)}{line(60, 54, 46)}
      {[38, 56, 46, 74, 64].map((h, i) => <rect key={i} x={62 + i * 20} y={150 - h} width="13" height={h} rx="3" fill={i === 3 ? url("acc") : "#3a2f9a"} />)}
      <circle cx="222" cy="108" r="32" fill="none" stroke="#2a2178" strokeWidth="14" />
      <circle cx="222" cy="108" r="32" fill="none" stroke={url("acc")} strokeWidth="14" strokeDasharray="128 201" transform="rotate(-90 222 108)" />
      <circle cx="222" cy="108" r="32" fill="none" stroke="#38d6ff" strokeWidth="14" strokeDasharray="34 201" strokeDashoffset="-128" transform="rotate(-90 222 108)" />
    </g>
  ),
  // Belge sayfaları ve kalem
  "yazi-ve-icerik": ({ url }) => (
    <>
      <g transform="rotate(-7 130 104)">
        <rect x="80" y="30" width="112" height="146" rx="6" fill="#1b1550" stroke="#3b3290" />
      </g>
      <g transform="rotate(4 168 102)">
        <rect x="112" y="26" width="116" height="150" rx="6" fill={url("paper")} />
        <rect x="126" y="42" width="66" height="7" rx="2" fill="#2a1f7a" />
        {[58, 68, 78, 88, 104, 114, 124, 134, 144].map((y, i) => <rect key={y} x="126" y={y} width={[86, 80, 88, 52, 86, 74, 88, 60, 40][i]} height="3.5" rx="1.75" fill="#8f86c9" />)}
      </g>
      <g transform="rotate(38 236 120)">
        <rect x="226" y="62" width="12" height="92" rx="3" fill={url("acc")} />
        <path d="M226 154 L232 170 L238 154 Z" fill="#efeaff" />
        <rect x="226" y="62" width="12" height="12" rx="2" fill="#2a1f7a" />
      </g>
    </>
  ),
};

const ALT_SCENES: Record<string, Scene> = {
  // Sohbet robotu penceresi
  "yapay-zeka": ({ url }) => (
    <g>
      <rect x="60" y="24" width="200" height="154" rx="14" fill="#110e33" stroke={url("rim")} strokeWidth="1.4" />
      <circle cx="82" cy="45" r="10" fill={url("acc")} />
      <path d="M78 45 h8 M82 41 v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <rect x="98" y="39" width="56" height="5" rx="2.5" fill="#fff" opacity=".9" />
      {line(98, 48, 34)}
      <circle cx="244" cy="45" r="3.5" fill="#3ee0a1" />
      <rect x="76" y="66" width="112" height="26" rx="11" fill="#241c6c" />
      {line(88, 74, 84, "#d6ceff")}{line(88, 82, 56)}
      <rect x="130" y="100" width="114" height="26" rx="11" fill={url("acc")} />
      <rect x="142" y="108" width="86" height="3.5" rx="1.75" fill="#fff" opacity=".92" />
      <rect x="142" y="115" width="60" height="3.5" rx="1.75" fill="#fff" opacity=".7" />
      <rect x="76" y="134" width="64" height="20" rx="10" fill="#241c6c" />
      {[92, 104, 116].map((x, i) => <circle key={x} cx={x} cy="144" r="2.8" fill="#c4b5fd" opacity={1 - i * 0.3} />)}
      <rect x="76" y="160" width="168" height="10" rx="5" fill="#1d1752" />
      <circle cx="238" cy="165" r="3" fill="#c4b5fd" />
    </g>
  ),
  // Tarayıcı penceresi ve yanında telefon
  "web-ve-yazilim": ({ url }) => (
    <g>
      <rect x="30" y="28" width="214" height="138" rx="10" fill="#0d0b2b" stroke={url("rim")} strokeWidth="1.4" />
      <circle cx="44" cy="40" r="3" fill="#ff7a90" /><circle cx="54" cy="40" r="3" fill="#ffd166" /><circle cx="64" cy="40" r="3" fill="#3ee0a1" />
      <rect x="82" y="35" width="122" height="9" rx="4.5" fill="#1d1752" />
      <rect x="38" y="52" width="198" height="106" rx="6" fill={url("scr")} />
      <rect x="50" y="66" width="82" height="8" rx="2" fill="#fff" opacity=".92" />
      <rect x="50" y="78" width="62" height="8" rx="2" fill="#fff" opacity=".92" />
      {line(50, 92, 72)}
      <rect x="50" y="102" width="36" height="10" rx="5" fill={url("acc")} />
      <rect x="146" y="62" width="80" height="52" rx="6" fill="#3a2f9a" />
      <path d="M146 114 L172 84 L188 99 L204 86 L226 114 Z" fill="#7c5cff" />
      {[50, 108, 166].map((x) => <rect key={x} x={x} y="124" width="52" height="26" rx="4" fill="#2a2178" />)}
      <g transform="translate(226 56)">
        <rect width="64" height="120" rx="12" fill="#0d0b2b" stroke={url("rim")} strokeWidth="1.4" />
        <rect x="5" y="5" width="54" height="110" rx="8" fill={url("scr")} />
        <rect x="12" y="18" width="40" height="26" rx="4" fill="#3a2f9a" />
        <rect x="12" y="50" width="32" height="4" rx="2" fill="#fff" opacity=".9" />
        {line(12, 58, 26)}
        <rect x="12" y="94" width="40" height="11" rx="5.5" fill={url("acc")} />
      </g>
    </g>
  ),
};
