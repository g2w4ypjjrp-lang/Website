import { requireUser } from "@/server/auth";
import { inboxFor } from "@/server/inbox";
import { PageHead } from "@/components/panel/page-head";
import { InboxList } from "@/components/panel/inbox-list";

export const metadata = { title: "Mesajlar" };

export default async function InboxPage() {
  const user = await requireUser();
  const items = await inboxFor(user.id);
  return (
    <>
      <PageHead title="Mesajlar" sub="Siparişlere bağlı ve sipariş öncesi sohbetler" />
      <div className="grid overflow-hidden rounded-lg border border-line bg-surface md:grid-cols-[340px_1fr]">
        <div className="md:border-r md:border-line"><InboxList items={items} /></div>
        <div className="hidden items-center justify-center p-10 text-[14px] text-muted md:flex">Bir sohbet seç</div>
      </div>
    </>
  );
}
