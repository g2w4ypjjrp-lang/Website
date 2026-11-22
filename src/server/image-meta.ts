/**
 * Görsel meta verisi temizleme (saf JavaScript; Node.js ve Cloudflare Workers'ta çalışır).
 * Amaç: kullanıcıların yüklediği fotoğraflardaki konum (GPS), cihaz ve yazılım bilgilerini silmek.
 * JPEG'de yalnızca yön (Orientation) bilgisi korunur; aksi halde telefon fotoğrafları yan görünür.
 */

function u16(b: Uint8Array, o: number, le: boolean) {
  return le ? b[o]! | (b[o + 1]! << 8) : (b[o]! << 8) | b[o + 1]!;
}
function u32(b: Uint8Array, o: number, le: boolean) {
  return le ? (b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16)) + b[o + 3]! * 0x1000000 : b[o]! * 0x1000000 + ((b[o + 1]! << 16) | (b[o + 2]! << 8) | b[o + 3]!);
}

/** EXIF (APP1) bloğundan Orientation değerini okur. Bulamazsa 1 döner. */
function readOrientation(seg: Uint8Array): number {
  // seg: "Exif\0\0" + TIFF
  if (seg.length < 14 || String.fromCharCode(...seg.subarray(0, 4)) !== "Exif") return 1;
  const t = seg.subarray(6);
  const le = t[0] === 0x49 && t[1] === 0x49;
  if (!le && !(t[0] === 0x4d && t[1] === 0x4d)) return 1;
  const ifd = u32(t, 4, le);
  if (ifd + 2 > t.length) return 1;
  const n = u16(t, ifd, le);
  for (let i = 0; i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > t.length) break;
    if (u16(t, e, le) === 0x0112) {
      const v = u16(t, e + 8, le);
      return v >= 1 && v <= 8 ? v : 1;
    }
  }
  return 1;
}

/** Yalnızca Orientation etiketini içeren en küçük EXIF APP1 segmenti. */
function orientationSegment(orientation: number): Uint8Array {
  const tiff = [0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, 0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  const payload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff];
  const len = payload.length + 2;
  return new Uint8Array([0xff, 0xe1, len >> 8, len & 0xff, ...payload]);
}

function stripJpeg(b: Uint8Array): Uint8Array {
  if (b[0] !== 0xff || b[1] !== 0xd8) return b;
  const out: Uint8Array[] = [b.subarray(0, 2)];
  let orientation = 1;
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return b; // beklenmeyen yapı: dokunma
    const marker = b[i + 1]!;
    if (marker === 0xd9) break;
    if (marker === 0xda) {
      // Taramadan sonrası sıkıştırılmış görüntü verisi
      if (orientation !== 1) out.splice(1, 0, orientationSegment(orientation));
      out.push(b.subarray(i));
      return concat(out);
    }
    const len = (b[i + 2]! << 8) | b[i + 3]!;
    const seg = b.subarray(i, i + 2 + len);
    const body = b.subarray(i + 4, i + 2 + len);
    const isApp = marker >= 0xe0 && marker <= 0xef;
    let keep = true;
    if (marker === 0xe1) {
      orientation = Math.max(orientation, readOrientation(body));
      keep = false; // EXIF ve XMP
    } else if (isApp && marker !== 0xe0 && !(marker === 0xe2 && String.fromCharCode(...body.subarray(0, 11)) === "ICC_PROFILE")) {
      keep = false; // diğer uygulama blokları (ICC renk profili ve JFIF hariç)
    } else if (marker === 0xfe) {
      keep = false; // yorum
    }
    if (keep) out.push(seg);
    i += 2 + len;
  }
  return b;
}

const PNG_DROP = new Set(["tEXt", "iTXt", "zTXt", "eXIf", "tIME"]);
function stripPng(b: Uint8Array): Uint8Array {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!sig.every((v, k) => b[k] === v)) return b;
  const out: Uint8Array[] = [b.subarray(0, 8)];
  let i = 8;
  while (i + 12 <= b.length) {
    const len = u32(b, i, false);
    const type = String.fromCharCode(...b.subarray(i + 4, i + 8));
    const end = i + 12 + len;
    if (end > b.length) return b;
    if (!PNG_DROP.has(type)) out.push(b.subarray(i, end));
    i = end;
    if (type === "IEND") break;
  }
  return concat(out);
}

function stripWebp(b: Uint8Array): Uint8Array {
  if (String.fromCharCode(...b.subarray(0, 4)) !== "RIFF" || String.fromCharCode(...b.subarray(8, 12)) !== "WEBP") return b;
  const chunks: Uint8Array[] = [];
  let i = 12;
  while (i + 8 <= b.length) {
    const type = String.fromCharCode(...b.subarray(i, i + 4));
    const len = u32(b, i + 4, true);
    const end = i + 8 + len + (len % 2);
    if (end > b.length + 1) return b;
    if (type !== "EXIF" && type !== "XMP ") {
      const c = b.slice(i, Math.min(end, b.length));
      if (type === "VP8X") c[8] = c[8]! & ~0x0c; // EXIF ve XMP bayraklarını kapat
      chunks.push(c);
    }
    i = end;
  }
  const body = concat(chunks);
  const size = body.length + 4;
  const head = new Uint8Array([0x52, 0x49, 0x46, 0x46, size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, (size >>> 24) & 0xff, 0x57, 0x45, 0x42, 0x50]);
  return concat([head, body]);
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Desteklenen biçimlerde meta veriyi temizler; tanımadığı biçimi olduğu gibi döndürür. */
export function stripImageMetadata(bytes: Uint8Array, mime: string): Uint8Array {
  try {
    if (mime === "image/jpeg") return stripJpeg(bytes);
    if (mime === "image/png") return stripPng(bytes);
    if (mime === "image/webp") return stripWebp(bytes);
  } catch {
    /* bozuk dosyada orijinali döndür; doğrulama zaten yükleme aşamasında yapıldı */
  }
  return bytes;
}
