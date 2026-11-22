import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { PageHead } from "@/components/panel/page-head";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { formatTRY, timeAgo } from "@/lib/utils";

export const metadata = { title: "Projelerim" };

export default async function MyProjects() {
  const user = await requireUser();
  const rows = await db.select().from(projects).where(eq(projects.buyerId, user.id)).orderBy(desc(projects.createdAt));
  return (
    <>
      <PageHead title="Projelerim" sub="Yayınladığın projeler ve gelen teklifler" action={<ButtonLink href="/proje-olustur" size="sm" variant="accent">Proje oluştur</ButtonLink>} />
      {rows.length === 0 ? (
        <EmptyState title="Henüz proje yok" body="İşini anlat, uzmanlar sana fiyat ve süre teklifi göndersin." action={<ButtonLink href="/proje-olustur">Proje oluştur</ButtonLink>} />
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/panel/projeler/${p.id}`} className="flex flex-wrap items-center gap-4 px-4 py-4 hover:bg-paper/60">
                <span className="min-w-0 flex-1"><span className="block font-medium">{p.title}</span><span className="text-[13px] text-muted">{timeAgo(p.createdAt)} · bütçe {p.budgetMaxKurus ? formatTRY(p.budgetMaxKurus) : "—"}</span></span>
                <span className="num text-[14px]">{p.offerCount} teklif</span>
                <Badge tone={p.status === "open" ? "ok" : "neutral"} dot>{p.status === "open" ? "Açık" : p.status === "in_progress" ? "Siparişe dönüştü" : "Kapalı"}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
