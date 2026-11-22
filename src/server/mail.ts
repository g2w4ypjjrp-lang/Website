import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { emailOutbox } from "@/db/schema";
import { site } from "@/lib/site";

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

/**
 * E-postalar önce outbox tablosuna yazılır (kayıt + yeniden deneme imkânı).
 * SMTP_URL tanımlıysa nodemailer ile gönderilir; değilse "logged" olarak kalır ve yönetim panelinden görülebilir.
 */
export async function sendMail(opts: { to: string; subject: string; title: string; body: string; cta?: { label: string; href: string } }) {
  const html = layout(opts.title, opts.body, opts.cta);
  const text = `${opts.title}\n\n${opts.body.replace(/<[^>]+>/g, "")}${opts.cta ? `\n\n${opts.cta.label}: ${opts.cta.href}` : ""}`;
  const [row] = await db
    .insert(emailOutbox)
    .values({ to: opts.to, subject: opts.subject, html, text, status: process.env.SMTP_URL ? "queued" : "logged" })
    .returning({ id: emailOutbox.id });
  if (!process.env.SMTP_URL) return;
  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport(process.env.SMTP_URL);
    await transport.sendMail({ from: process.env.MAIL_FROM, to: opts.to, subject: opts.subject, html, text });
    await db.update(emailOutbox).set({ status: "sent", sentAt: new Date() }).where(eq(emailOutbox.id, row!.id));
  } catch (e) {
    await db
      .update(emailOutbox)
      .set({ status: "failed", error: String(e).slice(0, 500) })
      .where(eq(emailOutbox.id, row!.id));
  }
}
