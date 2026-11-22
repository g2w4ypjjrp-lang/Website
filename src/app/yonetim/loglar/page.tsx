import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { AHead, Table } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Denetim kayıtları" };

export default async function Logs({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const rows = await db.select().from(auditLogs).where(q ? sql`${auditLogs.action} ilike '%' || ${q} || '%' or ${auditLogs.entityId} ilike '%' || ${q} || '%'` : undefined).orderBy(desc(auditLogs.createdAt)).limit(300);
  return (
    <>
      <AHead title="Denetim kayıtları" sub="Ödeme, komisyon, iade, hakediş ve yönetici işlemlerinin değiştirilemez kaydı" action={<form className="flex gap-2"><input name="q" defaultValue={q} placeholder="işlem veya kimlik, ör. payment" className="field !w-64 !py-1.5 text-[13.5px]" /><button className="rounded bg-ink px-3 text-[13px] text-white">Filtrele</button></form>} />
      <Table head={["Zaman", "İşlem", "Varlık", "Aktör", "IP", "Ayrıntı"]}>
        {rows.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="whitespace-nowrap px-3 py-2 text-muted">{formatDateTime(r.createdAt)}</td>
            <td className="px-3 py-2 font-mono text-[12px]">{r.action}</td>
            <td className="px-3 py-2 font-mono text-[12px]">{r.entityType}:{r.entityId?.slice(0, 12)}</td>
            <td className="px-3 py-2 font-mono text-[12px]">{r.actorId?.slice(0, 8) ?? "sistem"}</td>
            <td className="px-3 py-2 font-mono text-[12px]">{r.ip}</td>
            <td className="max-w-[320px] truncate px-3 py-2 font-mono text-[11.5px] text-muted">{JSON.stringify(r.meta)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
