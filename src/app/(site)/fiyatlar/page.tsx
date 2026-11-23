import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { IconCheck } from "@/components/icons";
import { buildMetadata } from "@/lib/seo";
import { formatTRY } from "@/lib/utils";
import { getSettings } from "@/server/settings";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({ title: "Ücretler ve fiyatlar", description: "Eksen’de hizmet almak ücretsiz; uzmanlar yalnızca tamamlanan siparişlerden hizmet bedeli öder. Öne çıkarma, premium ve kurumsal üyelik ücretleri.", path: "/fiyatlar" });

export default async function PricingPage() {
  const s = await getSettings();
  const pct = (s.commissionBps / 100).toLocaleString("tr-TR");
  const plans = [
    {
      name: "Hizmet alanlar",
      price: "Ücretsiz",
      note: "Üyelik ve proje yayınlama ücreti yok",
      items: ["Paket fiyatı uzman tarafından belirlenir, KDV dahil gösterilir", "Proje yayınla, sınırsız teklif al", "Ödeme onaylayana kadar havuz hesabında", "İade ve uyuşmazlık desteği"],
      cta: ["/proje-olustur", "Ücretsiz proje oluştur"],
      accent: false,
    },
    {
      name: "Uzmanlar ve ajanslar",
      price: `%${pct}`,
      note: "Yalnızca tamamlanan siparişlerden hizmet bedeli",
      items: ["Üyelik, hizmet yayınlama ve teklif vermek ücretsiz", "Oran sipariş anında sabitlenir, sipariş detayında görünür", `Hakediş onaydan ${s.payoutHoldDays} gün sonra ödemeye hazır`, "Bazı kategorilerde farklı oran uygulanabilir"],
      cta: ["/kayit?rol=uzman", "Uzman olarak katıl"],
      accent: true,
    },
    {
      name: "Kurumsal üyelik",
      price: "Teklife göre",
      note: "İş hacmine ve hizmet düzeyine göre",
      items: ["Tek hesap yöneticisi", "Doğrulanmış uzmanlardan kısa liste", "Yazılı çalışma şartları ve gizlilik", "Dönemsel sipariş ve ödeme dökümü"],
      cta: ["/kurumsal", "Başvur"],
      accent: false,
    },
  ] as const;
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "Ücretler ve fiyatlar", path: "/fiyatlar" }]} />
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <p className="eyebrow mb-3">Ücretler</p>
        <h1 className="text-[length:var(--h2-size)] font-semibold">Şeffaf ücretler, sürpriz yok</h1>
        <p className="mt-4 text-[16px] text-ink-2">Hizmet almak ücretsizdir. Platform, yalnızca tamamlanan siparişlerden uzmandan hizmet bedeli alır; ödemeniz iş bitene kadar güvende kalır.</p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`card flex flex-col p-7 ${p.accent ? "ring-2 ring-accent" : ""}`}>
            <p className="text-[15px] font-semibold text-ink-2">{p.name}</p>
            <p className="mt-3 text-[40px] font-semibold leading-none tracking-[-0.03em]">{p.price}</p>
            <p className="mt-2 text-[13.5px] text-muted">{p.note}</p>
            <ul className="mt-6 space-y-2.5 text-[14.5px]">
              {p.items.map((x) => <li key={x} className="flex gap-2.5"><IconCheck size={15} className="mt-1 shrink-0 text-trust" />{x}</li>)}
            </ul>
            <div className="mt-auto pt-8"><ButtonLink href={p.cta[0]} variant={p.accent ? "accent" : "outline"} className="w-full">{p.cta[1]}</ButtonLink></div>
          </div>
        ))}
      </div>
      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-[22px] font-semibold">Uzmanlar için tanıtım</h2>
          <p className="mt-2 text-[14.5px] text-muted">İsteğe bağlı; satın alınmazsa sıralama puan, satış ve doğrulama durumuna göre yapılır.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-6"><p className="font-semibold">Öne çıkarma</p><p className="mt-2 text-[28px] font-semibold">{formatTRY(s.featuredPriceKurus)}</p><p className="mt-1 text-[13.5px] text-muted">7 gün · aramada ve ana sayfada “Öne çıkan” etiketiyle</p></div>
          <div className="card p-6"><p className="font-semibold">Premium üyelik</p><p className="mt-2 text-[28px] font-semibold">{formatTRY(s.premiumMonthlyKurus)}</p><p className="mt-1 text-[13.5px] text-muted">30 gün · sıralamada öncelik ve rozet; otomatik yenileme yok</p></div>
        </div>
      </section>
      <p className="mt-12 text-center text-[14px] text-muted">Sorunuz mu var? <Link href="/yardim" className="font-medium text-ink underline underline-offset-4">Yardım merkezi</Link> · <Link href="/iletisim" className="font-medium text-ink underline underline-offset-4">İletişim</Link></p>
    </div>
  );
}
