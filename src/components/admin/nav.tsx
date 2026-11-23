"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { IconMenu, IconX } from "@/components/icons";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export function AdminNav({ name, pending, open, leads = 0 }: { name: string; pending: number; open: number; leads?: number }) {
  const p = usePathname();
  const [mobile, setMobile] = useState(false);
  const groups: [string, [string, string, number?][]][] = [
    ["Genel", [["/yonetim", "Özet ve analitik"], ["/yonetim/talepler", "İade ve şikâyetler", open]]],
    ["Pazaryeri", [["/yonetim/kullanicilar", "Kullanıcılar"], ["/yonetim/hizmetler", "Hizmetler", pending], ["/yonetim/siparisler", "Siparişler"], ["/yonetim/degerlendirmeler", "Değerlendirmeler"], ["/yonetim/finans", "Finans"], ["/yonetim/kurumsal", "Başvurular ve mesajlar", leads]]],
    ["İçerik", [["/yonetim/kategoriler", "Kategoriler"], ["/yonetim/seo", "SEO"], ["/yonetim/yerel-seo", "Yerel SEO · 81 il"], ["/yonetim/blog", "Blog"], ["/yonetim/icerik", "Sayfalar ve bannerlar"]]],
    ["Sistem", [["/yonetim/tema", "Tema ve görünüm"], ["/yonetim/ayarlar", "Ayarlar"], ["/yonetim/guvenlik", "Güvenlik ve 2FA"], ["/yonetim/duyuru", "Sistem duyurusu"], ["/yonetim/loglar", "Denetim kayıtları"]]],
  ];
  const active = (h: string) => (h === "/yonetim" ? p === h : p.startsWith(h));
  const nav = (
    <nav className="space-y-6 text-[14px]">
      {groups.map(([g, items]) => (
        <div key={g}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">{g}</p>
          <ul>
            {items.map(([h, l, b]) => (
              <li key={h}>
                <Link href={h} onClick={() => setMobile(false)} className={cn("flex items-center justify-between rounded px-3 py-1.5", active(h) ? "bg-white/10 text-white" : "text-white/70 hover:text-white")}>
                  {l}
                  {!!b && <span className="num rounded-full bg-accent px-1.5 text-[11px] font-medium text-white">{b}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <div className="flex h-14 items-center justify-between bg-[#111318] px-4 text-white lg:hidden">
        <span className="flex items-center gap-2 font-display font-bold"><LogoMark size={18} /> eksen <span className="font-mono text-[11px] font-normal text-white/50">YÖNETİM</span></span>
        <button onClick={() => setMobile(!mobile)} aria-label="Menü">{mobile ? <IconX size={20} /> : <IconMenu size={20} />}</button>
      </div>
      {mobile && <div className="bg-[#111318] px-3 pb-6 lg:hidden">{nav}</div>}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-[#111318] px-3 py-5 text-white lg:flex">
        <Link href="/yonetim" className="mb-8 flex items-center gap-2 px-3 font-display text-[18px] font-bold tracking-[-0.04em]"><LogoMark size={20} /> eksen <span className="font-mono text-[10px] font-normal tracking-[0.12em] text-white/40">YÖNETİM</span></Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="mt-6 border-t border-white/10 px-3 pt-4 text-[13px] text-white/60">
          <p className="truncate">{name}</p>
          <div className="mt-2 flex gap-4"><Link href="/" className="hover:text-white">Siteye dön</Link><form action={logoutAction}><button className="hover:text-white">Çıkış</button></form></div>
        </div>
      </aside>
    </>
  );
}
