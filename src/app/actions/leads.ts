"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { leads, users } from "@/db/schema";
import { getCurrentUser } from "@/server/auth";
import { notify } from "@/server/notify";
import { sendMail } from "@/server/mail";
import { rateLimit } from "@/server/rate-limit";
import { clientInfo } from "@/server/request";
import { citySlugFromName, getCity } from "@/lib/tr-cities";
import { BUDGETS, CONTACT_TOPICS, LEAD_NEEDS, TEAM_SIZES } from "@/lib/leads";
import type { FormState } from "./auth";

const schema = z.object({
  company: z.string().trim().min(2, "Şirket adını yazın.").max(160),
  contactName: z.string().trim().min(3, "Ad soyad yazın.").max(120),
  email: z.string().trim().toLowerCase().email("Geçerli bir iş e-postası yazın.").max(200),
  phone: z.string().trim().max(30).regex(/^[0-9+()\s-]*$/, "Telefon numarası yalnızca rakam içermeli.").optional(),
  city: z.string().trim().max(60).optional(),
  teamSize: z.enum(TEAM_SIZES).optional(),
  monthlyBudget: z.enum(BUDGETS).optional(),
  details: z.string().trim().max(3000).optional(),
});

export async function submitLeadAction(_: FormState, form: FormData): Promise<FormState> {
  // Botlar için görünmez alan: doluysa sessizce başarılı say.
  if (String(form.get("website") ?? "")) return { ok: "Başvurunuz alındı." };
  if (form.get("kvkk") !== "on") return { fieldErrors: { kvkk: ["Devam etmek için aydınlatma metnini onaylayın."] } };

  const val = (k: string) => {
    const v = String(form.get(k) ?? "").trim();
    return v ? v : undefined;
  };
  const parsed = schema.safeParse({ company: val("company") ?? "", contactName: val("contactName") ?? "", email: val("email") ?? "", phone: val("phone"), city: val("city"), teamSize: val("teamSize"), monthlyBudget: val("monthlyBudget"), details: val("details") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const d = parsed.data;
  const needs = form.getAll("needs").map(String).filter((n): n is (typeof LEAD_NEEDS)[number] => (LEAD_NEEDS as readonly string[]).includes(n));
  if (!needs.length && !d.details) return { fieldErrors: { needs: ["En az bir ihtiyaç seçin ya da kısaca anlatın."] } };
  // Sınır yalnızca geçerli başvurulara uygulanır: form hatası düzelten kullanıcı engellenmez.
  const { ip } = await clientInfo();
  if (!(await rateLimit(`lead:${ip}`, 5, 60 * 60_000)).ok) return { error: "Kısa sürede çok fazla başvuru gönderildi. Bir saat sonra tekrar deneyin." };
  const citySlug = d.city ? citySlugFromName(d.city) : null;
  const user = await getCurrentUser();

  const [lead] = await db
    .insert(leads)
    .values({
      company: d.company,
      contactName: d.contactName,
      email: d.email,
      phone: d.phone,
      city: citySlug ? getCity(citySlug)!.name : null,
      teamSize: d.teamSize,
      monthlyBudget: d.monthlyBudget,
      needs: [needs.join(", "), d.details].filter(Boolean).join("\n\n"),
      userId: user?.id ?? null,
    })
    .returning({ id: leads.id });

  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(admins.map((a) => notify(a.id, "system", `Yeni kurumsal başvuru: ${d.company}`, { body: `${d.contactName} · ${needs.join(", ") || "ihtiyaç açıklamada"}`, link: `/yonetim/kurumsal#${lead.id}` })));
  await sendMail({
    to: d.email,
    subject: "Kurumsal üyelik başvurunuz alındı",
    title: "Başvurunuz bize ulaştı",
    body: `Merhaba ${d.contactName},\n\n${d.company} için yaptığınız kurumsal üyelik başvurusunu aldık. Hesap yöneticiniz ihtiyaçlarınızı konuşmak için bu e-posta adresinden${d.phone ? " ya da telefonla" : ""} sizinle iletişime geçecek.\n\nBu başvuruyu siz yapmadıysanız bu e-postayı dikkate almayın.`,
  });
  return { ok: "Başvurunuz alındı. Hesap yöneticiniz sizinle iletişime geçecek; onay e-postasını da gönderdik." };
}

/* ───────────── İletişim formu ───────────── */

const contactSchema = z.object({
  name: z.string().trim().min(3, "Ad soyad yazın.").max(120),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta yazın.").max(200),
  topic: z.enum(CONTACT_TOPICS, { message: "Konu seçin." }),
  message: z.string().trim().min(10, "Mesajınızı biraz daha ayrıntılı yazın.").max(4000),
});

export async function submitContactAction(_: FormState, form: FormData): Promise<FormState> {
  if (String(form.get("website") ?? "")) return { ok: "Mesajınız alındı." };
  if (form.get("kvkk") !== "on") return { fieldErrors: { kvkk: ["Devam etmek için aydınlatma metnini onaylayın."] } };
  const parsed = contactSchema.safeParse({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? ""), topic: String(form.get("topic") ?? ""), message: String(form.get("message") ?? "") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const d = parsed.data;
  const { ip } = await clientInfo();
  if (!(await rateLimit(`contact:${ip}`, 5, 60 * 60_000)).ok) return { error: "Kısa sürede çok fazla mesaj gönderildi. Bir saat sonra tekrar deneyin." };
  const user = await getCurrentUser();
  const [row] = await db.insert(leads).values({ kind: "iletisim", company: d.topic, contactName: d.name, email: d.email, needs: d.message, userId: user?.id ?? null }).returning({ id: leads.id });
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(admins.map((a) => notify(a.id, "system", `Yeni iletişim mesajı: ${d.topic}`, { body: `${d.name} · ${d.message.slice(0, 140)}`, link: `/yonetim/kurumsal?tur=iletisim#${row.id}` })));
  await sendMail({
    to: d.email,
    subject: "Mesajınız bize ulaştı",
    title: "Mesajınızı aldık",
    body: `Merhaba ${d.name},\n\n“${d.topic}” konulu mesajınız destek ekibimize iletildi. Size bu e-posta adresinden dönüş yapacağız.\n\nBu mesajı siz göndermediyseniz bu e-postayı dikkate almayın.`,
  });
  return { ok: "Mesajınız alındı. Size e-posta ile dönüş yapacağız." };
}
