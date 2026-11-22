import { getServiceBySlug } from "@/server/queries";
import { apiError, json } from "@/server/api";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const d = await getServiceBySlug((await params).slug);
  if (!d || d.s.status !== "active") return apiError(404, "Hizmet bulunamadı.");
  return json(
    {
      slug: d.s.slug,
      title: d.s.title,
      summary: d.s.summary,
      description: d.s.description,
      tags: d.s.tags,
      faqs: d.s.faqs,
      extras: d.s.extras.map((e) => ({ id: e.id, title: e.title, price: e.priceKurus / 100, days: e.days })),
      packages: d.packages.map((p) => ({ tier: p.tier, name: p.name, price: p.priceKurus / 100, deliveryDays: p.deliveryDays, revisions: p.revisions, features: p.features })),
      category: { slug: d.c.slug, name: d.c.name },
      provider: { slug: d.p.slug, name: d.p.displayName, headline: d.p.headline, verified: !!d.p.verifiedAt, completedOrders: d.p.completedOrders },
      rating: d.s.ratingCount ? d.s.ratingAvg / 100 : null,
      ratingCount: d.s.ratingCount,
    },
    200,
    "public, max-age=60",
  );
}
