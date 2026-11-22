import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, portfolioItems, providerProfiles, services, users } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { getReviews, isOnline, listServices } from "@/server/queries";
import { contactProviderAction, toggleFavoriteAction } from "@/app/actions/market";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceGrid } from "@/components/cards";
import { ReviewList } from "@/components/review-list";
import { ReportButton } from "@/components/report-button";
import { Avatar, Badge, Rating, VerifiedMark } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { IconChat, IconHeart, IconPin, IconGlobe } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { LEVEL_LABEL } from "@/lib/order-status";
import { fileUrl, formatMonthYear, truncate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const rows = await db
    .select({ p: providerProfiles, u: { id: users.id, avatarId: users.avatarId, lastSeenAt: users.lastSeenAt, createdAt: users.createdAt, status: users.status, accountType: users.accountType } })
    .from(providerProfiles)
    .innerJoin(users, eq(users.id, providerProfiles.userId))
    .where(eq(providerProfiles.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await load((await params).slug);
  if (!d) return {};
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(services).where(and(eq(services.providerId, d.p.userId), eq(services.status, "active")));
  return buildMetadata({
    title: d.p.seoTitle ?? `${d.p.displayName} — ${d.p.headline || "Dijital hizmet uzmanı"}`,
    description: d.p.seoDescription ?? truncate(d.p.bio || `${d.p.displayName}, Eksen’de ${d.p.headline} hizmeti veriyor.`, 158),
    path: `/uzman/${d.p.slug}`,
    image: fileUrl(d.u.avatarId),
    type: "profile",
    // İçeriği zayıf profilleri (hizmeti olmayan) indekslemeyerek ince içerik oluşturmaktan kaçın
    noindex: d.p.noindex || d.u.status !== "active" || n === 0,
  });
}

export default async function ProviderPage({ params }: Props) {
  const d = await load((await params).slug);
  if (!d || d.u.status !== "active") notFound();
  const user = await getCurrentUser();
  const isMe = user?.id === d.p.userId;
  if (!isMe) await db.update(providerProfiles).set({ profileViews: sql`${providerProfiles.profileViews} + 1` }).where(eq(providerProfiles.userId, d.p.userId));
  const [svc, portfolio, reviewRows, fav] = await Promise.all([
    listServices({ providerId: d.p.userId, perPage: 48, sort: "bestselling" }).then((r) => r.items),
    db.select().from(portfolioItems).where(eq(portfolioItems.providerId, d.p.userId)).orderBy(desc(portfolioItems.createdAt)),
    getReviews({ providerId: d.p.userId }, 10),
    user ? db.query.favorites.findFirst({ where: and(eq(favorites.userId, user.id), eq(favorites.targetType, "provider"), eq(favorites.targetId, d.p.userId)) }) : null,
  ]);
  const total = d.p.completedOrders + d.p.cancelledOrders;
  const success = total > 0 ? Math.round((d.p.completedOrders / total) * 100) : null;
  const path = `/uzman/${d.p.slug}`;

  return (
    <div className="container-x pt-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: { "@type": d.u.accountType === "individual" ? "Person" : "Organization", name: d.p.displayName, description: d.p.headline, url: absoluteUrl(path), ...(d.p.city ? { address: { "@type": "PostalAddress", addressLocality: d.p.city, addressCountry: "TR" } } : {}), knowsAbout: d.p.skills },
        }}
      />
      <Breadcrumbs items={[{ name: "Uzmanlar", path: "/uzmanlar" }, { name: d.p.displayName, path }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
        <aside>
          <div className="lg:sticky lg:top-[84px]">
            <Avatar name={d.p.displayName} src={fileUrl(d.u.avatarId)} size={96} online={isOnline(d.u.lastSeenAt)} />
            <h1 className="mt-4 text-[28px] font-semibold">{d.p.displayName}</h1>
            <p className="mt-1 text-[15.5px] text-ink-2">{d.p.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {d.p.verifiedAt && <VerifiedMark label="Doğrulanmış hesap" />}
              <Badge>{LEVEL_LABEL[d.p.level]}</Badge>
              {d.p.premiumUntil && d.p.premiumUntil > new Date() && <Badge tone="ink">Premium</Badge>}
              {d.u.accountType !== "individual" && <Badge>{d.u.accountType === "agency" ? "Ajans" : "Şirket"}</Badge>}
            </div>
            <dl className="mt-6 divide-y divide-line-2 border-y border-line text-[14px]">
              <Row k="Puan" v={<Rating value={d.p.ratingAvg} count={d.p.ratingCount} />} />
              <Row k="Tamamlanan iş" v={<span className="num">{d.p.completedOrders}</span>} />
              <Row k="Başarı oranı" v={success != null ? <span className="num">%{success}</span> : "—"} />
              <Row k="Yanıt süresi" v={d.p.avgResponseMinutes ? `~${Math.max(1, Math.round(d.p.avgResponseMinutes / 60))} saat` : "—"} />
              <Row k="Üyelik" v={formatMonthYear(d.u.createdAt)} />
            </dl>
            <div className="mt-4 space-y-1.5 text-[14px] text-ink-2">
              {d.p.city && <p className="flex items-center gap-2"><IconPin size={15} /> {d.p.city}</p>}
              {d.p.website && <p className="flex items-center gap-2"><IconGlobe size={15} /> <a href={d.p.website} rel="nofollow noopener" target="_blank" className="truncate underline underline-offset-2">{d.p.website.replace(/^https?:\/\//, "")}</a></p>}
              <p className="text-muted">Diller: {d.p.languages.join(", ")}</p>
            </div>
            {!isMe && (
              <div className="mt-6 flex gap-2">
                <form action={contactProviderAction} className="flex-1">
                  <input type="hidden" name="providerId" value={d.p.userId} />
                  <input type="hidden" name="back" value={path} />
                  <Button className="w-full"><IconChat size={16} /> Mesaj gönder</Button>
                </form>
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="targetType" value="provider" />
                  <input type="hidden" name="targetId" value={d.p.userId} />
                  <input type="hidden" name="back" value={path} />
                  <Button variant="outline" aria-label="Favori" aria-pressed={!!fav} className={fav ? "text-accent" : ""}><IconHeart size={16} filled={!!fav} /></Button>
                </form>
              </div>
            )}
            {isMe && <Link href="/panel/profil" className="mt-6 inline-block text-[14px] underline underline-offset-4">Profili düzenle</Link>}
            {!isMe && user && <div className="mt-4"><ReportButton targetType="user" targetId={d.p.userId} /></div>}
          </div>
        </aside>
        <div className="min-w-0">
          {d.p.bio && (
            <section>
              <h2 className="eyebrow mb-3">Hakkında</h2>
              <div className="max-w-[68ch] whitespace-pre-line text-[16px] leading-relaxed text-ink-2">{d.p.bio}</div>
            </section>
          )}
          {d.p.skills.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-1.5">{d.p.skills.map((s) => <li key={s} className="rounded-sm border border-line bg-surface px-2 py-1 text-[13px]">{s}</li>)}</ul>
          )}
          <section className="mt-12">
            <h2 className="mb-5 text-[22px] font-semibold">Hizmetler</h2>
            {svc.length ? <ServiceGrid items={svc} cols={3} /> : <p className="text-[14.5px] text-muted">Bu uzmanın şu an yayında hizmeti yok. Mesaj göndererek özel teklif isteyebilirsiniz.</p>}
          </section>
          {portfolio.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 text-[22px] font-semibold">Portföy</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {portfolio.map((p) => (
                  <figure key={p.id}>
                    {p.imageId && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fileUrl(p.imageId)!} alt={p.title} loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-md border border-line-2 object-cover" />
                    )}
                    <figcaption className="mt-2">
                      <p className="font-medium">{p.link ? <a href={p.link} target="_blank" rel="nofollow noopener" className="hover:underline">{p.title} ↗</a> : p.title}</p>
                      {p.description && <p className="text-[14px] text-muted">{p.description}</p>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
          <section className="mt-14">
            <h2 className="text-[22px] font-semibold">Değerlendirmeler</h2>
            <ReviewList rows={reviewRows} />
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-muted">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
