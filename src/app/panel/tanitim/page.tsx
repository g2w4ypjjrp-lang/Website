import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { promotions, providerProfiles, services } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { buyPromotionAction } from "@/app/actions/promotion";
import { PageHead } from "@/components/panel/page-head";
import { Badge, Notice } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/button";
import { formatDate, formatTRY } from "@/lib/utils";

export const metadata = { title: "Tanıtım ve premium" };
const ERR: Record<string, string> = { hizmet: "Yalnızca yayındaki hizmetlerinizi öne çıkarabilirsiniz.", saglayici: "Ödeme sağlayıcısına ulaşılamadı.", reddedildi: "Ödeme tamamlanamadı; kartınızdan çekim yapılmadı.", limit: "Çok fazla deneme yaptınız." };

export default async function PromotionPage({ searchParams }: { searchParams: Promise<{ hata?: string; odeme?: string }> }) {
  const user = await requireRole("provider");
  const sp = await searchParams;
  const [s, profile, active, history] = await Promise.all([
    getSettings(),
    db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, user.id) }),
    db.select({ id: services.id, title: services.title, featuredUntil: services.featuredUntil }).from(services).where(and(eq(services.providerId, user.id), eq(services.status, "active"))),
    db.select().from(promotions).where(eq(promotions.providerId, user.id)).orderBy(desc(promotions.createdAt)).limit(30),
  ]);
  const premium = profile?.premiumUntil && profile.premiumUntil > new Date();
  return (
    <>
      <PageHead title="Tanıtım ve premium" sub="Daha fazla müşteriye ulaşmak için hizmetini öne çıkar ya da premium üye ol." />
      {sp.odeme && <Notice tone="ok" className="mb-6">Ödemeniz alındı, tanıtım aktif.</Notice>}
      {sp.hata && ERR[sp.hata] && <Notice tone="bad" className="mb-6">{ERR[sp.hata]}</Notice>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-6">
          <p className="eyebrow">7 gün · {formatTRY(s.featuredPriceKurus)}</p>
          <h2 className="mt-2 text-[20px] font-semibold">Hizmeti öne çıkar</h2>
          <p className="mt-2 text-[14.5px] text-ink-2">Hizmetin kategori ve arama sonuçlarında “Öne çıkan” etiketiyle üst sıralarda, ana sayfada öne çıkanlar alanında gösterilir. Süre bitince kendiliğinden normal sıralamaya döner.</p>
          {active.length === 0 ? (
            <p className="mt-5 text-[14px] text-muted">Öne çıkarmak için önce yayında bir hizmetin olmalı.</p>
          ) : (
            <form action={buyPromotionAction} className="mt-5 space-y-3">
              <input type="hidden" name="type" value="featured" />
              <label className="block text-[13.5px] font-medium" htmlFor="serviceId">Hizmet</label>
              <select id="serviceId" name="serviceId" className="field">
                {active.map((a) => <option key={a.id} value={a.id}>{a.title}{a.featuredUntil && a.featuredUntil > new Date() ? ` (öne çıkan, ${formatDate(a.featuredUntil)} tarihine kadar)` : ""}</option>)}
              </select>
              <SubmitButton pendingText="Yönlendiriliyor">{formatTRY(s.featuredPriceKurus)} öde ve öne çıkar</SubmitButton>
            </form>
          )}
        </section>
        <section className="rounded-lg border border-ink bg-surface p-6">
          <p className="eyebrow">30 gün · {formatTRY(s.premiumMonthlyKurus)}</p>
          <h2 className="mt-2 text-[20px] font-semibold">Premium üyelik {premium && <Badge tone="ok" className="ml-2 align-middle">Aktif · {formatDate(profile!.premiumUntil!)}</Badge>}</h2>
          <ul className="mt-3 space-y-1.5 text-[14.5px] text-ink-2">
            <li>— Uzman listelerinde ve aramada doğrulanmış uzmanlardan sonra ilk sırada</li>
            <li>— Profilinde ve hizmet sayfalarında “Premium” rozeti</li>
            <li>— Süre bitiminde otomatik yenilenmez, sürpriz çekim olmaz</li>
          </ul>
          <form action={buyPromotionAction} className="mt-5">
            <input type="hidden" name="type" value="premium" />
            <SubmitButton variant="accent" pendingText="Yönlendiriliyor">{premium ? "30 gün uzat" : "Premium ol"}</SubmitButton>
          </form>
        </section>
      </div>
      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-[17px] font-semibold">Ödeme geçmişi</h2>
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface text-[14px]">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                <span className="num text-muted">{h.code}</span>
                <span className="flex-1">{h.type === "premium" ? "Premium üyelik" : "Öne çıkarma"} · {h.days} gün</span>
                <span className="num">{formatTRY(h.amountKurus)}</span>
                <Badge tone={h.status === "succeeded" ? "ok" : h.status === "failed" ? "bad" : "neutral"}>{h.status === "succeeded" ? "Ödendi" : h.status === "failed" ? "Başarısız" : "Bekliyor"}</Badge>
                <span className="text-[12.5px] text-muted">{formatDate(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
