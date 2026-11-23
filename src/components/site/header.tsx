import Link from "next/link";
import { getCategoryTree } from "@/server/queries";
import { Logo, logoVariant } from "@/components/logo";
import { HeaderSearch } from "./header-search";
import { CategoryMenu, MobileMenu } from "./header-client";
import { HeaderAuth } from "./header-auth";
import { getThemeSettings } from "@/server/settings";
import { IconSearch, IconShield } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Statik/önbelleklenebilir başlık: kullanıcıya özel kısım (HeaderAuth) tarayıcıda yüklenir. */
export async function SiteHeader() {
  const [tree, { theme }] = await Promise.all([getCategoryTree(), getThemeSettings()]);
  const cats = tree.map((c) => ({ slug: c.slug, name: c.name, shortDescription: c.shortDescription, children: c.children.slice(0, 7).map((s) => ({ slug: s.slug, name: s.name })) }));
  const variant = logoVariant(theme);
  // Tema 3 ve 4 (ChatGPT görselleri) genişletilmiş menü kullanır; Tema 5 kurumsal menü
  const links: [string, string, string?][] =
    theme === "neo" || theme === "sunrise"
      ? [["/projeler", "Projeler"], ["/uzmanlar", "Uzmanlar"], ["/kurumsal", "Kurumsal", "xl"], ...(theme === "sunrise" ? ([["/nasil-calisir", "Nasıl Çalışır?", "xl"]] as [string, string, string][]) : []), ["/fiyatlar", "Fiyatlar", "xl"]]
      : theme === "ultra"
        ? [["/uzmanlar", "Uzmanlar"], ["/projeler", "Proje ilanları"], ["/kurumsal", "Kurumsal", "xl"], ["/fiyatlar", "Fiyatlar", "xl"]]
        : [["/projeler", "Proje ilanları"], ["/uzmanlar", "Uzmanlar"]];
  return (
    <>
      {theme === "ultra" && (
        // Kurumsal üst bilgi şeridi: sayfayla birlikte kayar, yapışkan başlık altında kalır
        <div className="hidden bg-[#0a1628] text-[12.5px] text-white/70 md:block">
          <div className="container-x flex h-9 items-center justify-between gap-6">
            <p className="flex items-center gap-2"><IconShield size={13} className="text-[#8fb0ff]" /> Ödemeniz, teslimatı onaylayana kadar güvende.</p>
            <nav aria-label="Kurumsal bağlantılar" className="flex items-center gap-5">
              {[["/kurumsal", "Kurumsal çözümler"], ["/uzman-ol", "Uzman olun"], ["/yardim", "Yardım merkezi"], ["/iletisim", "İletişim"]].map(([href, l]) => (
                <Link key={href} href={href} className="transition-colors hover:text-white">{l}</Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      <header className={cn("sticky top-0 z-40 border-b border-line/80 backdrop-blur-md", theme === "neo" ? "bg-paper/85" : "bg-surface/95 supports-[backdrop-filter]:bg-surface/80")}>
        <div className="container-x flex h-16 items-center gap-4 md:gap-6">
          <Logo variant={variant} />
          {(theme === "sunrise" || theme === "ultra") && <span aria-hidden className="hidden h-7 w-px bg-line lg:block" />}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
            <CategoryMenu categories={cats} />
            {links.map(([href, label, bp]) => (
              <Link key={href} href={href} className={cn("rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink", bp === "xl" && "hidden xl:block")}>{label}</Link>
            ))}
          </nav>
          <div className="flex-1">
            {theme === "sunrise" ? (
              <div className="hidden items-center justify-end gap-2 md:flex">
                <Link href="/ara" aria-label="Ara" className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-2 text-ink-2 transition-colors hover:text-ink"><IconSearch size={17} /></Link>
              </div>
            ) : (
              <HeaderSearch shortcut={theme === "neo"} placeholder={theme === "neo" ? "Hizmet, uzman veya proje ara…" : theme === "ultra" ? "Hizmet veya uzman arayın" : undefined} />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <HeaderAuth variant={variant} />
            <MobileMenu categories={cats} />
          </div>
        </div>
      </header>
    </>
  );
}
