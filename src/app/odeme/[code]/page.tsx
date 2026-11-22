import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, providerProfiles, users } from "@/db/schema";
import { requireUser } from "@/server/auth";
import { startPaymentAction } from "@/app/actions/payment";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";
import { IconShield } from "@/components/icons";
import { TIER_LABEL } from "@/lib/order-status";
import { formatTRY } from "@/lib/utils";
import { CitySelect } from "@/components/city-select";

export const metadata: Metadata = { title: "Ödeme", robots: { index: false } };

const ERR: Record<string, string> = {
  onay: "Devam etmek için sözleşmeleri onaylamanız gerekiyor.",
  fatura: "Fatura bilgilerini eksiksiz doldurun.",
  saglayici: "Ödeme sağlayıcısına şu an ulaşılamıyor. Birkaç dakika sonra tekrar deneyin.",
  reddedildi: "Ödeme tamamlanamadı. Kartınızdan çekim yapılmadı; tekrar deneyebilirsiniz.",
  limit: "Çok fazla deneme yaptınız. Lütfen biraz bekleyin.",
};

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ hata?: string }> }) {
  const [{ code }, { hata }] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/odeme/${code}`);
  const order = await db.query.orders.findFirst({ where: eq(orders.code, code) });
  if (!order || order.buyerId !== user.id) notFound();
  if (order.status !== "awaiting_payment") redirect(`/panel/siparisler/${code}`);
  const [profile, me] = await Promise.all([
    db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, order.providerId) }),
    db.query.users.findFirst({ where: eq(users.id, user.id), columns: { billing: true, name: true } }),
  ]);
  const b = me?.billing;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
      <form action={startPaymentAction} className="space-y-8">
        <input type="hidden" name="code" value={code} />
        <div>
          <h1 className="text-[30px] font-semibold">Siparişi tamamla</h1>
          <p className="mt-1 text-muted">Sipariş no <span className="num text-ink">{order.code}</span></p>
        </div>
        {hata && ERR[hata] && <Notice tone="bad">{ERR[hata]}</Notice>}
        <section>
          <h2 className="mb-4 text-[18px] font-semibold">Fatura bilgileri</h2>
          <fieldset className="mb-4 flex gap-4 text-[14.5px]">
            <label className="flex items-center gap-2"><input type="radio" name="billingKind" value="individual" defaultChecked={b?.kind !== "corporate"} className="accent-[var(--color-ink)]" /> Bireysel</label>
            <label className="flex items-center gap-2"><input type="radio" name="billingKind" value="corporate" defaultChecked={b?.kind === "corporate"} className="accent-[var(--color-ink)]" /> Kurumsal</label>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad soyad" htmlFor="fullName"><input id="fullName" name="fullName" defaultValue={b?.fullName ?? me?.name} className="field" required /></Field>
            <Field label="T.C. kimlik / vergi no" htmlFor="taxNumber" optional><input id="taxNumber" name="taxNumber" inputMode="numeric" defaultValue={b?.taxNumber} className="field" /></Field>
            <Field label="Firma unvanı" htmlFor="company" optional><input id="company" name="company" defaultValue={b?.company} className="field" /></Field>
            <Field label="Vergi dairesi" htmlFor="taxOffice" optional><input id="taxOffice" name="taxOffice" defaultValue={b?.taxOffice} className="field" /></Field>
            <Field label="Adres" htmlFor="address" className="sm:col-span-2"><input id="address" name="address" defaultValue={b?.address} className="field" required /></Field>
            <Field label="İl" htmlFor="city"><CitySelect name="city" defaultValue={b?.city} required /></Field>
          </div>
        </section>
        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-[16px] font-semibold">Ödeme yöntemi</h2>
          <p className="mt-1 text-[14px] text-ink-2">Bir sonraki adımda lisanslı ödeme kuruluşunun güvenli sayfasına yönlendirileceksiniz. Kart bilgileriniz Eksen’e iletilmez ve saklanmaz. 3D Secure ile doğrulama yapılır.</p>
        </section>
        <label className="flex items-start gap-2.5 text-[14px] text-ink-2">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]" />
          <span>
            <Link href="/sayfa/mesafeli-satis-sozlesmesi" target="_blank" className="underline underline-offset-2">Mesafeli satış sözleşmesini</Link> ve <Link href="/sayfa/iade-ve-iptal" target="_blank" className="underline underline-offset-2">iade koşullarını</Link> okudum, onaylıyorum. Hizmetin ifasına onayımla başlanacağını ve bu durumda cayma hakkının kullanılamayabileceğini biliyorum.
          </span>
        </label>
        <SubmitButton size="lg" className="w-full sm:w-auto" pendingText="Yönlendiriliyor">{formatTRY(order.totalKurus, true)} öde</SubmitButton>
      </form>
      <aside>
        <div className="sticky top-6 rounded-lg border border-line bg-surface">
          <div className="border-b border-line-2 p-5">
            <p className="eyebrow">Sipariş özeti</p>
            <p className="mt-2 font-medium">{order.title}</p>
            <p className="mt-1 text-[13.5px] text-muted">{profile?.displayName}{order.tier ? ` · ${TIER_LABEL[order.tier]} paket` : " · Özel teklif"}</p>
          </div>
          <dl className="space-y-2.5 p-5 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">Paket</dt><dd className="num">{formatTRY(order.subtotalKurus, true)}</dd></div>
            {order.selectedExtras.map((e) => <div key={e.id} className="flex justify-between"><dt className="text-muted">{e.title}</dt><dd className="num">{formatTRY(e.priceKurus, true)}</dd></div>)}
            <div className="flex justify-between"><dt className="text-muted">Teslim süresi</dt><dd>{order.deliveryDays} gün</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Revizyon hakkı</dt><dd>{order.revisionsAllowed}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-[16px] font-semibold"><dt>Toplam (KDV dahil)</dt><dd className="num">{formatTRY(order.totalKurus, true)}</dd></div>
          </dl>
          <p className="flex gap-2 border-t border-line-2 p-5 text-[13px] text-ink-2"><IconShield size={16} className="shrink-0 text-trust" /> Ödemeniz havuz hesabında tutulur ve yalnızca siz teslimatı onayladığınızda uzmana aktarılır.</p>
        </div>
      </aside>
    </div>
  );
}
