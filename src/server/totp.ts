/**
 * TOTP (RFC 6238) — Google Authenticator, Microsoft Authenticator, 1Password vb. ile uyumlu 6 haneli kodlar.
 * Web Crypto kullanır: Node.js ve Cloudflare Workers'ta aynı şekilde çalışır.
 */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array) {
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Uint8Array<ArrayBuffer> {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export function generateSecret() {
  return base32Encode(crypto.getRandomValues(new Uint8Array(20)));
}

async function hotp(key: Uint8Array<ArrayBuffer>, counter: number, digits = 6) {
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    msg[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", k, msg));
  const o = h[h.length - 1]! & 0x0f;
  const bin = ((h[o]! & 0x7f) << 24) | (h[o + 1]! << 16) | (h[o + 2]! << 8) | h[o + 3]!;
  return String(bin % 10 ** digits).padStart(digits, "0");
}

export async function totpAt(secretB32: string, timeMs: number, digits = 6, stepSec = 30) {
  return hotp(base32Decode(secretB32), Math.floor(timeMs / 1000 / stepSec), digits);
}

/** Kodu doğrular; saat kaymasına karşı ±1 adım (30 sn) tolerans. */
export async function verifyTotp(secretB32: string, code: string, now = Date.now()) {
  const c = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  for (const d of [0, -1, 1]) if ((await totpAt(secretB32, now + d * 30_000)) === c) return true;
  return false;
}

export function otpauthUri(secretB32: string, account: string, issuer = "Eksen") {
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/* ── Sırrın veritabanında şifreli saklanması (AES-GCM, anahtar: TOTP_ENCRYPTION_KEY) ── */

async function aesKey() {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (!raw) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const unb64 = (s: string) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));

export async function sealSecret(secretB32: string) {
  const key = await aesKey();
  if (!key) return `plain:${secretB32}`;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(secretB32)));
  return `v1:${b64(iv)}:${b64(ct)}`;
}

export async function openSecret(stored: string) {
  if (stored.startsWith("plain:")) return stored.slice(6);
  const [v, iv, ct] = stored.split(":");
  if (v !== "v1" || !iv || !ct) throw new Error("Geçersiz sır biçimi");
  const key = await aesKey();
  if (!key) throw new Error("TOTP_ENCRYPTION_KEY tanımlı değil; iki adımlı doğrulama sırrı çözülemiyor.");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, unb64(ct));
  return new TextDecoder().decode(pt);
}
