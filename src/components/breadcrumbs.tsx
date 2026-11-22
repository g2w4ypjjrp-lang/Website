import Link from "next/link";
import { JsonLd } from "./json-ld";
import { ld, type Crumb } from "@/lib/seo";

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const all = [{ name: "Ana sayfa", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Sayfa yolu" className={`text-[13px] text-muted ${className}`}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {all.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-faint">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink-2">{c.name}</span>
              ) : (
                <Link href={c.path} className="hover:text-ink">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={ld.breadcrumbs(all)} />
    </>
  );
}
