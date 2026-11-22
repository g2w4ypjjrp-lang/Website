import Link from "next/link";
import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, services } from "@/db/schema";
import { AHead } from "@/components/admin/ui";
import { Badge, Notice } from "@/components/ui/primitives";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Kategoriler" };

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [rows, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select({ c: services.categoryId, n: sql<number>`count(*) filter (where ${services.status} = 'active')::int` }).from(services).groupBy(services.categoryId),
  ]);
  const roots = rows.filter((r) => !r.parentId);
  const n = (id: string) => counts.find((c) => c.c === id)?.n ?? 0;
  return (
    <>
      {sp.kaydedildi && <Notice tone="ok" className="mb-4">Kategori oluşturuldu.</Notice>}
      <AHead title="Kategoriler" sub="Alt kategoriler, kategori bazlı komisyon, SEO metinleri ve SSS" action={<Link href="/yonetim/kategoriler/yeni" className="rounded bg-ink px-3 py-1.5 text-[13px] text-white">Yeni kategori</Link>} />
      <div className="space-y-4">
        {roots.map((r) => (
          <section key={r.id} className="rounded-lg border border-line bg-surface">
            <div className="flex flex-wrap items-center gap-3 border-b border-line-2 px-4 py-3">
              <Link href={`/yonetim/kategoriler/${r.id}`} className="font-semibold hover:underline">{r.name}</Link>
              <span className="font-mono text-[12px] text-muted">/kategori/{r.slug}</span>
              {r.commissionBps != null && <Badge tone="accent">%{r.commissionBps / 100} komisyon</Badge>}
              {!r.isActive && <Badge>Pasif</Badge>}
              {r.noindex && <Badge tone="warn">noindex</Badge>}
              <Link href={`/yonetim/kategoriler/yeni?ust=${r.id}`} className="ml-auto text-[12.5px] underline">Alt kategori ekle</Link>
            </div>
            <ul className="grid gap-x-6 px-4 py-2 text-[13.5px] sm:grid-cols-2 lg:grid-cols-3">
              {rows.filter((c) => c.parentId === r.id).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-1.5"><Link href={`/yonetim/kategoriler/${c.id}`} className="hover:underline">{c.name}</Link><span className="num text-[12px] text-muted">{n(c.id)} hizmet{c.commissionBps != null ? ` · %${c.commissionBps / 100}` : ""}{!c.isActive ? " · pasif" : ""}</span></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
