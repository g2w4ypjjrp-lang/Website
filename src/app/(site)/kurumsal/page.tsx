import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/forms/lead-form";
import { IconCheck } from "@/components/icons";
import { buildMetadata, ld } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Kurumsal üyelik: şirketler için dijital hizmet tedariki",
  description: "Web, yazılım, tasarım ve pazarlama işlerinizi tek hesap yöneticisi, yazılı çalışma şartları ve onaylanana kadar korunan ödemeyle yönetin. Ücretsiz ön görüşme için başvurun.",
  path: "/kurumsal",
});

const INCLUDED: [string, string][] = [
  ["Tek muhatap", "Hesap yöneticiniz ihtiyacı sizinle netleştirir, brifi yazar ve işi baştan sona takip eder. Her iş için ayrı ayrı uzman aramazsınız."],
  ["Karşılaştırmalı kısa liste", "Kimlik ve vergi bilgisi doğrulanmış, benzer işi daha önce teslim etmiş uzmanlar fiyat, süre ve kapsamlarıyla yan yana sunulur."],
  ["Yazılı çalışma şartları", "Kapsam, teslim tarihleri, revizyon hakkı, gizlilik ve fikri mülkiyet devri iş başlamadan yazılı hale getirilir."],
  ["Korunan ödeme", "Ödeme siz teslimatı onaylayana kadar Eksen güvencesinde tutulur. Teslim şartlara uymazsa itiraz süreci işletilir."],
  ["Düzenli kayıt", "Tüm siparişler şirket unvanınızla kayıt altına alınır; dönemsel sipariş ve ödeme dökümü muhasebe ekibinize iletilir."],
  ["Öncelikli destek", "Talep, revizyon ve itirazlarınız öncelikli sırada ele alınır; aynı işi farklı uzmanlar arasında devretmek kolaylaşır."],
];

const FOR_WHOM: [string, string][] = [
  ["Çok şubeli işletmeler", "Şube sayfaları, yerel reklam ve Google işletme profili yönetimini tek elden yürütmek isteyen perakende, restoran ve klinik zincirleri."],
  ["Üretim ve ihracat", "Çok dilli kurumsal site, ürün kataloğu, e-ihracat mağazası ve ERP/CRM entegrasyonu ihtiyacı olan sanayi şirketleri."],
  ["Büyüyen pazarlama ekipleri", "İç ekibine düzenli tasarım, içerik, video ve kampanya desteği eklemek isteyen şirketler."],
  ["Teknoloji projeleri", "Mobil uygulama, yönetim paneli veya mevcut yazılıma modül geliştirtmek isteyen, ama kalıcı ekip kurmak istemeyen işletmeler."],
];

const FAQS = [
  { q: "Kurumsal üyelik ücretli mi?", a: "Başvuru ve ön görüşme ücretsizdir. Üyelik koşulları iş hacminize ve ihtiyaç duyduğunuz hizmet düzeyine göre belirlenir; hesap yöneticiniz görüşmeden sonra size yazılı teklif sunar." },
  { q: "Uzmanlarla doğrudan çalışabilir miyiz?", a: "Evet. Kısa listeden seçtiğiniz uzmanla Eksen üzerinden mesajlaşır, dosya paylaşır ve sipariş verirsiniz. Hesap yöneticiniz süreci takip eder, iletişimin arasına girmez." },
  { q: "Gizlilik sözleşmesi imzalanabilir mi?", a: "Evet. İş başlamadan önce uzmanla gizlilik sözleşmesi imzalanabilir. Teslim edilen işin fikri mülkiyet haklarının size devri, çalışma şartlarında açıkça yazılır." },
  { q: "Ödeme nasıl korunuyor?", a: "Siparişin bedelini iş başında ödersiniz; tutar uzmana hemen aktarılmaz. Teslimatı onayladığınızda ödeme serbest bırakılır. Teslim şartlara uymazsa itiraz açabilirsiniz ve ekibimiz tarafları dinleyerek karar verir." },
  { q: "Hangi büyüklükteki şirketler başvurabilir?", a: "Düzenli dijital iş ihtiyacı olan her şirket başvurabilir: tek kişilik pazarlama ekibinden çok şubeli işletmelere kadar. Tek seferlik küçük işler için doğrudan hizmet paketlerini kullanmak genellikle daha hızlıdır." },
];

export default function CorporatePage() {
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Kurumsal üyelik", path: "/kurumsal" }]} />
      <JsonLd data={ld.faq(FAQS)} />

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="eyebrow mb-4">Kurumsal üyelik · şirketler için</p>
          <h1 className="text-[36px] font-semibold leading-[1.06] sm:text-[52px]">Dijital işlerinizi tek muhatap ve yazılı şartlarla yürütün.</h1>
          <p className="mt-6 max-w-[56ch] text-[17px] text-ink-2">
            Aynı anda birden fazla web, yazılım, tasarım veya pazarlama işi yürüten şirketler için: ihtiyacınızı dinleyen bir hesap yöneticisi, doğrulanmış uzmanlardan kısa liste ve satın alma sürecinize uyan bir çalışma düzeni.
          </p>
          <ul className="mt-8 space-y-3 text-[15.5px]">
            {["Ücretsiz ön görüşme, bağlayıcı olmayan teklif", "Ödeme, teslimatı onaylayana kadar güvencede", "Gizlilik ve fikri mülkiyet şartları baştan yazılı"].map((t) => (
              <li key={t} className="flex items-start gap-3"><IconCheck size={18} className="mt-0.5 shrink-0 text-trust" />{t}</li>
            ))}
          </ul>

          <section className="mt-16" aria-labelledby="dahil">
            <h2 id="dahil" className="text-[24px] font-semibold">Üyelikte neler var</h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {INCLUDED.map(([t, d]) => (
                <div key={t} className="bg-paper p-6">
                  <h3 className="text-[16.5px] font-semibold">{t}</h3>
                  <p className="mt-2 text-[14.5px] text-ink-2">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16" aria-labelledby="surec">
            <h2 id="surec" className="text-[24px] font-semibold">Nasıl ilerliyor</h2>
            <ol className="mt-6 space-y-6">
              {[
                ["Başvuru", "Formu doldurursunuz; ihtiyaçlarınız ve tahmini bütçeniz hesap yöneticinize iletilir."],
                ["Ön görüşme", "Hesap yöneticiniz sizi arar; işlerin kapsamını, önceliklerini ve takvimini birlikte netleştirirsiniz."],
                ["Kısa liste ve teklif", "Her iş için uygun uzmanlar fiyat ve süreleriyle sunulur. Onayladığınız işler sipariş olarak başlar, ödemeniz korunur."],
              ].map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[44px_1fr] gap-4">
                  <span className="num flex size-11 items-center justify-center rounded-full border border-line bg-surface text-[15px] font-semibold">{i + 1}</span>
                  <div className="pt-1.5"><h3 className="text-[16.5px] font-semibold">{t}</h3><p className="mt-1 text-[14.5px] text-ink-2">{d}</p></div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <LeadForm />
        </div>
      </div>

      <section className="mt-20 border-t border-line pt-14" aria-labelledby="kimler">
        <h2 id="kimler" className="text-[24px] font-semibold">Kimler için uygun</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOR_WHOM.map(([t, d]) => (
            <div key={t}>
              <h3 className="text-[16px] font-semibold">{t}</h3>
              <p className="mt-2 text-[14.5px] text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-line py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-[24px] font-semibold">Sık sorulan sorular</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none justify-between gap-4 text-[16px] font-medium">{f.q}<span className="text-muted transition-transform group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-[15px] text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
