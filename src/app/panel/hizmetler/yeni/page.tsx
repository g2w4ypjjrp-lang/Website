import { requireRole } from "@/server/auth";
import { getCategoryTree } from "@/server/queries";
import { getSettings } from "@/server/settings";
import { PageHead } from "@/components/panel/page-head";
import { ServiceEditor } from "@/components/panel/service-editor";

export const metadata = { title: "Yeni hizmet" };

export default async function NewService() {
  await requireRole("provider");
  const [tree, s] = await Promise.all([getCategoryTree(), getSettings()]);
  return (
    <>
      <PageHead title="Yeni hizmet" sub="Kaydettiğinde taslak olarak saklanır; onaya gönderdiğinde ekibimiz inceler." />
      <ServiceEditor commissionPct={s.commissionBps / 100} categories={tree.map((c) => ({ id: c.id, name: c.name, children: c.children.map((x) => ({ id: x.id, name: x.name })) }))} initial={{ title: "", categoryId: "", summary: "", description: "", tags: [], requirements: "", faqs: [], extras: [], coverId: null, gallery: [], seoTitle: null, seoDescription: null, packages: {} }} />
    </>
  );
}
