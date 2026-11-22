import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { setServiceStatusAction } from "@/app/actions/panel";
import { PageHead } from "@/components/panel/page-head";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { formatNumber, formatTRY } from "@/lib/utils";

export const metadata = { title: "Hizmetlerim" };
const ST = { draft: ["Taslak", "neutral"], pending: ["İncelemede", "warn"], active: ["Yayında", "ok"], rejected: ["Reddedildi", "bad"], paused: ["Duraklatıldı", "neutral"] } as const;

export default async function MyServices() {
  const user = await requireRole("provider");
  const rows = await db.select().from(services).where(eq(services.providerId, user.id)).orderBy(desc(services.updatedAt));
  return (
    <>
      <PageHead title="Hizmetlerim" sub="Paketlerini, fiyatlarını ve yayın durumunu yönet" action={<ButtonLink href="/panel/hizmetler/yeni" size="sm">Yeni hizmet</ButtonLink>} />
      {rows.length === 0 ? (
        <EmptyState title="İlk hizmetini oluştur" body="Hizmetini Temel, Standart ve Profesyonel olmak üzere üç pakete ayırmak müşterinin karar vermesini kolaylaştırır." action={<ButtonLink href="/panel/hizmetler/yeni">Hizmet oluştur</ButtonLink>} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <ul className="divide-y divide-line-2">
            {rows.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><Badge tone={ST[s.status][1]} dot>{ST[s.status][0]}</Badge>{s.featuredUntil && s.featuredUntil > new Date() && <Badge tone="accent">Öne çıkan</Badge>}</div>
                  <Link href={`/panel/hizmetler/${s.id}`} className="mt-1.5 block truncate font-medium hover:underline">{s.title}</Link>
                  {s.status === "rejected" && s.rejectionReason && <p className="mt-1 text-[13px] text-bad">Red nedeni: {s.rejectionReason}</p>}
                </div>
                <dl className="flex gap-6 text-[13px]">
                  <div><dt className="text-muted">Başlangıç</dt><dd className="num">{formatTRY(s.startingPriceKurus)}</dd></div>
                  <div><dt className="text-muted">Görüntülenme</dt><dd className="num">{formatNumber(s.viewCount)}</dd></div>
                  <div><dt className="text-muted">Sipariş</dt><dd className="num">{s.orderCount}</dd></div>
                </dl>
                <div className="flex items-center gap-3 text-[13px]">
                  {s.status === "active" && <Link href={`/hizmet/${s.slug}`} className="text-muted hover:text-ink">Görüntüle</Link>}
                  <Link href={`/panel/hizmetler/${s.id}`} className="font-medium hover:underline">Düzenle</Link>
                  {(s.status === "active" || s.status === "paused") && (
                    <form action={setServiceStatusAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="to" value={s.status === "active" ? "paused" : "active"} /><button className="text-muted hover:text-ink">{s.status === "active" ? "Duraklat" : "Yayına al"}</button></form>
                  )}
                  {["draft", "rejected", "paused"].includes(s.status) && (
                    <form action={setServiceStatusAction}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="to" value="delete" /><button className="text-muted hover:text-bad">Sil</button></form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
