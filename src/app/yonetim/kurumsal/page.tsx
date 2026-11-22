import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { updateLeadAction } from "@/app/actions/admin";
import { AHead, KPI, Tabs } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Kurumsal başvurular" };

const TONE: Record<LeadStatus, "warn" | "neutral" | "ok" | "bad"> = { new: "warn", contacted: "neutral", won: "ok", lost: "bad" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.durum && sp.durum in LEAD_STATUSES ? (sp.durum as LeadStatus) : undefined;
  const [rows, counts] = await Promise.all([
    db.select().from(leads).where(status ? eq(leads.status, status) : undefined).orderBy(desc(leads.createdAt)).limit(200),
    db.select({ status: leads.status, n: sql<number>`count(*)::int` }).from(leads).groupBy(leads.status),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const total = counts.reduce((a, c) => a + c.n, 0);
  const closed = count("won") + count("lost");

  return (
    <>
      <AHead title="Kurumsal başvurular" sub={<>Kurumsal üyelik formundan gelen talepler · <Link href="/kurumsal" className="underline" target="_blank">başvuru sayfası</Link></>} />
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <KPI label="Toplam başvuru" value={total} />
        <KPI label="Yanıt bekleyen" value={count("new")} accent={count("new") > 0} />
        <KPI label="Görüşülüyor" value={count("contacted")} />
        <KPI label="Kazanma oranı" value={closed ? `%${Math.round((count("won") / closed) * 100)}` : "—"} sub={`${count("won")} kazanıldı · ${count("lost")} kaybedildi`} />
      </div>
      <Tabs
        current={status ? `/yonetim/kurumsal?durum=${status}` : "/yonetim/kurumsal"}
        items={[["/yonetim/kurumsal", "Tümü", total], ...Object.entries(LEAD_STATUSES).map(([k, l]): [string, string, number] => [`/yonetim/kurumsal?durum=${k}`, l, count(k)])]}
      />

      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-line p-10 text-center text-muted">Bu durumda başvuru yok.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((l) => (
            <li key={l.id} id={l.id} className="scroll-mt-24 rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold">{l.company}</p>
                  <p className="mt-0.5 text-[13.5px] text-ink-2">
                    {l.contactName} · <a href={`mailto:${l.email}`} className="underline">{l.email}</a>
                    {l.phone && <> · <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="underline">{l.phone}</a></>}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[12.5px] text-muted">
                  <Badge tone={TONE[l.status as LeadStatus] ?? "neutral"} dot>{LEAD_STATUSES[l.status as LeadStatus] ?? l.status}</Badge>
                  {formatDateTime(l.createdAt)}
                </div>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-3">
                <div><dt className="text-muted">İl</dt><dd>{l.city ?? "—"}</dd></div>
                <div><dt className="text-muted">Çalışan sayısı</dt><dd>{l.teamSize ?? "—"}</dd></div>
                <div><dt className="text-muted">Bütçe</dt><dd>{l.monthlyBudget ?? "—"}</dd></div>
              </dl>
              {l.needs && <p className="mt-4 whitespace-pre-line rounded-md bg-paper-2 px-4 py-3 text-[14px]">{l.needs}</p>}
              <form action={updateLeadAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-line-2 pt-4">
                <input type="hidden" name="id" value={l.id} />
                <label className="text-[12.5px]">
                  <span className="mb-1 block text-muted">Durum</span>
                  <select name="status" defaultValue={l.status} className="field !w-44 !py-2">
                    {Object.entries(LEAD_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
                <label className="min-w-[220px] flex-1 text-[12.5px]">
                  <span className="mb-1 block text-muted">İç not</span>
                  <input name="note" defaultValue={l.note ?? ""} maxLength={2000} placeholder="Görüşme notu, teklif tutarı, sonraki adım…" className="field !py-2" />
                </label>
                <button className="h-[38px] rounded-md bg-ink px-4 text-[13.5px] font-medium text-white">Kaydet</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
