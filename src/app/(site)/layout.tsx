import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { TabBar } from "@/components/site/tab-bar";
import { Beacon } from "@/components/site/beacon";
import { getCurrentUser } from "@/server/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <>
      <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white">İçeriğe geç</a>
      <SiteHeader />
      <main id="icerik">{children}</main>
      <SiteFooter />
      <TabBar loggedIn={!!user} />
      <Beacon />
    </>
  );
}
