"use client";
import { useActionState, useState } from "react";
import { reportAction } from "@/app/actions/market";
import type { FormState } from "@/app/actions/auth";
import { IconFlag } from "@/components/icons";
import { SubmitButton } from "@/components/ui/button";

export function ReportButton({ targetType, targetId, label = "Şikâyet et" }: { targetType: string; targetId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(reportAction, undefined);
  if (state?.ok) return <p className="text-[13px] text-trust">{state.ok}</p>;
  return open ? (
    <form action={action} className="space-y-2 rounded-md border border-line bg-surface p-3 text-[13.5px]">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <select name="reason" className="field !py-1.5 text-[13.5px]" required defaultValue="">
        <option value="" disabled>Neden seçin</option>
        <option>Platform dışı ödeme talebi</option>
        <option>Spam veya reklam</option>
        <option>Sahte profil veya içerik</option>
        <option>Hakaret veya taciz</option>
        <option>Telif hakkı ihlali</option>
        <option>Diğer</option>
      </select>
      <textarea name="details" rows={2} placeholder="Ayrıntı (isteğe bağlı)" className="field !min-h-[60px] text-[13.5px]" />
      {state?.error && <p className="text-bad">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton size="sm" variant="danger">Gönder</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="text-muted">Vazgeç</button>
      </div>
    </form>
  ) : (
    <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-bad">
      <IconFlag size={14} /> {label}
    </button>
  );
}
