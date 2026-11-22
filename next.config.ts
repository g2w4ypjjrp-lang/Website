import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** Arama motorlarının görmemesi gereken alanlar (giriş kontrolü ayrıca sunucu tarafında yapılır). */
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const config: NextConfig = {
  poweredByHeader: false,
  // Meta etiketleri tüm istemciler için <head> içinde üretilsin (akış yerine); tarayıcı ve denetim araçları da aynı HTML'i görür.
  htmlLimitedBots: /.*/,
  images: { unoptimized: true },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/panel/:path*", headers: noindex },
      { source: "/panel", headers: noindex },
      { source: "/yonetim/:path*", headers: noindex },
      { source: "/yonetim", headers: noindex },
      { source: "/odeme/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
  async redirects() {
    // Yönetim paneline alışılmış adreslerden ulaşılabilsin
    return [
      { source: "/admin", destination: "/yonetim", permanent: false },
      { source: "/admin/:path*", destination: "/yonetim", permanent: false },
      { source: "/yonetici", destination: "/yonetim", permanent: false },
      { source: "/admin-panel", destination: "/yonetim", permanent: false },
      { source: "/dashboard", destination: "/panel", permanent: false },
      { source: "/hesabim", destination: "/panel", permanent: false },
      { source: "/login", destination: "/giris", permanent: true },
      { source: "/register", destination: "/kayit", permanent: true },
    ];
  },
};

export default config;
