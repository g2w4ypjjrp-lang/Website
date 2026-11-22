/**
 * Cloudflare derlemesi (OpenNext) + güvenlik kontrolü.
 *
 * OpenNext, `.env*` dosyalarındaki değerleri worker paketine gömer. Gizli anahtarların koda girmemesi için
 * production derlemesinde bu dosyalarda gizli değer varsa derleme durdurulur. Gizli değerler Cloudflare'de
 * `npx wrangler secret put <AD>` ile tanımlanmalıdır.
 *
 * Yerel önizleme (workerd + yerel Postgres) için:  node scripts/cf-build.mjs --local
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const SENSITIVE = ["DATABASE_URL", "ADMIN_PASSWORD", "IYZICO_API_KEY", "IYZICO_SECRET_KEY", "RESEND_API_KEY", "SMTP_URL", "CRON_SECRET", "TOTP_ENCRYPTION_KEY"];
const FILES = [".env", ".env.production", ".env.local", ".env.production.local"];
const local = process.argv.includes("--local");

if (!local) {
  const leaks = [];
  for (const f of FILES) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && SENSITIVE.includes(m[1]) && m[2].replace(/^["']|["']$/g, "").trim()) leaks.push(`${f}: ${m[1]}`);
    }
  }
  if (leaks.length) {
    console.error("\n✗ Derleme durduruldu: aşağıdaki gizli değerler worker paketine gömülecekti:\n  " + leaks.join("\n  "));
    console.error("\n  Bu değerleri .env dosyalarından kaldırıp Cloudflare'de tanımlayın:  npx wrangler secret put <AD>");
    console.error("  Yalnızca yerel önizleme için:  npm run cf:preview\n");
    process.exit(1);
  }
}

const r = spawnSync("npx", ["opennextjs-cloudflare", "build"], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
