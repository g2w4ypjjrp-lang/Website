import { getCategoryTree } from "@/server/queries";
import { json } from "@/server/api";

export async function GET() {
  const tree = await getCategoryTree();
  return json(
    tree.map((c) => ({ slug: c.slug, name: c.name, description: c.shortDescription, children: c.children.map((s) => ({ slug: s.slug, name: s.name })) })),
    200,
    "public, max-age=300",
  );
}
