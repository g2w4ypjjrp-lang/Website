"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconSearch, IconPlus, IconChat, IconUser } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Mobilde uygulama hissi veren alt gezinme çubuğu. Masaüstünde gizlenir. */
export function TabBar({ loggedIn }: { loggedIn: boolean }) {
  const p = usePathname();
  const items = [
    { href: "/", label: "Keşfet", icon: IconHome, match: (x: string) => x === "/" },
    { href: "/ara", label: "Ara", icon: IconSearch, match: (x: string) => x.startsWith("/ara") || x.startsWith("/kategori") },
    { href: "/proje-olustur", label: "Proje ver", icon: IconPlus, match: (x: string) => x.startsWith("/proje-olustur"), primary: true },
    { href: loggedIn ? "/panel/mesajlar" : "/giris", label: "Mesajlar", icon: IconChat, match: (x: string) => x.startsWith("/panel/mesajlar") },
    { href: loggedIn ? "/panel" : "/giris", label: loggedIn ? "Hesabım" : "Giriş", icon: IconUser, match: (x: string) => x === "/panel" || x.startsWith("/giris") },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden" aria-label="Alt gezinme">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.match(p);
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <Link href={it.href} className={cn("flex h-[58px] flex-col items-center justify-center gap-1 text-[11px]", active ? "text-ink" : "text-muted")} aria-current={active ? "page" : undefined}>
                {it.primary ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white"><Icon size={18} /></span>
                ) : (
                  <Icon size={20} />
                )}
                <span className={cn(active && "font-medium")}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
