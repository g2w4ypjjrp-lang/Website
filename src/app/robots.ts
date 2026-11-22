import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/yonetim", "/api/", "/odeme", "/ara", "/giris", "/kayit", "/*?*siralama=", "/*?*min="] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
