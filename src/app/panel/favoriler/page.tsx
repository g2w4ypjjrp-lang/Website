import { eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { listProviders, listServices } from "@/server/queries";
import { PageHead } from "@/components/panel/page-head";
import { ServiceCard, ProviderRow } from "@/components/cards";
import { EmptyState } from "@/components/ui/primitives";

export const metadata = { title: "Favoriler" };

export default async function Favorites() {
  const user = await requireUser();
  const favs = await db.select().from(favorites).where(eq(favorites.userId, user.id));
  const sIds = favs.filter((f) => f.targetType === "service").map((f) => f.targetId);
  const pIds = favs.filter((f) => f.targetType === "provider").map((f) => f.targetId);
  const [svc, provs] = await Promise.all([
    sIds.length ? listServices({ ids: sIds, perPage: 100 }).then((r) => r.items) : [],
    pIds.length ? listProviders({ ids: pIds, limit: 200 }).then((r) => r.items) : [],
  ]);
  return (
    <>
      <PageHead title="Favoriler" sub="Kaydettiğin hizmetler ve uzmanlar" />
      {svc.length === 0 && provs.length === 0 && <EmptyState title="Favorin yok" body="Hizmet ve uzman sayfalarındaki kalp simgesiyle kaydedebilirsin." />}
      {svc.length > 0 && <section><h2 className="mb-4 text-[18px] font-semibold">Hizmetler</h2><div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{svc.map((s) => <ServiceCard key={s.id} s={s} />)}</div></section>}
      {provs.length > 0 && <section className="mt-10"><h2 className="mb-2 text-[18px] font-semibold">Uzmanlar</h2><div className="divide-y divide-line border-y border-line">{provs.map((p) => <ProviderRow key={p.slug} p={p} />)}</div></section>}
    </>
  );
}
