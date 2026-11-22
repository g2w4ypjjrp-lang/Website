import { base32Encode, totpAt, verifyTotp, generateSecret, sealSecret, openSecret } from "../../src/server/totp.ts";
// RFC 6238 test vektörleri (SHA-1, 8 hane): anahtar "12345678901234567890"
const secret = base32Encode(new TextEncoder().encode("12345678901234567890"));
const vectors: [number, string][] = [[59, "94287082"], [1111111109, "07081804"], [1111111111, "14050471"], [1234567890, "89005924"], [2000000000, "69279037"], [20000000000, "65353130"]];
let ok = 0;
for (const [t, want] of vectors) { const got = await totpAt(secret, t * 1000, 8); console.log(t, got, got === want ? "✓" : `✗ (beklenen ${want})`); if (got === want) ok++; }
console.log(`RFC 6238: ${ok}/${vectors.length}`);
const s = generateSecret(); const now = Date.now(); const code = await totpAt(s, now);
console.log("doğrulama (şimdi):", await verifyTotp(s, code, now), "| 30 sn önceki kod:", await verifyTotp(s, await totpAt(s, now - 30_000), now), "| yanlış kod:", await verifyTotp(s, "000000", now) && code !== "000000");
process.env.TOTP_ENCRYPTION_KEY = "test-anahtari-en-az-32-karakter-uzunlugunda";
const sealed = await sealSecret(s); console.log("şifreli saklama:", sealed.startsWith("v1:"), "geri açma:", (await openSecret(sealed)) === s, "sır görünmüyor:", !sealed.includes(s));
