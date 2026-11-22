import Link from "next/link";
import { requireUser } from "@/server/auth";
import { listOrdersFor } from "@/server/panel-queries";
import { PageHead } from "@/components/panel/page-head";
import { OrderTable } from "@/components/panel/order-bits";
import { EmptyState } from "@/components/ui/primitives";
import type { OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export const metadata = { title: "Siparişler" };

const TABS: [string, string, OrderStatus[] | undefined][] = [
  ["aktif", "Devam eden", ["created", "in_progress", "awaiting_delivery", "revision_requested"]],
  ["teslim", "Teslim edilen", ["delivered"]],
  ["tamam", "Tamamlanan", ["completed"]],
  ["sorun", "İade / uyuşmazlık", ["refund_in_progress", "disputed"]],
  ["iptal", "İptal", ["cancelled"]],
  ["tumu", "Tümü", undefined],
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ sekme?: string }> }) {
  const user = await requireUser();
  const { sekme = "aktif" } = await searchParams;
  const tab = TABS.find((t) => t[0] === sekme) ?? TABS[0]!;
  const perspective = user.role === "provider" ? "provider" : "buyer";
  const statuses = tab[0] === "tumu" ? undefined : tab[2];
  const rows = await listOrdersFor(user.id, perspective, perspective === "buyer" && tab[0] === "tumu" ? undefined : statuses, 200);
  return (
    <>
      <PageHead title={perspective === "provider" ? "Siparişler" : "Siparişlerim"} sub={perspective === "provider" ? "Müşterilerinden gelen siparişler" : "Satın aldığın hizmetler"} />
      <nav className="mb-5 flex gap-5 overflow-x-auto border-b border-line text-[14px] [scrollbar-width:none]">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/panel/siparisler?sekme=${k}`} className={cn("-mb-px whitespace-nowrap border-b-2 pb-2.5", tab[0] === k ? "border-ink font-medium" : "border-transparent text-muted hover:text-ink")}>{l}</Link>
        ))}
      </nav>
      {rows.length ? <OrderTable rows={rows} perspective={perspective} /> : <EmptyState title="Bu sekmede sipariş yok" />}
    </>
  );
}
