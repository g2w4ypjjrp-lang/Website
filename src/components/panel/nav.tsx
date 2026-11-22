"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; badge?: number };

export function PanelNav({ role, unreadMsg, unreadNotif }: { role: "customer" | "provider" | "admin"; unreadMsg: number; unreadNotif: number }) {
  const p = usePathname();
  const groups: { title?: string; items: Item[] }[] =
    role === "provider"
      ? [
          { items: [{ href: "/panel", label: "Genel bakış" }, { href: "/panel/siparisler", label: "Siparişler" }, { href: "/panel/mesajlar", label: "Mesajlar", badge: unreadMsg }, { href: "/panel/bildirimler", label: "Bildirimler", badge: unreadNotif }] },
          { title: "Satış", items: [{ href: "/panel/hizmetler", label: "Hizmetlerim" }, { href: "/panel/teklifler", label: "Tekliflerim" }, { href: "/panel/kazanc", label: "Kazanç ve ödemeler" }, { href: "/panel/tanitim", label: "Tanıtım ve premium" }, { href: "/panel/degerlendirmeler", label: "Değerlendirmeler" }] },
          { title: "Profil", items: [{ href: "/panel/profil", label: "Uzman profili" }, { href: "/panel/portfolyo", label: "Portföy" }, { href: "/panel/ayarlar", label: "Hesap ayarları" }] },
        ]
      : [
          { items: [{ href: "/panel", label: "Genel bakış" }, { href: "/panel/siparisler", label: "Siparişlerim" }, { href: "/panel/projeler", label: "Projelerim" }, { href: "/panel/mesajlar", label: "Mesajlar", badge: unreadMsg }, { href: "/panel/bildirimler", label: "Bildirimler", badge: unreadNotif }] },
          { title: "Hesap", items: [{ href: "/panel/favoriler", label: "Favoriler" }, { href: "/panel/ayarlar", label: "Hesap ve fatura" }, ...(role === "admin" ? [{ href: "/yonetim", label: "Yönetim paneli" }] : [])] },
        ];
  const isActive = (href: string) => (href === "/panel" ? p === "/panel" : p.startsWith(href));
  const all = groups.flatMap((g) => g.items);
  return (
    <>
      <nav aria-label="Panel" className="hidden lg:block">
        <div className="sticky top-[84px] space-y-6">
          {groups.map((g, i) => (
            <div key={i}>
              {g.title && <p className="mb-2 px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-faint">{g.title}</p>}
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} aria-current={isActive(it.href) ? "page" : undefined} className={cn("flex items-center justify-between rounded-lg px-3 py-2 text-[14.5px] transition-colors", isActive(it.href) ? "border border-line bg-surface font-medium text-ink shadow-xs" : "border border-transparent text-ink-2 hover:bg-paper-2 hover:text-ink")}>
                      {it.label}
                      {!!it.badge && <span className="num rounded-full bg-accent px-1.5 text-[11px] font-medium text-white">{it.badge}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      <nav aria-label="Panel" className="-mx-4 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] lg:hidden">
        <ul className="flex gap-5 whitespace-nowrap text-[14px]">
          {all.map((it) => (
            <li key={it.href}>
              <Link href={it.href} className={cn("-mb-px flex items-center gap-1.5 border-b-2 py-3", isActive(it.href) ? "border-ink font-medium" : "border-transparent text-muted")}>
                {it.label}
                {!!it.badge && <span className="num rounded-full bg-accent px-1.5 text-[10px] font-medium text-white">{it.badge}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
