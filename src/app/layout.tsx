import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/schibsted-grotesk/500.css";
import "@fontsource/schibsted-grotesk/600.css";
import "@fontsource/schibsted-grotesk/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { site } from "@/lib/site";
import plexLatin from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2";
import plexLatinExt from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-ext-400-normal.woff2";
import displayLatin from "@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-600-normal.woff2";

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
  const fonts = [plexLatin, plexLatinExt, displayLatin].map((f) => (typeof f === "string" ? f : (f as { src: string }).src));
  return (
    <html lang="tr">
      <head>
        {fonts.map((f) => (
          <link key={f} rel="preload" href={f} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
