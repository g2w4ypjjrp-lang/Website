import { desc } from "drizzle-orm";
import { db } from "@/db";
import { emailOutbox } from "@/db/schema";
import { getSettings } from "@/server/settings";
import { saveSettingsAction } from "@/app/actions/admin";
import { AHead, Table } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";
import { Badge } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/server/auth";

export const metadata = { title: "Ayarlar" };

export default async function AdminSettings() {
  await requireAdmin();
  const [s, outbox] = await Promise.all([getSettings(), db.select().from(emailOutbox).orderBy(desc(emailOutbox.createdAt)).limit(30)]);
  const provider = process.env.PAYMENT_PROVIDER ?? "sandbox";
  const env = (k: string) => (process.env[k] ? <Badge tone="ok">Tanımlı</Badge> : <Badge tone="warn">Eksik</Badge>);
  return (
    <>
      <AHead title="Sistem ayarları" sub="Komisyon, sipariş süreleri, ücretlendirme ve entegrasyon durumu" />
      <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
        <AdminForm action={saveSettingsAction} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-[16px] font-semibold">Komisyon</h2>
            <F label="Genel komisyon oranı (%)" hint="Öncelik sırası: uzmana özel oran → kategori oranı → genel oran. Oran sipariş anında sabitlenir; mevcut siparişler etkilenmez.">
              <input name="commissionPct" defaultValue={s.commissionBps / 100} className="field !w-32 !py-2" />
            </F>
            <div className="rounded-md bg-paper-2 p-3 text-[13px] text-ink-2">Örnek: 10.000 ₺ satış → platform {((10000 * s.commissionBps) / 10000).toLocaleString("tr-TR")} ₺ · uzman {(10000 - (10000 * s.commissionBps) / 10000).toLocaleString("tr-TR")} ₺</div>
          </section>
          <section className="grid gap-4 sm:grid-cols-3">
            <h2 className="text-[16px] font-semibold sm:col-span-3">Sipariş ve hakediş</h2>
            <F label="Otomatik onay (gün)" hint="Teslimattan sonra müşteri yanıt vermezse"><input name="autoCompleteDays" defaultValue={s.autoCompleteDays} className="field !py-2" /></F>
            <F label="Hakediş bekleme (gün)" hint="Onaydan sonra ödemeye hazır olma"><input name="payoutHoldDays" defaultValue={s.payoutHoldDays} className="field !py-2" /></F>
            <F label="Asgari sipariş (₺)"><input name="minOrder" defaultValue={s.minOrderKurus / 100} className="field !py-2" /></F>
          </section>
          <section className="grid gap-4 sm:grid-cols-3">
            <h2 className="text-[16px] font-semibold sm:col-span-3">Gelir modelleri</h2>
            <F label="Öne çıkarma (7 gün, ₺)"><input name="featuredPrice" defaultValue={s.featuredPriceKurus / 100} className="field !py-2" /></F>
            <F label="Premium üyelik (aylık, ₺)"><input name="premiumPrice" defaultValue={s.premiumMonthlyKurus / 100} className="field !py-2" /></F>
            <F label="Destek e-postası"><input name="supportEmail" defaultValue={s.supportEmail} className="field !py-2" /></F>
          </section>
          <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" name="maintenanceMode" defaultChecked={s.maintenanceMode} /> Bakım modu (yeni sipariş alımını durdurur)</label>
        </AdminForm>
        <aside className="space-y-4 text-[13.5px]">
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-semibold">Ödeme altyapısı</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt>Etkin sağlayıcı</dt><dd><Badge tone={provider === "sandbox" ? "warn" : "ok"}>{provider}</Badge></dd></div>
              <div className="flex justify-between"><dt>IYZICO_API_KEY</dt><dd>{env("IYZICO_API_KEY")}</dd></div>
              <div className="flex justify-between"><dt>IYZICO_SECRET_KEY</dt><dd>{env("IYZICO_SECRET_KEY")}</dd></div>
            </dl>
            <p className="mt-3 text-[12.5px] text-muted">Anahtarlar yalnızca ortam değişkeni olarak tutulur, veritabanına ve bu ekrana yazılmaz.</p>
          </section>
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="font-semibold">E-posta ve sistem</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt>SMTP_URL</dt><dd>{env("SMTP_URL")}</dd></div>
              <div className="flex justify-between"><dt>CRON_SECRET</dt><dd>{env("CRON_SECRET")}</dd></div>
              <div className="flex justify-between"><dt>Site adresi</dt><dd className="font-mono text-[12px]">{process.env.NEXT_PUBLIC_SITE_URL}</dd></div>
            </dl>
            <p className="mt-3 text-[12.5px] text-muted">Zamanlanmış görev: <code className="font-mono">POST /api/cron/run</code> (Authorization: Bearer CRON_SECRET) — saatte bir çalıştırın.</p>
          </section>
        </aside>
      </div>
      <h2 className="mb-3 mt-12 text-[16px] font-semibold">E-posta gönderim kuyruğu (son 30)</h2>
      <Table head={["Zaman", "Alıcı", "Konu", "Durum"]}>
        {outbox.map((m) => (
          <tr key={m.id}><td className="whitespace-nowrap px-3 py-2 text-muted">{formatDateTime(m.createdAt)}</td><td className="px-3 py-2">{m.to}</td><td className="px-3 py-2">{m.subject}</td><td className="px-3 py-2"><Badge tone={m.status === "sent" ? "ok" : m.status === "failed" ? "bad" : "neutral"}>{m.status === "logged" ? "Kaydedildi (SMTP yok)" : m.status}</Badge></td></tr>
        ))}
      </Table>
    </>
  );
}
