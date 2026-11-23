import type { Metadata } from "next";
import { getCurrentUser } from "@/server/auth";
import { getCategoryTree } from "@/server/queries";
import { ProjectForm } from "@/components/forms/project-form";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Proje oluştur, teklif al", description: "İhtiyacınızı anlatın, dijital hizmet uzmanlarından ücretsiz teklif alın. Teklifleri fiyat, süre ve portföye göre karşılaştırın.", path: "/proje-olustur" });

export default async function CreateProjectPage({ searchParams }: { searchParams: Promise<{ kategori?: string; il?: string }> }) {
  const { kategori, il } = await searchParams;
  const [user, tree] = await Promise.all([getCurrentUser(), getCategoryTree()]);
  const pre = tree.flatMap((c) => [c, ...c.children]).find((c) => c.slug === kategori);
  // Giriş yapmamış ziyaretçinin seçtiği kategori ve il, kayıt ya da giriş sonrasında korunur
  const q = new URLSearchParams();
  if (pre) q.set("kategori", pre.slug);
  if (il && /^[a-z0-9-]{2,40}$/.test(il)) q.set("il", il);
  const qs = q.toString();
  const next = encodeURIComponent(`/proje-olustur${qs ? `?${qs}` : ""}`);
  return (
    <div className="container-x pt-10">
      <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,640px)]">
        <div className="lg:pt-2">
          <p className="eyebrow mb-3">Ücretsiz · 3 dakika</p>
          <h1 className="text-[34px] font-semibold leading-tight sm:text-[44px]">Projeni anlat, uzmanlar teklif versin.</h1>
          <ol className="mt-8 space-y-5 text-[15px]">
            {[
              ["İşi tarif et", "Ne istediğini, neden istediğini ve beğendiğin örnekleri yaz."],
              ["Teklifleri karşılaştır", "Fiyat, süre, portföy ve değerlendirmeleri yan yana gör."],
              ["Seç ve güvenle öde", "Ödeme, teslimatı onaylayana kadar havuz hesabında bekler."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="num flex h-7 w-7 shrink-0 items-center justify-center border border-ink text-[12px]">{i + 1}</span>
                <span><span className="block font-medium">{t}</span><span className="text-muted">{d}</span></span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-8">
          {!user ? (
            <div>
              <p className="text-[18px] font-semibold">Önce hesabını oluştur</p>
              <p className="mt-2 text-muted">Teklifleri takip edebilmen ve uzmanlarla mesajlaşabilmen için ücretsiz bir hesap gerekiyor.</p>
              <div className="mt-6 flex gap-3">
                <ButtonLink href={`/kayit?sonra=${next}`}>Kaydol</ButtonLink>
                <ButtonLink href={`/giris?sonra=${next}`} variant="outline">Giriş yap</ButtonLink>
              </div>
            </div>
          ) : user.role !== "customer" ? (
            <Notice tone="info">Proje oluşturma müşteri hesaplarına açıktır. Uzman hesabınızla açık projelere teklif verebilirsiniz.</Notice>
          ) : (
            <ProjectForm categories={tree.map((c) => ({ id: c.id, name: c.name, children: c.children.map((s) => ({ id: s.id, name: s.name })) }))} defaultCategoryId={pre?.id} defaultCity={il} />
          )}
        </div>
      </div>
    </div>
  );
}
