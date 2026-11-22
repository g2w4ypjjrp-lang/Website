import type { SVGProps } from "react";

/**
 * Tek bir çizgi diline sahip, kendi çizdiğimiz küçük ikon seti (16px ızgara, 1.5 çizgi).
 * Yalnızca arayüzde işlevi olan yerlerde kullanılır; dekor amaçlı ikon yok.
 */
type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconSearch = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
);
export const IconArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);
export const IconArrowUpRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M5 11 11 5M6 5h5v5" /></svg>
);
export const IconChevronDown = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m4 6 4 4 4-4" /></svg>
);
export const IconChevronRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m6 4 4 4-4 4" /></svg>
);
export const IconChevronLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m10 4-4 4 4 4" /></svg>
);
export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m3.5 8.5 3 3 6-7" /></svg>
);
export const IconX = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m4 4 8 8M12 4l-8 8" /></svg>
);
export const IconPlus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8 3v10M3 8h10" /></svg>
);
export const IconMenu = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 5h11M2.5 11h11" /></svg>
);
export const IconShield = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8 1.8 13 3.6v4c0 3.1-2.1 5.4-5 6.6-2.9-1.2-5-3.5-5-6.6v-4L8 1.8Z" /><path d="m5.8 8 1.6 1.6 2.9-3.1" /></svg>
);
export const IconClock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="8" cy="8" r="5.8" /><path d="M8 4.8V8l2.2 1.4" /></svg>
);
export const IconStar = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><path d="m8 1.9 1.8 3.8 4.1.5-3 2.8.8 4.1L8 11.1l-3.7 2 .8-4.1-3-2.8 4.1-.5L8 1.9Z" /></svg>
);
export const IconChat = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2v-7Z" /></svg>
);
export const IconBell = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 11V7a4 4 0 0 1 8 0v4l1 1.2H3L4 11ZM6.5 13.8a1.6 1.6 0 0 0 3 0" /></svg>
);
export const IconFile = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 1.8h5l3 3v9.4H4V1.8Z" /><path d="M9 1.8v3h3" /></svg>
);
export const IconPaperclip = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="m13 7.5-5.2 5.2a3 3 0 0 1-4.3-4.3l5.6-5.6a2 2 0 0 1 2.9 2.9L6.4 11.3a1 1 0 0 1-1.4-1.4l4.9-4.9" /></svg>
);
export const IconHeart = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><path d="M8 13.4S2.3 10.2 2.3 6.1A2.9 2.9 0 0 1 8 4.8a2.9 2.9 0 0 1 5.7 1.3c0 4.1-5.7 7.3-5.7 7.3Z" /></svg>
);
export const IconUser = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="8" cy="5.5" r="2.8" /><path d="M2.8 14c.6-2.6 2.7-4.2 5.2-4.2s4.6 1.6 5.2 4.2" /></svg>
);
export const IconHome = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 7 8 2.5 13.5 7v6.5h-3.8V9.8H6.3v3.7H2.5V7Z" /></svg>
);
export const IconGrid = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 2.5h4.3v4.3H2.5zM9.2 2.5h4.3v4.3H9.2zM2.5 9.2h4.3v4.3H2.5zM9.2 9.2h4.3v4.3H9.2z" /></svg>
);
export const IconBriefcase = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2 5h12v8H2zM5.5 5V3h5v2M2 8.5h12" /></svg>
);
export const IconWallet = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 4h10v9h-10zM2.5 4l8-2v2M10 8.5h2.5" /></svg>
);
export const IconSettings = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="8" cy="8" r="2" /><path d="M8 1.8v1.7M8 12.5v1.7M14.2 8h-1.7M3.5 8H1.8M12.4 3.6l-1.2 1.2M4.8 11.2l-1.2 1.2M12.4 12.4l-1.2-1.2M4.8 4.8 3.6 3.6" /></svg>
);
export const IconLogout = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 2.5H3v11h3M10 5l3 3-3 3M13 8H6.5" /></svg>
);
export const IconUpload = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8 10.5V2.5M4.8 5.6 8 2.5l3.2 3.1M2.5 10v3.5h11V10" /></svg>
);
export const IconLayers = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8 2 14 5 8 8 2 5l6-3ZM2 8l6 3 6-3M2 11l6 3 6-3" /></svg>
);
export const IconChart = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M2.5 13.5h11M4.5 11V7.5M8 11V4M11.5 11V9" /></svg>
);
export const IconFlag = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3.5 14V2.5M3.5 3h8l-1.5 3 1.5 3h-8" /></svg>
);
export const IconSend = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M14 2 7 9M14 2l-4.5 12L7 9 2 6.5 14 2Z" /></svg>
);
export const IconEye = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" /><circle cx="8" cy="8" r="2" /></svg>
);
export const IconLock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
);
export const IconPin = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M8 14.2s4.5-4.1 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.6 4.5 7.7 4.5 7.7Z" /><circle cx="8" cy="6.5" r="1.6" /></svg>
);
export const IconRefresh = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M13 3v3.2H9.8M3 13V9.8h3.2" /><path d="M12.6 6.2A5 5 0 0 0 3.4 6.6M3.4 9.8a5 5 0 0 0 9.2.4" /></svg>
);
export const IconDoc = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3.5 2h9v12h-9zM6 5h4M6 8h4M6 11h2.5" /></svg>
);
export const IconGlobe = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c1.8 1.8 2.5 3.8 2.5 6S9.8 12.2 8 14C6.2 12.2 5.5 10.2 5.5 8S6.2 3.8 8 2Z" /></svg>
);
