"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Me = { user: { name: string; email: string; role: string; avatar: string | null; providerSlug: string | null } | null; unread?: number };

let cache: { at: number; p: Promise<Me> } | null = null;
function load(force = false) {
  if (!force && cache && Date.now() - cache.at < 30_000) return cache.p;
  const p = fetch("/api/me", { credentials: "same-origin", cache: "no-store" })
    .then((r) => r.json() as Promise<Me>)
    .catch(() => ({ user: null }) as Me);
  cache = { at: Date.now(), p };
  return p;
}

/** Oturum bilgisini tarayıcıda çeker; sayfa geçişlerinde 30 sn önbellekten okur. */
export function useMe() {
  const [me, setMe] = useState<Me | undefined>(undefined);
  const path = usePathname();
  useEffect(() => {
    let live = true;
    load(path.startsWith("/panel")).then((m) => live && setMe(m));
    return () => {
      live = false;
    };
  }, [path]);
  return me;
}
