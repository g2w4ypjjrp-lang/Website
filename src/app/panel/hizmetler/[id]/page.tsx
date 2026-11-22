import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { servicePackages, services } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { getCategoryTree } from "@/server/queries";
import { resolveCommissionBps } from "@/server/commission";
import { PageHead } from "@/components/panel/page-head";
import { ServiceEditor } from "@/components/panel/service-editor";
import { Notice } from "@/components/ui/primitives";

export const metadata = { title: "Hizmeti düzenle" };

export default async function EditService({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ kaydedildi?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const user = await requireRole("provider");
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const s = await db.query.services.findFirst({ where: and(eq(services.id, id), eq(services.providerId, user.id)) });
  if (!s) notFound();
  const [tree, pk, c] = await Promise.all([getCategoryTree(), db.select().from(servicePackages).where(eq(servicePackages.serviceId, s.id)), resolveCommissionBps(user.id, s.categoryId)]);
  const packages = Object.fromEntries(pk.map((p) => [p.tier, p]));
  return (
    <>
      {sp.kaydedildi && <Notice tone="ok" className="mb-4">Taslak oluşturuldu.</Notice>}
      <PageHead title="Hizmeti düzenle" sub={s.title} />
      <ServiceEditor commissionPct={c.bps / 100} categories={tree.map((x) => ({ id: x.id, name: x.name, children: x.children.map((y) => ({ id: y.id, name: y.name })) }))} initial={{ ...s, packages }} />
    </>
  );
}
