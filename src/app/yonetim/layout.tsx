import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads, services, tickets } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: { default: "Yönetim", template: "%s · Yönetim | Eksen" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin({ allowWithout2fa: true });
  const [[{ pending }], [{ open }], [{ newLeads }]] = await Promise.all([
    db.select({ pending: sql<number>`count(*)::int` }).from(services).where(eq(services.status, "pending")),
    db.select({ open: sql<number>`count(*)::int` }).from(tickets).where(and(eq(tickets.status, "open"))),
    db.select({ newLeads: sql<number>`count(*)::int` }).from(leads).where(eq(leads.status, "new")),
  ]);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <AdminNav name={admin.name} pending={pending} open={open} leads={newLeads} />
      <main className="min-w-0 px-4 pb-20 pt-6 sm:px-8 lg:pt-8">
        {!admin.totpEnabled && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warn/25 bg-warn-soft px-4 py-2.5 text-[13.5px] text-warn">
            <span>Yönetici hesabınızda iki adımlı doğrulama kapalı. Şifreniz ele geçirilirse panel korumasız kalır.</span>
            <Link href="/yonetim/guvenlik" className="font-medium underline underline-offset-2">Şimdi etkinleştir</Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
