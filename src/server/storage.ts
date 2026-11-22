import "server-only";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { cfEnv, isWorkers } from "./platform";
import { stripImageMetadata } from "./image-meta";

/*
 * Dosya depolama:
 *  - Cloudflare Workers: R2 bucket (UPLOADS binding)
 *  - Node.js (yerel / VPS): UPLOAD_DIR dizini
 * Her iki durumda da dosya türü ilk baytlarından doğrulanır ve görsellerin konum/cihaz meta verisi silinir.
 */

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const DOC_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to));

/** Dosyanın gerçek türünü ilk baytlarından doğrular; tarayıcının bildirdiği MIME türüne güvenilmez. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return "image/png";
  if (ascii(b, 0, 4) === "GIF8") return "image/gif";
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return "image/webp";
  if (ascii(b, 4, 12).startsWith("ftypavif")) return "image/avif";
  if (ascii(b, 0, 4) === "%PDF") return "application/pdf";
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) return "application/zip"; // zip + Office belgeleri
  return null;
}

export type UploadKind = "image" | "file";

async function nodeRoot() {
  const path = await import("node:path");
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./storage/uploads");
}

async function putObject(key: string, bytes: Uint8Array, contentType: string) {
  const r2 = cfEnv()?.UPLOADS;
  if (r2) {
    await r2.put(key, bytes, { httpMetadata: { contentType } });
    return;
  }
  if (isWorkers) throw new Error("Dosya depolama yapılandırılmamış (UPLOADS R2 binding'i eksik).");
  const [{ mkdir, writeFile }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const root = await nodeRoot();
  await mkdir(path.join(root, path.dirname(key)), { recursive: true });
  await writeFile(path.join(root, key), bytes);
}

/** Depolanan dosyanın içeriği (Workers'ta akış, Node.js'te bellek tamponu). */
export async function getObject(key: string): Promise<{ body: ReadableStream | Uint8Array; size: number } | null> {
  const r2 = cfEnv()?.UPLOADS;
  if (r2) {
    const obj = await r2.get(key);
    return obj ? { body: obj.body, size: obj.size } : null;
  }
  if (isWorkers) return null;
  const [{ readFile }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const root = await nodeRoot();
  const full = path.join(root, key);
  if (!full.startsWith(root)) throw new Error("Geçersiz yol");
  try {
    const buf = await readFile(full);
    return { body: new Uint8Array(buf), size: buf.length };
  } catch {
    return null;
  }
}

/** Node.js'te görseli WebP'ye çevirip küçültür (sharp). Workers'ta yalnızca meta veri temizlenir; boyutlandırma teslimatta yapılır. */
async function optimizeImage(bytes: Uint8Array, mime: string): Promise<{ bytes: Uint8Array; mime: string }> {
  const cleaned = stripImageMetadata(bytes, mime);
  if (isWorkers || mime === "image/gif") return { bytes: cleaned, mime };
  try {
    const sharp = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "sharp")).default;
    const out = await sharp(Buffer.from(bytes)).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    return { bytes: new Uint8Array(out), mime: "image/webp" };
  } catch {
    return { bytes: cleaned, mime };
  }
}

export async function saveUpload(file: File, opts: { ownerId: string; kind: UploadKind; isPublic: boolean; scope?: string }) {
  if (!file || file.size === 0) throw new Error("Dosya boş.");
  const limit = opts.kind === "image" ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (file.size > limit) throw new Error(`Dosya en fazla ${Math.round(limit / 1024 / 1024)} MB olabilir.`);
  let bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniff(bytes);
  let mime = sniffed ?? (file.type === "text/plain" ? "text/plain" : "");
  if (opts.kind === "image") {
    if (!sniffed || !IMAGE_TYPES.includes(sniffed)) throw new Error("Yalnızca JPG, PNG, WebP, AVIF veya GIF yükleyebilirsiniz.");
    const o = await optimizeImage(bytes, sniffed);
    bytes = o.bytes as Uint8Array<ArrayBuffer>;
    mime = o.mime;
  } else {
    if (sniffed === "application/zip" && DOC_TYPES.includes(file.type)) mime = file.type;
    if (!mime || ![...IMAGE_TYPES, ...DOC_TYPES].includes(mime)) throw new Error("Bu dosya türü desteklenmiyor. PDF, ZIP, Office belgeleri ve görseller yüklenebilir.");
    if (IMAGE_TYPES.includes(mime)) bytes = stripImageMetadata(bytes, mime) as Uint8Array<ArrayBuffer>;
  }
  const id = crypto.randomUUID();
  const key = `${new Date().toISOString().slice(0, 7)}/${id}`;
  await putObject(key, bytes, mime);
  const safeName = file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120) || "dosya";
  await db.insert(uploads).values({ id, ownerId: opts.ownerId, storageKey: key, originalName: safeName, mime, size: bytes.length, isPublic: opts.isPublic, scope: opts.scope });
  return { id, name: safeName, size: bytes.length, mime };
}

export { fileUrl } from "@/lib/utils";
