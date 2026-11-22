import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pagination, hasFilters, one, type SP } from "@/components/listing";
import { buildMetadata } from "@/lib/seo";
import { formatDate, cn } from "@/lib/utils";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  return buildMetadata({ title: "Rehberler ve blog", description: "Web sitesi, mobil uygulama, logo, SEO ve dijital pazarlama hizmeti alırken bilmeniz gerekenler: fiyatlar, süreçler ve kontrol listeleri.", path: "/blog", noindex: hasFilters(sp) });
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(one(sp.sayfa) ?? 1));
  const cat = one(sp.kategori);
  const per = 12;
  const where = and(eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, new Date()), cat ? eq(blogPosts.category, cat) : undefined);
  const [posts, [{ n }], cats] = await Promise.all([
    db.select().from(blogPosts).where(where).orderBy(desc(blogPosts.publishedAt)).limit(per).offset((page - 1) * per),
    db.select({ n: sql<number>`count(*)::int` }).from(blogPosts).where(where),
    db.selectDistinct({ c: blogPosts.category }).from(blogPosts).where(eq(blogPosts.status, "published")),
  ]);
  const [lead, ...rest] = posts;
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Rehberler", path: "/blog" }]} />
      <header className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
        <div>
          <h1 className="text-[38px] font-semibold sm:text-[52px]">Rehberler</h1>
          <p className="mt-2 max-w-xl text-ink-2">Dijital hizmet alırken sorulacak sorular, fiyatı belirleyen kalemler ve teslimat kontrol listeleri.</p>
        </div>
        <nav className="flex flex-wrap gap-2 text-[13.5px]">
          <Link href="/blog" className={cn("rounded-sm px-2.5 py-1", !cat ? "bg-ink text-white" : "border border-line")}>Tümü</Link>
          {cats.map(({ c }) => <Link key={c} href={`/blog?kategori=${encodeURIComponent(c)}`} className={cn("rounded-sm px-2.5 py-1", cat === c ? "bg-ink text-white" : "border border-line")}>{c}</Link>)}
        </nav>
      </header>
      {lead && (
        <article className="group relative grid gap-6 border-b border-line py-10 lg:grid-cols-[1.2fr_1fr]">
          <h2 className="text-[30px] font-semibold leading-tight sm:text-[40px]"><Link href={`/blog/${lead.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-accent group-hover:underline-offset-8">{lead.title}</Link></h2>
          <div>
            <p className="eyebrow">{lead.category} · {lead.readingMinutes} dk okuma</p>
            <p className="mt-3 text-[16.5px] text-ink-2">{lead.excerpt}</p>
            <p className="mt-4 text-[13px] text-muted">{lead.publishedAt && formatDate(lead.publishedAt)} · {lead.authorName}</p>
          </div>
        </article>
      )}
      <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <article key={p.id} className="group relative border-b border-line py-8">
            <p className="eyebrow">{p.category} · {p.readingMinutes} dk</p>
            <h2 className="mt-3 text-[20px] font-semibold"><Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">{p.title}</Link></h2>
            <p className="mt-2 line-clamp-3 text-[14.5px] text-ink-2">{p.excerpt}</p>
            <p className="mt-4 text-[12.5px] text-muted">{p.publishedAt && formatDate(p.publishedAt)}</p>
          </article>
        ))}
      </div>
      <Pagination page={page} pages={Math.max(1, Math.ceil(n / per))} base="/blog" sp={sp} />
    </div>
  );
}
