import type { Metadata } from "next";
import { getSettings } from "@/server/settings";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { formatTRY } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({ title: "Uzman olarak katıl: freelancer ve ajanslar için", description: "Hizmetlerini paket olarak sat, projelere teklif ver. Ücretsiz üyelik, şeffaf komisyon, güvenli ödeme.", path: "/uzman-ol" });

export default async function BecomePage() {
  const s = await getSettings();
  const pct = s.commissionBps / 100;
  const sample = 1_000_000;
  const fee = Math.round((sample * s.commissionBps) / 10_000);
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Uzman olarak katıl", path: "/uzman-ol" }]} />
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow mb-4">Freelancer · ajans · yazılım şirketi</p>
          <h1 className="text-[38px] font-semibold leading-[1.05] sm:text-[56px]">İşini paketle, müşteri seni Google’dan ve Eksen’den bulsun.</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/kayit?rol=uzman" size="lg">Ücretsiz kaydol</ButtonLink>
            <ButtonLink href="/projeler" size="lg" variant="outline">Açık projeleri gör</ButtonLink>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-6">
          <p className="text-[13px] text-muted">Örnek hesap · {formatTRY(sample)} sipariş</p>
          <dl className="mt-4 space-y-3 text-[15px]">
            <div className="flex justify-between"><dt>Müşterinin ödediği</dt><dd className="num">{formatTRY(sample)}</dd></div>
            <div className="flex justify-between text-muted"><dt>Hizmet bedeli (%{pct.toLocaleString("tr-TR")})</dt><dd className="num">−{formatTRY(fee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 font-semibold"><dt>Hesabına geçen</dt><dd className="num">{formatTRY(sample - fee)}</dd></div>
          </dl>
          <p className="mt-4 text-[12.5px] text-muted">Bazı kategorilerde farklı oran uygulanabilir; oran sipariş anında sabitlenir ve sipariş detayında görünür.</p>
        </div>
      </div>
      <div className="mt-20 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
        {[
          ["Ücretsiz üyelik", "Hizmet yayınlamak ve teklif vermek ücretsiz. Yalnızca tamamlanan siparişlerden hizmet bedeli alınır."],
          ["Ödeme güvencesi", "Müşteri ödemeyi sipariş başında yapar. İşi teslim edip onay aldığında ücretin garanti altındadır."],
          ["Görünürlük", "Hizmet ve profil sayfaların arama motorları için optimize edilir. İstersen öne çıkarma ile daha fazla görünürsün."],
        ].map(([t, d]) => (
          <div key={t} className="bg-paper p-7"><h2 className="text-[19px] font-semibold">{t}</h2><p className="mt-2 text-[14.5px] text-ink-2">{d}</p></div>
        ))}
      </div>
      <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-[26px] font-semibold">Başlamak için</h2>
        <ol className="space-y-4 text-[16px]">
          <li><b>1.</b> Hesabını aç ve profilini tamamla: fotoğraf, kısa tanıtım, yetenekler, portföy.</li>
          <li><b>2.</b> Kimlik ve vergi bilgilerini doğrulat; doğrulanmış rozeti müşterinin güvenini artırır.</li>
          <li><b>3.</b> İlk hizmetini üç paketle yayınla; ekibimiz kısa bir incelemeden sonra yayına alır.</li>
          <li><b>4.</b> Ödeme almak için IBAN bilgini ekle. Hakedişin, sipariş onayından {s.payoutHoldDays} gün sonra ödemeye hazır olur.</li>
        </ol>
      </section>
    </div>
  );
}
