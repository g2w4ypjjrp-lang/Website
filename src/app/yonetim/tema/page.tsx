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
  neo: ["Koyu lacivert zemin, mor vurgu, ışıltılı giriş", "Dizüstü ve telefon görünümünde canlı ürün arayüzü", "Sağda “Nasıl çalışır?” kartı, gerçek verili istatistik şeridi", "İkonlu kategori sekmeleriyle filtrelenen popüler hizmetler"],
  sunrise: ["Beyaz zemin, canlı turuncu vurgu, hap düğmeler", "Cihaz görünümlü giriş ve “Güvenli ödeme” kartı", "5 maddelik özellik şeridi, uzman sayılı kategori kartları", "Sekmelerle filtrelenen öne çıkan hizmetler"],
  ultra: ["Lacivert üst bilgi şeridi, kurumsal mavi vurgu", "Girişte çalışan “Teklif alın” formu (kategori ve il)", "Alt hizmetli kategori dizini, 4 adımlı süreç", "Kurumsal bölüm ve doğrulanmış uzmanlardan kısa liste"],
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
                  <h2 className="text-[18px] font-semibold">Tema {t.no} · {t.name}</h2>
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
  const centered = id === "premium";
  const device = id === "neo" || id === "sunrise";
  const form = id === "ultra";
  const darkFooter = id === "premium" || id === "neo" || id === "ultra";
  const title: Record<ThemeId, React.ReactNode> = {
    premium: "İşin için doğru uzmanı bul.",
    light: "Dijital işlerin için doğru uzmanı bul.",
    neo: <>Dijital projenizi hayata geçirecek <span className="text-accent-bright">doğru uzmanı bulun.</span></>,
    sunrise: <>Dijital projelerin için doğru uzman, <span className="text-accent">doğru çözüm.</span></>,
    ultra: <>Dijital işleriniz için doğrulanmış uzmanlar, <span className="text-accent">güvenceli süreç.</span></>,
  };
  return (
    <div data-theme={id} className="pointer-events-none select-none bg-paper text-ink" aria-hidden>
      {form && <div className="flex h-4 items-center justify-end gap-3 bg-[#0a1628] px-4 text-[8px] text-white/60"><span>Kurumsal çözümler</span><span>Yardım</span></div>}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5 text-[11px]">
        <LogoMark size={16} /><span className="font-semibold">eksen</span>
        <span className="text-ink-2">Hizmetler</span><span className="text-ink-2">Uzmanlar</span>
        <span className="ml-auto rounded-full bg-paper-2 px-3 py-1 text-muted">Hizmet veya uzman ara</span>
        <span className={`rounded-[var(--radius-btn)] px-2.5 py-1 font-medium text-white ${id === "sunrise" || id === "neo" || id === "ultra" ? "bg-accent" : "bg-ink"}`}>{id === "neo" ? "+ Proje oluştur" : id === "ultra" ? "Ücretsiz başlayın" : "Ücretsiz kayıt"}</span>
      </div>
      <div className={`grid gap-3 px-5 pb-5 pt-6 ${device || form ? "grid-cols-[1.3fr_1fr] items-center" : ""} ${centered || form ? "bg-surface" : "bg-paper"} ${centered ? "text-center" : ""}`}>
        <div>
          <p className={`font-semibold leading-tight tracking-[-0.03em] ${centered ? "text-[24px]" : "text-[18px]"}`}>{title[id]}</p>
          <div className={`mt-3 flex items-center gap-2 rounded-[var(--radius-search)] border border-line bg-surface p-1.5 pl-3 text-[11px] text-muted shadow-xs ${centered ? "mx-auto max-w-[320px]" : "max-w-[300px]"}`}>
            <IconSearch size={12} /> Ne yaptırmak istiyorsun?
            <span className="ml-auto rounded-[var(--radius-btn)] bg-accent px-2.5 py-1 font-semibold text-white">{id === "premium" ? "Uzman bul" : "Ara"}</span>
          </div>
          <div className={`mt-2.5 flex flex-wrap gap-1 ${centered ? "justify-center" : ""}`}>
            {["Web sitesi", "Logo", "SEO"].map((c) => <span key={c} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] text-ink-2">{c}</span>)}
          </div>
        </div>
        {form && (
          <div className="rounded-lg border border-line bg-surface p-2.5 shadow-lift">
            <p className="text-[9px] font-semibold text-accent">Ücretsiz teklif alın</p>
            <div className="mt-1.5 h-4 rounded border border-line bg-paper" />
            <div className="mt-1 h-4 rounded border border-line bg-paper" />
            <div className="mt-1.5 flex h-5 items-center justify-center rounded bg-accent text-[9px] font-semibold text-white">Teklif almaya başla</div>
          </div>
        )}
        {device && (
          <div className="relative h-[92px]">
            <div className="absolute inset-x-1 top-1 h-[68px] rounded-md border-[3px] border-[#2a2d3a] bg-surface shadow-lift"><div className="m-1 h-3 rounded-sm bg-accent-soft" /><div className="mx-1 h-1.5 w-3/4 rounded bg-ink/60" /></div>
            <div className="absolute -bottom-0 inset-x-0 h-2 rounded-b-md bg-[#c9ccd6]" />
            <div className="absolute -right-1 top-3 h-[76px] w-[40px] rounded-[8px] border-[3px] border-[#2a2d3a] bg-surface p-1"><div className="h-2 w-full rounded-sm bg-accent" /><div className="mt-1 h-1 w-3/4 rounded bg-ink/40" /><div className="mt-1 h-1 w-1/2 rounded bg-ink/40" /></div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 px-5 pb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-1.5">
            <div className={`h-12 rounded-lg ${["bg-[#e7ebe4]", "bg-[#f3e9e2]", "bg-[#e5eaf3]"][i]} ${id === "neo" ? "opacity-30" : ""}`} />
            <div className="flex items-center gap-1 px-1 pt-1.5 text-[9.5px] font-medium"><span className="h-3 w-3 rounded-full bg-trust" />Uzman <IconShield size={9} className="text-trust" /></div>
            <div className="mx-1 mt-1 h-1.5 w-4/5 rounded bg-ink/80" />
            <div className="mx-1 mt-1 h-1.5 w-3/5 rounded bg-ink/30" />
            <div className="mt-1.5 flex justify-end px-1 pb-0.5 text-[10px] font-semibold">₺4.500</div>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-between px-5 py-3 text-[10px] ${darkFooter ? (form ? "bg-[#0a1628] text-white/60" : "bg-[#0d0f1a] text-white/60") : "border-t border-line bg-paper-2 text-muted"}`}>
        <span className="flex items-center gap-1.5"><LogoMark size={12} className={darkFooter ? "text-white" : "text-ink"} /> Kurumsal alt bilgi</span>
        <span>Hakkımızda · Yardım · İletişim · KVKK</span>
      </div>
    </div>
  );
}
