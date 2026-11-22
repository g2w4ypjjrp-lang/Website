import Link from "next/link";
import { Avatar } from "@/components/ui/primitives";
import { cn, fileUrl, timeAgo } from "@/lib/utils";
import type { inboxFor } from "@/server/inbox";

export function InboxList({ items, activeId }: { items: Awaited<ReturnType<typeof inboxFor>>; activeId?: string }) {
  if (!items.length) return <p className="px-4 py-10 text-center text-[14px] text-muted">Henüz bir sohbetin yok. Bir uzmanın profilinden ya da hizmet sayfasından mesaj gönderebilirsin.</p>;
  return (
    <ul className="divide-y divide-line-2">
      {items.map((c) => (
        <li key={c.id}>
          <Link href={`/panel/mesajlar/${c.id}`} className={cn("flex gap-3 px-4 py-3.5 hover:bg-paper/60", activeId === c.id && "bg-paper shadow-[inset_2px_0_0_var(--color-accent)]")}>
            <Avatar name={c.otherName} src={fileUrl(c.otherAvatar)} size={38} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className={cn("truncate text-[14.5px]", c.unread ? "font-semibold" : "font-medium")}>{c.otherName}</span>
                <span className="shrink-0 text-[11.5px] text-muted">{timeAgo(c.lastMessageAt)}</span>
              </span>
              {c.orderCode && <span className="num block truncate text-[11.5px] text-accent-strong">{c.orderCode} · {c.orderTitle}</span>}
              <span className="flex items-center justify-between gap-2">
                <span className={cn("truncate text-[13px]", c.unread ? "text-ink" : "text-muted")}>{c.preview ?? "Yeni sohbet"}</span>
                {c.unread > 0 && <span className="num shrink-0 rounded-sm bg-accent px-1.5 text-[11px] text-white">{c.unread}</span>}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
