import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { uploads } from "@/db/schema";

const ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./storage/uploads");

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

/** Dosyanın gerçek türünü ilk baytlarından doğrular; tarayıcının bildirdiği MIME türüne güvenilmez. */
function sniff(buf: Buffer): string | null {
  const hex = buf.subarray(0, 12).toString("hex");
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (hex.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(4, 12).toString().startsWith("ftypavif")) return "image/avif";
  if (hex.startsWith("25504446")) return "application/pdf";
  if (hex.startsWith("504b0304")) return "application/zip"; // zip + office belgeleri
  return null;
}

export type UploadKind = "image" | "file";

export async function saveUpload(
  file: File,
  opts: { ownerId: string; kind: UploadKind; isPublic: boolean; scope?: string },
) {
  if (!file || file.size === 0) throw new Error("Dosya boş.");
  const limit = opts.kind === "image" ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (file.size > limit) throw new Error(`Dosya en fazla ${Math.round(limit / 1024 / 1024)} MB olabilir.`);
  let buf: Buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniff(buf);
  let mime = sniffed ?? (file.type === "text/plain" ? "text/plain" : "");
  if (opts.kind === "image") {
    if (!sniffed || !IMAGE_TYPES.includes(sniffed)) throw new Error("Yalnızca JPG, PNG, WebP, AVIF veya GIF yükleyebilirsiniz.");
    // Görselleri WebP'ye dönüştür, EXIF/konum verisini sil, makul boyuta indir
    if (sniffed !== "image/gif") {
      const sharp = (await import("sharp")).default;
      buf = await sharp(buf).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      mime = "image/webp";
    }
  } else {
    const allowed = [...IMAGE_TYPES, ...DOC_TYPES];
    if (sniffed === "application/zip" && DOC_TYPES.includes(file.type)) mime = file.type;
    if (!mime || !allowed.includes(mime)) throw new Error("Bu dosya türü desteklenmiyor. PDF, ZIP, Office belgeleri ve görseller yüklenebilir.");
  }
  const id = randomUUID();
  const key = `${new Date().toISOString().slice(0, 7)}/${id}`;
  await mkdir(path.join(ROOT, path.dirname(key)), { recursive: true });
  await writeFile(path.join(ROOT, key), buf);
  const safeName = file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120) || "dosya";
  await db.insert(uploads).values({
    id,
    ownerId: opts.ownerId,
    storageKey: key,
    originalName: safeName,
    mime,
    size: buf.length,
    isPublic: opts.isPublic,
    scope: opts.scope,
  });
  return { id, name: safeName, size: buf.length, mime };
}

export async function readUpload(storageKey: string) {
  const full = path.join(ROOT, storageKey);
  if (!full.startsWith(ROOT)) throw new Error("Geçersiz yol");
  return readFile(full);
}

export { fileUrl } from "@/lib/utils";
