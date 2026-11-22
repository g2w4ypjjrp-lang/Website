import Link from "next/link";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { getCategoryTree } from "@/server/queries";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { IconBell, IconChat } from "@/components/icons";
import { HeaderSearch } from "./header-search";
import { CategoryMenu, MobileMenu, UserMenu } from "./header-client";
import { fileUrl } from "@/lib/utils";

export async function SiteHeader({ hideSearch = false }: { hideSearch?: boolean }) {
  const [user, tree] = await Promise.all([getCurrentUser(), getCategoryTree()]);
  const unread = user
    ? (
        await db
          .select({ n: sql<number>`count(*)::int` })
          .from(notifications)
          .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)))
      )[0]!.n
    : 0;
  const cats = tree.map((c) => ({ slug: c.slug, name: c.name, shortDescription: c.shortDescription, children: c.children.slice(0, 7).map((s) => ({ slug: s.slug, name: s.name })) }));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
      <div className="container-x flex h-[60px] items-center gap-4 md:gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          <CategoryMenu categories={cats} />
          <Link href="/projeler" className="rounded-md px-3 py-2 text-[14.5px] text-ink-2 hover:bg-paper-2 hover:text-ink">Proje ilanları</Link>
          <Link href="/uzmanlar" className="rounded-md px-3 py-2 text-[14.5px] text-ink-2 hover:bg-paper-2 hover:text-ink">Uzmanlar</Link>
        </nav>
        <div className="flex-1">{!hideSearch && <HeaderSearch />}</div>
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <Link href="/panel/mesajlar" className="hidden h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-paper-2 md:flex" aria-label="Mesajlar">
                <IconChat size={18} />
              </Link>
              <Link href="/panel/bildirimler" className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-paper-2" aria-label={`Bildirimler${unread ? `, ${unread} okunmamış` : ""}`}>
                <IconBell size={18} />
                {unread > 0 && <span className="num absolute right-1 top-1 min-w-[16px] rounded-full bg-accent px-1 text-center text-[10px] leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <UserMenu user={{ name: user.name, email: user.email, role: user.role, avatar: fileUrl(user.avatarId), providerSlug: user.providerSlug }} />
            </>
          ) : (
            <>
              <Link href="/uzman-ol" className="hidden px-2 text-[14.5px] text-ink-2 hover:text-ink xl:block">Uzman olarak katıl</Link>
              <Link href="/giris" className="hidden rounded-md px-3 py-2 text-[14.5px] font-medium text-ink hover:bg-paper-2 sm:block">Giriş yap</Link>
              <ButtonLink href="/kayit" size="sm" className="hidden sm:inline-flex">Ücretsiz kaydol</ButtonLink>
            </>
          )}
          <MobileMenu categories={cats} loggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
