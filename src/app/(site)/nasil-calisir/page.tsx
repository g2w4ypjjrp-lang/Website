import type { Metadata } from "next";
import { getSettings } from "@/server/settings";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({ title: "Nasıl çalışır? Güvenli ödeme ve sipariş süreci", description: "Eksen’de sipariş, güvenli ödeme, teslimat, revizyon, iade ve uyuşmazlık süreçleri adım adım.", path: "/nasil-calisir" });

export default async function HowPage() {
  const s = await getSettings();
  const faqs = [
    { q: "Ödememi ne zaman uzmana aktarıyorsunuz?", a: "Teslimatı onayladığınızda sipariş tamamlanır ve tutar uzmanın hakedişine alınır. Hakediş, olası iade taleplerine karşı " + s.payoutHoldDays + " gün sonra ödemeye hazır hale gelir." },
    { q: "Teslimata yanıt vermezsem ne olur?", a: `Teslimattan sonra ${s.autoCompleteDays} gün içinde onay, revizyon veya iade talebinde bulunmazsanız sipariş otomatik olarak tamamlanır.` },
    { q: "Kart bilgilerim saklanıyor mu?", a: "Hayır. Kart bilgileri lisanslı ödeme kuruluşunun güvenli sayfasında girilir; Eksen sunucularına ulaşmaz." },
    { q: "Uzman işe başlamazsa ne olur?", a: "Uzman işe başlamadan siparişi iptal ederse ödemenizin tamamı iade edilir. Gecikmelerde iade talebi açabilirsiniz." },
  ];
  const steps = [
    ["Hizmet seç ya da proje oluştur", "Hazır paketlerde fiyat, süre ve revizyon hakkı bellidir. Kapsam belirsizse projeni yaz; uzmanlar fiyat ve süre teklif eder."],
    ["Ödemeyi yap", "Ödeme, lisanslı ödeme kuruluşu üzerinden alınır ve havuz hesabında bekletilir. Uzman bu aşamada para almaz."],
    ["Uzman işe başlar", "Siparişe özel sohbet açılır. Dosyalar, mesajlar ve tüm durum değişiklikleri sipariş sayfasında kayıt altındadır."],
    ["Teslimatı incele", "Teslim edilen dosyaları kontrol et. Paketteki hakkın kadar revizyon isteyebilirsin."],
    ["Onayla ve değerlendir", "Onayladığında sipariş tamamlanır, ödeme uzmanın hakedişine geçer. Deneyimini puanlarsın; bu puan yalnızca gerçek siparişlerden gelir."],
  ];
  return (
    <div className="container-x pt-6">
      <JsonLd data={ld.faq(faqs)} />
      <Breadcrumbs items={[{ name: "Nasıl çalışır?", path: "/nasil-calisir" }]} />
      <h1 className="mt-8 max-w-3xl text-[38px] font-semibold leading-tight sm:text-[54px]">Siparişten onaya, her adım kayıt altında.</h1>
      <ol className="mt-14 border-t border-ink">
        {steps.map(([t, d], i) => (
          <li key={t} className="grid gap-3 border-b border-line py-8 sm:grid-cols-[80px_320px_1fr] sm:gap-8">
            <span className={`num text-[14px] ${i === 1 ? "text-accent" : "text-faint"}`}>{String(i + 1).padStart(2, "0")}</span>
            <h2 className="text-[22px] font-semibold">{t}</h2>
            <p className="text-[16px] text-ink-2">{d}</p>
          </li>
        ))}
      </ol>
      <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-[26px] font-semibold">Bir şey ters giderse</h2>
          <p className="mt-3 text-ink-2">Sipariş sayfasından iade talebi ya da uyuşmazlık kaydı açabilirsin. Eksen ekibi mesaj geçmişini ve teslim dosyalarını inceler, iki tarafı da dinleyerek karar verir.</p>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none justify-between gap-4 text-[16px] font-medium">{f.q}<span className="text-muted group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="mt-16 flex flex-wrap gap-3">
        <ButtonLink href="/kategoriler" size="lg">Hizmetlere göz at</ButtonLink>
        <ButtonLink href="/proje-olustur" size="lg" variant="outline">Proje oluştur</ButtonLink>
      </div>
    </div>
  );
}
