import { getCategoryTree, listServices } from "@/server/queries";
import { filtersFromSP } from "@/components/listing";
import { json } from "@/server/api";

/** Web’deki filtrelerin aynısı: q, kategori, min, max, teslim, puan, seviye, paket, sehir, cevrimici, siralama, sayfa */
export async function GET(req: Request) {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const tree = await getCategoryTree();
  const flat = tree.flatMap((c) => [c, ...c.children]);
  const cat = sp.kategori ? flat.find((c) => c.slug === sp.kategori) : undefined;
  const ids = cat ? [cat.id, ...flat.filter((c) => c.parentId === cat.id).map((c) => c.id)] : undefined;
  const r = await listServices({ ...filtersFromSP(sp), categoryIds: ids, perPage: 20 });
  return json(
    {
      page: r.page,
      pages: r.pages,
      total: r.total,
      items: r.items.map((s) => ({ slug: s.slug, title: s.title, startingPrice: s.startingPriceKurus / 100, currency: "TRY", minDeliveryDays: s.minDeliveryDays, rating: s.ratingCount ? s.ratingAvg / 100 : null, ratingCount: s.ratingCount, cover: s.coverId ? `/api/files/${s.coverId}` : null, category: s.categoryName, provider: { name: s.providerName, slug: s.providerSlug, verified: !!s.providerVerified } })),
    },
    200,
    "public, max-age=60",
  );
}
