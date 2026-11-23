import type { getCategoryTree, homeReviews, homeServiceRails, homeStories, latestPosts, listProviders, platformStats, ServiceCardData } from "@/server/queries";

/** Ana sayfa verisi: iki tema da aynı veriyi farklı düzenle gösterir. */
export type HomeData = {
  tree: Awaited<ReturnType<typeof getCategoryTree>>;
  rails: Awaited<ReturnType<typeof homeServiceRails>>;
  showcase: ServiceCardData[];
  heroItems: ServiceCardData[];
  providers: Awaited<ReturnType<typeof listProviders>>["items"];
  /** Kimliği doğrulanmış uzman ve ajansların toplam sayısı */
  verifiedTotal: number;
  stories: Awaited<ReturnType<typeof homeStories>>;
  otherReviews: Awaited<ReturnType<typeof homeReviews>>;
  posts: Awaited<ReturnType<typeof latestPosts>>;
  commission: string;
  /** Tüm vitrinlerin tekilleştirilmiş birleşimi (sekmeli süzme için) */
  pool: ServiceCardData[];
  stats: Awaited<ReturnType<typeof platformStats>>;
  /** Ana kategori slug → yayında hizmeti olan uzman sayısı */
  catCounts: Record<string, number>;
};
