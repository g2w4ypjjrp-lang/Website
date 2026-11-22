import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryTree } from "@/server/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Tüm hizmet kategorileri", description: "Web, mobil, tasarım, dijital pazarlama, video ve yapay zekâ alanlarındaki tüm dijital hizmet kategorileri.", path: "/kategoriler" });

export default async function CategoriesPage() {
  const tree = await getCategoryTree();
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Kategoriler", path: "/kategoriler" }]} />
      <h1 className="mt-6 text-[36px] font-semibold sm:text-[44px]">Tüm hizmet kategorileri</h1>
      <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {tree.map((c, i) => (
          <section key={c.id} className="border-t border-ink pt-4">
            <p className="num text-[12px] text-faint">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 text-[22px] font-semibold"><Link href={`/kategori/${c.slug}`} className="hover:text-accent-strong">{c.name}</Link></h2>
            <p className="mt-1 text-[14px] text-muted">{c.shortDescription}</p>
            <ul className="mt-4 space-y-1.5">
              {c.children.map((s) => (
                <li key={s.id}><Link href={`/kategori/${s.slug}`} className="text-[14.5px] text-ink-2 hover:text-ink hover:underline">{s.name}</Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
