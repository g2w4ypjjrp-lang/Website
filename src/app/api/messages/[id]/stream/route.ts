import { and, eq, gt, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { getConversationFor, markRead } from "@/server/messaging";
import { loadMessages } from "@/server/conversation-data";

export const dynamic = "force-dynamic";

/** Tek bağlantının en uzun ömrü. Süre dolunca tarayıcı (EventSource) kaldığı yerden otomatik yeniden bağlanır. */
const MAX_LIFETIME_MS = 50_000;
const POLL_MS = 2_000;

/**
 * Server-Sent Events ile gerçek zamanlı mesaj akışı.
 * - Her olaya `id` (son mesaj zamanı) yazılır; yeniden bağlanırken tarayıcı `Last-Event-ID` gönderir, mesaj kaçmaz.
 * - Bağlantılar kısa ömürlüdür: Cloudflare Workers'ta ve sunucularda uzun süre açık kalıp kaynak tüketmez.
 * - Yatay ölçeklemede yoklama yerine Durable Objects / Postgres LISTEN-NOTIFY ile anlık yayın yapılabilir.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Yetkisiz", { status: 401 });
  const conv = await getConversationFor(user.id, id);
  if (!conv) return new Response("Bulunamadı", { status: 404 });

  const lastEventId = req.headers.get("last-event-id");
  const fromQuery = new URL(req.url).searchParams.get("after");
  const parsed = new Date(lastEventId ?? fromQuery ?? Date.now());
  let cursor = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  let readCursor = new Date(Date.now() - 60_000);
  const enc = new TextEncoder();
  const started = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown, eventId?: string) =>
        controller.enqueue(enc.encode(`${eventId ? `id: ${eventId}\n` : ""}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      controller.enqueue(enc.encode(`retry: 1500\n\n`));
      send("ready", { ok: true }, cursor.toISOString());
      let alive = true;
      req.signal.addEventListener("abort", () => {
        alive = false;
      });
      while (alive && Date.now() - started < MAX_LIFETIME_MS) {
        try {
          const fresh = await loadMessages(id, cursor);
          if (fresh.length) {
            cursor = new Date(fresh[fresh.length - 1]!.createdAt);
            send("messages", fresh, cursor.toISOString());
            if (fresh.some((m) => m.senderId !== user.id)) await markRead(user.id, id);
          }
          const reads = await db
            .select({ id: messages.id, readAt: messages.readAt })
            .from(messages)
            .where(and(eq(messages.conversationId, id), eq(messages.senderId, user.id), isNotNull(messages.readAt), gt(messages.readAt, readCursor)));
          if (reads.length) {
            readCursor = new Date(Math.max(...reads.map((r) => r.readAt!.getTime())));
            send("read", reads.map((r) => r.id));
          }
          controller.enqueue(enc.encode(`: ping\n\n`));
        } catch {
          break;
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      try {
        controller.close();
      } catch {}
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
}
