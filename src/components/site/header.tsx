import Link from "next/link";
import { getCategoryTree } from "@/server/queries";
import { Logo } from "@/components/logo";
import { HeaderSearch } from "./header-search";
import { CategoryMenu, MobileMenu } from "./header-client";
import { HeaderAuth } from "./header-auth";
import { getThemeSettings } from "@/server/settings";
import { IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Statik/önbelleklenebilir başlık: kullanıcıya özel kısım (HeaderAuth) tarayıcıda yüklenir. */
export async function SiteHeader() {
  const [tree, { theme }] = await Promise.all([getCategoryTree(), getThemeSettings()]);
  const cats = tree.map((c) => ({ slug: c.slug, name: c.name, shortDescription: c.shortDescription, children: c.children.slice(0, 7).map((s) => ({ slug: s.slug, name: s.name })) }));
  // Tema 3 ve 4 (ChatGPT görselleri) genişletilmiş menü kullanır
  const wide = theme === "neo" || theme === "sunrise";
  const links: [string, string, string?][] = wide
    ? [["/projeler", "Projeler"], ["/uzmanlar", "Uzmanlar"], ["/kurumsal", "Kurumsal", "xl"], ...(theme === "sunrise" ? ([["/nasil-calisir", "Nasıl Çalışır?", "xl"]] as [string, string, string][]) : []), ["/fiyatlar", "Fiyatlar", "xl"]]
    : [["/projeler", "Proje ilanları"], ["/uzmanlar", "Uzmanlar"]];
  return (
    <header className={cn("sticky top-0 z-40 border-b border-line/80 backdrop-blur-md", theme === "neo" ? "bg-paper/85" : "bg-surface/95 supports-[backdrop-filter]:bg-surface/80")}>
      <div className="container-x flex h-16 items-center gap-4 md:gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          <CategoryMenu categories={cats} />
          {links.map(([href, label, bp]) => (
            <Link key={href} href={href} className={cn("rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink", bp === "xl" && "hidden xl:block")}>{label}</Link>
          ))}
        </nav>
        <div className="flex-1">
          {theme === "sunrise" ? (
            <div className="hidden justify-end md:flex">
              <Link href="/ara" aria-label="Ara" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 shadow-xs transition-colors hover:border-ink/30 hover:text-ink"><IconSearch size={17} /></Link>
            </div>
          ) : (
            <HeaderSearch shortcut={theme === "neo"} placeholder={theme === "neo" ? "Hizmet, uzman veya proje ara…" : undefined} />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <HeaderAuth variant={theme === "neo" ? "neo" : theme === "sunrise" ? "sunrise" : "default"} />
          <MobileMenu categories={cats} />
        </div>
      </div>
    </header>
  );
}
