import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, offers, projects, uploads } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { getObject } from "@/server/storage";
import { cfContext, cfImages } from "@/server/platform";

const WIDTHS = [160, 320, 480, 640, 960, 1280, 1600];

/**
 * Dosya sunumu.
 * - Herkese açık görseller (kapak, avatar, portföy) Cloudflare'de Images binding ile istenen genişliğe ve
 *   tarayıcının desteklediği biçime (AVIF/WebP) dönüştürülür, sonuç kenar önbelleğinde (Cache API) saklanır.
 * - Özel dosyalar yalnızca sahibi, ilgili sohbetin tarafları, proje sahibi / teklif veren uzmanlar ve yöneticiler tarafından görülebilir.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Bulunamadı", { status: 404 });
  const url = new URL(req.url);
  const wantW = Number(url.searchParams.get("w")) || 0;
  const width = wantW ? WIDTHS.find((w) => w >= wantW) ?? 1600 : 0;
  const accept = req.headers.get("accept") ?? "";
  const format = accept.includes("image/avif") ? "image/avif" : accept.includes("image/webp") ? "image/webp" : null;

  // Kenar önbelleği (yalnızca Workers): herkese açık görsel varyantları
  const cf = cfContext();
  const edgeCache = cf ? (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default : undefined;
  const cacheKey = new Request(`${url.origin}/__img/${id}?w=${width}&f=${format ?? "orig"}`);
  if (edgeCache) {
    const hit = await edgeCache.match(cacheKey);
    if (hit) return hit;
  }

  const file = await db.query.uploads.findFirst({ where: eq(uploads.id, id) });
  if (!file) return new Response("Bulunamadı", { status: 404 });

  if (!file.isPublic) {
    const user = await getCurrentUser();
    if (!user) return new Response("Yetkisiz", { status: 401 });
    let allowed = user.role === "admin" || user.id === file.ownerId;
    if (!allowed && file.scope?.startsWith("conversation:")) {
      const conv = await db.query.conversations.findFirst({ where: eq(conversations.id, file.scope.slice(13)) });
      allowed = !!conv && (conv.userAId === user.id || conv.userBId === user.id);
    }
    if (!allowed && file.scope?.startsWith("project:")) {
      const pid = file.scope.slice(8);
      const proj = await db.query.projects.findFirst({ where: eq(projects.id, pid) });
      const offered = user.role === "provider" && !!(await db.query.offers.findFirst({ where: and(eq(offers.projectId, pid), eq(offers.providerId, user.id)) }));
      allowed = !!proj && (proj.buyerId === user.id || offered || (user.role === "provider" && proj.status === "open"));
    }
    if (!allowed) return new Response("Erişim yok", { status: 403 });
  }

  const obj = await getObject(file.storageKey);
  if (!obj) return new Response("Dosya bulunamadı", { status: 404 });

  const inline = file.mime.startsWith("image/") || file.mime === "application/pdf";
  const baseHeaders: Record<string, string> = {
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
    "Cache-Control": file.isPublic ? "public, max-age=31536000, immutable" : "private, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    Vary: "Accept",
  };

  // Cloudflare Images ile dönüştürme (herkese açık, animasyonsuz görseller)
  const images = cfImages();
  if (images && file.isPublic && file.mime.startsWith("image/") && file.mime !== "image/gif" && obj.body instanceof ReadableStream && (width || format)) {
    try {
      const t = width ? images.input(obj.body).transform({ width, fit: "scale-down" }) : images.input(obj.body);
      // WebP/AVIF desteklemeyen istemciye orijinal biçimde (JPEG/PNG) küçültülmüş sürüm
      const outFormat = format ?? (file.mime === "image/png" ? "image/png" : "image/jpeg");
      const out = await t.output({ format: outFormat, quality: 80 });
      const transformed = out.response();
      const res = new Response(transformed.body, { headers: { ...baseHeaders, "Content-Type": outFormat } });
      if (edgeCache) cf!.ctx.waitUntil(edgeCache.put(cacheKey, res.clone()));
      return res;
    } catch {
      // Dönüştürme kullanılamıyorsa orijinal dosyayı sun
      const again = await getObject(file.storageKey);
      if (!again) return new Response("Dosya bulunamadı", { status: 404 });
      return new Response(again.body as BodyInit, { headers: { ...baseHeaders, "Content-Type": file.mime } });
    }
  }

  const res = new Response(obj.body as BodyInit, { headers: { ...baseHeaders, "Content-Type": file.mime, "Content-Length": String(obj.size) } });
  if (edgeCache && file.isPublic) cf!.ctx.waitUntil(edgeCache.put(cacheKey, res.clone()));
  return res;
}
