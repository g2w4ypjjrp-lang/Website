import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { offers, providerProfiles, projects, users, orders } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { acceptOfferAction, closeProjectAction, contactProviderAction, rejectOfferAction } from "@/app/actions/market";
import { PageHead } from "@/components/panel/page-head";
import { Avatar, Badge, EmptyState, Notice, Rating, VerifiedMark } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/button";
import { LEVEL_LABEL } from "@/lib/order-status";
import { fileUrl, formatTRY, timeAgo, cn } from "@/lib/utils";

export const metadata = { title: "Proje" };

export default async function ProjectOffers({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ yeni?: string; sirala?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const p = await db.query.projects.findFirst({ where: and(eq(projects.id, id), eq(projects.buyerId, user.id)) });
  if (!p) notFound();
  let rows = await db
    .select({ o: offers, pr: providerProfiles, avatarId: users.avatarId })
    .from(offers)
    .innerJoin(providerProfiles, eq(providerProfiles.userId, offers.providerId))
    .innerJoin(users, eq(users.id, offers.providerId))
    .where(eq(offers.projectId, p.id))
    .orderBy(asc(offers.createdAt));
  if (sp.sirala === "fiyat") rows = rows.sort((a, b) => a.o.priceKurus - b.o.priceKurus);
  if (sp.sirala === "sure") rows = rows.sort((a, b) => a.o.deliveryDays - b.o.deliveryDays);
  if (sp.sirala === "puan") rows = rows.sort((a, b) => b.pr.ratingAvg - a.pr.ratingAvg);
  const pendingOrder = await db.query.orders.findFirst({ where: and(eq(orders.projectId, p.id), eq(orders.status, "awaiting_payment")) });
  const prices = rows.map((r) => r.o.priceKurus);
  return (
    <>
      {sp.yeni && <Notice tone="ok" className="mb-6">Projen yayında. İlgili uzmanlar teklif gönderdiğinde bildirim alacaksın.</Notice>}
      <Link href="/panel/projeler" className="text-[13.5px] text-muted hover:text-ink">← Projelerim</Link>
      <PageHead title={p.title} sub={<>{p.offerCount} teklif · <Link href={`/projeler/${p.slug}`} className="underline underline-offset-2">İlanı görüntüle</Link></>} action={p.status === "open" ? <form action={closeProjectAction}><input type="hidden" name="projectId" value={p.id} /><Button variant="outline" size="sm">İlanı kapat</Button></form> : <Badge>Kapalı</Badge>} />
      {pendingOrder && <Notice tone="warn" className="mb-6">Bir teklifi kabul ettin ama ödeme tamamlanmadı. <Link href={`/odeme/${pendingOrder.code}`} className="font-medium underline">Ödemeye devam et</Link></Notice>}
      {rows.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-line bg-surface px-4 py-3 text-[13.5px]">
          <span className="text-muted">Teklif aralığı: <span className="num text-ink">{formatTRY(Math.min(...prices))} – {formatTRY(Math.max(...prices))}</span></span>
          <span className="ml-auto flex gap-3 text-muted">Sırala:{[["", "Geliş"], ["fiyat", "Fiyat"], ["sure", "Süre"], ["puan", "Puan"]].map(([k, l]) => <Link key={k} href={`?sirala=${k}`} className={cn((sp.sirala ?? "") === k ? "font-medium text-ink" : "hover:text-ink")}>{l}</Link>)}</span>
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState title="Henüz teklif yok" body="Teklifler genellikle ilk 24–48 saat içinde gelir. Açıklamanı ne kadar net yazarsan teklifler o kadar isabetli olur." />
      ) : (
        <div className="space-y-4">
          {rows.map(({ o, pr, avatarId }) => (
            <article key={o.id} className={cn("rounded-lg border bg-surface p-5", o.status === "accepted" ? "border-trust" : "border-line", (o.status === "rejected" || o.status === "withdrawn") && "opacity-60")}>
              <div className="flex flex-wrap items-start gap-4">
                <Avatar name={pr.displayName} src={fileUrl(avatarId)} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Link href={`/uzman/${pr.slug}`} className="font-semibold hover:underline">{pr.displayName}</Link>{pr.verifiedAt && <VerifiedMark />}<Badge>{LEVEL_LABEL[pr.level]}</Badge></div>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-[13px] text-muted"><Rating value={pr.ratingAvg} count={pr.ratingCount} /><span>{pr.completedOrders} tamamlanan iş</span><span>{timeAgo(o.createdAt)}</span></div>
                </div>
                <dl className="flex gap-6 text-right">
                  <div><dt className="text-[12px] text-muted">Fiyat</dt><dd className="num text-[20px]">{formatTRY(o.priceKurus)}</dd></div>
                  <div><dt className="text-[12px] text-muted">Süre</dt><dd className="num text-[20px]">{o.deliveryDays} gün</dd></div>
                </dl>
              </div>
              <p className="mt-4 whitespace-pre-line text-[14.5px] text-ink-2">{o.message}</p>
              {o.status === "pending" && p.status === "open" && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line-2 pt-4">
                  <form action={acceptOfferAction}><input type="hidden" name="offerId" value={o.id} /><SubmitButton size="sm" variant="trust" pendingText="Hazırlanıyor">Kabul et ve öde</SubmitButton></form>
                  <form action={contactProviderAction}><input type="hidden" name="providerId" value={o.providerId} /><Button size="sm" variant="outline">Soru sor</Button></form>
                  <form action={rejectOfferAction}><input type="hidden" name="offerId" value={o.id} /><Button size="sm" variant="ghost">Reddet</Button></form>
                </div>
              )}
              {o.status !== "pending" && <p className="mt-3 text-[13px] text-muted">{o.status === "accepted" ? "Kabul edildi" : o.status === "rejected" ? "Reddettin" : "Uzman geri çekti"}</p>}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
