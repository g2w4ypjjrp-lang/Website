import QRCode from "qrcode";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { admin2faRequired, currentSessionId, requireAdmin } from "@/server/auth";
import { openSecret, otpauthUri } from "@/server/totp";
import { beginTotpSetupAction, confirmTotpAction, disableTotpAction, revokeOtherSessionsAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";
import { Badge, Notice } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Güvenlik" };

/** Oturum listesinde okunur cihaz adı: "Chrome · Windows" */
function deviceLabel(ua: string | null) {
  if (!ua) return "Bilinmiyor";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /HeadlessChrome/.test(ua) ? "Otomasyon (headless)" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Tarayıcı";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} · ${os}` : browser;
}

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ zorunlu?: string }> }) {
  const admin = await requireAdmin({ allowWithout2fa: true });
  const sp = await searchParams;
  const [u, mySessions, current] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, admin.id) }),
    db.select().from(sessions).where(eq(sessions.userId, admin.id)).orderBy(desc(sessions.createdAt)).limit(20),
    currentSessionId(),
  ]);
  const enabled = !!u?.totpEnabledAt;
  const pendingSecret = !enabled && u?.totpSecret ? await openSecret(u.totpSecret).catch(() => null) : null;
  const qr = pendingSecret ? await QRCode.toString(otpauthUri(pendingSecret, admin.email), { type: "svg", margin: 1, color: { dark: "#14161a", light: "#ffffff" } }) : null;
  const keyMissing = !process.env.TOTP_ENCRYPTION_KEY;

  return (
    <>
      <AHead title="Güvenlik" sub="Yönetici hesabı için iki adımlı doğrulama ve oturum yönetimi" />
      {sp.zorunlu && <Notice tone="warn" className="mb-6">Yönetim işlemleri için iki adımlı doğrulamanın etkinleştirilmesi zorunlu. Kurulum tamamlanana kadar diğer yönetim sayfaları açılmaz.</Notice>}
      {keyMissing && <Notice tone="warn" className="mb-6">TOTP_ENCRYPTION_KEY tanımlı değil: doğrulama sırrı veritabanında şifrelenmeden saklanır. Canlıda en az 32 karakterlik rastgele bir anahtarı gizli değişken olarak tanımlayın.</Notice>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-line bg-surface p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold">İki adımlı doğrulama</h2>
            {enabled ? <Badge tone="ok" dot>Etkin</Badge> : <Badge tone="warn" dot>Kapalı</Badge>}
          </div>
          <p className="mt-2 text-[14px] text-ink-2">Şifreniz ele geçirilse bile yönetim paneline girilemesin diye, girişte telefonunuzdaki doğrulama uygulamasının ürettiği 6 haneli kod istenir (Google Authenticator, Microsoft Authenticator, 1Password vb.).</p>

          {enabled ? (
            <div className="mt-6 border-t border-line-2 pt-5">
              <p className="text-[13.5px] text-muted">Etkinleştirildi: {formatDateTime(u!.totpEnabledAt!)}</p>
              <AdminForm action={disableTotpAction} submit="İki adımlı doğrulamayı kapat" className="mt-4 space-y-3">
                <F label="Kapatmak için güncel kod"><input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="field !w-40 !py-2 font-mono tracking-[0.3em]" /></F>
              </AdminForm>
            </div>
          ) : pendingSecret ? (
            <div className="mt-6 grid gap-6 border-t border-line-2 pt-5 sm:grid-cols-[180px_1fr]">
              <div className="w-[180px] self-start rounded-md border border-line bg-white p-2" dangerouslySetInnerHTML={{ __html: qr! }} aria-label="Doğrulama uygulaması için QR kod" />
              <div className="min-w-0 space-y-4 text-[14px]">
                <ol className="list-decimal space-y-1.5 pl-5 text-ink-2">
                  <li>Doğrulama uygulamasında “Hesap ekle” deyip QR kodu okutun.</li>
                  <li>QR okutamıyorsanız anahtarı elle girin.</li>
                  <li>Uygulamanın ürettiği 6 haneli kodu aşağıya yazın.</li>
                </ol>
                <p className="break-all rounded-md bg-paper-2 px-3 py-2 font-mono text-[13px]">{pendingSecret.match(/.{1,4}/g)!.join(" ")}</p>
                <AdminForm action={confirmTotpAction} submit="Doğrula ve etkinleştir" className="space-y-3">
                  <F label="6 haneli kod"><input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="field !w-40 !py-2 font-mono tracking-[0.3em]" /></F>
                </AdminForm>
              </div>
            </div>
          ) : (
            <form action={beginTotpSetupAction} className="mt-6 border-t border-line-2 pt-5">
              <button className="h-10 rounded-md bg-ink px-4 text-[14.5px] font-medium text-white">Kurulumu başlat</button>
            </form>
          )}
          {!enabled && <p className="mt-5 text-[12.5px] text-muted">{admin2faRequired() ? "Bu kurulumda iki adımlı doğrulama zorunlu (ADMIN_2FA_REQUIRED=true)." : "Zorunlu kılmak için ADMIN_2FA_REQUIRED=true tanımlayın."}</p>}
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-[17px] font-semibold">Açık oturumlarınız</h2>
            {mySessions.length > 1 && (
              <form action={revokeOtherSessionsAction}><button className="text-[13px] text-bad underline">Diğer oturumları kapat</button></form>
            )}
          </div>
          <ul className="divide-y divide-line-2 rounded-lg border border-line bg-surface text-[13.5px]">
            {mySessions.slice(0, 10).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium" title={s.userAgent ?? ""}>{deviceLabel(s.userAgent)}</p>
                  <p className="font-mono text-[11.5px] text-muted">{s.ip}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[12.5px] text-muted">
                  {s.id === current && <Badge tone="ok">Bu cihaz</Badge>}
                  <span className="whitespace-nowrap">{formatDateTime(s.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
          {mySessions.length > 10 && <p className="mt-2 text-[12.5px] text-muted">ve {mySessions.length - 10} oturum daha. Tümünü kapatmak için “Diğer oturumları kapat”ı kullanın.</p>}
        </section>
      </div>
    </>
  );
}
