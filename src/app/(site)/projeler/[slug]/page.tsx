import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, offers, projects, users } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OfferForm } from "@/components/forms/offer-form";
import { Badge, Notice } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { IconFile } from "@/components/icons";
import { buildMetadata } from "@/lib/seo";
import { formatDate, formatTRY, timeAgo, truncate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };
const load = (slug: string) => db.query.projects.findFirst({ where: eq(projects.slug, slug) });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  // Proje ilanları kısa ömürlü ve müşteri içeriği olduğundan indekslenmez
  return buildMetadata({ title: p.title, description: truncate(p.description, 155), path: `/projeler/${p.slug}`, noindex: true });
}

export default async function ProjectPage({ params }: Props) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const user = await getCurrentUser();
  const [cat, buyer, mine] = await Promise.all([
    db.query.categories.findFirst({ where: eq(categories.id, p.categoryId) }),
    db.query.users.findFirst({ where: eq(users.id, p.buyerId), columns: { name: true, createdAt: true } }),
    user?.role === "provider" ? db.query.offers.findFirst({ where: and(eq(offers.projectId, p.id), eq(offers.providerId, user.id)) }) : null,
  ]);
  const isOwner = user?.id === p.buyerId;
  if (p.status !== "open" && !isOwner && !mine && user?.role !== "admin") notFound();
  const canSeeFiles = !!user && (isOwner || user.role === "admin" || user.role === "provider");
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Proje ilanları", path: "/projeler" }, { name: truncate(p.title, 40), path: `/projeler/${p.slug}` }]} />
      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            {cat && <Badge>{cat.name}</Badge>}
            <Badge tone={p.status === "open" ? "ok" : "neutral"} dot>{p.status === "open" ? "Teklif kabul ediyor" : "Kapandı"}</Badge>
          </div>
          <h1 className="mt-4 text-[28px] font-semibold sm:text-[36px]">{p.title}</h1>
          <dl className="mt-6 grid grid-cols-2 gap-6 border-y border-line py-5 text-[14px] sm:grid-cols-4">
            <div><dt className="text-muted">Bütçe</dt><dd className="num mt-1 text-[16px]">{p.budgetMaxKurus ? `${p.budgetMinKurus ? formatTRY(p.budgetMinKurus) + " – " : ""}${formatTRY(p.budgetMaxKurus)}` : "Belirtilmedi"}</dd></div>
            <div><dt className="text-muted">Teslim tarihi</dt><dd className="mt-1">{p.deadline ? formatDate(p.deadline) : "Esnek"}</dd></div>
            <div><dt className="text-muted">Teklif</dt><dd className="num mt-1">{p.offerCount}</dd></div>
            <div><dt className="text-muted">Yayınlandı</dt><dd className="mt-1">{timeAgo(p.createdAt)}</dd></div>
          </dl>
          <div className="mt-8 whitespace-pre-line text-[16px] leading-relaxed text-ink-2">{p.description}</div>
          {p.extraInfo && <div className="mt-6 rounded-md bg-paper-2 p-4 text-[14.5px] text-ink-2"><p className="mb-1 font-medium text-ink">Ek bilgiler</p><p className="whitespace-pre-line">{p.extraInfo}</p></div>}
          {p.attachments.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-[13.5px] font-medium">Ekler</p>
              {canSeeFiles ? (
                <ul className="space-y-1.5">{p.attachments.map((a) => <li key={a.id}><a href={`/api/files/${a.id}`} className="inline-flex items-center gap-2 text-[14px] underline underline-offset-2"><IconFile size={15} /> {a.name}</a></li>)}</ul>
              ) : (
                <p className="text-[13.5px] text-muted">{p.attachments.length} dosya — görmek için uzman hesabıyla giriş yapın.</p>
              )}
            </div>
          )}
          <p className="mt-8 text-[13px] text-muted">Proje sahibi: {buyer?.name.split(" ")[0]} · {buyer && `${new Date(buyer.createdAt).getFullYear()} yılından beri üye`}</p>
        </article>
        <aside>
          <div className="sticky top-[84px] rounded-lg border border-line bg-surface p-5">
            {isOwner ? (
              <>
                <p className="font-semibold">Bu sizin projeniz</p>
                <p className="mt-1 text-[14px] text-muted">Gelen teklifleri panelinizden karşılaştırabilirsiniz.</p>
                <ButtonLink href={`/panel/projeler/${p.id}`} className="mt-4 w-full">Teklifleri gör ({p.offerCount})</ButtonLink>
              </>
            ) : !user ? (
              <>
                <p className="font-semibold">Bu projeye teklif verin</p>
                <p className="mt-1 text-[14px] text-muted">Teklif vermek için uzman hesabıyla giriş yapın.</p>
                <ButtonLink href={`/giris?sonra=/projeler/${p.slug}`} className="mt-4 w-full">Giriş yap</ButtonLink>
                <Link href="/kayit?rol=uzman" className="mt-3 block text-center text-[13.5px] underline underline-offset-2">Uzman olarak kaydol</Link>
              </>
            ) : user.role !== "provider" ? (
              <Notice tone="info">Teklif verebilmek için uzman hesabı gerekir.</Notice>
            ) : p.status !== "open" ? (
              <Notice tone="info">Bu proje yeni teklif kabul etmiyor.</Notice>
            ) : (
              <>
                <p className="mb-4 font-semibold">{mine ? "Teklifinizi güncelleyin" : "Teklif verin"}</p>
                {mine && mine.status !== "pending" ? <Notice tone="info">Teklifinizin durumu: {mine.status === "accepted" ? "kabul edildi" : mine.status === "rejected" ? "reddedildi" : "geri çekildi"}</Notice> : <OfferForm projectId={p.id} initial={mine ? { price: mine.priceKurus / 100, days: mine.deliveryDays, message: mine.message } : undefined} />}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
