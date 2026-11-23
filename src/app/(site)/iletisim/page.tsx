import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/forms/contact-form";
import { IconBriefcase, IconChat, IconHelp } from "@/components/icons";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({ title: "İletişim", description: "Eksen destek ekibine mesaj gönderin: sipariş, ödeme, uzman hesabı ve kurumsal konular.", path: "/iletisim" });

export default function ContactPage() {
  return (
    <div className="container-x pt-6">
      <Breadcrumbs items={[{ name: "İletişim", path: "/iletisim" }]} />
      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="eyebrow mb-3">İletişim</p>
          <h1 className="text-[length:var(--h2-size)] font-semibold">Size nasıl yardımcı olabiliriz?</h1>
          <p className="mt-4 max-w-[52ch] text-[16px] text-ink-2">Mesajınız destek ekibine iletilir ve size e-posta ile dönüş yapılır. Aşağıdaki yollar bazı konularda daha hızlıdır.</p>
          <ul className="mt-8 space-y-3">
            {[
              [IconChat, "Siparişiniz hakkında", "Uzmanla sipariş sayfasındaki mesajlaşmadan yazışın; itiraz ve iade talebini de oradan açabilirsiniz.", "/panel/siparisler", "Siparişlerim"],
              [IconHelp, "Sık sorulan sorular", "Ödeme, teslimat, revizyon ve hakediş ile ilgili yanıtlar yardım merkezinde.", "/yardim", "Yardım merkezi"],
              [IconBriefcase, "Şirketler için", "Birden fazla dijital işi tek muhatapla yürütmek için kurumsal üyelik başvurusu yapın.", "/kurumsal", "Kurumsal üyelik"],
            ].map(([Icon, t, x, href, cta]) => {
              const I = Icon as typeof IconChat;
              return (
                <li key={t as string} className="card flex gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-ink"><I size={18} /></span>
                  <div>
                    <p className="text-[15.5px] font-semibold">{t as string}</p>
                    <p className="mt-1 text-[14px] text-muted">{x as string}</p>
                    <Link href={href as string} className="mt-2 inline-block text-[14px] font-medium underline underline-offset-4 hover:text-accent-strong">{cta as string}</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start"><ContactForm /></div>
      </div>
    </div>
  );
}
