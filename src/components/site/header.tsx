import Link from "next/link";
import { getCategoryTree } from "@/server/queries";
import { Logo } from "@/components/logo";
import { HeaderSearch } from "./header-search";
import { CategoryMenu, MobileMenu } from "./header-client";
import { HeaderAuth } from "./header-auth";

/** Statik/önbelleklenebilir başlık: kullanıcıya özel kısım (HeaderAuth) tarayıcıda yüklenir. */
export async function SiteHeader() {
  const tree = await getCategoryTree();
  const cats = tree.map((c) => ({ slug: c.slug, name: c.name, shortDescription: c.shortDescription, children: c.children.slice(0, 7).map((s) => ({ slug: s.slug, name: s.name })) }));
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <div className="container-x flex h-16 items-center gap-4 md:gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          <CategoryMenu categories={cats} />
          <Link href="/projeler" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink">Proje ilanları</Link>
          <Link href="/uzmanlar" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink">Uzmanlar</Link>
        </nav>
        <div className="flex-1"><HeaderSearch /></div>
        <div className="flex items-center gap-1.5">
          <HeaderAuth />
          <MobileMenu categories={cats} />
        </div>
      </div>
    </header>
  );
}
