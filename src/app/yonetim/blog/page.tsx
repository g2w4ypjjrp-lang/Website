import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { AHead, Table } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Blog" };

export default async function AdminBlog() {
  await requireAdmin();
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt));
  return (
    <>
      <AHead title="Blog" sub="Taslak, planlanmış ve yayındaki yazılar" action={<Link href="/yonetim/blog/yeni" className="rounded bg-ink px-3 py-1.5 text-[13px] text-white">Yeni yazı</Link>} />
      <Table head={["Başlık", "Kategori", "Durum", "Yayın", "Okuma"]}>
        {rows.map((p) => (
          <tr key={p.id}>
            <td className="px-3 py-2.5"><Link href={`/yonetim/blog/${p.id}`} className="font-medium hover:underline">{p.title}</Link><span className="block font-mono text-[12px] text-muted">/blog/{p.slug}</span></td>
            <td className="px-3 py-2.5">{p.category}</td>
            <td className="px-3 py-2.5"><Badge tone={p.status === "published" ? "ok" : p.status === "scheduled" ? "info" : "neutral"}>{p.status === "published" ? "Yayında" : p.status === "scheduled" ? "Planlandı" : "Taslak"}</Badge>{p.noindex && <Badge tone="warn" className="ml-1">noindex</Badge>}</td>
            <td className="px-3 py-2.5 text-muted">{p.publishedAt ? formatDateTime(p.publishedAt) : "—"}</td>
            <td className="px-3 py-2.5">{p.readingMinutes} dk</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
