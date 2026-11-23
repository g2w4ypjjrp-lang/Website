import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { getThemeSettings, THEMES, type ThemeId } from "@/server/settings";
import { saveSocialLinksAction, setThemeAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";
import { Badge } from "@/components/ui/primitives";
import { LogoMark } from "@/components/logo";
import { IconCheck, IconSearch, IconShield } from "@/components/icons";

export const metadata = { title: "Tema ve görünüm" };

const TRAITS: Record<ThemeId, string[]> = {
  premium: ["Ortalanmış güçlü başlık ve “Uzman bul” araması", "Gerçek hizmetlerden ürün arayüzü önizlemesi", "Kategori çizimleri, güven sistemi kartları", "Koyu alt bilgi, yumuşak gölgeli kartlar"],
  light: ["Sade iki sütunlu giriş, ölçülü başlık boyutları", "İkonlu 8 kategori kartı, öne çıkan uzmanlar", "4 adımlı “Nasıl çalışır?”, “İşini güvenle yaptır.”", "Açık kurumsal alt bilgi, ince çerçeveler"],
};

export default async function ThemePage() {
  await requireAdmin();
  const { theme, social } = await getThemeSettings();
  return (
    <>
      <AHead title="Tema ve görünüm" sub={<>Sitenin tüm sayfalarında kullanılan tasarım teması · <Link href="/" target="_blank" className="underline">siteyi aç</Link></>} />
      <div className="grid gap-6 xl:grid-cols-2">
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <section key={t.id} className={`overflow-hidden rounded-xl border bg-surface ${active ? "border-ink shadow-lift" : "border-line"}`}>
              <ThemePreview id={t.id} />
              <div className="border-t border-line p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[18px] font-semibold">{t.id === "premium" ? "Tema 1" : "Tema 2"} · {t.name}</h2>
                  {active ? <Badge tone="ok" dot>Etkin</Badge> : <Badge>Kullanılmıyor</Badge>}
                </div>
                <p className="mt-1.5 text-[14px] text-muted">{t.summary}</p>
                <ul className="mt-4 grid gap-1.5 text-[13.5px] text-ink-2 sm:grid-cols-2">
                  {TRAITS[t.id].map((x) => <li key={x} className="flex gap-2"><IconCheck size={14} className="mt-0.5 shrink-0 text-trust" />{x}</li>)}
                </ul>
                {!active && (
                  <form action={setThemeAction} className="mt-5">
                    <input type="hidden" name="theme" value={t.id} />
                    <button className="h-10 rounded-lg bg-ink px-4 text-[14px] font-medium text-white">Bu temayı etkinleştir</button>
                  </form>
                )}
                {active && <p className="mt-5 text-[13px] text-muted">Değişiklik kaydedildiğinde tüm sayfalar yeni temayla yeniden üretilir.</p>}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-10 max-w-2xl rounded-xl border border-line bg-surface p-6">
        <h2 className="text-[17px] font-semibold">Sosyal medya bağlantıları</h2>
        <p className="mt-1.5 text-[13.5px] text-muted">Alt bilgide yalnızca adresi girilen hesaplar gösterilir. Boş bırakılan ağ görünmez.</p>
        <AdminForm action={saveSocialLinksAction} submit="Bağlantıları kaydet" className="mt-5 space-y-3">
          {([["instagram", "Instagram", "https://www.instagram.com/hesabiniz"], ["linkedin", "LinkedIn", "https://www.linkedin.com/company/sirketiniz"], ["x", "X (Twitter)", "https://x.com/hesabiniz"], ["youtube", "YouTube", "https://www.youtube.com/@kanaliniz"], ["facebook", "Facebook", "https://www.facebook.com/sayfaniz"]] as const).map(([k, label, ph]) => (
            <F key={k} label={label}><input name={k} type="url" defaultValue={social[k] ?? ""} placeholder={ph} className="field !py-2" /></F>
          ))}
        </AdminForm>
      </section>
    </>
  );
}

/** Temanın kendi tasarım değişkenleriyle çizilen küçük canlı önizleme (data-theme kapsamı). */
function ThemePreview({ id }: { id: ThemeId }) {
  const premium = id === "premium";
  return (
    <div data-theme={id} className="pointer-events-none select-none bg-paper text-ink" aria-hidden>
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11px]">
        <LogoMark size={16} /><span className="font-semibold">eksen</span>
        <span className="text-ink-2">Hizmetler</span><span className="text-ink-2">Uzmanlar</span>
        <span className="ml-auto rounded-full bg-paper-2 px-3 py-1 text-muted">Hizmet veya uzman ara</span>
        <span className="rounded-md bg-ink px-2 py-1 font-medium text-white">Ücretsiz kayıt</span>
      </div>
      <div className={`px-5 pb-5 pt-6 ${premium ? "bg-surface text-center" : "bg-paper"}`}>
        <p className={`font-semibold leading-tight tracking-[-0.03em] ${premium ? "text-[24px]" : "text-[19px]"}`}>{premium ? "İşin için doğru uzmanı bul." : "Dijital işlerin için doğru uzmanı bul."}</p>
        <div className={`mt-3 flex items-center gap-2 rounded-lg border border-line bg-surface p-1.5 pl-3 text-[11px] text-muted shadow-xs ${premium ? "mx-auto max-w-[320px]" : "max-w-[300px]"}`}>
          <IconSearch size={12} /> Ne yaptırmak istiyorsun?
          <span className="ml-auto rounded-md bg-accent px-2.5 py-1 font-semibold text-white">{premium ? "Uzman bul" : "Ara"}</span>
        </div>
        <div className={`mt-2.5 flex flex-wrap gap-1 ${premium ? "justify-center" : ""}`}>
          {(premium ? ["Web sitesi", "Mobil uygulama", "SEO"] : ["Web sitesi yaptır", "Logo tasarla", "SEO hizmeti al"]).map((c) => <span key={c} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] text-ink-2">{c}</span>)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-5 pb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-1.5">
            <div className={`h-12 rounded-lg ${["bg-[#e7ebe4]", "bg-[#f3e9e2]", "bg-[#e5eaf3]"][i]}`} />
            <div className="flex items-center gap-1 px-1 pt-1.5 text-[9.5px] font-medium"><span className="h-3 w-3 rounded-full bg-trust" />Uzman <IconShield size={9} className="text-trust" /></div>
            <div className="mx-1 mt-1 h-1.5 w-4/5 rounded bg-ink/80" />
            <div className="mx-1 mt-1 h-1.5 w-3/5 rounded bg-ink/30" />
            <div className="mt-1.5 flex justify-end px-1 pb-0.5 text-[10px] font-semibold">₺4.500</div>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-between px-5 py-3 text-[10px] ${premium ? "bg-ink text-white/60" : "border-t border-line bg-paper-2 text-muted"}`}>
        <span className="flex items-center gap-1.5"><LogoMark size={12} className={premium ? "text-white" : "text-ink"} /> Kurumsal alt bilgi</span>
        <span>Hakkımızda · Yardım · İletişim · KVKK</span>
      </div>
    </div>
  );
}
