import Link from "next/link";
import type { openProjects } from "@/server/queries";
import { formatTRY, timeAgo } from "@/lib/utils";

export function ProjectList({ items }: { items: Awaited<ReturnType<typeof openProjects>>["items"] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map(({ p, categoryName }) => (
        <li key={p.id} className="group relative py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[16.5px] font-semibold">
              <Link href={`/projeler/${p.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">{p.title}</Link>
            </h3>
            {p.budgetMaxKurus != null && (
              <span className="num text-[15px]">{p.budgetMinKurus ? `${formatTRY(p.budgetMinKurus)} – ` : ""}{formatTRY(p.budgetMaxKurus)}</span>
            )}
          </div>
          <p className="mt-1.5 line-clamp-2 max-w-3xl text-[14.5px] text-ink-2">{p.description}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 text-[13px] text-muted">
            <span>{categoryName}</span>
            <span>{p.offerCount} teklif</span>
            <span>{timeAgo(p.createdAt)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
