"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Beacon() {
  const path = usePathname();
  useEffect(() => {
    let v = false;
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("ek_v") !== today) {
        localStorage.setItem("ek_v", today);
        v = true;
      }
    } catch {}
    const payload = JSON.stringify({ p: path, r: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : "", v });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/t", new Blob([payload], { type: "application/json" }));
    else fetch("/api/t", { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }, [path]);
  return null;
}
