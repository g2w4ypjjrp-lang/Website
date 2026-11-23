import type { getCategoryTree, homeReviews, homeServiceRails, homeStories, latestPosts, listProviders, ServiceCardData } from "@/server/queries";

/** Ana sayfa verisi: iki tema da aynı veriyi farklı düzenle gösterir. */
export type HomeData = {
  tree: Awaited<ReturnType<typeof getCategoryTree>>;
  rails: Awaited<ReturnType<typeof homeServiceRails>>;
  showcase: ServiceCardData[];
  heroItems: ServiceCardData[];
  providers: Awaited<ReturnType<typeof listProviders>>["items"];
  stories: Awaited<ReturnType<typeof homeStories>>;
  otherReviews: Awaited<ReturnType<typeof homeReviews>>;
  posts: Awaited<ReturnType<typeof latestPosts>>;
  commission: string;
};
