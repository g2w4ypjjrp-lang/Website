"use client";
import { useActionState, useState } from "react";
import { submitOfferAction } from "@/app/actions/market";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";
import { formatTRY } from "@/lib/utils";

export function OfferForm({ projectId, initial, commissionPct = 15 }: { projectId: string; initial?: { price: number; days: number; message: string }; commissionPct?: number }) {
  const [state, action] = useActionState<FormState, FormData>(submitOfferAction, undefined);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      {state?.ok && <Notice tone="ok">{state.ok}</Notice>}
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fiyat (₺)" htmlFor="price" error={fe.price}>
          <input id="price" name="price" inputMode="numeric" defaultValue={initial?.price} onChange={(e) => setPrice(Number(e.target.value) || 0)} className="field" required />
        </Field>
        <Field label="Süre (gün)" htmlFor="days" error={fe.days}>
          <input id="days" name="days" inputMode="numeric" defaultValue={initial?.days} className="field" required />
        </Field>
      </div>
      {price > 0 && <p className="-mt-2 text-[12.5px] text-muted">Tahmini net kazancınız: <span className="num text-ink">{formatTRY(Math.round(price * (100 - commissionPct)))}</span> (komisyon kategoriye göre değişebilir)</p>}
      <Field label="Teklif açıklaması" htmlFor="message" error={fe.message} hint="İşi nasıl yapacağınızı, teslim aşamalarını ve kapsam dışında kalanları yazın.">
        <textarea id="message" name="message" defaultValue={initial?.message} rows={6} className="field" required />
      </Field>
      <SubmitButton className="w-full" pendingText="Gönderiliyor">{initial ? "Teklifi güncelle" : "Teklifi gönder"}</SubmitButton>
    </form>
  );
}
