"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconChevronDown, IconMenu, IconX, IconArrowRight } from "@/components/icons";
import { Avatar } from "@/components/ui/primitives";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { useMe } from "./use-me";

type Cat = { slug: string; name: string; shortDescription: string; children: { slug: string; name: string }[] };

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onOut();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

export function CategoryMenu({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useClickOutside(ref, () => setOpen(false));
  useEffect(() => setOpen(false), [pathname]);
  const cur = categories[active];
  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-[14.5px] text-ink-2 hover:bg-paper-2 hover:text-ink"
      >
        Hizmetler <IconChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && cur && (
        <div className="absolute left-0 top-full pt-2">
          <div className="grid w-[680px] grid-cols-[220px_1fr] overflow-hidden rounded-lg border border-line bg-surface shadow-pop animate-rise">
            <ul className="border-r border-line-2 bg-paper/50 py-2">
              {categories.map((c, i) => (
                <li key={c.slug}>
                  <Link
                    href={`/kategori/${c.slug}`}
                    onMouseEnter={() => setActive(i)}
                    className={cn("flex items-center justify-between px-4 py-2 text-[14px]", i === active ? "bg-surface font-medium text-ink" : "text-ink-2")}
                  >
                    {c.name}
                    {i === active && <span className="h-1.5 w-1.5 bg-accent" />}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-5">
              <p className="font-display text-[17px] font-semibold">{cur.name}</p>
              <p className="mt-1 text-[13.5px] text-muted">{cur.shortDescription}</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1">
                {cur.children.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/kategori/${s.slug}`} className="block rounded px-2 py-1.5 -mx-2 text-[14px] text-ink-2 hover:bg-paper hover:text-ink">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/kategori/${cur.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink hover:text-accent-strong">
                Tüm {cur.name.toLocaleLowerCase("tr-TR")} hizmetleri <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserMenu({ user }: { user: { name: string; email: string; role: string; avatar: string | null; providerSlug: string | null } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useClickOutside(ref, () => setOpen(false));
  useEffect(() => setOpen(false), [pathname]);
  const links: [string, string][] = [
    ["/panel", "Panelim"],
    ["/panel/siparisler", "Siparişler"],
    ...(user.role === "provider" ? ([["/panel/hizmetler", "Hizmetlerim"], ["/panel/kazanc", "Kazançlar"]] as [string, string][]) : ([["/panel/projeler", "Projelerim"], ["/panel/favoriler", "Favoriler"]] as [string, string][])),
    ...(user.providerSlug ? ([[`/uzman/${user.providerSlug}`, "Herkese açık profilim"]] as [string, string][]) : []),
    ["/panel/ayarlar", "Hesap ayarları"],
    ...(user.role === "admin" ? ([["/yonetim", "Yönetim paneli"]] as [string, string][]) : []),
  ];
  return (
    <div ref={ref} className="relative hidden md:block">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-1.5 rounded-md p-1 pr-1.5 hover:bg-paper-2">
        <Avatar name={user.name} src={user.avatar} size={30} />
        <IconChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-pop animate-rise">
          <div className="border-b border-line-2 px-4 py-3">
            <p className="truncate text-[14px] font-medium">{user.name}</p>
            <p className="truncate text-[12.5px] text-muted">{user.email}</p>
          </div>
          <ul className="py-1.5">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="block px-4 py-2 text-[14px] text-ink-2 hover:bg-paper hover:text-ink">{label}</Link>
              </li>
            ))}
          </ul>
          <form action={logoutAction} className="border-t border-line-2 py-1.5">
            <button className="block w-full px-4 py-2 text-left text-[14px] text-ink-2 hover:bg-paper hover:text-ink">Çıkış yap</button>
          </form>
        </div>
      )}
    </div>
  );
}

export function MobileMenu({ categories }: { categories: Cat[] }) {
  const me = useMe();
  const loggedIn = !!me?.user;
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md text-ink hover:bg-paper-2 lg:hidden" aria-label="Menüyü aç">
        <IconMenu size={20} />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden" role="dialog" aria-modal="true" aria-label="Menü">
          <div className="flex h-[60px] items-center justify-between border-b border-line px-4">
            <span className="font-display text-[19px] font-bold tracking-[-0.04em]">Menü</span>
            <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-paper-2" aria-label="Menüyü kapat">
              <IconX size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-28 pt-2">
            <p className="eyebrow mb-1 mt-4">Hizmetler</p>
            <ul className="divide-y divide-line-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <button type="button" onClick={() => setExpanded((e) => (e === c.slug ? null : c.slug))} className="flex w-full items-center justify-between py-3.5 text-left text-[16px] font-medium" aria-expanded={expanded === c.slug}>
                    {c.name}
                    <IconChevronDown size={16} className={cn("text-muted transition-transform", expanded === c.slug && "rotate-180")} />
                  </button>
                  {expanded === c.slug && (
                    <ul className="pb-3">
                      <li>
                        <Link href={`/kategori/${c.slug}`} className="block py-2 pl-3 text-[15px] font-medium text-accent-strong">Tümünü gör</Link>
                      </li>
                      {c.children.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/kategori/${s.slug}`} className="block py-2 pl-3 text-[15px] text-ink-2">{s.name}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <p className="eyebrow mb-1 mt-8">Keşfet</p>
            <ul className="divide-y divide-line-2 text-[16px]">
              <li><Link href="/projeler" className="block py-3.5">Proje ilanları</Link></li>
              <li><Link href="/uzmanlar" className="block py-3.5">Uzmanlar</Link></li>
              <li><Link href="/nasil-calisir" className="block py-3.5">Nasıl çalışır?</Link></li>
              <li><Link href="/blog" className="block py-3.5">Rehberler</Link></li>
              <li><Link href="/uzman-ol" className="block py-3.5">Uzman olarak katıl</Link></li>
            </ul>
          </div>
          {!loggedIn && (
            <div className="fixed inset-x-0 bottom-0 grid grid-cols-2 gap-2 border-t border-line bg-paper p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              <Link href="/giris" className="flex h-12 items-center justify-center rounded-md border border-line bg-surface font-medium">Giriş yap</Link>
              <Link href="/kayit" className="flex h-12 items-center justify-center rounded-md bg-ink font-medium text-white">Kaydol</Link>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
