import { broadcastAction } from "@/app/actions/admin";
import { AHead } from "@/components/admin/ui";
import { AdminForm, F } from "@/components/admin/admin-form";

export const metadata = { title: "Sistem duyurusu" };

export default function Broadcast() {
  return (
    <>
      <AHead title="Sistem duyurusu" sub="Kullanıcıların bildirim kutusuna (isteğe bağlı e-postayla) duyuru gönderir. Bakım, kural değişikliği, yeni özellik gibi durumlar için." />
      <AdminForm action={broadcastAction} submit="Duyuruyu gönder" className="max-w-2xl space-y-4">
        <F label="Kime"><select name="audience" className="field !py-2"><option value="all">Tüm kullanıcılar</option><option value="customer">Yalnızca müşteriler</option><option value="provider">Yalnızca uzmanlar</option></select></F>
        <F label="Başlık"><input name="title" className="field !py-2" maxLength={120} /></F>
        <F label="Metin"><textarea name="body" rows={4} className="field" maxLength={1000} /></F>
        <F label="Bağlantı" hint="İsteğe bağlı, ör. /sayfa/kullanim-kosullari"><input name="link" className="field !py-2" /></F>
        <label className="flex items-center gap-2 text-[13.5px]"><input type="checkbox" name="email" /> E-posta olarak da gönder</label>
      </AdminForm>
    </>
  );
}
