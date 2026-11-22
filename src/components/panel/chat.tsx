"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { sendMessageAction } from "@/app/actions/panel";
import type { FormState } from "@/app/actions/auth";
import type { ChatMessage } from "@/server/conversation-data";
import { IconPaperclip, IconSend, IconFile, IconCheck } from "@/components/icons";
import { cn } from "@/lib/utils";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Bugün";
  const y = new Date(Date.now() - 864e5);
  if (d.toDateString() === y.toDateString()) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function Chat({ conversationId, meId, initial, otherName, disabledReason, className }: { conversationId: string; meId: string; initial: ChatMessage[]; otherName: string; disabledReason?: string; className?: string }) {
  const [msgs, setMsgs] = useState(initial);
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessageAction, undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [live, setLive] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const last = msgs[msgs.length - 1]?.createdAt ?? new Date(0).toISOString();
    const es = new EventSource(`/api/messages/${conversationId}/stream?after=${encodeURIComponent(last)}`);
    es.addEventListener("ready", () => setLive(true));
    es.addEventListener("messages", (e) => {
      const fresh = JSON.parse((e as MessageEvent).data) as ChatMessage[];
      setMsgs((cur) => {
        const seen = new Set(cur.map((m) => m.id));
        return [...cur, ...fresh.filter((m) => !seen.has(m.id))];
      });
    });
    es.addEventListener("read", (e) => {
      const ids = new Set(JSON.parse((e as MessageEvent).data) as string[]);
      setMsgs((cur) => cur.map((m) => (ids.has(m.id) ? { ...m, readAt: new Date().toISOString() } : m)));
    });
    // Sunucu bağlantıyı periyodik olarak yeniler; yeniden bağlanırken (CONNECTING) durum göstergesini titretme
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) setLive(false);
    };
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setFiles([]);
    }
  }, [state]);

  let lastDay = "";
  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-surface", className)}>
      <div className="flex items-center justify-between border-b border-line-2 px-4 py-2.5 text-[13px]">
        <span className="font-medium">{otherName}</span>
        <span className={cn("flex items-center gap-1.5", live ? "text-trust" : "text-faint")}><span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-trust" : "bg-faint")} />{live ? "Canlı" : "Bağlanıyor"}</span>
      </div>
      <div ref={listRef} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto bg-paper/40 px-4 py-4" aria-live="polite">
        {msgs.length === 0 && <p className="py-10 text-center text-[14px] text-muted">Henüz mesaj yok. İhtiyacınızı kısaca anlatarak başlayın.</p>}
        {msgs.map((m) => {
          const day = fmtDay(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          const mine = m.senderId === meId;
          return (
            <div key={m.id}>
              {showDay && <p className="my-3 text-center text-[11.5px] text-muted">{day}</p>}
              {m.kind === "system" ? (
                <p className="mx-auto max-w-md whitespace-pre-line rounded-md border border-line-2 bg-surface px-3 py-2 text-center text-[13px] text-ink-2">{m.body}</p>
              ) : (
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] rounded-lg px-3.5 py-2.5 text-[14.5px] sm:max-w-[70%]", m.kind === "delivery" ? "border-2 border-trust bg-trust-soft text-ink" : mine ? "bg-ink text-white" : "border border-line bg-surface")}>
                    {m.kind === "delivery" && <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-trust">Teslimat</p>}
                    {m.body && <p className="whitespace-pre-line break-words">{m.body}</p>}
                    {m.attachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {m.attachments.map((a) => (
                          <li key={a.id}>
                            {a.mime.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <a href={`/api/files/${a.id}`} target="_blank"><img src={`/api/files/${a.id}`} alt={a.name} loading="lazy" className="max-h-48 rounded-md" /></a>
                            ) : (
                              <a href={`/api/files/${a.id}`} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px]", mine && m.kind !== "delivery" ? "bg-white/10" : "bg-paper")}>
                                <IconFile size={15} /> <span className="truncate">{a.name}</span> <span className="opacity-60">{kb(a.size)}</span>
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className={cn("mt-1 flex items-center justify-end gap-1 text-[11px]", mine && m.kind !== "delivery" ? "text-white/60" : "text-muted")}>
                      {fmtTime(m.createdAt)}
                      {mine && (m.readAt ? <span title="Okundu" className="flex text-accent"><IconCheck size={12} /><IconCheck size={12} className="-ml-2" /></span> : <IconCheck size={12} />)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {disabledReason ? (
        <p className="border-t border-line-2 px-4 py-3 text-[13.5px] text-muted">{disabledReason}</p>
      ) : (
        <form ref={formRef} action={action} className="border-t border-line-2 p-3">
          <input type="hidden" name="conversationId" value={conversationId} />
          {state?.error && <p className="mb-2 text-[13px] text-bad">{state.error}</p>}
          {state?.ok === "uyari" && <p className="mb-2 rounded-md bg-warn-soft px-3 py-2 text-[12.5px] text-warn">İletişim bilgisi paylaşmak ve ödemeyi platform dışına taşımak sizi Eksen güvencesinin dışında bırakır.</p>}
          {files.length > 0 && <p className="mb-2 truncate text-[12.5px] text-muted">{files.map((f) => f.name).join(", ")}</p>}
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" name="files" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-ink-2 hover:bg-paper" aria-label="Dosya ekle"><IconPaperclip size={17} /></button>
            <textarea
              name="body"
              rows={1}
              placeholder={`${otherName} kişisine yaz…`}
              className="field max-h-40 !min-h-10 flex-1 resize-none !py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <button disabled={pending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-white disabled:opacity-50" aria-label="Gönder"><IconSend size={16} /></button>
          </div>
        </form>
      )}
    </div>
  );
}
