import { and, eq, gt, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { getConversationFor, markRead } from "@/server/messaging";
import { loadMessages } from "@/server/conversation-data";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events ile gerçek zamanlı mesaj akışı.
 * Tek sunucuda veritabanını 2 sn’de bir yoklar; yatay ölçeklemede Postgres LISTEN/NOTIFY veya Redis pub/sub ile değiştirilebilir.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Yetkisiz", { status: 401 });
  const conv = await getConversationFor(user.id, id);
  if (!conv) return new Response("Bulunamadı", { status: 404 });

  let cursor = new Date(new URL(req.url).searchParams.get("after") ?? Date.now());
  let readCursor = new Date();
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      send("ready", { ok: true });
      let alive = true;
      req.signal.addEventListener("abort", () => {
        alive = false;
      });
      let ticks = 0;
      while (alive && ticks < 900) {
        ticks++;
        try {
          const fresh = await loadMessages(id, cursor);
          if (fresh.length) {
            cursor = new Date(fresh[fresh.length - 1]!.createdAt);
            send("messages", fresh);
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
          if (ticks % 10 === 0) controller.enqueue(enc.encode(`: ping\n\n`));
        } catch {
          break;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      try {
        controller.close();
      } catch {}
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
