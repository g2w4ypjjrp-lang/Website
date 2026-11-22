import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolioItems } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { deletePortfolioAction } from "@/app/actions/panel";
import { PageHead } from "@/components/panel/page-head";
import { PortfolioForm } from "@/components/panel/forms";
import { fileUrl } from "@/lib/utils";

export const metadata = { title: "Portföy" };

export default async function PortfolioPage() {
  const user = await requireRole("provider");
  const items = await db.select().from(portfolioItems).where(eq(portfolioItems.providerId, user.id)).orderBy(desc(portfolioItems.createdAt));
  return (
    <>
      <PageHead title="Portföy" sub="Profilinde görünen örnek çalışmaların" />
      <PortfolioForm />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <figure key={p.id} className="rounded-lg border border-line bg-surface p-3">
            {p.imageId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(p.imageId)!} alt={p.title} className="aspect-[4/3] w-full rounded-md object-cover" loading="lazy" />
            ) : <div className="aspect-[4/3] rounded-md bg-paper-2" />}
            <figcaption className="mt-3 flex items-start justify-between gap-3">
              <span><span className="block font-medium">{p.title}</span>{p.link && <a href={p.link} target="_blank" rel="noopener nofollow" className="text-[12.5px] text-muted underline">{p.link.replace(/^https?:\/\//, "").slice(0, 40)}</a>}</span>
              <form action={deletePortfolioAction}><input type="hidden" name="id" value={p.id} /><button className="text-[13px] text-muted hover:text-bad">Sil</button></form>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
