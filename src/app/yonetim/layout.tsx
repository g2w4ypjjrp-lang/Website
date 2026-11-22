import type { Metadata } from "next";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { services, tickets } from "@/db/schema";
import { requireAdmin } from "@/server/auth";
import { AdminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: { default: "Yönetim", template: "%s · Yönetim | Eksen" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [[{ pending }], [{ open }]] = await Promise.all([
    db.select({ pending: sql<number>`count(*)::int` }).from(services).where(eq(services.status, "pending")),
    db.select({ open: sql<number>`count(*)::int` }).from(tickets).where(and(eq(tickets.status, "open"))),
  ]);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <AdminNav name={admin.name} pending={pending} open={open} />
      <main className="min-w-0 px-4 pb-20 pt-6 sm:px-8 lg:pt-8">{children}</main>
    </div>
  );
}
