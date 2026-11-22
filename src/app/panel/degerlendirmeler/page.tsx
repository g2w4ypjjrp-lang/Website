import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews, services, users } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { replyReviewAction } from "@/app/actions/market";
import { PageHead } from "@/components/panel/page-head";
import { EmptyState } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Değerlendirmeler" };

export default async function MyReviews() {
  const user = await requireRole("provider");
  const rows = await db.select({ r: reviews, buyer: users.name, service: services.title }).from(reviews).innerJoin(users, eq(users.id, reviews.buyerId)).leftJoin(services, eq(services.id, reviews.serviceId)).where(eq(reviews.providerId, user.id)).orderBy(desc(reviews.createdAt));
  const avg = (k: "quality" | "communication" | "delivery") => (rows.length ? (rows.reduce((a, x) => a + x.r[k], 0) / rows.length).toFixed(1).replace(".", ",") : "—");
  return (
    <>
      <PageHead title="Değerlendirmeler" sub="Yalnızca tamamlanan siparişlerden gelir; silinemez, yanıtlanabilir." />
      {rows.length > 0 && (
        <dl className="mb-8 grid grid-cols-3 gap-6 border-y border-line py-5 text-[14px]">
          <div><dt className="text-muted">Kalite</dt><dd className="num text-[22px]">{avg("quality")}</dd></div>
          <div><dt className="text-muted">İletişim</dt><dd className="num text-[22px]">{avg("communication")}</dd></div>
          <div><dt className="text-muted">Zamanında teslim</dt><dd className="num text-[22px]">{avg("delivery")}</dd></div>
        </dl>
      )}
      {rows.length === 0 ? <EmptyState title="Henüz değerlendirme yok" body="Siparişi tamamlanan müşteriler değerlendirme yazabilir." /> : (
        <ul className="space-y-4">
          {rows.map(({ r, buyer, service }) => (
            <li key={r.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap justify-between gap-2 text-[13.5px]"><span className="font-medium">{buyer} · {r.rating}/5</span><span className="text-muted">{formatDate(r.createdAt)}{service ? ` · ${service}` : ""}</span></div>
              <p className="mt-2 text-[14.5px] text-ink-2">{r.comment}</p>
              {r.providerReply ? (
                <p className="mt-3 border-l-2 border-line pl-3 text-[14px]"><span className="font-medium">Yanıtın: </span>{r.providerReply}</p>
              ) : (
                <form action={replyReviewAction} className="mt-3 flex gap-2">
                  <input type="hidden" name="reviewId" value={r.id} />
                  <input name="reply" placeholder="Herkese açık yanıt yaz" className="field !py-2 text-[14px]" maxLength={1000} />
                  <SubmitButton size="sm" variant="outline">Yanıtla</SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
