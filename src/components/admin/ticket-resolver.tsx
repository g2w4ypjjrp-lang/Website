"use client";
import { useActionState } from "react";
import { adminTicketAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { Notice } from "@/components/ui/primitives";

export function TicketResolver({ id, type, hasOrder }: { id: string; type: "refund" | "dispute" | "complaint"; hasOrder: boolean }) {
  const [s, act, pending] = useActionState<FormState, FormData>(adminTicketAction, undefined);
  if (s?.ok) return <Notice tone="ok" className="mt-3">{s.ok}</Notice>;
  return (
    <form action={act} className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-2 pt-3 text-[13px]">
      <input type="hidden" name="id" value={id} />
      <input name="note" placeholder="Karar notu (taraflara iletilir)" className="field !w-80 !py-1.5 text-[13px]" />
      {hasOrder && type !== "complaint" && (
        <>
          <button name="op" value="refund" disabled={pending} className="rounded bg-bad px-3 py-1.5 text-white">İadeyi onayla</button>
          {type === "dispute" && <button name="op" value="complete" disabled={pending} className="rounded bg-trust px-3 py-1.5 text-white">Uzman lehine tamamla</button>}
          <button name="op" value="reject" disabled={pending} className="rounded border border-line px-3 py-1.5">Reddet, sipariş devam etsin</button>
        </>
      )}
      {type === "complaint" && <button name="op" value="resolve" disabled={pending} className="rounded bg-ink px-3 py-1.5 text-white">İncelendi, kapat</button>}
      {s?.error && <span className="text-bad">{s.error}</span>}
    </form>
  );
}
