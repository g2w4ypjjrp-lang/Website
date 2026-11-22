import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staticPages } from "@/db/schema";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;
/** Boş liste: sayfalar ilk istekte üretilir ve ISR ile önbelleğe alınır. */
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };
const load = (slug: string) => db.query.staticPages.findFirst({ where: eq(staticPages.slug, slug) });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  return buildMetadata({ title: p.title, description: p.seoDescription ?? p.title, path: `/sayfa/${p.slug}`, noindex: p.noindex });
}

export default async function StaticPage({ params }: Props) {
  const p = await load((await params).slug);
  if (!p) notFound();
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: p.title, path: `/sayfa/${p.slug}` }]} />
      <div className="mx-auto mt-10 max-w-[720px]">
        <h1 className="text-[36px] font-semibold sm:text-[44px]">{p.title}</h1>
        <p className="mt-3 text-[13px] text-muted">Son güncelleme: {formatDate(p.updatedAt)}</p>
        <div className="prose-ek mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
      </div>
    </div>
  );
}
