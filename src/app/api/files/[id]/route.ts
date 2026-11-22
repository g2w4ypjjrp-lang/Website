import { NextResponse } from "next/server";
import { eq, or, and } from "drizzle-orm";
import { db } from "@/db";
import { conversations, projects, uploads, offers } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { readUpload } from "@/server/storage";

/**
 * Dosya sunumu. Herkese açık dosyalar (kapak, avatar, portföy) önbelleklenir.
 * Özel dosyalar yalnızca sahibi, ilgili sohbetin tarafları, proje sahibi/teklif verenler ve yöneticiler tarafından görülebilir.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Bulunamadı", { status: 404 });
  const file = await db.query.uploads.findFirst({ where: eq(uploads.id, id) });
  if (!file) return new NextResponse("Bulunamadı", { status: 404 });

  if (!file.isPublic) {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Yetkisiz", { status: 401 });
    let allowed = user.role === "admin" || user.id === file.ownerId;
    if (!allowed && file.scope?.startsWith("conversation:")) {
      const conv = await db.query.conversations.findFirst({ where: eq(conversations.id, file.scope.slice(13)) });
      allowed = !!conv && (conv.userAId === user.id || conv.userBId === user.id);
    }
    if (!allowed && file.scope?.startsWith("project:")) {
      const pid = file.scope.slice(8);
      const proj = await db.query.projects.findFirst({ where: eq(projects.id, pid) });
      allowed = !!proj && (proj.buyerId === user.id || (user.role === "provider" && !!(await db.query.offers.findFirst({ where: and(eq(offers.projectId, pid), eq(offers.providerId, user.id)) })) ) || (user.role === "provider" && proj.status === "open"));
    }
    if (!allowed) return new NextResponse("Erişim yok", { status: 403 });
  }

  const body = await readUpload(file.storageKey);
  const inline = file.mime.startsWith("image/") || file.mime === "application/pdf";
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(body.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      "Cache-Control": file.isPublic ? "public, max-age=31536000, immutable" : "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
void or;
