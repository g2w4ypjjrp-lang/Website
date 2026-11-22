import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { PageHead } from "@/components/panel/page-head";
import { AccountForm, PasswordForm, DeleteAccountForm } from "@/components/panel/forms";

export const metadata = { title: "Hesap ayarları" };

export default async function SettingsPage() {
  const user = await requireUser();
  const u = (await db.query.users.findFirst({ where: eq(users.id, user.id) }))!;
  return (
    <>
      <PageHead title="Hesap ayarları" />
      <div className="max-w-3xl space-y-12">
        <AccountForm a={{ name: u.name, email: u.email, phone: u.phone, billing: (u.billing as Record<string, string | undefined>) ?? null, prefs: u.notificationPrefs }} />
        <section className="border-t border-line pt-8"><h2 className="mb-4 text-[17px] font-semibold">Şifre</h2><PasswordForm /></section>
        <section className="border-t border-line pt-8"><h2 className="mb-4 text-[17px] font-semibold text-bad">Hesabı sil</h2><DeleteAccountForm /></section>
      </div>
    </>
  );
}
