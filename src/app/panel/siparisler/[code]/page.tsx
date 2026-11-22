import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, orderEvents, orders, providerProfiles, reviews, services, users } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { allowedActions } from "@/server/orders";
import { loadMessages } from "@/server/conversation-data";
import { markRead } from "@/server/messaging";
import { Chat } from "@/components/panel/chat";
import { StatusBadge } from "@/components/panel/order-bits";
import { OrderActions, ReviewForm } from "@/components/panel/order-actions";
import { Notice } from "@/components/ui/primitives";
import { ORDER_STATUS, ORDER_STEPS, TIER_LABEL } from "@/lib/order-status";
import { formatDate, formatDateTime, formatTRY, cn } from "@/lib/utils";

export const metadata = { title: "Sipariş detayı" };

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ odeme?: string }> }) {
  const [{ code }, sp] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  const o = await db.query.orders.findFirst({ where: eq(orders.code, code) });
  if (!o) notFound();
  const as = o.buyerId === user.id ? "buyer" : o.providerId === user.id ? "provider" : user.role === "admin" ? "admin" : null;
  if (!as) notFound();
  const [conv, events, buyer, provider, svc, review] = await Promise.all([
    db.query.conversations.findFirst({ where: eq(conversations.orderId, o.id) }),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, o.id)).orderBy(asc(orderEvents.createdAt)),
    db.query.users.findFirst({ where: eq(users.id, o.buyerId), columns: { name: true } }),
    db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, o.providerId), columns: { displayName: true, slug: true } }),
    o.serviceId ? db.query.services.findFirst({ where: eq(services.id, o.serviceId), columns: { slug: true } }) : null,
    db.query.reviews.findFirst({ where: eq(reviews.orderId, o.id) }),
  ]);
  if (conv && as !== "admin") await markRead(user.id, conv.id);
  const msgs = conv ? await loadMessages(conv.id) : [];
  const actions = as === "admin" ? [] : allowedActions(o, as);
  const stepIndex = ORDER_STEPS.findIndex((s) => s.key.includes(o.status));
  const otherName = as === "buyer" ? provider?.displayName ?? "Uzman" : buyer?.name ?? "Müşteri";
  const late = o.dueAt && !o.deliveredAt && new Date(o.dueAt) < new Date() && ["in_progress", "awaiting_delivery"].includes(o.status);

  return (
    <>
      {sp.odeme === "basarili" && <Notice tone="ok" className="mb-6">Ödemeniz alındı. Tutar güvenli havuz hesabında; uzman bilgilendirildi.</Notice>}
      <div className="mb-6 mt-4 lg:mt-0">
        <Link href="/panel/siparisler" className="text-[13.5px] text-muted hover:text-ink">← Siparişler</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold sm:text-[28px]">{o.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-muted">
              <span className="num text-ink">{o.code}</span>
              <span>{as === "buyer" ? <>Uzman: <Link href={`/uzman/${provider?.slug}`} className="underline underline-offset-2">{provider?.displayName}</Link></> : <>Müşteri: {buyer?.name}</>}</span>
              <span>{formatDate(o.createdAt)}</span>
            </p>
          </div>
          <StatusBadge status={o.status} />
        </div>
      </div>

      {o.status !== "cancelled" && stepIndex >= 0 && (
        <ol className="mb-8 grid grid-cols-5 gap-1" aria-label="Sipariş ilerlemesi">
          {ORDER_STEPS.map((s, i) => (
            <li key={s.label}>
              <div className={cn("h-1 rounded-full", i < stepIndex ? "bg-ink" : i === stepIndex ? "bg-accent" : "bg-line")} />
              <p className={cn("mt-2 text-[12px]", i <= stepIndex ? "text-ink" : "text-faint")}>{s.label}</p>
            </li>
          ))}
        </ol>
      )}
      {late && <Notice tone="warn" className="mb-6">Teslim tarihi geçti. {as === "buyer" ? "Uzmana mesaj gönderebilir ya da iade talebi oluşturabilirsiniz." : "Lütfen müşteriyi bilgilendirin ve teslimatı tamamlayın."}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {conv ? (
            <Chat conversationId={conv.id} meId={user.id} initial={msgs} otherName={otherName} className="h-[70vh] max-h-[720px]" disabledReason={as === "admin" ? "Yönetici görünümü — mesaj gönderilemez." : o.status === "cancelled" ? "Sipariş iptal edildiği için sohbet kapalı." : undefined} />
          ) : (
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="font-medium">Ödeme bekleniyor</p>
              <p className="mt-1 text-[14px] text-muted">Ödeme tamamlandığında sipariş sohbeti açılır ve uzman bilgilendirilir.</p>
              {as === "buyer" && <Link href={`/odeme/${o.code}`} className="mt-4 inline-block rounded-md bg-ink px-4 py-2 text-[14px] font-medium text-white">Ödemeye geç</Link>}
            </div>
          )}
          {as === "buyer" && o.status === "completed" && !review && <ReviewForm orderId={o.id} />}
          {review && (
            <div className="rounded-lg border border-line bg-surface p-5 text-[14px]">
              <p className="font-medium">Değerlendirme: {review.rating}/5</p>
              <p className="mt-1 text-ink-2">{review.comment}</p>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          {actions.length > 0 && <OrderActions code={o.code} actions={actions} as={as as "buyer" | "provider"} revisionsLeft={o.revisionsAllowed - o.revisionsUsed} />}
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold">Sipariş bilgileri</h2>
            <dl className="mt-3 space-y-2 text-[13.5px]">
              {o.tier && <Row k="Paket" v={`${TIER_LABEL[o.tier]}${svc ? "" : ""}`} />}
              <Row k="Teslim süresi" v={`${o.deliveryDays} gün`} />
              <Row k="Son teslim" v={o.dueAt ? formatDate(o.dueAt) : "İş başlayınca belirlenir"} />
              <Row k="Revizyon" v={`${o.revisionsUsed}/${o.revisionsAllowed} kullanıldı`} />
              {as === "buyer" ? (
                <Row k="Ödenen" v={<span className="num">{formatTRY(o.totalKurus, true)}</span>} />
              ) : (
                <>
                  <Row k="Sipariş tutarı" v={<span className="num">{formatTRY(o.totalKurus, true)}</span>} />
                  <Row k={`Hizmet bedeli (%${(o.commissionBps / 100).toLocaleString("tr-TR")})`} v={<span className="num">−{formatTRY(o.commissionKurus, true)}</span>} />
                  <Row k="Net kazanç" v={<span className="num font-semibold">{formatTRY(o.providerEarningKurus, true)}</span>} />
                </>
              )}
            </dl>
            {svc && <Link href={`/hizmet/${svc.slug}`} className="mt-4 inline-block text-[13px] text-muted underline underline-offset-2">Hizmet sayfası</Link>}
          </section>
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-[15px] font-semibold">Geçmiş</h2>
            <ol className="mt-3 space-y-3 border-l border-line pl-4 text-[13px]">
              <li className="relative"><span className="absolute -left-[21px] top-1 h-2 w-2 bg-line" /><p>Sipariş oluşturuldu</p><p className="text-muted">{formatDateTime(o.createdAt)}</p></li>
              {events.map((e) => (
                <li key={e.id} className="relative">
                  <span className={cn("absolute -left-[21px] top-1 h-2 w-2", e.toStatus === "completed" ? "bg-trust" : e.toStatus === "disputed" || e.toStatus === "refund_in_progress" ? "bg-bad" : "bg-ink")} />
                  <p>{e.toStatus ? ORDER_STATUS[e.toStatus].label : e.type}</p>
                  {e.note && e.type !== "deliver" && <p className="mt-0.5 line-clamp-3 text-ink-2">“{e.note}”</p>}
                  <p className="text-muted">{formatDateTime(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>;
}
