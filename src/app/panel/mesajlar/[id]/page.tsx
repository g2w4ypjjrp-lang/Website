import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, orders, providerProfiles, users } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { getConversationFor, isBlocked, markRead } from "@/server/messaging";
import { loadMessages } from "@/server/conversation-data";
import { inboxFor } from "@/server/inbox";
import { blockUserAction } from "@/app/actions/panel";
import { Chat } from "@/components/panel/chat";
import { InboxList } from "@/components/panel/inbox-list";
import { ReportButton } from "@/components/report-button";

export const metadata = { title: "Sohbet" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const conv = await getConversationFor(user.id, id);
  if (!conv) notFound();
  const otherId = conv.userAId === user.id ? conv.userBId : conv.userAId;
  await markRead(user.id, id);
  const [msgs, items, other, prof, order, blockedByMe, blocked] = await Promise.all([
    loadMessages(id),
    inboxFor(user.id),
    db.query.users.findFirst({ where: eq(users.id, otherId), columns: { name: true, status: true } }),
    db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, otherId), columns: { slug: true, displayName: true } }),
    conv.orderId ? db.query.orders.findFirst({ where: eq(orders.id, conv.orderId), columns: { code: true, title: true } }) : null,
    db.query.blocks.findFirst({ where: and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, otherId)) }),
    isBlocked(user.id, otherId),
  ]);
  const name = prof?.displayName ?? other?.name ?? "Kullanıcı";
  return (
    <div className="mt-4 lg:mt-0">
      <div className="grid overflow-hidden rounded-lg border border-line bg-surface md:grid-cols-[320px_1fr]">
        <div className="hidden max-h-[78vh] overflow-y-auto border-r border-line md:block"><InboxList items={items} activeId={id} /></div>
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <Link href="/panel/mesajlar" className="text-[12.5px] text-muted md:hidden">← Mesajlar</Link>
              <p className="truncate font-semibold">{prof ? <Link href={`/uzman/${prof.slug}`} className="hover:underline">{name}</Link> : name}</p>
              {order && <Link href={`/panel/siparisler/${order.code}`} className="num block truncate text-[12px] text-accent-strong">{order.code} · {order.title}</Link>}
            </div>
            <div className="flex items-center gap-4 text-[13px]">
              <ReportButton targetType="user" targetId={otherId} />
              <form action={blockUserAction}>
                <input type="hidden" name="userId" value={otherId} />
                {blockedByMe && <input type="hidden" name="unblock" value="1" />}
                <button className="text-muted hover:text-bad">{blockedByMe ? "Engeli kaldır" : "Engelle"}</button>
              </form>
            </div>
          </div>
          <Chat conversationId={id} meId={user.id} initial={msgs} otherName={name} className="h-[68vh] rounded-none border-0" disabledReason={blocked ? "Bu sohbette mesajlaşma engellendi." : other?.status !== "active" ? "Bu kullanıcının hesabı aktif değil." : undefined} />
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-muted">Güvenliğiniz için ödemeleri yalnızca Eksen üzerinden yapın. Platform dışına yönlendiren mesajları bildirin.</p>
    </div>
  );
}
