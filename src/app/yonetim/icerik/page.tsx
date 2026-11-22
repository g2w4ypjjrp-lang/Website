import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { banners, staticPages } from "@/db/schema";
import { bannerAction } from "@/app/actions/admin";
import { AHead, Table } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Sayfalar ve bannerlar" };

export default async function AdminContent() {
  const [pages, bs] = await Promise.all([db.select().from(staticPages).orderBy(asc(staticPages.title)), db.select().from(banners).orderBy(desc(banners.createdAt))]);
  return (
    <>
      <AHead title="Sayfalar ve bannerlar" sub="Hakkımızda, yasal metinler, SSS ve kampanya alanları" action={<Link href="/yonetim/icerik/yeni" className="rounded bg-ink px-3 py-1.5 text-[13px] text-white">Yeni sayfa</Link>} />
      <h2 className="mb-3 text-[16px] font-semibold">Sabit sayfalar</h2>
      <Table head={["Sayfa", "Adres", "Güncelleme", ""]}>
        {pages.map((p) => (
          <tr key={p.id}><td className="px-3 py-2.5 font-medium"><Link href={`/yonetim/icerik/${p.id}`} className="hover:underline">{p.title}</Link>{p.content.includes("Taslak metin") && <Badge tone="warn" className="ml-2">Hukuki onay bekliyor</Badge>}</td><td className="px-3 py-2.5 font-mono text-[12.5px]">/sayfa/{p.slug}</td><td className="px-3 py-2.5 text-muted">{formatDate(p.updatedAt)}</td><td className="px-3 py-2.5 text-right"><Link href={`/sayfa/${p.slug}`} target="_blank" className="text-[12.5px] underline">Görüntüle ↗</Link></td></tr>
        ))}
      </Table>
      <h2 className="mb-3 mt-10 text-[16px] font-semibold">Banner ve kampanya alanları</h2>
      <form action={bannerAction} className="mb-4 grid gap-2 rounded-lg border border-line bg-surface p-4 text-[13px] sm:grid-cols-6">
        <select name="placement" className="field !py-1.5 text-[13px]"><option value="home_top">Ana sayfa üst</option><option value="category_top">Kategori üst</option><option value="search_inline">Arama içi</option></select>
        <input name="title" placeholder="Başlık" required className="field !py-1.5 text-[13px] sm:col-span-2" />
        <input name="body" placeholder="Açıklama" className="field !py-1.5 text-[13px] sm:col-span-3" />
        <input name="href" placeholder="/hedef-adres" className="field !py-1.5 text-[13px]" />
        <input name="ctaLabel" placeholder="Buton yazısı" className="field !py-1.5 text-[13px]" />
        <input name="endsAt" type="date" className="field !py-1.5 text-[13px]" />
        <label className="flex items-center gap-2"><input type="checkbox" name="isSponsored" /> Sponsorlu</label>
        <button className="rounded bg-ink px-3 py-1.5 text-white">Ekle</button>
      </form>
      <Table head={["Başlık", "Alan", "Durum", "Bitiş", ""]}>
        {bs.map((b) => (
          <tr key={b.id}>
            <td className="px-3 py-2.5"><span className="font-medium">{b.title}</span>{b.isSponsored && <Badge tone="info" className="ml-2">Sponsorlu</Badge>}<span className="block text-[12px] text-muted">{b.body}</span></td>
            <td className="px-3 py-2.5">{b.placement}</td>
            <td className="px-3 py-2.5"><Badge tone={b.isActive ? "ok" : "neutral"}>{b.isActive ? "Aktif" : "Pasif"}</Badge></td>
            <td className="px-3 py-2.5 text-muted">{b.endsAt ? formatDate(b.endsAt) : "—"}</td>
            <td className="px-3 py-2.5 text-right"><div className="flex justify-end gap-3 text-[12.5px]"><form action={bannerAction}><input type="hidden" name="op" value="toggle" /><input type="hidden" name="id" value={b.id} /><button className="underline">{b.isActive ? "Durdur" : "Aktifleştir"}</button></form><form action={bannerAction}><input type="hidden" name="op" value="delete" /><input type="hidden" name="id" value={b.id} /><button className="text-bad underline">Sil</button></form></div></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
