import Link from "next/link";
import { Badge, Avatar } from "@/components/ui/primitives";
import { ORDER_STATUS, type OrderStatus } from "@/lib/order-status";
import { formatTRY, formatDate, fileUrl } from "@/lib/utils";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status];
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export type OrderRowData = { code: string; title: string; status: OrderStatus; totalKurus: number; providerEarningKurus: number; dueAt: Date | null; createdAt: Date; otherName: string; otherAvatar: string | null };

export function OrderTable({ rows, perspective }: { rows: OrderRowData[]; perspective: "buyer" | "provider" }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table className="w-full text-[14px]">
        <thead className="hidden border-b border-line text-left text-[12.5px] text-muted sm:table-header-group">
          <tr>
            <th className="px-4 py-2.5 font-normal">Sipariş</th>
            <th className="px-4 py-2.5 font-normal">{perspective === "buyer" ? "Uzman" : "Müşteri"}</th>
            <th className="px-4 py-2.5 font-normal">Durum</th>
            <th className="px-4 py-2.5 font-normal">Teslim</th>
            <th className="px-4 py-2.5 text-right font-normal">{perspective === "buyer" ? "Tutar" : "Net kazanç"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-2">
          {rows.map((o) => (
            <tr key={o.code} className="group relative block hover:bg-paper/60 sm:table-row">
              <td className="block px-4 pt-3 sm:table-cell sm:py-3">
                <Link href={`/panel/siparisler/${o.code}`} className="font-medium after:absolute after:inset-0">{o.title}</Link>
                <span className="num block text-[12px] text-muted">{o.code}</span>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className="flex items-center gap-2"><Avatar name={o.otherName} src={fileUrl(o.otherAvatar)} size={22} />{o.otherName}</span>
              </td>
              <td className="inline-block px-4 py-2 sm:table-cell sm:py-3"><StatusBadge status={o.status} /></td>
              <td className="inline-block px-0 py-2 text-[13px] text-muted sm:table-cell sm:px-4 sm:py-3">{o.dueAt ? formatDate(o.dueAt) : "—"}</td>
              <td className="num block px-4 pb-3 sm:table-cell sm:py-3 sm:text-right">{formatTRY(perspective === "buyer" ? o.totalKurus : o.providerEarningKurus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
