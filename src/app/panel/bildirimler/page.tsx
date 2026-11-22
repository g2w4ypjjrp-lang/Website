import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { markNotificationsReadAction } from "@/app/actions/panel";
import { PageHead } from "@/components/panel/page-head";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";

export const metadata = { title: "Bildirimler" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const rows = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(100);
  const unread = rows.some((r) => !r.readAt);
  return (
    <>
      <PageHead title="Bildirimler" action={unread ? <form action={markNotificationsReadAction}><Button size="sm" variant="outline">Tümünü okundu say</Button></form> : undefined} />
      {rows.length === 0 ? <EmptyState title="Bildirimin yok" /> : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {rows.map((n) => {
            const inner = (
              <>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0", n.readAt ? "bg-transparent" : "bg-accent")} />
                <span className="min-w-0 flex-1"><span className={cn("block text-[14.5px]", !n.readAt && "font-medium")}>{n.title}</span>{n.body && <span className="block truncate text-[13px] text-muted">{n.body}</span>}</span>
                <span className="shrink-0 text-[12px] text-muted">{timeAgo(n.createdAt)}</span>
              </>
            );
            return <li key={n.id}>{n.link ? <Link href={n.link} className="flex gap-3 px-4 py-3.5 hover:bg-paper/60">{inner}</Link> : <div className="flex gap-3 px-4 py-3.5">{inner}</div>}</li>;
          })}
        </ul>
      )}
    </>
  );
}
