import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { offers, projects } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { withdrawOfferAction } from "@/app/actions/market";
import { PageHead } from "@/components/panel/page-head";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { formatTRY, timeAgo } from "@/lib/utils";

export const metadata = { title: "Tekliflerim" };
const ST = { pending: ["Beklemede", "warn"], accepted: ["Kabul edildi", "ok"], rejected: ["Reddedildi", "neutral"], withdrawn: ["Geri çekildi", "neutral"] } as const;

export default async function MyOffers() {
  const user = await requireRole("provider");
  const rows = await db.select({ o: offers, p: { title: projects.title, slug: projects.slug, status: projects.status } }).from(offers).innerJoin(projects, eq(projects.id, offers.projectId)).where(eq(offers.providerId, user.id)).orderBy(desc(offers.createdAt));
  return (
    <>
      <PageHead title="Tekliflerim" sub="Proje ilanlarına verdiğin teklifler" action={<ButtonLink href="/projeler" size="sm" variant="outline">Açık projeler</ButtonLink>} />
      {rows.length === 0 ? (
        <EmptyState title="Henüz teklif vermedin" body="Açık projeleri incele; işini nasıl yapacağını anlatan net teklifler daha çok kabul görür." action={<ButtonLink href="/projeler" size="sm">Projelere göz at</ButtonLink>} />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {rows.map(({ o, p }) => (
            <li key={o.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
              <div className="min-w-0 flex-1">
                <Link href={`/projeler/${p.slug}`} className="font-medium hover:underline">{p.title}</Link>
                <p className="mt-0.5 text-[13px] text-muted">{timeAgo(o.createdAt)} · {o.deliveryDays} gün</p>
              </div>
              <span className="num">{formatTRY(o.priceKurus)}</span>
              <Badge tone={ST[o.status][1]} dot>{ST[o.status][0]}</Badge>
              {o.status === "pending" && (
                <form action={withdrawOfferAction}><input type="hidden" name="offerId" value={o.id} /><button className="text-[13px] text-muted hover:text-bad">Geri çek</button></form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
