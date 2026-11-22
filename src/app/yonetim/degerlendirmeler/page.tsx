import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, providerProfiles, reviews, users } from "@/db/schema";
import { adminReviewAction } from "@/app/actions/admin";
import { AHead, Tabs } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Değerlendirmeler" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireAdmin();
  const { f = "tumu" } = await searchParams;
  const rows = await db
    .select({ r: reviews, buyer: users.name, provider: providerProfiles.displayName, code: orders.code, title: orders.title })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.buyerId))
    .innerJoin(providerProfiles, eq(providerProfiles.userId, reviews.providerId))
    .innerJoin(orders, eq(orders.id, reviews.orderId))
    .where(f === "hikaye" ? eq(reviews.isFeatured, true) : f === "gizli" ? eq(reviews.isHidden, true) : undefined)
    .orderBy(desc(reviews.createdAt))
    .limit(200);
  return (
    <>
      <AHead title="Değerlendirmeler ve başarı hikâyeleri" sub="Değerlendirmeler yalnızca tamamlanan siparişlerden gelir ve düzenlenemez. Kural ihlali içerenler gizlenebilir; güçlü olanlar ana sayfada başarı hikâyesi olarak gösterilebilir." />
      <Tabs current={`/yonetim/degerlendirmeler?f=${f}`} items={[["/yonetim/degerlendirmeler?f=tumu", "Tümü"], ["/yonetim/degerlendirmeler?f=hikaye", "Başarı hikâyeleri"], ["/yonetim/degerlendirmeler?f=gizli", "Gizlenenler"]]} />
      {rows.length === 0 && <p className="rounded-lg border border-dashed border-line p-8 text-center text-[14px] text-muted">Kayıt yok.</p>}
      <div className="space-y-3">
        {rows.map(({ r, buyer, provider, code, title }) => (
          <article key={r.id} className="rounded-lg border border-line bg-surface p-4 text-[14px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{r.rating}/5</span>
              <span className="text-muted">{buyer} → {provider}</span>
              <Link href={`/panel/siparisler/${code}`} className="num text-[12.5px] underline">{code}</Link>
              {r.isFeatured && <Badge tone="accent">Başarı hikâyesi</Badge>}
              {r.isHidden && <Badge tone="bad">Gizli</Badge>}
              <span className="ml-auto text-[12.5px] text-muted">{formatDate(r.createdAt)}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted">{title}</p>
            <p className="mt-2 text-ink-2">{r.comment}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-2 pt-3 text-[13px]">
              {!r.isHidden && (r.isFeatured ? (
                <form action={adminReviewAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="unfeature" /><button className="underline">Hikâyeden çıkar</button></form>
              ) : (
                <form action={adminReviewAction} className="flex gap-2"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="feature" /><input name="storyTitle" placeholder="Hikâye başlığı, ör. “3 haftada çok dilli otel sitesi”" className="field !w-80 !py-1 text-[13px]" /><button className="rounded bg-ink px-3 text-white">Başarı hikâyesi yap</button></form>
              ))}
              <form action={adminReviewAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value={r.isHidden ? "show" : "hide"} /><button className={r.isHidden ? "underline" : "text-bad underline"}>{r.isHidden ? "Yeniden göster" : "Gizle"}</button></form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
