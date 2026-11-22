"use client";
import { useActionState, useState } from "react";
import { orderAction } from "@/app/actions/panel";
import { submitReviewAction } from "@/app/actions/market";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { IconStar } from "@/components/icons";
import { cn } from "@/lib/utils";

type Action = "start" | "accept_revision" | "deliver" | "request_revision" | "approve" | "cancel" | "request_refund" | "open_dispute";

const META: Record<Action, { label: string; variant: "primary" | "accent" | "outline" | "danger" | "trust"; needsNote?: string; confirm?: string }> = {
  start: { label: "İşe başla", variant: "primary", confirm: "Siparişi başlattığınızda teslim süresi işlemeye başlar." },
  accept_revision: { label: "Revizyonu kabul et", variant: "primary" },
  deliver: { label: "Teslim et", variant: "trust", needsNote: "Teslimat notu (ne teslim ettiğinizi kısaca yazın)" },
  approve: { label: "Teslimatı onayla", variant: "trust", confirm: "Onayladığınızda sipariş tamamlanır ve ödeme uzmana aktarılır. Bu işlem geri alınamaz." },
  request_revision: { label: "Revizyon iste", variant: "outline", needsNote: "Neyin değişmesini istiyorsunuz? Somut ve tek mesajda yazın." },
  cancel: { label: "Siparişi iptal et", variant: "danger", needsNote: "İptal nedeni (müşteriye iletilir)" },
  request_refund: { label: "İade talep et", variant: "danger", needsNote: "İade nedenini açıklayın. Ekibimiz mesaj geçmişini ve teslimatları inceleyecek." },
  open_dispute: { label: "Uyuşmazlık bildir", variant: "danger", needsNote: "Yaşanan sorunu açıklayın. Ekibimiz iki tarafı da dinleyecek." },
};

export function OrderActions({ code, actions, as, revisionsLeft }: { code: string; actions: Action[]; as: "buyer" | "provider"; revisionsLeft: number }) {
  const [open, setOpen] = useState<Action | null>(null);
  const [state, act] = useActionState<FormState, FormData>(orderAction, undefined);
  const primary = actions.filter((a) => !["cancel", "request_refund", "open_dispute"].includes(a));
  const secondary = actions.filter((a) => ["cancel", "request_refund", "open_dispute"].includes(a));
  return (
    <section className="rounded-lg border border-ink bg-surface p-5">
      <h2 className="text-[15px] font-semibold">{as === "provider" ? "Yapılacak işlem" : "Sizden beklenen"}</h2>
      {state?.error && <Notice tone="bad" className="mt-3">{state.error}</Notice>}
      {state?.ok && <Notice tone="ok" className="mt-3">{state.ok}</Notice>}
      <div className="mt-3 space-y-2">
        {primary.map((a) => (
          <ActionForm key={a} code={code} action={a} act={act} open={open === a} onOpen={() => setOpen(open === a ? null : a)} />
        ))}
        {primary.includes("request_revision") && <p className="text-[12.5px] text-muted">Kalan revizyon hakkı: {revisionsLeft}</p>}
      </div>
      {secondary.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-line-2 pt-3">
          {secondary.map((a) => (
            <ActionForm key={a} code={code} action={a} act={act} open={open === a} onOpen={() => setOpen(open === a ? null : a)} subtle />
          ))}
        </div>
      )}
    </section>
  );
}

function ActionForm({ code, action, act, open, onOpen, subtle }: { code: string; action: Action; act: (f: FormData) => void; open: boolean; onOpen: () => void; subtle?: boolean }) {
  const m = META[action];
  const expandable = !!m.needsNote || !!m.confirm;
  if (!open && expandable)
    return subtle ? (
      <button type="button" onClick={onOpen} className="block text-[13.5px] text-muted hover:text-bad">{m.label}</button>
    ) : (
      <button type="button" onClick={onOpen} className={cn("h-10 w-full rounded-md text-[14.5px] font-medium", m.variant === "trust" ? "bg-trust text-white" : m.variant === "primary" ? "bg-ink text-white" : "border border-line")}>{m.label}</button>
    );
  return (
    <form action={act} className="space-y-2 rounded-md bg-paper/70 p-3">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="action" value={action} />
      {m.confirm && <p className="text-[13px] text-ink-2">{m.confirm}</p>}
      {m.needsNote && <textarea name="note" rows={3} placeholder={m.needsNote} className="field !min-h-[80px] text-[14px]" />}
      {action === "deliver" && <input type="file" name="files" multiple className="block w-full text-[13px] file:mr-2 file:rounded file:border file:border-line file:bg-surface file:px-2 file:py-1" />}
      <div className="flex gap-2">
        <SubmitButton size="sm" variant={m.variant} pendingText="İşleniyor">{m.label}</SubmitButton>
        {expandable && <button type="button" onClick={onOpen} className="text-[13px] text-muted">Vazgeç</button>}
      </div>
    </form>
  );
}

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, act] = useActionState<FormState, FormData>(submitReviewAction, undefined);
  if (state?.ok) return <Notice tone="ok">{state.ok}</Notice>;
  return (
    <form action={act} className="rounded-lg border border-line bg-surface p-5">
      <input type="hidden" name="orderId" value={orderId} />
      <h2 className="text-[17px] font-semibold">Deneyimini değerlendir</h2>
      <p className="mt-1 text-[13.5px] text-muted">Değerlendirmen uzmanın profilinde herkese açık görünür.</p>
      {state?.error && <Notice tone="bad" className="mt-3">{state.error}</Notice>}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[["quality", "İş kalitesi"], ["communication", "İletişim"], ["delivery", "Zamanında teslim"]].map(([n, l]) => <Stars key={n} name={n!} label={l!} />)}
      </div>
      <textarea name="comment" rows={4} placeholder="Süreç nasıldı? Başkalarına ne söylemek istersin?" className="field mt-4" />
      {state?.fieldErrors?.comment && <p className="mt-1 text-[13px] text-bad">{state.fieldErrors.comment[0]}</p>}
      <SubmitButton className="mt-4" pendingText="Gönderiliyor">Değerlendirmeyi gönder</SubmitButton>
    </form>
  );
}

function Stars({ name, label }: { name: string; label: string }) {
  const [v, setV] = useState(5);
  const [hover, setHover] = useState(0);
  return (
    <fieldset>
      <legend className="mb-1 text-[13px] text-ink-2">{label}</legend>
      <input type="hidden" name={name} value={v} />
      <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setV(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} yıldız`} aria-pressed={v === i} className="text-accent">
            <IconStar size={22} filled={i <= (hover || v)} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
