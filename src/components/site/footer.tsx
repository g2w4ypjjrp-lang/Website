import Link from "next/link";
import { getCategoryTree } from "@/server/queries";
import { Logo } from "@/components/logo";
import { IconLock, IconShield } from "@/components/icons";
import { CITIES } from "@/lib/tr-cities";

export async function SiteFooter() {
  const tree = await getCategoryTree();
  return (
    <footer className="mt-24 border-t border-line bg-paper-2/60 pb-24 lg:pb-0">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[14px] text-muted">
            Türkiye’deki işletmelerin dijital işlerini doğru uzmanla buluşturan pazaryeri. Ödemeniz, siz teslimatı onaylayana kadar güvencede tutulur.
          </p>
          <div className="mt-5 space-y-2 text-[13px] text-ink-2">
            <p className="flex items-center gap-2"><IconShield size={15} className="text-trust" /> Onaylanana kadar korunan ödeme</p>
            <p className="flex items-center gap-2"><IconLock size={15} className="text-trust" /> Kart bilgisi Eksen sunucularında tutulmaz</p>
          </div>
        </div>
        <FooterCol title="Hizmetler" links={tree.slice(0, 6).map((c) => [`/kategori/${c.slug}`, c.name])} />
        <FooterCol
          title="Popüler"
          links={[
            ["/web-sitesi-yaptirma", "Web sitesi yaptırma"],
            ["/e-ticaret-sitesi", "E-ticaret sitesi"],
            ["/mobil-uygulama-gelistirme", "Mobil uygulama"],
            ["/logo-tasarimi", "Logo tasarımı"],
            ["/seo-hizmeti", "SEO hizmeti"],
            ["/qr-menu", "QR menü"],
          ]}
        />
        <FooterCol
          title="Eksen"
          links={[
            ["/nasil-calisir", "Nasıl çalışır?"],
            ["/uzman-ol", "Uzman olarak katıl"],
            ["/kurumsal", "Kurumsal üyelik"],
            ["/projeler", "Proje ilanları"],
            ["/uzmanlar", "Uzmanlar"],
            ["/blog", "Rehberler"],
            ["/sayfa/hakkimizda", "Hakkımızda"],
          ]}
        />
        <FooterCol
          title="Yasal"
          links={[
            ["/sayfa/kullanim-kosullari", "Kullanım koşulları"],
            ["/sayfa/gizlilik-politikasi", "Gizlilik politikası"],
            ["/sayfa/kvkk-aydinlatma-metni", "KVKK aydınlatma metni"],
            ["/sayfa/mesafeli-satis-sozlesmesi", "Mesafeli satış sözleşmesi"],
            ["/sayfa/iade-ve-iptal", "İade ve iptal koşulları"],
            ["/sayfa/cerez-politikasi", "Çerez politikası"],
          ]}
        />
      </div>
      <nav aria-label="İllere göre dijital hizmetler" className="border-t border-line">
        <div className="container-x py-6">
          <p className="mb-2 text-[13px] font-semibold text-ink">İllere göre</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
            {CITIES.filter((c) => c.metro)
              .sort((a, b) => a.name.localeCompare(b.name, "tr"))
              .map((c) => (
                <li key={c.slug}><Link href={`/il/${c.slug}`} className="text-ink-2 hover:text-ink">{c.name}</Link></li>
              ))}
            <li><Link href="/il" className="font-medium text-ink underline underline-offset-2">Tüm 81 il</Link></li>
          </ul>
        </div>
      </nav>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-[12.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Eksen. Tüm hakları saklıdır.</p>
          <p>Fiyatlara KDV dahildir. Ödemeler lisanslı ödeme kuruluşu aracılığıyla alınır.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 text-[13px] font-semibold text-ink">{title}</p>
      <ul className="space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-[14px] text-ink-2 hover:text-ink">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
