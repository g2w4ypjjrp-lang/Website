import type { Metadata } from "next";
import { and, eq, isNull, sql, ne } from "drizzle-orm";
import { db } from "@/db";
import { messages, conversations, notifications } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { SiteHeader } from "@/components/site/header";
import { TabBar } from "@/components/site/tab-bar";
import { PanelNav } from "@/components/panel/nav";
import { VerifyBanner } from "@/components/panel/verify-banner";

export const metadata: Metadata = { title: { default: "Panel", template: "%s · Panel | Eksen" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/panel");
  const [[{ unreadMsg }], [{ unreadNotif }]] = await Promise.all([
    db
      .select({ unreadMsg: sql<number>`count(*)::int` })
      .from(messages)
      .innerJoin(conversations, eq(conversations.id, messages.conversationId))
      .where(and(isNull(messages.readAt), ne(messages.senderId, user.id), sql`(${conversations.userAId} = ${user.id} or ${conversations.userBId} = ${user.id})`)),
    db.select({ unreadNotif: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, user.id), isNull(notifications.readAt))),
  ]);
  return (
    <>
      <SiteHeader />
      <div className="container-x grid gap-8 pb-28 pt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:pb-16 lg:pt-10">
        <PanelNav role={user.role} unreadMsg={unreadMsg} unreadNotif={unreadNotif} />
        <main id="icerik" className="min-w-0">
          {!user.emailVerifiedAt && <VerifyBanner />}
          {children}
        </main>
      </div>
      <TabBar />
    </>
  );
}
