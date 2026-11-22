import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, tickets, users } from "@/db/schema";
import { AHead, Tabs } from "@/components/admin/ui";
import { TicketResolver } from "@/components/admin/ticket-resolver";
import { Badge } from "@/components/ui/primitives";
import { formatDateTime, formatTRY } from "@/lib/utils";

export const metadata = { title: "İade ve şikâyetler" };
const TYPE = { refund: ["İade talebi", "bad"], dispute: ["Uyuşmazlık", "warn"], complaint: ["Şikâyet", "info"] } as const;

export default async function AdminTickets({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const { durum = "open" } = await searchParams;
  const rows = await db
    .select({ t: tickets, opener: users.name, code: orders.code, total: orders.totalKurus, orderStatus: orders.status })
    .from(tickets)
    .innerJoin(users, eq(users.id, tickets.openedById))
    .leftJoin(orders, eq(orders.id, tickets.orderId))
    .where(durum === "open" ? eq(tickets.status, "open") : sql`${tickets.status} <> 'open'`)
    .orderBy(desc(tickets.createdAt))
    .limit(200);
  return (
    <>
      <AHead title="İade, uyuşmazlık ve şikâyetler" sub="Karar vermeden önce sipariş sohbetini ve teslim dosyalarını inceleyin. Her karar denetim kaydına yazılır." />
      <Tabs current={`/yonetim/talepler?durum=${durum}`} items={[["/yonetim/talepler?durum=open", "Açık"], ["/yonetim/talepler?durum=closed", "Sonuçlanan"]]} />
      {rows.length === 0 && <p className="rounded-lg border border-dashed border-line p-8 text-center text-[14px] text-muted">Kayıt yok.</p>}
      <div className="space-y-3">
        {rows.map(({ t, opener, code, total }) => (
          <article key={t.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={TYPE[t.type][1]}>{TYPE[t.type][0]}</Badge>
              <span className="font-medium">{t.reason}</span>
              {code && <Link href={`/panel/siparisler/${code}`} className="num text-[13px] underline">{code}</Link>}
              {total != null && <span className="num text-[13px] text-muted">{formatTRY(total)}</span>}
              {t.targetType && <span className="text-[12.5px] text-muted">Hedef: {t.targetType} {t.targetType === "user" ? <Link href={`/yonetim/kullanicilar?q=`} className="underline">{t.targetId?.slice(0, 8)}</Link> : t.targetId?.slice(0, 8)}</span>}
              <span className="ml-auto text-[12.5px] text-muted">{opener} · {formatDateTime(t.createdAt)}</span>
            </div>
            {t.details && <p className="mt-2 whitespace-pre-line text-[14px] text-ink-2">{t.details}</p>}
            {t.status === "open" ? <TicketResolver id={t.id} type={t.type} hasOrder={!!t.orderId} /> : <p className="mt-2 text-[13px] text-muted">Sonuç: {t.status} — {t.resolution}</p>}
          </article>
        ))}
      </div>
    </>
  );
}
