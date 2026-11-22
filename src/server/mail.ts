import "server-only";
import { and, eq, lt, or } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { emailOutbox } from "@/db/schema";
import { site } from "@/lib/site";
import { isWorkers } from "./platform";

function layout(title: string, body: string, cta?: { label: string; href: string }) {
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#f4f2ec;font-family:Helvetica,Arial,sans-serif;color:#15171a">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4e0d6;border-radius:8px">
<tr><td style="padding:28px 32px 8px;font-weight:700;font-size:18px;letter-spacing:-0.02em">eksen</td></tr>
<tr><td style="padding:8px 32px 0;font-size:20px;font-weight:700">${title}</td></tr>
<tr><td style="padding:12px 32px 8px;font-size:15px;line-height:1.6;color:#3b3f46">${body}</td></tr>
${cta ? `<tr><td style="padding:16px 32px 28px"><a href="${cta.href}" style="display:inline-block;background:#15171a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600">${cta.label}</a></td></tr>` : ""}
<tr><td style="padding:16px 32px 24px;border-top:1px solid #efece4;font-size:12px;color:#7a7e86">Bu e-postayı ${site.name} hesabınızla ilgili bir işlem nedeniyle aldınız. Bildirim tercihlerinizi panelinizden değiştirebilirsiniz.</td></tr>
</table></td></tr></table></body></html>`;
}

type Transport = "resend" | "smtp" | null;
function transport(): Transport {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_URL && !isWorkers) return "smtp";
  return null;
}

async function deliver(id: string, msg: { to: string; subject: string; html: string; text: string }) {
  const from = process.env.MAIL_FROM ?? "Eksen <bildirim@eksen.local>";
  try {
    if (transport() === "resend") {
      // HTTP tabanlı gönderim: Cloudflare Workers'ta da çalışır
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
    } else {
      const nodemailer = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ "nodemailer");
      const t = nodemailer.createTransport(process.env.SMTP_URL);
      await t.sendMail({ from, ...msg });
    }
    await db.update(emailOutbox).set({ status: "sent", sentAt: new Date() }).where(eq(emailOutbox.id, id));
  } catch (e) {
    await db.update(emailOutbox).set({ status: "failed", error: String(e).slice(0, 500) }).where(eq(emailOutbox.id, id));
  }
}

/**
 * E-postalar önce outbox tablosuna yazılır (kayıt + yeniden deneme imkânı).
 * Gönderim, yanıt kullanıcıya döndükten sonra arka planda yapılır (next/server `after`): işlem hızı e-posta servisine bağlı kalmaz.
 * Sağlayıcı: RESEND_API_KEY (önerilen, Cloudflare uyumlu) veya SMTP_URL (yalnızca Node.js). İkisi de yoksa "logged" olarak kalır.
 */
export async function sendMail(opts: { to: string; subject: string; title: string; body: string; cta?: { label: string; href: string } }) {
  const html = layout(opts.title, opts.body, opts.cta);
  const text = `${opts.title}\n\n${opts.body.replace(/<[^>]+>/g, "")}${opts.cta ? `\n\n${opts.cta.label}: ${opts.cta.href}` : ""}`;
  const mode = transport();
  const [row] = await db.insert(emailOutbox).values({ to: opts.to, subject: opts.subject, html, text, status: mode ? "queued" : "logged" }).returning({ id: emailOutbox.id });
  if (!mode) return;
  const job = () => deliver(row!.id, { to: opts.to, subject: opts.subject, html, text });
  try {
    after(job);
  } catch {
    await job(); // istek bağlamı dışında (betik, zamanlanmış görev) doğrudan gönder
  }
}

/** Gönderilemeyen e-postaları yeniden dener (zamanlanmış görevden çağrılır). */
export async function retryFailedMail(limit = 50) {
  if (!transport()) return 0;
  // Yeni sıraya girmiş (henüz arka planda gönderiliyor olabilecek) e-postalara 5 dakika dokunma
  const rows = await db
    .select()
    .from(emailOutbox)
    .where(or(eq(emailOutbox.status, "failed"), and(eq(emailOutbox.status, "queued"), lt(emailOutbox.createdAt, new Date(Date.now() - 5 * 60_000)))))
    .limit(limit);
  for (const r of rows) await deliver(r.id, { to: r.to, subject: r.subject, html: r.html, text: r.text });
  return rows.length;
}
