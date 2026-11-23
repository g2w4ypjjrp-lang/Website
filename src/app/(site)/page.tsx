import Link from "next/link";
import type { Metadata } from "next";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { getCategoryTree, homeReviews, homeServiceRails, homeStories, latestPosts, listProviders, platformStats, rootCategoryProviderCounts } from "@/server/queries";
import { getSettings, getThemeSettings } from "@/server/settings";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { HomePremium } from "@/components/home/home-premium";
import { HomeLight } from "@/components/home/home-light";
import { HomeNeo } from "@/components/home/home-neo";
import { HomeSunrise } from "@/components/home/home-sunrise";
import type { HomeData } from "@/components/home/types";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Eksen — İşin için doğru uzmanı bul",
  absoluteTitle: true,
  description: "Web sitesi, mobil uygulama, tasarım, yazılım ve dijital pazarlama hizmetleri için uzmanları keşfedin, teklifleri karşılaştırın. Ödemeniz teslimatı onaylayana kadar güvende.",
  path: "/",
});

export default async function HomePage() {
  const [tree, rails, providers, reviews, posts, settings, stories, { theme }, stats, catCounts] = await Promise.all([
    getCategoryTree(),
    homeServiceRails(),
    listProviders({ verifiedOnly: true, limit: 6 }),
    homeReviews(),
    latestPosts(3),
    getSettings(),
    homeStories(),
    getThemeSettings(),
    platformStats(),
    rootCategoryProviderCounts(),
  ]);
  const banner = await db.query.banners.findFirst({ where: and(eq(banners.placement, "home_top"), eq(banners.isActive, true), or(isNull(banners.endsAt), gt(banners.endsAt, new Date()))) });
  const showcase = rails.bestselling.length >= 4 ? rails.bestselling : rails.newest;
  // Başarı hikâyesi olarak gösterilen yorum, değerlendirmelerde tekrar edilmez
  const storyIds = new Set(stories.map((st) => st.r.id));
  const pool = [...rails.featured, ...rails.bestselling, ...rails.newest].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i);
  const d: HomeData = {
    tree,
    pool,
    stats,
    catCounts,
    rails,
    showcase,
    heroItems: [...rails.featured, ...rails.bestselling, ...rails.newest].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).slice(0, 4),
    providers: providers.items,
    stories,
    otherReviews: reviews.filter(({ r }) => !storyIds.has(r.id)),
    posts,
    commission: (settings.commissionBps / 100).toLocaleString("tr-TR"),
  };

  return (
    <>
      <JsonLd data={[ld.organization(), ld.website()]} />
      {banner && (
        <div className="border-b border-line bg-ink text-white">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-2.5 text-[13.5px]">
            <p><span className="font-medium">{banner.title}</span>{banner.body && <span className="text-white/70"> — {banner.body}</span>}{banner.isSponsored && <span className="ml-2 text-[11px] font-medium uppercase tracking-wider text-white/50">Sponsorlu</span>}</p>
            {banner.href && <Link href={banner.href} className="font-medium underline decoration-accent-bright underline-offset-4">{banner.ctaLabel ?? "İncele"}</Link>}
          </div>
        </div>
      )}
      {theme === "light" ? <HomeLight d={d} /> : theme === "neo" ? <HomeNeo d={d} /> : theme === "sunrise" ? <HomeSunrise d={d} /> : <HomePremium d={d} />}
    </>
  );
}
