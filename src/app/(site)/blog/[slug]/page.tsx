import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, categories } from "@/db/schema";
import { latestPosts, listServices } from "@/server/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceCard } from "@/components/cards";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { renderMarkdown, extractHeadings } from "@/lib/markdown";
import { formatDate, slugify, fileUrl } from "@/lib/utils";

export const revalidate = 600;
/** Boş liste: sayfalar ilk istekte üretilir ve ISR ile önbelleğe alınır. */
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return db.query.blogPosts.findFirst({ where: and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, new Date())) });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { robots: { index: false } };
  return buildMetadata({ title: p.seoTitle ?? p.title, description: p.seoDescription ?? p.excerpt, path: `/blog/${p.slug}`, type: "article", publishedTime: p.publishedAt?.toISOString(), image: fileUrl(p.coverId), noindex: p.noindex });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const [cat, more] = await Promise.all([p.relatedCategoryId ? db.query.categories.findFirst({ where: eq(categories.id, p.relatedCategoryId) }) : null, latestPosts(3, p.id)]);
  const svc = cat ? (await listServices({ categoryIds: [cat.id], perPage: 3 })).items : [];
  const headings = extractHeadings(p.content);
  const html = renderMarkdown(p.content).replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${slugify(t.replace(/<[^>]+>/g, ""))}">${t}</h2>`);
  const path = `/blog/${p.slug}`;
  return (
    <div className="container-x pt-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.publishedAt?.toISOString(),
          dateModified: p.updatedAt.toISOString(),
          author: { "@type": "Organization", name: p.authorName },
          publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
          mainEntityOfPage: absoluteUrl(path),
          inLanguage: "tr-TR",
        }}
      />
      <Breadcrumbs items={[{ name: "Rehberler", path: "/blog" }, { name: p.title, path }]} />
      <header className="mx-auto mt-10 max-w-[760px]">
        <p className="eyebrow">{p.category} · {p.readingMinutes} dk okuma</p>
        <h1 className="mt-4 text-[34px] font-semibold leading-[1.08] sm:text-[48px]">{p.title}</h1>
        <p className="mt-5 text-[18px] text-ink-2">{p.excerpt}</p>
        <p className="mt-6 border-t border-line pt-4 text-[13.5px] text-muted">{p.authorName} · {p.publishedAt && <time dateTime={p.publishedAt.toISOString()}>{formatDate(p.publishedAt)}</time>}</p>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,680px)_1fr]">
        <nav aria-label="İçindekiler" className="hidden lg:block">
          {headings.length > 2 && (
            <div className="sticky top-[84px] ml-auto max-w-[220px]">
              <p className="eyebrow mb-3">İçindekiler</p>
              <ol className="space-y-2 text-[13.5px]">{headings.map((h) => <li key={h}><a href={`#${slugify(h)}`} className="text-ink-2 hover:text-ink">{h}</a></li>)}</ol>
            </div>
          )}
        </nav>
        <article className="prose-ek" dangerouslySetInnerHTML={{ __html: html }} />
        <aside className="hidden lg:block">
          {cat && (
            <div className="sticky top-[84px] max-w-[260px] rounded-lg border border-line bg-surface p-5">
              <p className="text-[15px] font-semibold">{cat.name} uzmanı mı arıyorsunuz?</p>
              <p className="mt-2 text-[13.5px] text-muted">Projenizi anlatın, ilgili uzmanlar teklif göndersin.</p>
              <ButtonLink href={`/proje-olustur?kategori=${cat.slug}`} size="sm" variant="accent" className="mt-4">Teklif al</ButtonLink>
            </div>
          )}
        </aside>
      </div>
      {p.tags.length > 0 && <ul className="mx-auto mt-10 flex max-w-[680px] flex-wrap gap-1.5">{p.tags.map((t) => <li key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[12.5px] text-muted">#{t}</li>)}</ul>}
      {svc.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="mb-6 text-[22px] font-semibold">İlgili hizmetler</h2>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-3">{svc.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
        </section>
      )}
      {more.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="mb-4 text-[22px] font-semibold">Diğer rehberler</h2>
          <ul className="divide-y divide-line">{more.map((m) => <li key={m.id} className="py-4"><Link href={`/blog/${m.slug}`} className="text-[17px] font-medium hover:underline">{m.title}</Link><p className="mt-1 text-[14px] text-muted">{m.excerpt}</p></li>)}</ul>
        </section>
      )}
    </div>
  );
}
