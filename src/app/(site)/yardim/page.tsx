import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata, ld } from "@/lib/seo";
import { getSettings } from "@/server/settings";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({ title: "Yardım merkezi", description: "Sipariş, güvenli ödeme, revizyon, iade, uyuşmazlık ve uzman hakedişleri hakkında sık sorulan sorular.", path: "/yardim" });

export default async function HelpPage() {
  const s = await getSettings();
  const pct = (s.commissionBps / 100).toLocaleString("tr-TR");
  const groups: { title: string; id: string; faqs: { q: string; a: string }[] }[] = [
    {
      title: "Hizmet alanlar için",
      id: "musteriler",
      faqs: [
        { q: "Nasıl sipariş veririm?", a: "Hizmet sayfasında paketi seçip “Devam et” ile ödeme adımına geçin. Kapsam belirsizse proje oluşturup uzmanlardan teklif toplayabilirsiniz." },
        { q: "Ödemem ne zaman uzmana geçer?", a: "Ödeme sipariş başında lisanslı ödeme kuruluşunun havuz hesabına alınır. Uzman teslim eder, siz onaylarsınız; tutar ancak o zaman uzmana aktarılır." },
        { q: "Teslimatı onaylamazsam ne olur?", a: `Teslimattan sonra ${s.autoCompleteDays} gün içinde onay, revizyon ya da itiraz bildirmezseniz sipariş otomatik olarak tamamlanır. Bu süre sipariş sayfasında görünür.` },
        { q: "Revizyon nasıl istenir?", a: "Sipariş sayfasında “Revizyon iste” ile düzeltme talebinizi yazın. Paketteki revizyon hakkı ve kalan hak sayısı aynı sayfada görünür." },
        { q: "İade alabilir miyim?", a: "İş başlamadan vazgeçerseniz ya da teslimat sipariş şartlarına uymuyorsa sipariş sayfasından iade talebi açabilirsiniz. Talep Eksen ekibi tarafından incelenir." },
      ],
    },
    {
      title: "Uzmanlar için",
      id: "uzmanlar",
      faqs: [
        { q: "Hizmet bedeli ne kadar?", a: `Üyelik ücretsizdir. Tamamlanan siparişlerden %${pct} hizmet bedeli alınır; bazı kategorilerde farklı oran uygulanabilir. Oran sipariş anında sabitlenir.` },
        { q: "Hakedişim ne zaman ödenir?", a: `Müşteri onayından ${s.payoutHoldDays} gün sonra hakedişiniz ödemeye hazır olur ve kayıtlı IBAN’ınıza aktarılır.` },
        { q: "Doğrulanmış rozeti nasıl alırım?", a: "Panelde Uzman profili sayfasındaki “Doğrulama talep et” butonunu kullanın. Eksen ekibi kimlik ve vergi levhanızı kontrol ettikten sonra rozet profilinizde ve hizmet kartlarınızda görünür." },
        { q: "Hizmetim neden yayında değil?", a: "Yeni hizmetler kısa bir inceleme sonrası yayına alınır. Eksik ya da kurallara aykırı bir durum varsa gerekçesi panelde gösterilir." },
      ],
    },
    {
      title: "Ödeme ve güvenlik",
      id: "odeme",
      faqs: [
        { q: "Kart bilgilerim saklanıyor mu?", a: "Hayır. Kart bilgileri Eksen sunucularına ulaşmaz; ödeme doğrudan lisanslı ödeme kuruluşunun güvenli sayfasında alınır." },
        { q: "Fiyatlara KDV dahil mi?", a: "Evet, sitede gösterilen fiyatlara KDV dahildir. Fatura bilgilerinizi ödeme adımında girebilirsiniz." },
        { q: "Platform dışında ödeme yapabilir miyim?", a: "Platform dışında yapılan ödemeler güvence kapsamında değildir; uyuşmazlıkta Eksen yardımcı olamaz. Ödemeyi her zaman sipariş üzerinden yapın." },
        { q: "Uyuşmazlık nasıl çözülür?", a: "Sipariş sayfasından itiraz açılır. Eksen ekibi mesajları, teslimatları ve sipariş şartlarını inceleyip tarafları dinleyerek karar verir." },
      ],
    },
  ];
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Yardım merkezi", path: "/yardim" }]} />
      <JsonLd data={ld.faq(groups.flatMap((g) => g.faqs))} />
      <div className="mt-8 max-w-2xl">
        <p className="eyebrow mb-3">Yardım merkezi</p>
        <h1 className="text-[length:var(--h2-size)] font-semibold">Sık sorulan sorular</h1>
        <p className="mt-4 text-[16px] text-ink-2">Aradığınızı bulamazsanız <Link href="/iletisim" className="font-medium underline underline-offset-4">destek ekibine yazın</Link>.</p>
        <nav className="mt-6 flex flex-wrap gap-1.5" aria-label="Konular">
          {groups.map((g) => <a key={g.id} href={`#${g.id}`} className="chip">{g.title}</a>)}
        </nav>
      </div>
      <div className="mt-12 space-y-12">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="grid scroll-mt-24 gap-6 lg:grid-cols-[280px_1fr]">
            <h2 className="text-[22px] font-semibold">{g.title}</h2>
            <div className="card divide-y divide-line-2 px-6">
              {g.faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none justify-between gap-4 text-[15.5px] font-medium">{f.q}<span className="text-muted transition-transform group-open:rotate-45">+</span></summary>
                  <p className="mt-2 text-[15px] text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
