"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconHeart } from "@/components/icons";
import { setFavLocal, useMe } from "@/components/site/use-me";
import { cn } from "@/lib/utils";

/**
 * Hizmet kartındaki favori (kalp) butonu. Sayfa önbellekli olduğu için durum tarayıcıda oturum özetinden okunur;
 * giriş yapmamış kullanıcı giriş sayfasına yönlendirilir.
 */
export function FavoriteButton({ id, className }: { id: string; className?: string }) {
  const me = useMe();
  const router = useRouter();
  const path = usePathname();
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setOn(!!me?.favs?.includes(id)), [me, id]);
  return (
    <button
      type="button"
      aria-label={on ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-pressed={on}
      disabled={busy}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (me && !me.user) return router.push(`/giris?sonra=${encodeURIComponent(path)}`);
        setBusy(true);
        setOn(!on);
        try {
          const r = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "service", id }) });
          if (r.status === 401) return router.push(`/giris?sonra=${encodeURIComponent(path)}`);
          const j = (await r.json()) as { favorited?: boolean };
          if (typeof j.favorited === "boolean") {
            setOn(j.favorited);
            setFavLocal(id, j.favorited);
          }
        } catch {
          setOn(on);
        } finally {
          setBusy(false);
        }
      }}
      className={cn(
        "z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 text-ink-2 shadow-xs ring-1 ring-black/5 transition-[color,transform] hover:scale-105 hover:text-accent",
        on && "text-accent",
        className,
      )}
    >
      <IconHeart size={15} filled={on} />
    </button>
  );
}
