import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import { site } from "@/lib/site";
import { SWRegister } from "@/components/sw-register";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Dijital hizmet pazaryeri`, template: `%s | ${site.name}` },
  description: "Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetlerini doğrulanmış uzmanlardan güvenli ödemeyle alın.",
  applicationName: site.name,
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // LCP metni için kritik yazı tipleri önceden yüklenir (Türkçe ğ, ş, ı karakterleri latin-ext alt kümesinde)
  const fonts = ["inter-latin-var", "inter-latin-ext-var"].map((f) => `/fonts/${f}.woff2`);
  return (
    <html lang="tr">
      <head>
        {fonts.map((f) => (
          <link key={f} rel="preload" href={f} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body className="min-h-dvh">
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
