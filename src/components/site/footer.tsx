import Link from "next/link";
import { getCategoryTree } from "@/server/queries";
import { getThemeSettings, type SocialLinks } from "@/server/settings";
import { Logo, logoVariant } from "@/components/logo";
import { IconFacebook, IconInstagram, IconLinkedin, IconLock, IconShield, IconXSocial, IconYoutube } from "@/components/icons";
import { CITIES } from "@/lib/tr-cities";
import { cn } from "@/lib/utils";

const SOCIAL: [keyof SocialLinks, string, (p: { size?: number }) => React.ReactNode][] = [
  ["instagram", "Instagram", (p) => <IconInstagram {...p} />],
  ["linkedin", "LinkedIn", (p) => <IconLinkedin {...p} />],
  ["x", "X", (p) => <IconXSocial {...p} />],
  ["youtube", "YouTube", (p) => <IconYoutube {...p} />],
  ["facebook", "Facebook", (p) => <IconFacebook {...p} />],
];

/**
 * Kurumsal alt bilgi. Modern Premium temasında koyu, Light Professional temasında açık zemin.
 * Sosyal ağ bağlantıları yalnızca Yönetim → Tema ekranında girilen hesaplar için gösterilir.
 */
export async function SiteFooter() {
  const [tree, { theme, social }] = await Promise.all([getCategoryTree(), getThemeSettings()]);
  const dark = theme === "premium" || theme === "neo" || theme === "ultra";
  const t = {
    // Koyu temada "ink" dolgusu mor olduğu için alt bilgi sabit koyu lacivert
    wrap: theme === "neo" ? "border-t border-line bg-[#080a1c] text-white/70" : theme === "ultra" ? "bg-[#0a1628] text-white/70" : dark ? "bg-ink text-white/70" : "border-t border-line bg-paper-2/70 text-ink-2",
    text: dark ? "text-white/60" : "text-muted",
    head: dark ? "text-white" : "text-ink",
    link: dark ? "text-white/60 hover:text-white" : "text-ink-2 hover:text-ink",
    rule: dark ? "border-white/10" : "border-line",
    chip: dark ? "bg-white/10" : "bg-surface border border-line",
    icon: theme === "ultra" ? "text-[#8fb0ff]" : dark ? "text-[#6fd0b9]" : "text-trust",
    social: dark ? "border-white/15 text-white/70 hover:border-white/40 hover:text-white" : "border-line bg-surface text-ink-2 hover:border-ink/40 hover:text-ink",
  };
  const socials = SOCIAL.filter(([k]) => social[k]);
  return (
    <footer className={cn("mt-24 pb-24 lg:pb-0", t.wrap)}>
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs sm:col-span-2 lg:col-span-1">
          <Logo tone={dark ? "light" : "ink"} variant={logoVariant(theme)} />
          <p className={cn("mt-4 text-[14px]", t.text)}>Türkiye’deki işletmelerin dijital işlerini doğru uzmanla buluşturan pazaryeri. Ödemeniz, siz teslimatı onaylayana kadar güvencede tutulur.</p>
          <div className="mt-6 space-y-2.5 text-[13px]">
            <p className="flex items-center gap-2.5"><span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", t.chip)}><IconShield size={14} className={t.icon} /></span> Onaylanana kadar korunan ödeme</p>
            <p className="flex items-center gap-2.5"><span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", t.chip)}><IconLock size={14} className={t.icon} /></span> Kart bilgisi Eksen sunucularında tutulmaz</p>
          </div>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Sosyal medya">
              {socials.map(([k, label, I]) => (
                <li key={k}>
                  <a href={social[k]} target="_blank" rel="noopener me" aria-label={label} className={cn("flex h-9 w-9 items-center justify-center rounded-full border transition-colors", t.social)}>{I({ size: 16 })}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol t={t} title="Hizmet kategorileri" links={tree.slice(0, 8).map((c) => [`/kategori/${c.slug}`, c.name])} />
        <FooterCol
          t={t}
          title="Uzmanlar"
          links={[
            ["/uzmanlar", "Uzmanları keşfet"],
            ["/uzman-ol", "Freelancer olmak"],
            ["/projeler", "Proje ilanları"],
            ["/ara?tur=ajanslar", "Ajanslar"],
            ["/kurumsal", "Kurumsal üyelik"],
            ["/fiyatlar", "Ücretler ve fiyatlar"],
          ]}
        />
        <FooterCol
          t={t}
          title="Eksen"
          links={[
            ["/sayfa/hakkimizda", "Hakkımızda"],
            ["/nasil-calisir", "Nasıl çalışır?"],
            ["/yardim", "Yardım merkezi"],
            ["/iletisim", "İletişim"],
            ["/blog", "Rehberler"],
          ]}
        />
        <FooterCol
          t={t}
          title="Yasal"
          links={[
            ["/sayfa/gizlilik-politikasi", "Gizlilik"],
            ["/sayfa/kullanim-kosullari", "Kullanım koşulları"],
            ["/sayfa/kvkk-aydinlatma-metni", "KVKK"],
            ["/sayfa/mesafeli-satis-sozlesmesi", "Mesafeli satış sözleşmesi"],
            ["/sayfa/iade-ve-iptal", "İade ve iptal"],
            ["/sayfa/cerez-politikasi", "Çerez politikası"],
          ]}
        />
      </div>
      <nav aria-label="Popüler hizmetler ve iller" className={cn("border-t", t.rule)}>
        <div className="container-x grid gap-6 py-7 text-[13px] lg:grid-cols-[1fr_2fr]">
          <div>
            <p className={cn("mb-3 font-semibold", t.head)}>Popüler hizmetler</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {[
                ["/web-sitesi-yaptirma", "Web sitesi yaptırma"],
                ["/e-ticaret-sitesi", "E-ticaret sitesi"],
                ["/mobil-uygulama-gelistirme", "Mobil uygulama"],
                ["/logo-tasarimi", "Logo tasarımı"],
                ["/seo-hizmeti", "SEO hizmeti"],
                ["/sosyal-medya-yonetimi", "Sosyal medya yönetimi"],
              ].map(([href, l]) => <li key={href}><Link href={href} className={cn("transition-colors", t.link)}>{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className={cn("mb-3 font-semibold", t.head)}>İllere göre</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {CITIES.filter((c) => c.metro)
                .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                .map((c) => <li key={c.slug}><Link href={`/il/${c.slug}`} className={cn("transition-colors", t.link)}>{c.name}</Link></li>)}
              <li><Link href="/il" className={cn("font-medium underline decoration-accent-bright underline-offset-4", t.head)}>Tüm 81 il</Link></li>
            </ul>
          </div>
        </div>
      </nav>
      <div className={cn("border-t", t.rule)}>
        <div className={cn("container-x flex flex-col gap-2 py-6 text-[12.5px] sm:flex-row sm:items-center sm:justify-between", t.text)}>
          <p>© {new Date().getFullYear()} Eksen. Tüm hakları saklıdır.</p>
          <p>Fiyatlara KDV dahildir. Ödemeler lisanslı ödeme kuruluşu aracılığıyla alınır.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, t }: { title: string; links: [string, string][]; t: { head: string; link: string } }) {
  return (
    <div>
      <p className={cn("mb-4 text-[13px] font-semibold", t.head)}>{title}</p>
      <ul className="space-y-2.5">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className={cn("text-[14px] transition-colors", t.link)}>{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
