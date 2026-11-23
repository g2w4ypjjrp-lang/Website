"use client";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { IconBell, IconChat } from "@/components/icons";
import { UserMenu } from "./header-client";
import { useMe } from "./use-me";

export function HeaderAuth({ variant = "default" }: { variant?: "default" | "neo" | "sunrise" }) {
  const me = useMe();
  // Yüklenirken sabit genişlikte boş alan: düzen kaymaz
  if (me === undefined) return <div className="hidden h-9 w-[200px] sm:block" aria-hidden />;
  if (!me.user)
    return (
      <>
        {variant === "default" && <Link href="/uzman-ol" className="hidden px-2 text-[14.5px] text-ink-2 hover:text-ink xl:block">Uzman olarak katıl</Link>}
        <Link href="/giris" className="hidden rounded-md px-3 py-2 text-[14.5px] font-medium text-ink hover:bg-paper-2 sm:block">{variant === "sunrise" ? "Giriş Yap" : "Giriş yap"}</Link>
        {variant === "neo" ? (
          <ButtonLink href="/proje-olustur" size="sm" variant="accent" className="hidden sm:inline-flex">+ Proje oluştur</ButtonLink>
        ) : variant === "sunrise" ? (
          <ButtonLink href="/kayit" size="sm" variant="accent" className="hidden !h-10 !px-5 sm:inline-flex">Ücretsiz Kayıt Ol</ButtonLink>
        ) : (
          <ButtonLink href="/kayit" size="sm" className="hidden sm:inline-flex">Ücretsiz kayıt</ButtonLink>
        )}
      </>
    );
  const unread = me.unread ?? 0;
  return (
    <>
      <Link href="/panel/mesajlar" className="hidden h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-paper-2 md:flex" aria-label="Mesajlar"><IconChat size={18} /></Link>
      <Link href="/panel/bildirimler" className="relative flex h-9 w-9 items-center justify-center rounded-md text-ink-2 hover:bg-paper-2" aria-label={`Bildirimler${unread ? `, ${unread} okunmamış` : ""}`}>
        <IconBell size={18} />
        {unread > 0 && <span className="num absolute right-1 top-1 min-w-[16px] rounded-full bg-accent px-1 text-center text-[10px] leading-4 text-white">{unread > 9 ? "9+" : unread}</span>}
      </Link>
      <UserMenu user={me.user} />
      {variant === "neo" && <ButtonLink href="/proje-olustur" size="sm" variant="accent" className="ml-1 hidden lg:inline-flex">+ Proje oluştur</ButtonLink>}
    </>
  );
}
