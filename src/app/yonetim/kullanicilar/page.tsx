import Link from "next/link";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { providerProfiles, users } from "@/db/schema";
import { adminUserAction, adminRoleAction, adminProviderSeoAction } from "@/app/actions/admin";
import { AHead, Table, Tabs } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Kullanıcılar" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ rol?: string; q?: string; durum?: string }> }) {
  const sp = await searchParams;
  const where: (SQL | undefined)[] = [];
  if (sp.rol === "customer" || sp.rol === "provider" || sp.rol === "admin") where.push(eq(users.role, sp.rol));
  if (sp.rol === "agency") where.push(sql`${users.accountType} <> 'individual' and ${users.role} = 'provider'`);
  if (sp.durum === "dogrulama") where.push(sql`${providerProfiles.verifiedAt} is null and ${users.role} = 'provider'`);
  if (sp.durum === "askida") where.push(eq(users.status, "suspended"));
  if (sp.q) where.push(sql`(search_norm(${users.name}) ilike '%' || search_norm(${sp.q}) || '%' or ${users.email} ilike '%' || ${sp.q} || '%')`);
  const rows = await db.select({ u: users, p: providerProfiles }).from(users).leftJoin(providerProfiles, eq(providerProfiles.userId, users.id)).where(and(...where)).orderBy(desc(users.createdAt)).limit(200);
  const base = (q: Record<string, string>) => "/yonetim/kullanicilar?" + new URLSearchParams(q).toString();
  return (
    <>
      <AHead title="Kullanıcılar" sub="Müşteriler, uzmanlar, ajanslar; doğrulama, askıya alma, özel komisyon" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Tabs current={base(sp.rol ? { rol: sp.rol } : sp.durum ? { durum: sp.durum } : {})} items={[[base({}), "Tümü"], [base({ rol: "customer" }), "Müşteriler"], [base({ rol: "provider" }), "Uzmanlar"], [base({ rol: "agency" }), "Ajans / şirket"], [base({ durum: "dogrulama" }), "Doğrulama bekleyen"], [base({ durum: "askida" }), "Askıda"], [base({ rol: "admin" }), "Yöneticiler"]]} />
        <form className="flex gap-2"><input name="q" defaultValue={sp.q} placeholder="Ad veya e-posta" className="field !w-56 !py-1.5 text-[13.5px]" /><button className="rounded bg-ink px-3 text-[13px] text-white">Ara</button></form>
      </div>
      <Table head={["Kullanıcı", "Rol", "Durum", "Kayıt", "Komisyon", "İşlemler"]}>
        {rows.map(({ u, p }) => (
          <tr key={u.id} className="align-top">
            <td className="px-3 py-2.5"><p className="font-medium">{u.name}</p><p className="text-[12px] text-muted">{u.email}</p>{p && <Link href={`/uzman/${p.slug}`} className="text-[12px] underline">/uzman/{p.slug}</Link>}</td>
            <td className="px-3 py-2.5">{u.role === "provider" ? (u.accountType === "individual" ? "Uzman" : u.accountType === "agency" ? "Ajans" : "Şirket") : u.role === "admin" ? "Yönetici" : "Müşteri"}{p && <p className="text-[12px] text-muted">{p.level}</p>}</td>
            <td className="px-3 py-2.5 space-x-1">
              <Badge tone={u.status === "active" ? "ok" : u.status === "suspended" ? "bad" : "neutral"}>{u.status === "active" ? "Aktif" : u.status === "suspended" ? "Askıda" : "Silinmiş"}</Badge>
              {p?.verifiedAt && <Badge tone="info">Doğrulanmış</Badge>}
              {!u.emailVerifiedAt && <Badge tone="warn">E-posta doğrulanmadı</Badge>}
            </td>
            <td className="px-3 py-2.5 text-muted">{formatDate(u.createdAt)}</td>
            <td className="px-3 py-2.5">
              {p ? (
                <form action={adminUserAction} className="flex items-center gap-1"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value="commission" /><input name="pct" defaultValue={p.customCommissionBps != null ? p.customCommissionBps / 100 : ""} placeholder="genel" className="field !w-16 !px-2 !py-1 text-[12.5px]" /><span className="text-muted">%</span><button className="text-[12px] underline">Kaydet</button></form>
              ) : "—"}
            </td>
            <td className="px-3 py-2.5">
              {u.role !== "admin" && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px]">
                  {p && <Op id={u.id} op={p.verifiedAt ? "unverify" : "verify"} label={p.verifiedAt ? "Doğrulamayı kaldır" : "Doğrula"} />}
                  {p && (
                    <form action={adminUserAction} className="flex items-center gap-1"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value="level" /><select name="level" defaultValue={p.level} className="rounded border border-line bg-surface px-1 text-[12px]"><option value="new">Yeni</option><option value="rising">Yükselen</option><option value="pro">Pro</option><option value="top">Üst düzey</option></select><button className="underline">Seviye</button></form>
                  )}
                  {p && (
                    <form action={adminUserAction} className="flex items-center gap-1"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value="submerchant" /><input name="key" defaultValue={p.subMerchantKey ?? ""} placeholder="alt üye işyeri anahtarı" className="field !w-36 !px-2 !py-0.5 text-[12px]" /><button className="underline">Kaydet</button></form>
                  )}
                  {u.status === "active" ? <Op id={u.id} op="suspend" label="Askıya al" danger /> : u.status === "suspended" ? <Op id={u.id} op="activate" label="Aktifleştir" /> : null}
                  {u.status !== "deleted" && <Op id={u.id} op="delete" label="Sil (anonimleştir)" danger />}
                  <form action={adminRoleAction} className="flex items-center gap-1"><input type="hidden" name="id" value={u.id} /><select name="role" defaultValue={u.role} className="rounded border border-line bg-surface px-1 text-[12px]"><option value="customer">Müşteri</option><option value="provider">Uzman</option></select><button className="underline">Rolü değiştir</button></form>
                  {p && (
                    <details className="w-full">
                      <summary className="cursor-pointer underline">Profil SEO</summary>
                      <form action={adminProviderSeoAction} className="mt-2 grid gap-1.5">
                        <input type="hidden" name="id" value={u.id} />
                        <input name="slug" defaultValue={p.slug} className="field !py-1 font-mono text-[12px]" aria-label="Adres" />
                        <input name="seoTitle" defaultValue={p.seoTitle ?? ""} placeholder="SEO başlığı" maxLength={70} className="field !py-1 text-[12px]" />
                        <input name="seoDescription" defaultValue={p.seoDescription ?? ""} placeholder="Meta açıklama" maxLength={160} className="field !py-1 text-[12px]" />
                        <label className="flex items-center gap-1.5"><input type="checkbox" name="noindex" defaultChecked={p.noindex} /> noindex</label>
                        <button className="justify-self-start rounded bg-ink px-2 py-0.5 text-white">Kaydet</button>
                      </form>
                    </details>
                  )}
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

function Op({ id, op, label, danger }: { id: string; op: string; label: string; danger?: boolean }) {
  return <form action={adminUserAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} /><button className={danger ? "text-bad underline" : "underline"}>{label}</button></form>;
}
