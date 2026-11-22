import { generateSitemaps } from "../haritalar/sitemap";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

/** Sitemap index — Search Console ve Bing Webmaster Tools’a bu adres bildirilir. */
export async function GET() {
  const maps = await generateSitemaps();
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps.map((m) => `  <sitemap><loc>${absoluteUrl(`/haritalar/sitemap/${m.id}.xml`)}</loc><lastmod>${now}</lastmod></sitemap>`).join("\n")}
</sitemapindex>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
