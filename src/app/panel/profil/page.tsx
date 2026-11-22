import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { providerProfiles } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { requestVerificationAction } from "@/app/actions/panel";
import { PageHead } from "@/components/panel/page-head";
import { ProfileForm } from "@/components/panel/forms";
import { Notice, VerifiedMark } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Uzman profili" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ hosgeldin?: string }> }) {
  const user = await requireRole("provider");
  const sp = await searchParams;
  const p = await db.query.providerProfiles.findFirst({ where: eq(providerProfiles.userId, user.id) });
  if (!p) return <Notice tone="bad">Profil bulunamadı.</Notice>;
  return (
    <>
      {sp.hosgeldin && <Notice tone="ok" className="mb-6">Hesabın oluşturuldu. Müşterilerin seni tanıması için önce profilini tamamla, sonra ilk hizmetini oluştur.</Notice>}
      <PageHead title="Uzman profili" sub={<>Herkese açık adresin: <Link href={`/uzman/${p.slug}`} className="num underline underline-offset-2">/uzman/{p.slug}</Link></>} />
      <div className="grid gap-10 xl:grid-cols-[1fr_300px]">
        <ProfileForm p={p} />
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="font-semibold">Hesap doğrulama</p>
            {p.verifiedAt ? (
              <div className="mt-2"><VerifiedMark label="Hesabın doğrulandı" /></div>
            ) : (
              <>
                <p className="mt-1 text-[13.5px] text-muted">Kimlik ve vergi levhası kontrolünden sonra profilinde doğrulanmış rozeti görünür ve aramalarda öne çıkarsın.</p>
                <form action={requestVerificationAction} className="mt-3"><Button size="sm" variant="outline">Doğrulama talep et</Button></form>
              </>
            )}
          </div>
          <div className="rounded-lg border border-line bg-surface p-5 text-[13.5px] text-ink-2">
            <p className="font-semibold text-ink">Ödeme altyapısı</p>
            <p className="mt-1">Split ödeme için ödeme kuruluşunda alt üye işyeri kaydın açılır. Kayıt, doğrulama tamamlandığında ekibimiz tarafından yapılır.</p>
            <p className="mt-2">Durum: {p.subMerchantKey ? <span className="text-trust">Aktif</span> : <span className="text-warn">Beklemede</span>}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
