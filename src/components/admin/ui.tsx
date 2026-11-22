import Link from "next/link";
import { cn } from "@/lib/utils";

export function AHead({ title, sub, action }: { title: string; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div><h1 className="text-[24px] font-semibold">{title}</h1>{sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Table({ head, children, className }: { head: (string | { label: string; right?: boolean })[]; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-line bg-surface", className)}>
      <table className="w-full min-w-[720px] text-[13.5px]">
        <thead className="border-b border-line bg-paper/50 text-left text-[12px] text-muted">
          <tr>{head.map((h, i) => { const x = typeof h === "string" ? { label: h } : h; return <th key={i} className={cn("px-3 py-2 font-medium", x.right && "text-right")}>{x.label}</th>; })}</tr>
        </thead>
        <tbody className="divide-y divide-line-2">{children}</tbody>
      </table>
    </div>
  );
}

export function Tabs({ items, current }: { items: [string, string, number?][]; current: string }) {
  return (
    <nav className="mb-5 flex gap-1 overflow-x-auto text-[13.5px]">
      {items.map(([href, label, n]) => (
        <Link key={href} href={href} className={cn("whitespace-nowrap rounded px-3 py-1.5", current === href ? "bg-ink text-white" : "text-ink-2 hover:bg-paper-2")}>
          {label}{n != null && <span className="num ml-1.5 opacity-60">{n}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function KPI({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn("border-l-2 pl-4", accent ? "border-accent" : "border-line")}>
      <p className="text-[12.5px] text-muted">{label}</p>
      <p className="num mt-1 text-[24px] leading-none">{value}</p>
      {sub && <p className="mt-1.5 text-[12px] text-muted">{sub}</p>}
    </div>
  );
}
