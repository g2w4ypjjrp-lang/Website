"use client";
import { useEffect, useRef } from "react";

/** Seçim değiştiğinde formu gönderir (radyo, select, checkbox). Metin alanları Enter/Uygula ile gönderilir. */
export function AutoSubmit() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (t.type === "radio" || t.type === "checkbox" || t.tagName === "SELECT") form.requestSubmit();
    };
    form.addEventListener("change", onChange);
    return () => form.removeEventListener("change", onChange);
  }, []);
  return <span ref={ref} hidden />;
}
